// Grid management and line clearing logic

class Grid {
    constructor(size = 8) {
        this.size = size;
        this.cells = Array(size).fill(null).map(() => Array(size).fill(false));
        this.gems = Array(size).fill(null).map(() => Array(size).fill(null));
        this.obstacles = Array(size).fill(null).map(() => Array(size).fill(null));
        this.gridElement = null;
    }

    init(element) {
        this.gridElement = element;
        this.render();
    }

    render() {
        if (!this.gridElement) return;
        
        this.gridElement.innerHTML = '';
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.cells[row][col]) {
                    cell.classList.add('filled');
                }
                
                // Gems are always visible, even on filled cells (they're hard blocks)
                if (this.gems[row][col]) {
                    cell.classList.add('gem', `gem-${this.gems[row][col]}`);
                }
                
                if (this.obstacles[row][col]) {
                    cell.classList.add(`obstacle-${this.obstacles[row][col]}`);
                }
                
                this.gridElement.appendChild(cell);
            }
        }
    }

    canPlace(piece, row, col) {
        const shape = piece.shape;
        
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const gridRow = row + r;
                    const gridCol = col + c;
                    
                    // Check bounds
                    if (gridRow < 0 || gridRow >= this.size || gridCol < 0 || gridCol >= this.size) {
                        return false;
                    }
                    
                    // Check if cell is already filled
                    if (this.cells[gridRow][gridCol]) {
                        return false;
                    }
                    
                    // Check obstacles (rock blocks placement)
                    if (this.obstacles[gridRow][gridCol] === 'rock' || 
                        this.obstacles[gridRow][gridCol] === 'iron') {
                        return false;
                    }
                    
                    // Generated gems are hard blocks - cannot place over them
                    if (this.gems[gridRow][gridCol]) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    placePiece(piece, row, col) {
        if (!this.canPlace(piece, row, col)) {
            return false;
        }
        
        const shape = piece.shape;
        const placedGems = [];
        
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const gridRow = row + r;
                    const gridCol = col + c;
                    
                    this.cells[gridRow][gridCol] = true;
                    
                    // Collect gem from piece if present
                    if (piece.gems && piece.gems[r] && piece.gems[r][c]) {
                        placedGems.push({
                            type: piece.gems[r][c],
                            row: gridRow,
                            col: gridCol
                        });
                    }
                    
                    // Collect gem from grid if present (shouldn't happen due to canPlace check, but just in case)
                    if (this.gems[gridRow][gridCol]) {
                        placedGems.push({
                            type: this.gems[gridRow][gridCol],
                            row: gridRow,
                            col: gridCol
                        });
                        this.gems[gridRow][gridCol] = null;
                    }
                }
            }
        }
        
        this.render();
        return { success: true, gems: placedGems };
    }

    clearLines() {
        const rowsToClear = [];
        const colsToClear = [];
        
        // Check rows
        for (let row = 0; row < this.size; row++) {
            let full = true;
            for (let col = 0; col < this.size; col++) {
                if (!this.cells[row][col] || this.obstacles[row][col] === 'iron') {
                    full = false;
                    break;
                }
            }
            if (full) {
                rowsToClear.push(row);
            }
        }
        
        // Check columns
        for (let col = 0; col < this.size; col++) {
            let full = true;
            for (let row = 0; row < this.size; row++) {
                if (!this.cells[row][col] || this.obstacles[row][col] === 'iron') {
                    full = false;
                    break;
                }
            }
            if (full) {
                colsToClear.push(col);
            }
        }
        
        // Clear rows
        for (const row of rowsToClear) {
            for (let col = 0; col < this.size; col++) {
                this.cells[row][col] = false;
                if (this.gems[row][col]) {
                    this.gems[row][col] = null;
                }
            }
        }
        
        // Clear columns
        for (const col of colsToClear) {
            for (let row = 0; row < this.size; row++) {
                this.cells[row][col] = false;
                // Gems don't fall - they stay in place or are cleared
                if (this.gems[row][col]) {
                    this.gems[row][col] = null;
                }
            }
        }
        
        // No gravity - blocks and gems stay where they are after clearing
        if (rowsToClear.length > 0 || colsToClear.length > 0) {
            this.render();
            return { rows: rowsToClear.length, cols: colsToClear.length };
        }
        
        return { rows: 0, cols: 0 };
    }

    spawnGem(row, col, type = 'regular') {
        if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
            // Gems can be placed even if cell is filled (they're hard blocks)
            // But don't overwrite existing gems
            if (!this.gems[row][col]) {
                this.gems[row][col] = type;
                return true;
            }
        }
        return false;
    }

    hasValidMoves(pieces) {
        // Check if any piece can be placed anywhere
        for (const piece of pieces) {
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    if (this.canPlace(piece, row, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getCellElement(row, col) {
        if (!this.gridElement) return null;
        return this.gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    showGhost(piece, row, col) {
        // Clear previous ghosts
        const ghosts = this.gridElement.querySelectorAll('.ghost, .invalid');
        ghosts.forEach(cell => {
            cell.classList.remove('ghost', 'invalid');
        });
        
        if (!this.canPlace(piece, row, col)) {
            // Show invalid placement
            const shape = piece.shape;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        const gridRow = row + r;
                        const gridCol = col + c;
                        if (gridRow >= 0 && gridRow < this.size && gridCol >= 0 && gridCol < this.size) {
                            const cell = this.getCellElement(gridRow, gridCol);
                            if (cell) {
                                cell.classList.add('invalid');
                            }
                        }
                    }
                }
            }
            return;
        }
        
        // Show valid ghost placement (including gems on pieces)
        const shape = piece.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const gridRow = row + r;
                    const gridCol = col + c;
                    if (gridRow >= 0 && gridRow < this.size && gridCol >= 0 && gridCol < this.size) {
                        const cell = this.getCellElement(gridRow, gridCol);
                        if (cell && !this.cells[gridRow][gridCol]) {
                            cell.classList.add('ghost');
                            // Show gem indicator if piece has gem at this position
                            if (piece.gems && piece.gems[r] && piece.gems[r][c]) {
                                cell.setAttribute('data-ghost-gem', piece.gems[r][c]);
                            }
                        }
                    }
                }
            }
        }
    }

    clearGhost() {
        const ghosts = this.gridElement.querySelectorAll('.ghost, .invalid');
        ghosts.forEach(cell => {
            cell.classList.remove('ghost', 'invalid');
            cell.removeAttribute('data-ghost-gem');
        });
    }
}
