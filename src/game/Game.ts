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
import { EVENT_TYPES, EnemyDestroyedEvent, PlayerWaterCollisionEvent, PlayerRockCollisionEvent, DebugModeToggledEvent, EntityMovedEvent, SpeedThresholdReachedEvent } from '../events/EventTypes';
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
    private banditKills: number = 0; // Track bandit eliminations for hunter spawning

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
        GameEvents.on(EVENT_TYPES.ENEMY_WATER_COLLISION, () => {
            // Different effects for enemies hitting water
            // Could trigger AI behavior changes, different particles, etc.
        });
        
        // Listen for player rock collisions
        GameEvents.on(EVENT_TYPES.PLAYER_ROCK_COLLISION, (event: PlayerRockCollisionEvent) => {
            // Create rock collision effects
            // Could be different from water - sparks, different particles, different shake intensity
            this.screenShake.shake(GAME_CONFIG.EFFECTS.SCREEN_SHAKE.COLLISION_INTENSITY, 0.25); // Slightly different from water collision
            
            console.log(`🪨 Player hit rock at ${event.rockObstacle.position.x}, ${event.rockObstacle.position.y}! Could add sparks, metal scraping sounds, vehicle damage, etc.`);
        });
        
        // Listen for enemy rock collisions (separate from player)
        GameEvents.on(EVENT_TYPES.ENEMY_ROCK_COLLISION, () => {
            // Different effects for enemies hitting rocks
            // Could trigger different AI responses, less dramatic effects
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
            let vehicleType: 'player' | 'bandit' | 'hunter' = 'bandit'; // default
            if (event.entityType === 'player') {
                vehicleType = 'player';
            } else if (event.entityId.startsWith('hunter_')) {
                vehicleType = 'hunter'; // Different track color for hunters
            }
            this.tireTrackSystem.addTracks(event.entityId, event.position, event.angle, event.speed, vehicleType);
        });
        
        // Listen for speed threshold events to trigger dust particles
        GameEvents.on(EVENT_TYPES.SPEED_THRESHOLD_REACHED, (event: SpeedThresholdReachedEvent) => {
            // Create dust particles for fast-moving entities
            const particleCount = event.entityType === 'player' ? 2 : 1;
            this.particleSystem.createDustParticles(event.dustPosition, event.velocity, particleCount);
        });
    }

    private async loadAssets(): Promise<void> {
        try {
            await this.assetManager.loadAllAssets();
            
            // Set up entity sprites
            this.setupEntitySprites();
            
            // Set up world sprites
            this.setupWorldSprites();
            
            this.assetsLoaded = true;
            console.log('Assets loaded successfully!');
        } catch (error) {
            console.error('Failed to load assets:', error);
            // Game will fall back to rectangle rendering
            this.assetsLoaded = false;
        }
    }
    
    /**
     * Set up sprites for all entities - DRY asset loading
     */
    private setupEntitySprites(): void {
        // Entity sprite configurations
        const spriteConfigs = [
            { entityId: 'player', imageName: 'car_yellow', target: this.vehicle },
            { entityId: 'water_bandit', imageName: 'car_blue', target: this.enemyManager },
            { entityId: 'hunter_motorcycle', imageName: 'car_red', target: this.enemyManager }
        ];
        
        spriteConfigs.forEach(config => {
            const image = this.assetManager.getImage(config.imageName);
            if (image) {
                const sprite = new CarSprite(image);
                if (config.entityId === 'player') {
                    this.vehicle.setSprite(sprite);
                } else {
                    this.enemyManager.setEnemySprite(config.entityId, sprite);
                }
            }
        });
    }
    
    /**
     * Set up world environment sprites
     */
    private setupWorldSprites(): void {
        const desertDetailsImage = this.assetManager.getImage('desert_details');
        const waterTilesImage = this.assetManager.getImage('water_tiles');
        
        if (desertDetailsImage && waterTilesImage) {
            const desertSprite = new DesertSprite();
            desertSprite.setDesertDetailsImage(desertDetailsImage);
            desertSprite.setWaterImage(waterTilesImage);
            this.desertWorld.setDesertSprite(desertSprite);
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
        
        // Handle hunter spawn for testing
        if (this.inputManager.isHunterSpawnPressed()) {
            this.enemyManager.spawnHunterNearPlayer(this.vehicle.position);
        }
        
        // Update vehicle
        this.vehicle.update(deltaTime, this.inputManager, this.desertWorld);
        
        // Update camera to follow vehicle
        this.camera.update(this.vehicle);
        
                // Update game entities
        this.enemyManager.update(deltaTime);
        
        // Update hunter targets to player position
        this.updateHunterTargets();
        
        // Vehicle radius for all collision checks
        const vehicleRadius = 12;
        
        // Check collision between player and enemies with directional detection
        const collidedEnemies = this.enemyManager.checkPlayerCollisions(this.vehicle.position, vehicleRadius);
        for (const enemy of collidedEnemies) {
            // Determine collision direction based on vehicle fronts
            const playerKillsEnemy = this.determineCollisionWinner(this.vehicle, enemy);
            
            if (playerKillsEnemy) {
                // Player's front hit enemy - destroy enemy
                this.enemyManager.destroyEnemy(enemy);
                this.banditKills++;
                console.log(`🎯 Enemy destroyed! Total kills: ${this.banditKills}`);
            } else {
                // Enemy's front hit player - player dies
                this.handlePlayerDeath();
                return; // Exit update loop since game is resetting
            }
        }
        
        // Emit entity movement events
        this.emitEntityMovementEvents();
        
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
        
        // Dynamic entity counts - automatically includes any registered entity types
        const entityStats = this.enemyManager.getStats();
        let lineY = 30;
        
        // Show counts for each entity type
        Object.entries(entityStats.byType).forEach(([entityType, stats]) => {
            const displayName = this.getEntityDisplayName(entityType);
            this.ctx.fillText(`${displayName}: ${stats.active} active`, 10, lineY);
            lineY += 20;
        });
        
        // Show kill counter
        this.ctx.fillText(`Enemy Kills: ${this.banditKills}`, 10, lineY);
    }
    
    /**
     * Get user-friendly display name for entity types
     */
    private getEntityDisplayName(entityType: string): string {
        const displayNames: Record<string, string> = {
            'water_bandit': 'Water Bandits',
            'hunter_motorcycle': 'Hunters',
            'raider': 'Raiders'
        };
        return displayNames[entityType] || entityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    /**
     * Update all hunter targets to player position for chasing behavior
     */
    private updateHunterTargets(): void {
        const hunters = this.enemyManager.getActiveEnemies('hunter_motorcycle');
        for (const hunter of hunters) {
            // Update chasing behavior target to player position
            // Cast to WaterBanditEntity to access behavior property
            const hunterEntity = hunter as any;
            if (hunterEntity.behavior && typeof hunterEntity.behavior.setTarget === 'function') {
                hunterEntity.behavior.setTarget(hunter, this.vehicle.position);
            }
        }
    }
    
    /**
     * Determine collision winner based on vehicle front positions
     * Returns true if player kills enemy, false if enemy kills player
     */
    private determineCollisionWinner(player: any, enemy: any): boolean {
        // Calculate front positions based on vehicle angles
        const playerFrontOffset = 15; // Distance from center to front
        const enemyFrontOffset = 15;
        
        const playerFront = new Vector2D(
            player.position.x + Math.cos(player.angle) * playerFrontOffset,
            player.position.y + Math.sin(player.angle) * playerFrontOffset
        );
        
        const enemyFront = new Vector2D(
            enemy.position.x + Math.cos(enemy.angle) * enemyFrontOffset,
            enemy.position.y + Math.sin(enemy.angle) * enemyFrontOffset
        );
        
        // Check if player's front is closer to enemy center than enemy's front is to player center
        const playerFrontToEnemyDistance = playerFront.subtract(enemy.position).length();
        const enemyFrontToPlayerDistance = enemyFront.subtract(player.position).length();
        
        // Player wins if their front is significantly closer (more aggressive collision)
        return playerFrontToEnemyDistance < enemyFrontToPlayerDistance - 5; // 5px tolerance
    }
    
    /**
     * Handle player death - reset game state
     */
    private handlePlayerDeath(): void {
        console.log('💀 GAME OVER! You were destroyed by an enemy!');
        
        // Reset player position to center
        this.vehicle.position = new Vector2D(
            this.desertWorld.worldWidth / 2,
            this.desertWorld.worldHeight / 2
        );
        this.vehicle.velocity = new Vector2D(0, 0);
        this.vehicle.speed = 0;
        this.vehicle.angle = 0;
        
        // Reset kill counter
        this.banditKills = 0;
        
        // Keep hunters active - they continue hunting after player respawn
        
        // Trigger screen shake for dramatic effect
        this.screenShake.shake(1.5, 0.5); // Strong shake for death
        
        console.log('🔄 Game reset! Try to survive longer this time!');
    }
    
    /**
     * Unified entity movement event emission - DRY principle
     */
    private emitEntityMovementEvents(): void {
        // Emit player movement events
        this.emitMovementEventsForEntity(
            this.vehicle, 
            'player', 
            'player', 
            15 // backOffset multiplier
        );
        
        // Emit bandit movement events  
        const activeBandits = this.enemyManager.getActiveEnemies('water_bandit');
        activeBandits.forEach((bandit, index) => {
            this.emitMovementEventsForEntity(
                bandit, 
                `bandit_${index}`, 
                'enemy', 
                12 // backOffset multiplier
            );
        });
        
        // Emit hunter movement events
        const activeHunters = this.enemyManager.getActiveEnemies('hunter_motorcycle');
        activeHunters.forEach((hunter, index) => {
            this.emitMovementEventsForEntity(
                hunter, 
                `hunter_${index}`, 
                'enemy', 
                12 // backOffset multiplier
            );
        });
    }
    
    /**
     * Emit movement and dust events for a single entity - eliminates code duplication
     */
    private emitMovementEventsForEntity(
        entity: any, 
        entityId: string, 
        entityType: 'player' | 'enemy', 
        dustBackOffsetMultiplier: number
    ): void {
        // Emit entity movement event
        GameEvents.emit(EVENT_TYPES.ENTITY_MOVED, {
            entityId,
            entityType,
            position: entity.position,
            angle: entity.angle,
            speed: entity.speed,
            velocity: entity.velocity
        } as EntityMovedEvent);
        
        // Emit speed threshold event if moving fast enough
        if (entity.speed > GAME_CONFIG.EFFECTS.PARTICLES.DUST_SPEED_THRESHOLD) {
            const backOffset = new Vector2D(-Math.cos(entity.angle), -Math.sin(entity.angle))
                .multiply(dustBackOffsetMultiplier);
            const dustPosition = entity.position.add(backOffset);
            
            GameEvents.emit(EVENT_TYPES.SPEED_THRESHOLD_REACHED, {
                entityId,
                entityType,
                position: entity.position,
                angle: entity.angle,
                speed: entity.speed,
                velocity: entity.velocity,
                threshold: GAME_CONFIG.EFFECTS.PARTICLES.DUST_SPEED_THRESHOLD,
                dustPosition: dustPosition
            } as SpeedThresholdReachedEvent);
        }
    }
}
