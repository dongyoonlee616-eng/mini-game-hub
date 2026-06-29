const navalPage = document.querySelector('#navalPage');
const boardElement = document.querySelector('#navalBoard');

const rotateButton = document.querySelector('#rotateShip');
const mainActionButton = document.querySelector('#mainAction');
const resetButton = document.querySelector('#resetNavalDuel');

const playerOneScore = document.querySelector('#playerOneScore');
const playerTwoScore = document.querySelector('#playerTwoScore');

const phaseLabel = document.querySelector('#phaseLabel');
const currentPlayerText = document.querySelector('#currentPlayerText');

const messageTitle = document.querySelector('#messageTitle');
const messageText = document.querySelector('#messageText');

const currentShipText = document.querySelector('#currentShipText');
const orientationText = document.querySelector('#orientationText');

const GRID_SIZE = 10;
const SHIP_SIZES = [5, 4, 3, 3, 2];

let phase = 'placement';
// placement, pass, battle, finished

let placingPlayer = 1;
let currentPlayer = 1;
let orientation = 'horizontal';
let currentShipIndex = 0;

let isAttackLocked = false;

let scores = {
    1: 0,
    2: 0
};

let boards = {
    1: [],
    2: []
};

let ships = {
    1: [],
    2: []
};

let attackedCells = {
    1: new Set(),
    2: new Set()
};

function createEmptyBoard() {
    return Array.from({ length: GRID_SIZE }, () => {
        return Array.from({ length: GRID_SIZE }, () => ({
            shipId: null,
            hit: false
        }));
    });
}

function setMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
}

function getOpponent(player) {
    return player === 1 ? 2 : 1;
}

function getCellKey(row, col) {
    return `${row}-${col}`;
}

function canPlaceShip(player, row, col, size) {
    const board = boards[player];

    for (let i = 0; i < size; i += 1) {
        const nextRow = orientation === 'vertical' ? row + i : row;
        const nextCol = orientation === 'horizontal' ? col + i : col;

        if (nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE) {
            return false;
        }

        if (board[nextRow][nextCol].shipId !== null) {
            return false;
        }
    }

    return true;
}

function placeShip(row, col) {
    if (phase !== 'placement') return;
    if (currentShipIndex >= SHIP_SIZES.length) return;

    const size = SHIP_SIZES[currentShipIndex];

    if (!canPlaceShip(placingPlayer, row, col, size)) {
        setMessage('배치 불가', '그 위치에는 함선을 놓을 수 없습니다.');
        return;
    }

    const shipId = currentShipIndex + 1;
    const cells = [];

    for (let i = 0; i < size; i += 1) {
        const nextRow = orientation === 'vertical' ? row + i : row;
        const nextCol = orientation === 'horizontal' ? col + i : col;

        boards[placingPlayer][nextRow][nextCol].shipId = shipId;

        cells.push({
            row: nextRow,
            col: nextCol
        });
    }

    ships[placingPlayer].push({
        id: shipId,
        size,
        cells,
        sunk: false
    });

    currentShipIndex += 1;

    if (currentShipIndex >= SHIP_SIZES.length) {
        setMessage(`PLAYER ${placingPlayer} 배치 완료`, '준비 완료 버튼을 누르세요.');
    } else {
        setMessage(
            `PLAYER ${placingPlayer} 함선 배치`,
            `${SHIP_SIZES[currentShipIndex]}칸 함선을 배치하세요.`
        );
    }

    updateView();
}

function getShipById(player, shipId) {
    return ships[player].find((ship) => ship.id === shipId);
}

function isShipSunk(player, ship) {
    return ship.cells.every((cell) => boards[player][cell.row][cell.col].hit);
}

function areAllShipsSunk(player) {
    return ships[player].every((ship) => ship.sunk);
}

