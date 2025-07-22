import { Vector2D } from '../utils/Vector2D';
import { GAME_CONFIG } from '../config/GameConfig';

export class ScreenShake {
    private shakeIntensity: number = 0;
    private shakeDuration: number = 0;
    private shakeDecay: number = GAME_CONFIG.EFFECTS.SCREEN_SHAKE.DECAY_RATE;
    private currentOffset: Vector2D = new Vector2D(0, 0);
    
    constructor() {}
    
    // Trigger screen shake with given intensity and duration
    shake(intensity: number, duration: number): void {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
        this.shakeDuration = Math.max(this.shakeDuration, duration);
    }
    
    // Update shake effect each frame
    update(deltaTime: number): void {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            
            // Generate random shake offset
            const shakeAmount = this.shakeIntensity * (this.shakeDuration / 0.5); // Normalize to max duration
            this.currentOffset = new Vector2D(
                (Math.random() - 0.5) * shakeAmount,
                (Math.random() - 0.5) * shakeAmount
            );
            
            // Decay shake intensity
            this.shakeIntensity *= this.shakeDecay;
        } else {
            // No shake active
            this.currentOffset = new Vector2D(0, 0);
            this.shakeIntensity = 0;
        }
    }
    
    // Get current shake offset to apply to camera
    getOffset(): Vector2D {
        return this.currentOffset;
    }
    
    // Check if shake is currently active
    isShaking(): boolean {
        return this.shakeDuration > 0;
    }
    
    // Force stop shake
    stop(): void {
        this.shakeDuration = 0;
        this.shakeIntensity = 0;
        this.currentOffset = new Vector2D(0, 0);
    }
}
