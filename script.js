const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
let board = [];
let score = 0;

function initGame() {
    board = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    addNewTile();
    addNewTile();
    updateBoard();
}

function addNewTile() {
    const emptyTiles = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyTiles.push({i, j});
            }
        }
    }
    if (emptyTiles.length > 0) {
        const {i, j} = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = board[i][j] || '';
            if (board[i][j] > 0) {
                tile.style.backgroundColor = getTileColor(board[i][j]);
            }
            gameBoard.appendChild(tile);
        }
    }
    scoreDisplay.textContent = score;
}

function getTileColor(value) {
    const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
}

function move(direction) {
    let moved = false;
    const newBoard = JSON.parse(JSON.stringify(board));

    function moveAndMerge(line) {
        // 移除空格
        line = line.filter(tile => tile !== 0);
        // 合并相同的数字
        for (let i = 0; i < line.length - 1; i++) {
            if (line[i] === line[i + 1]) {
                line[i] *= 2;
                score += line[i];
                line.splice(i + 1, 1);
                moved = true;
            }
        }
        // 填充空格
        while (line.length < 4) {
            line.push(0);
        }
        return line;
    }

    if (direction === 'left') {
        for (let i = 0; i < 4; i++) {
            newBoard[i] = moveAndMerge(newBoard[i]);
            if (JSON.stringify(board[i]) !== JSON.stringify(newBoard[i])) {
                moved = true;
            }
        }
    } else if (direction === 'right') {
        for (let i = 0; i < 4; i++) {
            newBoard[i] = moveAndMerge(newBoard[i].reverse()).reverse();
            if (JSON.stringify(board[i]) !== JSON.stringify(newBoard[i])) {
                moved = true;
            }
        }
    } else if (direction === 'up') {
        for (let j = 0; j < 4; j++) {
            let column = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]];
            column = moveAndMerge(column);
            for (let i = 0; i < 4; i++) {
                if (newBoard[i][j] !== column[i]) {
                    moved = true;
                }
                newBoard[i][j] = column[i];
            }
        }
    } else if (direction === 'down') {
        for (let j = 0; j < 4; j++) {
            let column = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]];
            column = moveAndMerge(column.reverse()).reverse();
            for (let i = 0; i < 4; i++) {
                if (newBoard[i][j] !== column[i]) {
                    moved = true;
                }
                newBoard[i][j] = column[i];
            }
        }
    }

    if (moved) {
        board = newBoard;
        addNewTile();
        updateBoard();
        if (checkWin()) {
            alert("恭喜你贏了！你已經達到了2048！");
        } else if (checkGameOver()) {
            alert("遊戲結束！沒有更多可移動的方塊了。");
        }
    }
}

function checkWin() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 2048) {
                return true;
            }
        }
    }
    return false;
}

function checkGameOver() {
    // 检查是否还有空格
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                return false;
            }
        }
    }

    // 检查是否还有可以合并的相邻方块
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (
                (i < 3 && board[i][j] === board[i + 1][j]) ||
                (j < 3 && board[i][j] === board[i][j + 1])
            ) {
                return false;
            }
        }
    }

    return true;
}

// 添加重启功能
document.getElementById('restart').addEventListener('click', initGame);

// 修改移动事件监听器
document.addEventListener('keydown', handleKeyPress);

document.getElementById('up').addEventListener('click', () => move('up'));
document.getElementById('down').addEventListener('click', () => move('down'));
document.getElementById('left').addEventListener('click', () => move('left'));
document.getElementById('right').addEventListener('click', () => move('right'));

function handleKeyPress(e) {
    switch (e.key) {
        case 'ArrowLeft':
            move('left');
            break;
        case 'ArrowRight':
            move('right');
            break;
        case 'ArrowUp':
            move('up');
            break;
        case 'ArrowDown':
            move('down');
            break;
    }
}

// 添加触摸事件支持
let touchStartX, touchStartY;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let deltaX = touchEndX - touchStartX;
    let deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            move('right');
        } else {
            move('left');
        }
    } else {
        if (deltaY > 0) {
            move('down');
        } else {
            move('up');
        }
    }

    touchStartX = null;
    touchStartY = null;
});

initGame();
