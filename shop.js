import { gameState, fetchAndLoadWave, adjustTimerPool, updateWalletDisplays } from './chaos2.js';

const sfxPurchase = new Audio('./assets/audio/purchase.mp3');

let activeUpgrades = { symbol_shield: false, sweeper_radar: false };
const ITEM_PRICES = { time: 10, symbol_shield: 15, sweeper_radar: 15 };

let screenShop, btnNextLevel;

document.addEventListener('DOMContentLoaded', () => {
    screenShop = document.getElementById('shop-screen');
    btnNextLevel = document.getElementById('btn-next-level');
    setupStorefrontActionClickListeners();
});

function setupStorefrontActionClickListeners() {
    document.querySelector('#buy-time .shop-btn')?.addEventListener('click', () => {
        executeItemPurchaseTransaction('time', () => {
            adjustTimerPool(30);
        });
    });

    document.querySelector('#buy-symbol-shield .shop-btn')?.addEventListener('click', () => {
        executeItemPurchaseTransaction('symbol_shield', () => {
            activeUpgrades.symbol_shield = true;
            updateItemCardButtonState('buy-symbol-shield', "Equipped");
        });
    });

    document.querySelector('#buy-sweeper-radar .shop-btn')?.addEventListener('click', () => {
        executeItemPurchaseTransaction('sweeper_radar', () => {
            activeUpgrades.sweeper_radar = true;
            updateItemCardButtonState('buy-sweeper-radar', "Activated");
        });
    });

    btnNextLevel?.addEventListener('click', () => {
        if (screenShop) screenShop.classList.add('hidden');
        fetchAndLoadWave();
    });
}

function executeItemPurchaseTransaction(itemKey, successCallback) {
    const cost = ITEM_PRICES[itemKey];
    if (itemKey !== 'time' && activeUpgrades[itemKey]) return;

    if (gameState.mrdWallet >= cost) {
        gameState.mrdWallet -= cost;
        updateWalletDisplays();
        try {
            sfxPurchase.currentTime = 0;
            sfxPurchase.play();
        } catch(e) {}
        successCallback();
    }
}

function updateItemCardButtonState(cardId, dynamicLabelText) {
    const targetButton = document.querySelector(`#${cardId} .shop-btn`);
    if (targetButton) {
        targetButton.textContent = dynamicLabelText;
        targetButton.style.opacity = "0.4";
        targetButton.style.cursor = "not-allowed";
    }
}

function resetShopCardButtonsLayout() {
    const configs = [
        { id: 'buy-symbol-shield', cost: 15 },
        { id: 'buy-sweeper-radar', cost: 15 }
    ];
    configs.forEach(cfg => {
        const btn = document.querySelector(`#${cfg.id} .shop-btn`);
        if (btn) {
            btn.textContent = `Cost: ${cfg.cost} MRD`;
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
        }
    });
}

export function openShop() {
    resetShopCardButtonsLayout();
    if (screenShop) screenShop.classList.remove('hidden');
}

export function isItemActive(powerupKey) {
    return activeUpgrades[powerupKey] || false;
}

export function clearRoundPowerups() {
    activeUpgrades.symbol_shield = false;
    activeUpgrades.sweeper_radar = false;
}
