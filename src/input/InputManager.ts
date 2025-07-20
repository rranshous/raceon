export class InputManager {
    private keys: Set<string> = new Set();

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });

        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        // Prevent arrow keys from scrolling the page
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }

    isKeyPressed(keyCode: string): boolean {
        return this.keys.has(keyCode);
    }

    // Game-specific input methods
    isAccelerating(): boolean {
        return this.isKeyPressed('ArrowUp');
    }

    isBraking(): boolean {
        return this.isKeyPressed('ArrowDown') || this.isKeyPressed('Space');
    }

    isSteeringLeft(): boolean {
        return this.isKeyPressed('ArrowLeft');
    }

    isSteeringRight(): boolean {
        return this.isKeyPressed('ArrowRight');
    }
}
