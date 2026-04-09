// error-handler.js - Система обработки ошибок с отправкой в Discord
// https://kirill12633.github.io/Metro.New.Official/ru/js/error-handler.js

(function() {
    'use strict';
    
    console.log('error-handler.js загружен');
    
    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        discordWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC',
        showToUser: true,
        saveToLocal: true,
        maxErrors: 20,
        autoCloseDelay: 5000,
        sendToDiscord: true,
        deduplicateTime: 5 * 60 * 1000
    };
    
    // ========== КАТЕГОРИИ ОШИБОК ==========
    const ERROR_CATEGORIES = {
        NETWORK: { name: '🌐 Сеть', icon: '🌐', color: 0xff9800 },
        SCRIPT: { name: '📜 Скрипт', icon: '📜', color: 0xdc3545 },
        RESOURCE: { name: '🖼️ Ресурс', icon: '🖼️', color: 0xffc107 },
        SECURITY: { name: '🔒 Безопасность', icon: '🔒', color: 0xdc3545 },
        USER: { name: '👤 Действие пользователя', icon: '👤', color: 0x17a2b8 },
        PROMISE: { name: '⚡ Promise', icon: '⚡', color: 0xfd7e14 },
        FETCH: { name: '📡 Запрос', icon: '📡', color: 0xff9800 },
        STORAGE: { name: '💾 Хранилище', icon: '💾', color: 0xffc107 },
        UNKNOWN: { name: '❓ Неизвестная', icon: '❓', color: 0x6c757d }
    };
    
    // ========== УРОВНИ ВАЖНОСТИ ==========
    const SEVERITY = {
        CRITICAL: { name: '🔴 КРИТИЧЕСКАЯ', level: 1, emoji: '🔴' },
        HIGH: { name: '🟠 ВЫСОКАЯ', level: 2, emoji: '🟠' },
        MEDIUM: { name: '🟡 СРЕДНЯЯ', level: 3, emoji: '🟡' },
        LOW: { name: '🟢 НИЗКАЯ', level: 4, emoji: '🟢' }
    };
    
    // ========== ОПРЕДЕЛЕНИЕ КАТЕГОРИИ ==========
    function getErrorCategory(error, context = {}) {
        const message = (error.message || '').toLowerCase();
        const stack = (error.stack || '').toLowerCase();
        
        // Сетевые ошибки
        if (message.includes('network') || message.includes('fetch') || 
            message.includes('xhr') || message.includes('http') ||
            context.type === 'fetch' || context.type === 'xhr') {
            return ERROR_CATEGORIES.NETWORK;
        }
        
        // Ошибки безопасности
        if (message.includes('security') || message.includes('permission') ||
            message.includes('cors') || message.includes('csrf') ||
            message.includes('token') || message.includes('auth')) {
            return ERROR_CATEGORIES.SECURITY;
        }
        
        // Ошибки ресурсов
        if (context.type === 'resource' || message.includes('load') ||
            message.includes('image') || message.includes('script') ||
            message.includes('css')) {
            return ERROR_CATEGORIES.RESOURCE;
        }
        
        // Ошибки Promise
        if (context.type === 'unhandledrejection' || message.includes('promise')) {
            return ERROR_CATEGORIES.PROMISE;
        }
        
        // Ошибки хранилища
        if (message.includes('localstorage') || message.includes('storage') ||
            message.includes('quota')) {
            return ERROR_CATEGORIES.STORAGE;
        }
        
        // Ошибки скриптов (по умолчанию)
        if (message.includes('typeerror') || message.includes('referenceerror') ||
            message.includes('syntaxerror') || message.includes('rangeerror')) {
            return ERROR_CATEGORIES.SCRIPT;
        }
        
        return ERROR_CATEGORIES.UNKNOWN;
    }
    
    // ========== ОПРЕДЕЛЕНИЕ ВАЖНОСТИ ==========
    function getSeverity(error, category) {
        const message = (error.message || '').toLowerCase();
        
        // Критические ошибки
        if (message.includes('crash') || message.includes('fatal') ||
            message.includes('memory') || message.includes('out of memory') ||
            category === ERROR_CATEGORIES.SECURITY) {
            return SEVERITY.CRITICAL;
        }
        
        // Высокая важность
        if (message.includes('undefined') || message.includes('null') ||
            message.includes('cannot read') || message.includes('is not a function') ||
            category === ERROR_CATEGORIES.NETWORK) {
            return SEVERITY.HIGH;
        }
        
        // Средняя важность
        if (message.includes('timeout') || message.includes('abort') ||
            category === ERROR_CATEGORIES.RESOURCE) {
            return SEVERITY.MEDIUM;
        }
        
        // Низкая важность
        return SEVERITY.LOW;
    }
    
    // ========== СБОР ДАННЫХ О ПОЛЬЗОВАТЕЛЕ ==========
    function getUserInfo() {
        const info = {
            // Язык
            language: localStorage.getItem('metro_new_language') || 'не выбран',
            
            // Cookie согласие
            cookieConsent: localStorage.getItem('cookie_consent') === 'true' ? '✅ приняты' : '❌ не приняты',
            cookieType: localStorage.getItem('cookie_consent_type') || 'нет',
            
            // Документы (сколько принято)
            documents: {
                privacy: localStorage.getItem('metro_doc_privacy_v') || 'не принята',
                terms: localStorage.getItem('metro_doc_terms_v') || 'не принято',
                cookies: localStorage.getItem('metro_doc_cookies_v') || 'не принята'
            },
            
            // Настройки
            theme: localStorage.getItem('metro_theme') || 'светлая',
            
            // Статус
            isLoggedIn: !!localStorage.getItem('roblox_user_id')
        };
        
        // Считаем сколько документов принято
        let docsAccepted = 0;
        for (const [key, value] of Object.entries(info.documents)) {
            if (value !== 'не принята' && value !== 'не принято') docsAccepted++;
        }
        info.documentsAccepted = `${docsAccepted}/7`;
        
        return info;
    }
    
    // ========== СБОР ДАННЫХ ОБ ОКРУЖЕНИИ ==========
    function getEnvironmentInfo() {
        return {
            // Экран
            screen: `${screen.width}x${screen.height}`,
            window: `${window.innerWidth}x${window.innerHeight}`,
            pixelRatio: devicePixelRatio,
            colorDepth: screen.colorDepth,
            
            // Браузер
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            online: navigator.onLine ? '🟢 онлайн' : '🔴 офлайн',
            
            // Производительность
            memory: performance.memory ? {
                jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB',
                totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
                usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB'
            } : 'недоступно',
            
            // Время
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localTime: new Date().toLocaleString('ru-RU'),
            
            // Сторонние блокировки
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'не установлен'
        };
    }
    
    // ========== ХРАНИЛИЩЕ ==========
    let errorHistory = [];
    let sentErrors = new Map();
    
    // ========== ПОКАЗ УВЕДОМЛЕНИЯ ==========
    function showNotification(message, severity = SEVERITY.MEDIUM) {
        if (!CONFIG.showToUser) return;
        
        const colors = {
            [SEVERITY.CRITICAL.level]: '#dc3545',
            [SEVERITY.HIGH.level]: '#fd7e14',
            [SEVERITY.MEDIUM.level]: '#ffc107',
            [SEVERITY.LOW.level]: '#17a2b8'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${colors[severity.level]};
            color: ${severity.level === 3 ? '#1a1a2e' : 'white'};
            padding: 12px 20px;
            border-radius: 12px;
            z-index: 99999999;
            font-family: 'Montserrat', Arial, sans-serif;
            font-size: 13px;
            max-width: 350px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            cursor: pointer;
        `;
        toast.innerHTML = `${severity.emoji} ${severity.name}: ${message.substring(0, 100)}`;
        toast.onclick = () => toast.remove();
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), CONFIG.autoCloseDelay);
    }
    
    // ========== ОТПРАВКА В DISCORD ==========
    async function sendToDiscord(errorObj) {
        if (!CONFIG.sendToDiscord) return;
        
        const errorKey = errorObj.message + errorObj.url;
        const lastSent = sentErrors.get(errorKey);
        if (lastSent && (Date.now() - lastSent) < CONFIG.deduplicateTime) {
            return;
        }
        sentErrors.set(errorKey, Date.now());
        
        let stack = errorObj.stack || 'Нет стека';
        if (stack.length > 800) stack = stack.substring(0, 800) + '...';
        
        // Формируем информацию об окружении
        const envInfo = errorObj.environment;
        const userInfo = errorObj.user;
        
        const embed = {
            title: `${errorObj.severity.emoji} ${errorObj.category.icon} ${errorObj.severity.name}`,
            color: errorObj.category.color,
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: '📝 Сообщение',
                    value: `\`\`\`js\n${errorObj.message.substring(0, 300)}\n\`\`\``,
                    inline: false
                },
                {
                    name: '📂 Категория',
                    value: errorObj.category.name,
                    inline: true
                },
                {
                    name: '⚠️ Важность',
                    value: errorObj.severity.name,
                    inline: true
                },
                {
                    name: '🔗 Страница',
                    value: `[${errorObj.url.substring(0, 60)}](${errorObj.url})`,
                    inline: false
                },
                {
                    name: '🕐 Время',
                    value: errorObj.time,
                    inline: true
                }
            ],
            footer: { text: `ID: ${errorObj.id}` }
        };
        
        // Добавляем информацию о пользователе
        if (userInfo) {
            embed.fields.push({
                name: '👤 Пользователь',
                value: `\`\`\`\n🌐 Язык: ${userInfo.language}\n🍪 Cookie: ${userInfo.cookieConsent}\n📄 Документы: ${userInfo.documentsAccepted}\n\`\`\``,
                inline: false
            });
        }
        
        // Добавляем информацию об окружении
        if (envInfo) {
            embed.fields.push({
                name: '💻 Окружение',
                value: `\`\`\`\n🖥️ Экран: ${envInfo.screen}\n🌐 Браузер: ${envInfo.userAgent.substring(0, 80)}\n📡 Статус: ${envInfo.online}\n🕒 Время: ${envInfo.localTime}\n\`\`\``,
                inline: false
            });
        }
        
        // Добавляем стек
        embed.fields.push({
            name: '📊 Стек ошибки',
            value: `\`\`\`js\n${stack}\n\`\`\``,
            inline: false
        });
        
        try {
            await fetch(CONFIG.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch(e) {
            console.warn('Ошибка отправки в Discord:', e);
        }
    }
    
    // ========== ЛОГИРОВАНИЕ ОШИБКИ ==========
    function logError(error, context = {}) {
        // Определяем категорию и важность
        const category = getErrorCategory(error, context);
        const severity = getSeverity(error, category);
        
        // Собираем информацию
        const userInfo = getUserInfo();
        const envInfo = getEnvironmentInfo();
        
        const errorObj = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleString('ru-RU'),
            message: error.message || String(error),
            stack: error.stack,
            name: error.name || 'Error',
            url: window.location.href,
            page: document.title,
            category: category,
            severity: severity,
            user: userInfo,
            environment: envInfo,
            context: context
        };
        
        console.error(`[${category.name}] ${severity.name}:`, errorObj);
        
        // Сохраняем
        if (CONFIG.saveToLocal) {
            errorHistory.unshift(errorObj);
            if (errorHistory.length > CONFIG.maxErrors) errorHistory.pop();
            try {
                localStorage.setItem('metro_error_history', JSON.stringify(errorHistory));
            } catch(e) {}
        }
        
        // Показываем пользователю (только для HIGH и CRITICAL)
        if (severity.level <= 2) {
            showNotification(error.message || 'Произошла ошибка', severity);
        }
        
        // Отправляем в Discord
        sendToDiscord(errorObj);
        
        return errorObj;
    }
    
    // ========== ПЕРЕХВАТ ОШИБОК ==========
    window.addEventListener('error', function(event) {
        const error = event.error || new Error(event.message);
        logError(error, {
            type: 'global',
            filename: event.filename,
            line: event.lineno,
            column: event.colno
        });
    });
    
    window.addEventListener('unhandledrejection', function(event) {
        const error = event.reason || new Error('Unhandled Promise Rejection');
        logError(error, { type: 'unhandledrejection' });
    });
    
    // Перехват console.error
    const originalConsoleError = console.error;
    console.error = function(...args) {
        originalConsoleError.apply(console, args);
        const message = args.map(arg => {
            if (arg instanceof Error) return arg.message;
            if (typeof arg === 'object') return JSON.stringify(arg);
            return String(arg);
        }).join(' ');
        
        if (message && !message.includes('ошибка')) {
            logError(new Error(message), { type: 'console' });
        }
    };
    
    // Перехват fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch.apply(this, args);
            if (!response.ok) {
                logError(new Error(`Fetch failed: ${response.status}`), {
                    type: 'fetch',
                    url: args[0],
                    status: response.status
                });
            }
            return response;
        } catch(error) {
            logError(error, { type: 'fetch', url: args[0] });
            throw error;
        }
    };
    
    // ========== API ==========
    window.MetroErrorHandler = {
        capture: logError,
        notify: showNotification,
        getHistory: () => [...errorHistory],
        clearHistory: () => { errorHistory = []; localStorage.removeItem('metro_error_history'); },
        getUserInfo: getUserInfo,
        getEnvironment: getEnvironmentInfo,
        test: function() {
            try {
                throw new Error('🧪 Тестовая ошибка для проверки системы');
            } catch(e) {
                logError(e, { type: 'test' });
            }
        },
        categories: ERROR_CATEGORIES,
        severity: SEVERITY,
        config: CONFIG
    };
    
    // Стили
    const style = document.createElement('style');
    style.textContent = `@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`;
    document.head.appendChild(style);
    
    // Загрузка истории
    try {
        const saved = localStorage.getItem('metro_error_history');
        if (saved) errorHistory = JSON.parse(saved);
    } catch(e) {}
    
    console.log('error-handler.js готов');
    console.log('📂 Категории:', Object.keys(ERROR_CATEGORIES).length);
    console.log('⚠️ Уровни важности:', Object.keys(SEVERITY).length);
    
})();
