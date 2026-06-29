const startButton = document.querySelector('#startJudgement');
const resetButton = document.querySelector('#resetJudgement');

const timeText = document.querySelector('#timeText');
const scoreText = document.querySelector('#scoreText');
const bestScoreText = document.querySelector('#bestScoreText');

const challengeBox = document.querySelector('.judge-challenge-box');
const challengeLabel = document.querySelector('#challengeLabel');
const challengeText = document.querySelector('#challengeText');
const challengeHint = document.querySelector('#challengeHint');

const optionButtons = document.querySelectorAll('.judge-option-btn');

const STORAGE_KEY = 'mgh_quick_judgement_best_score';

const GAME_TIME = 30;

const COLORS = [
    {
        key: 'red',
        name: '빨강'
    },
    {
        key: 'blue',
        name: '파랑'
    },
    {
        key: 'yellow',
        name: '노랑'
    },
    {
        key: 'green',
        name: '초록'
    }
];

let score = 0;
let timeLeft = GAME_TIME;
let timerId = null;
let currentAnswer = null;
let gameState = 'idle';
// idle, playing, locked, finished

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

function getRandomItem(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function setOptionButtonsDisabled(isDisabled) {
    optionButtons.forEach((button) => {
        button.disabled = isDisabled;
    });
}

function updateStatus() {
    timeText.textContent = String(timeLeft);
    scoreText.textContent = String(score);
}

function clearChallengeColor() {
    COLORS.forEach((color) => {
        challengeText.classList.remove(color.key);
    });
}

function createChallenge() {
    const wordColor = getRandomItem(COLORS);
    const textColor = getRandomItem(COLORS);
    const mode = Math.random() < 0.5 ? 'meaning' : 'color';

    challengeBox.classList.remove('correct', 'wrong');
    clearChallengeColor();

    challengeText.textContent = wordColor.name;
    challengeText.classList.add(textColor.key);

    if (mode === 'meaning') {
        challengeLabel.textContent = '단어 뜻을 고르세요';
        challengeHint.textContent = '글자 색이 아니라 단어의 뜻을 보고 고르세요.';
        currentAnswer = wordColor.key;
        return;
    }

    challengeLabel.textContent = '글자색을 고르세요';
    challengeHint.textContent = '단어 뜻이 아니라 글자의 색을 보고 고르세요.';
    currentAnswer = textColor.key;
}

function resetView() {
    clearInterval(timerId);

    score = 0;
    timeLeft = GAME_TIME;
    currentAnswer = null;
    gameState = 'idle';

    challengeBox.classList.remove('correct', 'wrong');
    clearChallengeColor();

    challengeLabel.textContent = '문제';
    challengeText.textContent = 'READY?';
    challengeHint.textContent = 'START를 누르면 판단 문제가 시작됩니다.';

    startButton.disabled = false;
    setOptionButtonsDisabled(true);

    updateStatus();
    renderBestScore();
}

function startGame() {
    clearInterval(timerId);

    score = 0;
    timeLeft = GAME_TIME;
    gameState = 'playing';

    startButton.disabled = true;
    setOptionButtonsDisabled(false);

    updateStatus();
    createChallenge();

    timerId = setInterval(() => {
        timeLeft -= 1;
        updateStatus();

        if (timeLeft <= 0) {
            finishGame();
        }
    }, 1000);
}

function handleOptionClick(selectedColor) {
    if (gameState !== 'playing') return;

    if (selectedColor === currentAnswer) {
        handleCorrect();
        return;
    }

    handleWrong();
}

function handleCorrect() {
    score += 1;
    gameState = 'locked';

    challengeBox.classList.remove('wrong');
    challengeBox.classList.add('correct');
    challengeHint.textContent = '정답입니다! 다음 문제로 넘어갑니다.';

    updateStatus();
    setOptionButtonsDisabled(true);

    setTimeout(() => {
        if (gameState !== 'locked') return;

        gameState = 'playing';
        setOptionButtonsDisabled(false);
        createChallenge();
    }, 220);
}

function handleWrong() {
    const answerName = COLORS.find((color) => color.key === currentAnswer).name;

    gameState = 'locked';

    challengeBox.classList.remove('correct');
    challengeBox.classList.add('wrong');
    challengeHint.textContent = `오답입니다. 정답은 ${answerName}입니다.`;

    setOptionButtonsDisabled(true);

    setTimeout(() => {
        if (gameState !== 'locked') return;

        gameState = 'playing';
        setOptionButtonsDisabled(false);
        createChallenge();
    }, 520);
}

function finishGame() {
    clearInterval(timerId);

    gameState = 'finished';

    updateBestScore();

    startButton.disabled = false;
    setOptionButtonsDisabled(true);

    challengeBox.classList.remove('correct', 'wrong');
    clearChallengeColor();

    challengeLabel.textContent = '종료';
    challengeText.textContent = 'TIME UP';
    challengeHint.textContent = `최종 점수는 ${score}점입니다. START를 눌러 다시 도전하세요.`;

    updateStatus();
}

startButton.addEventListener('click', () => {
    startGame();
});

resetButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    resetView();
});

optionButtons.forEach((button) => {
    button.addEventListener('click', () => {
        handleOptionClick(button.dataset.color);
    });
});

resetView();