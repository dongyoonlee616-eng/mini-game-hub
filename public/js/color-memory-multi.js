const startButton = document.querySelector('#startColorMemoryMulti');
const resetButton = document.querySelector('#resetColorMemoryMulti');

const playerOneBox = document.querySelector('#playerOneBox');
const playerTwoBox = document.querySelector('#playerTwoBox');
const playerOneScore = document.querySelector('#playerOneScore');
const playerTwoScore = document.querySelector('#playerTwoScore');
const currentTurn = document.querySelector('#currentTurn');

const roundText = document.querySelector('#roundText');
const inputText = document.querySelector('#inputText');
const targetScoreText = document.querySelector('#targetScoreText');

const messageTitle = document.querySelector('#messageTitle');
const messageText = document.querySelector('#messageText');

const colorBoard = document.querySelector('#colorBoard');
const colorButtons = document.querySelectorAll('.color-btn');

const COLORS = ['red', 'blue', 'yellow', 'green'];
const WIN_SCORE = 5;

const ROUND_LENGTHS = {
    1: 7,
    2: 8,
    3: 9,
    4: 10,
    5: 15
};

let sequence = [];
let playerInput = [];

let round = 0;
let currentPlayer = 1;
let playerScores = {
    1: 0,
    2: 0
};

let gameState = 'idle';
// idle, showing, input, result, gameover

function updateStatus() {
    roundText.textContent = String(round);
    inputText.textContent = `${playerInput.length} / ${sequence.length}`;
    targetScoreText.textContent = String(WIN_SCORE);

    playerOneScore.textContent = String(playerScores[1]);
    playerTwoScore.textContent = String(playerScores[2]);

    currentTurn.textContent = currentPlayer === 1 ? 'P1' : 'P2';

    playerOneBox.classList.toggle('active', currentPlayer === 1);
    playerTwoBox.classList.toggle('active', currentPlayer === 2);
}

function setMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
}

function setButtonsDisabled(isDisabled) {
    colorButtons.forEach((button) => {
        button.classList.toggle('disabled', isDisabled);
    });
}

function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    return COLORS[randomIndex];
}

function getSequenceLength(roundNumber) {
    return ROUND_LENGTHS[roundNumber] || ROUND_LENGTHS[5];
}

function createSequence(length) {
    return Array.from({ length }, () => getRandomColor());
}

function flashButton(color) {
    const button = document.querySelector(`[data-color="${color}"]`);

    if (!button) return;

    button.classList.add('active');

    setTimeout(() => {
        button.classList.remove('active');
    }, 300);
}

function flashSequenceButton(color) {
    const button = document.querySelector(`[data-color="${color}"]`);

    if (!button) return;

    button.classList.add('show-color');

    setTimeout(() => {
        button.classList.remove('show-color');
    }, 300);
}

function resetGame() {
    sequence = [];
    playerInput = [];
    round = 0;
    currentPlayer = 1;
    playerScores = {
        1: 0,
        2: 0
    };

    gameState = 'idle';

    colorBoard.classList.remove('is-showing');

    startButton.disabled = false;
    setButtonsDisabled(true);

    updateStatus();
    setMessage('색깔 기억 대결', 'START를 누르면 PLAYER 1부터 시작합니다.');
}

function startGame() {
    sequence = [];
    playerInput = [];
    round = 0;
    currentPlayer = 1;
    playerScores = {
        1: 0,
        2: 0
    };

    startButton.disabled = true;

    nextRound();
}

function nextRound() {
    round += 1;

    currentPlayer = 1;
    startPlayerTurn();
}

function startPlayerTurn() {
    gameState = 'showing';
    playerInput = [];

    const sequenceLength = getSequenceLength(round);
    sequence = createSequence(sequenceLength);

    updateStatus();
    setButtonsDisabled(true);

    setMessage(
        `PLAYER ${currentPlayer}`,
        `ROUND ${round} - ${sequenceLength}개의 색깔 순서를 기억하세요.`
    );

    setTimeout(() => {
        showSequence();
    }, 600);
}

function showSequence() {
    let index = 0;

    colorBoard.classList.add('is-showing');

    const showTimer = setInterval(() => {
        flashSequenceButton(sequence[index]);

        index += 1;

        if (index >= sequence.length) {
            clearInterval(showTimer);

            setTimeout(() => {
                colorBoard.classList.remove('is-showing');

                gameState = 'input';
                setButtonsDisabled(false);
                setMessage(`PLAYER ${currentPlayer} 입력`, '방금 본 색깔 순서대로 누르세요.');
            }, 380);
        }
    }, 520);
}

function handleColorClick(color) {
    if (gameState !== 'input') return;

    flashButton(color);

    playerInput.push(color);
    updateStatus();

    const currentIndex = playerInput.length - 1;
    const correctColor = sequence[currentIndex];

    if (color !== correctColor) {
        handleFail();
        return;
    }

    if (playerInput.length === sequence.length) {
        handleSuccess();
    }
}

function handleSuccess() {
    gameState = 'result';
    setButtonsDisabled(true);

    playerScores[currentPlayer] += 1;
    updateStatus();

    if (checkWinner()) return;

    setMessage(`PLAYER ${currentPlayer} 성공!`, `PLAYER ${currentPlayer}가 1점을 얻었습니다.`);

    setTimeout(() => {
        moveNextTurn();
    }, 1000);
}

function handleFail() {
    gameState = 'result';
    setButtonsDisabled(true);

    const opponent = currentPlayer === 1 ? 2 : 1;
    playerScores[opponent] += 1;

    updateStatus();

    if (checkWinner()) return;

    setMessage(`PLAYER ${currentPlayer} 실패!`, `PLAYER ${opponent}가 1점을 얻었습니다.`);

    setTimeout(() => {
        moveNextTurn();
    }, 1100);
}

function moveNextTurn() {
    if (currentPlayer === 1) {
        currentPlayer = 2;
        startPlayerTurn();
        return;
    }

    nextRound();
}

function checkWinner() {
    if (playerScores[1] >= WIN_SCORE) {
        finishGame(1);
        return true;
    }

    if (playerScores[2] >= WIN_SCORE) {
        finishGame(2);
        return true;
    }

    return false;
}

function finishGame(winner) {
    gameState = 'gameover';

    colorBoard.classList.remove('is-showing');

    setButtonsDisabled(true);
    startButton.disabled = false;

    setMessage(
        `PLAYER ${winner} 승리!`,
        `최종 점수는 ${playerScores[1]} : ${playerScores[2]}입니다. START를 눌러 다시 시작하세요.`
    );
}

startButton.addEventListener('click', () => {
    startGame();
});

resetButton.addEventListener('click', () => {
    resetGame();
});

colorButtons.forEach((button) => {
    button.addEventListener('click', () => {
        handleColorClick(button.dataset.color);
    });
});

resetGame();