import { Vector2D } from '../utils/Vector2D';

export interface Particle {
    position: Vector2D;
    velocity: Vector2D;
    size: number;
    life: number;
    maxLife: number;
    color: string;
    type: 'dust' | 'debris' | 'water' | 'smoke';
}

export class ParticleSystem {
    private particles: Particle[] = [];
    private maxParticles: number = 200; // Reasonable limit for performance
    
    constructor() {}
    
    // Create dust particles (for driving and collisions)
    createDustParticles(position: Vector2D, velocity: Vector2D, count: number = 5): void {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const spreadAngle = (Math.random() - 0.5) * Math.PI; // 180 degree spread
            const speed = 20 + Math.random() * 40;
            const particleVelocity = new Vector2D(
                Math.cos(spreadAngle) * speed,
                Math.sin(spreadAngle) * speed
            ).add(velocity.multiply(0.3)); // Inherit some vehicle velocity
            
            this.particles.push({
                position: new Vector2D(
                    position.x + (Math.random() - 0.5) * 20,
                    position.y + (Math.random() - 0.5) * 20
                ),
                velocity: particleVelocity,
                size: 2 + Math.random() * 4,
                life: 0.8 + Math.random() * 0.4, // 0.8-1.2 seconds
                maxLife: 1.0,
                color: `rgba(160, 140, 100, ${0.6 + Math.random() * 0.4})`, // Sandy color
                type: 'dust'
            });
        }
    }
    
    // Create destruction particles (for bandit destruction)
    createDestructionParticles(position: Vector2D, velocity: Vector2D): void {
        // Metal debris
        for (let i = 0; i < 8; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const speed = 40 + Math.random() * 60;
            
            this.particles.push({
                position: position.add(new Vector2D(
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 15
                )),
                velocity: new Vector2D(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ).add(velocity.multiply(0.5)),
                size: 3 + Math.random() * 3,
                life: 1.5 + Math.random() * 1.0,
                maxLife: 2.0,
                color: `rgba(${100 + Math.random() * 50}, ${80 + Math.random() * 40}, 60, ${0.8 + Math.random() * 0.2})`,
                type: 'debris'
            });
        }
        
        // Dust cloud
        this.createDustParticles(position, velocity, 12);
    }
    
    // Create water splash particles
    createWaterSplash(position: Vector2D): void {
        for (let i = 0; i < 6; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const angle = (Math.random() - 0.5) * Math.PI;
            const speed = 30 + Math.random() * 50;
            
            this.particles.push({
                position: position.add(new Vector2D(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                )),
                velocity: new Vector2D(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ),
                size: 2 + Math.random() * 3,
                life: 0.4 + Math.random() * 0.3,
                maxLife: 0.6,
                color: `rgba(100, 150, 200, ${0.6 + Math.random() * 0.4})`, // Water blue
                type: 'water'
            });
        }
    }
    
    // Update all particles
    update(deltaTime: number): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.position = particle.position.add(particle.velocity.multiply(deltaTime));
            
            // Apply gravity and friction
            particle.velocity.y += 50 * deltaTime; // Gravity
            particle.velocity = particle.velocity.multiply(0.98); // Friction
            
            // Update life
            particle.life -= deltaTime;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // Render all particles
    render(ctx: CanvasRenderingContext2D): void {
        for (const particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            const size = particle.size * alpha;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.position.x, particle.position.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Get particle count for debugging
    getParticleCount(): number {
        return this.particles.length;
    }
    
    // Clear all particles
    clear(): void {
        this.particles = [];
    }
}
