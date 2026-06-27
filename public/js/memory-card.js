const memorySetup = document.querySelector('#memorySetup');
const memoryGame = document.querySelector('#memoryGame');
const sizeButtons = document.querySelectorAll('.memory-size-btn');

const memoryBoard = document.querySelector('#memoryBoard');
const boardSizeText = document.querySelector('#boardSize');
const tryCountText = document.querySelector('#tryCount');
const matchCountText = document.querySelector('#matchCount');
const playTimeText = document.querySelector('#playTime');
const memoryMessage = document.querySelector('#memoryMessage');

const restartMemory = document.querySelector('#restartMemory');
const changeSizeMemory = document.querySelector('#changeSizeMemory');

const CARD_SYMBOLS = [
    '🍎', '🍌', '🍇', '🍓', '🍒', '🍍',
    '🥝', '🍉', '🍑', '🥕', '🌽', '🍔',
    '🍕', '🍩', '🍪', '🍫', '⚽', '🏀',
    '🎮', '🎲', '🚗', '🚀', '🐶', '🐱',
    '🐼', '🦊', '🐸', '🐵', '🐧', '🐳'
];

let currentSize = 0;
let cards = [];
let openedCards = [];
let isLocked = false;

let tryCount = 0;
let matchCount = 0;
let pairCount = 0;

let timerId = null;
let startTime = 0;

function shuffle(array) {
    const copiedArray = [...array];

    for (let i = copiedArray.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [copiedArray[i], copiedArray[randomIndex]] = [copiedArray[randomIndex], copiedArray[i]];
    }

    return copiedArray;
}

function createDeck(size) {
    const totalCardCount = size * size;
    const hasBonusCard = totalCardCount % 2 === 1;

    pairCount = Math.floor(totalCardCount / 2);

    const selectedSymbols = CARD_SYMBOLS.slice(0, pairCount);

    const pairCards = selectedSymbols.flatMap((symbol, index) => [
        {
            id: `card-${index}-a`,
            pairId: `pair-${index}`,
            symbol,
            isMatched: false,
            isBonus: false
        },
        {
            id: `card-${index}-b`,
            pairId: `pair-${index}`,
            symbol,
            isMatched: false,
            isBonus: false
        }
    ]);

    if (hasBonusCard) {
        pairCards.push({
            id: 'bonus-card',
            pairId: 'bonus',
            symbol: '⭐',
            isMatched: true,
            isBonus: true
        });
    }

    return shuffle(pairCards);
}

function startTimer() {
    clearInterval(timerId);
    startTime = Date.now();

    timerId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        playTimeText.textContent = `${elapsed}초`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerId);
    timerId = null;
}

function updateStatus() {
    boardSizeText.textContent = `${currentSize}×${currentSize}`;
    tryCountText.textContent = String(tryCount);
    matchCountText.textContent = `${matchCount} / ${pairCount}`;
}

function createCardElement(card, index) {
    const button = document.createElement('button');

    button.className = 'memory-card';
    button.type = 'button';
    button.dataset.index = String(index);

    if (card.isBonus) {
        button.classList.add('is-bonus');
    }

    button.innerHTML = `
        <span class="memory-card-face card-back">?</span>
        <span class="memory-card-face card-front">${card.symbol}</span>
    `;

    button.addEventListener('click', () => {
        openCard(index);
    });

    return button;
}

function renderBoard() {
    memoryBoard.innerHTML = '';
    memoryBoard.style.setProperty('--memory-cols', currentSize);
    memoryBoard.dataset.size = String(currentSize);

    cards.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        memoryBoard.appendChild(cardElement);
    });
}

function resetGameState(size) {
    currentSize = size;
    cards = createDeck(size);

    openedCards = [];
    isLocked = false;
    tryCount = 0;
    matchCount = 0;

    playTimeText.textContent = '0초';
    memoryMessage.textContent = '카드 두 장을 선택하세요.';

    updateStatus();
    renderBoard();
    startTimer();
}

function startGame(size) {
    memorySetup.classList.add('is-hidden');
    memoryGame.classList.remove('is-hidden');

    resetGameState(size);
}

function openCard(index) {
    if (isLocked) return;

    const selectedCard = cards[index];
    const selectedCardElement = memoryBoard.children[index];

    if (!selectedCard || selectedCard.isMatched) return;
    if (selectedCardElement.classList.contains('is-open')) return;

    selectedCardElement.classList.add('is-open');
    openedCards.push({
        card: selectedCard,
        element: selectedCardElement
    });

    if (openedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    isLocked = true;
    tryCount += 1;
    updateStatus();

    const [first, second] = openedCards;
    const isSamePair = first.card.pairId === second.card.pairId;

    if (isSamePair) {
        handleMatch(first, second);
        return;
    }

    handleMismatch(first, second);
}

function handleMatch(first, second) {
    setTimeout(() => {
        first.card.isMatched = true;
        second.card.isMatched = true;

        first.element.classList.remove('is-open');
        second.element.classList.remove('is-open');

        first.element.classList.add('is-matched');
        second.element.classList.add('is-matched');

        matchCount += 1;
        openedCards = [];
        isLocked = false;

        updateStatus();
        checkClear();
    }, 350);
}

function handleMismatch(first, second) {
    setTimeout(() => {
        first.element.classList.remove('is-open');
        second.element.classList.remove('is-open');

        openedCards = [];
        isLocked = false;

        memoryMessage.textContent = '다시 기억해서 맞춰보세요.';
    }, 650);
}

function checkClear() {
    if (matchCount !== pairCount) {
        memoryMessage.textContent = '좋아요. 계속 맞춰보세요.';
        return;
    }

    stopTimer();

    memoryMessage.textContent = `CLEAR! ${tryCount}번 시도해서 성공했습니다.`;
    isLocked = true;
}

function showSizeSelect() {
    stopTimer();

    memorySetup.classList.remove('is-hidden');
    memoryGame.classList.add('is-hidden');

    memoryBoard.innerHTML = '';
    openedCards = [];
    isLocked = false;
}

sizeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const selectedSize = Number(button.dataset.size);
        startGame(selectedSize);
    });
});

restartMemory.addEventListener('click', () => {
    if (!currentSize) return;
    resetGameState(currentSize);
});

changeSizeMemory.addEventListener('click', () => {
    showSizeSelect();
});