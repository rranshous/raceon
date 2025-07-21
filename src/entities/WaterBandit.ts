import { Vector2D } from '../utils/Vector2D';
import { CarSprite } from '../graphics/CarSprite';
import { GAME_CONFIG } from '../config/GameConfig';

export class WaterBandit {
    public position: Vector2D;
    public velocity: Vector2D;
    public angle: number = 0;
    public speed: number = 0;
    public sprite: CarSprite | null = null;
    public isAlive: boolean = true;
    
    // Bandit properties (from config)
    private maxSpeed: number = GAME_CONFIG.ENEMIES.WATER_BANDIT.MAX_SPEED;
    private acceleration: number = GAME_CONFIG.ENEMIES.WATER_BANDIT.ACCELERATION;
    private friction: number = GAME_CONFIG.ENEMIES.WATER_BANDIT.FRICTION;
    private turnSpeed: number = GAME_CONFIG.ENEMIES.WATER_BANDIT.TURN_SPEED;
    
    // AI properties (from config)
    private escapeTarget: Vector2D;
    private state: 'escaping' | 'destroyed' = 'escaping';
    private wanderAngle: number = 0; // For natural movement variation
    private stuckTimer: number = 0; // Detect when bandit is stuck
    private lastPosition: Vector2D;
    private avoidanceTarget: Vector2D | null = null; // Temporary avoidance target
    private avoidanceStartTime: number = 0; // Track how long we've been avoiding
    
    // Dimensions (from config)
    public width: number = GAME_CONFIG.ENEMIES.WATER_BANDIT.WIDTH;
    public height: number = GAME_CONFIG.ENEMIES.WATER_BANDIT.HEIGHT;
    
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
        
        // Check if we're genuinely stuck (very lenient detection)
        const distanceMoved = this.position.subtract(this.lastPosition).length();
        const expectedMovement = this.speed * deltaTime; // How far we should have moved
        
        // Only consider stuck if we're trying to move but not getting anywhere
        if (this.speed > GAME_CONFIG.ENEMIES.WATER_BANDIT.MIN_MOVEMENT_SPEED && 
            distanceMoved < expectedMovement * GAME_CONFIG.ENEMIES.WATER_BANDIT.STUCK_MOVEMENT_THRESHOLD) {
            this.stuckTimer += deltaTime;
        } else {
            this.stuckTimer = Math.max(0, this.stuckTimer - deltaTime * GAME_CONFIG.ENEMIES.WATER_BANDIT.STUCK_TIMER_DECAY);
        }
        this.lastPosition = new Vector2D(this.position.x, this.position.y);
        
        // If genuinely stuck for a long time, add avoidance behavior
        if (this.stuckTimer > GAME_CONFIG.ENEMIES.WATER_BANDIT.STUCK_DETECTION_TIME) {
            // Only create new avoidance if we don't have one or the current one is old
            const avoidanceAge = performance.now() - this.avoidanceStartTime;
            if (!this.avoidanceTarget || avoidanceAge > GAME_CONFIG.ENEMIES.WATER_BANDIT.AVOIDANCE_COOLDOWN * 1000) {
                this.createAvoidanceTarget();
            }
            this.stuckTimer = 0;
        }
        
        // Determine target (either escape target or avoidance target)
        let currentTarget = this.escapeTarget;
        if (this.avoidanceTarget) {
            currentTarget = this.avoidanceTarget;
            
            // Clear avoidance target if we're close enough or it's been too long
            const distanceToAvoidance = this.position.subtract(this.avoidanceTarget).length();
            const avoidanceAge = performance.now() - this.avoidanceStartTime;
            
            if (distanceToAvoidance < 50 || avoidanceAge > GAME_CONFIG.ENEMIES.WATER_BANDIT.AVOIDANCE_DURATION * 1000) {
                this.avoidanceTarget = null;
                console.log('Bandit cleared avoidance target - reached destination or timeout');
            }
        }
        
        // Calculate direction to target with natural wandering
        const directionToTarget = currentTarget.subtract(this.position);
        const distanceToTarget = directionToTarget.length();
        
        if (distanceToTarget > 10) {
            // Add some wandering behavior for more natural movement (reduced swerving)
            this.wanderAngle += (Math.random() - 0.5) * GAME_CONFIG.ENEMIES.WATER_BANDIT.WANDER_STRENGTH * deltaTime;
            
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
        // Create a more strategic avoidance target to prevent oscillation
        const avoidanceDistance = 150 + Math.random() * 100; // 150-250 pixels away
        
        // Try to go around obstacles in the direction of the escape target
        const escapeDirection = this.escapeTarget.subtract(this.position).normalize();
        const perpendicular = new Vector2D(-escapeDirection.y, escapeDirection.x); // Perpendicular to escape direction
        
        // Choose left or right around the obstacle
        const sideChoice = Math.random() > 0.5 ? 1 : -1;
        const avoidanceDirection = escapeDirection.add(perpendicular.multiply(sideChoice)).normalize();
        
        this.avoidanceTarget = new Vector2D(
            this.position.x + avoidanceDirection.x * avoidanceDistance,
            this.position.y + avoidanceDirection.y * avoidanceDistance
        );
        
        this.avoidanceStartTime = performance.now();
        console.log('Bandit created smart avoidance target - going around obstacle toward escape');
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
        const margin = 20; // Much smaller - they must reach the actual edge
        return this.position.x < margin || 
               this.position.x > worldWidth - margin ||
               this.position.y < margin || 
               this.position.y > worldHeight - margin;
    }
    
    // Handle water collision (same as player)
    handleWaterCollision(waterCollision: any, deltaTime: number): void {
        if (!waterCollision) return;
        
        const banditRadius = Math.max(this.width, this.height) / 3; // Smaller collision radius
        
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
                collisionNormal.multiply(velocityDotNormal * 1.2) // Reduced from 1.5 to 1.2
            );
            
            // Apply the bounced velocity with less damping (keep more momentum)
            this.velocity = reflectedVelocity.multiply(0.8); // Increased from 0.6 to 0.8
            this.speed *= 0.8; // Increased from 0.6 to 0.8
            
            // Update position based on new velocity to prevent sticking
            this.position = this.position.add(this.velocity.multiply(deltaTime));
            
            // Only create avoidance target if we're really stuck AND don't have one already
            if (!this.avoidanceTarget && this.stuckTimer > 1.0) { // Only if stuck for a while
                this.createAvoidanceTarget();
            }
        }
    }
    
    // Keep bandit within world bounds (but allow escape at edges)
    clampToWorldBounds(worldWidth: number, worldHeight: number): void {
        // Bandits should be free to escape! Only prevent them from going too far off-screen
        // during normal gameplay (not when escaping)
        
        // Only clamp if they're WAY off the map (like -500 pixels) to prevent memory issues
        const extremeMargin = 200;
        
        if (this.position.x < -extremeMargin) this.position.x = -extremeMargin;
        if (this.position.x > worldWidth + extremeMargin) this.position.x = worldWidth + extremeMargin;
        if (this.position.y < -extremeMargin) this.position.y = -extremeMargin;
        if (this.position.y > worldHeight + extremeMargin) this.position.y = worldHeight + extremeMargin;
        
        // That's it! Let them escape freely!
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
            isStuck: this.stuckTimer > 1.5 // More lenient threshold for visual indicator
        };
    }
}
