const startButton = document.querySelector('#startTenSeconds');
const stopButton = document.querySelector('#stopTenSeconds');
const resetButton = document.querySelector('#resetTenSeconds');

const currentRecord = document.querySelector('#currentRecord');
const bestRecord = document.querySelector('#bestRecord');

const timerBox = document.querySelector('.time-display-box');
const timerLabel = document.querySelector('#timerLabel');
const timerText = document.querySelector('#timerText');
const timerHint = document.querySelector('#timerHint');

const resultTitle = document.querySelector('#resultTitle');
const resultText = document.querySelector('#resultText');

const STORAGE_KEY = 'mgh_ten_seconds_best_record';

const TARGET_TIME = 10;
const VISIBLE_TIME_LIMIT = 3;

let startTime = 0;
let frameId = null;
let gameState = 'idle';
// idle, running, finished

function getBestRecord() {
    const savedValue = localStorage.getItem(STORAGE_KEY);

    if (savedValue === null) {
        return null;
    }

    try {
        const record = JSON.parse(savedValue);

        if (
            typeof record.time === 'number' &&
            typeof record.diff === 'number' &&
            Number.isFinite(record.time) &&
            Number.isFinite(record.diff)
        ) {
            return record;
        }

        return null;
    } catch {
        return null;
    }
}

function renderBestRecord() {
    const best = getBestRecord();

    if (best === null) {
        bestRecord.textContent = '-';
        return;
    }

    bestRecord.textContent = `${best.time.toFixed(2)}초`;
}

function updateBestRecord(time, diff) {
    const best = getBestRecord();

    if (best === null || diff < best.diff) {
        const newRecord = {
            time,
            diff
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecord));
    }

    renderBestRecord();
}

function setResult(title, text) {
    resultTitle.textContent = title;
    resultText.textContent = text;
}

function getJudge(diff) {
    if (diff <= 0.05) {
        return '완벽에 가까워요!';
    }

    if (diff <= 0.15) {
        return '엄청 정확해요!';
    }

    if (diff <= 0.35) {
        return '꽤 잘 맞췄어요!';
    }

    if (diff <= 0.7) {
        return '조금 아쉬워요.';
    }

    return '다시 도전해보세요.';
}

function resetView() {
    cancelAnimationFrame(frameId);

    gameState = 'idle';
    startTime = 0;
    frameId = null;

    timerBox.classList.remove('is-running', 'is-finished', 'is-hidden-time');

    timerLabel.textContent = '대기 중';
    timerText.textContent = '10.00';
    timerText.style.display = '';
    timerHint.textContent = 'START를 눌러 도전하세요.';

    stopButton.classList.remove('is-visible');

    currentRecord.textContent = '-';

    startButton.disabled = false;
    stopButton.disabled = true;

    setResult('10초 감각 테스트', '10초에 가까울수록 좋은 기록입니다.');
    renderBestRecord();
}

function startGame() {
    cancelAnimationFrame(frameId);

    gameState = 'running';
    startTime = performance.now();

    timerBox.classList.add('is-running');
    timerBox.classList.remove('is-finished', 'is-hidden-time');

    timerLabel.textContent = '진행 중';
    timerText.style.display = '';
    timerHint.textContent = '처음 3초 이후에는 시간이 숨겨집니다.';

    currentRecord.textContent = '-';

    startButton.disabled = true;
    stopButton.disabled = true;
    stopButton.classList.remove('is-visible');

    setResult('집중하세요', '10초라고 느껴지는 순간 STOP을 누르세요.');

    updateTimer();
}

function updateTimer() {
    if (gameState !== 'running') return;

    const elapsed = (performance.now() - startTime) / 1000;

    if (elapsed < VISIBLE_TIME_LIMIT) {
        timerBox.classList.remove('is-hidden-time');

        timerText.style.display = '';
        timerText.textContent = elapsed.toFixed(2);

        stopButton.disabled = true;
        stopButton.classList.remove('is-visible');

        timerHint.textContent = '아직 시간이 보입니다.';
    } else {
        timerBox.classList.add('is-hidden-time');

        timerText.style.display = 'none';

        stopButton.disabled = false;
        stopButton.classList.add('is-visible');

        timerHint.textContent = '이제 감으로 10초를 맞춰야 합니다.';
    }

    frameId = requestAnimationFrame(updateTimer);
}

function stopGame() {
    if (gameState !== 'running') return;

    const elapsed = (performance.now() - startTime) / 1000;
    const diff = Math.abs(TARGET_TIME - elapsed);
    const judge = getJudge(diff);

    cancelAnimationFrame(frameId);

    gameState = 'finished';

    timerBox.classList.remove('is-running', 'is-hidden-time');
    timerBox.classList.add('is-finished');

    stopButton.classList.remove('is-visible');
    stopButton.disabled = true;

    timerText.style.display = '';
    timerLabel.textContent = '결과';
    timerText.textContent = `${elapsed.toFixed(2)}초`;
    timerHint.textContent = `목표 시간과 ${diff.toFixed(2)}초 차이`;

    currentRecord.textContent = `${elapsed.toFixed(2)}초`;

    updateBestRecord(elapsed, diff);

    startButton.disabled = false;
    stopButton.disabled = true;

    setResult(judge, `기록: ${elapsed.toFixed(2)}초 / 오차: ${diff.toFixed(2)}초`);
}

startButton.addEventListener('click', () => {
    startGame();
});

stopButton.addEventListener('click', () => {
    stopGame();
});

resetButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    resetView();
});

resetView();