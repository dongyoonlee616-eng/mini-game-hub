const startButton = document.querySelector('#startMath');
const submitButton = document.querySelector('#submitMath');
const resetButton = document.querySelector('#resetMath');

const timeText = document.querySelector('#timeText');
const scoreText = document.querySelector('#scoreText');
const bestScoreText = document.querySelector('#bestScoreText');

const questionBox = document.querySelector('.math-question-box');
const questionLabel = document.querySelector('#questionLabel');
const questionText = document.querySelector('#questionText');
const questionHint = document.querySelector('#questionHint');

const answerText = document.querySelector('#answerText');
const keypadButtons = document.querySelectorAll('.keypad-btn');

const STORAGE_KEY = 'mgh_quick_math_best_score';

const GAME_TIME = 30;
const MAX_INPUT_LENGTH = 4;

let score = 0;
let timeLeft = GAME_TIME;
let answer = '';
let currentQuestion = null;
let timerId = null;
let gameState = 'idle';
// idle, playing, finished

function getBestScore() {
    const savedValue = localStorage.getItem(STORAGE_KEY);

    if (savedValue === null) {
        return 0;
    }

    const value = Number(savedValue);
    return Number.isFinite(value) ? value : 0;
}

function renderBestScore() {
    bestScoreText.textContent = String(getBestScore());
}

function updateBestScore() {
    const bestScore = getBestScore();

    if (score > bestScore) {
        localStorage.setItem(STORAGE_KEY, String(score));
    }

    renderBestScore();
}

function setButtonsDisabled(isDisabled) {
    keypadButtons.forEach((button) => {
        button.disabled = isDisabled;
    });

    submitButton.disabled = isDisabled;
}

function updateStatus() {
    timeText.textContent = String(timeLeft);
    scoreText.textContent = String(score);
    answerText.textContent = answer || '0';
}

function clearAnswer() {
    answer = '';
    updateStatus();
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

function showQuestion() {
    currentQuestion = createQuestion();

    questionBox.classList.remove('correct', 'wrong');
    questionLabel.textContent = '문제';
    questionText.textContent = `${currentQuestion.text} = ?`;
    questionHint.textContent = '키패드로 답을 입력한 뒤 제출하세요.';

    clearAnswer();
}

function resetView() {
    clearInterval(timerId);

    score = 0;
    timeLeft = GAME_TIME;
    answer = '';
    currentQuestion = null;
    gameState = 'idle';

    questionBox.classList.remove('correct', 'wrong');

    questionLabel.textContent = '문제';
    questionText.textContent = 'READY?';
    questionHint.textContent = 'START를 누르면 30초 동안 문제가 나옵니다.';

    startButton.disabled = false;
    setButtonsDisabled(true);

    updateStatus();
    renderBestScore();
}

function startGame() {
    clearInterval(timerId);

    score = 0;
    timeLeft = GAME_TIME;
    answer = '';
    gameState = 'playing';

    startButton.disabled = true;
    setButtonsDisabled(false);

    updateStatus();
    showQuestion();

    timerId = setInterval(() => {
        timeLeft -= 1;
        updateStatus();

        if (timeLeft <= 0) {
            finishGame();
        }
    }, 1000);
}

function submitAnswer() {
    if (gameState !== 'playing') return;
    if (answer === '') return;

    const playerAnswer = Number(answer);

    if (playerAnswer === currentQuestion.answer) {
        handleCorrect();
        return;
    }

    handleWrong();
}

function handleCorrect() {
    score += 1;
    questionBox.classList.remove('wrong');
    questionBox.classList.add('correct');

    questionLabel.textContent = '정답';
    questionHint.textContent = '좋아요! 다음 문제로 넘어갑니다.';

    updateStatus();

    setTimeout(() => {
        if (gameState === 'playing') {
            showQuestion();
        }
    }, 260);
}

function handleWrong() {
    questionBox.classList.remove('correct');
    questionBox.classList.add('wrong');

    questionLabel.textContent = '오답';
    questionHint.textContent = `정답은 ${currentQuestion.answer}입니다. 다음 문제로 넘어갑니다.`;

    updateStatus();

    setTimeout(() => {
        if (gameState === 'playing') {
            showQuestion();
        }
    }, 520);
}

function finishGame() {
    clearInterval(timerId);

    gameState = 'finished';

    updateBestScore();

    startButton.disabled = false;
    setButtonsDisabled(true);

    questionBox.classList.remove('correct', 'wrong');

    questionLabel.textContent = '종료';
    questionText.textContent = 'TIME UP';
    questionHint.textContent = `최종 점수는 ${score}점입니다. START를 눌러 다시 도전하세요.`;

    clearAnswer();
}

function handleKeypadInput(key) {
    if (gameState !== 'playing') return;

    if (key === 'clear') {
        clearAnswer();
        return;
    }

    if (key === 'back') {
        answer = answer.slice(0, -1);
        updateStatus();
        return;
    }

    if (answer.length >= MAX_INPUT_LENGTH) return;

    if (answer === '0') {
        answer = key;
    } else {
        answer += key;
    }

    updateStatus();
}

startButton.addEventListener('click', () => {
    startGame();
});

submitButton.addEventListener('click', () => {
    submitAnswer();
});

resetButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    resetView();
});

keypadButtons.forEach((button) => {
    button.addEventListener('click', () => {
        handleKeypadInput(button.dataset.key);
    });
});

resetView();