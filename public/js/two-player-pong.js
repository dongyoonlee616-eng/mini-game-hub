const canvas = document.querySelector('#pongCanvas');
const ctx = canvas.getContext('2d');

const startButton = document.querySelector('#startPong');
const resetButton = document.querySelector('#resetPong');
const speedButtons = document.querySelectorAll('.speed-btn');
const messageBox = document.querySelector('#pongMessage');

const topScoreText = document.querySelector('#topScore');
const bottomScoreText = document.querySelector('#bottomScore');

const WIN_SCORE = 5;
const ROUND_DELAY = 2;

const SPEED_OPTIONS = {
    slow: {
        x: 3,
        y: 4
    },
    fast: {
        x: 5,
        y: 7
    }
};

let currentSpeed = 'slow';

const game = {
    isPlaying: false,
    isCountingDown: false,
    animationId: null,
    countdownId: null,
    topScore: 0,
    bottomScore: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speedX: 3,
    speedY: 4
};

const paddle = {
    width: 86,
    height: 16,
    offset: 44,
    speed: 9
};

const topPaddle = {
    x: canvas.width / 2 - paddle.width / 2,
    y: paddle.offset
};

const bottomPaddle = {
    x: canvas.width / 2 - paddle.width / 2,
    y: canvas.height - paddle.offset - paddle.height
};

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function updateScore() {
    topScoreText.textContent = String(game.topScore);
    bottomScoreText.textContent = String(game.bottomScore);
}

function showMessage(title, desc) {
    messageBox.classList.remove('is-hidden');
    messageBox.innerHTML = `
        <strong>${title}</strong>
        <p>${desc}</p>
    `;
}

function hideMessage() {
    messageBox.classList.add('is-hidden');
}

function resetBall(direction = 1) {
    const speed = SPEED_OPTIONS[currentSpeed];

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    const randomXDirection = Math.random() > 0.5 ? 1 : -1;

    ball.speedX = speed.x * randomXDirection;
    ball.speedY = speed.y * direction;
}

function resetPositions() {
    topPaddle.x = canvas.width / 2 - paddle.width / 2;
    bottomPaddle.x = canvas.width / 2 - paddle.width / 2;
    resetBall(Math.random() > 0.5 ? 1 : -1);
}

function resetGame() {
    cancelAnimationFrame(game.animationId);
    clearInterval(game.countdownId);

    game.isPlaying = false;
    game.isCountingDown = false;
    game.topScore = 0;
    game.bottomScore = 0;

    startButton.disabled = false;

    updateScore();
    resetPositions();
    draw();

    showMessage('양면 탁구', '속도를 고르고 START를 누르면 2초 뒤 게임이 시작됩니다.');
}

function startRoundCountdown(direction = 1) {
    cancelAnimationFrame(game.animationId);
    clearInterval(game.countdownId);

    game.isPlaying = false;
    game.isCountingDown = true;

    startButton.disabled = true;

    resetBall(direction);
    draw();

    let count = ROUND_DELAY;

    showMessage(String(count), '잠시 후 라운드가 시작됩니다.');

    game.countdownId = setInterval(() => {
        count -= 1;

        if (count > 0) {
            showMessage(String(count), '잠시 후 라운드가 시작됩니다.');
            return;
        }

        clearInterval(game.countdownId);

        game.isCountingDown = false;
        game.isPlaying = true;

        startButton.disabled = false;

        hideMessage();
        loop();
    }, 1000);
}

function startGame() {
    if (game.isPlaying || game.isCountingDown) return;

    const direction = Math.random() > 0.5 ? 1 : -1;
    startRoundCountdown(direction);
}

function drawCourt() {
    ctx.fillStyle = '#6fd233';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2 - 8);
    ctx.lineTo(canvas.width, canvas.height / 2 - 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2 + 8);
    ctx.lineTo(canvas.width, canvas.height / 2 + 8);
    ctx.stroke();
}

function drawPaddle(p, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.roundRect(p.x, p.y, paddle.width, paddle.height, 10);
    ctx.fill();
    ctx.stroke();
}

