/**
 * Chasing Behavior
 * 
 * AI behavior for entities that pursue the player across the map.
 * Based on EscapingBehavior but targets player position instead of world edge.
 */

import { Vector2D } from '../../utils/Vector2D';
import { EntityBehavior } from './BehaviorRegistry';
import { BaseEntity } from '../EntityRegistry';
import { DesertWorld } from '../../world/DesertWorld';

interface ChasingBehaviorState {
  target: Vector2D;           // Player position (updated each frame)
  wanderAngle: number;
  state: 'chasing' | 'destroyed';
  lastAvoidanceCheck: number; // Timestamp of last obstacle check (for performance)
  cachedAvoidanceDirection: Vector2D | null; // Cached avoidance direction
  lastPlayerPosition: Vector2D; // For prediction
}

export class ChasingBehavior implements EntityBehavior {
  private behaviorState = new WeakMap<BaseEntity, ChasingBehaviorState>();
  
  initialize(entity: BaseEntity): void {
    // Set up initial behavior state
    
    // Initialize with entity's current position as target (will be updated to player position)
    const initialTarget = new Vector2D(entity.position.x, entity.position.y);
    
    const directionToTarget = initialTarget.subtract(entity.position).normalize();
    const initialAngle = Math.atan2(directionToTarget.y, directionToTarget.x);
    
    this.behaviorState.set(entity, {
      target: initialTarget,
      wanderAngle: initialAngle + (Math.random() - 0.5) * 0.5,
      state: 'chasing',
      lastAvoidanceCheck: 0,
      cachedAvoidanceDirection: null,
      lastPlayerPosition: initialTarget
    });
  }
  
  update(entity: BaseEntity, deltaTime: number, world: DesertWorld): void {
    const state = this.behaviorState.get(entity);
    if (!state || !entity.isAlive) return;
    
    // Only handle AI logic - physics is handled by the unified physics system
    this.updateAI(entity, state, deltaTime, world);
  }
  
  // Method to update the target (will be called by game to set player position)
  setTarget(entity: BaseEntity, playerPosition: Vector2D): void {
    const state = this.behaviorState.get(entity);
    if (state) {
      state.lastPlayerPosition = state.target; // Store previous position
      state.target = new Vector2D(playerPosition.x, playerPosition.y);
    }
  }
  
  private updateAI(entity: BaseEntity, state: ChasingBehaviorState, deltaTime: number, world: DesertWorld): void {
    if (state.state === 'destroyed') return;
    
    const config = entity.entityDefinition;
    const currentTime = performance.now();
    
    // OPTIMIZED: Even less frequent obstacle checks for maximum performance
    const avoidanceCheckInterval = 500; // milliseconds - much longer for smoother behavior and better performance
    let avoidanceDirection: Vector2D | null = null;
    
    if (currentTime - state.lastAvoidanceCheck > avoidanceCheckInterval) {
      // Time to do a new obstacle check using FAST pre-computed grid lookup
      avoidanceDirection = this.getOptimizedAvoidanceDirection(entity, world);
      state.lastAvoidanceCheck = currentTime;
      state.cachedAvoidanceDirection = avoidanceDirection;
    } else {
      // Use cached avoidance direction
      avoidanceDirection = state.cachedAvoidanceDirection;
    }
    
    let targetDirection: Vector2D;
    
    if (avoidanceDirection) {
      // There's an obstacle or bad terrain ahead - steer away but less dramatically
      const chaseDirection = state.target.subtract(entity.position).normalize();
      
      // Reduced avoidance strength for smoother behavior (75% avoidance, 25% chase)
      targetDirection = avoidanceDirection.multiply(0.75).add(chaseDirection.multiply(0.25)).normalize();
    } else {
      // No obstacle - head toward player with some wandering
      const chaseDirection = state.target.subtract(entity.position).normalize();
      
      // Add wandering for natural movement (less than bandits for more focused pursuit)
      state.wanderAngle += (Math.random() - 0.5) * config.wanderStrength * deltaTime;
      const wanderDirection = new Vector2D(Math.cos(state.wanderAngle), Math.sin(state.wanderAngle));
      
      // Blend chase direction with wandering (90% chase, 10% wander)
      targetDirection = chaseDirection.multiply(0.9).add(wanderDirection.multiply(0.1)).normalize();
    }
    
    // Calculate desired angle
    const desiredAngle = Math.atan2(targetDirection.y, targetDirection.x);
    
    // Smoothly turn toward desired angle - FASTER TURNING when avoiding obstacles
    let angleDiff = desiredAngle - entity.angle;
    
    // Normalize angle difference to [-π, π]
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    // Turn toward target - Moderate speed increase when avoiding obstacles
    let turnSpeed = config.turnSpeed;
    if (avoidanceDirection) {
      turnSpeed *= 1.5; // Turn 50% faster when avoiding obstacles
    }
    
    const maxTurnThisFrame = turnSpeed * deltaTime;
    if (Math.abs(angleDiff) < maxTurnThisFrame) {
      entity.angle = desiredAngle;
    } else {
      entity.angle += Math.sign(angleDiff) * maxTurnThisFrame;
    }
    
    // Move forward
    entity.speed += config.acceleration * deltaTime;
    entity.speed = Math.min(config.maxSpeed, entity.speed);
  }
  
  /**
   * Ultra-fast optimized avoidance using pre-computed grid data
   */
  private getOptimizedAvoidanceDirection(entity: BaseEntity, world: DesertWorld): Vector2D | null {
    // Look ahead multiple points for better prediction
    const lookAheadDistances = [60, 100, 140]; // Multiple look-ahead points
    const forwardDirection = new Vector2D(Math.cos(entity.angle), Math.sin(entity.angle));
    
    // Check multiple points along our path
    for (const distance of lookAheadDistances) {
      const lookAheadPosition = entity.position.add(forwardDirection.multiply(distance));
      
      // ULTRA-FAST: O(1) lookup using pre-computed grid
      const avoidanceVector = world.getAvoidanceVector(lookAheadPosition);
      if (avoidanceVector) {
        // Found obstacle at this look-ahead distance
        return avoidanceVector;
      }
    }
    
    return null; // No obstacles found on our path
  }
  
  cleanup(entity: BaseEntity): void {
    this.behaviorState.delete(entity);
  }
  
  getDebugInfo(entity: BaseEntity): Record<string, any> {
    const state = this.behaviorState.get(entity);
    if (!state) return {};
    
    return {
      behavior: 'chasing',
      target: `(${state.target.x.toFixed(0)}, ${state.target.y.toFixed(0)})`,
      state: state.state,
      distanceToTarget: entity.position.subtract(state.target).length().toFixed(0) + 'px'
    };
  }
}
