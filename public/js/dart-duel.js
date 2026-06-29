
const dartPage = document.querySelector('#dartPage');
const canvas = document.querySelector('#dartCanvas');
const ctx = canvas.getContext('2d');

const playerOneScore = document.querySelector('#playerOneScore');
const playerTwoScore = document.querySelector('#playerTwoScore');
const phaseLabel = document.querySelector('#phaseLabel');
const turnText = document.querySelector('#turnText');

const messageTitle = document.querySelector('#messageTitle');
const messageText = document.querySelector('#messageText');

const roundText = document.querySelector('#roundText');
const stepText = document.querySelector('#stepText');
const lastScoreText = document.querySelector('#lastScoreText');

const xIndicator = document.querySelector('#xIndicator');
const yIndicator = document.querySelector('#yIndicator');

const mainActionButton = document.querySelector('#mainAction');
const resetButton = document.querySelector('#resetDartGame');

const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const TURNS_PER_PLAYER = 5;
const AIM_SPEED = 0.72;

let phase = 'idle';
// idle, aim-x, aim-y, result, finished

let currentPlayer = 1;

let scores = {
    1: 0,
    2: 0
};

let turnsTaken = {
    1: 0,
    2: 0
};

let aimX = 0.5;
let aimY = 0.5;
let xDirection = 1;
let yDirection = 1;

let animationId = null;
let lastFrameTime = 0;

let lastShot = null;

function setMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
}

function getOpponent(player) {
    return player === 1 ? 2 : 1;
}

function getCurrentRoundText() {
    const playerTurnCount = turnsTaken[currentPlayer] + 1;
    const safeTurnCount = Math.min(playerTurnCount, TURNS_PER_PLAYER);
    return `${safeTurnCount} / ${TURNS_PER_PLAYER}`;
}

function getBoardGeometry() {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.38;

    return {
        centerX,
        centerY,
        radius
    };
}

function setIndicatorPositions() {
    xIndicator.style.left = `${aimX * 100}%`;
    yIndicator.style.top = `${aimY * 100}%`;
}

function applyView() {
    dartPage.classList.toggle('flipped', currentPlayer === 2 && phase !== 'idle' && phase !== 'finished');
}

function updateHeader() {
    playerOneScore.textContent = String(scores[1]);
    playerTwoScore.textContent = String(scores[2]);

    if (phase === 'idle') {
        phaseLabel.textContent = 'READY';
        turnText.textContent = 'P1';
        stepText.textContent = '대기';
    }

    if (phase === 'aim-x') {
        phaseLabel.textContent = '가로';
        turnText.textContent = `P${currentPlayer}`;
        stepText.textContent = '가로 조준';
    }

    if (phase === 'aim-y') {
        phaseLabel.textContent = '세로';
        turnText.textContent = `P${currentPlayer}`;
        stepText.textContent = '세로 조준';
    }

    if (phase === 'result') {
        phaseLabel.textContent = '결과';
        turnText.textContent = `P${currentPlayer}`;
        stepText.textContent = '발사 완료';
    }

    if (phase === 'finished') {
        phaseLabel.textContent = 'END';
        turnText.textContent = '-';
        stepText.textContent = '종료';
    }

    if (phase === 'idle') {
        roundText.textContent = `1 / ${TURNS_PER_PLAYER}`;
    } else if (phase === 'finished') {
        roundText.textContent = `${TURNS_PER_PLAYER} / ${TURNS_PER_PLAYER}`;
    } else {
        roundText.textContent = getCurrentRoundText();
    }

    if (lastShot) {
        lastScoreText.textContent = `${lastShot.label} (${lastShot.score})`;
    } else {
        lastScoreText.textContent = '-';
    }

    if (phase === 'idle') {
        mainActionButton.textContent = 'START';
        mainActionButton.disabled = false;
    }

    if (phase === 'aim-x') {
        mainActionButton.textContent = '가로 멈추기';
        mainActionButton.disabled = false;
    }

    if (phase === 'aim-y') {
        mainActionButton.textContent = '세로 멈추기';
        mainActionButton.disabled = false;
    }

    if (phase === 'result') {
        if (isGameFinished()) {
            mainActionButton.textContent = '결과 보기';
        } else {
            mainActionButton.textContent = `P${getOpponent(currentPlayer)} 턴 넘기기`;
        }

        mainActionButton.disabled = false;
    }

    if (phase === 'finished') {
        mainActionButton.textContent = '다시 시작';
        mainActionButton.disabled = false;
    }

    applyView();
}

function resetAim() {
    aimX = Math.random();
    aimY = Math.random();
    xDirection = Math.random() < 0.5 ? -1 : 1;
    yDirection = Math.random() < 0.5 ? -1 : 1;
    setIndicatorPositions();
}

