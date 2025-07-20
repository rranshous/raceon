import { Vehicle } from '../entities/Vehicle';
import { Track } from '../track/Track';
import { InputManager } from '../input/InputManager';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private inputManager: InputManager;
    private vehicle: Vehicle;
    private track: Track;
    
    private lastTime: number = 0;
    private isRunning: boolean = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = ctx;
        
        this.inputManager = new InputManager();
        this.vehicle = new Vehicle(400, 300); // Start at center
        this.track = new Track();
        
        // Set initial vehicle position to be on the track
        this.vehicle.position.x = 400 + 300; // Start on the right side of the oval
        this.vehicle.position.y = 300;
        this.vehicle.angle = Math.PI / 2; // Facing down initially
    }

    start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    stop(): void {
        this.isRunning = false;
    }

    private gameLoop = (): void => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    };

    private update(deltaTime: number): void {
        // Update vehicle
        this.vehicle.update(deltaTime, this.inputManager);
        
        // Simple boundary checking - wrap around screen edges
        if (this.vehicle.position.x < 0) {
            this.vehicle.position.x = this.canvas.width;
        } else if (this.vehicle.position.x > this.canvas.width) {
            this.vehicle.position.x = 0;
        }
        
        if (this.vehicle.position.y < 0) {
            this.vehicle.position.y = this.canvas.height;
        } else if (this.vehicle.position.y > this.canvas.height) {
            this.vehicle.position.y = 0;
        }
    }

    private render(): void {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render track
        this.track.render(this.ctx);
        
        // Render vehicle
        this.vehicle.render(this.ctx);
        
        // Render debug info
        this.renderDebugInfo();
    }

    private renderDebugInfo(): void {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Speed: ${Math.round(this.vehicle.speed)}`, 10, 30);
        this.ctx.fillText(`Position: (${Math.round(this.vehicle.position.x)}, ${Math.round(this.vehicle.position.y)})`, 10, 50);
        this.ctx.fillText(`Angle: ${Math.round(this.vehicle.angle * 180 / Math.PI)}°`, 10, 70);
    }
}
