// Core game loop and state management

class Game {
    constructor() {
        this.grid = new Grid(8);
        this.queue = new PieceQueue(3);
        this.dragHandler = null;
        this.currentLevel = 1;
        this.levelData = null;
        this.score = 0;
        this.gemsCollected = 0;
        this.gemTarget = 50;
        this.multiplier = 1;
        this.isGameOver = false;
        this.isPaused = false;
        
        this.init();
    }

    init() {
        // Initialize level
        this.levelData = getLevelData(this.currentLevel);
        this.gemTarget = this.levelData.gems.target;
        
        // Setup DOM elements
        const gridElement = document.getElementById('game-grid');
        const queueElement = document.getElementById('piece-queue');
        const restartBtn = document.getElementById('restart-btn');
        const winOverlay = document.getElementById('win-overlay');
        const lossOverlay = document.getElementById('loss-overlay');
        const nextLevelBtn = document.getElementById('next-level-btn');
        const tryAgainBtn = document.getElementById('try-again-btn');
        
        // Initialize grid
        this.grid.init(gridElement);
        
        // Initialize queue
        this.queue.render(queueElement);
        
        // Setup drag handler
        this.dragHandler = new TouchDragHandler(this.grid, this.queue, (piece, row, col) => {
            this.placePiece(piece, row, col);
        });
        
        // Setup event listeners
        restartBtn.addEventListener('click', () => this.restart());
        nextLevelBtn.addEventListener('click', () => this.nextLevel());
        tryAgainBtn.addEventListener('click', () => this.restart());
        
        // Spawn initial gems
        this.spawnGems();
        
        // Update UI
        this.updateUI();
    }

    spawnGems() {
        const spawnRate = this.levelData.gems.spawnRate || 0.2;
        const gemType = this.levelData.gems.type || 'regular';
        
        // Preplace gems on the board (they are hard blocks)
        for (let row = 0; row < this.grid.size; row++) {
            for (let col = 0; col < this.grid.size; col++) {
                if (Math.random() < spawnRate) {
                    this.grid.spawnGem(row, col, gemType);
                }
            }
        }
        
        this.grid.render();
    }

    placePiece(piece, row, col) {
        const result = this.grid.placePiece(piece, row, col);
        
        if (!result.success) {
            return;
        }
        
        // Collect gems
        if (result.gems && result.gems.length > 0) {
            for (const gem of result.gems) {
                this.collectGem(gem.type);
            }
        }
        
        // Clear lines
        const clearResult = this.grid.clearLines();
        if (clearResult.rows > 0 || clearResult.cols > 0) {
            this.addScore((clearResult.rows + clearResult.cols) * 100 * this.multiplier);
            this.multiplier = Math.min(this.multiplier + 0.1, 5);
        } else {
            this.multiplier = 1;
        }
        
        // Check game over
        if (!this.grid.hasValidMoves(this.queue.pieces)) {
            this.gameOver();
            return;
        }
        
        // Check win condition
        if (this.gemsCollected >= this.gemTarget) {
            this.win();
            return;
        }
        
        this.updateUI();
    }

    collectGem(type) {
        this.gemsCollected++;
        this.addScore(10);
        this.updateUI();
    }

    addScore(points) {
        this.score += Math.floor(points);
        const scoreElement = document.querySelector('.score');
        scoreElement.textContent = this.score;
        scoreElement.classList.add('updated');
        setTimeout(() => {
            scoreElement.classList.remove('updated');
        }, 300);
    }

    updateUI() {
        // Update gem count
        const gemsCollectedElement = document.getElementById('gems-collected');
        if (gemsCollectedElement) {
            gemsCollectedElement.textContent = this.gemsCollected;
        }
        
        // Update multiplier
        const multiplierElement = document.querySelector('.multiplier');
        if (multiplierElement) {
            multiplierElement.textContent = `🔥 x${this.multiplier.toFixed(1)}`;
        }
        
        // Update level info
        const levelText = document.querySelector('.level-text');
        if (levelText) {
            levelText.textContent = `LEVEL ${this.currentLevel}`;
        }
    }

    win() {
        this.isGameOver = true;
        const winOverlay = document.getElementById('win-overlay');
        const finalGems = document.getElementById('final-gems');
        const finalScore = document.getElementById('final-score');
        
        if (finalGems) finalGems.textContent = this.gemsCollected;
        if (finalScore) finalScore.textContent = this.score;
        
        winOverlay.classList.remove('hidden');
        
        // Save high score
        this.saveHighScore();
    }

    gameOver() {
        this.isGameOver = true;
        const lossOverlay = document.getElementById('loss-overlay');
        lossOverlay.classList.remove('hidden');
    }

    restart() {
        // Reset game state
        this.score = 0;
        this.gemsCollected = 0;
        this.multiplier = 1;
        this.isGameOver = false;
        
        // Reset grid
        this.grid = new Grid(8);
        const gridElement = document.getElementById('game-grid');
        this.grid.init(gridElement);
        
        // Reset queue
        this.queue = new PieceQueue(3);
        const queueElement = document.getElementById('piece-queue');
        this.queue.render(queueElement);
        
        // Recreate drag handler
        this.dragHandler = new TouchDragHandler(this.grid, this.queue, (piece, row, col) => {
            this.placePiece(piece, row, col);
        });
        
        // Spawn gems
        this.spawnGems();
        
        // Hide overlays
        document.getElementById('win-overlay').classList.add('hidden');
        document.getElementById('loss-overlay').classList.add('hidden');
        
        // Update UI
        this.updateUI();
    }

    nextLevel() {
        // For MVP, just restart
        this.restart();
    }

    saveHighScore() {
        const currentHigh = localStorage.getItem('blockBumHighScore') || 0;
        if (this.score > parseInt(currentHigh)) {
            localStorage.setItem('blockBumHighScore', this.score.toString());
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
