import { Vector2D } from '../utils/Vector2D';

export interface BoundaryObject {
    position: Vector2D;
    spriteIndex: number;
    collisionRadius: number;
}

export class BoundarySprite {
    private image: HTMLImageElement;
    private static readonly SPRITE_SIZE = 16;
    
    constructor(image: HTMLImageElement) {
        this.image = image;
    }

    renderBoundaryObject(ctx: CanvasRenderingContext2D, obj: BoundaryObject, scale: number = 1): void {
        const scaledSize = BoundarySprite.SPRITE_SIZE * scale;
        
        // Calculate sprite position in the sheet (assuming 8 sprites per row)
        const spritesPerRow = 8;
        const col = obj.spriteIndex % spritesPerRow;
        const row = Math.floor(obj.spriteIndex / spritesPerRow);
        
        ctx.drawImage(
            this.image,
            col * BoundarySprite.SPRITE_SIZE, 
            row * BoundarySprite.SPRITE_SIZE, 
            BoundarySprite.SPRITE_SIZE, 
            BoundarySprite.SPRITE_SIZE,
            obj.position.x - scaledSize / 2,
            obj.position.y - scaledSize / 2,
            scaledSize,
            scaledSize
        );
    }
}
