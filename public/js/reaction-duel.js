const startButton = document.querySelector('#startDuel');
const resetButton = document.querySelector('#resetDuel');

const playerOneBox = document.querySelector('#playerOneBox');
const playerTwoBox = document.querySelector('#playerTwoBox');
const playerOneScoreText = document.querySelector('#playerOneScore');
const playerTwoScoreText = document.querySelector('#playerTwoScore');
const roundText = document.querySelector('#roundText');

const signalBox = document.querySelector('#signalBox');
const signalLabel = document.querySelector('#signalLabel');
const signalText = document.querySelector('#signalText');
const signalHint = document.querySelector('#signalHint');

const playerButtons = document.querySelectorAll('.duel-btn');

const WIN_SCORE = 5;
const MIN_WAIT_TIME = 1200;
const MAX_WAIT_TIME = 3600;
const NEXT_ROUND_DELAY = 1400;

let scores = {
    1: 0,
    2: 0
};

let round = 0;
let roundState = 'idle';
// idle, waiting, ready, locked, gameover

let signalTimer = null;

function updateScore() {
    playerOneScoreText.textContent = String(scores[1]);
    playerTwoScoreText.textContent = String(scores[2]);
    roundText.textContent = String(round);
}

function setSignalBox(state, label, text, hint) {
    signalBox.classList.remove('waiting', 'ready', 'false-start', 'round-win');

    if (state) {
        signalBox.classList.add(state);
    }

    signalLabel.textContent = label;
    signalText.textContent = text;
    signalHint.textContent = hint;
}

function setPlayerButtonsDisabled(isDisabled) {
    playerButtons.forEach((button) => {
        button.disabled = isDisabled;
    });
}

function setActivePlayer(player) {
    playerOneBox.classList.toggle('active', player === 1);
    playerTwoBox.classList.toggle('active', player === 2);

    playerButtons.forEach((button) => {
        button.classList.toggle('active', Number(button.dataset.player) === player);
    });
}

function clearActivePlayer() {
    playerOneBox.classList.remove('active');
    playerTwoBox.classList.remove('active');

    playerButtons.forEach((button) => {
        button.classList.remove('active');
    });
}

function getRandomWaitTime() {
    return Math.floor(
        Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME + 1)
    ) + MIN_WAIT_TIME;
}

function resetGame() {
    clearTimeout(signalTimer);

    scores = {
        1: 0,
        2: 0
    };

    round = 0;
    roundState = 'idle';

    updateScore();
    clearActivePlayer();
    setPlayerButtonsDisabled(true);

    startButton.disabled = false;

    setSignalBox(
        '',
        '대기 중',
        'READY?',
        'START를 누르면 대결이 시작됩니다.'
    );
}

function startGame() {
    scores = {
        1: 0,
        2: 0
    };

    round = 0;
    updateScore();

    startButton.disabled = true;
    startRound();
}

function startRound() {
    clearTimeout(signalTimer);

    round += 1;
    roundState = 'waiting';

    updateScore();
    clearActivePlayer();
    setPlayerButtonsDisabled(false);

    setSignalBox(
        'waiting',
        '준비',
        'WAIT',
        '아직 누르면 반칙입니다. 신호가 뜰 때까지 기다리세요.'
    );

    const waitTime = getRandomWaitTime();

    signalTimer = setTimeout(() => {
        roundState = 'ready';

        setSignalBox(
            'ready',
            '지금!',
            'TAP!',
            '먼저 누르는 플레이어가 점수를 얻습니다.'
        );
    }, waitTime);
}

function handlePlayerPress(player) {
    if (roundState === 'idle' || roundState === 'locked' || roundState === 'gameover') {
        return;
    }

    if (roundState === 'waiting') {
        handleFalseStart(player);
        return;
    }

    if (roundState === 'ready') {
        handleRoundWin(player);
    }
}

function handleFalseStart(player) {
    clearTimeout(signalTimer);

    roundState = 'locked';

    const opponent = player === 1 ? 2 : 1;
    scores[opponent] += 1;

    updateScore();
    setActivePlayer(opponent);

    setSignalBox(
        'false-start',
        `PLAYER ${player} 반칙!`,
        `P${opponent} +1`,
        `신호 전에 눌러서 PLAYER ${opponent}가 점수를 얻었습니다.`
    );

    checkAfterRound();
}

function handleRoundWin(player) {
    roundState = 'locked';

    scores[player] += 1;

    updateScore();
    setActivePlayer(player);

    setSignalBox(
        'round-win',
        `PLAYER ${player} 성공!`,
        `P${player} +1`,
        `PLAYER ${player}가 먼저 눌러 점수를 얻었습니다.`
    );

    checkAfterRound();
}

function checkAfterRound() {
    if (scores[1] >= WIN_SCORE) {
        finishGame(1);
        return;
    }

    if (scores[2] >= WIN_SCORE) {
        finishGame(2);
        return;
    }

    signalTimer = setTimeout(() => {
        startRound();
    }, NEXT_ROUND_DELAY);
}

function finishGame(winner) {
    clearTimeout(signalTimer);

    roundState = 'gameover';

    setPlayerButtonsDisabled(true);
    setActivePlayer(winner);

    startButton.disabled = false;

    setSignalBox(
        'round-win',
        `PLAYER ${winner} 승리!`,
        'WIN',
        `최종 점수는 ${scores[1]} : ${scores[2]}입니다. START를 누르면 다시 시작합니다.`
    );
}

startButton.addEventListener('click', () => {
    startGame();
});

resetButton.addEventListener('click', () => {
    resetGame();
});

playerButtons.forEach((button) => {
    button.addEventListener('pointerdown', () => {
        handlePlayerPress(Number(button.dataset.player));
    });
});

resetGame();