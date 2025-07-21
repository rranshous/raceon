/**
 * Behavior Registry System
 * 
 * Provides pluggable AI behaviors for entities. New behaviors can be
 * registered and assigned to entity types without modifying existing code.
 */

import { BaseEntity } from '../EntityRegistry';
import { DesertWorld } from '../../world/DesertWorld';

/**
 * Interface that all entity behaviors must implement
 */
export interface EntityBehavior {
  /**
   * Update the entity's state based on this behavior
   */
  update(entity: BaseEntity, deltaTime: number, world: DesertWorld): void;
  
  /**
   * Initialize any behavior-specific state when assigned to an entity
   */
  initialize?(entity: BaseEntity): void;
  
  /**
   * Clean up when behavior is removed or entity is destroyed
   */
  cleanup?(entity: BaseEntity): void;
  
  /**
   * Get debug information about this behavior's current state
   */
  getDebugInfo?(entity: BaseEntity): Record<string, any>;
}

/**
 * Registry for managing entity behaviors
 */
export class BehaviorRegistry {
  private static behaviors = new Map<string, () => EntityBehavior>();
  
  /**
   * Register a new behavior type
   * Uses factory function to ensure each entity gets its own behavior instance
   */
  static register(name: string, behaviorFactory: () => EntityBehavior): void {
    this.behaviors.set(name, behaviorFactory);
    console.log(`Registered behavior: ${name}`);
  }
  
  /**
   * Create a behavior instance by name
   */
  static create(name: string): EntityBehavior | undefined {
    const factory = this.behaviors.get(name);
    return factory ? factory() : undefined;
  }
  
  /**
   * Check if behavior type exists
   */
  static has(name: string): boolean {
    return this.behaviors.has(name);
  }
  
  /**
   * Get all registered behavior names
   */
  static getAllNames(): string[] {
    return Array.from(this.behaviors.keys());
  }
  
  /**
   * Remove behavior type (useful for testing)
   */
  static unregister(name: string): boolean {
    return this.behaviors.delete(name);
  }
  
  /**
   * Clear all registrations (useful for testing)
   */
  static clear(): void {
    this.behaviors.clear();
  }
}
