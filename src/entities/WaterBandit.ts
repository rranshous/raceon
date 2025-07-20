import { Vector2D } from '../utils/Vector2D';
import { CarSprite } from '../graphics/CarSprite';

export class WaterBandit {
    public position: Vector2D;
    public velocity: Vector2D;
    public angle: number = 0;
    public speed: number = 0;
    public sprite: CarSprite | null = null;
    public isAlive: boolean = true;
    
    // Bandit properties
    private maxSpeed: number = 150; // Slightly slower than player
    private acceleration: number = 200;
    private friction: number = 80;
    private turnSpeed: number = 2;
    
    // AI properties
    private escapeTarget: Vector2D;
    private state: 'escaping' | 'destroyed' = 'escaping';
    
    // Dimensions
    public width: number = 20;
    public height: number = 12;
    
    constructor(startPosition: Vector2D, escapeTarget: Vector2D) {
        this.position = new Vector2D(startPosition.x, startPosition.y);
        this.velocity = new Vector2D(0, 0);
        this.escapeTarget = new Vector2D(escapeTarget.x, escapeTarget.y);
        
        // Set initial angle toward escape target
        const directionToEscape = this.escapeTarget.subtract(this.position).normalize();
        this.angle = Math.atan2(directionToEscape.y, directionToEscape.x);
    }
    
    setSprite(sprite: CarSprite): void {
        this.sprite = sprite;
    }
    
    update(deltaTime: number): void {
        if (!this.isAlive) return;
        
        this.updateAI(deltaTime);
        this.updatePhysics(deltaTime);
    }
    
    private updateAI(deltaTime: number): void {
        if (this.state === 'destroyed') return;
        
        // Simple AI: drive toward the escape target (edge of map)
        const directionToTarget = this.escapeTarget.subtract(this.position);
        const distanceToTarget = directionToTarget.length();
        
        if (distanceToTarget > 10) {
            // Calculate desired angle
            const desiredAngle = Math.atan2(directionToTarget.y, directionToTarget.x);
            
            // Smoothly turn toward desired angle
            let angleDiff = desiredAngle - this.angle;
            
            // Normalize angle difference to [-π, π]
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Turn toward target
            const maxTurnThisFrame = this.turnSpeed * deltaTime;
            if (Math.abs(angleDiff) < maxTurnThisFrame) {
                this.angle = desiredAngle;
            } else {
                this.angle += Math.sign(angleDiff) * maxTurnThisFrame;
            }
            
            // Accelerate toward target
            this.speed += this.acceleration * deltaTime;
            this.speed = Math.min(this.maxSpeed, this.speed);
        } else {
            // Reached escape point - apply friction
            this.speed = Math.max(0, this.speed - this.friction * deltaTime);
        }
    }
    
    private updatePhysics(deltaTime: number): void {
        // Convert speed and angle to velocity vector
        this.velocity = Vector2D.fromAngle(this.angle, this.speed);
        
        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));
    }
    
    // Check if bandit collides with player (for ramming)
    checkCollisionWithPlayer(playerPosition: Vector2D, playerRadius: number): boolean {
        if (!this.isAlive) return false;
        
        const distance = this.position.subtract(playerPosition).length();
        const banditRadius = Math.max(this.width, this.height) / 2;
        
        return distance < (banditRadius + playerRadius);
    }
    
    // Called when player rams the bandit
    destroy(): void {
        this.isAlive = false;
        this.state = 'destroyed';
        this.speed = 0;
        this.velocity = new Vector2D(0, 0);
    }
    
    // Check if bandit has escaped (reached edge of world)
    hasEscaped(worldWidth: number, worldHeight: number): boolean {
        const margin = 50;
        return this.position.x < margin || 
               this.position.x > worldWidth - margin ||
               this.position.y < margin || 
               this.position.y > worldHeight - margin;
    }
    
    render(ctx: CanvasRenderingContext2D): void {
        if (!this.isAlive) return;
        
        if (this.sprite) {
            // Use sprite rendering
            this.sprite.render(ctx, this.position.x, this.position.y, this.angle, 1.5);
        } else {
            // Render a simple blue rectangle if sprite not loaded
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = '#0066ff';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            ctx.restore();
        }
    }
}
