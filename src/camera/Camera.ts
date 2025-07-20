import { Vector2D } from '../utils/Vector2D';
import { Vehicle } from '../entities/Vehicle';

export class Camera {
    public position: Vector2D;
    private canvasWidth: number;
    private canvasHeight: number;
    private worldWidth: number;
    private worldHeight: number;
    
    // Camera smoothing
    private smoothing: number = 0.1;
    
    constructor(canvasWidth: number, canvasHeight: number, worldWidth: number, worldHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.position = new Vector2D(0, 0);
    }

    update(target: Vehicle): void {
        // Calculate desired camera position (centered on vehicle)
        const desiredX = target.position.x - this.canvasWidth / 2;
        const desiredY = target.position.y - this.canvasHeight / 2;
        
        // Clamp camera to world bounds
        const clampedX = Math.max(0, Math.min(this.worldWidth - this.canvasWidth, desiredX));
        const clampedY = Math.max(0, Math.min(this.worldHeight - this.canvasHeight, desiredY));
        
        // Smooth camera movement
        const targetPosition = new Vector2D(clampedX, clampedY);
        const difference = targetPosition.subtract(this.position);
        this.position = this.position.add(difference.multiply(this.smoothing));
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldPos: Vector2D): Vector2D {
        return worldPos.subtract(this.position);
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenPos: Vector2D): Vector2D {
        return screenPos.add(this.position);
    }

    // Check if a world position is visible on screen
    isVisible(worldPos: Vector2D, margin: number = 0): boolean {
        const screenPos = this.worldToScreen(worldPos);
        return screenPos.x >= -margin &&
               screenPos.x <= this.canvasWidth + margin &&
               screenPos.y >= -margin &&
               screenPos.y <= this.canvasHeight + margin;
    }
}
