/**
 * Unified Physics System
 * 
 * Extracted from Vehicle.ts to provide consistent physics simulation
 * for all entities in the game. Handles collision detection, terrain
 * effects, and movement physics.
 */

import { Vector2D } from '../utils/Vector2D';
import { DesertWorld } from '../world/DesertWorld';
import { GAME_CONFIG } from '../config/GameConfig';
import { GameEvents } from '../events/GameEvents';
import { EVENT_TYPES, PlayerWaterCollisionEvent, EnemyWaterCollisionEvent } from '../events/EventTypes';

export interface PhysicsEntity {
  position: Vector2D;
  velocity: Vector2D;
  speed: number;
  angle: number;
  getWidth(): number;
  getHeight(): number;
  
  // Entity type for upstream event filtering
  readonly entityType: 'player' | 'enemy';
}

export interface PhysicsConfig {
  maxSpeed: number;
  bounceDistance: number;
  bounceFactor: number;
  terrainFrictionMultiplier: number;
  minSpeedMultiplier: number;
  minReverseSpeedMultiplier: number;
  radiusMultiplier: number;
}

export class PhysicsSystem {
  /**
   * Update an entity's physics including collision detection and terrain effects
   */
  static updateEntityPhysics(
    entity: PhysicsEntity, 
    deltaTime: number, 
    world: DesertWorld, 
    config: PhysicsConfig
  ): void {
    // Convert speed and angle to velocity vector
    entity.velocity = Vector2D.fromAngle(entity.angle, entity.speed);
    
    // Calculate new position
    const newPosition = entity.position.add(entity.velocity.multiply(deltaTime));
    
    // Check for collisions
    const entityRadius = Math.max(entity.getWidth(), entity.getHeight()) * config.radiusMultiplier;
    
    // Check rock collisions (solid obstacles)
    const rockCollision = world.checkRockCollision(newPosition, entityRadius);
    if (rockCollision) {
      this.handleSolidCollision(entity, rockCollision.position, config);
      return;
    }
    
    // Check water collisions (solid obstacles)
    const waterCollision = world.checkWaterCollision(newPosition, entityRadius);
    if (waterCollision) {
      // Calculate collision data once
      const collisionVector = entity.position.subtract(waterCollision.position);
      const collisionNormal = collisionVector.normalize();
      const overlap = entityRadius + waterCollision.radius - collisionVector.length();
      
      // Upstream filtering: emit specific events based on entity type
      if (entity.entityType === 'player') {
        GameEvents.emit(EVENT_TYPES.PLAYER_WATER_COLLISION, {
          waterObstacle: {
            position: waterCollision.position,
            radius: waterCollision.radius
          },
          playerPosition: entity.position,
          playerVelocity: entity.velocity,
          collisionPoint: entity.position,
          collisionVector: collisionVector,
          collisionNormal: collisionNormal,
          overlap: overlap
        } as PlayerWaterCollisionEvent);
      } else if (entity.entityType === 'enemy') {
        GameEvents.emit(EVENT_TYPES.ENEMY_WATER_COLLISION, {
          enemy: entity as any, // Cast needed since PhysicsEntity doesn't extend BaseEntity
          waterObstacle: {
            position: waterCollision.position,
            radius: waterCollision.radius
          },
          enemyPosition: entity.position,
          enemyVelocity: entity.velocity,
          collisionPoint: entity.position,
          collisionVector: collisionVector,
          collisionNormal: collisionNormal,
          overlap: overlap
        } as EnemyWaterCollisionEvent);
      }
      
      this.handleSolidCollision(entity, waterCollision.position, config);
      return;
    }
    
    // Update position if no collisions
    entity.position = newPosition;
    
    // Apply terrain friction effects AFTER movement
    this.applyTerrainEffects(entity, world, config, deltaTime);
  }
  
  /**
   * Handle collision with solid obstacles (rocks, water)
   */
  private static handleSolidCollision(
    entity: PhysicsEntity, 
    obstaclePosition: Vector2D, 
    config: PhysicsConfig
  ): void {
    // Collision with solid obstacle - don't move, just bounce back slightly
    const bounceDirection = entity.position.subtract(obstaclePosition).normalize();
    entity.position = entity.position.add(bounceDirection.multiply(config.bounceDistance));
    entity.speed *= config.bounceFactor;
  }
  
