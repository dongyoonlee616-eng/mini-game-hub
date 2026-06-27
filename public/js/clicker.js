const startClicker = document.querySelector('#startClicker');
const clickTarget = document.querySelector('#clickTarget');
const resetClicker = document.querySelector('#resetClicker');
const timeLeft = document.querySelector('#timeLeft');
const clickCount = document.querySelector('#clickCount');
const cpsResult = document.querySelector('#cpsResult');
const bestCps = document.querySelector('#bestCps');

const STORAGE_KEY = 'mgh_clicker_best_cps';
const GAME_TIME = 5;
const COUNTDOWN_TIME = 3;

let gameState = 'idle';
// idle, countdown, playing, finished

let count = 0;
let startTime = 0;
let frameId = null;
let countdownTimer = null;
let countdownLeft = COUNTDOWN_TIME;

function getBestCps() {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) ? value : 0;
}

function renderBestCps() {
    bestCps.textContent = getBestCps().toFixed(2);
}

function stopTimers() {
    cancelAnimationFrame(frameId);
    clearInterval(countdownTimer);
    frameId = null;
    countdownTimer = null;
}

function resetGameView() {
    stopTimers();

    gameState = 'idle';
    count = 0;
    countdownLeft = COUNTDOWN_TIME;

    timeLeft.textContent = `${GAME_TIME.toFixed(1)}초`;
    clickCount.textContent = '0';
    cpsResult.textContent = '0.00';

    clickTarget.textContent = '대기 중';
    clickTarget.disabled = true;
    clickTarget.classList.remove('finished');

    startClicker.disabled = false;
}

function startCountdown() {
    stopTimers();

    gameState = 'countdown';
    count = 0;
    countdownLeft = COUNTDOWN_TIME;

    clickCount.textContent = '0';
    cpsResult.textContent = '0.00';
    timeLeft.textContent = `${GAME_TIME.toFixed(1)}초`;

    clickTarget.disabled = true;
    clickTarget.classList.remove('finished');
    clickTarget.textContent = String(countdownLeft);

    startClicker.disabled = true;

    countdownTimer = setInterval(() => {
        countdownLeft -= 1;

        if (countdownLeft > 0) {
            clickTarget.textContent = String(countdownLeft);
            return;
        }

        clearInterval(countdownTimer);
        countdownTimer = null;
        startGame();
    }, 1000);
}

function startGame() {
    gameState = 'playing';
    count = 0;
    startTime = Date.now();

    clickTarget.textContent = 'TAP';
    clickTarget.disabled = false;
    clickTarget.classList.remove('finished');

    updateTimer();
}

function updateTimer() {
    const elapsed = (Date.now() - startTime) / 1000;
    const left = Math.max(0, GAME_TIME - elapsed);

    timeLeft.textContent = `${left.toFixed(1)}초`;

    if (left <= 0) {
        finishGame();
        return;
    }

    frameId = requestAnimationFrame(updateTimer);
}

function finishGame() {
    gameState = 'finished';
    stopTimers();

    const cps = count / GAME_TIME;
    const best = getBestCps();

    if (cps > best) {
        localStorage.setItem(STORAGE_KEY, String(cps));
    }

    cpsResult.textContent = cps.toFixed(2);
    renderBestCps();

    clickTarget.textContent = 'FINISH';
    clickTarget.disabled = true;
    clickTarget.classList.add('finished');

    startClicker.disabled = false;
}

startClicker.addEventListener('click', () => {
    resetGameView();
    startCountdown();
});

clickTarget.addEventListener('click', () => {
    if (gameState !== 'playing') return;

    count += 1;
    clickCount.textContent = String(count);
});

resetClicker.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    renderBestCps();
    resetGameView();
});

renderBestCps();
resetGameView();