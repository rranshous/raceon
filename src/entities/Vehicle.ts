import { Vector2D } from '../utils/Vector2D';
import { InputManager } from '../input/InputManager';
import { CarSprite } from '../graphics/CarSprite';
import { DesertWorld } from '../world/DesertWorld';
import { GAME_CONFIG } from '../config/GameConfig';
import { PhysicsSystem, PhysicsEntity } from '../physics/PhysicsSystem';

export class Vehicle implements PhysicsEntity {
    public position: Vector2D;
    public velocity: Vector2D;
    public angle: number = 0; // Facing direction in radians
    public speed: number = 0;
    public sprite: CarSprite | null = null;
    
    // Entity type for physics system
    public readonly entityType = 'player' as const;
    
    // Vehicle properties (from config)
    private maxSpeed: number = GAME_CONFIG.VEHICLE.MAX_SPEED;
    private acceleration: number = GAME_CONFIG.VEHICLE.ACCELERATION;
    private braking: number = GAME_CONFIG.VEHICLE.BRAKING;
    private friction: number = GAME_CONFIG.VEHICLE.FRICTION;
    private turnSpeed: number = GAME_CONFIG.VEHICLE.TURN_SPEED;
    
    // Dimensions (from config)
    public width: number = GAME_CONFIG.VEHICLE.WIDTH;
    public height: number = GAME_CONFIG.VEHICLE.HEIGHT;

    constructor(x: number, y: number) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
    }

    setSprite(sprite: CarSprite): void {
        this.sprite = sprite;
    }
    
    // PhysicsEntity interface methods
    getWidth(): number {
        return this.width;
    }
    
    getHeight(): number {
        return this.height;
    }

    update(deltaTime: number, input: InputManager, world?: DesertWorld): void {
        this.handleInput(input, deltaTime, world);
        this.updatePhysics(deltaTime, world);
    }

    private handleInput(input: InputManager, deltaTime: number, _world?: DesertWorld): void {
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
        if (!world) {
            // Fallback: basic movement without collision/terrain
            this.velocity = Vector2D.fromAngle(this.angle, this.speed);
            this.position = this.position.add(this.velocity.multiply(deltaTime));
            return;
        }
        
        // Use unified physics system
        const physicsConfig = PhysicsSystem.createVehicleConfig();
        PhysicsSystem.updateEntityPhysics(this, deltaTime, world, physicsConfig);
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
