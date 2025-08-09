import { Vector2D } from '../utils/Vector2D';
import { GAME_CONFIG } from '../config/GameConfig';

export interface TireTrack {
    position: Vector2D;
    angle: number;
    life: number;
    maxLife: number;
    width: number;
    vehicleType: 'player' | 'bandit' | 'hunter';
}

export class TireTrackSystem {
    private tracks: TireTrack[] = [];
    private maxTracks: number = GAME_CONFIG.EFFECTS.TIRE_TRACKS.MAX_COUNT;
    private trackSpacing: number = GAME_CONFIG.EFFECTS.TIRE_TRACKS.SEGMENT_DISTANCE;
    private lastTrackPositions: Map<string, Vector2D> = new Map();
    
    constructor() {}
    
    // Add tire tracks for a vehicle
    addTracks(vehicleId: string, position: Vector2D, angle: number, speed: number, vehicleType: 'player' | 'bandit' | 'hunter'): void {
        // Only create tracks if vehicle is moving fast enough
        if (speed < GAME_CONFIG.EFFECTS.TIRE_TRACKS.SPEED_THRESHOLD) return;
        
        const lastPos = this.lastTrackPositions.get(vehicleId);
        
        // Check if vehicle has moved far enough to create new tracks
        if (lastPos) {
            const distance = position.subtract(lastPos).length();
            if (distance < this.trackSpacing) return;
        }
        
        // Create left and right tire tracks
        const trackWidth = 12; // Distance between left and right tracks
        const perpendicular = new Vector2D(-Math.sin(angle), Math.cos(angle));
        
        // Left track
        this.createTrack(
            position.add(perpendicular.multiply(-trackWidth / 2)),
            angle,
            speed,
            vehicleType
        );
        
        // Right track
        this.createTrack(
            position.add(perpendicular.multiply(trackWidth / 2)),
            angle,
            speed,
            vehicleType
        );
        
        this.lastTrackPositions.set(vehicleId, new Vector2D(position.x, position.y));
    }
    
    private createTrack(position: Vector2D, angle: number, speed: number, vehicleType: 'player' | 'bandit' | 'hunter'): void {
        // Remove oldest tracks if we're at the limit
        if (this.tracks.length >= this.maxTracks) {
            this.tracks.shift();
        }
        
        // Track life based on speed (faster = more visible tracks)
        const baseLife = 4.0; // Reduced from 8.0 to 4.0 seconds
        const speedMultiplier = Math.min(speed / 100, 1.5); // Reduced from 2.0 to 1.5 max multiplier
        const life = baseLife * speedMultiplier;
        
        this.tracks.push({
            position: new Vector2D(position.x, position.y),
            angle: angle,
            life: life,
            maxLife: life,
            width: 3 + Math.random() * 2, // Slight variation in track width
            vehicleType: vehicleType
        });
    }
    
    // Update all tire tracks (fade over time)
    update(deltaTime: number): void {
        for (let i = this.tracks.length - 1; i >= 0; i--) {
            const track = this.tracks[i];
            track.life -= deltaTime;
            
            // Remove expired tracks
            if (track.life <= 0) {
                this.tracks.splice(i, 1);
            }
        }
    }
    
    // Render all tire tracks
    render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number): void {
        const margin = 50; // Only render tracks visible on screen
        
        for (const track of this.tracks) {
            // Skip tracks outside visible area
            if (track.position.x < cameraX - margin ||
                track.position.x > cameraX + canvasWidth + margin ||
                track.position.y < cameraY - margin ||
                track.position.y > cameraY + canvasHeight + margin) {
                continue;
            }
            
            // Simple time-based fade - just alpha reduction
            const alpha = track.life / track.maxLife;
            const trackLength = 6;
            
            ctx.save();
            ctx.translate(track.position.x, track.position.y);
            ctx.rotate(track.angle);
            
            // Different colors for different vehicle types
            if (track.vehicleType === 'player') {
                ctx.strokeStyle = `rgba(80, 60, 40, ${alpha * 0.6})`; // Brown for player
            } else if (track.vehicleType === 'hunter') {
                ctx.strokeStyle = `rgba(120, 40, 40, ${alpha * 0.5})`; // Red for hunters
            } else {
                ctx.strokeStyle = `rgba(60, 80, 120, ${alpha * 0.4})`; // Blue for bandits
            }
            
            ctx.lineWidth = track.width;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(-trackLength / 2, 0);
            ctx.lineTo(trackLength / 2, 0);
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    // Clear vehicle tracking when vehicle is destroyed
    clearVehicleTracks(vehicleId: string): void {
        this.lastTrackPositions.delete(vehicleId);
    }
    
    // Get track count for debugging
    getTrackCount(): number {
        return this.tracks.length;
    }
    
    // Clear all tracks
    clear(): void {
        this.tracks = [];
        this.lastTrackPositions.clear();
    }
}
