// soft-limiter.js - Мягкая система ограничений (с логированием входов)
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
        discordWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC',
        // Настройки для логирования входов
        LOGIN_HISTORY_KEY: 'metro_login_history',
        MAX_LOGIN_HISTORY: 50
    };
    
    // ========== ГЕНЕРАЦИЯ FINGERPRINT ==========
    function getFingerprint() {
        let fingerprint = localStorage.getItem('metro_fingerprint');
        
        if (!fingerprint) {
            // Собираем данные для отпечатка
            const components = [
                navigator.userAgent,
                navigator.language,
                navigator.platform,
                screen.width + 'x' + screen.height,
                screen.colorDepth,
                navigator.hardwareConcurrency || 'unknown',
                navigator.deviceMemory || 'unknown',
                new Date().getTimezoneOffset(),
                navigator.webdriver ? 'webdriver' : 'normal',
                // Упрощенный canvas fingerprint
                getCanvasFingerprint()
            ];
            
            // Создаем хеш из компонентов
            fingerprint = btoa(components.join('|||')).substring(0, 64);
            localStorage.setItem('metro_fingerprint', fingerprint);
            console.log('🆕 Создан новый отпечаток браузера');
        }
        
        return fingerprint;
    }
    
    function getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Hello, World!', 4, 50);
            
            return canvas.toDataURL().substring(0, 100);
        } catch(e) {
            return 'canvas_error';
        }
    }
    
    // ========== ЛОГИРОВАНИЕ ВХОДОВ ==========
    function logVisit() {
        const fingerprint = getFingerprint();
        const timestamp = new Date().toISOString();
        const url = window.location.href;
        const referrer = document.referrer || 'прямой вход';
        
        // Собираем информацию о пользователе
        const visitData = {
            timestamp: timestamp,
            fingerprint: fingerprint,
            url: url,
            referrer: referrer,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            memory: navigator.deviceMemory || 'неизвестно',
            cores: navigator.hardwareConcurrency || 'неизвестно',
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'неизвестно',
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1
        };
        
        // Сохраняем историю
        saveToHistory(visitData);
        
        // Отправляем в Discord
        sendVisitToDiscord(visitData);
        
        console.log(`👤 Зафиксирован вход: ${fingerprint.substring(0, 16)}...`);
        
        return visitData;
    }
    
    function saveToHistory(visitData) {
        try {
            let history = JSON.parse(localStorage.getItem(CONFIG.LOGIN_HISTORY_KEY) || '[]');
            
            // Добавляем новый визит
            history.unshift(visitData);
            
            // Ограничиваем историю
            if (history.length > CONFIG.MAX_LOGIN_HISTORY) {
                history = history.slice(0, CONFIG.MAX_LOGIN_HISTORY);
            }
            
            localStorage.setItem(CONFIG.LOGIN_HISTORY_KEY, JSON.stringify(history));
        } catch(e) {
            console.warn('Не удалось сохранить историю входов:', e);
        }
    }
    
    async function sendVisitToDiscord(visitData) {
        if (!CONFIG.discordWebhook) return;
        
        // Проверяем, был ли уже отправлен этот визит (избегаем дубликатов)
        const lastVisitTime = localStorage.getItem('metro_last_visit_sent');
        const now = Date.now();
        
        // Отправляем только если прошло больше 5 секунд с последней отправки
        if (lastVisitTime && (now - parseInt(lastVisitTime)) < 5000) {
            console.log('⏳ Пропускаем дубликат отправки в Discord');
            return;
        }
        
        localStorage.setItem('metro_last_visit_sent', String(now));
        
        // Определяем время
        const visitDate = new Date(visitData.timestamp);
        const timeStr = visitDate.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Собираем полную информацию
        const embed = {
            title: '🌐 НОВОЕ ПОСЕЩЕНИЕ',
            color: 0x00ff88,
            timestamp: visitData.timestamp,
            fields: [
                { name: '🕐 Время', value: timeStr, inline: true },
                { name: '🔗 Страница', value: `[${visitData.url}](${visitData.url})`, inline: false },
                { name: '📎 Реферер', value: visitData.referrer || 'Прямой вход', inline: false },
                { name: '🆔 Отпечаток', value: `\`${visitData.fingerprint}\``, inline: false },
                { name: '💻 User-Agent', value: visitData.userAgent.substring(0, 150), inline: false },
                { name: '🖥️ Платформа', value: visitData.platform, inline: true },
                { name: '🌐 Язык', value: visitData.language, inline: true },
                { name: '📺 Разрешение', value: visitData.screenResolution, inline: true },
                { name: '🎨 Глубина цвета', value: `${visitData.colorDepth} бит`, inline: true },
                { name: '⏰ Часовой пояс', value: visitData.timezone, inline: true },
                { name: '🧠 Память', value: `${visitData.memory} ГБ`, inline: true },
                { name: '⚡ Ядра', value: `${visitData.cores}`, inline: true },
                { name: '🍪 Cookies', value: visitData.cookiesEnabled ? '✅ Включены' : '❌ Отключены', inline: true },
                { name: '🔄 Do Not Track', value: visitData.doNotTrack, inline: true },
                { name: '📦 LocalStorage', value: visitData.localStorage ? '✅ Доступен' : '❌ Недоступен', inline: true },
                { name: '📐 Размер окна', value: `${visitData.viewportWidth}x${visitData.viewportHeight}`, inline: true },
                { name: '🔍 Pixel Ratio', value: `${visitData.pixelRatio}`, inline: true }
            ],
            footer: {
                text: 'Metro Soft Limiter • Логирование посещений',
                icon_url: 'https://cdn.discordapp.com/emojis/123456789.png'
            }
        };
        
        try {
            await fetch(CONFIG.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
            console.log('✅ Отправлено уведомление о посещении в Discord');
        } catch(e) {
            console.warn('❌ Не удалось отправить уведомление в Discord:', e);
        }
    }
    
    // ========== ЗАГРУЗКА СОХРАНЁННОГО СОСТОЯНИЯ ==========
    let suspectCount = 0;
    let isBlocked = false;
    let blockEndTime = 0;
    let firstSuspectTime = 0;
    let activeTimer = null;
    let overlay = null;
    let countdownInterval = null;
    
    function loadState() {
        try {
            const saved = localStorage.getItem('metro_soft_limiter');
            if (saved) {
                const state = JSON.parse(saved);
                suspectCount = state.suspectCount || 0;
                blockEndTime = state.blockEndTime || 0;
                firstSuspectTime = state.firstSuspectTime || 0;
                
                if (blockEndTime && Date.now() < blockEndTime) {
                    isBlocked = true;
                    showBlockScreen();
                } else if (blockEndTime && Date.now() >= blockEndTime) {
                    resetState();
                }
                
                if (firstSuspectTime && (Date.now() - firstSuspectTime) > 60 * 60 * 1000) {
                    suspectCount = 0;
                    firstSuspectTime = 0;
                    saveState();
                }
                
                console.log(`📊 Загружено состояние: подозрений ${suspectCount}, блокировка ${isBlocked}`);
            }
        } catch(e) {}
    }
    
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
        addStyles();
        
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
        
        if (firstSuspectTime === 0) {
            firstSuspectTime = Date.now();
        } else if ((Date.now() - firstSuspectTime) > 60 * 60 * 1000) {
            suspectCount = 0;
            firstSuspectTime = Date.now();
        }
        
        suspectCount++;
        saveState();
        
        console.log(`⚠️ Подозрение #${suspectCount}: ${reason}`);
        sendToDiscord(reason);
        
        if (suspectCount >= CONFIG.SUSPECT_LIMIT) {
            isBlocked = true;
            blockEndTime = Date.now() + CONFIG.BLOCK_DURATION;
            saveState();
            showBlockScreen();
            sendToDiscord(`🔒 БЛОКИРОВКА: ${suspectCount} подозрений за час`, 'block');
            return true;
        } else {
            showWaitScreen();
            return false;
        }
    }
    
    async function sendToDiscord(reason, type = 'suspect') {
        if (!CONFIG.discordWebhook) return;
        
        const fingerprint = getFingerprint();
        
        const embed = {
            title: type === 'suspect' ? '⚠️ ПОДОЗРИТЕЛЬНАЯ АКТИВНОСТЬ' : '🔒 БЛОКИРОВКА ДОСТУПА',
            color: type === 'suspect' ? 0xff9800 : 0xdc3545,
            timestamp: new Date().toISOString(),
            fields: [
                { name: 'Причина', value: reason, inline: false },
                { name: 'Подозрений за час', value: `${suspectCount}/${CONFIG.SUSPECT_LIMIT}`, inline: true },
                { name: 'Fingerprint', value: `\`${fingerprint}\``, inline: false },
                { name: 'User-Agent', value: navigator.userAgent.substring(0, 100), inline: false },
                { name: 'Страница', value: window.location.href, inline: false }
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
    
    // Сброс счётчика каждый час
    setInterval(() => {
        if (!isBlocked && firstSuspectTime && (Date.now() - firstSuspectTime) > 60 * 60 * 1000) {
            suspectCount = 0;
            firstSuspectTime = 0;
            saveState();
            console.log('🔄 Счётчик подозрений сброшен (прошёл час)');
        }
    }, 60 * 1000);
    
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
        getFingerprint: () => getFingerprint(),
        getLoginHistory: () => {
            try {
                return JSON.parse(localStorage.getItem(CONFIG.LOGIN_HISTORY_KEY) || '[]');
            } catch(e) {
                return [];
            }
        },
        config: CONFIG
    };
    
    // ========== ЗАПУСК ==========
    loadState();
    
    // Логируем ВХОД на страницу
    logVisit();
    
    // Если была блокировка — показываем экран
    if (isBlocked && blockEndTime > Date.now()) {
        showBlockScreen();
    }
    
    console.log('soft-limiter.js готов');
    console.log(`📊 Текущее состояние: подозрений ${suspectCount}, блокировка ${isBlocked}`);
    console.log('💡 Счётчик НЕ сбрасывается при обновлении страницы');
    console.log('🆔 Отпечаток браузера:', getFingerprint());
    
})();
