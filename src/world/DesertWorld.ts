import { Vector2D } from '../utils/Vector2D';
import { DesertTile, DesertSprite } from '../graphics/DesertSprite';
import { GAME_CONFIG } from '../config/GameConfig';

export interface WaterObstacle {
    position: Vector2D;
    radius: number;
}

export interface RockObstacle {
    position: Vector2D;
    radius: number;
}

export interface TerrainEffect {
    position: Vector2D;
    radius: number;
    type: 'textured_sand' | 'cactus';
    slowdownFactor: number; // 0.0 = full stop, 1.0 = no slowdown
}

// Pre-computed avoidance data for fast AI lookups
export interface AvoidanceCell {
    hasObstacles: boolean;
    avoidanceVector: Vector2D; // Pre-computed "away from obstacles" direction
    obstacleDistance: number; // Distance to nearest obstacle
}

export class DesertWorld {
    private desertTiles: DesertTile[] = [];
    private waterObstacles: WaterObstacle[] = [];
    private rockObstacles: RockObstacle[] = [];
    private terrainEffects: TerrainEffect[] = [];
    private desertSprite: DesertSprite | null = null;
    
    // Pre-computed avoidance grid for AI performance
    private avoidanceGrid: AvoidanceCell[][] = [];
    private gridCellSize = 32; // Size of each grid cell in pixels
    private gridWidth: number;
    private gridHeight: number;
    
    // World dimensions (from config)
    public readonly worldWidth = GAME_CONFIG.WORLD.WIDTH;
    public readonly worldHeight = GAME_CONFIG.WORLD.HEIGHT;
    
    constructor() {
        // Initialize grid dimensions
        this.gridWidth = Math.ceil(this.worldWidth / this.gridCellSize);
        this.gridHeight = Math.ceil(this.worldHeight / this.gridCellSize);
        
        this.generateDesertTerrain();
        this.generateWaterObstacles();
        
        // Pre-compute avoidance grid after all obstacles are generated
        this.precomputeAvoidanceGrid();
    }

    setDesertSprite(sprite: DesertSprite): void {
        this.desertSprite = sprite;
    }

    private generateDesertTerrain(): void {
        const tileSize = GAME_CONFIG.WORLD.TILE_SIZE; // Tile size for rendering
        
        // Create sand base layer - ensure full coverage with overlapping tiles
        for (let x = -tileSize; x < this.worldWidth + tileSize; x += tileSize) {
            for (let y = -tileSize; y < this.worldHeight + tileSize; y += tileSize) {
                this.desertTiles.push({
                    position: new Vector2D(x + tileSize/2, y + tileSize/2),
                    tileType: 'sand'
                });
            }
        }
        
        // Add clumped desert features for more natural terrain
        this.generateTexturedSandPatches();
        this.generateCactusGroves();
        this.generateRockFormations();
    }

