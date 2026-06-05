import { resetKeyboardLayout } from './entities.js';
import { openShop, isItemActive, clearRoundPowerups } from './shop.js';
import { setupKeyboardListeners } from './input.js';

const WORD_LENGTH = 5;
const MAX_GUESSES = 3; 
const INITIAL_TIME = 120; 
const MASTER_DICTIONARY_FILE = './words.txt';

export let gameState = {
    level: 1,
    currentWord: '',
    givenLettersScrambled: '',
    guessesRemaining: MAX_GUESSES,
    currentGuess: [],
    mrdWallet: 0,
    totalCoinsEarned: 0,
    totalWins: 0,
    consecutiveLosses: 0,
    isRoundOver: false,
    isRunDead: false
};

export let timerState = {
    secondsLeft: INITIAL_TIME,
    clockInterval: null
};

let boardContainer, scrambleLetters, hudLevel, hudTimer, hudWallet;
let screenGame, screenDeath, finalLevel, finalWins, finalCoinsTotal;

document.addEventListener('DOMContentLoaded', () => {
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

    document.getElementById('btn-restart')?.addEventListener('click', () => window.location.reload());
    document.getElementById('btn-quit')?.addEventListener('click', () => window.location.href = '../index.html');

    setupKeyboardListeners();
    bootSurvivalGame();
});

async function bootSurvivalGame() {
    gameState.level = 1;
    gameState.mrdWallet = 0;
    gameState.totalCoinsEarned = 0;
    gameState.totalWins = 0;
    gameState.consecutiveLosses = 0;
    gameState.isRunDead = false;
    timerState.secondsLeft = INITIAL_TIME;
    await fetchAndLoadWave();
}

export async function fetchAndLoadWave() {
    gameState.isRoundOver = false;
    gameState.guessesRemaining = MAX_GUESSES;
    gameState.currentGuess = [];
    
    resetKeyboardLayout();
    document.querySelectorAll('.key').forEach(k => k.className = 'key' + (k.getAttribute('data-key').length > 1 ? ' key-wide' : ''));

    try {
        const res = await fetch(`${MASTER_DICTIONARY_FILE}?t=${Date.now()}`);
        if(!res.ok) throw new Error("Could not acquire dictionary layout.");
        const text = await res.text();
        const parsedList = text.split('\n').map(w => w.trim().toUpperCase()).filter(w => w.length === WORD_LENGTH);
        gameState.currentWord = parsedList[Math.floor(Math.random() * parsedList.length)];
    } catch (e) {
        console.error(e);
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
    
    const isBlindLevel = gameState.level >= 6 && !isItemActive('lens');
    if (scrambleLetters) {
        scrambleLetters.textContent = isBlindLevel ? "? ? ? ? ?" : gameState.givenLettersScrambled;
    }

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
            if (gameState.level >= 6 && !isItemActive('lens')) {
                tile.textContent = '?';
                tile.style.color = '#3d1b54';
            }
            row.appendChild(tile);
        }
        boardContainer.appendChild(row);
    }
}

function startMasterClockCountdown() {
    if (timerState.clockInterval) clearInterval(timerState.clockInterval);
    timerState.clockInterval = setInterval(() => {
        if (gameState.isRoundOver || gameState.isRunDead) return;
        timerState.secondsLeft--;
        renderClockHUD();
        if (timerState.secondsLeft <= 0) {
            clearInterval(timerState.clockInterval);
            processLossSequence("Time Expired!");
        }
    }, 1000);
}

function renderClockHUD() {
    if (!hudTimer) return;
    const mins = Math.floor(timerState.secondsLeft / 60);
    const secs = timerState.secondsLeft % 60;
    hudTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    hudTimer.className = timerState.secondsLeft <= 30 ? "hud-value timer-danger" : "hud-value timer-normal";
}

export function adjustTimerPool(secondsDelta) {
    timerState.secondsLeft += secondsDelta;
    if (timerState.secondsLeft < 0) timerState.secondsLeft = 0;
    renderClockHUD();
}

