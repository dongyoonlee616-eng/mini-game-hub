const canvas = document.querySelector('#territoryCanvas');
const ctx = canvas.getContext('2d');

const startButton = document.querySelector('#startTerritoryGame');
const resetButton = document.querySelector('#resetTerritoryGame');

const playerOneJoystick = document.querySelector('#playerOneJoystick');
const playerTwoJoystick = document.querySelector('#playerTwoJoystick');

const playerOnePercent = document.querySelector('#playerOnePercent');
const playerTwoPercent = document.querySelector('#playerTwoPercent');
const playerOneCells = document.querySelector('#playerOneCells');
const playerTwoCells = document.querySelector('#playerTwoCells');
const timeLeftText = document.querySelector('#timeLeftText');

const messageTitle = document.querySelector('#messageTitle');
const messageText = document.querySelector('#messageText');

const GAME_TIME = 30;
const GRID_COLS = 22;
const GRID_ROWS = 22;
const PLAYER_SPEED = 145;

const COLLISION_PUSH = 22;
const COLLISION_COOLDOWN = 260;
const COLLISION_PARTICLE_COUNT = 18;
const SPLASH_PAINT_COUNT = 14;
const SPLASH_RADIUS = 2;

const PLAYER_COLORS = {
    1: '#3d7cff',
    2: '#ff4d4d'
};

const PLAYER_LIGHT_COLORS = {
    1: '#dbe8ff',
    2: '#ffe1e1'
};

let canvasWidth = 320;
let canvasHeight = 320;
let animationId = null;
let startTime = 0;
let lastFrameTime = 0;
let lastCollisionTime = -Infinity;
let gameState = 'idle';
// idle, playing, gameover

let particles = [];

let board = [];

const players = {
    1: {
        x: 80,
        y: 160,
        radius: 12
    },
    2: {
        x: 240,
        y: 160,
        radius: 12
    }
};

const joystickState = {
    1: {
        active: false,
        pointerId: null,
        x: 0,
        y: 0
    },
    2: {
        active: false,
        pointerId: null,
        x: 0,
        y: 0
    }
};

function setMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
}

function createEmptyBoard() {
    board = Array.from({ length: GRID_ROWS }, () => {
        return Array.from({ length: GRID_COLS }, () => 0);
    });
}

function resizeCanvas() {
    const oldWidth = canvasWidth;
    const oldHeight = canvasHeight;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvasWidth = rect.width;
    canvasHeight = rect.height;

    canvas.width = Math.floor(canvasWidth * dpr);
    canvas.height = Math.floor(canvasHeight * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (oldWidth > 0 && oldHeight > 0) {
        players[1].x = (players[1].x / oldWidth) * canvasWidth;
        players[1].y = (players[1].y / oldHeight) * canvasHeight;
        players[2].x = (players[2].x / oldWidth) * canvasWidth;
        players[2].y = (players[2].y / oldHeight) * canvasHeight;
    }

    clampPlayerPosition(1);
    clampPlayerPosition(2);
    draw();
}

function resetPlayers() {
    players[1].x = canvasWidth * 0.25;
    players[1].y = canvasHeight * 0.5;

    players[2].x = canvasWidth * 0.75;
    players[2].y = canvasHeight * 0.5;
}

function getCellSize() {
    return {
        width: canvasWidth / GRID_COLS,
        height: canvasHeight / GRID_ROWS
    };
}

function getCellPosition(x, y) {
    const cellSize = getCellSize();

    const col = Math.min(
        Math.max(Math.floor(x / cellSize.width), 0),
        GRID_COLS - 1
    );

    const row = Math.min(
        Math.max(Math.floor(y / cellSize.height), 0),
        GRID_ROWS - 1
    );

    return {
        row,
        col
    };
}

function paintPlayerCell(playerNumber) {
    const player = players[playerNumber];
    const cell = getCellPosition(player.x, player.y);

    board[cell.row][cell.col] = playerNumber;
}

function createCollisionParticles(x, y) {
    for (let i = 0; i < COLLISION_PARTICLE_COUNT; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 55 + Math.random() * 140;

        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 5,
            life: 0.45 + Math.random() * 0.25,
            maxLife: 0.45 + Math.random() * 0.25,
            color: Math.random() < 0.5 ? PLAYER_COLORS[1] : PLAYER_COLORS[2]
        });
    }
}

