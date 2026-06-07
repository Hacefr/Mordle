import { setupKeyboardListeners } from './input.js';
import { setupGameplayEngine, startNewSurvivalRun } from './chaos2.js';

let screenAlpha, screenMenu, screenIndex, screenSettings, screenGame, screenDeath;
let chickenModeActive = false;

document.addEventListener('DOMContentLoaded', () => {
    // Cache screen overlay wrappers
    screenAlpha = document.getElementById('alpha-popup');
    screenMenu = document.getElementById('main-menu');
    screenIndex = document.getElementById('index-screen');
    screenSettings = document.getElementById('settings-screen');
    screenGame = document.getElementById('game-arena');
    screenDeath = document.getElementById('death-screen');

    setupMenuRoutingEvents();
    setupKeyboardListeners();
    setupGameplayEngine();
});

// Switch view screen layers safely
export function showScreen(screenToShow) {
    const screens = [screenAlpha, screenMenu, screenIndex, screenSettings, screenGame, screenDeath];
    screens.forEach(s => { if (s) s.classList.add('hidden'); });
    if (screenToShow) screenToShow.classList.remove('hidden');
}

function setupMenuRoutingEvents() {
    // Dismiss Alpha Notice
    document.getElementById('btn-close-alpha')?.addEventListener('click', () => {
        showScreen(screenMenu);
    });

    // Main Menu Navigation Connections
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

    // Sub-screen back button mappings
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => showScreen(screenMenu));
    });

    // Game Over Panel Navigation
    document.getElementById('btn-restart')?.addEventListener('click', () => {
        window.location.reload();
    });
    
    document.getElementById('btn-quit')?.addEventListener('click', () => {
        showScreen(screenMenu);
    });

    // 🐥 EASTER EGG OVERRIDE TRACKER
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

    // Purge statistics button
    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
        if (confirm("Are you sure you want to purge terminal parameters?")) {
            alert("Terminal cache cleared successfully.");
        }
    });
}
