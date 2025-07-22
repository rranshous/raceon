/**
 * Event Type Definitions
 * 
 * Centralized definitions for all game events with their data structures.
 * This ensures type safety and makes the event system self-documenting.
 */

import { Vector2D } from '../utils/Vector2D';
import { BaseEntity } from '../entities/EntityRegistry';

// Event names as constants to avoid typos
export const EVENT_TYPES = {
  // Entity events
  ENEMY_SPAWNED: 'enemy:spawned',
  ENEMY_DESTROYED: 'enemy:destroyed',
  ENEMY_ESCAPED: 'enemy:escaped',
  
  // Player collision events
  PLAYER_ENEMY_COLLISION: 'collision:player_enemy',
  PLAYER_WATER_COLLISION: 'collision:player_water',
  PLAYER_ROCK_COLLISION: 'collision:player_rock',
  
  // Enemy collision events (for AI behavior, different effects)
  ENEMY_WATER_COLLISION: 'collision:enemy_water',
  ENEMY_ROCK_COLLISION: 'collision:enemy_rock',
  
  // Movement events
  ENTITY_MOVED: 'movement:entity_moved',
  SPEED_THRESHOLD_REACHED: 'movement:speed_threshold_reached',
  
  // Game state events
  GAME_STARTED: 'game:started',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',
  DEBUG_MODE_TOGGLED: 'debug:mode_toggled',
} as const;

// Event data interfaces
export interface EnemySpawnedEvent {
  enemy: BaseEntity;
  position: Vector2D;
  enemyType: string;
}

export interface EnemyDestroyedEvent {
  enemy: BaseEntity;
  position: Vector2D;
  velocity: Vector2D;
  enemyType: string;
  destroyedBy: 'player' | 'environment';
}

export interface EnemyEscapedEvent {
  enemy: BaseEntity;
  position: Vector2D;
  enemyType: string;
}

export interface PlayerEnemyCollisionEvent {
  enemy: BaseEntity;
  playerPosition: Vector2D;
  playerVelocity: Vector2D;
  collisionPoint: Vector2D;
}

export interface PlayerWaterCollisionEvent {
  waterObstacle: {
    position: Vector2D;
    radius: number;
  };
  playerPosition: Vector2D;
  playerVelocity: Vector2D;
  collisionPoint: Vector2D;
  collisionVector: Vector2D;
  collisionNormal: Vector2D;
  overlap: number;
}

export interface PlayerRockCollisionEvent {
  rockObstacle: {
    position: Vector2D;
    radius: number;
  };
  playerPosition: Vector2D;
  playerVelocity: Vector2D;
  collisionPoint: Vector2D;
  collisionVector: Vector2D;
  collisionNormal: Vector2D;
  overlap: number;
}

export interface EnemyWaterCollisionEvent {
  enemy: BaseEntity;
  waterObstacle: {
    position: Vector2D;
    radius: number;
  };
  enemyPosition: Vector2D;
  enemyVelocity: Vector2D;
  collisionPoint: Vector2D;
  collisionVector: Vector2D;
  collisionNormal: Vector2D;
  overlap: number;
}

export interface EnemyRockCollisionEvent {
  enemy: BaseEntity;
  rockObstacle: {
    position: Vector2D;
    radius: number;
  };
  enemyPosition: Vector2D;
  enemyVelocity: Vector2D;
  collisionPoint: Vector2D;
  collisionVector: Vector2D;
  collisionNormal: Vector2D;
  overlap: number;
}

export interface GameStateEvent {
  timestamp: number;
  previousState?: string;
  newState: string;
}

export interface DebugModeToggledEvent {
  enabled: boolean;
  timestamp: number;
  previousMode: boolean;
}

export interface EntityMovedEvent {
  entityId: string;
  entityType: 'player' | 'enemy';
  position: Vector2D;
  angle: number;
  speed: number;
  velocity: Vector2D;
}

export interface SpeedThresholdReachedEvent {
  entityId: string;
  entityType: 'player' | 'enemy';
  position: Vector2D;
  angle: number;
  speed: number;
  velocity: Vector2D;
  threshold: number;
  dustPosition: Vector2D; // Pre-calculated position behind the entity
}

// Union type of all event data
export type GameEventData = 
  | EnemySpawnedEvent
  | EnemyDestroyedEvent
  | EnemyEscapedEvent
  | PlayerEnemyCollisionEvent
  | PlayerWaterCollisionEvent
  | PlayerRockCollisionEvent
  | EnemyWaterCollisionEvent
  | EnemyRockCollisionEvent
  | GameStateEvent
  | DebugModeToggledEvent
  | EntityMovedEvent
  | SpeedThresholdReachedEvent;
