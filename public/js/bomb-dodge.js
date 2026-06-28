const canvas = document.querySelector('#bombCanvas');
const ctx = canvas.getContext('2d');

const startButton = document.querySelector('#startBombGame');
const resetButton = document.querySelector('#resetBombGame');

const timeText = document.querySelector('#timeText');
const bestTimeText = document.querySelector('#bestTimeText');
const levelText = document.querySelector('#levelText');

const messageTitle = document.querySelector('#messageTitle');
const messageText = document.querySelector('#messageText');

const STORAGE_KEY = 'mgh_bomb_dodge_best_time';

let canvasWidth = 320;
let canvasHeight = 430;

let animationId = null;
let lastFrameTime = 0;
let startTime = 0;
let lastBombSpawnTime = 0;

let gameState = 'idle';
// idle, playing, gameover

let bombs = [];

const player = {
    x: 160,
    y: 370,
    radius: 16
};

function getBestTime() {
    const savedValue = localStorage.getItem(STORAGE_KEY);

    if (savedValue === null) {
        return null;
    }

    const value = Number(savedValue);
    return Number.isFinite(value) ? value : null;
}

function renderBestTime() {
    const bestTime = getBestTime();

    if (bestTime === null) {
        bestTimeText.textContent = '-';
        return;
    }

    bestTimeText.textContent = `${bestTime.toFixed(1)}초`;
}

function updateBestTime(time) {
    const bestTime = getBestTime();

    if (bestTime === null || time > bestTime) {
        localStorage.setItem(STORAGE_KEY, String(time));
    }

    renderBestTime();
}

function setMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvasWidth = rect.width;
    canvasHeight = rect.height;

    canvas.width = Math.floor(canvasWidth * dpr);
    canvas.height = Math.floor(canvasHeight * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    player.y = canvasHeight - 42;
    player.x = Math.min(Math.max(player.x, player.radius + 8), canvasWidth - player.radius - 8);

    draw();
}

function getElapsedTime() {
    if (gameState !== 'playing') return 0;

    return (performance.now() - startTime) / 1000;
}

function getLevel(elapsedTime) {
    return Math.floor(elapsedTime / 8) + 1;
}

function getSpawnInterval(elapsedTime) {
    return Math.max(320, 850 - getLevel(elapsedTime) * 70);
}

function getBombSpeed(elapsedTime) {
    return 150 + getLevel(elapsedTime) * 22;
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function createBomb(elapsedTime) {
    const radius = getRandomNumber(12, 22);
    const speed = getBombSpeed(elapsedTime) + getRandomNumber(-20, 45);

    bombs.push({
        x: getRandomNumber(radius + 8, canvasWidth - radius - 8),
        y: -radius,
        radius,
        speed,
        rotation: getRandomNumber(0, Math.PI * 2),
        rotationSpeed: getRandomNumber(-3, 3)
    });
}

function resetGame() {
    cancelAnimationFrame(animationId);

    gameState = 'idle';
    bombs = [];
    lastFrameTime = 0;
    startTime = 0;
    lastBombSpawnTime = 0;

    player.x = canvasWidth / 2;
    player.y = canvasHeight - 42;

    startButton.disabled = false;

    timeText.textContent = '0.0초';
    levelText.textContent = '1';

    setMessage('폭탄 피하기', 'START를 누르고 화면을 드래그해서 폭탄을 피하세요.');

    renderBestTime();
    draw();
}

function startGame() {
    cancelAnimationFrame(animationId);

    gameState = 'playing';
    bombs = [];

    startTime = performance.now();
    lastFrameTime = startTime;
    lastBombSpawnTime = startTime;

    player.x = canvasWidth / 2;
    player.y = canvasHeight - 42;

    startButton.disabled = true;

    setMessage('게임 진행 중', '손가락으로 플레이어를 좌우로 움직여 폭탄을 피하세요.');

    loop(startTime);
}

function finishGame() {
    gameState = 'gameover';

    cancelAnimationFrame(animationId);

    const finalTime = (performance.now() - startTime) / 1000;

    updateBestTime(finalTime);

    startButton.disabled = false;

    setMessage(
        '게임 종료!',
        `${finalTime.toFixed(1)}초 동안 버텼습니다. START를 누르면 다시 도전합니다.`
    );

    draw();
}

function update(deltaTime, now) {
    const elapsedTime = (now - startTime) / 1000;
    const spawnInterval = getSpawnInterval(elapsedTime);

    if (now - lastBombSpawnTime >= spawnInterval) {
        createBomb(elapsedTime);
        lastBombSpawnTime = now;
    }

    bombs.forEach((bomb) => {
        bomb.y += bomb.speed * deltaTime;
        bomb.rotation += bomb.rotationSpeed * deltaTime;
    });

    bombs = bombs.filter((bomb) => bomb.y - bomb.radius < canvasHeight + 20);

    timeText.textContent = `${elapsedTime.toFixed(1)}초`;
    levelText.textContent = String(getLevel(elapsedTime));

    if (checkCollision()) {
        finishGame();
    }
}

function checkCollision() {
    return bombs.some((bomb) => {
        const dx = bomb.x - player.x;
        const dy = bomb.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < bomb.radius + player.radius - 3;
    });
}

function drawPlayer() {
    ctx.save();

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#3d7cff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#111111';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(player.x - 5, player.y - 4, 2.5, 0, Math.PI * 2);
    ctx.arc(player.x + 5, player.y - 4, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
}

function drawBomb(bomb) {
    ctx.save();

    ctx.translate(bomb.x, bomb.y);
    ctx.rotate(bomb.rotation);

    ctx.beginPath();
    ctx.arc(0, 0, bomb.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4d4d';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#111111';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-bomb.radius * 0.55, -bomb.radius * 0.55);
    ctx.lineTo(bomb.radius * 0.55, bomb.radius * 0.55);
    ctx.moveTo(bomb.radius * 0.55, -bomb.radius * 0.55);
    ctx.lineTo(-bomb.radius * 0.55, bomb.radius * 0.55);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    bombs.forEach((bomb) => {
        drawBomb(bomb);
    });

    drawPlayer();

    if (gameState === 'idle') {
        drawCenterText('READY?');
    }

    if (gameState === 'gameover') {
        drawCenterText('BOOM!');
    }
}

function drawCenterText(text) {
    ctx.save();

    ctx.font = '900 48px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#111111';

    ctx.strokeText(text, canvasWidth / 2, canvasHeight / 2);
    ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

    ctx.restore();
}

function loop(now) {
    if (gameState !== 'playing') return;

    const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.04);

    lastFrameTime = now;

    update(deltaTime, now);
    draw();

    animationId = requestAnimationFrame(loop);
}

function movePlayerByPointer(event) {
    const rect = canvas.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;

    player.x = Math.min(
        Math.max(pointerX, player.radius + 8),
        canvasWidth - player.radius - 8
    );

    draw();
}

canvas.addEventListener('pointerdown', (event) => {
    if (gameState === 'idle' || gameState === 'gameover') return;

    canvas.setPointerCapture(event.pointerId);
    movePlayerByPointer(event);
});

canvas.addEventListener('pointermove', (event) => {
    if (gameState !== 'playing') return;

    movePlayerByPointer(event);
});

startButton.addEventListener('click', () => {
    startGame();
});

resetButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    resetGame();
});

window.addEventListener('resize', () => {
    resizeCanvas();
});

resizeCanvas();
resetGame();