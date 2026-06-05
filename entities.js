import { gameState, adjustTimerPool, showToast } from './chaos.js';
import { isItemActive } from './shop.js';

// --- CORE AUDIO ASSETS CONFIGURATIONS ---
const sfxStatic = new Audio('./assets/audio/static.mp3');
const sfxAlarm = new Audio('./assets/audio/alarm.mp3');
const sfxGlitch = new Audio('./assets/audio/glitch.mp3');

// Configure loops for environmental background static immersion track
sfxStatic.loop = true;

// --- ENTITY STATE TRACKERS ---
let symbolActive = false;
let sweeperWatching = false;
let hazardInterval = null;

// Shuffled symbol cypher mappings matrix used by keyboard scrambler
const symbolScrambleMap = {};
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// --- ATTACK LOOP ORCHESTRATION PIPELINE ---
export function resetKeyboardLayout() {
    stopAllEntityLoops();
    symbolActive = false;
    sweeperWatching = false;
    
    // Reset core DOM hazard layout overlays out of sight
    document.getElementById('sweeper-overlay')?.classList.add('hidden');
    document.getElementById('active-boss-hud')?.classList.add('hidden');
    document.getElementById('game-arena')?.classList.remove('screen-shake');
    
    // Stop any bleeding audio streams safely
    try {
        sfxStatic.pause();
        sfxStatic.currentTime = 0;
    } catch(e) {}

    // Roll initialization selector choosing active wave threat rules
    initializeWaveHazards();
}

function stopAllEntityLoops() {
    if (hazardInterval) {
        clearInterval(hazardInterval);
        hazardInterval = null;
    }
}

function initializeWaveHazards() {
    if (gameState.level < 2) return; // Wave 1 provides absolute sanctuary safety

    // Escalating attack rhythm frequencies adjusting based on level depth metrics
    const triggerIntervalMs = Math.max(8000, 20000 - (gameState.level * 1000));

    hazardInterval = setInterval(() => {
        if (gameState.isRoundOver || gameState.isRunDead) return;

        // Roll dynamic threat matrix selector values
        const randomRoll = Math.random();

        if (randomRoll < 0.5) {
            if (!isItemActive('symbol_shield')) {
                executeSymbolStrike();
            } else {
                showToast("Firewall Blocked SYMBOL Attack!", "success");
            }
        } else {
            if (!isItemActive('sweeper_radar')) {
                executeSweeperObservation();
            } else {
                showToast("Decompiler Intercepted Sweeper Scanner!", "success");
            }
        }
    }, triggerIntervalMs);
}

// --- ENTITY 1: SYMBOL (THE KEYBOARD SCRAMBLER) ---
function executeSymbolStrike() {
    if (symbolActive) return; // Prevent cascading stack loop overheads
    symbolActive = true;

    // Compile temporary dynamic cypher substitution keys
    const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    for (let i = 0; i < alphabet.length; i++) {
        symbolScrambleMap[alphabet[i]] = shuffled[i];
    }

    // Audio glitch sting activation
    try {
        sfxGlitch.currentTime = 0;
        sfxGlitch.play();
    } catch(e) {}

    // Inject heavy background structural css animation screen shake
    document.getElementById('game-arena')?.classList.add('screen-shake');
    document.getElementById('active-boss-hud')?.classList.remove('hidden');

    showToast("⚠️ SYMBOL CORRUPTED KEYBOARD SCHEMATICS!", "error");

    // Scramble effect parameter sets persistent hold length parameters
    const clearTime = Math.min(8000, 4000 + (gameState.level * 400));
    setTimeout(() => {
        symbolActive = false;
        document.getElementById('game-arena')?.classList.remove('screen-shake');
        document.getElementById('active-boss-hud')?.classList.add('hidden');
        showToast("Keyboard connection structural integrity restored.", "normal");
    }, clearTime);
}

// Intercept hook injected straight inside input.js pipeline calculation tracks
export function triggerSymbolScramble(pressedChar) {
    const cleanChar = pressedChar.toUpperCase();
    if (cleanChar === 'ENTER' || cleanChar === 'BACKSPACE') return cleanChar;
    
    // Return ciphered substitution translation value elements
    return symbolScrambleMap[cleanChar] || cleanChar;
}

export function isSymbolActive() {
    return symbolActive;
}

// --- ENTITY 2: SWEEPER (THE OBSERVANT VOICE OVERLAY) ---
function executeSweeperObservation() {
    if (sweeperWatching) return;
    sweeperWatching = true;

    const overlayNode = document.getElementById('sweeper-overlay');

    // Step A: Phase 1 Manifestation Alert Warning window
    if (overlayNode) overlayNode.classList.remove('hidden');
    
    // Wake up custom static tracking layer loop audio
    try {
        sfxStatic.currentTime = 0;
        sfxStatic.play();
    } catch(e) {}

    // Static warning window runs explicitly for 3 total structural seconds
    setTimeout(() => {
        if (gameState.isRoundOver || gameState.isRunDead) {
            cleanupSweeperOverlay();
            return;
        }

        // Step B: Sweep window clean up phase sequence clears away after an extra 3 seconds
        cleanupSweeperOverlay();
    }, 3000);
}

function cleanupSweeperOverlay() {
    sweeperWatching = false;
    document.getElementById('sweeper-overlay')?.classList.add('hidden');
    try {
        sfxStatic.pause();
        sfxStatic.currentTime = 0;
    } catch(e) {}
}

// Interceptor query parsing checking keystroke legality inside operational loops
export function verifyInputLegality() {
    if (sweeperWatching) {
        // Enforce immediate raw resource penalty deductions variables
        adjustTimerPool(-15);
        
        try {
            sfxAlarm.currentTime = 0;
            sfxAlarm.play();
        } catch(e) {}

        showToast("❌ SWEEPER DETECTED MOVEMENT! -15s PENALTY", "error");
        return false; // Keystone block flag returns false to negate text inputs
    }
    return true;
}
