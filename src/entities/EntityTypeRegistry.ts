/**
 * Entity Type Registry
 * 
 * Centralized registry for all entity types with their configurations.
 * Makes it easy to add new entity types without modifying existing code.
 */

export interface EntityTypeConfig {
  id: string;
  displayName: string;
  spriteImageName: string;
  dustBackOffsetMultiplier: number;
  vehicleType: 'player' | 'bandit' | 'hunter';
  isPlayerControlled: boolean;
}

export class EntityTypeRegistry {
  private static configs = new Map<string, EntityTypeConfig>();
  
  /**
   * Register all known entity types
   */
  static initialize(): void {
    this.register({
      id: 'player',
      displayName: 'Player',
      spriteImageName: 'car_yellow',
      dustBackOffsetMultiplier: 15,
      vehicleType: 'player',
      isPlayerControlled: true
    });
    
    this.register({
      id: 'water_bandit',
      displayName: 'Water Bandits', 
      spriteImageName: 'car_blue',
      dustBackOffsetMultiplier: 12,
      vehicleType: 'bandit',
      isPlayerControlled: false
    });
    
    this.register({
      id: 'hunter_motorcycle',
      displayName: 'Hunters',
      spriteImageName: 'car_red', 
      dustBackOffsetMultiplier: 12,
      vehicleType: 'hunter',
      isPlayerControlled: false
    });
  }
  
  /**
   * Register a new entity type
   */
  static register(config: EntityTypeConfig): void {
    this.configs.set(config.id, config);
  }
  
  /**
   * Get configuration for an entity type
   */
  static get(entityId: string): EntityTypeConfig | undefined {
    return this.configs.get(entityId);
  }
  
  /**
   * Get all registered entity types
   */
  static getAll(): EntityTypeConfig[] {
    return Array.from(this.configs.values());
  }
  
  /**
   * Get all enemy entity types (non-player)
   */
  static getEnemyTypes(): EntityTypeConfig[] {
    return this.getAll().filter(config => !config.isPlayerControlled);
  }
  
  /**
   * Get display name for entity type
   */
  static getDisplayName(entityId: string): string {
    const config = this.get(entityId);
    return config?.displayName || entityId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
