const startButton = document.querySelector('#startMathDuel');
const resetButton = document.querySelector('#resetMathDuel');

const playerOneArea = document.querySelector('#playerOneArea');
const playerTwoArea = document.querySelector('#playerTwoArea');

const playerOneAnswer = document.querySelector('#playerOneAnswer');
const playerTwoAnswer = document.querySelector('#playerTwoAnswer');

const playerOneState = document.querySelector('#playerOneState');
const playerTwoState = document.querySelector('#playerTwoState');

const playerOneScore = document.querySelector('#playerOneScore');
const playerTwoScore = document.querySelector('#playerTwoScore');
const roundText = document.querySelector('#roundText');

const topQuestionText = document.querySelector('#topQuestionText');
const bottomQuestionText = document.querySelector('#bottomQuestionText');

const messageTitle = document.querySelector('#messageTitle');
const messageText = document.querySelector('#messageText');

const playerOneKeypad = document.querySelector('#playerOneKeypad');
const playerTwoKeypad = document.querySelector('#playerTwoKeypad');

const WIN_SCORE = 5;
const MAX_INPUT_LENGTH = 4;
const WRONG_LOCK_TIME = 600;
const NEXT_ROUND_DELAY = 1000;
const COUNTDOWN_TIME = 3;

let scores = {
    1: 0,
    2: 0
};

let inputs = {
    1: '',
    2: ''
};

let playerLocked = {
    1: false,
    2: false
};

let round = 0;
let currentQuestion = null;
let countdownTimer = null;
let gameState = 'idle';
// idle, countdown, playing, roundEnd, gameover

function getOpponent(player) {
    return player === 1 ? 2 : 1;
}

function setMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
}

function getInputText(player) {
    return inputs[player] || '0';
}

function updateStatus() {
    playerOneAnswer.textContent = getInputText(1);
    playerTwoAnswer.textContent = getInputText(2);

    playerOneScore.textContent = String(scores[1]);
    playerTwoScore.textContent = String(scores[2]);
    roundText.textContent = String(round);

    playerOneState.textContent = getPlayerStateText(1);
    playerTwoState.textContent = getPlayerStateText(2);

    playerOneArea.classList.toggle('active', gameState === 'playing' && !playerLocked[1]);
    playerTwoArea.classList.toggle('active', gameState === 'playing' && !playerLocked[2]);

    playerOneArea.classList.toggle('wrong', playerLocked[1]);
    playerTwoArea.classList.toggle('wrong', playerLocked[2]);

    updateKeypadDisabled();
}

function getPlayerStateText(player) {
    if (gameState === 'idle') return '대기';
    if (gameState === 'countdown') return '준비';
    if (gameState === 'gameover') return '종료';
    if (gameState === 'roundEnd') return '라운드 종료';
    if (playerLocked[player]) return '오답 잠금';
    return '입력 가능';
}

function updateQuestionText(text) {
    topQuestionText.textContent = text;
    bottomQuestionText.textContent = text;
}

function createKeypad(container, player) {
    const keys = [
        { label: '7', key: '7' },
        { label: '8', key: '8' },
        { label: '9', key: '9' },

        { label: '4', key: '4' },
        { label: '5', key: '5' },
        { label: '6', key: '6' },

        { label: '1', key: '1' },
        { label: '2', key: '2' },
        { label: '3', key: '3' },

        { label: '0', key: '0' },
        { label: '←', key: 'back' },
        { label: '제출', key: 'ok', className: 'ok' }
    ];

    container.innerHTML = '';

    keys.forEach((item) => {
        const button = document.createElement('button');

        button.className = item.className ? `duel-key ${item.className}` : 'duel-key';
        button.type = 'button';
        button.textContent = item.label;
        button.dataset.player = String(player);
        button.dataset.key = item.key;

        button.addEventListener('click', () => {
            handleKeyInput(player, item.key);
        });

        container.appendChild(button);
    });
}

