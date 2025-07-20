import { Game } from './game/Game';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
        throw new Error('Could not find game canvas');
    }

    const game = new Game(canvas);
    game.start();
});