function drawBall() {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function draw() {
    drawCourt();
    drawPaddle(topPaddle, '#10c8ee');
    drawPaddle(bottomPaddle, '#ff5555');
    drawBall();
}

function moveBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
        ball.speedX *= -1;
    }

    checkPaddleCollision(topPaddle, 'top');
    checkPaddleCollision(bottomPaddle, 'bottom');

    if (ball.y + ball.radius < 0) {
        bottomPoint();
    }

    if (ball.y - ball.radius > canvas.height) {
        topPoint();
    }
}

function checkPaddleCollision(p, side) {
    const isInsideX =
        ball.x + ball.radius >= p.x &&
        ball.x - ball.radius <= p.x + paddle.width;

    const isInsideY =
        ball.y + ball.radius >= p.y &&
        ball.y - ball.radius <= p.y + paddle.height;

    if (!isInsideX || !isInsideY) return;

    const paddleCenter = p.x + paddle.width / 2;
    const hitPosition = (ball.x - paddleCenter) / (paddle.width / 2);

    ball.speedX = hitPosition * 5;

    if (side === 'top') {
        ball.speedY = Math.abs(ball.speedY) + 0.15;
        ball.y = p.y + paddle.height + ball.radius;
    }

    if (side === 'bottom') {
        ball.speedY = -Math.abs(ball.speedY) - 0.15;
        ball.y = p.y - ball.radius;
    }
}

function topPoint() {
    game.topScore += 1;
    updateScore();
    checkWinner('TOP', -1);
}

function bottomPoint() {
    game.bottomScore += 1;
    updateScore();
    checkWinner('BOTTOM', 1);
}

function checkWinner(player, direction) {
    if (game.topScore >= WIN_SCORE || game.bottomScore >= WIN_SCORE) {
        game.isPlaying = false;
        game.isCountingDown = false;

        cancelAnimationFrame(game.animationId);
        clearInterval(game.countdownId);

        startButton.disabled = false;

        showMessage(`${player} 승리!`, 'RESET을 누르거나 START로 다시 시작하세요.');
        return;
    }

    showMessage(`${player} 득점!`, '2초 뒤 다음 라운드가 시작됩니다.');
    startRoundCountdown(direction);
}

function loop() {
    if (!game.isPlaying) return;

    moveBall();
    draw();

    if (!game.isPlaying) return;

    game.animationId = requestAnimationFrame(loop);
}

function movePaddleByTouch(event) {
    event.preventDefault();

    const rect = canvas.getBoundingClientRect();

    [...event.touches].forEach((touch) => {
        const touchX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
        const touchY = ((touch.clientY - rect.top) / rect.height) * canvas.height;

        const targetPaddle = touchY < canvas.height / 2 ? topPaddle : bottomPaddle;

        targetPaddle.x = clamp(
            touchX - paddle.width / 2,
            0,
            canvas.width - paddle.width
        );
    });

    draw();
}

canvas.addEventListener('touchstart', movePaddleByTouch, { passive: false });
canvas.addEventListener('touchmove', movePaddleByTouch, { passive: false });

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;

    const targetPaddle = mouseY < canvas.height / 2 ? topPaddle : bottomPaddle;

    targetPaddle.x = clamp(
        mouseX - paddle.width / 2,
        0,
        canvas.width - paddle.width
    );

    draw();
});

startButton.addEventListener('click', () => {
    if (game.topScore >= WIN_SCORE || game.bottomScore >= WIN_SCORE) {
        resetGame();
    }

    startGame();
});

resetButton.addEventListener('click', resetGame);

speedButtons.forEach((button) => {
    button.addEventListener('click', () => {
        currentSpeed = button.dataset.speed;

        speedButtons.forEach((speedButton) => {
            speedButton.classList.toggle(
                'active',
                speedButton.dataset.speed === currentSpeed
            );
        });

        if (!game.isPlaying) {
            resetPositions();
            draw();
        }
    });
});

resetGame();
