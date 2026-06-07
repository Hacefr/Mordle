import { gameState, adjustTimerPool } from './chaos2.js';
import { isItemActive } from './shop.js';

const sfxStatic = new Audio('./assets/audio/static.mp3');
const sfxAlarm = new Audio('./assets/audio/alarm.mp3');
const sfxGlitch = new Audio('./assets/audio/glitch.mp3');
sfxStatic.loop = true;

let symbolActive = false;
let sweeperWatching = false;
let hazardInterval = null;

const symbolScrambleMap = {};
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

let monitorPanel, monitorContent, monitorPortrait, monitorName;

// Cache the new portrait elements safely
function cacheMonitorElements() {
    monitorPanel = document.getElementById('left-monitor');
    monitorContent = document.getElementById('monitor-transmission');
    monitorPortrait = document.getElementById('monitor-portrait');
    monitorName = document.getElementById('monitor-entity-name');
}

export function resetKeyboardLayout() {
    if (!monitorPanel) cacheMonitorElements();
    stopAllEntityLoops();
    symbolActive = false;
    sweeperWatching = false;
    
    // Hide the portrait transmission box cleanly
    if (monitorContent) monitorContent.classList.add('hidden');
    if (monitorPanel) monitorPanel.className = "boss-monitor-panel";
    document.getElementById('active-boss-hud')?.classList.add('hidden');
    
    try {
        sfxStatic.pause();
        sfxStatic.currentTime = 0;
    } catch(e) {}

    initializeWaveHazards();
}

function stopAllEntityLoops() {
    if (hazardInterval) {
        clearInterval(hazardInterval);
        hazardInterval = null;
    }
}

function initializeWaveHazards() {
    if (gameState.level < 2) return; 
    const triggerIntervalMs = Math.max(8000, 20000 - (gameState.level * 1000));

    hazardInterval = setInterval(() => {
        if (gameState.isRoundOver) return;
        const randomRoll = Math.random();

        if (randomRoll < 0.5) {
            if (!isItemActive('symbol_shield')) executeSymbolStrike();
        } else {
            if (!isItemActive('sweeper_radar')) executeSweeperObservation();
        }
    }, triggerIntervalMs);
}

// --- REWORKED SYMBOL PORTRAIT ATTACK ---
function executeSymbolStrike() {
    if (symbolActive) return;
    symbolActive = true;

    const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    for (let i = 0; i < alphabet.length; i++) {
        symbolScrambleMap[alphabet[i]] = shuffled[i];
    }

    // Trigger sound asset
    try {
        sfxGlitch.currentTime = 0;
        sfxGlitch.play();
    } catch(e) {}

    // Pop the portrait live on the left panel side
    if (monitorPortrait) monitorPortrait.src = "./assets/sprites/symbol.png";
    if (monitorName) monitorName.textContent = "SYMBOL";
    if (monitorContent) monitorContent.classList.remove('hidden');
    
    const banner = document.getElementById('active-boss-hud');
    const bText = document.getElementById('boss-warning-text');
    if (banner) banner.classList.remove('hidden');
    if (bText) bText.textContent = "⚠️ SYMBOL SYSTEM INTERFERENCE ENCOUNTERED";

    const clearTime = Math.min(8000, 4000 + (gameState.level * 400));
    setTimeout(() => {
        symbolActive = false;
        if (monitorContent) monitorContent.classList.add('hidden');
        if (banner) banner.classList.add('hidden');
    }, clearTime);
}

export function triggerSymbolScramble(pressedChar) {
    const cleanChar = pressedChar.toUpperCase();
    if (cleanChar === 'ENTER' || cleanChar === 'BACKSPACE') return cleanChar;
    return symbolScrambleMap[cleanChar] || cleanChar;
}

export function isSymbolActive() { return symbolActive; }

// --- REWORKED SWEEPER PORTRAIT ATTACK ---
function executeSweeperObservation() {
    if (sweeperWatching) return;
    sweeperWatching = true;

    // Pop the custom dripping portrait asset on the left panel side
    if (monitorPortrait) monitorPortrait.src = "./assets/sprites/sweeper.png";
    if (monitorName) monitorName.textContent = "SWEEPER";
    if (monitorContent) monitorContent.classList.remove('hidden');
    
    // Add red alert flashing theme variant to the panel wrapper frame
    if (monitorPanel) monitorPanel.className = "boss-monitor-panel monitor-sweeper-alert";

    const banner = document.getElementById('active-boss-hud');
    const bText = document.getElementById('boss-warning-text');
    if (banner) banner.classList.remove('hidden');
    if (bText) bText.textContent = "👁️ SWEEPER SCANNING LIVE! DO NOT TYPE!";

    try {
        sfxStatic.currentTime = 0;
        sfxStatic.play();
    } catch(e) {}

    setTimeout(() => {
        cleanupSweeperOverlay();
    }, 3000);
}

function cleanupSweeperOverlay() {
    sweeperWatching = false;
    if (monitorContent) monitorContent.classList.add('hidden');
    if (monitorPanel) monitorPanel.className = "boss-monitor-panel";
    
    const banner = document.getElementById('active-boss-hud');
    if (banner) banner.classList.add('hidden');

    try {
        sfxStatic.pause();
        sfxStatic.currentTime = 0;
    } catch(e) {}
}

export function verifyInputLegality() {
    if (sweeperWatching) {
        adjustTimerPool(-15);
        try {
            sfxAlarm.currentTime = 0;
            sfxAlarm.play();
        } catch(e) {}
        return false; 
    }
    return true;
}
