import { gameState, renderActiveGuessRow, processGuessSubmission } from './chaos.js';
import { isSymbolActive, triggerSymbolScramble, verifyInputLegality } from './entities.js';

// Bind keyboard listeners to physical keys and screen button arrays
export function setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => handleInputPipeline(e.key));
    
    document.querySelectorAll('.key').forEach(keyNode => {
        keyNode.addEventListener('click', () => {
            const dataKey = keyNode.getAttribute('data-key');
            handleInputPipeline(dataKey);
        });
    });
}

// Intercepts and parses keystrokes through active entity state modifiers
function handleInputPipeline(key) {
    if (gameState.isRoundOver || gameState.isRunDead) return;
    
    // 👁️ SWEEPER INTERCEPTOR VETO: Blocks typing and inflicts penalty if active
    if (!verifyInputLegality()) return;

    // 💥 SYMBOL INTERCEPTOR VETO: Scrambles key assignments if active
    const targetKey = isSymbolActive() ? triggerSymbolScramble(key) : key.toUpperCase();

    if (targetKey === 'BACKSPACE') {
        if (gameState.currentGuess.length > 0) {
            gameState.currentGuess.pop();
            renderActiveGuessRow();
        }
    } else if (targetKey === 'ENTER') {
        processGuessSubmission();
    } else if (gameState.currentGuess.length < 5 && targetKey.length === 1 && targetKey.match(/[A-Z]/)) {
        gameState.currentGuess.push(targetKey);
        renderActiveGuessRow();
    }
}
