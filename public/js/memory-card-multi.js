const multiMemorySetup = document.querySelector('#multiMemorySetup');
const multiMemoryGame = document.querySelector('#multiMemoryGame');
const sizeButtons = document.querySelectorAll('.memory-size-btn');

const memoryBoard = document.querySelector('#memoryBoard');
const boardSizeText = document.querySelector('#boardSize');
const tryCountText = document.querySelector('#tryCount');
const matchCountText = document.querySelector('#matchCount');

const playerOneBox = document.querySelector('#playerOneBox');
const playerTwoBox = document.querySelector('#playerTwoBox');
const playerOneScoreText = document.querySelector('#playerOneScore');
const playerTwoScoreText = document.querySelector('#playerTwoScore');
const currentTurnText = document.querySelector('#currentTurn');

const memoryMessage = document.querySelector('#memoryMessage');

const restartMultiMemory = document.querySelector('#restartMultiMemory');
const changeSizeMultiMemory = document.querySelector('#changeSizeMultiMemory');

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

let currentPlayer = 1;
let playerScores = {
    1: 0,
    2: 0
};

let tryCount = 0;
let matchCount = 0;
let pairCount = 0;

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

function updateStatus() {
    boardSizeText.textContent = `${currentSize}×${currentSize}`;
    tryCountText.textContent = String(tryCount);
    matchCountText.textContent = `${matchCount} / ${pairCount}`;

    playerOneScoreText.textContent = String(playerScores[1]);
    playerTwoScoreText.textContent = String(playerScores[2]);

    currentTurnText.textContent = currentPlayer === 1 ? 'P1' : 'P2';

    playerOneBox.classList.toggle('active', currentPlayer === 1);
    playerTwoBox.classList.toggle('active', currentPlayer === 2);
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

    currentPlayer = 1;
    playerScores = {
        1: 0,
        2: 0
    };

    tryCount = 0;
    matchCount = 0;

    memoryMessage.textContent = 'PLAYER 1부터 시작합니다.';

    updateStatus();
    renderBoard();
}

function startGame(size) {
    multiMemorySetup.classList.add('is-hidden');
    multiMemoryGame.classList.remove('is-hidden');

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

        playerScores[currentPlayer] += 1;
        matchCount += 1;

        openedCards = [];
        isLocked = false;

        memoryMessage.textContent = `PLAYER ${currentPlayer} 정답! 한 번 더 진행합니다.`;

        updateStatus();
        checkClear();
    }, 350);
}

function handleMismatch(first, second) {
    setTimeout(() => {
        first.element.classList.remove('is-open');
        second.element.classList.remove('is-open');

        switchTurn();

        openedCards = [];
        isLocked = false;

        memoryMessage.textContent = `틀렸습니다. PLAYER ${currentPlayer} 차례입니다.`;

        updateStatus();
    }, 700);
}

function switchTurn() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
}

function checkClear() {
    if (matchCount !== pairCount) return;

    isLocked = true;

    if (playerScores[1] > playerScores[2]) {
        memoryMessage.textContent = `PLAYER 1 승리! ${playerScores[1]} : ${playerScores[2]}`;
        return;
    }

    if (playerScores[2] > playerScores[1]) {
        memoryMessage.textContent = `PLAYER 2 승리! ${playerScores[1]} : ${playerScores[2]}`;
        return;
    }

    memoryMessage.textContent = `무승부! ${playerScores[1]} : ${playerScores[2]}`;
}

function showSizeSelect() {
    multiMemorySetup.classList.remove('is-hidden');
    multiMemoryGame.classList.add('is-hidden');

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

restartMultiMemory.addEventListener('click', () => {
    if (!currentSize) return;
    resetGameState(currentSize);
});

changeSizeMultiMemory.addEventListener('click', () => {
    showSizeSelect();
});