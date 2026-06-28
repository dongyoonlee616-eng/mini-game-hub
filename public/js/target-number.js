const startButton = document.querySelector('#startTargetGame');
const resetButton = document.querySelector('#resetTargetGame');

const timeText = document.querySelector('#timeText');
const scoreText = document.querySelector('#scoreText');
const bestScoreText = document.querySelector('#bestScoreText');

const targetBox = document.querySelector('.target-box');
const targetText = document.querySelector('#targetText');
const messageText = document.querySelector('#messageText');

const expressionText = document.querySelector('#expressionText');
const resultText = document.querySelector('#resultText');

const numberCardBoard = document.querySelector('#numberCardBoard');
const operatorButtons = document.querySelectorAll('.operator-btn');

const clearButton = document.querySelector('#clearExpression');
const undoButton = document.querySelector('#undoExpression');
const submitButton = document.querySelector('#submitExpression');

const STORAGE_KEY = 'mgh_target_number_best_score';

const GAME_TIME = 60;

let score = 0;
let timeLeft = GAME_TIME;
let timerId = null;

let targetNumber = 0;
let numberCards = [];
let expression = [];

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

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    const copiedArray = [...array];

    for (let i = copiedArray.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [copiedArray[i], copiedArray[randomIndex]] = [copiedArray[randomIndex], copiedArray[i]];
    }

    return copiedArray;
}

function evaluateExpression(tokens) {
    if (tokens.length === 0) return null;

    const values = [];
    const operators = [];

    tokens.forEach((token, index) => {
        if (index % 2 === 0) {
            values.push(token.value);
        } else {
            operators.push(token.value);
        }
    });

    for (let i = 0; i < operators.length; i += 1) {
        if (operators[i] !== '×') continue;

        values[i] = values[i] * values[i + 1];
        values.splice(i + 1, 1);
        operators.splice(i, 1);
        i -= 1;
    }

    let result = values[0];

    operators.forEach((operator, index) => {
        if (operator === '+') {
            result += values[index + 1];
        }

        if (operator === '-') {
            result -= values[index + 1];
        }
    });

    return result;
}

function createProblem() {
    for (let attempt = 0; attempt < 100; attempt += 1) {
        const cards = Array.from({ length: 4 }, () => getRandomNumber(1, 9));
        const indexes = shuffleArray([0, 1, 2, 3]).slice(0, 3);
        const operators = ['+', '-', '×'];

        const tokens = [
            { type: 'number', value: cards[indexes[0]], index: indexes[0] },
            { type: 'operator', value: operators[getRandomNumber(0, operators.length - 1)] },
            { type: 'number', value: cards[indexes[1]], index: indexes[1] },
            { type: 'operator', value: operators[getRandomNumber(0, operators.length - 1)] },
            { type: 'number', value: cards[indexes[2]], index: indexes[2] }
        ];

        const target = evaluateExpression(tokens);

        if (target >= 1 && target <= 99) {
            return {
                cards,
                target
            };
        }
    }

    return {
        cards: [2, 3, 5, 7],
        target: 17
    };
}

function isExpectingNumber() {
    if (expression.length === 0) return true;

    const lastToken = expression[expression.length - 1];
    return lastToken.type === 'operator';
}

function isExpectingOperator() {
    if (expression.length === 0) return false;

    const lastToken = expression[expression.length - 1];
    return lastToken.type === 'number';
}

function getUsedCardIndexes() {
    return expression
        .filter((token) => token.type === 'number')
        .map((token) => token.index);
}

function getExpressionResult() {
    if (expression.length < 3) return null;
    if (!isExpectingOperator()) return null;

    return evaluateExpression(expression);
}

function renderStatus() {
    timeText.textContent = String(timeLeft);
    scoreText.textContent = String(score);

    if (expression.length === 0) {
        expressionText.textContent = '-';
    } else {
        expressionText.textContent = expression.map((token) => token.value).join(' ');
    }

    const currentResult = getExpressionResult();

    if (currentResult === null) {
        resultText.textContent = '결과: -';
    } else {
        resultText.textContent = `결과: ${currentResult}`;
    }

    renderCards();
    updateInputDisabled();
}

function renderCards() {
    numberCardBoard.innerHTML = '';

    const usedIndexes = getUsedCardIndexes();

    numberCards.forEach((number, index) => {
        const button = document.createElement('button');

        button.className = 'number-card';
        button.type = 'button';
        button.textContent = String(number);
        button.dataset.index = String(index);

        const isUsed = usedIndexes.includes(index);
        button.classList.toggle('used', isUsed);
        button.disabled = gameState !== 'playing' || isUsed || !isExpectingNumber();

        button.addEventListener('click', () => {
            handleNumberClick(index);
        });

        numberCardBoard.appendChild(button);
    });
}

