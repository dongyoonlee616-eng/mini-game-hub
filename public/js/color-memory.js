const startButton = document.querySelector('#startColorMemory');
const resetButton = document.querySelector('#resetColorMemory');

const roundText = document.querySelector('#roundText');
const inputText = document.querySelector('#inputText');
const bestRoundText = document.querySelector('#bestRoundText');

const messageTitle = document.querySelector('#messageTitle');
const messageText = document.querySelector('#messageText');

const colorButtons = document.querySelectorAll('.color-btn');
const colorBoard = document.querySelector('#colorBoard');

const STORAGE_KEY = 'mgh_color_memory_best_round';

const COLORS = ['red', 'blue', 'yellow', 'green'];

let sequence = [];
let playerInput = [];
let round = 0;
let gameState = 'idle';
// idle, showing, input, gameover

function getBestRound() {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) ? value : 0;
}

function saveBestRound() {
    const bestRound = getBestRound();

    if (round > bestRound) {
        localStorage.setItem(STORAGE_KEY, String(round));
    }
}

function renderBestRound() {
    bestRoundText.textContent = String(getBestRound());
}

function updateStatus() {
    roundText.textContent = String(round);
    inputText.textContent = `${playerInput.length} / ${sequence.length}`;
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

function flashButton(color) {
    const button = document.querySelector(`[data-color="${color}"]`);

    if (!button) return;

    button.classList.add('active');

    setTimeout(() => {
        button.classList.remove('active');
    }, 420);
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
    gameState = 'idle';

    colorBoard.classList.remove('is-showing');

    startButton.disabled = false;
    setButtonsDisabled(true);

    updateStatus();
    renderBestRound();

    setMessage('색깔 기억하기', 'START를 누르면 게임이 시작됩니다.');
}

function startGame() {
    sequence = [];
    playerInput = [];
    round = 0;

    startButton.disabled = true;

    nextRound();
}

function nextRound() {
    gameState = 'showing';
    playerInput = [];
    round += 1;

    sequence.push(getRandomColor());

    updateStatus();
    setButtonsDisabled(true);

    setMessage(`ROUND ${round}`, '색깔 순서를 기억하세요.');

    showSequence();
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
                setMessage('입력 시작', '방금 본 색깔 순서대로 누르세요.');
            }, 300);
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
        finishGame();
        return;
    }

    if (playerInput.length === sequence.length) {
        gameState = 'showing';
        setButtonsDisabled(true);

        setMessage('성공!', '잠시 후 다음 라운드로 넘어갑니다.');

        setTimeout(() => {
            nextRound();
        }, 900);
    }
}

function finishGame() {
    gameState = 'gameover';

    colorBoard.classList.remove('is-showing');

    setButtonsDisabled(true);
    saveBestRound();
    renderBestRound();

    setMessage('GAME OVER', `최종 기록은 ${round}라운드입니다. START를 눌러 다시 도전하세요.`);

    startButton.disabled = false;
}

startButton.addEventListener('click', () => {
    startGame();
});

resetButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    resetGame();
});

colorButtons.forEach((button) => {
    button.addEventListener('click', () => {
        handleColorClick(button.dataset.color);
    });
});

resetGame();