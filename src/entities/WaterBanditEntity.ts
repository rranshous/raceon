/**
 * Water Bandit Entity
 * 
 * New registry-based implementation of the water bandit using the behavior system.
 * This replaces the original WaterBandit class with a more flexible entity.
 */

import { Vector2D } from '../utils/Vector2D';
import { CarSprite } from '../graphics/CarSprite';
import { BaseEntity, EntityDefinition } from './EntityRegistry';
import { EntityBehavior, BehaviorRegistry } from './behaviors/BehaviorRegistry';
import { PhysicsSystem, PhysicsEntity } from '../physics/PhysicsSystem';

export class WaterBanditEntity implements BaseEntity, PhysicsEntity {
  public position: Vector2D;
  public velocity: Vector2D;
  public angle: number = 0;
  public speed: number = 0;
  public sprite: CarSprite | null = null;
  public isAlive: boolean = true;
  public entityDefinition: EntityDefinition;
  
  // Entity type for physics system
  public readonly entityType = 'enemy' as const;
  
  private behavior: EntityBehavior | null = null;
  
  constructor(definition: EntityDefinition, startPosition: Vector2D, escapeTarget: Vector2D) {
    this.entityDefinition = definition;
    this.position = new Vector2D(startPosition.x, startPosition.y);
    this.velocity = new Vector2D(0, 0);
    
    // Set initial angle toward escape target with some randomness
    const directionToEscape = escapeTarget.subtract(this.position).normalize();
    this.angle = Math.atan2(directionToEscape.y, directionToEscape.x);
    
    // Initialize behavior
    this.behavior = BehaviorRegistry.create(definition.behavior) || null;
    if (this.behavior && this.behavior.initialize) {
      this.behavior.initialize(this);
    }
  }
  
  setSprite(sprite: CarSprite): void {
    this.sprite = sprite;
  }
  
  update(deltaTime: number, world?: any): void {
    if (!this.isAlive) return;
    
    // Update behavior if available (handles AI movement)
    if (this.behavior && world) {
      this.behavior.update(this, deltaTime, world);
    }
    
    // Use unified physics system for collision detection and terrain effects
    if (world) {
      const physicsConfig = PhysicsSystem.createEnemyConfig(this.entityDefinition);
      PhysicsSystem.updateEntityPhysics(this, deltaTime, world, physicsConfig);
    }
  }
  
  destroy(): void {
    this.isAlive = false;
    this.speed = 0;
    this.velocity = new Vector2D(0, 0);
    
    // Cleanup behavior
    if (this.behavior && this.behavior.cleanup) {
      this.behavior.cleanup(this);
    }
  }
  
  // Getters for common properties
  getWidth(): number {
    return this.entityDefinition.width;
  }
  
  getHeight(): number {
    return this.entityDefinition.height;
  }
  
  getPosition(): Vector2D {
    return this.position;
  }
  
  getIsAlive(): boolean {
    return this.isAlive;
  }
  
  // Collision detection methods
  checkCollisionWithPlayer(playerPosition: Vector2D, playerRadius: number): boolean {
    if (!this.isAlive) return false;
    
    // Create a temporary physics entity for the player
    const playerEntity = {
      position: playerPosition,
      velocity: new Vector2D(0, 0),
      speed: 0,
      angle: 0,
      entityType: 'player' as const,
      getWidth: () => playerRadius * 2,
      getHeight: () => playerRadius * 2
    };
    
    // Use unified collision detection
    return PhysicsSystem.checkEntityCollision(
      this, 
      playerEntity, 
      this.entityDefinition.collisionRadiusMultiplier,
      0.5
    );
  }
  
  // Check if bandit has escaped (reached edge of world)
  hasEscaped(worldWidth: number, worldHeight: number): boolean {
    const margin = 20; // Must reach the actual edge
    return this.position.x < margin || 
           this.position.x > worldWidth - margin ||
           this.position.y < margin || 
           this.position.y > worldHeight - margin;
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive || !this.sprite) return;
    
    // Use the same rendering logic as original WaterBandit
    this.sprite.render(ctx, this.position.x, this.position.y, this.angle, 1.5);
  }
  
  // Debug information
  getDebugInfo(): Record<string, any> {
    const baseInfo = {
      position: `(${this.position.x.toFixed(0)}, ${this.position.y.toFixed(0)})`,
      speed: this.speed.toFixed(1),
      angle: (this.angle * 180 / Math.PI).toFixed(0) + '°',
      alive: this.isAlive
    };
    
    // Add behavior debug info if available
    if (this.behavior && this.behavior.getDebugInfo) {
      return { ...baseInfo, ...this.behavior.getDebugInfo(this) };
    }
    
    return baseInfo;
  }
}
