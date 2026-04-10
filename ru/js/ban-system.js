// soft-limiter.js - Мягкая система ограничений
// https://kirill12633.github.io/Metro.New.Official/ru/js/soft-limiter.js

(function() {
    'use strict';
    
    console.log('soft-limiter.js загружен');
    
    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        // Время ожидания при подозрении
        SUSPECT_WAIT: 5000,        // 5 секунд
        SUSPECT_MESSAGE: '🕵️ Упс! Подождите 5 секунд, мы проверяем...',
        
        // Лимиты
        SUSPECT_LIMIT: 3,           // 3 подозрения за час → блокировка
        BLOCK_DURATION: 10 * 60 * 1000, // 10 минут блокировки
        
        // Discord webhook
        discordWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC'
    };
    
    // ========== ХРАНИЛИЩЕ ==========
    let suspectCount = 0;
    let isBlocked = false;
    let blockEndTime = 0;
    let activeTimer = null;
    let overlay = null;
    
    // ========== ПОКАЗ УВЕДОМЛЕНИЯ ==========
    function showSuspendMessage(message, type = 'wait') {
        // Удаляем старый оверлей
        if (overlay) overlay.remove();
        if (activeTimer) clearTimeout(activeTimer);
        
        overlay = document.createElement('div');
        overlay.id = 'softLimiterOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 99999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Montserrat', Arial, sans-serif;
            animation: fadeIn 0.3s ease;
        `;
        
        let content = '';
        if (type === 'wait') {
            content = `
                <div style="background: white; border-radius: 20px; max-width: 350px; width: 90%; padding: 35px; text-align: center;">
                    <div style="font-size: 60px; margin-bottom: 15px;">🕵️</div>
                    <h2 style="color: #ff9800; margin-bottom: 10px;">Упс!</h2>
                    <p style="color: #666; margin-bottom: 20px;">${message}</p>
                    <div class="loader" style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #ff9800;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto;
                    "></div>
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">Пожалуйста, не обновляйте страницу</p>
                </div>
            `;
        } else if (type === 'block') {
            const remainingMs = blockEndTime - Date.now();
            const remainingMin = Math.ceil(remainingMs / 60000);
            content = `
                <div style="background: white; border-radius: 20px; max-width: 350px; width: 90%; padding: 35px; text-align: center;">
                    <div style="font-size: 60px; margin-bottom: 15px;">⛔</div>
                    <h2 style="color: #dc3545; margin-bottom: 10px;">Доступ ограничен</h2>
                    <p style="color: #666; margin-bottom: 20px;">${message}</p>
                    <div style="background: #f0f0f0; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                        <span style="font-size: 30px; font-weight: bold; color: #dc3545;" id="countdownTimer">${remainingMin}:00</span>
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
                </div>
            `;
        }
        
        overlay.innerHTML = content;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        // Добавляем анимации
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
        
        if (type === 'wait') {
            // Автоматическое снятие через 5 секунд
            activeTimer = setTimeout(() => {
                removeOverlay();
            }, CONFIG.SUSPECT_WAIT);
        } else if (type === 'block') {
            // Запускаем обратный отсчёт
            startCountdown();
        }
    }
    
    function startCountdown() {
        const timerElement = document.getElementById('countdownTimer');
        if (!timerElement) return;
        
        const interval = setInterval(() => {
            const remaining = blockEndTime - Date.now();
            if (remaining <= 0) {
                clearInterval(interval);
                removeOverlay();
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
    }
    
    // ========== ПРОВЕРКА И ОГРАНИЧЕНИЯ ==========
    function isBlockedNow() {
        if (!isBlocked) return false;
        if (Date.now() > blockEndTime) {
            // Блокировка истекла
            isBlocked = false;
            suspectCount = 0;
            blockEndTime = 0;
            return false;
        }
        return true;
    }
    
    function checkSuspicion() {
        // Если уже заблокирован
        if (isBlockedNow()) {
            const remaining = Math.ceil((blockEndTime - Date.now()) / 60000);
            showSuspendMessage(`Слишком много подозрительных действий. Попробуйте через ${remaining} минут.`, 'block');
            return true;
        }
        
        return false;
    }
    
    function recordSuspicion(reason) {
        if (isBlockedNow()) return false;
        
        suspectCount++;
        console.log(`⚠️ Подозрение #${suspectCount}: ${reason}`);
        
        // Отправляем в Discord
        sendToDiscord(reason);
        
        if (suspectCount >= CONFIG.SUSPECT_LIMIT) {
            // Блокировка
            isBlocked = true;
            blockEndTime = Date.now() + CONFIG.BLOCK_DURATION;
            showSuspendMessage(`Сайт временно недоступен. Попробуйте зайти через 10 минут.`, 'block');
            sendToDiscord(`🔒 БЛОКИРОВКА: ${suspectCount} подозрений за час`, 'block');
            return true;
        } else {
            // Показываем ожидание
            showSuspendMessage(CONFIG.SUSPECT_MESSAGE, 'wait');
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
    
    // 1. Перехват быстрых кликов
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
    
    // 2. Перехват быстрых отправок форм
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
    
    // 3. Перехват fetch запросов
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        if (checkSuspicion()) {
            throw new Error('Доступ временно ограничен');
        }
        
        // Считаем запросы
        const fetchKey = args[0];
        const fetchCount = (window._fetchCount || 0) + 1;
        window._fetchCount = fetchCount;
        
        setTimeout(() => {
            window._fetchCount = Math.max(0, (window._fetchCount || 0) - 1);
        }, 1000);
        
        if (fetchCount > 15) {
            recordSuspicion(`Слишком много запросов (${fetchCount} в секунду)`);
        }
        
        return originalFetch.apply(this, args);
    };
    
    // 4. Перехват console.error (ошибки)
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
    
    // 5. Перехват клавиш (быстрый ввод)
    let keyCount = 0;
    let keyTimer = null;
    
    document.addEventListener('keydown', function(e) {
        if (checkSuspicion()) return;
        
        keyCount++;
        
        if (keyTimer) clearTimeout(keyTimer);
        keyTimer = setTimeout(() => {
            if (keyCount > 30) {
                recordSuspicion(`Слишком быстрый ввод (${keyCount} клавиш за секунду) — возможно бот`);
            }
            keyCount = 0;
        }, 1000);
    });
    
    // ========== СБРОС ПОДОЗРЕНИЙ КАЖДЫЙ ЧАС ==========
    setInterval(() => {
        if (!isBlocked) {
            suspectCount = 0;
            console.log('🔄 Счётчик подозрений сброшен');
        }
    }, 60 * 60 * 1000);
    
    // ========== API ДЛЯ РАЗРАБОТЧИКОВ ==========
    window.MetroSoftLimiter = {
        // Проверка статуса
        isBlocked: () => isBlockedNow(),
        getSuspectCount: () => suspectCount,
        
        // Ручная запись подозрения
        record: (reason) => recordSuspicion(reason),
        
        // Сброс
        reset: () => {
            suspectCount = 0;
            isBlocked = false;
            blockEndTime = 0;
            removeOverlay();
            console.log('✅ Лимитер сброшен');
        },
        
        // Тест
        test: () => {
            console.log('🧪 Тестирование мягкого лимитера...');
            recordSuspicion('Тестовое подозрение');
        },
        
        // Конфиг
        config: CONFIG
    };
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    // Восстанавливаем блокировку после перезагрузки
    try {
        const savedBlock = localStorage.getItem('metro_block_until');
        if (savedBlock && parseInt(savedBlock) > Date.now()) {
            isBlocked = true;
            blockEndTime = parseInt(savedBlock);
            showSuspendMessage(`Сайт временно недоступен. Попробуйте зайти через ${Math.ceil((blockEndTime - Date.now()) / 60000)} минут.`, 'block');
        }
    } catch(e) {}
    
    // Сохраняем блокировку
    const originalBlockEnd = blockEndTime;
    Object.defineProperty(window, 'blockEndTime', {
        set: function(val) {
            blockEndTime = val;
            localStorage.setItem('metro_block_until', val);
        },
        get: function() { return blockEndTime; }
    });
    
    console.log('soft-limiter.js готов');
    console.log('🛡️ При подозрении будет показано "Упс! Подождите 5 секунд"');
    console.log('⚠️ После 3 подозрений за час — блокировка на 10 минут');
    
})();
