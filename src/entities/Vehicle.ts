import { Vector2D } from '../utils/Vector2D';
import { InputManager } from '../input/InputManager';
import { CarSprite } from '../graphics/CarSprite';
import { DesertWorld } from '../world/DesertWorld';

export class Vehicle {
    public position: Vector2D;
    public velocity: Vector2D;
    public angle: number = 0; // Facing direction in radians
    public speed: number = 0;
    public sprite: CarSprite | null = null;
    
    // Vehicle properties
    private maxSpeed: number = 200;
    private acceleration: number = 300;
    private braking: number = 400;
    private friction: number = 100;
    private turnSpeed: number = 3; // radians per second
    
    // Dimensions
    public width: number = 20;
    public height: number = 12;

    constructor(x: number, y: number) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
    }

    setSprite(sprite: CarSprite): void {
        this.sprite = sprite;
    }

    update(deltaTime: number, input: InputManager, world?: DesertWorld): void {
        this.handleInput(input, deltaTime, world);
        this.updatePhysics(deltaTime, world);
    }

    private handleInput(input: InputManager, deltaTime: number, world?: DesertWorld): void {
        // Steering (only when moving)
        if (Math.abs(this.speed) > 10) {
            if (input.isSteeringLeft()) {
                this.angle -= this.turnSpeed * deltaTime * Math.min(this.speed / 100, 1);
            }
            if (input.isSteeringRight()) {
                this.angle += this.turnSpeed * deltaTime * Math.min(this.speed / 100, 1);
            }
        }

        // Acceleration and braking
        if (input.isAccelerating()) {
            this.speed += this.acceleration * deltaTime;
        } else if (input.isBraking()) {
            this.speed -= this.braking * deltaTime;
        } else {
            // Apply friction when no input
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.friction * deltaTime);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.friction * deltaTime);
            }
        }

        // Clamp speed
        this.speed = Math.max(-this.maxSpeed * 0.5, Math.min(this.maxSpeed, this.speed));
    }

    private updatePhysics(deltaTime: number, world?: DesertWorld): void {
        // Convert speed and angle to velocity vector (no terrain speed reduction here)
        this.velocity = Vector2D.fromAngle(this.angle, this.speed);
        
        // Calculate new position
        const newPosition = this.position.add(this.velocity.multiply(deltaTime));
        
        // Check for rock and water collisions if world is provided
        if (world) {
            const vehicleRadius = Math.max(this.width, this.height) / 2;
            
            // Check rock collisions (solid obstacles)
            const rockCollision = world.checkRockCollision(newPosition, vehicleRadius);
            if (rockCollision) {
                // Collision with rock - don't move, just bounce back slightly
                const bounceDirection = this.position.subtract(rockCollision.position).normalize();
                this.position = this.position.add(bounceDirection.multiply(2));
                this.speed *= -0.3; // Small bounce back
                return;
            }
            
            // Check water collisions (solid obstacles)
            const waterCollision = world.checkWaterCollision(newPosition, vehicleRadius);
            if (waterCollision) {
                // Collision with water - don't move, just bounce back slightly
                const bounceDirection = this.position.subtract(waterCollision.position).normalize();
                this.position = this.position.add(bounceDirection.multiply(2));
                this.speed *= -0.3; // Small bounce back
                return;
            }
        }
        
        // Update position if no collisions
        this.position = newPosition;
        
        // Apply terrain friction effects AFTER movement
        if (world) {
            const terrainEffect = world.getTerrainEffect(this.position);
            if (terrainEffect < 1.0) {
                // Apply additional friction based on terrain type (balanced effect)
                const additionalFriction = (1.0 - terrainEffect) * 700; // Reduced from 800 to 700
                
                // Apply terrain friction
                if (this.speed > 0) {
                    this.speed = Math.max(0, this.speed - additionalFriction * deltaTime);
                } else if (this.speed < 0) {
                    this.speed = Math.min(0, this.speed + additionalFriction * deltaTime);
                }
                
                // Debug output to see what's happening (less spammy)
                if (additionalFriction > 0 && Math.random() < 0.1) { // Only log 10% of the time
                    console.log(`Terrain effect: ${terrainEffect.toFixed(2)}, Additional friction: ${additionalFriction.toFixed(0)}, Speed: ${this.speed.toFixed(1)}`);
                }
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.sprite) {
            // Use sprite rendering with a scale factor to make it bigger
            this.sprite.render(ctx, this.position.x, this.position.y, this.angle, 1.5);
        } else {
            // Render a simple placeholder if sprite not loaded yet
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(-8, -8, 16, 16);
            ctx.restore();
        }
    }
}
