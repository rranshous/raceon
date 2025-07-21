/**
 * Game Event System
 * 
 * Simple pub/sub event system for decoupling game systems.
 * Allows systems to react to game events without direct dependencies.
 */

export type EventCallback<T = any> = (data: T) => void;

export class GameEvents {
  private static listeners = new Map<string, EventCallback[]>();
  
  /**
   * Subscribe to an event
   */
  static on<T = any>(eventType: string, callback: EventCallback<T>): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }
  
  /**
   * Unsubscribe from an event
   */
  static off<T = any>(eventType: string, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  /**
   * Emit an event to all subscribers
   */
  static emit<T = any>(eventType: string, data?: T): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      // Create a copy to avoid issues if callbacks modify the listeners
      [...callbacks].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${eventType}:`, error);
        }
      });
    }
  }
  
  /**
   * Get number of listeners for an event (for debugging)
   */
  static getListenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.length || 0;
  }
  
  /**
   * Clear all listeners (useful for testing)
   */
  static clear(): void {
    this.listeners.clear();
  }
}
