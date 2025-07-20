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
    private wanderAngle: number = 0; // For natural movement variation
    private stuckTimer: number = 0; // Detect when bandit is stuck
    private lastPosition: Vector2D;
    private avoidanceTarget: Vector2D | null = null; // Temporary avoidance target
    
    // Dimensions
    public width: number = 20;
    public height: number = 12;
    
    constructor(startPosition: Vector2D, escapeTarget: Vector2D) {
        this.position = new Vector2D(startPosition.x, startPosition.y);
        this.velocity = new Vector2D(0, 0);
        this.escapeTarget = new Vector2D(escapeTarget.x, escapeTarget.y);
        this.lastPosition = new Vector2D(startPosition.x, startPosition.y);
        
        // Set initial angle toward escape target with some randomness
        const directionToEscape = this.escapeTarget.subtract(this.position).normalize();
        this.angle = Math.atan2(directionToEscape.y, directionToEscape.x);
        this.wanderAngle = this.angle + (Math.random() - 0.5) * 0.5; // Small random variation
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
        
        // Check if we're stuck (haven't moved much)
        const distanceMoved = this.position.subtract(this.lastPosition).length();
        if (distanceMoved < 5) {
            this.stuckTimer += deltaTime;
        } else {
            this.stuckTimer = 0;
        }
        this.lastPosition = new Vector2D(this.position.x, this.position.y);
        
        // If stuck for too long, add avoidance behavior
        if (this.stuckTimer > 1.0) {
            this.createAvoidanceTarget();
            this.stuckTimer = 0;
        }
        
        // Determine target (either escape target or avoidance target)
        let currentTarget = this.escapeTarget;
        if (this.avoidanceTarget) {
            currentTarget = this.avoidanceTarget;
            
            // Clear avoidance target if we're close enough
            if (this.position.subtract(this.avoidanceTarget).length() < 30) {
                this.avoidanceTarget = null;
            }
        }
        
        // Calculate direction to target with natural wandering
        const directionToTarget = currentTarget.subtract(this.position);
        const distanceToTarget = directionToTarget.length();
        
        if (distanceToTarget > 10) {
            // Add some wandering behavior for more natural movement (reduced swerving)
            this.wanderAngle += (Math.random() - 0.5) * 0.8 * deltaTime; // Reduced from 2 to 0.8
            
            // Calculate desired angle (target direction + wander)
            const targetAngle = Math.atan2(directionToTarget.y, directionToTarget.x);
            const wanderInfluence = 0.15; // Reduced from 0.3 to 0.15 - less swerving
            const desiredAngle = targetAngle + this.wanderAngle * wanderInfluence;
            
            // Smoothly turn toward desired angle
            let angleDiff = desiredAngle - this.angle;
            
            // Normalize angle difference to [-π, π]
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Turn toward target with some variation in turn speed
            const baseTurnSpeed = this.turnSpeed * (0.8 + Math.random() * 0.4); // 80%-120% of base speed
            const maxTurnThisFrame = baseTurnSpeed * deltaTime;
            if (Math.abs(angleDiff) < maxTurnThisFrame) {
                this.angle = desiredAngle;
            } else {
                this.angle += Math.sign(angleDiff) * maxTurnThisFrame;
            }
            
            // Vary acceleration for more natural movement
            const baseAcceleration = this.acceleration * (0.7 + Math.random() * 0.6); // 70%-130% variation
            this.speed += baseAcceleration * deltaTime;
            this.speed = Math.min(this.maxSpeed, this.speed);
        } else {
            // Near target - apply friction
            this.speed = Math.max(0, this.speed - this.friction * deltaTime);
        }
    }
    
    private createAvoidanceTarget(): void {
        // Create a temporary target to the side to get unstuck
        const avoidanceDistance = 80;
        const avoidanceAngle = this.angle + (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 3 + Math.random() * Math.PI / 3);
        
        this.avoidanceTarget = new Vector2D(
            this.position.x + Math.cos(avoidanceAngle) * avoidanceDistance,
            this.position.y + Math.sin(avoidanceAngle) * avoidanceDistance
        );
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
    
    // Handle water collision (same as player)
    handleWaterCollision(waterCollision: any, deltaTime: number): void {
        if (!waterCollision) return;
        
        const banditRadius = Math.max(this.width, this.height) / 2;
        
        // Calculate collision response vector
        const collisionVector = this.position.subtract(waterCollision.position);
        const collisionDistance = collisionVector.length();
        
        if (collisionDistance > 0) {
            // Normalize the collision vector
            const collisionNormal = collisionVector.normalize();
            
            // Push the bandit away from the water
            const overlap = banditRadius + waterCollision.radius - collisionDistance;
            this.position = this.position.add(collisionNormal.multiply(overlap + 2));
            
            // Calculate bounce/skid effect
            const velocityDotNormal = this.velocity.x * collisionNormal.x + 
                                    this.velocity.y * collisionNormal.y;
            
            // Reflect velocity along the collision normal (bounce effect)
            const reflectedVelocity = this.velocity.subtract(
                collisionNormal.multiply(velocityDotNormal * 1.5)
            );
            
            // Apply the bounced velocity with some damping
            this.velocity = reflectedVelocity.multiply(0.6); // More damping for bandits
            this.speed *= 0.6;
            
            // Update position based on new velocity to prevent sticking
            this.position = this.position.add(this.velocity.multiply(deltaTime));
            
            // Create avoidance target to steer around water
            this.createAvoidanceTarget();
        }
    }
    
    // Keep bandit within world bounds
    clampToWorldBounds(worldWidth: number, worldHeight: number): void {
        this.position = new Vector2D(
            Math.max(50, Math.min(worldWidth - 50, this.position.x)),
            Math.max(50, Math.min(worldHeight - 50, this.position.y))
        );
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
    
    // Debug info getters for godly mode
    getDebugInfo() {
        return {
            position: this.position,
            escapeTarget: this.escapeTarget,
            avoidanceTarget: this.avoidanceTarget,
            stuckTimer: this.stuckTimer,
            speed: this.speed,
            state: this.state,
            isStuck: this.stuckTimer > 0.5
        };
    }
}
