// error-handler.js - Система обработки ошибок с отправкой в Discord
// https://kirill12633.github.io/Metro.New.Official/ru/js/error-handler.js

(function() {
    'use strict';
    
    console.log('error-handler.js загружен');
    
    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        // Discord Webhook (твой)
        discordWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC',
        
        // Показывать ли уведомления пользователю
        showToUser: true,
        
        // Сохранять ли историю в localStorage
        saveToLocal: true,
        
        // Максимум ошибок в истории
        maxErrors: 20,
        
        // Авто-закрытие уведомления (мс)
        autoCloseDelay: 5000,
        
        // Отправлять ли все ошибки в Discord
        sendToDiscord: true,
        
        // Не отправлять повторяющиеся ошибки (5 минут)
        deduplicateTime: 5 * 60 * 1000
    };
    
    // Хранилище
    let errorHistory = [];
    let sentErrors = new Map(); // Для защиты от дублей
    
    // ========== ПОКАЗ УВЕДОМЛЕНИЯ ПОЛЬЗОВАТЕЛЮ ==========
    function showNotification(message, type = 'error') {
        if (!CONFIG.showToUser) return;
        
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
            font-size: 14px;
            max-width: 350px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        toast.innerHTML = `${icons[type]} ${message.substring(0, 150)}`;
        
        toast.onclick = () => toast.remove();
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, CONFIG.autoCloseDelay);
    }
    
    // ========== ОТПРАВКА В DISCORD ==========
    async function sendToDiscord(errorObj) {
        if (!CONFIG.sendToDiscord) return;
        
        // Проверка на дубликаты
        const errorKey = errorObj.message + errorObj.url;
        const lastSent = sentErrors.get(errorKey);
        if (lastSent && (Date.now() - lastSent) < CONFIG.deduplicateTime) {
            console.log('Повторная ошибка, не отправляем');
            return;
        }
        sentErrors.set(errorKey, Date.now());
        
        // Форматируем стек ошибки (обрезаем)
        let stack = errorObj.stack || 'Нет стека';
        if (stack.length > 1000) stack = stack.substring(0, 1000) + '...';
        
        // Создаём embed для Discord
        const embed = {
            title: '❌ Новая ошибка на сайте',
            color: 0xdc3545,
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: '📝 Сообщение',
                    value: `\`\`\`js\n${errorObj.message.substring(0, 200)}\n\`\`\``,
                    inline: false
                },
                {
                    name: '🔗 Страница',
                    value: `[${errorObj.url}](${errorObj.url})`,
                    inline: true
                },
                {
                    name: '🕐 Время',
                    value: errorObj.time,
                    inline: true
                },
                {
                    name: '🌐 Браузер',
                    value: errorObj.userAgent?.substring(0, 100) || 'Неизвестно',
                    inline: false
                },
                {
                    name: '📊 Стек ошибки',
                    value: `\`\`\`js\n${stack}\n\`\`\``,
                    inline: false
                }
            ],
            footer: {
                text: `ID: ${errorObj.id}`
            }
        };
        
        // Добавляем контекст если есть
        if (errorObj.context && Object.keys(errorObj.context).length > 0) {
            embed.fields.push({
                name: '📦 Контекст',
                value: `\`\`\`json\n${JSON.stringify(errorObj.context, null, 2).substring(0, 200)}\n\`\`\``,
                inline: false
            });
        }
        
        try {
            const response = await fetch(CONFIG.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
            
            if (!response.ok) {
                console.warn('Не удалось отправить ошибку в Discord:', response.status);
            }
        } catch(e) {
            console.warn('Ошибка при отправке в Discord:', e);
        }
    }
    
    // ========== ЛОГИРОВАНИЕ ОШИБКИ ==========
    function logError(error, context = {}) {
        // Создаём объект ошибки
        const errorObj = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleString('ru-RU'),
            message: error.message || String(error),
            stack: error.stack,
            name: error.name || 'Error',
            url: window.location.href,
            userAgent: navigator.userAgent,
            context: context,
            page: document.title
        };
        
        // Выводим в консоль
        console.error('[Ошибка]', errorObj);
        
        // Сохраняем в историю
        if (CONFIG.saveToLocal) {
            errorHistory.unshift(errorObj);
            if (errorHistory.length > CONFIG.maxErrors) {
                errorHistory.pop();
            }
            try {
                localStorage.setItem('metro_error_history', JSON.stringify(errorHistory));
            } catch(e) {}
        }
        
        // Показываем пользователю
        let userMessage = error.message || 'Произошла ошибка';
        if (userMessage.length > 100) userMessage = userMessage.substring(0, 100) + '...';
        showNotification(userMessage, 'error');
        
        // Отправляем в Discord
        sendToDiscord(errorObj);
        
        return errorObj;
    }
    
    // ========== ПЕРЕХВАТ ГЛОБАЛЬНЫХ ОШИБОК ==========
    window.addEventListener('error', function(event) {
        const error = event.error || new Error(event.message);
        logError(error, {
            type: 'global',
            filename: event.filename,
            line: event.lineno,
            column: event.colno
        });
    });
    
    // ========== ПЕРЕХВАТ PROMISE ОШИБОК ==========
    window.addEventListener('unhandledrejection', function(event) {
        const error = event.reason || new Error('Unhandled Promise Rejection');
        logError(error, { type: 'unhandledrejection' });
    });
    
    // ========== ПЕРЕХВАТ ОШИБОК В CONSOLE.ERROR ==========
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
    
    // ========== ПРОВЕРКА ЗАГРУЗКИ РЕСУРСОВ ==========
    document.addEventListener('DOMContentLoaded', function() {
        const resources = document.querySelectorAll('img, script, link');
        resources.forEach(resource => {
            resource.addEventListener('error', function(e) {
                logError(new Error(`Не удалось загрузить: ${resource.src || resource.href}`), {
                    type: 'resource',
                    tag: resource.tagName
                });
            });
        });
    });
    
    // ========== ОТСЛЕЖИВАНИЕ AJAX/FETCH ОШИБОК ==========
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch.apply(this, args);
            if (!response.ok) {
                logError(new Error(`Fetch failed: ${response.status} ${response.statusText}`), {
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
    
    // ========== ОТСЛЕЖИВАНИЕ XMLHttpRequest ==========
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this.addEventListener('error', function() {
            logError(new Error(`XHR failed: ${method} ${url}`), {
                type: 'xhr',
                method: method,
                url: url
            });
        });
        this.addEventListener('timeout', function() {
            logError(new Error(`XHR timeout: ${method} ${url}`), {
                type: 'xhr_timeout',
                method: method,
                url: url
            });
        });
        return originalXHROpen.call(this, method, url, ...rest);
    };
    
    // ========== API ДЛЯ РАЗРАБОТЧИКОВ ==========
    window.MetroErrorHandler = {
        // Поймать ошибку вручную
        capture: logError,
        
        // Показать уведомление
        notify: showNotification,
        
        // Получить историю ошибок
        getHistory: () => [...errorHistory],
        
        // Очистить историю
        clearHistory: () => {
            errorHistory = [];
            localStorage.removeItem('metro_error_history');
        },
        
        // Тестовая ошибка (для проверки)
        test: function() {
            try {
                throw new Error('Тестовая ошибка для проверки Discord');
            } catch(e) {
                logError(e, { type: 'test' });
            }
        },
        
        // Настройки
        config: CONFIG
    };
    
    // ========== СТИЛИ ДЛЯ АНИМАЦИЙ ==========
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // ========== ЗАГРУЗКА ИСТОРИИ ==========
    try {
        const saved = localStorage.getItem('metro_error_history');
        if (saved) {
            errorHistory = JSON.parse(saved);
        }
    } catch(e) {}
    
    console.log('error-handler.js готов');
    console.log('✅ Ошибки будут отправляться в Discord');
    
})();
