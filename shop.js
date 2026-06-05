import { gameState, fetchAndLoadWave, adjustTimerPool, updateWalletDisplays, showToast } from './chaos.js';

// --- SHOP CHIME ASSET ---
const sfxPurchase = new Audio('./assets/audio/purchase.mp3');

// --- ACTIVE POWER-UP PROFILE RECORDERS ---
let activeUpgrades = {
    symbol_shield: false,
    sweeper_radar: false,
    lens: false
};

// --- ITEM CATALOG ENTRY SPECIFICATIONS ---
const ITEM_PRICES = {
    time: 10,
    symbol_shield: 15,
    sweeper_radar: 15,
    lens: 20
};

// --- DOM REGISTRATIONS ---
let screenShop, btnNextLevel;

document.addEventListener('DOMContentLoaded', () => {
    screenShop = document.getElementById('shop-screen');
    btnNextLevel = document.getElementById('btn-next-level');

    setupStorefrontActionClickListeners();
});

function setupStorefrontActionClickListeners() {
    // Buy Time Button Row Listener
    document.querySelector('#buy-time .shop-btn')?.addEventListener('click', () => {
        executeItemPurchaseTransaction('time', () => {
            adjustTimerPool(30); // Inject flat 30 seconds back onto the ticking clock pool
            showToast("Time Stabilized! +30s Added To Clock", "success");
        });
    });

    // Buy Anti-Symbol Shield Firewall Button Row Listener
    document.querySelector('#buy-symbol-shield .shop-btn')?.addEventListener('click', () => {
        executeItemPurchaseTransaction('symbol_shield', () => {
            activeUpgrades.symbol_shield = true;
            showToast("Symbol Firewall Operational For Next Wave!", "success");
            updateItemCardButtonState('buy-symbol-shield', "Equipped");
        });
    });

    // Buy Anti-Sweeper Radar Decompiler Button Row Listener
    document.querySelector('#buy-sweeper-radar .shop-btn')?.addEventListener('click', () => {
        executeItemPurchaseTransaction('sweeper_radar', () => {
            activeUpgrades.sweeper_radar = true;
            showToast("Sweeper Decompiler Anchored For Next Wave!", "success");
            updateItemCardButtonState('buy-sweeper-radar', "Activated");
        });
    });

    // Buy Lens Matrix Matrix Button Row Listener
    document.querySelector('#buy-lens .shop-btn')?.addEventListener('click', () => {
        executeItemPurchaseTransaction('lens', () => {
            activeUpgrades.lens = true;
            showToast("Lens Matrix Configured! Blind Words Revealed", "success");
            updateItemCardButtonState('buy-lens', "Active");
        });
    });

    // Close Intermission Store / Start Next Round Trigger
    btnNextLevel?.addEventListener('click', () => {
        if (screenShop) screenShop.classList.add('hidden');
        fetchAndLoadWave(); // Triggers chaos.js to roll the next word target
    });
}

// --- CORE TRANSACTION LOGIC SYSTEM ---
function executeItemPurchaseTransaction(itemKey, successCallback) {
    const cost = ITEM_PRICES[itemKey];

    // Check if the player already bought this toggle upgrade item this round
    if (itemKey !== 'time' && activeUpgrades[itemKey]) {
        showToast("Item is already active for the upcoming round!", "normal");
        return;
    }

    if (gameState.mrdWallet >= cost) {
        // Deduct MRD Tokens from wallet balance counters
        gameState.mrdWallet -= cost;
        updateWalletDisplays();

        // Audio cash transaction notification chime
        try {
            sfxPurchase.currentTime = 0;
            sfxPurchase.play();
        } catch(e) {}

        // Run code callback mutations
        successCallback();
    } else {
        showToast("Insufficient MRD Coin balance!", "error");
    }
}

// --- CARD LAYOUT UPDATE CONTROLLER ---
function updateItemCardButtonState(cardId, dynamicLabelText) {
    const targetButton = document.querySelector(`#${cardId} .shop-btn`);
    if (targetButton) {
        targetButton.textContent = dynamicLabelText;
        targetButton.style.opacity = "0.4";
        targetButton.style.cursor = "not-allowed";
        targetButton.style.borderColor = "#8c7ba6";
        targetButton.style.color = "#8c7ba6";
    }
}

function resetShopCardButtonsLayout() {
    // Returns item button prices back to original layout rules
    const configs = [
        { id: 'buy-symbol-shield', cost: 15 },
        { id: 'buy-sweeper-radar', cost: 15 },
        { id: 'buy-lens', cost: 20 }
    ];

    configs.forEach(cfg => {
        const btn = document.querySelector(`#${cfg.id} .shop-btn`);
        if (btn) {
            btn.textContent = `Cost: ${cfg.cost} MRD`;
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
            btn.style.borderColor = "#ffcc00";
            btn.style.color = "#ffcc00";
            btn.style.background = "#251a36";
        }
    });
}

// --- INTERMISSION SCREEN STATE MACHINES ---
export function openShop() {
    resetShopCardButtonsLayout();
    if (screenShop) screenShop.classList.remove('hidden');
}

export function isItemActive(powerupKey) {
    return activeUpgrades[powerupKey] || false;
}

// Drops active protection item rules before next wave loading sequence starts
export function clearRoundPowerups() {
    activeUpgrades.symbol_shield = false;
    activeUpgrades.sweeper_radar = false;
    activeUpgrades.lens = false;
}
