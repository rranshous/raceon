/**
 * Entity Registry System
 * 
 * Provides a flexible system for defining and creating different enemy types
 * without modifying core game code. New enemy types can be added by simply
 * registering their configuration and behavior.
 */

import { Vector2D } from '../utils/Vector2D';
import { CarSprite } from '../graphics/CarSprite';
import { WaterBanditEntity } from './WaterBanditEntity';

/**
 * Flexible entity definition interface
 * Allows arbitrary properties for experimentation
 */
export interface EntityDefinition {
  // Core properties
  id: string;
  name: string;
  sprite: string;           // Sprite identifier
  behavior: string;         // Behavior type identifier
  
  // Physical properties
  maxSpeed: number;
  acceleration: number;
  friction: number;
  turnSpeed: number;
  width: number;
  height: number;
  collisionRadiusMultiplier: number;
  
  // AI properties
  stuckDetectionTime: number;
  avoidanceDuration: number;
  avoidanceCooldown: number;
  wanderStrength: number;
  stuckMovementThreshold: number;
  stuckTimerDecay: number;
  minMovementSpeed: number;
  
  // Spawning properties
  spawnInterval: number;
  maxActive: number;
  spawnDistanceMin: number;
  spawnDistanceMax: number;
  
  // Allow arbitrary properties for future experimentation
  [key: string]: any;
}

/**
 * Base entity class that all enemies inherit from
 * Uses composition pattern for flexible behavior assignment
 */
export interface BaseEntity {
  position: Vector2D;
  velocity: Vector2D;
  angle: number;
  speed: number;
  sprite: CarSprite | null;
  isAlive: boolean;
  entityDefinition: EntityDefinition;
  
  // Core methods all entities must implement
  setSprite(sprite: CarSprite): void;
  update(deltaTime: number, world?: any): void; // Made world optional and any type for flexibility
  destroy(): void;
  render(ctx: CanvasRenderingContext2D): void; // Added render method
  
  // Getters for common properties
  getWidth(): number;
  getHeight(): number;
  getPosition(): Vector2D;
  getIsAlive(): boolean;
  
  // Debug information (optional, entities can provide their own implementation)
  getDebugInfo?(): Record<string, any>;
}

/**
 * Registry for managing entity definitions
 * Enables easy addition of new enemy types
 */
export class EntityRegistry {
  private static definitions = new Map<string, EntityDefinition>();
  
  /**
   * Register a new entity type
   */
  static register(definition: EntityDefinition): void {
    this.definitions.set(definition.id, definition);
    console.log(`Registered entity type: ${definition.id}`);
  }
  
  /**
   * Get entity definition by ID
   */
  static get(id: string): EntityDefinition | undefined {
    return this.definitions.get(id);
  }
  
  /**
   * Get all registered entity types
   */
  static getAll(): EntityDefinition[] {
    return Array.from(this.definitions.values());
  }
  
  /**
   * Check if entity type exists
   */
  static has(id: string): boolean {
    return this.definitions.has(id);
  }
  
  /**
   * Remove entity type (useful for testing)
   */
  static unregister(id: string): boolean {
    return this.definitions.delete(id);
  }
  
  /**
   * Clear all registrations (useful for testing)
   */
  static clear(): void {
    this.definitions.clear();
  }
  
  /**
   * Get entity types that match certain criteria
   */
  static getByBehavior(behaviorType: string): EntityDefinition[] {
    return Array.from(this.definitions.values())
      .filter(def => def.behavior === behaviorType);
  }
}

/**
 * Factory for creating entities from definitions
 */
export class EntityFactory {
  /**
   * Create an entity instance from a definition
   */
  static create(entityId: string, startPosition: Vector2D, escapeTarget: Vector2D): BaseEntity | null {
    const definition = EntityRegistry.get(entityId);
    if (!definition) {
      console.error(`Entity definition not found: ${entityId}`);
      return null;
    }
    
    // For now, we'll create the appropriate entity type based on ID
    // This can be extended to use a more sophisticated factory pattern
    switch (entityId) {
      case 'water_bandit':
      case 'raider':
      case 'hunter_motorcycle':
        // Use proper ES6 import instead of require()
        return new WaterBanditEntity(definition, startPosition, escapeTarget);
      
      default:
        console.error(`No entity class registered for: ${entityId}`);
        return null;
    }
  }
}
