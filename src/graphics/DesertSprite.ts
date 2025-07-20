import { Vector2D } from '../utils/Vector2D';

export interface DesertTile {
    position: Vector2D;
    tileType: 'sand' | 'detail' | 'water';
    spriteIndex?: number;
}

export class DesertSprite {
    private desertDetailsImage: HTMLImageElement | null = null;
    private waterImage: HTMLImageElement | null = null;
    private static readonly SPRITE_SIZE = 16;
    
    setDesertDetailsImage(image: HTMLImageElement): void {
        this.desertDetailsImage = image;
    }
    
    setWaterImage(image: HTMLImageElement): void {
        this.waterImage = image;
    }

    renderDesertTile(ctx: CanvasRenderingContext2D, tile: DesertTile, scale: number = 1): void {
        const scaledSize = DesertSprite.SPRITE_SIZE * scale;
        
        if (tile.tileType === 'sand') {
            // Use the first desert sprite (blank sand) instead of yellow fill
            if (this.desertDetailsImage) {
                ctx.drawImage(
                    this.desertDetailsImage,
                    0, 0, // First sprite (blank sand) at position 0,0
                    DesertSprite.SPRITE_SIZE,
                    DesertSprite.SPRITE_SIZE,
                    tile.position.x - scaledSize / 2,
                    tile.position.y - scaledSize / 2,
                    scaledSize + 1, // Add 1 pixel to eliminate gaps
                    scaledSize + 1
                );
            }
        } else if (tile.tileType === 'detail' && this.desertDetailsImage && tile.spriteIndex !== undefined) {
            // Render desert detail sprite
            const spritesPerRow = 8; // Assuming 8 sprites per row
            const col = tile.spriteIndex % spritesPerRow;
            const row = Math.floor(tile.spriteIndex / spritesPerRow);
            
            ctx.drawImage(
                this.desertDetailsImage,
                col * DesertSprite.SPRITE_SIZE,
                row * DesertSprite.SPRITE_SIZE,
                DesertSprite.SPRITE_SIZE,
                DesertSprite.SPRITE_SIZE,
                tile.position.x - scaledSize / 2,
                tile.position.y - scaledSize / 2,
                scaledSize,
                scaledSize
            );
        } else if (tile.tileType === 'water' && this.waterImage && tile.spriteIndex !== undefined) {
            // Render water sprite
            const spritesPerRow = 8;
            const col = tile.spriteIndex % spritesPerRow;
            const row = Math.floor(tile.spriteIndex / spritesPerRow);
            
            ctx.drawImage(
                this.waterImage,
                col * DesertSprite.SPRITE_SIZE,
                row * DesertSprite.SPRITE_SIZE,
                DesertSprite.SPRITE_SIZE,
                DesertSprite.SPRITE_SIZE,
                tile.position.x - scaledSize / 2,
                tile.position.y - scaledSize / 2,
                scaledSize,
                scaledSize
            );
        }
    }
}