function updateKeypadDisabled() {
    const keypadButtons = document.querySelectorAll('.duel-key');

    keypadButtons.forEach((button) => {
        const player = Number(button.dataset.player);
        button.disabled = gameState !== 'playing' || playerLocked[player];
    });
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createAdditionQuestion() {
    const a = getRandomNumber(1, 40);
    const b = getRandomNumber(1, 40);

    return {
        text: `${a} + ${b}`,
        answer: a + b
    };
}

function createSubtractionQuestion() {
    const a = getRandomNumber(10, 80);
    const b = getRandomNumber(1, a);

    return {
        text: `${a} - ${b}`,
        answer: a - b
    };
}

function createMultiplicationQuestion() {
    const a = getRandomNumber(2, 9);
    const b = getRandomNumber(2, 9);

    return {
        text: `${a} × ${b}`,
        answer: a * b
    };
}

function createDivisionQuestion() {
    const answerValue = getRandomNumber(2, 12);
    const divisor = getRandomNumber(2, 9);
    const dividend = answerValue * divisor;

    return {
        text: `${dividend} ÷ ${divisor}`,
        answer: answerValue
    };
}

function createQuestion() {
    const questionTypes = [
        createAdditionQuestion,
        createSubtractionQuestion,
        createMultiplicationQuestion,
        createDivisionQuestion
    ];

    const randomIndex = getRandomNumber(0, questionTypes.length - 1);
    return questionTypes[randomIndex]();
}

function resetGame() {
    clearInterval(countdownTimer);
    
    scores = {
        1: 0,
        2: 0
    };

    inputs = {
        1: '',
        2: ''
    };

    playerLocked = {
        1: false,
        2: false
    };

    round = 0;
    currentQuestion = null;
    gameState = 'idle';

    playerOneArea.classList.remove('winner');
    playerTwoArea.classList.remove('winner');

    startButton.disabled = false;

    updateQuestionText('READY?');
    setMessage('계산 대결', 'START를 누르면 같은 문제를 동시에 풉니다.');
    updateStatus();
}

function startGame() {
    clearInterval(countdownTimer);

    scores = {
        1: 0,
        2: 0
    };

    inputs = {
        1: '',
        2: ''
    };

    playerLocked = {
        1: false,
        2: false
    };

    round = 0;
    currentQuestion = null;
    gameState = 'countdown';

    playerOneArea.classList.remove('winner');
    playerTwoArea.classList.remove('winner');

    startButton.disabled = true;

    let count = COUNTDOWN_TIME;

    updateQuestionText(String(count));
    setMessage('준비', '3초 뒤 계산 대결이 시작됩니다.');
    updateStatus();

    countdownTimer = setInterval(() => {
        count -= 1;

        if (count > 0) {
            updateQuestionText(String(count));
            setMessage('준비', `${count}초 뒤 계산 대결이 시작됩니다.`);
            return;
        }

        clearInterval(countdownTimer);
        startRound();
    }, 1000);
}

function startRound() {
    round += 1;

    inputs = {
        1: '',
        2: ''
    };

    playerLocked = {
        1: false,
        2: false
    };

    currentQuestion = createQuestion();
    gameState = 'playing';

    updateQuestionText(`${currentQuestion.text} = ?`);
    setMessage('문제 시작!', '먼저 정답을 입력하고 OK를 누른 플레이어가 1점을 얻습니다.');

    updateStatus();
}

function handleKeyInput(player, key) {
    if (gameState !== 'playing') return;
    if (playerLocked[player]) return;

    if (key === 'clear') {
        inputs[player] = '';
        updateStatus();
        return;
    }

    if (key === 'back') {
        inputs[player] = inputs[player].slice(0, -1);
        updateStatus();
        return;
    }

    if (key === 'ok') {
        submitAnswer(player);
        return;
    }

    if (inputs[player].length >= MAX_INPUT_LENGTH) return;

    if (inputs[player] === '0') {
        inputs[player] = key;
    } else {
        inputs[player] += key;
    }

    updateStatus();
}

function submitAnswer(player) {
    if (inputs[player] === '') return;

    const playerAnswer = Number(inputs[player]);

    if (playerAnswer === currentQuestion.answer) {
        handleCorrectAnswer(player);
        return;
    }

    handleWrongAnswer(player);
}

function handleCorrectAnswer(player) {
    gameState = 'roundEnd';
    scores[player] += 1;

    inputs = {
        1: '',
        2: ''
    };

    updateStatus();

    setMessage(
        `PLAYER ${player} 정답!`,
        `정답은 ${currentQuestion.answer}입니다. PLAYER ${player}가 1점을 얻었습니다.`
    );

    if (scores[player] >= WIN_SCORE) {
        finishGame(player);
        return;
    }

    setTimeout(() => {
        if (gameState === 'roundEnd') {
            startRound();
        }
    }, NEXT_ROUND_DELAY);
}

function handleWrongAnswer(player) {
    playerLocked[player] = true;
    inputs[player] = '';

    updateStatus();

    setMessage(
        `PLAYER ${player} 오답!`,
        `PLAYER ${player}는 잠깐 입력할 수 없습니다.`
    );

    setTimeout(() => {
        if (gameState !== 'playing') return;

        playerLocked[player] = false;

        setMessage('문제 진행 중', '먼저 정답을 입력하고 OK를 누르세요.');
        updateStatus();
    }, WRONG_LOCK_TIME);
}

function finishGame(winner) {
    gameState = 'gameover';

    playerOneArea.classList.toggle('winner', winner === 1);
    playerTwoArea.classList.toggle('winner', winner === 2);

    startButton.disabled = false;

    updateStatus();
    updateQuestionText('WIN!');

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

createKeypad(playerOneKeypad, 1);
createKeypad(playerTwoKeypad, 2);

resetGame();