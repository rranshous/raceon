/**
 * Escaping Behavior
 * 
 * AI behavior for entities that try to escape to the edge of the world
 * while avoiding obstacles. Extracted from the original WaterBandit logic.
 */

import { Vector2D } from '../../utils/Vector2D';
import { EntityBehavior } from './BehaviorRegistry';
import { BaseEntity } from '../EntityRegistry';
import { DesertWorld } from '../../world/DesertWorld';

interface EscapingBehaviorState {
  escapeTarget: Vector2D;
  wanderAngle: number;
  state: 'escaping' | 'destroyed';
  lastAvoidanceCheck: number; // Timestamp of last obstacle check (for performance)
  cachedAvoidanceDirection: Vector2D | null; // Cached avoidance direction
}

export class EscapingBehavior implements EntityBehavior {
  private behaviorState = new WeakMap<BaseEntity, EscapingBehaviorState>();
  
  initialize(entity: BaseEntity): void {
    // Set up initial behavior state
    
    // Create escape target at world edge
    const worldWidth = 2400; // TODO: Get from world config
    const worldHeight = 1800;
    
    // Choose random edge to escape to
    const edge = Math.floor(Math.random() * 4);
    let escapeTarget: Vector2D;
    
    switch (edge) {
      case 0: // Top edge
        escapeTarget = new Vector2D(Math.random() * worldWidth, -50);
        break;
      case 1: // Right edge
        escapeTarget = new Vector2D(worldWidth + 50, Math.random() * worldHeight);
        break;
      case 2: // Bottom edge
        escapeTarget = new Vector2D(Math.random() * worldWidth, worldHeight + 50);
        break;
      case 3: // Left edge
      default:
        escapeTarget = new Vector2D(-50, Math.random() * worldHeight);
        break;
    }
    
    const directionToEscape = escapeTarget.subtract(entity.position).normalize();
    const initialAngle = Math.atan2(directionToEscape.y, directionToEscape.x);
    
    this.behaviorState.set(entity, {
      escapeTarget,
      wanderAngle: initialAngle + (Math.random() - 0.5) * 0.5,
      state: 'escaping',
      lastAvoidanceCheck: 0,
      cachedAvoidanceDirection: null
    });
  }
  
  update(entity: BaseEntity, deltaTime: number, world: DesertWorld): void {
    const state = this.behaviorState.get(entity);
    if (!state || !entity.isAlive) return;
    
    // Only handle AI logic - physics is handled by the unified physics system
    this.updateAI(entity, state, deltaTime, world);
  }
  
  private updateAI(entity: BaseEntity, state: EscapingBehaviorState, deltaTime: number, world: DesertWorld): void {
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
      const escapeDirection = state.escapeTarget.subtract(entity.position).normalize();
      
      // Reduced avoidance strength for smoother behavior (75% avoidance, 25% escape)
      targetDirection = avoidanceDirection.multiply(0.75).add(escapeDirection.multiply(0.25)).normalize();
      
      // Only log occasionally to avoid console spam
      if (Math.random() < 0.01) { // 1% chance to log
        console.log('🚧 Entity avoiding obstacle/terrain (pre-computed)');
      }
    } else {
      // No obstacle - head toward escape target with some wandering
      const escapeDirection = state.escapeTarget.subtract(entity.position).normalize();
      
      // Add wandering for natural movement
      state.wanderAngle += (Math.random() - 0.5) * config.wanderStrength * deltaTime;
      const wanderDirection = new Vector2D(Math.cos(state.wanderAngle), Math.sin(state.wanderAngle));
      
      // Blend escape direction with wandering (85% escape, 15% wander)
      targetDirection = escapeDirection.multiply(0.85).add(wanderDirection.multiply(0.15)).normalize();
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
      turnSpeed *= 1.5; // Turn 50% faster when avoiding obstacles (reduced from 2x)
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
      state: state.state,
      distanceToEscape: entity.position.subtract(state.escapeTarget).length().toFixed(0),
      escapeTarget: state.escapeTarget,
      position: entity.position
    };
  }
}
