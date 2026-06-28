const gameGrid = document.querySelector('#gameGrid');
const filterButtons = document.querySelectorAll('.filter-btn');

const guideModal = document.querySelector('#guideModal');
const guideModalTitle = document.querySelector('#guideModalTitle');
const guideModalList = document.querySelector('#guideModalList');
const guideCloseButtons = document.querySelectorAll('[data-close-guide]');

let currentMode = 'single';

function createGameCard(game) {
    return `
        <article class="game-card">
            <span class="game-number">${game.number}</span>

            <div class="card-top-meta">
                <div class="game-icon">${game.icon}</div>
                <span class="player-count">인원: ${game.players}</span>
            </div>

            <h3>${game.title}</h3>
            <p>${game.description}</p>

            <div class="card-bottom">
                <button class="guide-open-btn" type="button" data-guide-title="${game.title}">
                    게임 방법
                </button>

                <a class="play-link" href="${game.href}">PLAY</a>
            </div>
        </article>
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

    bindGuideButtons();
}

function changeMode(mode) {
    currentMode = mode;

    filterButtons.forEach((button) => {
        const isActive = button.dataset.mode === mode;
        button.classList.toggle('active', isActive);
    });

    renderGames(currentMode);
}

function getGameByTitle(title) {
    return MGH_GAMES.find((game) => game.title === title);
}

function openGuideModal(game) {
    if (!guideModal || !guideModalTitle || !guideModalList) return;
    if (!game) return;

    guideModalTitle.textContent = game.title;
    guideModalList.innerHTML = '';

    const guideItems = Array.isArray(game.guide) ? game.guide : [];

    guideItems.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        guideModalList.appendChild(li);
    });

    guideModal.classList.add('is-open');
    guideModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('guide-open');
}

function closeGuideModal() {
    if (!guideModal) return;

    guideModal.classList.remove('is-open');
    guideModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('guide-open');
}

function bindGuideButtons() {
    const guideButtons = document.querySelectorAll('.guide-open-btn');

    guideButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const gameTitle = button.dataset.guideTitle;
            const game = getGameByTitle(gameTitle);

            openGuideModal(game);
        });
    });
}

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        changeMode(button.dataset.mode);
    });
});

guideCloseButtons.forEach((button) => {
    button.addEventListener('click', () => {
        closeGuideModal();
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeGuideModal();
    }
});

renderGames(currentMode);