// ============================================
// CONFIGURATION & VARIABLES GLOBALES
// ============================================
const CONFIG = {
    ROWS: 6,
    COLS: 7,
    TIMER_DURATION: 30,
    SEARCH_DURATION: 5 // Simulation: 5 secondes pour trouver un adversaire
};

let gameState = {
    board: [],
    currentPlayer: 'red',
    player1Name: '',
    player2Name: '',
    gameActive: false,
    timer: CONFIG.TIMER_DURATION,
    timerInterval: null
};

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateOnlineStats();
    
    // Mettre à jour les stats toutes les 5 secondes (simulation)
    setInterval(updateOnlineStats, 5000);
}

function setupEventListeners() {
    // Formulaire de connexion
    document.getElementById('player-form').addEventListener('submit', handlePlayerSubmit);
    
    // Bouton d'annulation de recherche
    document.getElementById('cancel-search').addEventListener('click', cancelSearch);
    
    // Boutons de règles
    document.getElementById('show-rules').addEventListener('click', showRules);
    document.querySelector('.close').addEventListener('click', closeRules);
    
    // Boutons de jeu
    document.getElementById('restart-game').addEventListener('click', restartGame);
    document.getElementById('quit-game').addEventListener('click', quitGame);
    
    // Boutons de fin de partie
    document.getElementById('play-again').addEventListener('click', playAgain);
    document.getElementById('back-home').addEventListener('click', backToHome);
}

// ============================================
// GESTION DES ÉCRANS
// ============================================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ============================================
// ÉCRAN D'ACCUEIL
// ============================================
function handlePlayerSubmit(e) {
    e.preventDefault();
    
    const playerName = document.getElementById('player-name').value.trim();
    
    if (playerName.length < 2) {
        alert('Le nom doit contenir au moins 2 caractères');
        return;
    }
    
    gameState.player1Name = playerName;
    document.getElementById('player1-name').textContent = playerName;
    
    showScreen('loading-screen');
    startPlayerSearch();
}

function updateOnlineStats() {
    // Simulation de statistiques en ligne
    const onlinePlayers = Math.floor(Math.random() * 50) + 10;
    const activeGames = Math.floor(Math.random() * 20) + 5;
    
    document.getElementById('online-players').textContent = onlinePlayers;
    document.getElementById('active-games').textContent = activeGames;
}

// ============================================
// ÉCRAN DE CHARGEMENT
// ============================================
function startPlayerSearch() {
    // Simulation: Trouver un adversaire après quelques secondes
    setTimeout(() => {
        foundOpponent();
    }, CONFIG.SEARCH_DURATION * 1000);
}

function foundOpponent() {
    // Générer un nom d'adversaire aléatoire
    const opponentNames = [
        'Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan',
        'Casey', 'Riley', 'Avery', 'Quinn', 'Reese',
        'Skylar', 'Phoenix', 'Cameron', 'Blake', 'Dakota'
    ];
    
    const randomName = opponentNames[Math.floor(Math.random() * opponentNames.length)];
    gameState.player2Name = randomName;
    
    // Mettre à jour l'interface
    document.getElementById('player2-name').textContent = randomName;
    document.querySelector('.player-card.opponent .player-status').textContent = '✓ Connecté';
    document.querySelector('.player-avatar.waiting .question').style.display = 'none';
    document.querySelector('.waiting-text').textContent = 'Adversaire trouvé ! Démarrage...';
    
    // Lancer le jeu après une courte pause
    setTimeout(() => {
        startGame();
    }, 2000);
}

function cancelSearch() {
    showScreen('home-screen');
    document.getElementById('player-form').reset();
}

// ============================================
// RÈGLES DU JEU
// ============================================
function showRules(e) {
    e.preventDefault();
    document.getElementById('rules-modal').style.display = 'flex';
}

function closeRules() {
    document.getElementById('rules-modal').style.display = 'none';
}

