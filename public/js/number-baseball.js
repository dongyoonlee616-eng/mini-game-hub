const form = document.querySelector('#baseballForm');
const input = document.querySelector('#guessInput');
const newGameButton = document.querySelector('#newBaseballGame');
const attemptCount = document.querySelector('#attemptCount');
const baseballStatus = document.querySelector('#baseballStatus');
const historyList = document.querySelector('#historyList');

let answer = [];
let attempts = 0;
let isFinished = false;

function createAnswer() {
    const numbers = [];

    while (numbers.length < 3) {
        const value = Math.floor(Math.random() * 10);
        if (!numbers.includes(value)) {
            numbers.push(value);
        }
    }

    return numbers;
}

function isValidGuess(value) {
    if (!/^\d{3}$/.test(value)) return false;
    return new Set(value.split('')).size === 3;
}

function checkGuess(guess) {
    const guessArray = guess.split('').map(Number);
    let strike = 0;
    let ball = 0;

    guessArray.forEach((number, index) => {
        if (answer[index] === number) {
            strike += 1;
        } else if (answer.includes(number)) {
            ball += 1;
        }
    });

    return { strike, ball };
}

function addHistory(guess, strike, ball) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${guess}</strong><span>${strike}S ${ball}B</span>`;
    historyList.prepend(li);
}

function startNewGame() {
    answer = createAnswer();
    attempts = 0;
    isFinished = false;
    attemptCount.textContent = '0';
    baseballStatus.textContent = '진행중';
    historyList.innerHTML = '';
    input.value = '';
    input.disabled = false;
    input.focus();
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (isFinished) return;

    const guess = input.value.trim();

    if (!isValidGuess(guess)) {
        baseballStatus.textContent = '서로 다른 3자리 입력';
        input.value = '';
        input.focus();
        return;
    }

    attempts += 1;
    attemptCount.textContent = String(attempts);

    const { strike, ball } = checkGuess(guess);
    addHistory(guess, strike, ball);

    if (strike === 3) {
        isFinished = true;
        input.disabled = true;
        baseballStatus.textContent = '정답';
    } else {
        baseballStatus.textContent = `${strike}S ${ball}B`;
    }

    input.value = '';
    input.focus();
});

newGameButton.addEventListener('click', startNewGame);

startNewGame();
