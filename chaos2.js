import { resetKeyboardLayout } from './entities.js';
import { openShop, clearRoundPowerups } from './shop.js';
import { showScreen } from './chaos.js';

const WORD_LENGTH = 5;
const MAX_GUESSES = 3;
const INITIAL_TIME = 120;
const MASTER_DICTIONARY_FILE = './words.txt';

let chickenMode = false;

export let gameState = {
    level: 1, currentWord: '', givenLettersScrambled: '',
    guessesRemaining: MAX_GUESSES, currentGuess: [],
    mrdWallet: 0, totalCoinsEarned: 0, totalWins: 0, consecutiveLosses: 0
};

export let timerState = { secondsLeft: INITIAL_TIME, clockInterval: null };

let boardContainer, scrambleLetters, hudLevel, hudTimer, hudWallet, screenGame, screenDeath, finalLevel, finalWins, finalCoinsTotal;

export function setupGameplayEngine() {
    boardContainer = document.getElementById('board-container');
    scrambleLetters = document.getElementById('scramble-letters');
    hudLevel = document.getElementById('hud-level');
    hudTimer = document.getElementById('hud-timer');
    hudWallet = document.getElementById('hud-wallet');
    screenGame = document.getElementById('game-arena');
    screenDeath = document.getElementById('death-screen');
    finalLevel = document.getElementById('final-level');
    finalWins = document.getElementById('final-wins');
    finalCoinsTotal = document.getElementById('final-coins-total');
}

export async function startNewSurvivalRun(isChickenActive) {
    chickenMode = isChickenActive;
    gameState.level = 1;
    gameState.mrdWallet = 0;
    gameState.totalCoinsEarned = 0;
    gameState.totalWins = 0;
    gameState.consecutiveLosses = 0;
    timerState.secondsLeft = INITIAL_TIME;
    await fetchAndLoadWave();
}

export async function fetchAndLoadWave() {
    gameState.guessesRemaining = MAX_GUESSES;
    gameState.currentGuess = [];
    resetKeyboardLayout();
    document.querySelectorAll('.key').forEach(k => k.className = 'key' + (k.getAttribute('data-key').length > 1 ? ' key-wide' : ''));

    try {
        const res = await fetch(`${MASTER_DICTIONARY_FILE}?t=${Date.now()}`);
        const text = await res.text();
        const parsedList = text.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length === WORD_LENGTH);
        gameState.currentWord = chickenMode ? "CHICK" : parsedList[Math.floor(Math.random() * parsedList.length)];
    } catch (e) {
        gameState.currentWord = "LIGHT";
    }

    const rawArr = gameState.currentWord.split('');
    for (let i = rawArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rawArr[i], rawArr[j]] = [rawArr[j], rawArr[i]];
    }
    gameState.givenLettersScrambled = rawArr.join(' ');

    if (hudLevel) hudLevel.textContent = String(gameState.level).padStart(2, '0');
    updateWalletDisplays();
    if (scrambleLetters) scrambleLetters.textContent = gameState.givenLettersScrambled;

    buildEmptyBoardUI();
    startMasterClockCountdown();
}

function buildEmptyBoardUI() {
    if (!boardContainer) return;
    boardContainer.innerHTML = '';
    for (let i = 0; i < MAX_GUESSES; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
        boardContainer.appendChild(row);
    }
}

function startMasterClockCountdown() {
    if (timerState.clockInterval) clearInterval(timerState.clockInterval);
    timerState.clockInterval = setInterval(() => {
        timerState.secondsLeft--;
        if (hudTimer) {
            const mins = Math.floor(timerState.secondsLeft / 60);
            const secs = timerState.secondsLeft % 60;
            hudTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            hudTimer.className = timerState.secondsLeft <= 30 ? "hud-value timer-danger" : "hud-value timer-normal";
        }
        if (timerState.secondsLeft <= 0) {
            clearInterval(timerState.clockInterval);
            processLossSequence("Time Expired!");
        }
    }, 1000);
}

export function adjustTimerPool(secondsDelta) {
    timerState.secondsLeft += secondsDelta;
    if (timerState.secondsLeft < 0) timerState.secondsLeft = 0;
}

export function renderActiveGuessRow() {
    const rows = document.getElementsByClassName('row');
    const activeRow = rows[MAX_GUESSES - gameState.guessesRemaining];
    if (!activeRow) return;
    const tiles = activeRow.getElementsByClassName('tile');

    for (let i = 0; i < WORD_LENGTH; i++) {
        tiles[i].textContent = gameState.currentGuess[i] || "";
        if (gameState.currentGuess[i]) tiles[i].classList.add('filled');
        else tiles[i].classList.remove('filled');
    }
}

export function processGuessSubmission() {
    if (gameState.currentGuess.length !== WORD_LENGTH) return;
    const compiledGuess = gameState.currentGuess.join('');
    const rows = document.getElementsByClassName('row');
    const activeRow = rows[MAX_GUESSES - gameState.guessesRemaining];
    const tiles = activeRow.getElementsByClassName('tile');
    let solutionClone = gameState.currentWord.split('');

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (gameState.currentGuess[i] === solutionClone[i]) {
            tiles[i].className = "tile correct";
            solutionClone[i] = null;
        }
    }
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (!tiles[i].classList.contains('correct')) {
            const letter = gameState.currentGuess[i];
            const foundIdx = solutionClone.indexOf(letter);
            if (foundIdx > -1) {
                tiles[i].className = "tile present";
                solutionClone[foundIdx] = null;
            } else {
                tiles[i].className = "tile absent";
            }
        }
    }

    if (compiledGuess === gameState.currentWord) {
        gameState.totalWins++;
        gameState.consecutiveLosses = 0;
        gameState.mrdWallet += 5;
        gameState.totalCoinsEarned += 5;
        updateWalletDisplays();
        setTimeout(() => { clearInterval(timerState.clockInterval); clearRoundPowerups(); gameState.level++; openShop(); }, 1500);
        return;
    }

    gameState.guessesRemaining--;
    gameState.currentGuess = [];
    if (gameState.guessesRemaining === 0) processLossSequence("Wave Failed!");
}

function processLossSequence() {
    gameState.consecutiveLosses++;
    if (gameState.consecutiveLosses >= 5) {
        clearInterval(timerState.clockInterval);
        if (screenGame) screenGame.classList.add('hidden');
        if (screenDeath) screenDeath.classList.remove('hidden');
        if (finalLevel) finalLevel.textContent = gameState.level;
        if (finalWins) finalWins.textContent = gameState.totalWins;
        if (finalCoinsTotal) finalCoinsTotal.textContent = gameState.totalCoinsEarned;
        return;
    }
    setTimeout(() => { clearInterval(timerState.clockInterval); clearRoundPowerups(); gameState.level++; openShop(); }, 2000);
}

export function updateWalletDisplays() {
    if (hudWallet) hudWallet.textContent = `${String(gameState.mrdWallet).padStart(3, '0')} MRD`;
    const shopWallet = document.getElementById('shop-wallet');
    if (shopWallet) shopWallet.textContent = gameState.mrdWallet;
}
