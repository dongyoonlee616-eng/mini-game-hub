const startButton = document.querySelector('#startIconDuel');
const resetButton = document.querySelector('#resetIconDuel');

const playerOneArea = document.querySelector('#playerOneArea');
const playerTwoArea = document.querySelector('#playerTwoArea');

const playerOneBoard = document.querySelector('#playerOneBoard');
const playerTwoBoard = document.querySelector('#playerTwoBoard');

const playerOneScore = document.querySelector('#playerOneScore');
const playerTwoScore = document.querySelector('#playerTwoScore');
const centerPlayerOneScore = document.querySelector('#centerPlayerOneScore');
const centerPlayerTwoScore = document.querySelector('#centerPlayerTwoScore');

const playerOneState = document.querySelector('#playerOneState');
const playerTwoState = document.querySelector('#playerTwoState');
const roundText = document.querySelector('#roundText');

const messageTitle = document.querySelector('#messageTitle');
const messageText = document.querySelector('#messageText');

const WIN_SCORE = 5;
const ICON_COUNT = 8;
const WRONG_LOCK_TIME = 700;
const NEXT_ROUND_DELAY = 1000;

const ICONS = [
    '🍎', '🍋', '🍇', '🍒', '🍉', '🍓', '🍍', '🥝',
    '⭐', '🌙', '☀️', '⚡', '🔥', '💧', '❄️', '🌈',
    '🚗', '🚀', '✈️', '🚲', '⛵', '🚁', '🚂', '🚌',
    '🐶', '🐱', '🐰', '🐼', '🦊', '🐸', '🐵', '🐧',
    '⚽', '🏀', '🎾', '🎲', '🎮', '🎧', '📚', '🎯',
    '💎', '🔔', '🔑', '🧲', '🛡️', '🎁', '🧩', '🪐'
];

let scores = {
    1: 0,
    2: 0
};

let playerLocked = {
    1: false,
    2: false
};

let round = 0;
let answerIcon = null;
let gameState = 'idle';
// idle, playing, roundEnd, gameover

function setMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
}

function getPlayerStateText(player) {
    if (gameState === 'idle') return '대기';
    if (gameState === 'gameover') return '종료';
    if (gameState === 'roundEnd') return '라운드 종료';
    if (playerLocked[player]) return '오답 잠금';
    return '입력 가능';
}

function updateStatus() {
    playerOneScore.textContent = String(scores[1]);
    playerTwoScore.textContent = String(scores[2]);
    centerPlayerOneScore.textContent = String(scores[1]);
    centerPlayerTwoScore.textContent = String(scores[2]);

    roundText.textContent = String(round);

    playerOneState.textContent = getPlayerStateText(1);
    playerTwoState.textContent = getPlayerStateText(2);

    playerOneArea.classList.toggle('active', gameState === 'playing' && !playerLocked[1]);
    playerTwoArea.classList.toggle('active', gameState === 'playing' && !playerLocked[2]);

    playerOneArea.classList.toggle('wrong', playerLocked[1]);
    playerTwoArea.classList.toggle('wrong', playerLocked[2]);

    updateButtonDisabled();
}

function updateButtonDisabled() {
    const buttons = document.querySelectorAll('.icon-btn');

    buttons.forEach((button) => {
        const player = Number(button.dataset.player);
        button.disabled = gameState !== 'playing' || playerLocked[player];
    });
}