function drawWedge(innerRadius, outerRadius, startAngle, endAngle, color) {
    const { centerX, centerY } = getBoardGeometry();

    ctx.beginPath();
    ctx.moveTo(
        centerX + Math.cos(startAngle) * innerRadius,
        centerY + Math.sin(startAngle) * innerRadius
    );
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    ctx.lineTo(
        centerX + Math.cos(endAngle) * innerRadius,
        centerY + Math.sin(endAngle) * innerRadius
    );
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawDartboard() {
    const { centerX, centerY, radius } = getBoardGeometry();
    const sectorAngle = (Math.PI * 2) / 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const outerRadius = radius;
    const doubleInner = radius * 0.86;
    const tripleOuter = radius * 0.58;
    const tripleInner = radius * 0.50;
    const bullOuter = radius * 0.18;
    const bullInner = radius * 0.08;

    for (let i = 0; i < 20; i += 1) {
        const startAngle = -Math.PI / 2 - sectorAngle / 2 + i * sectorAngle;
        const endAngle = startAngle + sectorAngle;

        const isDark = i % 2 === 0;
        const singleColor = isDark ? '#111111' : '#f8f8f8';
        const ringColor = isDark ? '#00c9a5' : '#a865c8';

        drawWedge(tripleOuter, doubleInner, startAngle, endAngle, singleColor);
        drawWedge(doubleInner, outerRadius, startAngle, endAngle, ringColor);
        drawWedge(bullOuter, tripleInner, startAngle, endAngle, singleColor);
        drawWedge(tripleInner, tripleOuter, startAngle, endAngle, ringColor);
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, bullOuter, 0, Math.PI * 2);
    ctx.fillStyle = '#f6f6f6';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, bullInner, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4d4d';
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111111';

    for (let i = 0; i < 20; i += 1) {
        const angle = -Math.PI / 2 - sectorAngle / 2 + i * sectorAngle;

        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * bullInner, centerY + Math.sin(angle) * bullInner);
        ctx.lineTo(centerX + Math.cos(angle) * outerRadius, centerY + Math.sin(angle) * outerRadius);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, doubleInner, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, tripleOuter, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, tripleInner, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, bullOuter, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#111111';
    ctx.stroke();

    ctx.font = '900 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#111111';

    for (let i = 0; i < 20; i += 1) {
        const angle = -Math.PI / 2 + i * sectorAngle;
        const numberRadius = radius * 1.12;
        const x = centerX + Math.cos(angle) * numberRadius;
        const y = centerY + Math.sin(angle) * numberRadius;

        ctx.fillText(String(SECTORS[i]), x, y);
    }
}

function drawAimPreview() {
    if (phase !== 'aim-x' && phase !== 'aim-y') {
        return;
    }

    const { centerX, centerY, radius } = getBoardGeometry();
    const previewX = centerX + (aimX - 0.5) * 2 * radius;
    const previewY = centerY + (aimY - 0.5) * 2 * radius;

    ctx.save();
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.22)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(previewX, centerY - radius);
    ctx.lineTo(previewX, centerY + radius);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - radius, previewY);
    ctx.lineTo(centerX + radius, previewY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(previewX, previewY, 7, 0, Math.PI * 2);
    ctx.fillStyle = currentPlayer === 1 ? '#3d7cff' : '#ff4d4d';
    ctx.fill();

    ctx.restore();
}

function drawLastShot() {
    if (!lastShot) {
        return;
    }

    const { centerX, centerY, radius } = getBoardGeometry();
    const shotX = centerX + lastShot.normalizedX * radius;
    const shotY = centerY + lastShot.normalizedY * radius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(shotX, shotY, 8, 0, Math.PI * 2);
    ctx.fillStyle = lastShot.player === 1 ? '#3d7cff' : '#ff4d4d';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(shotX, shotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
}

function drawBoard() {
    drawDartboard();
    drawAimPreview();
    drawLastShot();
}

function updateView() {
    updateHeader();
    setIndicatorPositions();
    drawBoard();
}

function animate(now) {
    if (phase !== 'aim-x' && phase !== 'aim-y') {
        return;
    }

    if (!lastFrameTime) {
        lastFrameTime = now;
    }

    const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.04);
    lastFrameTime = now;

    if (phase === 'aim-x') {
        aimX += xDirection * AIM_SPEED * deltaTime;

        if (aimX <= 0) {
            aimX = 0;
            xDirection = 1;
        }

        if (aimX >= 1) {
            aimX = 1;
            xDirection = -1;
        }
    }

    if (phase === 'aim-y') {
        aimY += yDirection * AIM_SPEED * deltaTime;

        if (aimY <= 0) {
            aimY = 0;
            yDirection = 1;
        }

        if (aimY >= 1) {
            aimY = 1;
            yDirection = -1;
        }
    }

    updateView();
    animationId = requestAnimationFrame(animate);
}

function startAnimation() {
    cancelAnimationFrame(animationId);
    lastFrameTime = 0;
    animationId = requestAnimationFrame(animate);
}

function stopAnimation() {
    cancelAnimationFrame(animationId);
    lastFrameTime = 0;
}