export function renderActiveGuessRow() {
    const rows = document.getElementsByClassName('row');
    const activeRow = rows[MAX_GUESSES - gameState.guessesRemaining];
    if (!activeRow) return;
    const tiles = activeRow.getElementsByClassName('tile');
    const isBlind = gameState.level >= 6 && !isItemActive('lens');

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (gameState.currentGuess[i]) {
            tiles[i].textContent = isBlind ? "?" : gameState.currentGuess[i];
            tiles[i].classList.add('filled');
            if (isBlind) tiles[i].style.color = '#8c7ba6';
        } else {
            tiles[i].textContent = isBlind ? "?" : "";
            tiles[i].classList.remove('filled');
            if (isBlind) tiles[i].style.color = '#3d1b54';
        }
    }
}

export function processGuessSubmission() {
    if (gameState.currentGuess.length !== WORD_LENGTH) {
        showToast("Word Incomplete!", "error");
        return;
    }

    const compiledGuess = gameState.currentGuess.join('');
    const rows = document.getElementsByClassName('row');
    const activeRow = rows[MAX_GUESSES - gameState.guessesRemaining];
    const tiles = activeRow.getElementsByClassName('tile');
    let solutionClone = gameState.currentWord.split('');

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (gameState.currentGuess[i] === solutionClone[i]) {
            tiles[i].className = "tile correct";
            updateKeyboardUIStyle(gameState.currentGuess[i], 'correct');
            solutionClone[i] = null;
        }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
        if (!tiles[i].classList.contains('correct')) {
            const letter = gameState.currentGuess[i];
            const foundIdx = solutionClone.indexOf(letter);
            if (foundIdx > -1) {
                tiles[i].className = "tile present";
                updateKeyboardUIStyle(letter, 'present');
                solutionClone[foundIdx] = null;
            } else {
                tiles[i].className = "tile absent";
                updateKeyboardUIStyle(letter, 'absent');
            }
        }
    }

    if (compiledGuess === gameState.currentWord) {
        processWinSequence();
        return;
    }

    gameState.guessesRemaining--;
    gameState.currentGuess = [];

    if (gameState.guessesRemaining === 0) {
        processLossSequence(`Failed Wave! Solution: ${gameState.currentWord}`);
    }
}

function updateKeyboardUIStyle(letter, status) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        if (key.getAttribute('data-key').toUpperCase() === letter) {
            const activeClass = key.classList.contains('correct') ? 'correct' : (key.classList.contains('present') ? 'present' : '');
            if (activeClass === 'correct') return;
            if (status === 'present' && activeClass === 'present') return;
            key.className = `key ${status}`;
        }
    });
}

function processWinSequence() {
    gameState.isRoundOver = true;
    gameState.totalWins++;
    gameState.consecutiveLosses = 0;
    gameState.mrdWallet += 5;
    gameState.totalCoinsEarned += 5;
    updateWalletDisplays();
    showToast("WAVE CLEARED! +5 MRD Tokens", "success");
    
    setTimeout(() => {
        clearInterval(timerState.clockInterval);
        clearRoundPowerups();
        gameState.level++;
        openShop();
    }, 1500);
}

function processLossSequence(reasonMessage) {
    gameState.isRoundOver = true;
    gameState.consecutiveLosses++;
    showToast(reasonMessage, "error");

    if (gameState.consecutiveLosses >= 5) {
        setTimeout(() => triggerGameOverTermination(), 1500);
        return;
    }

    setTimeout(() => {
        clearInterval(timerState.clockInterval);
        clearRoundPowerups();
        gameState.level++;
        openShop();
    }, 2000);
}

function triggerGameOverTermination() {
    gameState.isRunDead = true;
    clearInterval(timerState.clockInterval);
    if (screenGame) screenGame.classList.add('hidden');
    if (screenDeath) screenDeath.classList.remove('hidden');
    if (finalLevel) finalLevel.textContent = gameState.level;
    if (finalWins) finalWins.textContent = gameState.totalWins;
    if (finalCoinsTotal) finalCoinsTotal.textContent = gameState.totalCoinsEarned;
}

export function updateWalletDisplays() {
    if (hudWallet) hudWallet.textContent = `${String(gameState.mrdWallet).padStart(3, '0')} MRD`;
    const shopWallet = document.getElementById('shop-wallet');
    if (shopWallet) shopWallet.textContent = gameState.mrdWallet;
}

export function showToast(msg, type = 'normal') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}
