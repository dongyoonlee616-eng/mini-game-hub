const reactionBox = document.querySelector('#reactionBox');
const reactionTitle = document.querySelector('#reactionTitle');
const reactionText = document.querySelector('#reactionText');
const startButton = document.querySelector('#startReaction');
const resetButton = document.querySelector('#resetReaction');
const currentReaction = document.querySelector('#currentReaction');
const bestReaction = document.querySelector('#bestReaction');

const STORAGE_KEY = 'mgh_reaction_best';
let state = 'idle';
let timerId = null;
let readyTime = 0;

function getBestRecord() {
    const record = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(record) && record > 0 ? record : null;
}

function renderBestRecord() {
    const best = getBestRecord();
    bestReaction.textContent = best ? `${best}ms` : '-';
}

function setBox(nextState, title, text) {
    reactionBox.className = `reaction-box ${nextState}`;
    reactionTitle.textContent = title;
    reactionText.textContent = text;
}

function startGame() {
    clearTimeout(timerId);
    state = 'waiting';
    currentReaction.textContent = '-';
    startButton.disabled = true;
    setBox('waiting', '기다리는 중', '아직 누르지 마세요.');

    const delay = Math.floor(Math.random() * 3000) + 1500;
    timerId = setTimeout(() => {
        state = 'ready';
        readyTime = Date.now();
        setBox('ready', '지금!', '바로 터치하세요.');
    }, delay);
}

function handleReaction() {
    if (state === 'idle') return;

    if (state === 'waiting') {
        clearTimeout(timerId);
        state = 'idle';
        startButton.disabled = false;
        currentReaction.textContent = '실패';
        setBox('fail', '너무 빨랐어요', '다시 시작해보세요.');
        return;
    }

    if (state === 'ready') {
        const result = Date.now() - readyTime;
        const best = getBestRecord();

        if (!best || result < best) {
            localStorage.setItem(STORAGE_KEY, String(result));
        }

        state = 'idle';
        startButton.disabled = false;
        currentReaction.textContent = `${result}ms`;
        renderBestRecord();
        setBox('idle', `${result}ms`, best && result >= best ? '좋아요. 다시 도전해보세요.' : '새 최고 기록입니다!');
    }
}

function resetRecord() {
    localStorage.removeItem(STORAGE_KEY);
    renderBestRecord();
    currentReaction.textContent = '-';
    setBox('idle', '준비 완료', '시작 버튼을 누르세요.');
}

startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetRecord);
reactionBox.addEventListener('click', handleReaction);
reactionBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') handleReaction();
});

renderBestRecord();
