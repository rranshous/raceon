import { Vector2D } from '../utils/Vector2D';
import { DesertTile, DesertSprite } from '../graphics/DesertSprite';

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

export class DesertWorld {
    private desertTiles: DesertTile[] = [];
    private waterObstacles: WaterObstacle[] = [];
    private rockObstacles: RockObstacle[] = [];
    private terrainEffects: TerrainEffect[] = [];
    private desertSprite: DesertSprite | null = null;
    
    // World dimensions - much larger than previous track
    public readonly worldWidth = 2400;  // 3x wider
    public readonly worldHeight = 1800; // 3x taller
    
    constructor() {
        this.generateDesertTerrain();
        this.generateWaterObstacles();
    }

    setDesertSprite(sprite: DesertSprite): void {
        this.desertSprite = sprite;
    }

    private generateDesertTerrain(): void {
        const tileSize = 32; // Tile size for rendering
        
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
        for (const obstacle of this.waterObstacles) {
            const distance = position.subtract(obstacle.position).length();
            if (distance < radius + obstacle.radius) {
                return obstacle;
            }
        }
        return null;
    }
    
    // Check collision with rock obstacles (solid collision like water)
    checkRockCollision(position: Vector2D, radius: number): RockObstacle | null {
        for (const obstacle of this.rockObstacles) {
            const distance = position.subtract(obstacle.position).length();
            if (distance < radius + obstacle.radius) {
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

    // Keep player within world bounds
    clampToWorldBounds(position: Vector2D): Vector2D {
        return new Vector2D(
            Math.max(50, Math.min(this.worldWidth - 50, position.x)),
            Math.max(50, Math.min(this.worldHeight - 50, position.y))
        );
    }
}
