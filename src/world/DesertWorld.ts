import { Vector2D } from '../utils/Vector2D';
import { DesertTile, DesertSprite } from '../graphics/DesertSprite';

export interface WaterObstacle {
    position: Vector2D;
    radius: number;
}

export class DesertWorld {
    private desertTiles: DesertTile[] = [];
    private waterObstacles: WaterObstacle[] = [];
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
        
        // Add scattered desert details (cacti, rocks, etc.)
        const numDetails = 150; // Slightly fewer for better balance
        for (let i = 0; i < numDetails; i++) {
            const x = Math.random() * this.worldWidth;
            const y = Math.random() * this.worldHeight;
            
            // Use desert detail sprites (skip first 2 which are sand variations)
            // Start from index 2 to avoid the sand sprites
            const spriteIndex = 2 + Math.floor(Math.random() * 6); // Use sprites 2-7
            
            this.desertTiles.push({
                position: new Vector2D(x, y),
                tileType: 'detail',
                spriteIndex: spriteIndex
            });
        }
    }

    private generateWaterObstacles(): void {
        // Create several water oases as obstacles
        const numOases = 12;
        
        for (let i = 0; i < numOases; i++) {
            const centerX = Math.random() * (this.worldWidth - 200) + 100;
            const centerY = Math.random() * (this.worldHeight - 200) + 100;
            const oasisSize = 40 + Math.random() * 60; // Random size oases
            
            // Create cluster of water tiles around center
            const tilesInOasis = Math.floor(oasisSize / 8);
            for (let j = 0; j < tilesInOasis; j++) {
                const angle = (j / tilesInOasis) * Math.PI * 2;
                const radius = 10 + Math.random() * (oasisSize / 2);
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
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

    // Keep player within world bounds
    clampToWorldBounds(position: Vector2D): Vector2D {
        return new Vector2D(
            Math.max(50, Math.min(this.worldWidth - 50, position.x)),
            Math.max(50, Math.min(this.worldHeight - 50, position.y))
        );
    }
}
