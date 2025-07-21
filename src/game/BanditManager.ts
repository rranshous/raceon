import { WaterBandit } from '../entities/WaterBandit';
import { Vector2D } from '../utils/Vector2D';
import { WaterObstacle } from '../world/DesertWorld';
import { CarSprite } from '../graphics/CarSprite';
import { DesertWorld } from '../world/DesertWorld';
import { GAME_CONFIG } from '../config/GameConfig';

export class BanditManager {
    private bandits: WaterBandit[] = [];
    private banditSprite: CarSprite | null = null;
    private worldWidth: number;
    private worldHeight: number;
    private waterObstacles: WaterObstacle[];
    private desertWorld: DesertWorld;
    
    // Spawning parameters (from config)
    private spawnTimer: number = 0;
    private spawnInterval: number = GAME_CONFIG.ENEMIES.WATER_BANDIT.SPAWN_INTERVAL;
    private maxBandits: number = GAME_CONFIG.ENEMIES.WATER_BANDIT.MAX_ACTIVE;
    
    constructor(worldWidth: number, worldHeight: number, waterObstacles: WaterObstacle[], desertWorld: DesertWorld) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.waterObstacles = waterObstacles;
        this.desertWorld = desertWorld;
    }
    
    setBanditSprite(sprite: CarSprite): void {
        this.banditSprite = sprite;
        
        // Apply sprite to existing bandits
        for (const bandit of this.bandits) {
            bandit.setSprite(sprite);
        }
    }
    
    update(deltaTime: number): void {
        // Update spawn timer
        this.spawnTimer += deltaTime;
        
        // Spawn new bandit if it's time and we haven't reached max
        if (this.spawnTimer >= this.spawnInterval && this.getActiveBandits().length < this.maxBandits) {
            this.spawnBandit();
            this.spawnTimer = 0;
        }
        
        // Update all bandits
        for (const bandit of this.bandits) {
            bandit.update(deltaTime);
            
            // Check water collisions for each bandit - reduced sensitivity
            const banditRadius = Math.max(bandit.width, bandit.height) * GAME_CONFIG.ENEMIES.WATER_BANDIT.COLLISION_RADIUS_MULTIPLIER;
            const waterCollision = this.desertWorld.checkWaterCollision(bandit.position, banditRadius);
            if (waterCollision) {
                bandit.handleWaterCollision(waterCollision, deltaTime);
            }
            
            // Keep bandit within world bounds
            bandit.clampToWorldBounds(this.worldWidth, this.worldHeight);
        }
        
        // Remove bandits that have escaped or been destroyed
        this.bandits = this.bandits.filter(bandit => {
            if (!bandit.isAlive) {
                return false; // Remove destroyed bandits
            }
            
            if (bandit.hasEscaped(this.worldWidth, this.worldHeight)) {
                console.log('A bandit escaped with the water! 💧😱');
                return false; // Remove escaped bandits
            }
            
            return true;
        });
    }
    
    private spawnBandit(): void {
        if (this.waterObstacles.length === 0) return;
        
        // Pick a random water hole to spawn near
        const waterHole = this.waterObstacles[Math.floor(Math.random() * this.waterObstacles.length)];
        
        // Spawn bandit near the water hole (slightly offset)
        const spawnOffset = GAME_CONFIG.ENEMIES.WATER_BANDIT.SPAWN_DISTANCE_MIN + 
                           Math.random() * (GAME_CONFIG.ENEMIES.WATER_BANDIT.SPAWN_DISTANCE_MAX - GAME_CONFIG.ENEMIES.WATER_BANDIT.SPAWN_DISTANCE_MIN);
        const spawnAngle = Math.random() * Math.PI * 2;
        const spawnPosition = new Vector2D(
            waterHole.position.x + Math.cos(spawnAngle) * spawnOffset,
            waterHole.position.y + Math.sin(spawnAngle) * spawnOffset
        );
        
        // Choose a random edge of the map as escape target
        const escapeTarget = this.getRandomEscapeTarget();
        
        // Create the bandit
        const bandit = new WaterBandit(spawnPosition, escapeTarget);
        
        // Set sprite if available
        if (this.banditSprite) {
            bandit.setSprite(this.banditSprite);
        }
        
        this.bandits.push(bandit);
        console.log(`Water bandit spotted at water hole! They're heading for the edge! 🚗💨`);
    }
    
    private getRandomEscapeTarget(): Vector2D {
        // Choose a random edge of the map
        const edge = Math.floor(Math.random() * 4);
        
        switch (edge) {
            case 0: // Top edge
                return new Vector2D(Math.random() * this.worldWidth, 0);
            case 1: // Right edge
                return new Vector2D(this.worldWidth, Math.random() * this.worldHeight);
            case 2: // Bottom edge
                return new Vector2D(Math.random() * this.worldWidth, this.worldHeight);
            case 3: // Left edge
                return new Vector2D(0, Math.random() * this.worldHeight);
            default:
                return new Vector2D(0, 0);
        }
    }
    
    // Check collisions between player and all bandits
    checkPlayerCollisions(playerPosition: Vector2D, playerRadius: number): WaterBandit[] {
        const collidedBandits: WaterBandit[] = [];
        
        for (const bandit of this.bandits) {
            if (bandit.checkCollisionWithPlayer(playerPosition, playerRadius)) {
                collidedBandits.push(bandit);
            }
        }
        
        return collidedBandits;
    }
    
    // Destroy a bandit (called when player rams them)
    destroyBandit(bandit: WaterBandit): void {
        bandit.destroy();
        console.log('Justice served! Bandit destroyed! 💥⚖️');
    }
    
    // Get count of active (alive) bandits
    getActiveBandits(): WaterBandit[] {
        return this.bandits.filter(bandit => bandit.isAlive);
    }
    
    // Get all bandits for debug purposes
    getAllBandits(): WaterBandit[] {
        return this.bandits;
    }
    
    // Render all bandits
    render(ctx: CanvasRenderingContext2D): void {
        for (const bandit of this.bandits) {
            bandit.render(ctx);
        }
    }
    
    // Get stats for debugging
    getStats(): { active: number, total: number } {
        return {
            active: this.getActiveBandits().length,
            total: this.bandits.length
        };
    }
}
