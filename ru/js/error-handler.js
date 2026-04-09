// error-handler.js - Полная версия
// https://kirill12633.github.io/Metro.New.Official/ru/js/error-handler.js

(function() {
    'use strict';
    
    console.log('error-handler.js загружен');
    
    const CONFIG = {
        discordWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC',
        showToUser: true,
        saveToLocal: true,
        maxErrors: 20,
        autoCloseDelay: 5000,
        sendToDiscord: true,
        deduplicateTime: 5 * 60 * 1000
    };
    
    // ========== КАТЕГОРИИ ==========
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
    
    // ========== ПОДРОБНАЯ ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ ==========
    function getUserInfo() {
        // Проверяем cookie во всех местах
        const cookieConsent = localStorage.getItem('cookie_consent');
        const cookieConsentType = localStorage.getItem('cookie_consent_type');
        const cookiePreferences = localStorage.getItem('cookie_preferences');
        
        // Также проверяем реальные cookie
        let hasCookieConsent = false;
        let realCookieValue = null;
        if (document.cookie) {
            const match = document.cookie.match(/cookie_consent=([^;]+)/);
            if (match) {
                hasCookieConsent = true;
                realCookieValue = match[1];
            }
        }
        
        // Документы (полный список)
        const documents = {
            'Политика конфиденциальности': localStorage.getItem('metro_doc_privacy_v') || '❌ не принята',
            'Пользовательское соглашение': localStorage.getItem('metro_doc_terms_v') || '❌ не принято',
            'Политика возврата': localStorage.getItem('metro_doc_refund_v') || '❌ не принята',
            'Политика cookie': localStorage.getItem('metro_doc_cookies_v') || '❌ не принята',
            'Политика авторских прав': localStorage.getItem('metro_doc_copyright_v') || '❌ не принята',
            'Правила Discord': localStorage.getItem('metro_doc_community_v') || '❌ не приняты',
            'Правила сайта': localStorage.getItem('metro_doc_site_v') || '❌ не приняты'
        };
        
        // Считаем принятые
        let acceptedCount = 0;
        for (const [name, value] of Object.entries(documents)) {
            if (!value.startsWith('❌')) acceptedCount++;
        }
        
        // Определяем статус cookie подробно
        let cookieStatus = '❌ не приняты';
        let cookieDetail = '';
        
        if (cookieConsent === 'true') {
            if (cookieConsentType === 'all') {
                cookieStatus = '✅ ПРИНЯТЫ ВСЕ';
                cookieDetail = 'Пользователь принял все cookie (функциональные, аналитические, рекламные)';
            } else if (cookieConsentType === 'necessary') {
                cookieStatus = '⚙️ ТОЛЬКО НЕОБХОДИМЫЕ';
                cookieDetail = 'Пользователь принял только необходимые cookie';
            } else {
                cookieStatus = '✅ приняты (тип не указан)';
            }
        } else if (hasCookieConsent) {
            cookieStatus = `✅ приняты (в cookie: ${realCookieValue})`;
        } else {
            cookieStatus = '❌ НЕ ПРИНЯТЫ';
            cookieDetail = 'Пользователь ещё не принял cookie или отказался';
        }
        
        return {
            // Язык
            language: localStorage.getItem('metro_new_language') || '❌ не выбран',
            languageSelected: localStorage.getItem('metro_new_language_selected') === 'true' ? '✅ да' : '❌ нет',
            
            // Cookie (подробно)
            cookie: {
                status: cookieStatus,
                detail: cookieDetail,
                localStorage_consent: cookieConsent || 'нет',
                localStorage_type: cookieConsentType || 'нет',
                localStorage_preferences: cookiePreferences || 'нет',
                real_cookie_exists: hasCookieConsent,
                real_cookie_value: realCookieValue
            },
            
            // Документы
            documents: documents,
            documentsAccepted: `${acceptedCount}/7`,
            
            // Другое
            theme: localStorage.getItem('metro_theme') || 'светлая',
            isLoggedIn: !!localStorage.getItem('roblox_user_id'),
            
            // Версия скриптов
            scripts: {
                langConfig: typeof MetroNewLang !== 'undefined',
                cookies: typeof MetroNewCookies !== 'undefined',
                updateDocs: typeof MetroUpdateDocs !== 'undefined',
                security: typeof MetroSecurity !== 'undefined'
            }
        };
    }
    
    // ========== ОКРУЖЕНИЕ ==========
    function getEnvironmentInfo() {
        return {
            screen: `${screen.width}x${screen.height}`,
            window: `${window.innerWidth}x${window.innerHeight}`,
            pixelRatio: devicePixelRatio,
            colorDepth: screen.colorDepth,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            online: navigator.onLine ? '🟢 онлайн' : '🔴 офлайн',
            memory: performance.memory ? {
                jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB',
                totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
                usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB'
            } : 'недоступно',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            localTime: new Date().toLocaleString('ru-RU'),
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'не установлен'
        };
    }
    
    // ========== ОСТАЛЬНОЙ КОД (как был раньше) ==========
    let errorHistory = [];
    let sentErrors = new Map();
    
    function getErrorCategory(error, context = {}) {
        const message = (error.message || '').toLowerCase();
        if (message.includes('network') || message.includes('fetch') || context.type === 'fetch') 
            return ERROR_CATEGORIES.NETWORK;
        if (message.includes('security') || message.includes('cors') || message.includes('token')) 
            return ERROR_CATEGORIES.SECURITY;
        if (context.type === 'resource') 
            return ERROR_CATEGORIES.RESOURCE;
        if (context.type === 'unhandledrejection') 
            return ERROR_CATEGORIES.PROMISE;
        if (message.includes('localstorage') || message.includes('storage')) 
            return ERROR_CATEGORIES.STORAGE;
        return ERROR_CATEGORIES.SCRIPT;
    }
    
    function getSeverity(error, category) {
        const message = (error.message || '').toLowerCase();
        if (message.includes('crash') || message.includes('fatal') || category === ERROR_CATEGORIES.SECURITY) 
            return SEVERITY.CRITICAL;
        if (message.includes('undefined') || message.includes('null') || message.includes('cannot read')) 
            return SEVERITY.HIGH;
        if (message.includes('timeout')) 
            return SEVERITY.MEDIUM;
        return SEVERITY.LOW;
    }
    
    function showNotification(message, severity = SEVERITY.MEDIUM) {
        if (!CONFIG.showToUser) return;
        const colors = {1:'#dc3545',2:'#fd7e14',3:'#ffc107',4:'#17a2b8'};
        const toast = document.createElement('div');
        toast.style.cssText = `position:fixed;bottom:20px;right:20px;background:${colors[severity.level]};color:${severity.level===3?'#1a1a2e':'white'};padding:12px 20px;border-radius:12px;z-index:99999999;font-family:monospace;font-size:13px;max-width:350px;box-shadow:0 5px 20px rgba(0,0,0,0.3);animation:slideInRight 0.3s ease;cursor:pointer`;
        toast.innerHTML = `${severity.emoji} ${severity.name}: ${message.substring(0,100)}`;
        toast.onclick = () => toast.remove();
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), CONFIG.autoCloseDelay);
    }
    
    async function sendToDiscord(errorObj) {
        if (!CONFIG.sendToDiscord) return;
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
                { name: '📝 Сообщение', value: `\`\`\`js\n${(errorObj.message || '').substring(0,300)}\n\`\`\``, inline: false },
                { name: '📂 Категория', value: errorObj.category.name, inline: true },
                { name: '⚠️ Важность', value: errorObj.severity.name, inline: true },
                { name: '🔗 Страница', value: errorObj.url, inline: false },
                { name: '🕐 Время', value: errorObj.time, inline: true },
                { name: '👤 Пользователь', value: `\`\`\`\n🌐 Язык: ${errorObj.user?.language}\n🍪 Cookie: ${errorObj.user?.cookie?.status}\n📄 Документы: ${errorObj.user?.documentsAccepted}\n\`\`\``, inline: false },
                { name: '💻 Окружение', value: `\`\`\`\n🖥️ ${errorObj.environment?.screen}\n🌐 ${errorObj.environment?.userAgent?.substring(0,60)}\n📡 ${errorObj.environment?.online}\n\`\`\``, inline: false },
                { name: '📊 Стек', value: `\`\`\`js\n${stack}\n\`\`\``, inline: false }
            ],
            footer: { text: `ID: ${errorObj.id}` }
        };
        
        try {
            await fetch(CONFIG.discordWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [embed] }) });
        } catch(e) {}
    }
    
    function logError(error, context = {}) {
        const category = getErrorCategory(error, context);
        const severity = getSeverity(error, category);
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
        
        if (CONFIG.saveToLocal) {
            errorHistory.unshift(errorObj);
            if (errorHistory.length > CONFIG.maxErrors) errorHistory.pop();
            try { localStorage.setItem('metro_error_history', JSON.stringify(errorHistory)); } catch(e) {}
        }
        
        if (severity.level <= 2) showNotification(error.message || 'Ошибка', severity);
        sendToDiscord(errorObj);
        return errorObj;
    }
    
    // Перехватчики
    window.addEventListener('error', (e) => logError(e.error || new Error(e.message), { type: 'global', filename: e.filename, line: e.lineno }));
    window.addEventListener('unhandledrejection', (e) => logError(e.reason || new Error('Unhandled Promise'), { type: 'unhandledrejection' }));
    
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const res = await originalFetch.apply(this, args);
            if (!res.ok) logError(new Error(`Fetch ${res.status}`), { type: 'fetch', url: args[0], status: res.status });
            return res;
        } catch(e) { logError(e, { type: 'fetch', url: args[0] }); throw e; }
    };
    
    // Стили
    const style = document.createElement('style');
    style.textContent = '@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
    document.head.appendChild(style);
    
    // ========== СПЕЦИАЛЬНАЯ КОМАНДА ДЛЯ КОНСОЛИ ==========
    window.MetroDiagnostic = {
        // Полная диагностика
        run: function() {
            console.log('%c═══════════════════════════════════════════════════════', 'color: #FFD700');
            console.log('%c🔍 ДИАГНОСТИКА СИСТЕМЫ METRO NEW', 'color: #FFD700; font-size: 16px; font-weight: bold');
            console.log('%c═══════════════════════════════════════════════════════', 'color: #FFD700');
            
            console.log('\n📋 СОСТОЯНИЕ СКРИПТОВ:');
            console.log(`   lang-config.js: ${typeof MetroNewLang !== 'undefined' ? '✅ ЗАГРУЖЕН' : '❌ НЕ ЗАГРУЖЕН'}`);
            console.log(`   cookies.js: ${typeof MetroNewCookies !== 'undefined' ? '✅ ЗАГРУЖЕН' : '❌ НЕ ЗАГРУЖЕН'}`);
            console.log(`   update-docs.js: ${typeof MetroUpdateDocs !== 'undefined' ? '✅ ЗАГРУЖЕН' : '❌ НЕ ЗАГРУЖЕН'}`);
            console.log(`   error-handler.js: ✅ ЗАГРУЖЕН`);
            console.log(`   security.js: ${typeof MetroSecurity !== 'undefined' ? '✅ ЗАГРУЖЕН' : '❌ НЕ ЗАГРУЖЕН'}`);
            
            console.log('\n🍪 COOKIE И LOCALSTORAGE:');
            const userInfo = getUserInfo();
            console.log(`   Язык: ${userInfo.language}`);
            console.log(`   Cookie статус: ${userInfo.cookie.status}`);
            if (userInfo.cookie.detail) console.log(`   Детали: ${userInfo.cookie.detail}`);
            console.log(`   Документы: ${userInfo.documentsAccepted}`);
            
            console.log('\n📄 ПРИНЯТЫЕ ДОКУМЕНТЫ:');
            for (const [name, status] of Object.entries(userInfo.documents)) {
                const icon = status.startsWith('✅') ? '✅' : '❌';
                console.log(`   ${icon} ${name}: ${status}`);
            }
            
            console.log('\n💻 ОКРУЖЕНИЕ:');
            const env = getEnvironmentInfo();
            console.log(`   Экран: ${env.screen}`);
            console.log(`   Окно: ${env.window}`);
            console.log(`   Браузер: ${env.userAgent.substring(0, 80)}...`);
            console.log(`   Статус: ${env.online}`);
            console.log(`   Время: ${env.localTime}`);
            
            console.log('\n⚠️ ПОСЛЕДНИЕ ОШИБКИ:');
            if (errorHistory.length === 0) {
                console.log('   ✅ Ошибок не зафиксировано');
            } else {
                errorHistory.slice(0, 5).forEach((err, i) => {
                    console.log(`   ${i+1}. ${err.severity.name}: ${err.message.substring(0, 80)}...`);
                });
            }
            
            console.log('\n%c═══════════════════════════════════════════════════════', 'color: #FFD700');
            console.log('%c✅ Диагностика завершена', 'color: #4CAF50; font-size: 14px');
            console.log('%c═══════════════════════════════════════════════════════', 'color: #FFD700');
            
            return { userInfo, environment: env, errorCount: errorHistory.length };
        },
        
        // Проверка cookie
        cookies: function() {
            console.log('%c🍪 ПРОВЕРКА COOKIE', 'color: #FFD700; font-size: 14px');
            console.log('localStorage:');
            console.log(`  cookie_consent: ${localStorage.getItem('cookie_consent') || '❌ нет'}`);
            console.log(`  cookie_consent_type: ${localStorage.getItem('cookie_consent_type') || '❌ нет'}`);
            console.log(`  cookie_preferences: ${localStorage.getItem('cookie_preferences') || '❌ нет'}`);
            console.log('\nРеальные cookie (document.cookie):');
            if (document.cookie) {
                const cookies = document.cookie.split('; ');
                cookies.forEach(c => {
                    if (c.includes('cookie_')) console.log(`  ${c}`);
                });
            } else {
                console.log('  ❌ Нет cookie');
            }
            return { localStorage: localStorage.getItem('cookie_consent'), realCookie: document.cookie };
        },
        
        // Исправление проблем
        fix: function() {
            console.log('%c🔧 ПОПЫТКА ИСПРАВЛЕНИЯ', 'color: #FFD700; font-size: 14px');
            
            // Если cookie приняты в localStorage но не в document.cookie
            if (localStorage.getItem('cookie_consent') === 'true' && !document.cookie.includes('cookie_consent')) {
                console.log('  Синхронизирую cookie...');
                document.cookie = `cookie_consent=true; path=/; max-age=${365*24*60*60}`;
                document.cookie = `cookie_consent_type=${localStorage.getItem('cookie_consent_type') || 'all'}; path=/; max-age=${365*24*60*60}`;
                console.log('  ✅ Cookie синхронизированы');
            } else {
                console.log('  Cookie уже синхронизированы');
            }
            
            console.log('  ✅ Диагностика завершена. Запустите MetroDiagnostic.run() для проверки');
        }
    };
    
    // ========== API ==========
    window.MetroErrorHandler = {
        capture: logError,
        getHistory: () => [...errorHistory],
        clearHistory: () => { errorHistory = []; localStorage.removeItem('metro_error_history'); },
        getUserInfo: getUserInfo,
        getEnvironment: getEnvironmentInfo,
        test: () => { try { throw new Error('🧪 Тестовая ошибка'); } catch(e) { logError(e, { type: 'test' }); } },
        categories: ERROR_CATEGORIES,
        severity: SEVERITY
    };
    
    try {
        const saved = localStorage.getItem('metro_error_history');
        if (saved) errorHistory = JSON.parse(saved);
    } catch(e) {}
    
    console.log('error-handler.js готов');
    console.log('💡 Для диагностики введи: MetroDiagnostic.run()');
    
})();
