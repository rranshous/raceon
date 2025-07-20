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
        // From the image: appears to be facing different angles around the circle
        for (let col = 0; col < CarSprite.DIRECTIONS; col++) {
            this.frames.push({
                x: col * CarSprite.SPRITE_SIZE,
                y: 0, // Single row, so y is always 0
                width: CarSprite.SPRITE_SIZE,
                height: CarSprite.SPRITE_SIZE
            });
        }
    }

    getFrameForAngle(angle: number): SpriteFrame {
        // Normalize angle to 0-2π range
        let normalizedAngle = angle;
        while (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
        while (normalizedAngle >= Math.PI * 2) normalizedAngle -= Math.PI * 2;

        // The sprite sheet starts with "up" (frame 0) and goes clockwise
        // Frame 0: up (angle = -π/2 or 3π/2)
        // Frame 1: up-right (angle = -π/4 or 7π/4)
        // Frame 2: right (angle = 0)
        // Frame 3: down-right (angle = π/4)
        // Frame 4: down (angle = π/2)
        // Frame 5: down-left (angle = 3π/4)
        // Frame 6: left (angle = π)
        // Frame 7: up-left (angle = 5π/4)
        
        // Adjust angle so that 0 corresponds to frame 0 (up)
        // We need to rotate the angle system by 3π/2 (or -π/2)
        let adjustedAngle = normalizedAngle + Math.PI / 2;
        if (adjustedAngle >= Math.PI * 2) adjustedAngle -= Math.PI * 2;
        
        const angleStep = (Math.PI * 2) / CarSprite.DIRECTIONS;
        let frameIndex = Math.floor(adjustedAngle / angleStep) % CarSprite.DIRECTIONS;
        
        return this.frames[frameIndex];
    }

    render(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number = 1): void {
        const frame = this.getFrameForAngle(angle);
        
        // Calculate scaled dimensions
        const scaledWidth = frame.width * scale;
        const scaledHeight = frame.height * scale;
        
        // Draw the sprite centered at the given position
        ctx.drawImage(
            this.image,
            frame.x, frame.y, frame.width, frame.height,  // Source rectangle
            x - scaledWidth / 2, y - scaledHeight / 2, scaledWidth, scaledHeight  // Destination rectangle
        );
    }
}
