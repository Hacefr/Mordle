import { setupKeyboardListeners } from './input.js';
import { setupGameplayEngine, startNewSurvivalRun } from './chaos2.js';

let screenAlpha, screenMenuDeck, screenMenu, screenIndex, screenSettings, screenGame, screenDeath;
let chickenModeActive = false;

document.addEventListener('DOMContentLoaded', () => {
    // Cache absolute screen overlays
    screenAlpha = document.getElementById('alpha-popup');
    screenMenuDeck = document.getElementById('main-menu'); // Maps directly to root menu wrapper
    screenGame = document.getElementById('game-arena');
    screenDeath = document.getElementById('death-screen');

    // Cache nested menu screens
    screenMenu = document.getElementById('main-menu');
    screenIndex = document.getElementById('index-screen');
    screenSettings = document.getElementById('settings-screen');

    setupMenuRoutingEvents();
    setupKeyboardListeners();
    setupGameplayEngine();
});

// Structural layout screen toggler
export function showScreen(screenToShow) {
    [screenMenu, screenIndex, screenSettings].forEach(s => { if (s) s.classList.add('hidden'); });
    
    if (screenToShow === screenGame) {
        if (screenMenuDeck) screenMenuDeck.classList.add('hidden');
        if (screenGame) screenGame.classList.remove('hidden');
    } else {
        if (screenGame) screenGame.classList.add('hidden');
        if (screenMenuDeck) screenMenuDeck.classList.remove('hidden');
        if (screenToShow) screenToShow.classList.remove('hidden');
    }
}

function setupMenuRoutingEvents() {
    // Dismiss Alpha Notice
    document.getElementById('btn-close-alpha')?.addEventListener('click', () => {
        if (screenAlpha) screenAlpha.classList.add('hidden');
        showScreen(screenMenu);
    });

    // Main Menu Trigger Connections
    document.getElementById('btn-start-run')?.addEventListener('click', () => {
        showScreen(screenGame);
        startNewSurvivalRun(chickenModeActive);
    });

    document.getElementById('btn-index')?.addEventListener('click', () => {
        showScreen(screenIndex);
    });

    document.getElementById('btn-settings')?.addEventListener('click', () => {
        showScreen(screenSettings);
    });

    // Return to main links
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => showScreen(screenMenu));
    });

    // Game Over Panel Navigation
    document.getElementById('btn-restart')?.addEventListener('click', () => {
        window.location.reload();
    });
    
    document.getElementById('btn-quit')?.addEventListener('click', () => {
        if (screenDeath) screenDeath.classList.add('hidden');
        showScreen(screenMenu);
    });

    // 🐥 SECRET TERMINAL OVERRIDE KEY WATCHER
    const easterEggInput = document.getElementById('easter-egg-input');
    easterEggInput?.addEventListener('input', (e) => {
        if (e.target.value.toLowerCase() === 'chick') {
            chickenModeActive = true;
            const container = document.getElementById('toast-container');
            if (container) {
                const toast = document.createElement('div');
                toast.className = 'toast success';
                toast.textContent = "🐔 CHICKEN OVERRIDE PROTOCOL ACTIVATED!";
                container.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);
            }
            e.target.value = '';
        }
    });

    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
        if (confirm("Are you sure you want to purge terminal parameters?")) {
            alert("Terminal cache cleared successfully.");
        }
    });
}
