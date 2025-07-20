import { Vector2D } from '../utils/Vector2D';
import { InputManager } from '../input/InputManager';

export class Vehicle {
    public position: Vector2D;
    public velocity: Vector2D;
    public angle: number = 0; // Facing direction in radians
    public speed: number = 0;
    
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

    update(deltaTime: number, input: InputManager): void {
        this.handleInput(input, deltaTime);
        this.updatePhysics(deltaTime);
    }

    private handleInput(input: InputManager, deltaTime: number): void {
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

    private updatePhysics(deltaTime: number): void {
        // Convert speed and angle to velocity vector
        this.velocity = Vector2D.fromAngle(this.angle, this.speed);
        
        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Move to vehicle position and rotate
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        
        // Draw vehicle as a simple rectangle
        ctx.fillStyle = '#ff6b35'; // Orange color
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        // Vehicle body
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Front indicator (small rectangle at front)
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.width / 2 - 3, -2, 3, 4);
        
        ctx.restore();
    }
}
