/**
 * Collision System
 * 
 * Handles directional collision detection between entities.
 * Determines collision winners based on vehicle front positions.
 */

import { Vector2D } from '../utils/Vector2D';

export interface CollisionEntity {
  position: Vector2D;
  angle: number;
}

export class CollisionSystem {
  /**
   * Determine collision winner based on vehicle front positions
   * Returns true if first entity wins, false if second entity wins
   */
  static determineCollisionWinner(
    entity1: CollisionEntity, 
    entity2: CollisionEntity,
    frontOffset: number = 15
  ): boolean {
    // Calculate front positions based on vehicle angles
    const entity1Front = new Vector2D(
      entity1.position.x + Math.cos(entity1.angle) * frontOffset,
      entity1.position.y + Math.sin(entity1.angle) * frontOffset
    );
    
    const entity2Front = new Vector2D(
      entity2.position.x + Math.cos(entity2.angle) * frontOffset,
      entity2.position.y + Math.sin(entity2.angle) * frontOffset
    );
    
    // Check if entity1's front is closer to entity2 center than entity2's front is to entity1 center
    const entity1FrontToEntity2Distance = entity1Front.subtract(entity2.position).length();
    const entity2FrontToEntity1Distance = entity2Front.subtract(entity1.position).length();
    
    // Entity1 wins if their front is significantly closer (more aggressive collision)
    return entity1FrontToEntity2Distance < entity2FrontToEntity1Distance - 5; // 5px tolerance
  }
  
  /**
   * Check if two entities are colliding based on their positions and radii
   */
  static checkCollision(
    entity1: CollisionEntity,
    entity2: CollisionEntity,
    radius1: number,
    radius2: number
  ): boolean {
    const distance = entity1.position.subtract(entity2.position).length();
    return distance < (radius1 + radius2);
  }
}
