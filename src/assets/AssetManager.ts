export class AssetManager {
    private static instance: AssetManager;
    private images: Map<string, HTMLImageElement> = new Map();
    private loadPromises: Map<string, Promise<HTMLImageElement>> = new Map();

    private constructor() {}

    static getInstance(): AssetManager {
        if (!AssetManager.instance) {
            AssetManager.instance = new AssetManager();
        }
        return AssetManager.instance;
    }

    async loadImage(key: string, path: string): Promise<HTMLImageElement> {
        // Return cached image if already loaded
        if (this.images.has(key)) {
            return this.images.get(key)!;
        }

        // Return existing promise if already loading
        if (this.loadPromises.has(key)) {
            return this.loadPromises.get(key)!;
        }

        // Create new loading promise
        const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(key, img);
                this.loadPromises.delete(key);
                resolve(img);
            };
            img.onerror = () => {
                this.loadPromises.delete(key);
                reject(new Error(`Failed to load image: ${path}`));
            };
            img.src = path;
        });

        this.loadPromises.set(key, loadPromise);
        return loadPromise;
    }

    getImage(key: string): HTMLImageElement | null {
        return this.images.get(key) || null;
    }

    async loadAllAssets(): Promise<void> {
        // Load car sprites
        await Promise.all([
            this.loadImage('car_yellow', '/resources/assets/mini-pixel-pack-2/Cars/Player_yellow (16 x 16).png'),
            this.loadImage('car_blue', '/resources/assets/mini-pixel-pack-2/Cars/Player_blue (16 x 16).png'),
            this.loadImage('car_red', '/resources/assets/mini-pixel-pack-2/Cars/Player_red (16 x 16).png'),
            this.loadImage('car_green', '/resources/assets/mini-pixel-pack-2/Cars/Player_green (16 x 16).png'),
        ]);
    }
}
