// Polyomino shapes and touch drag handlers

// 7 core polyomino shapes (removed problematic piece)
const PIECE_SHAPES = [
    // Tetrominoes
    [[1, 1, 1, 1]], // I-piece
    [[1, 1], [1, 1]], // O-piece
    [[1, 1, 1], [0, 1, 0]], // T-piece
    [[1, 1, 1], [1, 0, 0]], // L-piece
    [[1, 1, 1], [0, 0, 1]], // J-piece
    [[1, 1, 0], [0, 1, 1]], // S-piece
    [[0, 1, 1], [1, 1, 0]] // Z-piece
];

class Piece {
    constructor(shape, gems = null) {
        this.shape = shape;
        this.width = shape[0].length;
        this.height = shape.length;
        // Gems can be embedded in pieces: gems[row][col] = gemType or null
        this.gems = gems || Array(shape.length).fill(null).map(() => Array(shape[0].length).fill(null));
    }

    static random() {
        const shapeIndex = Math.floor(Math.random() * PIECE_SHAPES.length);
        return new Piece(PIECE_SHAPES[shapeIndex]);
    }

    render(size = 20) {
        const container = document.createElement('div');
        container.className = 'piece-preview';
        container.style.gridTemplateColumns = `repeat(${this.width}, ${size}px)`;
        container.style.gridTemplateRows = `repeat(${this.height}, ${size}px)`;
        
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.shape[row][col]) {
                    const block = document.createElement('div');
                    block.className = 'piece-block type-regular';
                    // Show gem if present on this block
                    if (this.gems[row] && this.gems[row][col]) {
                        block.classList.add('has-gem');
                        block.setAttribute('data-gem', this.gems[row][col]);
                    }
                    container.appendChild(block);
                } else {
                    const empty = document.createElement('div');
                    container.appendChild(empty);
                }
            }
        }
        
        return container;
    }
    
    getCenterOffset() {
        // Return row and col offset from top-left to center
        return {
            row: Math.floor(this.height / 2),
            col: Math.floor(this.width / 2)
        };
    }
}

class PieceQueue {
    constructor(size = 3) {
        this.size = size;
        this.pieces = [];
        this.generateQueue();
    }

    generateQueue() {
        this.pieces = [];
        for (let i = 0; i < this.size; i++) {
            this.pieces.push(Piece.random());
        }
    }

    takeFirst() {
        if (this.pieces.length === 0) {
            this.generateQueue();
        }
        const piece = this.pieces.shift();
        if (this.pieces.length < this.size) {
            this.pieces.push(Piece.random());
        }
        return piece;
    }

    render(container) {
        container.innerHTML = '';
        this.pieces.forEach((piece, index) => {
            const element = piece.render(15);
            element.dataset.pieceIndex = index;
            container.appendChild(element);
        });
    }
}

// Touch drag handler
class TouchDragHandler {
    constructor(grid, queue, onPlace) {
        this.grid = grid;
        this.queue = queue;
        this.onPlace = onPlace;
        this.currentPiece = null;
        this.currentElement = null;
        this.isDragging = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        this.init();
    }

    init() {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    }

    handleTouchStart(e) {
        const pieceElement = e.target.closest('.piece-preview');
        if (!pieceElement) return;
        
        e.preventDefault();
        
        const pieceIndex = parseInt(pieceElement.dataset.pieceIndex);
        if (isNaN(pieceIndex) || pieceIndex < 0 || pieceIndex >= this.queue.pieces.length) return;
        
        this.currentPiece = this.queue.pieces[pieceIndex];
        this.currentElement = pieceElement;
        this.isDragging = true;
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        
        pieceElement.classList.add('dragging');
    }

    handleTouchMove(e) {
        if (!this.isDragging || !this.currentPiece) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        const gridRect = this.grid.gridElement.getBoundingClientRect();
        
        const x = touch.clientX - gridRect.left;
        const y = touch.clientY - gridRect.top;
        
        const cellSize = gridRect.width / this.grid.size;
        
        // Calculate position from center of piece instead of top-left
        const centerOffset = this.currentPiece.getCenterOffset();
        const col = Math.floor(x / cellSize) - centerOffset.col;
        const row = Math.floor(y / cellSize) - centerOffset.row;
        
        // Show ghost preview
        this.grid.showGhost(this.currentPiece, row, col);
    }

    handleTouchEnd(e) {
        if (!this.isDragging || !this.currentPiece) {
            this.reset();
            return;
        }
        
        e.preventDefault();
        
        const touch = e.changedTouches[0];
        const gridRect = this.grid.gridElement.getBoundingClientRect();
        
        const x = touch.clientX - gridRect.left;
        const y = touch.clientY - gridRect.top;
        
        // Check if touch ended within grid
        if (x >= 0 && x < gridRect.width && y >= 0 && y < gridRect.height) {
            const cellSize = gridRect.width / this.grid.size;
            
            // Calculate position from center of piece instead of top-left
            const centerOffset = this.currentPiece.getCenterOffset();
            const col = Math.floor(x / cellSize) - centerOffset.col;
            const row = Math.floor(y / cellSize) - centerOffset.row;
            
            // Try to place piece
            if (this.grid.canPlace(this.currentPiece, row, col)) {
                const pieceIndex = parseInt(this.currentElement.dataset.pieceIndex);
                const pieceToPlace = this.currentPiece;
                
                // Remove piece from queue and add new one
                this.queue.pieces.splice(pieceIndex, 1);
                this.queue.pieces.push(Piece.random());
                
                // Update queue display
                const queueElement = document.getElementById('piece-queue');
                this.queue.render(queueElement);
                
                // Place piece
                this.onPlace(pieceToPlace, row, col);
            }
        }
        
        this.reset();
    }

    reset() {
        this.isDragging = false;
        if (this.currentElement) {
            this.currentElement.classList.remove('dragging');
        }
        this.currentPiece = null;
        this.currentElement = null;
        this.grid.clearGhost();
    }
}
