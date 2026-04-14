// error-handler.js - Система обработки ошибок (ИСПРАВЛЕННАЯ)
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
    
    // ========== ПЕРЕМЕННЫЕ ==========
    let errorHistory = [];
    let sentErrors = new Map();
    let notificationQueue = [];
    let isShowingNotification = false;
    
    // ========== ОЧЕРЕДЬ УВЕДОМЛЕНИЙ ==========
    function showQueuedNotification() {
        if (isShowingNotification) return;
        if (notificationQueue.length === 0) return;
        if (!document.body) {
            // Если body нет, ждём
            document.addEventListener('DOMContentLoaded', () => showQueuedNotification());
            return;
        }
        
        isShowingNotification = true;
        const { message, type } = notificationQueue.shift();
        
        const colors = {
            error: '#dc3545',
            warning: '#ff9800',
            info: '#0066CC',
            success: '#4CAF50'
        };
        
        const icons = {
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            success: '✅'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${colors[type] || colors.error};
            color: white;
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
        toast.innerHTML = `${icons[type]} ${message.substring(0, 150)}`;
        
        toast.onclick = () => {
            toast.remove();
            isShowingNotification = false;
            showQueuedNotification();
        };
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
            isShowingNotification = false;
            showQueuedNotification();
        }, CONFIG.autoCloseDelay);
    }
    
    function showNotification(message, type = 'error') {
        if (!CONFIG.showToUser) return;
        notificationQueue.push({ message, type });
        showQueuedNotification();
    }
    
    // ========== КАТЕГОРИИ ОШИБОК ==========
    const ERROR_CATEGORIES = {
        NETWORK: { name: '🌐 Сеть', icon: '🌐', color: 0xff9800 },
        SCRIPT: { name: '📜 Скрипт', icon: '📜', color: 0xdc3545 },
        RESOURCE: { name: '🖼️ Ресурс', icon: '🖼️', color: 0xffc107 },
        SECURITY: { name: '🔒 Безопасность', icon: '🔒', color: 0xdc3545 },
        UNKNOWN: { name: '❓ Неизвестная', icon: '❓', color: 0x6c757d }
    };
    
    const SEVERITY = {
        CRITICAL: { name: '🔴 КРИТИЧЕСКАЯ', level: 1, emoji: '🔴' },
        HIGH: { name: '🟠 ВЫСОКАЯ', level: 2, emoji: '🟠' },
        MEDIUM: { name: '🟡 СРЕДНЯЯ', level: 3, emoji: '🟡' },
        LOW: { name: '🟢 НИЗКАЯ', level: 4, emoji: '🟢' }
    };
    
    function getErrorCategory(error, context = {}) {
        const message = (error.message || '').toLowerCase();
        if (message.includes('network') || message.includes('fetch') || context.type === 'fetch') 
            return ERROR_CATEGORIES.NETWORK;
        if (message.includes('security') || message.includes('cors')) 
            return ERROR_CATEGORIES.SECURITY;
        if (context.type === 'resource') 
            return ERROR_CATEGORIES.RESOURCE;
        return ERROR_CATEGORIES.SCRIPT;
    }
    
    function getSeverity(error) {
        const message = (error.message || '').toLowerCase();
        if (message.includes('crash') || message.includes('fatal')) 
            return SEVERITY.CRITICAL;
        if (message.includes('undefined') || message.includes('null')) 
            return SEVERITY.HIGH;
        return SEVERITY.MEDIUM;
    }
    
    // ========== ОТПРАВКА В DISCORD ==========
    async function sendToDiscord(errorObj) {
        if (!CONFIG.sendToDiscord || !CONFIG.discordWebhook) return;
        
        const errorKey = errorObj.message + errorObj.url;
        const lastSent = sentErrors.get(errorKey);
        if (lastSent && (Date.now() - lastSent) < CONFIG.deduplicateTime) return;
        sentErrors.set(errorKey, Date.now());
        
        let stack = (errorObj.stack || 'Нет стека').substring(0, 800);
        
        const embed = {
            title: `${errorObj.severity.emoji} ${errorObj.category.icon} ${errorObj.severity.name}`,
            color: errorObj.category.color,
            timestamp: new Date().toISOString(),
            fields: [
                { name: '📝 Сообщение', value: `\`\`\`js\n${(errorObj.message || '').substring(0, 300)}\n\`\`\``, inline: false },
                { name: '📂 Категория', value: errorObj.category.name, inline: true },
                { name: '⚠️ Важность', value: errorObj.severity.name, inline: true },
                { name: '🔗 Страница', value: errorObj.url, inline: false },
                { name: '🕐 Время', value: errorObj.time, inline: true },
                { name: '📊 Стек', value: `\`\`\`js\n${stack}\n\`\`\``, inline: false }
            ],
            footer: { text: `ID: ${errorObj.id}` }
        };
        
        try {
            await fetch(CONFIG.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch(e) {}
    }
    
    // ========== ЛОГИРОВАНИЕ ОШИБКИ ==========
    function logError(error, context = {}) {
        const category = getErrorCategory(error, context);
        const severity = getSeverity(error);
        
        const errorObj = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleString('ru-RU'),
            message: error.message || String(error),
            stack: error.stack,
            name: error.name || 'Error',
            url: window.location.href,
            page: document.title || 'Загрузка...',
            category: category,
            severity: severity,
            context: context
        };
        
        console.error(`[${category.name}] ${severity.name}:`, errorObj.message);
        
        if (CONFIG.saveToLocal) {
            errorHistory.unshift(errorObj);
            if (errorHistory.length > CONFIG.maxErrors) errorHistory.pop();
            try { localStorage.setItem('metro_error_history', JSON.stringify(errorHistory)); } catch(e) {}
        }
        
        // Показываем уведомление (только для высоких и критических)
        if (severity.level <= 2) {
            showNotification(error.message || 'Произошла ошибка', 'error');
        }
        
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
    
    // Перехват fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch.apply(this, args);
            if (!response.ok) {
                logError(new Error(`Fetch ${response.status}`), {
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
    
    // ========== СТИЛИ ==========
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // ========== ЗАГРУЗКА ИСТОРИИ ==========
    try {
        const saved = localStorage.getItem('metro_error_history');
        if (saved) errorHistory = JSON.parse(saved);
    } catch(e) {}
    
    // ========== API ==========
    window.MetroErrorHandler = {
        capture: logError,
        getHistory: () => [...errorHistory],
        clearHistory: () => { errorHistory = []; localStorage.removeItem('metro_error_history'); },
        test: () => {
            try {
                throw new Error('🧪 Тестовая ошибка для проверки системы');
            } catch(e) {
                logError(e, { type: 'test' });
            }
        },
        config: CONFIG
    };
    
    // ========== ДИАГНОСТИКА ==========
    window.MetroDiagnostic = {
        run: () => {
            console.log('%c═══════════════════════════════════════════════════════', 'color: #FFD700');
            console.log('%c🔍 ДИАГНОСТИКА СИСТЕМЫ', 'color: #FFD700; font-size: 16px');
            console.log('%c═══════════════════════════════════════════════════════', 'color: #FFD700');
            console.log(`📊 Ошибок в истории: ${errorHistory.length}`);
            console.log(`🔗 Discord webhook: ${CONFIG.discordWebhook ? '✅ настроен' : '❌ не настроен'}`);
            console.log(`👁️ Показ уведомлений: ${CONFIG.showToUser ? '✅ включён' : '❌ выключен'}`);
            console.log('%c═══════════════════════════════════════════════════════', 'color: #FFD700');
            return { errorCount: errorHistory.length, config: CONFIG };
        }
    };
    
    console.log('error-handler.js готов');
    console.log('💡 Для диагностики введи: MetroDiagnostic.run()');
    
})();
