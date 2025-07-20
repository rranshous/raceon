import { Vector2D } from '../utils/Vector2D';
import { BoundaryObject, BoundarySprite } from '../graphics/BoundarySprite';

export interface TrackPoint {
    position: Vector2D;
    width: number;
}

export class Track {
    private points: TrackPoint[] = [];
    private centerLine: Vector2D[] = [];
    private boundaryObjects: BoundaryObject[] = [];
    private boundarySprite: BoundarySprite | null = null;
    
    constructor() {
        this.generateSimpleOval();
        this.generateBoundaryObjects();
    }

    setBoundarySprite(sprite: BoundarySprite): void {
        this.boundarySprite = sprite;
    }

    private generateSimpleOval(): void {
        const centerX = 400;
        const centerY = 300;
        const radiusX = 300;
        const radiusY = 200;
        const trackWidth = 60;
        
        // Generate center line points for an oval
        const numPoints = 64;
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radiusX;
            const y = centerY + Math.sin(angle) * radiusY;
            
            this.centerLine.push(new Vector2D(x, y));
            this.points.push({
                position: new Vector2D(x, y),
                width: trackWidth
            });
        }
    }

    private generateBoundaryObjects(): void {
        const centerX = 400;
        const centerY = 300;
        const radiusX = 300;
        const radiusY = 200;
        const trackWidth = 60;
        
        // Place cones around the outer boundary - increased density
        const numCones = 64; // More cones for denser wall-like appearance
        const coneIndex = 4; // The traffic cone is the 5th sprite (index 4)
        
        for (let i = 0; i < numCones; i++) {
            const angle = (i / numCones) * Math.PI * 2;
            
            // Outer boundary cones
            const outerX = centerX + Math.cos(angle) * (radiusX + trackWidth/2 + 20);
            const outerY = centerY + Math.sin(angle) * (radiusY + trackWidth/2 + 20);
            
            this.boundaryObjects.push({
                position: new Vector2D(outerX, outerY),
                spriteIndex: coneIndex,
                collisionRadius: 10 // Slightly smaller radius for denser packing
            });
            
            // Inner boundary cones - now place more frequently
            if (i % 1 === 0) { // Every cone position instead of every other
                const innerX = centerX + Math.cos(angle) * (radiusX - trackWidth/2 - 20);
                const innerY = centerY + Math.sin(angle) * (radiusY - trackWidth/2 - 20);
                
                this.boundaryObjects.push({
                    position: new Vector2D(innerX, innerY),
                    spriteIndex: coneIndex,
                    collisionRadius: 10
                });
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.points.length < 3) return;

        // Draw track surface
        ctx.fillStyle = '#444';
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 4;

        // Draw outer track boundary
        ctx.beginPath();
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const nextPoint = this.points[(i + 1) % this.points.length];
            const prevPoint = this.points[(i - 1 + this.points.length) % this.points.length];
            
            // Calculate perpendicular vector for track width
            const direction = nextPoint.position.subtract(prevPoint.position).normalize();
            const perpendicular = new Vector2D(-direction.y, direction.x);
            const outerPoint = point.position.add(perpendicular.multiply(point.width / 2));
            
            if (i === 0) {
                ctx.moveTo(outerPoint.x, outerPoint.y);
            } else {
                ctx.lineTo(outerPoint.x, outerPoint.y);
            }
        }
        ctx.closePath();
        
        // Draw inner track boundary
        for (let i = this.points.length - 1; i >= 0; i--) {
            const point = this.points[i];
            const nextPoint = this.points[(i + 1) % this.points.length];
            const prevPoint = this.points[(i - 1 + this.points.length) % this.points.length];
            
            const direction = nextPoint.position.subtract(prevPoint.position).normalize();
            const perpendicular = new Vector2D(-direction.y, direction.x);
            const innerPoint = point.position.subtract(perpendicular.multiply(point.width / 2));
            
            ctx.lineTo(innerPoint.x, innerPoint.y);
        }
        
        ctx.fill();
        ctx.stroke();

        // Draw center line
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        for (let i = 0; i < this.centerLine.length; i++) {
            const point = this.centerLine[i];
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash pattern

        // Render boundary objects (cones)
        if (this.boundarySprite) {
            for (const obj of this.boundaryObjects) {
                this.boundarySprite.renderBoundaryObject(ctx, obj, 1.0);
            }
        }
    }

    // Check collision with boundary objects
    checkCollision(position: Vector2D, radius: number): BoundaryObject | null {
        for (const obj of this.boundaryObjects) {
            const distance = position.subtract(obj.position).length();
            if (distance < radius + obj.collisionRadius) {
                return obj;
            }
        }
        return null;
    }

    // Helper method to find the closest track point to a given position
    getClosestTrackPoint(position: Vector2D): TrackPoint | null {
        if (this.points.length === 0) return null;
        
        let closestPoint = this.points[0];
        let minDistance = position.subtract(closestPoint.position).length();
        
        for (const point of this.points) {
            const distance = position.subtract(point.position).length();
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
            }
        }
        
        return closestPoint;
    }
}