function updateInputDisabled() {
    const isDisabled = gameState !== 'playing';

    operatorButtons.forEach((button) => {
        button.disabled = isDisabled || !isExpectingOperator() || expression.length >= 7;
    });

    clearButton.disabled = isDisabled || expression.length === 0;
    undoButton.disabled = isDisabled || expression.length === 0;
    submitButton.disabled = isDisabled || getExpressionResult() === null;
}

function setMessage(text) {
    messageText.textContent = text;
}

function clearExpression() {
    expression = [];
    renderStatus();
}

function showNewProblem() {
    const problem = createProblem();

    targetNumber = problem.target;
    numberCards = problem.cards;
    expression = [];

    targetBox.classList.remove('correct', 'wrong');
    targetText.textContent = String(targetNumber);
    setMessage('숫자 카드와 연산자를 눌러 목표 숫자를 만드세요.');

    renderStatus();
}

function resetView() {
    clearInterval(timerId);

    score = 0;
    timeLeft = GAME_TIME;
    targetNumber = 0;
    numberCards = [];
    expression = [];
    gameState = 'idle';

    targetBox.classList.remove('correct', 'wrong');
    targetText.textContent = '?';
    setMessage('START를 누르면 숫자 카드가 나옵니다.');

    startButton.disabled = false;

    numberCardBoard.innerHTML = '';

    renderStatus();
    renderBestScore();
}

function startGame() {
    clearInterval(timerId);

    score = 0;
    timeLeft = GAME_TIME;
    gameState = 'playing';

    startButton.disabled = true;

    showNewProblem();

    timerId = setInterval(() => {
        timeLeft -= 1;
        renderStatus();

        if (timeLeft <= 0) {
            finishGame();
        }
    }, 1000);
}

function finishGame() {
    clearInterval(timerId);

    gameState = 'finished';

    updateBestScore();

    startButton.disabled = false;

    targetBox.classList.remove('correct', 'wrong');
    targetText.textContent = 'END';
    setMessage(`최종 점수는 ${score}점입니다. START를 눌러 다시 도전하세요.`);

    renderStatus();
}

function handleNumberClick(index) {
    if (gameState !== 'playing') return;
    if (!isExpectingNumber()) return;

    expression.push({
        type: 'number',
        value: numberCards[index],
        index
    });

    renderStatus();
}

function handleOperatorClick(operator) {
    if (gameState !== 'playing') return;
    if (!isExpectingOperator()) return;
    if (expression.length >= 7) return;

    expression.push({
        type: 'operator',
        value: operator
    });

    renderStatus();
}

function submitExpression() {
    if (gameState !== 'playing') return;

    const result = getExpressionResult();

    if (result === null) return;

    if (result === targetNumber) {
        handleCorrect();
        return;
    }

    handleWrong();
}

function handleCorrect() {
    score += 1;
    gameState = 'locked';

    targetBox.classList.remove('wrong');
    targetBox.classList.add('correct');
    setMessage('정답입니다! 다음 문제로 넘어갑니다.');

    renderStatus();

    setTimeout(() => {
        if (gameState !== 'locked') return;

        gameState = 'playing';
        showNewProblem();
    }, 650);
}

function handleWrong() {
    gameState = 'locked';

    targetBox.classList.remove('correct');
    targetBox.classList.add('wrong');
    setMessage('목표 숫자와 다릅니다. 식을 다시 만들어보세요.');

    renderStatus();

    setTimeout(() => {
        if (gameState !== 'locked') return;

        gameState = 'playing';
        expression = [];
        targetBox.classList.remove('wrong');
        setMessage('숫자 카드와 연산자를 눌러 목표 숫자를 만드세요.');
        renderStatus();
    }, 800);
}

operatorButtons.forEach((button) => {
    button.addEventListener('click', () => {
        handleOperatorClick(button.dataset.op);
    });
});

clearButton.addEventListener('click', () => {
    clearExpression();
});

undoButton.addEventListener('click', () => {
    expression.pop();
    renderStatus();
});

submitButton.addEventListener('click', () => {
    submitExpression();
});

startButton.addEventListener('click', () => {
    startGame();
});

resetButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    resetView();
});

resetView();