  /**
   * Apply terrain friction effects (sand, cactus, etc.)
   */
  private static applyTerrainEffects(
    entity: PhysicsEntity,
    world: DesertWorld,
    config: PhysicsConfig,
    deltaTime: number
  ): void {
    const terrainEffect = world.getTerrainEffect(entity.position);
    if (terrainEffect < 1.0) {
      // Apply additional friction based on terrain type
      const additionalFriction = (1.0 - terrainEffect) * config.terrainFrictionMultiplier;
      
      // Apply terrain friction with minimum speed floor
      if (entity.speed > 0) {
        const newSpeed = entity.speed - additionalFriction * deltaTime;
        const minSpeed = config.maxSpeed * config.minSpeedMultiplier;
        entity.speed = Math.max(minSpeed, newSpeed);
      } else if (entity.speed < 0) {
        const newSpeed = entity.speed + additionalFriction * deltaTime;
        const minReverseSpeed = -config.maxSpeed * config.minReverseSpeedMultiplier;
        entity.speed = Math.min(minReverseSpeed, newSpeed);
      }
      
      // Debug output for terrain effects
      if (additionalFriction > 0 && Math.random() < GAME_CONFIG.DEBUG.TERRAIN_LOG_FREQUENCY) {
        console.log(`Terrain effect: ${terrainEffect.toFixed(2)}, Additional friction: ${additionalFriction.toFixed(0)}, Speed: ${entity.speed.toFixed(1)}`);
      }
    }
  }
  
  /**
   * Create physics config from game config for a specific entity type
   */
  static createVehicleConfig(): PhysicsConfig {
    return {
      maxSpeed: GAME_CONFIG.VEHICLE.MAX_SPEED,
      bounceDistance: GAME_CONFIG.VEHICLE.BOUNCE_DISTANCE,
      bounceFactor: GAME_CONFIG.VEHICLE.BOUNCE_FACTOR,
      terrainFrictionMultiplier: GAME_CONFIG.VEHICLE.TERRAIN_FRICTION_MULTIPLIER,
      minSpeedMultiplier: GAME_CONFIG.VEHICLE.MIN_SPEED_MULTIPLIER,
      minReverseSpeedMultiplier: GAME_CONFIG.VEHICLE.MIN_REVERSE_SPEED_MULTIPLIER,
      radiusMultiplier: GAME_CONFIG.PHYSICS.VEHICLE_RADIUS_MULTIPLIER
    };
  }
  
  /**
   * Create physics config for enemy entities from their entity definition
   */
  static createEnemyConfig(enemyConfig: any): PhysicsConfig {
    return {
      maxSpeed: enemyConfig.maxSpeed,
      bounceDistance: GAME_CONFIG.VEHICLE.BOUNCE_DISTANCE, // Reuse vehicle bounce settings
      bounceFactor: GAME_CONFIG.VEHICLE.BOUNCE_FACTOR,
      terrainFrictionMultiplier: GAME_CONFIG.VEHICLE.TERRAIN_FRICTION_MULTIPLIER,
      minSpeedMultiplier: GAME_CONFIG.VEHICLE.MIN_SPEED_MULTIPLIER,
      minReverseSpeedMultiplier: GAME_CONFIG.VEHICLE.MIN_REVERSE_SPEED_MULTIPLIER,
      radiusMultiplier: enemyConfig.collisionRadiusMultiplier
    };
  }
  
  /**
   * Check collision between two entities
   */
  static checkEntityCollision(
    entity1: PhysicsEntity,
    entity2: PhysicsEntity,
    radius1Multiplier: number = 0.5,
    radius2Multiplier: number = 0.5
  ): boolean {
    const distance = entity1.position.subtract(entity2.position).length();
    const radius1 = Math.max(entity1.getWidth(), entity1.getHeight()) * radius1Multiplier;
    const radius2 = Math.max(entity2.getWidth(), entity2.getHeight()) * radius2Multiplier;
    
    return distance < (radius1 + radius2);
  }
}