function getShotResult() {
    const normalizedX = (aimX - 0.5) * 2;
    const normalizedY = (aimY - 0.5) * 2;

    const radiusValue = Math.sqrt(normalizedX ** 2 + normalizedY ** 2);

    if (radiusValue > 1) {
        return {
            player: currentPlayer,
            label: 'MISS',
            score: 0,
            normalizedX,
            normalizedY
        };
    }

    if (radiusValue <= 0.08) {
        return {
            player: currentPlayer,
            label: 'BULL',
            score: 50,
            normalizedX,
            normalizedY
        };
    }

    if (radiusValue <= 0.18) {
        return {
            player: currentPlayer,
            label: 'OUTER BULL',
            score: 25,
            normalizedX,
            normalizedY
        };
    }

    const sectorAngle = (Math.PI * 2) / 20;
    const angleFromTopClockwise = (Math.atan2(normalizedY, normalizedX) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    const sectorIndex = Math.floor((angleFromTopClockwise + sectorAngle / 2) / sectorAngle) % 20;
    const baseScore = SECTORS[sectorIndex];

    if (radiusValue >= 0.86 && radiusValue <= 1) {
        return {
            player: currentPlayer,
            label: `DOUBLE ${baseScore}`,
            score: baseScore * 2,
            normalizedX,
            normalizedY
        };
    }

    if (radiusValue >= 0.50 && radiusValue <= 0.58) {
        return {
            player: currentPlayer,
            label: `TRIPLE ${baseScore}`,
            score: baseScore * 3,
            normalizedX,
            normalizedY
        };
    }

    return {
        player: currentPlayer,
        label: `SINGLE ${baseScore}`,
        score: baseScore,
        normalizedX,
        normalizedY
    };
}

function isGameFinished() {
    return turnsTaken[1] >= TURNS_PER_PLAYER && turnsTaken[2] >= TURNS_PER_PLAYER;
}

function startTurn() {
    phase = 'aim-x';
    resetAim();

    setMessage(
        `PLAYER ${currentPlayer} 차례`,
        '가로 바를 보고 타이밍에 맞춰 멈추세요.'
    );

    updateView();
    startAnimation();
}

function handleHorizontalStop() {
    phase = 'aim-y';

    setMessage(
        `PLAYER ${currentPlayer} 세로 조준`,
        '이제 세로 바를 보고 타이밍에 맞춰 멈추세요.'
    );

    updateView();
    startAnimation();
}

function handleVerticalStop() {
    stopAnimation();

    const shot = getShotResult();
    lastShot = shot;
    scores[currentPlayer] += shot.score;
    turnsTaken[currentPlayer] += 1;
    phase = 'result';

    setMessage(
        `PLAYER ${currentPlayer} 발사 완료`,
        `${shot.label} / ${shot.score}점입니다.`
    );

    updateView();
}

function finishGame() {
    phase = 'finished';

    if (scores[1] > scores[2]) {
        setMessage(
            'PLAYER 1 승리!',
            `최종 점수는 ${scores[1]} : ${scores[2]}입니다.`
        );
    } else if (scores[2] > scores[1]) {
        setMessage(
            'PLAYER 2 승리!',
            `최종 점수는 ${scores[1]} : ${scores[2]}입니다.`
        );
    } else {
        setMessage(
            '무승부!',
            `최종 점수는 ${scores[1]} : ${scores[2]}입니다.`
        );
    }

    updateView();
}

function goNextTurn() {
    if (isGameFinished()) {
        finishGame();
        return;
    }

    currentPlayer = getOpponent(currentPlayer);
    startTurn();
}

function startGame() {
    stopAnimation();

    phase = 'idle';
    currentPlayer = 1;

    scores = {
        1: 0,
        2: 0
    };

    turnsTaken = {
        1: 0,
        2: 0
    };

    lastShot = null;

    startTurn();
}

function resetGame() {
    stopAnimation();

    phase = 'idle';
    currentPlayer = 1;

    scores = {
        1: 0,
        2: 0
    };

    turnsTaken = {
        1: 0,
        2: 0
    };

    lastShot = null;

    aimX = 0.5;
    aimY = 0.5;
    xDirection = 1;
    yDirection = 1;

    setMessage('다트 대결', 'START를 누르면 PLAYER 1부터 조준을 시작합니다.');

    updateView();
}

function handleMainAction() {
    if (phase === 'idle') {
        startGame();
        return;
    }

    if (phase === 'aim-x') {
        handleHorizontalStop();
        return;
    }

    if (phase === 'aim-y') {
        handleVerticalStop();
        return;
    }

    if (phase === 'result') {
        goNextTurn();
        return;
    }

    if (phase === 'finished') {
        startGame();
    }
}

mainActionButton.addEventListener('click', () => {
    handleMainAction();
});

resetButton.addEventListener('click', () => {
    resetGame();
});

document.addEventListener('gesturestart', (event) => {
    event.preventDefault();
});

document.addEventListener('gesturechange', (event) => {
    event.preventDefault();
});

document.addEventListener('gestureend', (event) => {
    event.preventDefault();
});

window.addEventListener('resize', () => {
    drawBoard();
});

resetGame();