function updateHeader() {
    playerOneScore.textContent = String(scores[1]);
    playerTwoScore.textContent = String(scores[2]);

    if (phase === 'placement') {
        phaseLabel.textContent = '배치';
        currentPlayerText.textContent = `P${placingPlayer}`;
    }

    if (phase === 'pass') {
        phaseLabel.textContent = '턴 준비';
        currentPlayerText.textContent = `P${currentPlayer}`;
    }

    if (phase === 'battle') {
        phaseLabel.textContent = '공격';
        currentPlayerText.textContent = `P${currentPlayer}`;
    }

    if (phase === 'finished') {
        phaseLabel.textContent = 'END';
        currentPlayerText.textContent = '-';
    }

    if (phase === 'placement' && currentShipIndex < SHIP_SIZES.length) {
        currentShipText.textContent = `${SHIP_SIZES[currentShipIndex]}칸 함선`;
    } else if (phase === 'placement') {
        currentShipText.textContent = '배치 완료';
    } else if (phase === 'battle') {
        currentShipText.textContent = '상대 진영 공격';
    } else if (phase === 'pass') {
        currentShipText.textContent = '상대에게 넘기기';
    } else {
        currentShipText.textContent = '게임 종료';
    }

    orientationText.textContent = orientation === 'horizontal' ? '가로 배치' : '세로 배치';

    rotateButton.disabled = phase !== 'placement';
    mainActionButton.disabled = false;

    if (phase === 'placement') {
        mainActionButton.textContent = '준비 완료';
        mainActionButton.disabled = currentShipIndex < SHIP_SIZES.length;
    }

    if (phase === 'pass') {
        mainActionButton.textContent = '턴 시작';
    }

    if (phase === 'battle') {
        mainActionButton.textContent = '공격 중';
        mainActionButton.disabled = true;
    }

    if (phase === 'finished') {
        mainActionButton.textContent = '다시 시작';
    }

    navalPage.classList.toggle('flipped', getVisiblePlayer() === 2);
}

function getVisiblePlayer() {
    if (phase === 'placement') {
        return placingPlayer;
    }

    if (phase === 'battle' || phase === 'pass') {
        return currentPlayer;
    }

    return 1;
}

function renderBoard() {
    boardElement.innerHTML = '';

    for (let row = 0; row < GRID_SIZE; row += 1) {
        for (let col = 0; col < GRID_SIZE; col += 1) {
            const button = document.createElement('button');

            button.className = 'sea-cell';
            button.type = 'button';
            button.dataset.row = String(row);
            button.dataset.col = String(col);

            renderCellState(button, row, col);

            button.addEventListener('click', () => {
                handleCellClick(row, col);
            });

            boardElement.appendChild(button);
        }
    }
}

function renderCellState(button, row, col) {
    if (phase === 'placement') {
        const cell = boards[placingPlayer][row][col];

        if (cell.shipId !== null) {
            button.classList.add('ship');
            button.textContent = '■';
        }

        button.disabled = currentShipIndex >= SHIP_SIZES.length;
        return;
    }

    if (phase === 'pass') {
        button.classList.add('hidden');
        button.textContent = '?';
        button.disabled = true;
        return;
    }

    if (phase === 'battle' || phase === 'finished') {
        const defender = getOpponent(currentPlayer);
        const attackKey = getCellKey(row, col);
        const targetCell = boards[defender][row][col];

        if (!attackedCells[currentPlayer].has(attackKey)) {
            button.textContent = '';
            button.disabled = phase !== 'battle';
            return;
        }

        if (targetCell.shipId === null) {
            button.classList.add('miss');
            button.textContent = '·';
            button.disabled = true;
            return;
        }

        const ship = getShipById(defender, targetCell.shipId);

        if (ship?.sunk) {
            button.classList.add('sunk');
            button.textContent = 'X';
        } else {
            button.classList.add('hit');
            button.textContent = '!';
        }

        button.disabled = true;
    }
}

function handleCellClick(row, col) {
    if (phase === 'placement') {
        placeShip(row, col);
        return;
    }

    if (phase === 'battle') {
        attackCell(row, col);
    }
}