function shuffleArray(array) {
    const copiedArray = [...array];

    for (let i = copiedArray.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [copiedArray[i], copiedArray[randomIndex]] = [copiedArray[randomIndex], copiedArray[i]];
    }

    return copiedArray;
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function createRoundIcons() {
    const shuffledIcons = shuffleArray(ICONS);

    answerIcon = shuffledIcons[0];

    const playerOneOnlyIcons = shuffledIcons.slice(1, 8);
    const playerTwoOnlyIcons = shuffledIcons.slice(8, 15);

    const playerOneIcons = shuffleArray([answerIcon, ...playerOneOnlyIcons]);
    const playerTwoIcons = shuffleArray([answerIcon, ...playerTwoOnlyIcons]);

    return {
        1: playerOneIcons,
        2: playerTwoIcons
    };
}

function getIconPositions() {
    return [
        { x: 50, y: 18 },
        { x: 78, y: 32 },
        { x: 82, y: 64 },
        { x: 56, y: 82 },
        { x: 26, y: 75 },
        { x: 18, y: 45 },
        { x: 34, y: 24 },
        { x: 50, y: 50 }
    ];
}

function renderBoard(boardElement, icons, player) {
    boardElement.innerHTML = '';

    const positions = shuffleArray(getIconPositions());

    icons.forEach((icon, index) => {
        const button = document.createElement('button');
        const position = positions[index];
        const size = getRandomNumber(0.82, 1.42);

        button.className = 'icon-btn';
        button.type = 'button';
        button.textContent = icon;
        button.dataset.icon = icon;
        button.dataset.player = String(player);

        button.style.left = `${position.x}%`;
        button.style.top = `${position.y}%`;
        button.style.fontSize = `${size * 1.7}rem`;

        button.addEventListener('click', () => {
            handleIconClick(player, icon, button);
        });

        boardElement.appendChild(button);
    });
}

function startRound() {
    round += 1;

    playerLocked = {
        1: false,
        2: false
    };

    playerOneArea.classList.remove('winner');
    playerTwoArea.classList.remove('winner');

    gameState = 'playing';

    const roundIcons = createRoundIcons();

    renderBoard(playerOneBoard, roundIcons[1], 1);
    renderBoard(playerTwoBoard, roundIcons[2], 2);

    setMessage('라운드 시작!', '양쪽 원판에서 겹치는 그림 1개를 찾아 먼저 누르세요.');
    updateStatus();
}

function handleIconClick(player, icon, button) {
    if (gameState !== 'playing') return;
    if (playerLocked[player]) return;

    if (icon === answerIcon) {
        handleCorrect(player, button);
        return;
    }

    handleWrong(player, button);
}

function handleCorrect(player, button) {
    gameState = 'roundEnd';
    scores[player] += 1;

    button.classList.add('correct');

    setMessage(
        `PLAYER ${player} 정답!`,
        `겹치는 그림은 ${answerIcon} 입니다. PLAYER ${player}가 1점을 얻었습니다.`
    );

    updateStatus();

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

function handleWrong(player, button) {
    playerLocked[player] = true;

    button.classList.add('wrong');

    setMessage(
        `PLAYER ${player} 오답!`,
        '틀린 그림을 눌러 잠깐 입력할 수 없습니다.'
    );

    updateStatus();

    setTimeout(() => {
        if (gameState !== 'playing') return;

        playerLocked[player] = false;
        setMessage('문제 진행 중', '겹치는 그림 1개를 찾아 누르세요.');
        updateStatus();
    }, WRONG_LOCK_TIME);
}

function finishGame(winner) {
    gameState = 'gameover';

    playerOneArea.classList.toggle('winner', winner === 1);
    playerTwoArea.classList.toggle('winner', winner === 2);

    startButton.disabled = false;

    setMessage(
        `PLAYER ${winner} 승리!`,
        `최종 점수는 ${scores[1]} : ${scores[2]}입니다. START를 누르면 다시 시작합니다.`
    );

    updateStatus();
}

function resetGame() {
    scores = {
        1: 0,
        2: 0
    };

    playerLocked = {
        1: false,
        2: false
    };

    round = 0;
    answerIcon = null;
    gameState = 'idle';

    playerOneBoard.innerHTML = '';
    playerTwoBoard.innerHTML = '';

    playerOneArea.classList.remove('winner');
    playerTwoArea.classList.remove('winner');

    startButton.disabled = false;

    setMessage('같은 그림 찾기 대결', 'START를 누르면 양쪽 원판에서 같은 그림을 찾아 누르세요.');
    updateStatus();
}

function startGame() {
    scores = {
        1: 0,
        2: 0
    };

    round = 0;
    startButton.disabled = true;

    startRound();
}

startButton.addEventListener('click', () => {
    startGame();
});

resetButton.addEventListener('click', () => {
    resetGame();
});

resetGame();