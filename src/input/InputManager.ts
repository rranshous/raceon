export class InputManager {
    private keys: Set<string> = new Set();
    private keyPressedThisFrame: Set<string> = new Set();
    private lastKeys: Set<string> = new Set();

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
    
    // Call this at the start of each frame to update key press detection
    update(): void {
        this.keyPressedThisFrame.clear();
        
        // Find keys that were just pressed this frame
        for (const key of this.keys) {
            if (!this.lastKeys.has(key)) {
                this.keyPressedThisFrame.add(key);
            }
        }
        
        // Update last frame's keys
        this.lastKeys.clear();
        for (const key of this.keys) {
            this.lastKeys.add(key);
        }
    }

    isKeyPressed(keyCode: string): boolean {
        return this.keys.has(keyCode);
    }
    
    // Check if key was just pressed this frame (not held)
    isKeyJustPressed(keyCode: string): boolean {
        return this.keyPressedThisFrame.has(keyCode);
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
    
    // Debug input
    isDebugTogglePressed(): boolean {
        return this.isKeyJustPressed('KeyD');
    }
    
    // Hunter spawn input for testing
    isHunterSpawnPressed(): boolean {
        return this.isKeyJustPressed('KeyH');
    }
}
