const startButton = document.querySelector('#startTrapGame');
const resetButton = document.querySelector('#resetTrapGame');

const playerOneBox = document.querySelector('#playerOneBox');
const playerTwoBox = document.querySelector('#playerTwoBox');
const playerOneScoreText = document.querySelector('#playerOneScore');
const playerTwoScoreText = document.querySelector('#playerTwoScore');

const roundText = document.querySelector('#roundText');
const currentTurnText = document.querySelector('#currentTurnText');
const trapCountText = document.querySelector('#trapCountText');
const targetScoreText = document.querySelector('#targetScoreText');

const messageTitle = document.querySelector('#messageTitle');
const messageText = document.querySelector('#messageText');

const trapButtonBoard = document.querySelector('#trapButtonBoard');

const WIN_SCORE = 7;
const BUTTON_COUNT = 9;
const MAX_TRAP_COUNT = BUTTON_COUNT - 1;
const NEXT_TURN_DELAY = 900;

let currentPlayer = 1;
let round = 1;
let trapCount = 1;
let trapIndexes = [];

let scores = {
    1: 0,
    2: 0
};

let gameState = 'idle';
// idle, playing, locked, gameover

function setMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
}

function getOpponent(player) {
    return player === 1 ? 2 : 1;
}

function updateStatus() {
    playerOneScoreText.textContent = String(scores[1]);
    playerTwoScoreText.textContent = String(scores[2]);

    roundText.textContent = String(round);
    currentTurnText.textContent = currentPlayer === 1 ? 'P1' : 'P2';
    trapCountText.textContent = String(trapCount);
    targetScoreText.textContent = String(WIN_SCORE);

    playerOneBox.classList.toggle('active', currentPlayer === 1);
    playerTwoBox.classList.toggle('active', currentPlayer === 2);
}

function createShuffledIndexes() {
    const indexes = Array.from({ length: BUTTON_COUNT }, (_, index) => index);

    for (let i = indexes.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [indexes[i], indexes[randomIndex]] = [indexes[randomIndex], indexes[i]];
    }

    return indexes;
}

function createTrapIndexes() {
    const shuffledIndexes = createShuffledIndexes();
    trapIndexes = shuffledIndexes.slice(0, trapCount);
}

function isTrap(index) {
    return trapIndexes.includes(index);
}

function renderButtons() {
    trapButtonBoard.innerHTML = '';

    for (let index = 0; index < BUTTON_COUNT; index += 1) {
        const button = document.createElement('button');

        button.className = 'trap-button';
        button.type = 'button';
        button.dataset.index = String(index);
        button.textContent = '?';
        button.disabled = gameState !== 'playing';

        button.addEventListener('click', () => {
            handleButtonClick(index, button);
        });

        trapButtonBoard.appendChild(button);
    }
}

function disableAllButtons() {
    const buttons = document.querySelectorAll('.trap-button');

    buttons.forEach((button) => {
        button.disabled = true;
    });
}

function resetBoardForTurn() {
    createTrapIndexes();
    renderButtons();
}

function resetGame() {
    currentPlayer = 1;
    round = 1;
    trapCount = 1;
    trapIndexes = [];

    scores = {
        1: 0,
        2: 0
    };

    gameState = 'idle';

    updateStatus();
    trapButtonBoard.innerHTML = '';

    startButton.disabled = false;

    setMessage('버튼 함정 대결', 'START를 누르면 PLAYER 1부터 시작합니다.');
}

function startGame() {
    currentPlayer = 1;
    round = 1;
    trapCount = 1;
    scores = {
        1: 0,
        2: 0
    };

    gameState = 'playing';
    startButton.disabled = true;

    updateStatus();
    resetBoardForTurn();

    setMessage('PLAYER 1 차례', '버튼 하나를 선택하세요. 함정을 피하면 1점을 얻습니다.');
}

function handleButtonClick(index, button) {
    if (gameState !== 'playing') return;

    gameState = 'locked';
    disableAllButtons();

    if (isTrap(index)) {
        handleTrap(button);
        return;
    }

    handleSafe(button);
}

function handleSafe(button) {
    scores[currentPlayer] += 1;

    button.classList.add('revealed-safe');
    button.textContent = 'SAFE';

    updateStatus();

    if (checkWinner()) return;

    setMessage(
        `PLAYER ${currentPlayer} 안전!`,
        `PLAYER ${currentPlayer}가 1점을 얻었습니다.`
    );

    setTimeout(() => {
        moveNextTurn();
    }, NEXT_TURN_DELAY);
}

function handleTrap(button) {
    const opponent = getOpponent(currentPlayer);

    scores[opponent] += 1;

    button.classList.add('revealed-trap');
    button.textContent = 'BOMB';

    updateStatus();

    if (checkWinner()) return;

    setMessage(
        `PLAYER ${currentPlayer} 함정!`,
        `PLAYER ${opponent}가 1점을 얻었습니다.`
    );

    setTimeout(() => {
        moveNextTurn();
    }, NEXT_TURN_DELAY);
}

function moveNextTurn() {
    currentPlayer = getOpponent(currentPlayer);

    if (currentPlayer === 1) {
        round += 1;
        trapCount = Math.min(round, MAX_TRAP_COUNT);
    }

    gameState = 'playing';

    updateStatus();
    resetBoardForTurn();

    setMessage(
        `PLAYER ${currentPlayer} 차례`,
        `현재 함정은 ${trapCount}개입니다. 버튼 하나를 선택하세요.`
    );
}

function checkWinner() {
    if (scores[1] >= WIN_SCORE) {
        finishGame(1);
        return true;
    }

    if (scores[2] >= WIN_SCORE) {
        finishGame(2);
        return true;
    }

    return false;
}

function finishGame(winner) {
    gameState = 'gameover';

    disableAllButtons();
    startButton.disabled = false;

    setMessage(
        `PLAYER ${winner} 승리!`,
        `최종 점수는 ${scores[1]} : ${scores[2]}입니다. START를 누르면 다시 시작합니다.`
    );
}

startButton.addEventListener('click', () => {
    startGame();
});

resetButton.addEventListener('click', () => {
    resetGame();
});

resetGame();