/**
 * Enemy Manager
 * 
 * Generic enemy management system that works with the entity registry.
 * Replaces the specific BanditManager with a flexible system that can
 * spawn and manage different enemy types.
 */

import { Vector2D } from '../utils/Vector2D';
import { WaterObstacle } from '../world/DesertWorld';
import { CarSprite } from '../graphics/CarSprite';
import { DesertWorld } from '../world/DesertWorld';
import { BaseEntity, EntityFactory, EntityRegistry } from '../entities/EntityRegistry';
import { GameEvents } from '../events/GameEvents';
import { EVENT_TYPES, EnemySpawnedEvent, EnemyDestroyedEvent, EnemyEscapedEvent } from '../events/EventTypes';

interface EnemyTypeManager {
  entityId: string;
  sprite: CarSprite | null;
  spawnTimer: number;
  enemies: BaseEntity[];
}

export class EnemyManager {
  private enemyTypes = new Map<string, EnemyTypeManager>();
  private worldWidth: number;
  private worldHeight: number;
  private waterObstacles: WaterObstacle[];
  private desertWorld: DesertWorld;
  
  constructor(worldWidth: number, worldHeight: number, waterObstacles: WaterObstacle[], desertWorld: DesertWorld) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.waterObstacles = waterObstacles;
    this.desertWorld = desertWorld;
    
