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
  
  // Collision events
  PLAYER_ENEMY_COLLISION: 'collision:player_enemy',
  PLAYER_OBSTACLE_COLLISION: 'collision:player_obstacle',
  
  // Game state events
  GAME_STARTED: 'game:started',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',
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

export interface PlayerObstacleCollisionEvent {
  obstacleType: 'rock' | 'water';
  obstaclePosition: Vector2D;
  playerPosition: Vector2D;
  playerVelocity: Vector2D;
  collisionPoint: Vector2D;
}

export interface GameStateEvent {
  timestamp: number;
  previousState?: string;
  newState: string;
}

// Union type of all event data
export type GameEventData = 
  | EnemySpawnedEvent
  | EnemyDestroyedEvent
  | EnemyEscapedEvent
  | PlayerEnemyCollisionEvent
  | PlayerObstacleCollisionEvent
  | GameStateEvent;