// ============================================
// DÉMARRAGE DU JEU
// ============================================
function startGame() {
    showScreen('game-screen');
    
    // Initialiser le plateau
    initializeBoard();
    
    // Mettre à jour les noms des joueurs
    document.getElementById('game-player1-name').textContent = gameState.player1Name;
    document.getElementById('game-player2-name').textContent = gameState.player2Name;
    
    // Réinitialiser l'état du jeu
    gameState.currentPlayer = 'red';
    gameState.gameActive = true;
    
    // Démarrer le timer
    updateTurnIndicator();
    startTimer();
}

function initializeBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    // Créer la grille vide
    gameState.board = Array(CONFIG.COLS).fill(null).map(() => Array(CONFIG.ROWS).fill(null));
    
    // Créer les colonnes
    for (let col = 0; col < CONFIG.COLS; col++) {
        const column = document.createElement('div');
        column.className = 'column';
        column.dataset.col = col;
        
        // Créer les cellules de la colonne
        for (let row = 0; row < CONFIG.ROWS; row++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            column.appendChild(cell);
        }
        
        // Ajouter l'événement de clic sur la colonne
        column.addEventListener('click', () => handleColumnClick(col));
        
        board.appendChild(column);
    }
}

// ============================================
// LOGIQUE DU JEU
// ============================================
function handleColumnClick(col) {
    if (!gameState.gameActive) return;
    
    // Trouver la première position vide dans la colonne
    const row = findEmptyRow(col);
    
    if (row === -1) {
        // Colonne pleine
        return;
    }
    
    // Placer le jeton
    placeDisc(row, col, gameState.currentPlayer);
    
    // Vérifier la victoire
    if (checkWin(row, col)) {
        endGame(gameState.currentPlayer);
        return;
    }
    
    // Vérifier match nul
    if (isBoardFull()) {
        endGame('draw');
        return;
    }
    
    // Changer de joueur
    switchPlayer();
}

function findEmptyRow(col) {
    for (let row = 0; row < CONFIG.ROWS; row++) {
        if (gameState.board[col][row] === null) {
            return row;
        }
    }
    return -1;
}

function placeDisc(row, col, player) {
    gameState.board[col][row] = player;
    
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add(player);
}

function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'yellow' : 'red';
    updateTurnIndicator();
    resetTimer();
}

function updateTurnIndicator() {
    const disc = document.getElementById('current-turn-disc');
    const text = document.getElementById('turn-text');
    const indicators = document.querySelectorAll('.player-indicator');
    
    disc.className = `disc ${gameState.currentPlayer}`;
    
    const currentPlayerName = gameState.currentPlayer === 'red' 
        ? gameState.player1Name 
        : gameState.player2Name;
    
    text.textContent = `Tour de ${currentPlayerName}`;
    
    // Mettre à jour les indicateurs
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    if (gameState.currentPlayer === 'red') {
        indicators[0].classList.add('active');
    } else {
        indicators[1].classList.add('active');
    }
}

// ============================================
// TIMER
// ============================================
function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timer = CONFIG.TIMER_DURATION;
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        updateTimerDisplay();
        
        if (gameState.timer <= 0) {
            playRandomMove();
        }
    }, 1000);
}

function resetTimer() {
    startTimer();
}

function updateTimerDisplay() {
    document.getElementById('timer').textContent = gameState.timer;
}

function stopTimer() {
    clearInterval(gameState.timerInterval);
}

function playRandomMove() {
    // Trouver une colonne disponible
    const availableColumns = [];
    for (let col = 0; col < CONFIG.COLS; col++) {
        if (findEmptyRow(col) !== -1) {
            availableColumns.push(col);
        }
    }
    
    if (availableColumns.length > 0) {
        const randomCol = availableColumns[Math.floor(Math.random() * availableColumns.length)];
        handleColumnClick(randomCol);
    }
}

// ============================================
// VÉRIFICATION DE VICTOIRE
// ============================================
function checkWin(row, col) {
    const player = gameState.board[col][row];
    
    // Vérifier horizontalement
    if (checkDirection(row, col, 0, 1, player)) return true;
    
    // Vérifier verticalement
    if (checkDirection(row, col, 1, 0, player)) return true;
    
    // Vérifier diagonale /
    if (checkDirection(row, col, 1, 1, player)) return true;
    
    // Vérifier diagonale \
    if (checkDirection(row, col, 1, -1, player)) return true;
    
    return false;
}

