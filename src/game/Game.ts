import { Vehicle } from '../entities/Vehicle';
import { DesertWorld } from '../world/DesertWorld';
import { InputManager } from '../input/InputManager';
import { AssetManager } from '../assets/AssetManager';
import { CarSprite } from '../graphics/CarSprite';
import { DesertSprite } from '../graphics/DesertSprite';
import { Camera } from '../camera/Camera';
import { EnemyManager } from './EnemyManager';
import { DebugRenderer } from '../debug/DebugRenderer';
import { ScreenShake } from '../effects/ScreenShake';
import { ParticleSystem } from '../effects/ParticleSystem';
import { TireTrackSystem } from '../effects/TireTrackSystem';
import { Vector2D } from '../utils/Vector2D';
import { initializeEntitySystem } from '../entities/EntitySystemInit';
import { GameEvents } from '../events/GameEvents';
import { EVENT_TYPES, EnemyDestroyedEvent, PlayerWaterCollisionEvent, EnemyWaterCollisionEvent, PlayerRockCollisionEvent, EnemyRockCollisionEvent, DebugModeToggledEvent, EntityMovedEvent, SpeedThresholdReachedEvent } from '../events/EventTypes';
import { GAME_CONFIG } from '../config/GameConfig';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private inputManager: InputManager;
    private vehicle: Vehicle;
    private desertWorld: DesertWorld;
    private camera: Camera;
    private assetManager: AssetManager;
    private enemyManager: EnemyManager;
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
        
        // Initialize entity system
        initializeEntitySystem();
        
        this.inputManager = new InputManager();
        this.desertWorld = new DesertWorld();
        this.camera = new Camera(canvas.width, canvas.height, this.desertWorld.worldWidth, this.desertWorld.worldHeight);
        this.assetManager = AssetManager.getInstance();
        
        // Initialize enemy manager with world info
        this.enemyManager = new EnemyManager(
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
        
        // Set up event listeners for decoupled effects
        this.setupEventListeners();
        
        // Start vehicle in the middle of the desert world
        this.vehicle = new Vehicle(this.desertWorld.worldWidth / 2, this.desertWorld.worldHeight / 2);
        this.vehicle.angle = 0; // Facing right initially
        
        // Load assets
        this.loadAssets();
    }

    /**
     * Set up event listeners for decoupled effects
     */
    private setupEventListeners(): void {
        // Listen for enemy destruction events to trigger effects
        GameEvents.on(EVENT_TYPES.ENEMY_DESTROYED, (event: EnemyDestroyedEvent) => {
            // Create destruction particles
            this.particleSystem.createDestructionParticles(event.position, event.velocity);
            
            // Trigger screen shake
            this.screenShake.shake(GAME_CONFIG.EFFECTS.SCREEN_SHAKE.DESTRUCTION_INTENSITY, 0.3);
        });
        
        // Listen for water collision events to trigger effects
        GameEvents.on(EVENT_TYPES.PLAYER_WATER_COLLISION, (event: PlayerWaterCollisionEvent) => {
            // Create water splash effect
            this.particleSystem.createWaterSplash(event.playerPosition);
            
            // Trigger screen shake for water collision
            this.screenShake.shake(GAME_CONFIG.EFFECTS.SCREEN_SHAKE.COLLISION_INTENSITY, 0.2);
            
            // Example: Easy to add new mechanics without touching collision detection
            console.log('💦 Player hit water! Could add damage, fuel loss, or other mechanics here');
        });
        
        // Listen for enemy water collisions (separate from player)
        GameEvents.on(EVENT_TYPES.ENEMY_WATER_COLLISION, (event: EnemyWaterCollisionEvent) => {
            // Different effects for enemies hitting water
            // Could trigger AI behavior changes, different particles, etc.
            console.log(`🤖 Enemy ${event.enemy.constructor.name} hit water! Could change AI behavior, create smaller splash, etc.`);
        });
        
        // Listen for player rock collisions
        GameEvents.on(EVENT_TYPES.PLAYER_ROCK_COLLISION, (event: PlayerRockCollisionEvent) => {
            // Create rock collision effects
            // Could be different from water - sparks, different particles, different shake intensity
            this.screenShake.shake(GAME_CONFIG.EFFECTS.SCREEN_SHAKE.COLLISION_INTENSITY, 0.25); // Slightly different from water collision
            
            console.log(`🪨 Player hit rock at ${event.rockObstacle.position.x}, ${event.rockObstacle.position.y}! Could add sparks, metal scraping sounds, vehicle damage, etc.`);
        });
        
        // Listen for enemy rock collisions (separate from player)
        GameEvents.on(EVENT_TYPES.ENEMY_ROCK_COLLISION, (event: EnemyRockCollisionEvent) => {
            // Different effects for enemies hitting rocks
            // Could trigger different AI responses, less dramatic effects
            console.log(`🤖 Enemy ${event.enemy.constructor.name} hit rock! Could change AI pathfinding, create dust, etc.`);
        });
        
        // Listen for debug mode toggle events
        GameEvents.on(EVENT_TYPES.DEBUG_MODE_TOGGLED, (event: DebugModeToggledEvent) => {
            // Easy to add new debug mode behaviors
            console.log(`🛠️ Debug mode ${event.enabled ? 'ENABLED' : 'DISABLED'} at ${event.timestamp.toFixed(2)}ms`);
            
            // Example: Could trigger debug UI changes, logging level changes, etc.
            // Could also notify other systems that debug mode changed
        });
        
        // Listen for entity movement events to trigger tire tracks
        GameEvents.on(EVENT_TYPES.ENTITY_MOVED, (event: EntityMovedEvent) => {
            // Add tire tracks for all moving entities
            const vehicleType = event.entityType === 'player' ? 'player' : 'bandit';
            this.tireTrackSystem.addTracks(event.entityId, event.position, event.angle, event.speed, vehicleType);
        });
        
        // Listen for speed threshold events to trigger dust particles
        GameEvents.on(EVENT_TYPES.SPEED_THRESHOLD_REACHED, (event: SpeedThresholdReachedEvent) => {
            // Create dust particles for fast-moving entities
            const particleCount = event.entityType === 'player' ? 2 : 1;
            this.particleSystem.createDustParticles(event.dustPosition, event.velocity, particleCount);
            
            console.log(`💨 ${event.entityType} reached speed threshold ${event.threshold} at ${event.speed.toFixed(1)} speed`);
        });
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
                this.enemyManager.setEnemySprite('water_bandit', banditSprite);
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
            const previousMode = this.debugRenderer.isDebugEnabled();
            this.debugRenderer.toggle();
            const newMode = this.debugRenderer.isDebugEnabled();
            
            // Emit debug mode toggle event
            GameEvents.emit(EVENT_TYPES.DEBUG_MODE_TOGGLED, {
                enabled: newMode,
                timestamp: performance.now(),
                previousMode: previousMode
            } as DebugModeToggledEvent);
        }
        
        // Update vehicle
        this.vehicle.update(deltaTime, this.inputManager, this.desertWorld);
        
        // Update camera to follow vehicle
        this.camera.update(this.vehicle);
        
                // Update game entities
        this.enemyManager.update(deltaTime);
        
        // Vehicle radius for all collision checks
        const vehicleRadius = 12;
        
        // Check collision between player and enemies
        const collidedEnemies = this.enemyManager.checkPlayerCollisions(this.vehicle.position, vehicleRadius);
        for (const enemy of collidedEnemies) {
            // Destroy the enemy - effects will be triggered via events
            this.enemyManager.destroyEnemy(enemy);
        }
        
        // Emit entity movement events
        GameEvents.emit(EVENT_TYPES.ENTITY_MOVED, {
            entityId: 'player',
            entityType: 'player',
            position: this.vehicle.position,
            angle: this.vehicle.angle,
            speed: this.vehicle.speed,
            velocity: this.vehicle.velocity
        } as EntityMovedEvent);
        
        // Emit speed threshold events for player
        if (this.vehicle.speed > GAME_CONFIG.EFFECTS.PARTICLES.DUST_SPEED_THRESHOLD) {
            const backOffset = new Vector2D(-Math.cos(this.vehicle.angle), -Math.sin(this.vehicle.angle)).multiply(15);
            const dustPosition = this.vehicle.position.add(backOffset);
            
            GameEvents.emit(EVENT_TYPES.SPEED_THRESHOLD_REACHED, {
                entityId: 'player',
                entityType: 'player',
                position: this.vehicle.position,
                angle: this.vehicle.angle,
                speed: this.vehicle.speed,
                velocity: this.vehicle.velocity,
                threshold: GAME_CONFIG.EFFECTS.PARTICLES.DUST_SPEED_THRESHOLD,
                dustPosition: dustPosition
            } as SpeedThresholdReachedEvent);
        }
        
        // Emit movement events for enemies
        const activeEnemies = this.enemyManager.getActiveEnemies('water_bandit');
        activeEnemies.forEach((enemy, index) => {
            // Emit entity movement event
            GameEvents.emit(EVENT_TYPES.ENTITY_MOVED, {
                entityId: `enemy_${index}`,
                entityType: 'enemy',
                position: enemy.position,
                angle: enemy.angle,
                speed: enemy.speed,
                velocity: enemy.velocity
            } as EntityMovedEvent);
            
            // Emit speed threshold event for enemies moving fast
            if (enemy.speed > GAME_CONFIG.EFFECTS.PARTICLES.DUST_SPEED_THRESHOLD) {
                const backOffset = new Vector2D(-Math.cos(enemy.angle), -Math.sin(enemy.angle)).multiply(12);
                const dustPosition = enemy.position.add(backOffset);
                
                GameEvents.emit(EVENT_TYPES.SPEED_THRESHOLD_REACHED, {
                    entityId: `enemy_${index}`,
                    entityType: 'enemy',
                    position: enemy.position,
                    angle: enemy.angle,
                    speed: enemy.speed,
                    velocity: enemy.velocity,
                    threshold: GAME_CONFIG.EFFECTS.PARTICLES.DUST_SPEED_THRESHOLD,
                    dustPosition: dustPosition
                } as SpeedThresholdReachedEvent);
            }
        });
        
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
            this.enemyManager.getActiveEnemies('water_bandit'),
            this.desertWorld.getWaterObstacles(),
            this.vehicle,
            this.camera.position.x,
            this.camera.position.y,
            this.canvas.width,
            this.canvas.height
        );
        
        // Render bandits
        this.enemyManager.render(this.ctx);
        
        // Render vehicle
        this.vehicle.render(this.ctx);
        
        // Render particles (on top of everything)
        this.particleSystem.render(this.ctx);
        
        // Restore context
        this.ctx.restore();
        
        // Render UI elements (debug info, etc.) - these stay on screen
        this.renderDebugInfo();
        
        // Render debug UI overlays (not affected by camera)
        this.debugRenderer.renderUIDebug(this.ctx, this.enemyManager.getActiveEnemies('water_bandit'), this.vehicle);
    }

    private renderDebugInfo(): void {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        
        // Only show useful gameplay info
        const banditStats = this.enemyManager.getStats();
        this.ctx.fillText(`Water Bandits: ${banditStats.active} active`, 10, 30);
    }
}
