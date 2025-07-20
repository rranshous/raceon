export interface SpriteFrame {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class CarSprite {
    private image: HTMLImageElement;
    private frames: SpriteFrame[] = [];
    
    // Car sprite sheet layout (8 directions in a single row)
    private static readonly DIRECTIONS = 8;
    private static readonly SPRITE_SIZE = 16;
    
    constructor(image: HTMLImageElement) {
        this.image = image;
        this.setupFrames();
    }

    private setupFrames(): void {
        // Single row of 8 car directions
        // We'll just use frame 0 (the "up" facing sprite) and rotate it
        for (let col = 0; col < CarSprite.DIRECTIONS; col++) {
            this.frames.push({
                x: col * CarSprite.SPRITE_SIZE,
                y: 0, // Single row, so y is always 0
                width: CarSprite.SPRITE_SIZE,
                height: CarSprite.SPRITE_SIZE
            });
        }
    }

    render(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number = 1): void {
        // Always use frame 0 (the "up" facing sprite) and rotate it
        const frame = this.frames[0];
        
        // Calculate scaled dimensions
        const scaledWidth = frame.width * scale;
        const scaledHeight = frame.height * scale;
        
        ctx.save();
        
        // Move to the car position
        ctx.translate(x, y);
        
        // Rotate by the car's angle
        // The sprite faces "up" so we need to add π/2 to align with our coordinate system
        ctx.rotate(angle + Math.PI / 2);
        
        // Draw the sprite centered at the origin (which is now the car position)
        ctx.drawImage(
            this.image,
            frame.x, frame.y, frame.width, frame.height,  // Source rectangle
            -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight  // Destination rectangle
        );
        
        ctx.restore();
    }
}
