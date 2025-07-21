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

export class WaterBanditEntity implements BaseEntity {
  public position: Vector2D;
  public velocity: Vector2D;
  public angle: number = 0;
  public speed: number = 0;
  public sprite: CarSprite | null = null;
  public isAlive: boolean = true;
  public entityDefinition: EntityDefinition;
  
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
    
    // Update behavior if available
    if (this.behavior && world) {
      this.behavior.update(this, deltaTime, world);
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
  
  // Collision detection methods (preserved from original WaterBandit)
  checkCollisionWithPlayer(playerPosition: Vector2D, playerRadius: number): boolean {
    if (!this.isAlive) return false;
    
    const distance = this.position.subtract(playerPosition).length();
    const banditRadius = Math.max(this.getWidth(), this.getHeight()) / 2;
    
    return distance < (banditRadius + playerRadius);
  }
  
  // Check if bandit has escaped (reached edge of world)
  hasEscaped(worldWidth: number, worldHeight: number): boolean {
    const margin = 20; // Must reach the actual edge
    return this.position.x < margin || 
           this.position.x > worldWidth - margin ||
           this.position.y < margin || 
           this.position.y > worldHeight - margin;
  }
  
  // Handle water collision (same as player)
  handleWaterCollision(waterCollision: any, deltaTime: number): void {
    if (!waterCollision) return;
    
    const banditRadius = Math.max(this.getWidth(), this.getHeight()) / 3;
    
    // Calculate collision response vector
    const collisionVector = this.position.subtract(waterCollision.position);
    const collisionDistance = collisionVector.length();
    
    if (collisionDistance > 0) {
      // Normalize the collision vector
      const collisionNormal = collisionVector.normalize();
      
      // Push the bandit away from the water
      const overlap = banditRadius + waterCollision.radius - collisionDistance;
      this.position = this.position.add(collisionNormal.multiply(overlap + 2));
      
      // Calculate bounce/skid effect
      const velocityDotNormal = this.velocity.x * collisionNormal.x + 
                              this.velocity.y * collisionNormal.y;
      
      // Reflect velocity along the collision normal (bounce effect)
      const reflectedVelocity = this.velocity.subtract(
        collisionNormal.multiply(velocityDotNormal * 1.2)
      );
      
      // Apply the bounced velocity with less damping (keep more momentum)
      this.velocity = reflectedVelocity.multiply(0.8);
      this.speed *= 0.8;
      
      // Update position based on new velocity to prevent sticking
      this.position = this.position.add(this.velocity.multiply(deltaTime));
    }
  }
  
  // Keep bandit within world bounds (but allow escape at edges)
  clampToWorldBounds(worldWidth: number, worldHeight: number): void {
    // Only prevent them from going too far off-screen to prevent memory issues
    const extremeMargin = 200;
    
    if (this.position.x < -extremeMargin) this.position.x = -extremeMargin;
    if (this.position.x > worldWidth + extremeMargin) this.position.x = worldWidth + extremeMargin;
    if (this.position.y < -extremeMargin) this.position.y = -extremeMargin;
    if (this.position.y > worldHeight + extremeMargin) this.position.y = worldHeight + extremeMargin;
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive || !this.sprite) return;
    
    // Same rendering logic as original WaterBandit
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);
    this.sprite.render(ctx, -this.getWidth() / 2, -this.getHeight() / 2, this.getWidth(), this.getHeight());
    ctx.restore();
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