    // Initialize with registered enemy types
    this.initializeEnemyTypes();
  }
  
  private initializeEnemyTypes(): void {
    // Register all available enemy types from the entity registry
    const allEntityTypes = EntityRegistry.getAll();
    
    for (const entityDef of allEntityTypes) {
      this.enemyTypes.set(entityDef.id, {
        entityId: entityDef.id,
        sprite: null,
        spawnTimer: 0,
        enemies: []
      });
      
      console.log(`Enemy manager initialized for entity type: ${entityDef.id}`);
    }
  }
  
  /**
   * Set sprite for a specific enemy type
   */
  setEnemySprite(entityId: string, sprite: CarSprite): void {
    const manager = this.enemyTypes.get(entityId);
    if (!manager) {
      console.error(`Enemy type not found: ${entityId}`);
      return;
    }
    
    manager.sprite = sprite;
    
    // Apply sprite to existing enemies of this type
    for (const enemy of manager.enemies) {
      enemy.setSprite(sprite);
    }
  }
  
  update(deltaTime: number): void {
    // Update each enemy type
    for (const [entityId, manager] of this.enemyTypes.entries()) {
      this.updateEnemyType(entityId, manager, deltaTime);
    }
  }
  
  private updateEnemyType(entityId: string, manager: EnemyTypeManager, deltaTime: number): void {
    const entityDef = EntityRegistry.get(entityId);
    if (!entityDef) return;
    
    // Update spawn timer
    manager.spawnTimer += deltaTime;
    
    // Spawn new enemy if it's time and we haven't reached max
    if (manager.spawnTimer >= entityDef.spawnInterval && 
        this.getActiveEnemies(entityId).length < entityDef.maxActive) {
      this.spawnEnemy(entityId);
      manager.spawnTimer = 0;
    }
    
    // Update all enemies of this type
    for (const enemy of manager.enemies) {
      enemy.update(deltaTime, this.desertWorld);
    }
    
    // Remove enemies that have escaped or been destroyed
    manager.enemies = manager.enemies.filter(enemy => {
      if (!enemy.getIsAlive()) {
        return false; // Remove destroyed enemies
      }
      
      // Check if enemy has escaped (if it has the method)
      if ('hasEscaped' in enemy) {
        if ((enemy as any).hasEscaped(this.worldWidth, this.worldHeight)) {
          // Emit escape event instead of just logging
          GameEvents.emit(EVENT_TYPES.ENEMY_ESCAPED, {
            enemy,
            position: enemy.getPosition(),
            enemyType: entityDef.id
          } as EnemyEscapedEvent);
          
          console.log(`A ${entityDef.name} escaped! 💧😱`);
          return false; // Remove escaped enemies
        }
      }
      
      return true;
    });
  }
  
  private spawnEnemy(entityId: string): void {
    if (this.waterObstacles.length === 0) return;
    
    const entityDef = EntityRegistry.get(entityId);
    if (!entityDef) return;
    
    const manager = this.enemyTypes.get(entityId);
    if (!manager) return;
    
    // Pick a random water hole to spawn near
    const waterHole = this.waterObstacles[Math.floor(Math.random() * this.waterObstacles.length)];
    
    // Spawn enemy near the water hole (slightly offset)
    const spawnOffset = entityDef.spawnDistanceMin + 
                       Math.random() * (entityDef.spawnDistanceMax - entityDef.spawnDistanceMin);
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnPosition = new Vector2D(
      waterHole.position.x + Math.cos(spawnAngle) * spawnOffset,
      waterHole.position.y + Math.sin(spawnAngle) * spawnOffset
    );
    
    // Choose a random edge of the map as escape target
    const escapeTarget = this.getRandomEscapeTarget();
    
    // Create the enemy using the factory
    const enemy = EntityFactory.create(entityId, spawnPosition, escapeTarget);
    if (!enemy) {
      console.error(`Failed to create enemy of type: ${entityId}`);
      return;
    }
    
    // Set sprite if available
    if (manager.sprite) {
      enemy.setSprite(manager.sprite);
    }
    
    manager.enemies.push(enemy);
    
    // Emit spawn event
    GameEvents.emit(EVENT_TYPES.ENEMY_SPAWNED, {
      enemy,
      position: spawnPosition,
      enemyType: entityId
    } as EnemySpawnedEvent);
    
    console.log(`${entityDef.name} spotted at water hole! They're heading for the edge! 🚗💨`);
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
  
  /**
   * Check collisions between player and all enemies
   */
  checkPlayerCollisions(playerPosition: Vector2D, playerRadius: number): BaseEntity[] {
    const collidedEnemies: BaseEntity[] = [];
    
    for (const manager of this.enemyTypes.values()) {
      for (const enemy of manager.enemies) {
        if ('checkCollisionWithPlayer' in enemy) {
          if ((enemy as any).checkCollisionWithPlayer(playerPosition, playerRadius)) {
            collidedEnemies.push(enemy);
          }
        }
      }
    }
    
    return collidedEnemies;
  }
  
  /**
   * Destroy an enemy (called when player rams them)
   */
  destroyEnemy(enemy: BaseEntity): void {
    const entityDef = EntityRegistry.get((enemy as any).entityDefinition?.id || 'unknown');
    const name = entityDef?.name || 'Enemy';
    
    // Emit destruction event before destroying
    GameEvents.emit(EVENT_TYPES.ENEMY_DESTROYED, {
      enemy,
      position: enemy.getPosition(),
      velocity: (enemy as any).velocity || new Vector2D(0, 0),
      enemyType: entityDef?.id || 'unknown',
      destroyedBy: 'player'
    } as EnemyDestroyedEvent);
    
    enemy.destroy();
    console.log(`Justice served! ${name} destroyed! 💥⚖️`);
  }
  
  /**
   * Get count of active enemies for a specific type
   */
  getActiveEnemies(entityId: string): BaseEntity[] {
    const manager = this.enemyTypes.get(entityId);
    if (!manager) return [];
    
    return manager.enemies.filter(enemy => enemy.getIsAlive());
  }
  
  /**
   * Get all enemies for debug purposes
   */
  getAllEnemies(): BaseEntity[] {
    const allEnemies: BaseEntity[] = [];
    for (const manager of this.enemyTypes.values()) {
      allEnemies.push(...manager.enemies);
    }
    return allEnemies;
  }
  
  /**
   * Render all enemies
   */
  render(ctx: CanvasRenderingContext2D): void {
    for (const manager of this.enemyTypes.values()) {
      for (const enemy of manager.enemies) {
        enemy.render(ctx);
      }
    }
  }
  
  /**
   * Get stats for debugging
   */
  getStats(): { active: number, total: number, byType: Record<string, { active: number, total: number }> } {
    let totalActive = 0;
    let totalAll = 0;
    const byType: Record<string, { active: number, total: number }> = {};
    
    for (const [entityId, manager] of this.enemyTypes.entries()) {
      const active = manager.enemies.filter(e => e.getIsAlive()).length;
      const total = manager.enemies.length;
      
      totalActive += active;
      totalAll += total;
      byType[entityId] = { active, total };
    }
    
    return {
      active: totalActive,
      total: totalAll,
      byType
    };
  }
  
  /**
   * Spawn an enemy of a specific type for testing/debugging
   */
  spawnEnemyOfType(entityId: string, position?: Vector2D): BaseEntity | null {
    const entityDef = EntityRegistry.get(entityId);
    if (!entityDef) {
      console.error(`Entity type not found: ${entityId}`);
      return null;
    }
    
    const manager = this.enemyTypes.get(entityId);
    if (!manager) {
      console.error(`Enemy manager not found for: ${entityId}`);
      return null;
    }
    
    // Use provided position or random spawn point
    const spawnPosition = position || new Vector2D(
      Math.random() * this.worldWidth,
      Math.random() * this.worldHeight
    );
    
    const escapeTarget = this.getRandomEscapeTarget();
    const enemy = EntityFactory.create(entityId, spawnPosition, escapeTarget);
    
    if (enemy) {
      if (manager.sprite) {
        enemy.setSprite(manager.sprite);
      }
      manager.enemies.push(enemy);
      console.log(`Manually spawned ${entityDef.name} at position ${spawnPosition.x}, ${spawnPosition.y}`);
    }
    
    return enemy;
  }
}