function attackCell(row, col) {
    if (phase !== 'battle') return;
    if (isAttackLocked) return;

    const defender = getOpponent(currentPlayer);
    const attackKey = getCellKey(row, col);

    if (attackedCells[currentPlayer].has(attackKey)) return;

    isAttackLocked = true;

    attackedCells[currentPlayer].add(attackKey);

    const targetCell = boards[defender][row][col];

    if (targetCell.shipId === null) {
        setMessage(`PLAYER ${currentPlayer} 빗나감`, '상대 함선을 맞히지 못했습니다. 턴이 넘어갑니다.');
        updateView();

        setTimeout(() => {
            endTurn();
        }, 700);

        return;
    }

    targetCell.hit = true;
    scores[currentPlayer] += 1;

    const ship = getShipById(defender, targetCell.shipId);

    if (ship && !ship.sunk && isShipSunk(defender, ship)) {
        ship.sunk = true;
        scores[currentPlayer] += 5;

        setMessage(
            `PLAYER ${currentPlayer} 격침!`,
            `명중 +1점, 격침 보너스 +5점입니다. 한 번 더 공격하세요.`
        );
    } else {
        setMessage(
            `PLAYER ${currentPlayer} 명중!`,
            '상대 함선을 맞혀 1점을 얻었습니다. 한 번 더 공격하세요.'
        );
    }

    if (areAllShipsSunk(defender)) {
        finishGame(currentPlayer);
        return;
    }

    updateView();

    setTimeout(() => {
        if (phase !== 'battle') return;

        isAttackLocked = false;

        setMessage(
            `PLAYER ${currentPlayer} 추가 공격`,
            '명중했으므로 턴이 유지됩니다. 다시 한 칸을 공격하세요.'
        );

        updateView();
    }, 700);
}

function endTurn() {
    isAttackLocked = true;

    updateView();

    setTimeout(() => {
        if (phase === 'finished') return;

        currentPlayer = getOpponent(currentPlayer);
        phase = 'pass';
        isAttackLocked = false;

        setMessage(
            `PLAYER ${currentPlayer} 차례`,
            `기기를 PLAYER ${currentPlayer}에게 넘기고 턴 시작을 누르세요.`
        );

        updateView();
    }, 900);
}

function handleMainAction() {
    if (phase === 'placement') {
        finishPlacement();
        return;
    }

    if (phase === 'pass') {
        startTurn();
        return;
    }

    if (phase === 'finished') {
        resetGame();
    }
}

function finishPlacement() {
    if (placingPlayer === 1) {
        placingPlayer = 2;
        currentShipIndex = 0;
        orientation = 'horizontal';

        setMessage('PLAYER 2 함선 배치', '화면이 반대로 돌아갑니다. PLAYER 2가 함선을 배치하세요.');

        updateView();
        return;
    }

    currentPlayer = 1;
    phase = 'pass';

    setMessage('전투 준비', 'PLAYER 1부터 공격합니다. PLAYER 1이 턴 시작을 누르세요.');

    updateView();
}

function startTurn() {
    phase = 'battle';
    isAttackLocked = false;

    setMessage(
        `PLAYER ${currentPlayer} 공격`,
        '상대 함선이 있을 것 같은 칸을 하나 선택하세요.'
    );

    updateView();
}

function finishGame(winner) {
    phase = 'finished';

    setMessage(
        `PLAYER ${winner} 승리!`,
        `상대 함선을 모두 격침했습니다. 최종 점수는 ${scores[1]} : ${scores[2]}입니다.`
    );

    updateView();
}

function resetGame() {
    phase = 'placement';
    placingPlayer = 1;
    currentPlayer = 1;
    orientation = 'horizontal';
    currentShipIndex = 0;
    isAttackLocked = false;

    scores = {
        1: 0,
        2: 0
    };

    boards = {
        1: createEmptyBoard(),
        2: createEmptyBoard()
    };

    ships = {
        1: [],
        2: []
    };

    attackedCells = {
        1: new Set(),
        2: new Set()
    };

    setMessage('PLAYER 1 함선 배치', '5칸 함선부터 자신의 진영에 배치하세요.');

    updateView();
}

function updateView() {
    updateHeader();
    renderBoard();
}

rotateButton.addEventListener('click', () => {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    updateView();
});

mainActionButton.addEventListener('click', () => {
    handleMainAction();
});

resetButton.addEventListener('click', () => {
    resetGame();
});

document.addEventListener('gesturestart', (event) => {
    event.preventDefault();
});

document.addEventListener('gesturechange', (event) => {
    event.preventDefault();
});

document.addEventListener('gestureend', (event) => {
    event.preventDefault();
});

resetGame();