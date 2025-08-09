/**
 * Entity System Initialization
 * 
 * Registers all entity types and behaviors.
 * This should be called once at game startup.
 */

import { EntityRegistry } from './EntityRegistry';
import { BehaviorRegistry } from './behaviors/BehaviorRegistry';
import { EscapingBehavior } from './behaviors/EscapingBehavior';
import { ChasingBehavior } from './behaviors/ChasingBehavior';
import { GAME_CONFIG } from '../config/GameConfig';

/**
 * Initialize the entity system by registering all known entities and behaviors
 */
export function initializeEntitySystem(): void {
  console.log('Initializing entity system...');
  
  // Register behaviors
  BehaviorRegistry.register('escaping', () => new EscapingBehavior());
  BehaviorRegistry.register('chasing', () => new ChasingBehavior());
  
  // Register entity types
  
  // Water Bandit - original enemy type
  EntityRegistry.register({
    id: 'water_bandit',
    name: 'Water Bandit',
    sprite: 'bandit_car',
    behavior: 'escaping',
    
    // Physical properties from config
    maxSpeed: GAME_CONFIG.ENEMIES.WATER_BANDIT.MAX_SPEED,
    acceleration: GAME_CONFIG.ENEMIES.WATER_BANDIT.ACCELERATION,
    friction: GAME_CONFIG.ENEMIES.WATER_BANDIT.FRICTION,
    turnSpeed: GAME_CONFIG.ENEMIES.WATER_BANDIT.TURN_SPEED,
    width: GAME_CONFIG.ENEMIES.WATER_BANDIT.WIDTH,
    height: GAME_CONFIG.ENEMIES.WATER_BANDIT.HEIGHT,
    collisionRadiusMultiplier: GAME_CONFIG.ENEMIES.WATER_BANDIT.COLLISION_RADIUS_MULTIPLIER,
    
    // AI properties from config
    stuckDetectionTime: GAME_CONFIG.ENEMIES.WATER_BANDIT.STUCK_DETECTION_TIME,
    avoidanceDuration: GAME_CONFIG.ENEMIES.WATER_BANDIT.AVOIDANCE_DURATION,
    avoidanceCooldown: GAME_CONFIG.ENEMIES.WATER_BANDIT.AVOIDANCE_COOLDOWN,
    wanderStrength: GAME_CONFIG.ENEMIES.WATER_BANDIT.WANDER_STRENGTH,
    stuckMovementThreshold: GAME_CONFIG.ENEMIES.WATER_BANDIT.STUCK_MOVEMENT_THRESHOLD,
    stuckTimerDecay: GAME_CONFIG.ENEMIES.WATER_BANDIT.STUCK_TIMER_DECAY,
    minMovementSpeed: GAME_CONFIG.ENEMIES.WATER_BANDIT.MIN_MOVEMENT_SPEED,
    
    // Spawning properties from config
    spawnInterval: GAME_CONFIG.ENEMIES.WATER_BANDIT.SPAWN_INTERVAL,
    maxActive: GAME_CONFIG.ENEMIES.WATER_BANDIT.MAX_ACTIVE,
    spawnDistanceMin: GAME_CONFIG.ENEMIES.WATER_BANDIT.SPAWN_DISTANCE_MIN,
    spawnDistanceMax: GAME_CONFIG.ENEMIES.WATER_BANDIT.SPAWN_DISTANCE_MAX
  });
  
  // Hunter Motorcycle - pursues player instead of escaping
  EntityRegistry.register({
    id: 'hunter_motorcycle',
    name: 'Hunter Motorcycle',
    sprite: 'motorcycle', // Will use motorcycle sprite
    behavior: 'chasing', // Use chasing behavior to pursue player
    
    // Physical properties from config
    maxSpeed: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.MAX_SPEED,
    acceleration: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.ACCELERATION,
    friction: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.FRICTION,
    turnSpeed: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.TURN_SPEED,
    width: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.WIDTH,
    height: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.HEIGHT,
    collisionRadiusMultiplier: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.COLLISION_RADIUS_MULTIPLIER,
    
    // AI properties from config
    stuckDetectionTime: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.STUCK_DETECTION_TIME,
    avoidanceDuration: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.AVOIDANCE_DURATION,
    avoidanceCooldown: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.AVOIDANCE_COOLDOWN,
    wanderStrength: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.WANDER_STRENGTH,
    stuckMovementThreshold: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.STUCK_MOVEMENT_THRESHOLD,
    stuckTimerDecay: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.STUCK_TIMER_DECAY,
    minMovementSpeed: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.MIN_MOVEMENT_SPEED,
    
    // Hunter-specific spawning properties from config
    spawnInterval: 0, // Hunters don't spawn on interval
    maxActive: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.MAX_ACTIVE,
    spawnDistanceMin: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.SPAWN_DISTANCE,
    spawnDistanceMax: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.SPAWN_DISTANCE,
    
    // Hunter-specific properties
    spawnTriggerKills: GAME_CONFIG.ENEMIES.HUNTER_MOTORCYCLE.SPAWN_TRIGGER_KILLS
  });
  
  // Example of how easy it is to add a new enemy type:
  // Let's add a "raider" enemy with different stats to test the system
  EntityRegistry.register({
    id: 'raider',
    name: 'Desert Raider',
    sprite: 'raider_car', // We'll use the same sprite for now
    behavior: 'escaping', // Use same behavior but with different stats
    
    // Different stats for variety
    maxSpeed: 180,
    acceleration: 250,
    friction: 60,
    turnSpeed: 2.5,
    width: 22,
    height: 14,
    collisionRadiusMultiplier: 0.4,
    
    // More aggressive AI
    stuckDetectionTime: 2.0,
    avoidanceDuration: 6.0,
    avoidanceCooldown: 3.0,
    wanderStrength: 1.2,
    stuckMovementThreshold: 0.4,
    stuckTimerDecay: 4.0,
    minMovementSpeed: 30,
    
    // Different spawning behavior - longer intervals, fewer active
    spawnInterval: 15, // Spawn every 15 seconds
    maxActive: 1,      // Only 1 active at a time
    spawnDistanceMin: 50,
    spawnDistanceMax: 80,
    
    // Custom properties for raiders
    aggression: 1.5,
    territorialRadius: 200
  });
  
  console.log('Entity system initialized successfully');
  console.log(`Registered ${EntityRegistry.getAll().length} entity types`);
  console.log(`Registered ${BehaviorRegistry.getAllNames().length} behavior types`);
}
