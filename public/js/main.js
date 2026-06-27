const gameGrid = document.querySelector('#gameGrid');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentMode = 'single';

function createGameCard(game) {
    return `
        <a class="game-card" href="${game.href}">
            <span class="game-number">${game.number}</span>

            <div class="card-top-meta">
                <div class="game-icon">${game.icon}</div>
                <span class="player-count">인원: ${game.players}</span>
            </div>

            <h3>${game.title}</h3>
            <p>${game.description}</p>

            <div class="card-bottom">
                <span>${game.type}</span>
                <strong>PLAY</strong>
            </div>
        </a>
    `;
}

function renderGames(mode) {
    if (!gameGrid) return;

    const filteredGames = MGH_GAMES.filter((game) => game.mode === mode);

    if (filteredGames.length === 0) {
        gameGrid.innerHTML = `
            <div class="empty-game-message">
                <strong>아직 등록된 게임이 없습니다.</strong>
                <p>이 플레이 방식의 게임은 나중에 추가될 예정입니다.</p>
            </div>
        `;
        return;
    }

    gameGrid.innerHTML = filteredGames
        .map((game) => createGameCard(game))
        .join('');
}

function changeMode(mode) {
    currentMode = mode;

    filterButtons.forEach((button) => {
        const isActive = button.dataset.mode === mode;
        button.classList.toggle('active', isActive);
    });

    renderGames(currentMode);
}

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        changeMode(button.dataset.mode);
    });
});

renderGames(currentMode);