    private generateWaterObstacles(): void {
        // Create several water oases as obstacles
        const numOases = 12;
        
        for (let i = 0; i < numOases; i++) {
            const centerX = Math.random() * (this.worldWidth - 200) + 100;
            const centerY = Math.random() * (this.worldWidth - 200) + 100;
            const oasisSize = 40 + Math.random() * 60; // Random size oases
            
            // First, create textured sand border around the water hole
            const borderWidth = 20 + Math.random() * 15; // 20-35 pixel border
            const borderRadius = (oasisSize / 2) + borderWidth;
            const borderTilesNeeded = Math.floor((Math.PI * borderRadius * borderRadius) / (16 * 16) * 0.8);
            
            for (let j = 0; j < borderTilesNeeded; j++) {
                const angle = Math.random() * Math.PI * 2;
                const radiusRatio = Math.sqrt(Math.random());
                const radius = radiusRatio * borderRadius;
                
                // Only place border tiles in the border zone (not in center water area)
                if (radius > oasisSize / 2 - 10) { // -10 for slight overlap with water
                    const jitterX = (Math.random() - 0.5) * 15;
                    const jitterY = (Math.random() - 0.5) * 15;
                    
                    const x = centerX + Math.cos(angle) * radius + jitterX;
                    const y = centerY + Math.sin(angle) * radius + jitterY;
                    
                    // Keep within world bounds
                    if (x >= 0 && x <= this.worldWidth && y >= 0 && y <= this.worldHeight) {
                        this.desertTiles.push({
                            position: new Vector2D(x, y),
                            tileType: 'detail',
                            spriteIndex: 1 // Textured sand for wet/muddy shoreline
                        });
                    }
                }
            }
            
            // Then create the water hole itself (will render on top of textured sand)
            const targetArea = Math.PI * (oasisSize / 2) * (oasisSize / 2);
            const tileArea = 16 * 16; // Each tile covers 16x16 pixels
            const tilesNeeded = Math.floor(targetArea / tileArea * 1.8); // 80% more tiles for density
            
            for (let j = 0; j < tilesNeeded; j++) {
                // Use random point within circle for more organic shape
                const angle = Math.random() * Math.PI * 2;
                const radiusRatio = Math.sqrt(Math.random()); // Uniform distribution in circle
                const radius = radiusRatio * (oasisSize / 2);
                
                // Add some random jitter for natural edges
                const jitterX = (Math.random() - 0.5) * 12;
                const jitterY = (Math.random() - 0.5) * 12;
                
                const x = centerX + Math.cos(angle) * radius + jitterX;
                const y = centerY + Math.sin(angle) * radius + jitterY;
                
                this.desertTiles.push({
                    position: new Vector2D(x, y),
                    tileType: 'water',
                    spriteIndex: 0 // Use first water sprite
                });
            }
            
            // Add to collision obstacles
            this.waterObstacles.push({
                position: new Vector2D(centerX, centerY),
                radius: oasisSize / 2
            });
        }
    }

    private generateTexturedSandPatches(): void {
        // Create natural patches of textured sand across the desert
        const numPatches = 40; // Increased from 25
        
        for (let i = 0; i < numPatches; i++) {
            const centerX = Math.random() * this.worldWidth;
            const centerY = Math.random() * this.worldHeight;
            const patchSize = 40 + Math.random() * 80; // Variable patch sizes
            const tilesInPatch = Math.floor(patchSize / 8);
            
            // Add terrain effect for this patch
            this.terrainEffects.push({
                position: new Vector2D(centerX, centerY),
                radius: patchSize / 2,
                type: 'textured_sand',
                slowdownFactor: 0.4 // 40% speed in textured sand (balanced friction)
            });
            
            for (let j = 0; j < tilesInPatch; j++) {
                // Create organic patch shape using perturbed circular distribution
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * (patchSize / 2);
                const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 20;
                const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 20;
                
                // Keep within world bounds
                if (x >= 0 && x <= this.worldWidth && y >= 0 && y <= this.worldHeight) {
                    this.desertTiles.push({
                        position: new Vector2D(x, y),
                        tileType: 'detail',
                        spriteIndex: 1 // Textured sand
                    });
                }
            }
        }
    }

    private generateCactusGroves(): void {
        // Create clusters of cacti that look like natural groves
        const numGroves = 18;
        
        for (let i = 0; i < numGroves; i++) {
            const centerX = Math.random() * this.worldWidth;
            const centerY = Math.random() * this.worldHeight;
            const groveSize = 30 + Math.random() * 50;
            const cactiInGrove = 3 + Math.floor(Math.random() * 8); // 3-10 cacti per grove
            
            // Add terrain effect for this grove (cactus spines slow you down!)
            this.terrainEffects.push({
                position: new Vector2D(centerX, centerY),
                radius: groveSize / 2,
                type: 'cactus',
                slowdownFactor: 0.3 // 30% speed in cactus groves (strong resistance from spines)
            });
            
            for (let j = 0; j < cactiInGrove; j++) {
                // Cluster cacti around center with some spread
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * (groveSize / 2);
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                // Keep within world bounds and away from edges for vehicle safety
                if (x >= 50 && x <= this.worldWidth - 50 && y >= 50 && y <= this.worldHeight - 50) {
                    this.desertTiles.push({
                        position: new Vector2D(x, y),
                        tileType: 'detail',
                        spriteIndex: 2 // Cactus
                    });
                }
            }
        }
    }