function checkDirection(row, col, dRow, dCol, player) {
    let count = 1;
    const winningCells = [[row, col]];
    
    // Vérifier dans une direction
    count += countInDirection(row, col, dRow, dCol, player, winningCells);
    
    // Vérifier dans la direction opposée
    count += countInDirection(row, col, -dRow, -dCol, player, winningCells);
    
    if (count >= 4) {
        highlightWinningCells(winningCells);
        return true;
    }
    
    return false;
}

function countInDirection(row, col, dRow, dCol, player, winningCells) {
    let count = 0;
    let r = row + dRow;
    let c = col + dCol;
    
    while (
        r >= 0 && r < CONFIG.ROWS &&
        c >= 0 && c < CONFIG.COLS &&
        gameState.board[c][r] === player
    ) {
        count++;
        winningCells.push([r, c]);
        r += dRow;
        c += dCol;
    }
    
    return count;
}

function highlightWinningCells(cells) {
    cells.forEach(([row, col]) => {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('winning');
    });
}

function isBoardFull() {
    return gameState.board.every(col => col.every(cell => cell !== null));
}

// ============================================
// FIN DE PARTIE
// ============================================
function endGame(winner) {
    gameState.gameActive = false;
    stopTimer();
    
    const modal = document.getElementById('end-modal');
    const message = document.getElementById('end-message');
    
    if (winner === 'draw') {
        message.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 20px;">🤝</div>
            <div style="color: var(--text-secondary);">Match nul !</div>
            <div style="font-size: 0.6em; margin-top: 10px; color: var(--text-secondary);">
                La grille est complète
            </div>
        `;
    } else {
        const winnerName = winner === 'red' ? gameState.player1Name : gameState.player2Name;
        const winnerColor = winner === 'red' ? '#ef4444' : '#fbbf24';
        
        message.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 20px;">🎉</div>
            <div style="color: ${winnerColor};">${winnerName} gagne !</div>
            <div style="font-size: 0.6em; margin-top: 10px; color: var(--text-secondary);">
                Victoire avec les jetons ${winner === 'red' ? 'rouges' : 'jaunes'}
            </div>
        `;
        
        createConfetti();
    }
    
    modal.style.display = 'flex';
}

function createConfetti() {
    const confetti = document.querySelector('.confetti');
    confetti.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.style.position = 'absolute';
        piece.style.width = '10px';
        piece.style.height = '10px';
        piece.style.backgroundColor = Math.random() > 0.5 ? '#ef4444' : '#fbbf24';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = '-10px';
        piece.style.borderRadius = '50%';
        piece.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        piece.style.animationDelay = Math.random() * 2 + 's';
        confetti.appendChild(piece);
    }
}

// Animation CSS pour les confettis (ajoutée dynamiquement)
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(500px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// ACTIONS DE FIN DE PARTIE
// ============================================
function playAgain() {
    document.getElementById('end-modal').style.display = 'none';
    startGame();
}

function restartGame() {
    if (confirm('Êtes-vous sûr de vouloir recommencer ?')) {
        startGame();
    }
}

function quitGame() {
    if (confirm('Êtes-vous sûr de vouloir quitter la partie ?')) {
        stopTimer();
        backToHome();
    }
}

function backToHome() {
    document.getElementById('end-modal').style.display = 'none';
    showScreen('home-screen');
    document.getElementById('player-form').reset();
    gameState = {
        board: [],
        currentPlayer: 'red',
        player1Name: '',
        player2Name: '',
        gameActive: false,
        timer: CONFIG.TIMER_DURATION,
        timerInterval: null
    };
}

// ============================================
// GESTION DES CLICS EN DEHORS DES MODALS
// ============================================
window.onclick = function(event) {
    const rulesModal = document.getElementById('rules-modal');
    const endModal = document.getElementById('end-modal');
    
    if (event.target === rulesModal) {
        closeRules();
    }
    
    // Ne pas fermer le modal de fin en cliquant à l'extérieur
    // (forcer le joueur à choisir une action)
};
