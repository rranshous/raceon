import { Vehicle } from '../entities/Vehicle';
import { DesertWorld } from '../world/DesertWorld';
import { InputManager } from '../input/InputManager';
import { AssetManager } from '../assets/AssetManager';
import { CarSprite } from '../graphics/CarSprite';
import { DesertSprite } from '../graphics/DesertSprite';
import { Camera } from '../camera/Camera';
import { BanditManager } from './BanditManager';
import { DebugRenderer } from '../debug/DebugRenderer';
import { ScreenShake } from '../effects/ScreenShake';
import { ParticleSystem } from '../effects/ParticleSystem';
import { TireTrackSystem } from '../effects/TireTrackSystem';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private inputManager: InputManager;
    private vehicle: Vehicle;
    private desertWorld: DesertWorld;
    private camera: Camera;
    private assetManager: AssetManager;
    private banditManager: BanditManager;
    private debugRenderer: DebugRenderer;
    private screenShake: ScreenShake;
    private particleSystem: ParticleSystem;
    private tireTrackSystem: TireTrackSystem;
    
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
        this.desertWorld = new DesertWorld();
        this.camera = new Camera(canvas.width, canvas.height, this.desertWorld.worldWidth, this.desertWorld.worldHeight);
        this.assetManager = AssetManager.getInstance();
        
        // Initialize bandit manager with world info
        this.banditManager = new BanditManager(
            this.desertWorld.worldWidth, 
            this.desertWorld.worldHeight, 
            this.desertWorld.getWaterObstacles(),
            this.desertWorld
        );
        
        // Initialize debug renderer
        this.debugRenderer = new DebugRenderer();
        
        // Initialize effect systems
        this.screenShake = new ScreenShake();
        this.particleSystem = new ParticleSystem();
        this.tireTrackSystem = new TireTrackSystem();
        
        // Start vehicle in the middle of the desert world
        this.vehicle = new Vehicle(this.desertWorld.worldWidth / 2, this.desertWorld.worldHeight / 2);
        this.vehicle.angle = 0; // Facing right initially
        
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
            
            // Set up blue car sprite for bandits
            const blueCarImage = this.assetManager.getImage('car_blue');
            if (blueCarImage) {
                const banditSprite = new CarSprite(blueCarImage);
                this.banditManager.setBanditSprite(banditSprite);
            }
            
            // Set up desert world sprites
            const desertDetailsImage = this.assetManager.getImage('desert_details');
            const waterTilesImage = this.assetManager.getImage('water_tiles');
            if (desertDetailsImage && waterTilesImage) {
                const desertSprite = new DesertSprite();
                desertSprite.setDesertDetailsImage(desertDetailsImage);
                desertSprite.setWaterImage(waterTilesImage);
                this.desertWorld.setDesertSprite(desertSprite);
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
        // Update input manager (for key press detection)
        this.inputManager.update();
        
        // Handle debug toggle
        if (this.inputManager.isDebugTogglePressed()) {
            this.debugRenderer.toggle();
        }
        
        // Update vehicle
        this.vehicle.update(deltaTime, this.inputManager);
        
        // Update camera to follow vehicle
        this.camera.update(this.vehicle);
        
        // Update bandits
        this.banditManager.update(deltaTime);
        
        // Vehicle radius for all collision checks
        const vehicleRadius = 12;
        
        // Check collision between player and bandits
        const collidedBandits = this.banditManager.checkPlayerCollisions(this.vehicle.position, vehicleRadius);
        for (const bandit of collidedBandits) {
            // Create destruction effects!
            this.particleSystem.createDestructionParticles(bandit.position, bandit.velocity);
            this.screenShake.shake(15, 0.3); // Intense shake for bandit destruction
            
            this.banditManager.destroyBandit(bandit);
        }
        
        // Add tire tracks for player
        this.tireTrackSystem.addTracks('player', this.vehicle.position, this.vehicle.angle, this.vehicle.speed, 'player');
        
        // Add tire tracks for bandits
        const activeBandits = this.banditManager.getActiveBandits();
        activeBandits.forEach((bandit, index) => {
            this.tireTrackSystem.addTracks(`bandit_${index}`, bandit.position, bandit.angle, bandit.speed, 'bandit');
        });
        
        // Check collision with water obstacles
        const waterCollision = this.desertWorld.checkWaterCollision(this.vehicle.position, vehicleRadius);
        
        if (waterCollision) {
            // Create water splash effect!
            this.particleSystem.createWaterSplash(this.vehicle.position);
            this.screenShake.shake(8, 0.2); // Moderate shake for water collision
            
            // Calculate collision response vector
            const collisionVector = this.vehicle.position.subtract(waterCollision.position);
            const collisionDistance = collisionVector.length();
            
            if (collisionDistance > 0) {
                // Normalize the collision vector
                const collisionNormal = collisionVector.normalize();
                
                // Push the car away from the water
                const overlap = vehicleRadius + waterCollision.radius - collisionDistance;
                this.vehicle.position = this.vehicle.position.add(collisionNormal.multiply(overlap + 2));
                
                // Calculate bounce/skid effect
                const velocityDotNormal = this.vehicle.velocity.x * collisionNormal.x + 
                                        this.vehicle.velocity.y * collisionNormal.y;
                
                // Reflect velocity along the collision normal (bounce effect)
                const reflectedVelocity = this.vehicle.velocity.subtract(
                    collisionNormal.multiply(velocityDotNormal * 1.5)
                );
                
                // Apply the bounced velocity with some damping
                this.vehicle.velocity = reflectedVelocity.multiply(0.7); // Slightly less damping for water
                this.vehicle.speed *= 0.7;
                
                // Update position based on new velocity to prevent sticking
                this.vehicle.position = this.vehicle.position.add(this.vehicle.velocity.multiply(deltaTime));
            }
        }
        
        // Create driving dust particles when moving fast
        if (this.vehicle.speed > 80) {
            this.particleSystem.createDustParticles(this.vehicle.position, this.vehicle.velocity, 2);
        }
        
        // Update effect systems
        this.screenShake.update(deltaTime);
        this.particleSystem.update(deltaTime);
        this.tireTrackSystem.update(deltaTime);
        
        // Keep vehicle within world bounds
        this.vehicle.position = this.desertWorld.clampToWorldBounds(this.vehicle.position);
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
        
        // Save context for camera transform
        this.ctx.save();
        
        // Apply camera transform with screen shake
        const shakeOffset = this.screenShake.getOffset();
        this.ctx.translate(-this.camera.position.x + shakeOffset.x, -this.camera.position.y + shakeOffset.y);
        
        // Render desert world
        this.desertWorld.render(this.ctx, this.camera.position.x, this.camera.position.y, this.canvas.width, this.canvas.height);
        
        // Render tire tracks (under vehicles)
        this.tireTrackSystem.render(this.ctx, this.camera.position.x, this.camera.position.y, this.canvas.width, this.canvas.height);
        
        // Render debug overlays in world space (before restoring context)
        this.debugRenderer.renderWorldDebug(
            this.ctx,
            this.banditManager.getActiveBandits(),
            this.desertWorld.getWaterObstacles(),
            this.vehicle,
            this.camera.position.x,
            this.camera.position.y,
            this.canvas.width,
            this.canvas.height
        );
        
        // Render bandits
        this.banditManager.render(this.ctx);
        
        // Render vehicle
        this.vehicle.render(this.ctx);
        
        // Render particles (on top of everything)
        this.particleSystem.render(this.ctx);
        
        // Restore context
        this.ctx.restore();
        
        // Render UI elements (debug info, etc.) - these stay on screen
        this.renderDebugInfo();
        
        // Render debug UI overlays (not affected by camera)
        this.debugRenderer.renderUIDebug(this.ctx, this.banditManager.getActiveBandits(), this.vehicle);
    }

    private renderDebugInfo(): void {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        
        // Only show useful gameplay info
        const banditStats = this.banditManager.getStats();
        this.ctx.fillText(`Water Bandits: ${banditStats.active} active`, 10, 30);
    }
}