function updateParticles(deltaTime) {
    particles.forEach((particle) => {
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        particle.vx *= 0.98;
        particle.vy *= 0.98;

        particle.life -= deltaTime;
    });

    particles = particles.filter((particle) => particle.life > 0);
}

function drawParticles() {
    particles.forEach((particle) => {
        const alpha = Math.max(particle.life / particle.maxLife, 0);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}

function paintSplashAround(x, y) {
    const centerCell = getCellPosition(x, y);

    for (let i = 0; i < SPLASH_PAINT_COUNT; i += 1) {
        const rowOffset = Math.floor(Math.random() * (SPLASH_RADIUS * 2 + 1)) - SPLASH_RADIUS;
        const colOffset = Math.floor(Math.random() * (SPLASH_RADIUS * 2 + 1)) - SPLASH_RADIUS;

        const row = centerCell.row + rowOffset;
        const col = centerCell.col + colOffset;

        if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
            continue;
        }

        board[row][col] = Math.random() < 0.5 ? 1 : 2;
    }
}

function handlePlayerCollision(now) {
    const playerOne = players[1];
    const playerTwo = players[2];

    const dx = playerTwo.x - playerOne.x;
    const dy = playerTwo.y - playerOne.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = playerOne.radius + playerTwo.radius;

    if (distance >= minDistance - 1) {
        return;
    }

    if (now - lastCollisionTime < COLLISION_COOLDOWN) {
        return;
    }

    lastCollisionTime = now;

    let nx = 1;
    let ny = 0;

    if (distance > 0.001) {
        nx = dx / distance;
        ny = dy / distance;
    }

    const hitX = (playerOne.x + playerTwo.x) / 2;
    const hitY = (playerOne.y + playerTwo.y) / 2;

    createCollisionParticles(hitX, hitY);
    paintSplashAround(hitX, hitY);

    const overlap = minDistance - distance;
    const pushDistance = COLLISION_PUSH + overlap;

    playerOne.x -= nx * (pushDistance / 2);
    playerOne.y -= ny * (pushDistance / 2);

    playerTwo.x += nx * (pushDistance / 2);
    playerTwo.y += ny * (pushDistance / 2);

    clampPlayerPosition(1);
    clampPlayerPosition(2);

    paintPlayerCell(1);
    paintPlayerCell(2);
}

function countCells() {
    let playerOneCount = 0;
    let playerTwoCount = 0;

    board.forEach((row) => {
        row.forEach((owner) => {
            if (owner === 1) {
                playerOneCount += 1;
            }

            if (owner === 2) {
                playerTwoCount += 1;
            }
        });
    });

    return {
        playerOneCount,
        playerTwoCount,
        total: GRID_COLS * GRID_ROWS
    };
}

function updateScoreDisplay() {
    const counts = countCells();

    const p1Percent = Math.round((counts.playerOneCount / counts.total) * 100);
    const p2Percent = Math.round((counts.playerTwoCount / counts.total) * 100);

    playerOneCells.textContent = String(counts.playerOneCount);
    playerTwoCells.textContent = String(counts.playerTwoCount);

    playerOnePercent.textContent = `${p1Percent}%`;
    playerTwoPercent.textContent = `${p2Percent}%`;
}

function updateTimeDisplay() {
    if (gameState !== 'playing') {
        timeLeftText.textContent = String(GAME_TIME);
        return;
    }

    const elapsedTime = (performance.now() - startTime) / 1000;
    const timeLeft = Math.max(0, GAME_TIME - elapsedTime);

    timeLeftText.textContent = String(Math.ceil(timeLeft));
}

function resetGame() {
    cancelAnimationFrame(animationId);

    gameState = 'idle';
    startTime = 0;
    lastFrameTime = 0;
    lastCollisionTime = -Infinity;
    particles = [];

    resetJoystick(1);
    resetJoystick(2);
    createEmptyBoard();
    resetPlayers();

    startButton.disabled = false;

    paintPlayerCell(1);
    paintPlayerCell(2);

    updateScoreDisplay();
    updateTimeDisplay();

    setMessage('영역 점령전', 'START를 누른 뒤 조이스틱으로 캐릭터를 움직여 땅을 점령하세요.');

    draw();
}

function startGame() {
    cancelAnimationFrame(animationId);

    gameState = 'playing';
    startTime = performance.now();
    lastFrameTime = startTime;
    lastCollisionTime = -Infinity;
    particles = [];

    createEmptyBoard();
    resetPlayers();

    paintPlayerCell(1);
    paintPlayerCell(2);

    startButton.disabled = true;

    setMessage('게임 진행 중', '제한 시간 안에 더 많은 땅을 자신의 색으로 바꾸세요.');

    updateScoreDisplay();
    updateTimeDisplay();

    loop(startTime);
}

function finishGame() {
    gameState = 'gameover';

    cancelAnimationFrame(animationId);

    resetJoystick(1);
    resetJoystick(2);

    startButton.disabled = false;

    const counts = countCells();

    let title = '무승부!';
    let text = `P1 ${counts.playerOneCount}칸, P2 ${counts.playerTwoCount}칸을 점령했습니다.`;

    if (counts.playerOneCount > counts.playerTwoCount) {
        title = 'PLAYER 1 승리!';
        text = `PLAYER 1이 ${counts.playerOneCount}칸을 점령해 승리했습니다.`;
    }

    if (counts.playerTwoCount > counts.playerOneCount) {
        title = 'PLAYER 2 승리!';
        text = `PLAYER 2가 ${counts.playerTwoCount}칸을 점령해 승리했습니다.`;
    }

    setMessage(title, text);

    updateScoreDisplay();
    draw();
}

function clampPlayerPosition(playerNumber) {
    const player = players[playerNumber];

    player.x = Math.min(
        Math.max(player.x, player.radius + 2),
        canvasWidth - player.radius - 2
    );

    player.y = Math.min(
        Math.max(player.y, player.radius + 2),
        canvasHeight - player.radius - 2
    );
}

function updatePlayers(deltaTime) {
    [1, 2].forEach((playerNumber) => {
        const player = players[playerNumber];
        const joystick = joystickState[playerNumber];

        player.x += joystick.x * PLAYER_SPEED * deltaTime;
        player.y += joystick.y * PLAYER_SPEED * deltaTime;

        clampPlayerPosition(playerNumber);
        paintPlayerCell(playerNumber);
    });
}

function updateGame(now) {
    const elapsedTime = (now - startTime) / 1000;

    if (elapsedTime >= GAME_TIME) {
        finishGame();
        return;
    }

    updateTimeDisplay();
    updateScoreDisplay();
}

function drawBoard() {
    const cellSize = getCellSize();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    for (let row = 0; row < GRID_ROWS; row += 1) {
        for (let col = 0; col < GRID_COLS; col += 1) {
            const owner = board[row][col];

            if (owner === 0) {
                ctx.fillStyle = '#fffaf0';
            } else {
                ctx.fillStyle = PLAYER_LIGHT_COLORS[owner];
            }

            ctx.fillRect(
                col * cellSize.width,
                row * cellSize.height,
                cellSize.width,
                cellSize.height
            );
        }
    }

    ctx.strokeStyle = 'rgba(17, 17, 17, 0.08)';
    ctx.lineWidth = 1;

    for (let col = 0; col <= GRID_COLS; col += 1) {
        const x = col * cellSize.width;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    for (let row = 0; row <= GRID_ROWS; row += 1) {
        const y = row * cellSize.height;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
}

function drawPlayer(playerNumber) {
    const player = players[playerNumber];

    ctx.save();

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(17, 17, 17, 0.2)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = PLAYER_COLORS[playerNumber];
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#111111';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`P${playerNumber}`, player.x, player.y + 0.5);

    ctx.restore();
}

function drawCenterText(text) {
    ctx.save();

    ctx.font = '900 44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#111111';

    ctx.strokeText(text, canvasWidth / 2, canvasHeight / 2);
    ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

    ctx.restore();
}

function draw() {
    drawBoard();
    drawParticles();
    drawPlayer(1);
    drawPlayer(2);

    if (gameState === 'idle') {
        drawCenterText('READY?');
    }

    if (gameState === 'gameover') {
        drawCenterText('TIME UP');
    }
}

function loop(now) {
    if (gameState !== 'playing') return;

    const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.04);

    lastFrameTime = now;

    updatePlayers(deltaTime);
    handlePlayerCollision(now);
    updateParticles(deltaTime);
    updateGame(now);
    draw();

    if (gameState === 'playing') {
        animationId = requestAnimationFrame(loop);
    }
}

function resetJoystick(playerNumber) {
    const state = joystickState[playerNumber];
    const joystick = playerNumber === 1 ? playerOneJoystick : playerTwoJoystick;
    const stick = joystick.querySelector('.joystick-stick');

    state.active = false;
    state.pointerId = null;
    state.x = 0;
    state.y = 0;

    stick.style.transform = 'translate(-50%, -50%)';
}

function updateJoystick(playerNumber, joystick, event) {
    const state = joystickState[playerNumber];
    const stick = joystick.querySelector('.joystick-stick');

    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;

    const maxDistance = Math.min(rect.width, rect.height) * 0.34;
    const distance = Math.sqrt(rawX * rawX + rawY * rawY);
    const limitedDistance = Math.min(distance, maxDistance);

    const angle = Math.atan2(rawY, rawX);

    const limitedX = Math.cos(angle) * limitedDistance;
    const limitedY = Math.sin(angle) * limitedDistance;

    state.x = limitedX / maxDistance;
    state.y = limitedY / maxDistance;

    if (distance === 0) {
        state.x = 0;
        state.y = 0;
    }

    stick.style.transform = `translate(calc(-50% + ${limitedX}px), calc(-50% + ${limitedY}px))`;
}

function setupJoystick(joystick, playerNumber) {
    joystick.addEventListener('pointerdown', (event) => {
        event.preventDefault();

        const state = joystickState[playerNumber];

        state.active = true;
        state.pointerId = event.pointerId;

        joystick.setPointerCapture(event.pointerId);
        updateJoystick(playerNumber, joystick, event);
    });

    joystick.addEventListener('pointermove', (event) => {
        const state = joystickState[playerNumber];

        if (!state.active) return;
        if (state.pointerId !== event.pointerId) return;

        event.preventDefault();
        updateJoystick(playerNumber, joystick, event);
    });

    joystick.addEventListener('pointerup', (event) => {
        const state = joystickState[playerNumber];

        if (state.pointerId !== event.pointerId) return;

        resetJoystick(playerNumber);
    });

    joystick.addEventListener('pointercancel', (event) => {
        const state = joystickState[playerNumber];

        if (state.pointerId !== event.pointerId) return;

        resetJoystick(playerNumber);
    });
}

startButton.addEventListener('click', () => {
    startGame();
});

resetButton.addEventListener('click', () => {
    resetGame();
});

setupJoystick(playerOneJoystick, 1);
setupJoystick(playerTwoJoystick, 2);

window.addEventListener('resize', () => {
    resizeCanvas();
});

createEmptyBoard();
resizeCanvas();
resetGame();

document.addEventListener('gesturestart', (event) => {
    event.preventDefault();
});

document.addEventListener('gesturechange', (event) => {
    event.preventDefault();
});

document.addEventListener('gestureend', (event) => {
    event.preventDefault();
});

document.addEventListener('touchmove', (event) => {
    if (gameState === 'playing') {
        event.preventDefault();
    }
}, { passive: false });