    private generateRockFormations(): void {
        // Scatter individual rocks randomly across the desert
        const numRocks = 50; // Reduced from 80
        
        for (let i = 0; i < numRocks; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            
            // Keep rocks away from edges for vehicle safety
            if (x >= 50 && x <= this.worldWidth - 50 && y >= 50 && y <= this.worldHeight - 50) {
                this.desertTiles.push({
                    position: new Vector2D(x, y),
                    tileType: 'detail',
                    spriteIndex: 3 // Rock
                });
                
                // Add rock collision obstacle
                this.rockObstacles.push({
                    position: new Vector2D(x, y),
                    radius: 16 // 16 pixel collision radius for rocks
                });
            }
        }
    }

    render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number): void {
        if (!this.desertSprite) return;
        
        // Render in layers: sand first, then details, then water
        const margin = 100; // Larger margin for smoother scrolling
        
        // Layer 1: Render all sand tiles first (base layer)
        for (const tile of this.desertTiles) {
            if (tile.tileType === 'sand' &&
                tile.position.x >= cameraX - margin &&
                tile.position.x <= cameraX + canvasWidth + margin &&
                tile.position.y >= cameraY - margin &&
                tile.position.y <= cameraY + canvasHeight + margin) {
                
                this.desertSprite.renderDesertTile(ctx, tile, 2.0);
            }
        }
        
        // Layer 2: Render detail tiles (cacti, rocks, etc.)
        for (const tile of this.desertTiles) {
            if (tile.tileType === 'detail' &&
                tile.position.x >= cameraX - margin &&
                tile.position.x <= cameraX + canvasWidth + margin &&
                tile.position.y >= cameraY - margin &&
                tile.position.y <= cameraY + canvasHeight + margin) {
                
                this.desertSprite.renderDesertTile(ctx, tile, 2.0);
            }
        }
        
        // Layer 3: Render water tiles (on top)
        for (const tile of this.desertTiles) {
            if (tile.tileType === 'water' &&
                tile.position.x >= cameraX - margin &&
                tile.position.x <= cameraX + canvasWidth + margin &&
                tile.position.y >= cameraY - margin &&
                tile.position.y <= cameraY + canvasHeight + margin) {
                
                this.desertSprite.renderDesertTile(ctx, tile, 2.0);
            }
        }
    }

    // Check collision with water obstacles
    checkWaterCollision(position: Vector2D, radius: number): WaterObstacle | null {
        const adjustedRadius = radius * GAME_CONFIG.PHYSICS.WATER_COLLISION_RADIUS_MULTIPLIER;
        for (const obstacle of this.waterObstacles) {
            const distance = position.subtract(obstacle.position).length();
            if (distance < adjustedRadius + obstacle.radius) {
                return obstacle;
            }
        }
        return null;
    }
    
    // Check collision with rock obstacles (solid collision like water)
    checkRockCollision(position: Vector2D, radius: number): RockObstacle | null {
        const adjustedRadius = radius * GAME_CONFIG.PHYSICS.ROCK_COLLISION_RADIUS_MULTIPLIER;
        for (const obstacle of this.rockObstacles) {
            const distance = position.subtract(obstacle.position).length();
            if (distance < adjustedRadius + obstacle.radius) {
                return obstacle;
            }
        }
        return null;
    }
    
    // Check for terrain effects (slowdown zones)
    getTerrainEffect(position: Vector2D): number {
        let strongestSlowdown = 1.0; // Default: no slowdown
        
        for (const effect of this.terrainEffects) {
            const distance = position.subtract(effect.position).length();
            if (distance <= effect.radius) {
                // Use the strongest (lowest) slowdown factor if multiple effects overlap
                strongestSlowdown = Math.min(strongestSlowdown, effect.slowdownFactor);
            }
        }
        
        return strongestSlowdown;
    }
    
    // Get all water obstacles (for bandit spawning)
    getWaterObstacles(): WaterObstacle[] {
        return this.waterObstacles;
    }

    // Get all rock obstacles (for AI navigation)
    getRockObstacles(): RockObstacle[] {
        return this.rockObstacles;
    }
    
    // Get all terrain effects (for AI navigation)
    getTerrainEffects(): TerrainEffect[] {
        return this.terrainEffects;
    }

    // Keep player within world bounds
    clampToWorldBounds(position: Vector2D): Vector2D {
        return new Vector2D(
            Math.max(50, Math.min(this.worldWidth - 50, position.x)),
            Math.max(50, Math.min(this.worldHeight - 50, position.y))
        );
    }
    
    /**
     * Pre-compute avoidance data for the entire world grid
     * This runs once at startup to optimize AI performance
     */
    private precomputeAvoidanceGrid(): void {
        console.log('🔧 Pre-computing avoidance grid for AI optimization...');
        
        // Initialize the grid
        this.avoidanceGrid = [];
        for (let x = 0; x < this.gridWidth; x++) {
            this.avoidanceGrid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                this.avoidanceGrid[x][y] = this.computeAvoidanceForCell(x, y);
            }
        }
        
        console.log(`✅ Avoidance grid computed: ${this.gridWidth}x${this.gridHeight} cells`);
    }
    
    /**
     * Compute avoidance data for a single grid cell
     */
    private computeAvoidanceForCell(gridX: number, gridY: number): AvoidanceCell {
        const worldX = gridX * this.gridCellSize + this.gridCellSize / 2;
        const worldY = gridY * this.gridCellSize + this.gridCellSize / 2;
        const cellCenter = new Vector2D(worldX, worldY);
        
        let nearestObstacle: Vector2D | null = null;
        let nearestDistance = Number.MAX_VALUE;
        
        // Check all water obstacles
        for (const obstacle of this.waterObstacles) {
            const distance = cellCenter.subtract(obstacle.position).length();
            const effectiveDistance = distance - obstacle.radius;
            if (effectiveDistance < nearestDistance) {
                nearestDistance = effectiveDistance;
                nearestObstacle = obstacle.position;
            }
        }
        
        // Check all rock obstacles
        for (const obstacle of this.rockObstacles) {
            const distance = cellCenter.subtract(obstacle.position).length();
            const effectiveDistance = distance - obstacle.radius;
            if (effectiveDistance < nearestDistance) {
                nearestDistance = effectiveDistance;
                nearestObstacle = obstacle.position;
            }
        }
        
        // Check terrain effects (only significant slowdown areas)
        for (const effect of this.terrainEffects) {
            if (effect.slowdownFactor < 0.8) { // Only avoid significant slowdown
                const distance = cellCenter.subtract(effect.position).length();
                const effectiveDistance = distance - effect.radius;
                if (effectiveDistance < nearestDistance) {
                    nearestDistance = effectiveDistance;
                    nearestObstacle = effect.position;
                }
            }
        }
        
        // Compute avoidance data
        const avoidanceThreshold = 100; // Avoid obstacles within 100 pixels
        const hasObstacles = nearestDistance < avoidanceThreshold;
        
        let avoidanceVector = new Vector2D(0, 0);
        if (hasObstacles && nearestObstacle) {
            // Vector pointing away from nearest obstacle
            avoidanceVector = cellCenter.subtract(nearestObstacle).normalize();
        }
        
        return {
            hasObstacles,
            avoidanceVector,
            obstacleDistance: nearestDistance
        };
    }
    
    /**
     * Fast AI avoidance lookup - O(1) instead of O(n) obstacle checks
     */
    getAvoidanceVector(position: Vector2D): Vector2D | null {
        // Convert world position to grid coordinates
        const gridX = Math.floor(position.x / this.gridCellSize);
        const gridY = Math.floor(position.y / this.gridCellSize);
        
        // Bounds check
        if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
            return null;
        }
        
        const cell = this.avoidanceGrid[gridX][gridY];
        return cell.hasObstacles ? cell.avoidanceVector : null;
    }
}
