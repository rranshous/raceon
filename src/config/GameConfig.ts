/**
 * Central configuration for RaceOn game
 * 
 * This file contains all gameplay constants in one place for easy tweaking
 * and rapid iteration. Modify values here and restart to see immediate effects.
 */

export const GAME_CONFIG = {
  // World configuration
  WORLD: {
    WIDTH: 2400,
    HEIGHT: 1800,
    TILE_SIZE: 32
  },
  
  // Player vehicle configuration
  VEHICLE: {
    MAX_SPEED: 200, // Back to original value
    ACCELERATION: 300,
    BRAKING: 400,
    FRICTION: 100,
    TURN_SPEED: 3, // radians per second
    
    // Physical dimensions
    WIDTH: 20,
    HEIGHT: 12,
    
    // Terrain interaction
    MIN_SPEED_MULTIPLIER: 0.2, // Minimum speed maintained on rough terrain
    MIN_REVERSE_SPEED_MULTIPLIER: 0.1,
    TERRAIN_FRICTION_MULTIPLIER: 700,
    
    // Collision physics
    BOUNCE_FACTOR: -0.3,
    BOUNCE_DISTANCE: 2,
    
    // Upgrade system (for future use)
    UPGRADE_MULTIPLIERS: {
      ENGINE: [1.0, 1.2, 1.5, 2.0],    // Speed/acceleration boosts
      ARMOR: [1.0, 1.1, 1.3, 1.6],     // Damage reduction
      HANDLING: [1.0, 1.15, 1.4, 1.8]  // Turn speed improvements
    }
  },
  
  // Enemy configuration
  ENEMIES: {
    WATER_BANDIT: {
      MAX_SPEED: 150,
      ACCELERATION: 200,
      FRICTION: 80,
      TURN_SPEED: 2,
      
      // Physical dimensions
      WIDTH: 20,
      HEIGHT: 12,
      COLLISION_RADIUS_MULTIPLIER: 0.33, // Reduced collision sensitivity
      
      // AI behavior
      STUCK_DETECTION_TIME: 3.0,         // Seconds before considering stuck
      AVOIDANCE_DURATION: 8.0,           // Max avoidance time in seconds
      AVOIDANCE_COOLDOWN: 5.0,           // Cooldown between avoidance attempts
      WANDER_STRENGTH: 0.8,              // How much bandits swerve while moving
      STUCK_MOVEMENT_THRESHOLD: 0.3,     // % of expected movement to trigger stuck detection
      STUCK_TIMER_DECAY: 3.0,            // How fast stuck timer decays when moving
      MIN_MOVEMENT_SPEED: 20,            // Minimum speed to consider for stuck detection
      
      // Spawning
      SPAWN_INTERVAL: 2,    // Seconds between spawns
      MAX_ACTIVE: 4,        // Maximum bandits alive at once
      SPAWN_DISTANCE_MIN: 30,  // Min pixels from water source
      SPAWN_DISTANCE_MAX: 50   // Max pixels from water source
    }
    
    // Future enemy types can be added here
    // RAIDER: {
    //   MAX_SPEED: 180,
    //   SPAWN_INTERVAL: 12,
    //   MAX_ACTIVE: 2,
    //   AGGRESSION: 1.2
    // }
  },
  
  // Physics and collision configuration
  PHYSICS: {
    VEHICLE_RADIUS_MULTIPLIER: 0.5,  // How much of vehicle size is used for collision
    WATER_COLLISION_RADIUS_MULTIPLIER: 0.5,
    ROCK_COLLISION_RADIUS_MULTIPLIER: 0.5
  },
  
  // Effects configuration
  EFFECTS: {
    PARTICLES: {
      MAX_COUNT: 200,
      DUST_SPEED_THRESHOLD: 80,  // Speed needed to generate dust
      COLLISION_PARTICLE_COUNT: 15,
      DESTRUCTION_PARTICLE_COUNT: 25
    },
    
    TIRE_TRACKS: {
      MAX_COUNT: 500,
      SPEED_THRESHOLD: 30,  // Speed needed to leave tracks
      ALPHA_DECAY: 0.02,    // How fast tracks fade
      SEGMENT_DISTANCE: 10  // Distance between track segments
    },
    
    SCREEN_SHAKE: {
      COLLISION_INTENSITY: 10,
      DESTRUCTION_INTENSITY: 15,
      DECAY_RATE: 20
    }
  },
  
  // Debug configuration
  DEBUG: {
    TERRAIN_LOG_FREQUENCY: 0.1,  // % chance to log terrain effects
    SHOW_COLLISION_BOUNDS: false,
    SHOW_AI_TARGETS: false,
    SHOW_PERFORMANCE_STATS: false
  },
  
  // Progression system (for future use)
  PROGRESSION: {
    UPGRADE_COSTS: [100, 250, 500, 1000],
    RESOURCE_REWARDS: {
      BANDIT_KILL: 50,
      OASIS_DEFENSE: 100,
      EXPLORATION: 25
    }
  }
} as const;

// Type definitions for better IDE support
export type GameConfig = typeof GAME_CONFIG;
export type VehicleConfig = typeof GAME_CONFIG.VEHICLE;
export type EnemyConfig = typeof GAME_CONFIG.ENEMIES;
export type EffectsConfig = typeof GAME_CONFIG.EFFECTS;
