// soft-limiter.js - Мягкая система ограничений (с сохранением)
// https://kirill12633.github.io/Metro.New.Official/ru/js/soft-limiter.js

(function() {
    'use strict';
    
    console.log('soft-limiter.js загружен');
    
    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        SUSPECT_WAIT: 5000,
        SUSPECT_MESSAGE: '🕵️ Упс! Подождите 5 секунд, мы проверяем...',
        SUSPECT_LIMIT: 3,
        BLOCK_DURATION: 10 * 60 * 1000,
        discordWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC'
    };
    
    // ========== ЗАГРУЗКА СОХРАНЁННОГО СОСТОЯНИЯ ==========
    let suspectCount = 0;
    let isBlocked = false;
    let blockEndTime = 0;
    let firstSuspectTime = 0;  // Время первого подозрения
    let activeTimer = null;
    let overlay = null;
    let countdownInterval = null;
    
    // Загружаем состояние из localStorage
    function loadState() {
        try {
            const saved = localStorage.getItem('metro_soft_limiter');
            if (saved) {
                const state = JSON.parse(saved);
                suspectCount = state.suspectCount || 0;
                blockEndTime = state.blockEndTime || 0;
                firstSuspectTime = state.firstSuspectTime || 0;
                
                // Проверяем, не истекла ли блокировка
                if (blockEndTime && Date.now() < blockEndTime) {
                    isBlocked = true;
                    showBlockScreen();
                } else if (blockEndTime && Date.now() >= blockEndTime) {
                    // Блокировка истекла — сбрасываем
                    resetState();
                }
                
                // Проверяем, не истёк ли час с первого подозрения
                if (firstSuspectTime && (Date.now() - firstSuspectTime) > 60 * 60 * 1000) {
                    // Час прошёл — сбрасываем счётчик
                    suspectCount = 0;
                    firstSuspectTime = 0;
                    saveState();
                }
                
                console.log(`📊 Загружено состояние: подозрений ${suspectCount}, блокировка ${isBlocked}`);
            }
        } catch(e) {}
    }
    
    // Сохраняем состояние в localStorage
    function saveState() {
        try {
            const state = {
                suspectCount: suspectCount,
                blockEndTime: blockEndTime,
                firstSuspectTime: firstSuspectTime,
                updatedAt: Date.now()
            };
            localStorage.setItem('metro_soft_limiter', JSON.stringify(state));
        } catch(e) {}
    }
    
    // Сброс состояния
    function resetState() {
        suspectCount = 0;
        isBlocked = false;
        blockEndTime = 0;
        firstSuspectTime = 0;
        saveState();
        console.log('🔄 Состояние лимитера сброшено');
    }
    
    // ========== ПОКАЗ ЭКРАНОВ ==========
    function showWaitScreen() {
        if (overlay) removeOverlay();
        
        overlay = document.createElement('div');
        overlay.id = 'softLimiterOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 99999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Montserrat', Arial, sans-serif;
            animation: fadeIn 0.3s ease;
        `;
        
        overlay.innerHTML = `
            <div style="background: white; border-radius: 20px; max-width: 350px; width: 90%; padding: 35px; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 15px;">🕵️</div>
                <h2 style="color: #ff9800; margin-bottom: 10px;">Упс!</h2>
                <p style="color: #666; margin-bottom: 20px;">${CONFIG.SUSPECT_MESSAGE}</p>
                <div class="loader" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #ff9800;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                "></div>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                    ⚠️ Подозрений за час: ${suspectCount}/${CONFIG.SUSPECT_LIMIT}
                </p>
                <p style="color: #999; font-size: 11px; margin-top: 10px;">
                    Не обновляйте страницу — счётчик не сбросится
                </p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        // Добавляем стили
        addStyles();
        
        // Автоматическое снятие через 5 секунд
        activeTimer = setTimeout(() => {
            removeOverlay();
        }, CONFIG.SUSPECT_WAIT);
    }
    
    function showBlockScreen() {
        if (overlay) removeOverlay();
        if (countdownInterval) clearInterval(countdownInterval);
        
        overlay = document.createElement('div');
        overlay.id = 'softLimiterOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 99999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Montserrat', Arial, sans-serif;
        `;
        
        const remainingMs = blockEndTime - Date.now();
        const remainingMin = Math.floor(remainingMs / 60000);
        const remainingSec = Math.floor((remainingMs % 60000) / 1000);
        
        overlay.innerHTML = `
            <div style="background: white; border-radius: 20px; max-width: 350px; width: 90%; padding: 35px; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 15px;">⛔</div>
                <h2 style="color: #dc3545; margin-bottom: 10px;">Доступ ограничен</h2>
                <p style="color: #666; margin-bottom: 20px;">
                    Слишком много подозрительных действий (${suspectCount}/${CONFIG.SUSPECT_LIMIT})
                </p>
                <div style="background: #f0f0f0; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                    <span style="font-size: 30px; font-weight: bold; color: #dc3545;" id="countdownTimer">${remainingMin}:${remainingSec.toString().padStart(2, '0')}</span>
                    <p style="margin: 5px 0 0; font-size: 12px;">до снятия ограничения</p>
                </div>
                <button onclick="location.reload()" style="
                    background: #0066CC;
                    color: white;
                    border: none;
                    padding: 10px 25px;
                    border-radius: 25px;
                    cursor: pointer;
                ">Попробовать снова</button>
                <p style="color: #999; font-size: 11px; margin-top: 15px;">
                    Обновление страницы НЕ сбросит ограничение
                </p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        addStyles();
        startCountdown();
    }
    
    function startCountdown() {
        const timerElement = document.getElementById('countdownTimer');
        if (!timerElement) return;
        
        if (countdownInterval) clearInterval(countdownInterval);
        
        countdownInterval = setInterval(() => {
            const remaining = blockEndTime - Date.now();
            if (remaining <= 0) {
                clearInterval(countdownInterval);
                removeOverlay();
                resetState();
                location.reload();
            } else {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    function removeOverlay() {
        if (overlay) {
            overlay.remove();
            overlay = null;
        }
        document.body.style.overflow = '';
        if (activeTimer) {
            clearTimeout(activeTimer);
            activeTimer = null;
        }
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }
    
    function addStyles() {
        if (!document.querySelector('#softLimiterStyles')) {
            const style = document.createElement('style');
            style.id = 'softLimiterStyles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ========== ПРОВЕРКИ ==========
    function isBlockedNow() {
        if (isBlocked) {
            if (Date.now() >= blockEndTime) {
                resetState();
                return false;
            }
            return true;
        }
        return false;
    }
    
    function checkSuspicion() {
        if (isBlockedNow()) {
            if (!overlay) showBlockScreen();
            return true;
        }
        return false;
    }
    
    function recordSuspicion(reason) {
        if (isBlockedNow()) return false;
        
        // Проверяем, не прошёл ли час
        if (firstSuspectTime === 0) {
            firstSuspectTime = Date.now();
        } else if ((Date.now() - firstSuspectTime) > 60 * 60 * 1000) {
            // Час прошёл — сбрасываем
            suspectCount = 0;
            firstSuspectTime = Date.now();
        }
        
        suspectCount++;
        saveState();
        
        console.log(`⚠️ Подозрение #${suspectCount}: ${reason}`);
        
        // Отправляем в Discord
        sendToDiscord(reason);
        
        if (suspectCount >= CONFIG.SUSPECT_LIMIT) {
            // Блокировка
            isBlocked = true;
            blockEndTime = Date.now() + CONFIG.BLOCK_DURATION;
            saveState();
            showBlockScreen();
            sendToDiscord(`🔒 БЛОКИРОВКА: ${suspectCount} подозрений за час`, 'block');
            return true;
        } else {
            // Показываем ожидание
            showWaitScreen();
            return false;
        }
    }
    
    async function sendToDiscord(reason, type = 'suspect') {
        if (!CONFIG.discordWebhook) return;
        
        const embed = {
            title: type === 'suspect' ? '⚠️ ПОДОЗРИТЕЛЬНАЯ АКТИВНОСТЬ' : '🔒 БЛОКИРОВКА ДОСТУПА',
            color: type === 'suspect' ? 0xff9800 : 0xdc3545,
            timestamp: new Date().toISOString(),
            fields: [
                { name: 'Причина', value: reason, inline: false },
                { name: 'Подозрений за час', value: `${suspectCount}/${CONFIG.SUSPECT_LIMIT}`, inline: true },
                { name: 'Fingerprint', value: localStorage.getItem('metro_fingerprint') || 'неизвестно', inline: false },
                { name: 'User-Agent', value: navigator.userAgent.substring(0, 100), inline: false }
            ]
        };
        
        try {
            await fetch(CONFIG.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch(e) {}
    }
    
    // ========== ПЕРЕХВАТ ДЕЙСТВИЙ ==========
    let clickCount = 0;
    let clickTimer = null;
    
    document.addEventListener('click', function(e) {
        if (checkSuspicion()) return;
        
        clickCount++;
        if (clickTimer) clearTimeout(clickTimer);
        
        clickTimer = setTimeout(() => {
            if (clickCount > 10) {
                recordSuspicion(`Слишком много кликов за секунду (${clickCount})`);
            }
            clickCount = 0;
        }, 1000);
    });
    
    let submitCount = 0;
    let submitTimer = null;
    
    document.addEventListener('submit', function(e) {
        if (checkSuspicion()) {
            e.preventDefault();
            return false;
        }
        
        submitCount++;
        if (submitTimer) clearTimeout(submitTimer);
        
        submitTimer = setTimeout(() => {
            if (submitCount > 5) {
                recordSuspicion(`Слишком много отправок форм (${submitCount})`);
                e.preventDefault();
            }
            submitCount = 0;
        }, 5000);
    });
    
    let fetchCount = 0;
    let fetchTimer = null;
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
        if (checkSuspicion()) {
            throw new Error('Доступ временно ограничен');
        }
        
        fetchCount++;
        if (fetchTimer) clearTimeout(fetchTimer);
        
        fetchTimer = setTimeout(() => {
            if (fetchCount > 15) {
                recordSuspicion(`Слишком много запросов (${fetchCount} в секунду)`);
            }
            fetchCount = 0;
        }, 1000);
        
        return originalFetch.apply(this, args);
    };
    
    let errorCount = 0;
    let errorTimer = null;
    const originalError = console.error;
    
    console.error = function(...args) {
        originalError.apply(console, args);
        if (checkSuspicion()) return;
        
        errorCount++;
        if (errorTimer) clearTimeout(errorTimer);
        
        errorTimer = setTimeout(() => {
            if (errorCount > 10) {
                recordSuspicion(`Слишком много ошибок в консоли (${errorCount})`);
            }
            errorCount = 0;
        }, 1000);
    };
    
    let keyCount = 0;
    let keyTimer = null;
    
    document.addEventListener('keydown', function(e) {
        if (checkSuspicion()) return;
        
        keyCount++;
        if (keyTimer) clearTimeout(keyTimer);
        
        keyTimer = setTimeout(() => {
            if (keyCount > 30) {
                recordSuspicion(`Слишком быстрый ввод (${keyCount} клавиш за секунду)`);
            }
            keyCount = 0;
        }, 1000);
    });
    
    // Сброс счётчика каждый час (если нет блокировки)
    setInterval(() => {
        if (!isBlocked && firstSuspectTime && (Date.now() - firstSuspectTime) > 60 * 60 * 1000) {
            suspectCount = 0;
            firstSuspectTime = 0;
            saveState();
            console.log('🔄 Счётчик подозрений сброшен (прошёл час)');
        }
    }, 60 * 1000); // Проверяем каждую минуту
    
    // ========== API ==========
    window.MetroSoftLimiter = {
        isBlocked: () => isBlockedNow(),
        getSuspectCount: () => suspectCount,
        getRemainingTime: () => Math.max(0, blockEndTime - Date.now()),
        record: (reason) => recordSuspicion(reason),
        reset: () => {
            resetState();
            removeOverlay();
            location.reload();
        },
        test: () => {
            console.log('🧪 Тестирование...');
            recordSuspicion('Тестовое подозрение');
        },
        config: CONFIG
    };
    
    // ========== ЗАПУСК ==========
    loadState();
    
    // Если была блокировка — показываем экран
    if (isBlocked && blockEndTime > Date.now()) {
        showBlockScreen();
    }
    
    console.log('soft-limiter.js готов');
    console.log(`📊 Текущее состояние: подозрений ${suspectCount}, блокировка ${isBlocked}`);
    console.log('💡 Счётчик НЕ сбрасывается при обновлении страницы');
    
})();
