import { Vehicle } from '../entities/Vehicle';
import { Track } from '../track/Track';
import { InputManager } from '../input/InputManager';
import { AssetManager } from '../assets/AssetManager';
import { CarSprite } from '../graphics/CarSprite';
import { BoundarySprite } from '../graphics/BoundarySprite';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private inputManager: InputManager;
    private vehicle: Vehicle;
    private track: Track;
    private assetManager: AssetManager;
    
    private lastTime: number = 0;
    private isRunning: boolean = false;
    private assetsLoaded: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = ctx;
        
        this.inputManager = new InputManager();
        this.vehicle = new Vehicle(400, 300); // Start at center
        this.track = new Track();
        this.assetManager = AssetManager.getInstance();
        
        // Set initial vehicle position to be on the track
        this.vehicle.position.x = 400 + 300; // Start on the right side of the oval
        this.vehicle.position.y = 300;
        this.vehicle.angle = Math.PI / 2; // Facing down initially
        
        // Load assets
        this.loadAssets();
    }

    private async loadAssets(): Promise<void> {
        try {
            await this.assetManager.loadAllAssets();
            
            // Set up the yellow car sprite
            const yellowCarImage = this.assetManager.getImage('car_yellow');
            if (yellowCarImage) {
                const carSprite = new CarSprite(yellowCarImage);
                this.vehicle.setSprite(carSprite);
            }
            
            // Set up boundary sprites (cones)
            const miscPropsImage = this.assetManager.getImage('misc_props');
            if (miscPropsImage) {
                const boundarySprite = new BoundarySprite(miscPropsImage);
                this.track.setBoundarySprite(boundarySprite);
            }
            
            this.assetsLoaded = true;
            console.log('Assets loaded successfully!');
        } catch (error) {
            console.error('Failed to load assets:', error);
            // Game will fall back to rectangle rendering
            this.assetsLoaded = false;
        }
    }

    start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    stop(): void {
        this.isRunning = false;
    }

    private gameLoop = (): void => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    };

    private update(deltaTime: number): void {
        // Update vehicle
        this.vehicle.update(deltaTime, this.inputManager);
        
        // Check collision with boundary objects (cones)
        const vehicleRadius = 12; // Approximate radius for collision detection
        const collision = this.track.checkCollision(this.vehicle.position, vehicleRadius);
        
        if (collision) {
            // Calculate collision response vector
            const collisionVector = this.vehicle.position.subtract(collision.position);
            const collisionDistance = collisionVector.length();
            
            if (collisionDistance > 0) {
                // Normalize the collision vector
                const collisionNormal = collisionVector.normalize();
                
                // Push the car away from the cone
                const overlap = vehicleRadius + collision.collisionRadius - collisionDistance;
                this.vehicle.position = this.vehicle.position.add(collisionNormal.multiply(overlap + 2));
                
                // Calculate bounce/skid effect
                const velocityDotNormal = this.vehicle.velocity.x * collisionNormal.x + 
                                        this.vehicle.velocity.y * collisionNormal.y;
                
                // Reflect velocity along the collision normal (bounce effect)
                const reflectedVelocity = this.vehicle.velocity.subtract(
                    collisionNormal.multiply(velocityDotNormal * 1.5)
                );
                
                // Apply the bounced velocity with some damping
                this.vehicle.velocity = reflectedVelocity.multiply(0.6); // Reduce speed but maintain direction
                this.vehicle.speed *= 0.6; // Also reduce the speed value
                
                // Update position based on new velocity to prevent sticking
                this.vehicle.position = this.vehicle.position.add(this.vehicle.velocity.multiply(deltaTime));
            }
        }
        
        // Simple boundary checking - wrap around screen edges (as backup)
        if (this.vehicle.position.x < 0) {
            this.vehicle.position.x = this.canvas.width;
        } else if (this.vehicle.position.x > this.canvas.width) {
            this.vehicle.position.x = 0;
        }
        
        if (this.vehicle.position.y < 0) {
            this.vehicle.position.y = this.canvas.height;
        } else if (this.vehicle.position.y > this.canvas.height) {
            this.vehicle.position.y = 0;
        }
    }

    private render(): void {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.assetsLoaded) {
            // Show loading message
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading Assets...', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }
        
        // Render track
        this.track.render(this.ctx);
        
        // Render vehicle
        this.vehicle.render(this.ctx);
        
        // Render debug info
        this.renderDebugInfo();
    }

    private renderDebugInfo(): void {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left'; // Reset text alignment
        this.ctx.fillText(`Speed: ${Math.round(this.vehicle.speed)}`, 10, 30);
        this.ctx.fillText(`Position: (${Math.round(this.vehicle.position.x)}, ${Math.round(this.vehicle.position.y)})`, 10, 50);
        this.ctx.fillText(`Angle: ${Math.round(this.vehicle.angle * 180 / Math.PI)}°`, 10, 70);
        
        // Show asset loading status
        if (!this.assetsLoaded) {
            this.ctx.fillText('Assets: Loading...', 10, 90);
        } else {
            this.ctx.fillText('Assets: ✓ Loaded', 10, 90);
        }
    }
}
