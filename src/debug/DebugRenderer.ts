import { WaterBandit } from '../entities/WaterBandit';
import { WaterObstacle } from '../world/DesertWorld';
import { Vehicle } from '../entities/Vehicle';

export class DebugRenderer {
    private isEnabled: boolean = false;
    
    constructor() {}
    
    toggle(): void {
        this.isEnabled = !this.isEnabled;
        console.log(`🛠️ Debug mode ${this.isEnabled ? 'ENABLED' : 'DISABLED'} - Godly overview ${this.isEnabled ? 'ON' : 'OFF'}!`);
    }
    
    isDebugEnabled(): boolean {
        return this.isEnabled;
    }
    
    // Render all debug overlays in world space (affected by camera)
    renderWorldDebug(
        ctx: CanvasRenderingContext2D, 
        bandits: WaterBandit[], 
        waterObstacles: WaterObstacle[],
        player: Vehicle,
        cameraX: number,
        cameraY: number,
        canvasWidth: number,
        canvasHeight: number
    ): void {
        if (!this.isEnabled) return;
        
        // Only render debug items visible on screen (with margin for lines that extend off screen)
        const margin = 200;
        
        // Draw water obstacle boundaries
        this.renderWaterObstacles(ctx, waterObstacles, cameraX, cameraY, canvasWidth, canvasHeight, margin);
        
        // Draw bandit debug info
        this.renderBanditDebug(ctx, bandits, cameraX, cameraY, canvasWidth, canvasHeight, margin);
        
        // Draw player debug info
        this.renderPlayerDebug(ctx, player, cameraX, cameraY, canvasWidth, canvasHeight, margin);
    }
    
    // Render UI debug info (not affected by camera)
    renderUIDebug(ctx: CanvasRenderingContext2D, bandits: WaterBandit[], player: Vehicle): void {
        if (!this.isEnabled) return;
        
        // Semi-transparent background for debug panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 130, 300, 150);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        
        let y = 150;
        ctx.fillText('🛠️ GODLY DEBUG MODE', 20, y);
        y += 20;
        
        // Player info
        ctx.fillText(`Player: ${Math.round(player.speed)} speed`, 20, y);
        y += 15;
        ctx.fillText(`Pos: (${Math.round(player.position.x)}, ${Math.round(player.position.y)})`, 20, y);
        y += 15;
        
        // Bandit summary
        const aliveBandits = bandits.filter(b => b.isAlive);
        const stuckBandits = aliveBandits.filter(b => b.getDebugInfo().isStuck);
        ctx.fillText(`Bandits: ${aliveBandits.length} alive, ${stuckBandits.length} stuck`, 20, y);
        y += 15;
        
        // Escape progress
        aliveBandits.forEach((bandit, index) => {
            const debug = bandit.getDebugInfo();
            const distanceToEscape = debug.position.subtract(debug.escapeTarget).length();
            const escapeProgress = Math.max(0, 100 - (distanceToEscape / 20)); // Rough percentage
            ctx.fillText(`B${index + 1}: ${Math.round(escapeProgress)}% escaped`, 20, y);
            y += 15;
        });
        
        // Controls
        ctx.fillStyle = '#ffff00';
        ctx.fillText('Press D to toggle debug mode', 20, y + 10);
    }
    
    private renderWaterObstacles(
        ctx: CanvasRenderingContext2D, 
        waterObstacles: WaterObstacle[],
        cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number, margin: number
    ): void {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        for (const obstacle of waterObstacles) {
            // Only render if visible
            if (obstacle.position.x >= cameraX - margin &&
                obstacle.position.x <= cameraX + canvasWidth + margin &&
                obstacle.position.y >= cameraY - margin &&
                obstacle.position.y <= cameraY + canvasHeight + margin) {
                
                ctx.beginPath();
                ctx.arc(obstacle.position.x, obstacle.position.y, obstacle.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Label
                ctx.fillStyle = '#00ffff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('WATER', obstacle.position.x, obstacle.position.y - obstacle.radius - 5);
            }
        }
        
        ctx.setLineDash([]); // Reset line dash
    }
    
    private renderBanditDebug(
        ctx: CanvasRenderingContext2D, 
        bandits: WaterBandit[],
        cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number, margin: number
    ): void {
        bandits.forEach((bandit, index) => {
            if (!bandit.isAlive) return;
            
            const debug = bandit.getDebugInfo();
            
            // Only render if bandit is visible
            if (debug.position.x >= cameraX - margin &&
                debug.position.x <= cameraX + canvasWidth + margin &&
                debug.position.y >= cameraY - margin &&
                debug.position.y <= cameraY + canvasHeight + margin) {
                
                // Draw line to escape target
                ctx.strokeStyle = debug.isStuck ? '#ff0000' : '#ff00ff';
                ctx.lineWidth = 2;
                ctx.setLineDash([10, 5]);
                ctx.beginPath();
                ctx.moveTo(debug.position.x, debug.position.y);
                ctx.lineTo(debug.escapeTarget.x, debug.escapeTarget.y);
                ctx.stroke();
                
                // Draw avoidance target if exists
                if (debug.avoidanceTarget) {
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(debug.position.x, debug.position.y);
                    ctx.lineTo(debug.avoidanceTarget.x, debug.avoidanceTarget.y);
                    ctx.stroke();
                    
                    // Avoidance target marker
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(debug.avoidanceTarget.x, debug.avoidanceTarget.y, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Escape target marker
                ctx.fillStyle = '#ff00ff';
                ctx.beginPath();
                ctx.arc(debug.escapeTarget.x, debug.escapeTarget.y, 12, 0, Math.PI * 2);
                ctx.fill();
                
                // Bandit state indicator
                const statusColor = debug.isStuck ? '#ff0000' : debug.avoidanceTarget ? '#ffff00' : '#00ff00';
                ctx.fillStyle = statusColor;
                ctx.beginPath();
                ctx.arc(debug.position.x, debug.position.y - 25, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Bandit ID and status
                ctx.fillStyle = statusColor;
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`B${index + 1}`, debug.position.x, debug.position.y - 30);
                
                // Speed indicator
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`${Math.round(debug.speed)}`, debug.position.x, debug.position.y + 35);
            }
        });
        
        ctx.setLineDash([]); // Reset line dash
    }
    
    private renderPlayerDebug(
        ctx: CanvasRenderingContext2D,
        player: Vehicle,
        cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number, margin: number
    ): void {
        // Only render if player is visible
        if (player.position.x >= cameraX - margin &&
            player.position.x <= cameraX + canvasWidth + margin &&
            player.position.y >= cameraY - margin &&
            player.position.y <= cameraY + canvasHeight + margin) {
            
            // Player collision radius
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(player.position.x, player.position.y, 12, 0, Math.PI * 2); // Same radius used for collision
            ctx.stroke();
            
            // Velocity vector
            const velocityScale = 3;
            const velocityEnd = player.position.add(player.velocity.multiply(velocityScale));
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(player.position.x, player.position.y);
            ctx.lineTo(velocityEnd.x, velocityEnd.y);
            ctx.stroke();
            
            // Arrow head for velocity
            const arrowSize = 8;
            const angle = player.velocity.angle();
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.moveTo(velocityEnd.x, velocityEnd.y);
            ctx.lineTo(
                velocityEnd.x - arrowSize * Math.cos(angle - Math.PI / 6),
                velocityEnd.y - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                velocityEnd.x - arrowSize * Math.cos(angle + Math.PI / 6),
                velocityEnd.y - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
            
            // Player label
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PLAYER', player.position.x, player.position.y - 40);
        }
    }
}
