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
  stuckTimer: number;
  lastPosition: Vector2D;
  avoidanceTarget: Vector2D | null;
  avoidanceStartTime: number;
  state: 'escaping' | 'destroyed';
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
      stuckTimer: 0,
      lastPosition: new Vector2D(entity.position.x, entity.position.y),
      avoidanceTarget: null,
      avoidanceStartTime: 0,
      state: 'escaping'
    });
  }
  
  update(entity: BaseEntity, deltaTime: number, _world: DesertWorld): void {
    const state = this.behaviorState.get(entity);
    if (!state || !entity.isAlive) return;
    
    this.updateAI(entity, state, deltaTime);
    this.updatePhysics(entity, state, deltaTime);
  }
  
  private updateAI(entity: BaseEntity, state: EscapingBehaviorState, deltaTime: number): void {
    if (state.state === 'destroyed') return;
    
    const config = entity.entityDefinition;
    
    // Check if we're genuinely stuck (very lenient detection)
    const distanceMoved = entity.position.subtract(state.lastPosition).length();
    const expectedMovement = entity.speed * deltaTime;
    
    // Only consider stuck if we're trying to move but not getting anywhere
    if (entity.speed > config.minMovementSpeed && 
        distanceMoved < expectedMovement * config.stuckMovementThreshold) {
      state.stuckTimer += deltaTime;
    } else {
      state.stuckTimer = Math.max(0, state.stuckTimer - deltaTime * config.stuckTimerDecay);
    }
    state.lastPosition = new Vector2D(entity.position.x, entity.position.y);
    
    // If genuinely stuck for a long time, add avoidance behavior
    if (state.stuckTimer > config.stuckDetectionTime) {
      // Only create new avoidance if we don't have one or the current one is old
      const avoidanceAge = performance.now() - state.avoidanceStartTime;
      if (!state.avoidanceTarget || avoidanceAge > config.avoidanceCooldown * 1000) {
        this.createAvoidanceTarget(entity, state);
      }
      state.stuckTimer = 0;
    }
    
    // Determine target (either escape target or avoidance target)
    let currentTarget = state.escapeTarget;
    if (state.avoidanceTarget) {
      currentTarget = state.avoidanceTarget;
      
      // Clear avoidance target if we're close enough or it's been too long
      const distanceToAvoidance = entity.position.subtract(state.avoidanceTarget).length();
      const avoidanceAge = performance.now() - state.avoidanceStartTime;
      
      if (distanceToAvoidance < 50 || avoidanceAge > config.avoidanceDuration * 1000) {
        state.avoidanceTarget = null;
        console.log('Entity cleared avoidance target - reached destination or timeout');
      }
    }
    
    // Calculate direction to target with natural wandering
    const directionToTarget = currentTarget.subtract(entity.position);
    const distanceToTarget = directionToTarget.length();
    
    if (distanceToTarget > 10) {
      // Add some wandering behavior for more natural movement
      state.wanderAngle += (Math.random() - 0.5) * config.wanderStrength * deltaTime;
      
      // Calculate desired angle (target direction + wander)
      const targetAngle = Math.atan2(directionToTarget.y, directionToTarget.x);
      const wanderInfluence = 0.15; // Reduced swerving
      const desiredAngle = targetAngle + state.wanderAngle * wanderInfluence;
      
      // Smoothly turn toward desired angle
      let angleDiff = desiredAngle - entity.angle;
      
      // Normalize angle difference to [-π, π]
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      // Turn toward target with some variation in turn speed
      const baseTurnSpeed = config.turnSpeed * (0.8 + Math.random() * 0.4);
      const maxTurnThisFrame = baseTurnSpeed * deltaTime;
      if (Math.abs(angleDiff) < maxTurnThisFrame) {
        entity.angle = desiredAngle;
      } else {
        entity.angle += Math.sign(angleDiff) * maxTurnThisFrame;
      }
      
      // Vary acceleration for more natural movement
      const baseAcceleration = config.acceleration * (0.7 + Math.random() * 0.6);
      entity.speed += baseAcceleration * deltaTime;
      entity.speed = Math.min(config.maxSpeed, entity.speed);
    } else {
      // Near target - apply friction
      entity.speed = Math.max(0, entity.speed - config.friction * deltaTime);
    }
  }
  
  private createAvoidanceTarget(entity: BaseEntity, state: EscapingBehaviorState): void {
    // Create a more strategic avoidance target to prevent oscillation
    const avoidanceDistance = 150 + Math.random() * 100; // 150-250 pixels away
    
    // Try to go around obstacles in the direction of the escape target
    const escapeDirection = state.escapeTarget.subtract(entity.position).normalize();
    const perpendicular = new Vector2D(-escapeDirection.y, escapeDirection.x);
    
    // Choose left or right around the obstacle
    const sideChoice = Math.random() > 0.5 ? 1 : -1;
    const avoidanceDirection = escapeDirection.add(perpendicular.multiply(sideChoice)).normalize();
    
    state.avoidanceTarget = new Vector2D(
      entity.position.x + avoidanceDirection.x * avoidanceDistance,
      entity.position.y + avoidanceDirection.y * avoidanceDistance
    );
    
    state.avoidanceStartTime = performance.now();
    console.log('Entity created smart avoidance target - going around obstacle toward escape');
  }
  
  private updatePhysics(entity: BaseEntity, _state: EscapingBehaviorState, deltaTime: number): void {
    // Convert speed and angle to velocity vector
    entity.velocity = Vector2D.fromAngle(entity.angle, entity.speed);
    
    // Update position
    entity.position = entity.position.add(entity.velocity.multiply(deltaTime));
  }
  
  cleanup(entity: BaseEntity): void {
    this.behaviorState.delete(entity);
  }
  
  getDebugInfo(entity: BaseEntity): Record<string, any> {
    const state = this.behaviorState.get(entity);
    if (!state) return {};
    
    return {
      state: state.state,
      stuckTimer: state.stuckTimer.toFixed(2),
      hasAvoidanceTarget: !!state.avoidanceTarget,
      distanceToEscape: entity.position.subtract(state.escapeTarget).length().toFixed(0),
      // Provide the actual target objects for the debug renderer
      escapeTarget: state.escapeTarget,
      avoidanceTarget: state.avoidanceTarget,
      // Additional properties for compatibility with old debug renderer
      position: entity.position,
      isStuck: state.stuckTimer > 1.0
    };
  }
}
