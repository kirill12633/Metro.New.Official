// cookies.js - Полное управление cookie с автоопределением языка

(function() {
    'use strict';
    
    console.log('cookies.js загружен');
    
    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        cookieLifetime: 365,
        autoCloseBannerSeconds: 30,
        siteUrls: {
            ru: 'https://kirill12633.github.io/Metro.New.Official/ru/',
            en: 'https://kirill12633.github.io/Metro.New.Official/en/'
        }
    };
    
    let bannerTimer = null;
    let bannerVisible = false;
    
    // ========== ОСНОВНЫЕ ФУНКЦИИ COOKIE ==========
    
    function setCookie(name, value, days = CONFIG.cookieLifetime) {
        try {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires.toUTCString() + '; path=/; SameSite=Lax';
            console.log('Cookie установлен:', name, value);
            return true;
        } catch(e) {
            console.error('Ошибка установки cookie:', e);
            return false;
        }
    }
    
    function getCookie(name) {
        try {
            const value = '; ' + document.cookie;
            const parts = value.split('; ' + name + '=');
            if (parts.length === 2) {
                return decodeURIComponent(parts.pop().split(';').shift());
            }
            return null;
        } catch(e) {
            console.error('Ошибка получения cookie:', e);
            return null;
        }
    }
    
    function deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        console.log('Cookie удалён:', name);
    }
    
    function deleteAllCookies() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const name = cookie.split('=')[0].trim();
            deleteCookie(name);
        }
        console.log('Все cookie удалены');
    }
    
    // ========== АВТООПРЕДЕЛЕНИЕ ЯЗЫКА ==========
    
    // 1. Определение языка по браузеру
    function getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        if (browserLang.startsWith('ru')) {
            return 'ru';
        }
        return 'en';
    }
    
    // 2. Определение языка по геолокации (IP)
    async function detectLanguageByGeo() {
        try {
            // Бесплатный API для определения страны
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            console.log('Геолокация определена:', data.country_code);
            
            // Россия, Украина, Беларусь, Казахстан и др. русскоязычные страны
            const russianCountries = ['RU', 'UA', 'BY', 'KZ', 'KG', 'AM', 'MD', 'TJ', 'UZ', 'AZ', 'GE'];
            if (russianCountries.includes(data.country_code)) {
                return 'ru';
            }
            return 'en';
        } catch(e) {
            console.warn('Геолокация не определена, используем браузер:', e);
            return getBrowserLanguage();
        }
    }
    
    // 3. Получение текущего языка из URL
    function getCurrentLangFromURL() {
        const path = window.location.pathname;
        if (path.startsWith('/ru/') || path === '/ru') {
            return 'ru';
        }
        if (path.startsWith('/en/') || path === '/en') {
            return 'en';
        }
        return null;
    }
    
    // 4. Определить, какой язык показывать в баннере
    async function determineBannerLanguage() {
        // Приоритет: 1. Сохранённый язык | 2. Язык из URL | 3. Геолокация | 4. Браузер | 5. Английский по умолчанию
        
        // Проверяем сохранённый язык
        const savedLang = localStorage.getItem('metro_new_language');
        if (savedLang && (savedLang === 'ru' || savedLang === 'en')) {
            console.log('Язык баннера (сохранённый):', savedLang);
            return savedLang;
        }
        
        // Проверяем язык из URL
        const urlLang = getCurrentLangFromURL();
        if (urlLang) {
            console.log('Язык баннера (из URL):', urlLang);
            return urlLang;
        }
        
        // Проверяем геолокацию
        try {
            const geoLang = await detectLanguageByGeo();
            console.log('Язык баннера (геолокация):', geoLang);
            return geoLang;
        } catch(e) {
            // По умолчанию браузер
            const browserLang = getBrowserLanguage();
            console.log('Язык баннера (браузер):', browserLang);
            return browserLang;
        }
    }
    
    // Получить текст баннера на нужном языке
    function getBannerTexts(lang) {
        if (lang === 'ru') {
            return {
                title: '🍪 Мы используем cookie',
                description: 'Для запоминания языка, аналитики и улучшения работы сайта.',
                detailsLink: '/ru/help/cookies',
                acceptAll: '✅ Принять все',
                acceptNecessary: '⚙️ Только необходимое',
                settings: '⚙️ Настроить'
            };
        } else {
            return {
                title: '🍪 We use cookies',
                description: 'To remember your language, analytics, and improve site performance.',
                detailsLink: '/en/help/cookies',
                acceptAll: '✅ Accept all',
                acceptNecessary: '⚙️ Necessary only',
                settings: '⚙️ Settings'
            };
        }
    }
    
    // ========== УПРАВЛЕНИЕ COOKIE ==========
    
    function hasConsent() {
        return getCookie('cookie_consent') === 'true';
    }
    
    function saveConsent(consentType) {
        setCookie('cookie_consent', 'true', CONFIG.cookieLifetime);
        setCookie('cookie_consent_type', consentType, CONFIG.cookieLifetime);
        
        const preferences = {
            necessary: true,
            functional: consentType === 'all',
            analytics: consentType === 'all',
            advertising: consentType === 'all'
        };
        setCookie('cookie_preferences', JSON.stringify(preferences), CONFIG.cookieLifetime);
        
        console.log('Согласие сохранено:', consentType);
    }
    
    function acceptAllCookies() {
        if (bannerTimer) clearTimeout(bannerTimer);
        saveConsent('all');
        syncLanguageToCookie();
        removeBanner();
        showMessage(getCurrentLang() === 'ru' ? '✅ Вы приняли все cookie' : '✅ You accepted all cookies', 'success');
    }
    
    function acceptNecessaryCookies() {
        if (bannerTimer) clearTimeout(bannerTimer);
        saveConsent('necessary');
        syncLanguageToCookie();
        removeBanner();
        showMessage(getCurrentLang() === 'ru' ? '⚙️ Используются только необходимые cookie' : '⚙️ Only necessary cookies are used', 'info');
    }
    
    function resetAllSettings() {
        deleteAllCookies();
        localStorage.removeItem('metro_new_language');
        localStorage.removeItem('metro_new_language_selected');
        
        // Перезагружаем страницу для применения
        const lang = getCurrentLang() === 'ru' ? 'ru' : 'en';
        const msg = lang === 'ru' ? '✅ Все настройки сброшены. Страница перезагрузится.' : '✅ All settings reset. Page will reload.';
        alert(msg);
        window.location.reload();
    }
    
    // ========== ЯЗЫК И COOKIE ==========
    
    function syncLanguageToCookie() {
        try {
            const savedLang = localStorage.getItem('metro_new_language');
            if (savedLang) {
                setCookie('metro_new_language', savedLang, CONFIG.cookieLifetime);
                setCookie('metro_new_language_selected', 'true', CONFIG.cookieLifetime);
                console.log('Язык синхронизирован в cookie:', savedLang);
            }
        } catch(e) {
            console.warn('Ошибка синхронизации языка:', e);
        }
    }
    
    function getCurrentLang() {
        const saved = localStorage.getItem('metro_new_language');
        if (saved) return saved;
        const urlLang = getCurrentLangFromURL();
        if (urlLang) return urlLang;
        return 'en';
    }
    
    // ========== БАННЕР СОГЛАСИЯ ==========
    
    async function showBannerIfNeeded() {
        if (hasConsent()) {
            console.log('Согласие уже есть, баннер не показываем');
            return false;
        }
        
        if (document.getElementById('metroCookieBanner')) {
            return false;
        }
        
        const bannerLang = await determineBannerLanguage();
        console.log('Показываем баннер на языке:', bannerLang);
        
        createBanner(bannerLang);
        return true;
    }
    
    function createBanner(lang) {
        const texts = getBannerTexts(lang);
        
        const bannerHTML = `
            <div id="metroCookieBanner" style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #1a1a2e;
                color: white;
                padding: 15px 20px;
                z-index: 999999;
                font-family: 'Montserrat', Arial, sans-serif;
                border-top: 3px solid #FFD700;
                box-shadow: 0 -2px 15px rgba(0,0,0,0.3);
            ">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 15px;">
                        <div style="flex: 2; min-width: 200px;">
                            <strong style="font-size: 16px;">${texts.title}</strong>
                            <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.8;">
                                ${texts.description}
                                <a href="${texts.detailsLink}" style="color: #FFD700; text-decoration: underline;">${lang === 'ru' ? 'Подробнее' : 'Learn more'}</a>
                            </p>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button id="cookieAcceptAllBtn" style="
                                background: #FFD700;
                                color: #1a1a2e;
                                border: none;
                                padding: 8px 20px;
                                border-radius: 25px;
                                cursor: pointer;
                                font-weight: bold;
                            ">${texts.acceptAll}</button>
                            <button id="cookieAcceptNecessaryBtn" style="
                                background: transparent;
                                color: white;
                                border: 1px solid #FFD700;
                                padding: 8px 20px;
                                border-radius: 25px;
                                cursor: pointer;
                            ">${texts.acceptNecessary}</button>
                            <button id="cookieSettingsBtn" style="
                                background: transparent;
                                color: #aaa;
                                border: 1px solid #555;
                                padding: 8px 20px;
                                border-radius: 25px;
                                cursor: pointer;
                            ">${texts.settings}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', bannerHTML);
        bannerVisible = true;
        
        // Таймер автозакрытия (30 секунд)
        bannerTimer = setTimeout(() => {
            if (document.getElementById('metroCookieBanner') && !hasConsent()) {
                acceptNecessaryCookies();
                console.log('Баннер закрыт автоматически через 30 секунд');
            }
        }, CONFIG.autoCloseBannerSeconds * 1000);
        
        // Назначаем обработчики
        const acceptAllBtn = document.getElementById('cookieAcceptAllBtn');
        const acceptNecessaryBtn = document.getElementById('cookieAcceptNecessaryBtn');
        const settingsBtn = document.getElementById('cookieSettingsBtn');
        
        if (acceptAllBtn) acceptAllBtn.onclick = () => acceptAllCookies();
        if (acceptNecessaryBtn) acceptNecessaryBtn.onclick = () => acceptNecessaryCookies();
        if (settingsBtn) settingsBtn.onclick = () => showSettingsPanel();
        
        console.log('Баннер cookie создан, автозакрытие через', CONFIG.autoCloseBannerSeconds, 'секунд');
    }
    
    function removeBanner() {
        const banner = document.getElementById('metroCookieBanner');
        if (banner) {
            banner.remove();
            bannerVisible = false;
            if (bannerTimer) clearTimeout(bannerTimer);
            console.log('Баннер cookie удалён');
        }
    }
    
    // ========== ПАНЕЛЬ УПРАВЛЕНИЯ В ФУТЕРЕ ==========
    
    function addFooterPanel() {
        // Ждём загрузки футера
        setTimeout(() => {
            const footer = document.querySelector('footer');
            if (!footer) {
                console.log('Футер не найден, панель не добавлена');
                return;
            }
            
            const panelHTML = `
                <div id="cookieControlPanel" style="
                    margin-top: 20px;
                    padding: 15px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                    text-align: center;
                ">
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
                        <button id="resetAllSettingsBtn" style="
                            background: #dc3545;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 13px;
                        ">
                            🗑️ ${getCurrentLang() === 'ru' ? 'Сбросить все настройки' : 'Reset all settings'}
                        </button>
                        <button id="openCookieSettingsBtn" style="
                            background: #0066CC;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 13px;
                        ">
                            ⚙️ ${getCurrentLang() === 'ru' ? 'Настройки cookie' : 'Cookie settings'}
                        </button>
                    </div>
                    <p style="font-size: 11px; margin-top: 10px; opacity: 0.6;">
                        ${getCurrentLang() === 'ru' ? 'Вы можете изменить настройки cookie в любой момент' : 'You can change cookie settings at any time'}
                    </p>
                </div>
            `;
            
            footer.insertAdjacentHTML('beforeend', panelHTML);
            
            document.getElementById('resetAllSettingsBtn')?.addEventListener('click', resetAllSettings);
            document.getElementById('openCookieSettingsBtn')?.addEventListener('click', showSettingsPanel);
            
            console.log('Панель управления cookie добавлена в футер');
        }, 1000);
    }
    
    // ========== ПАНЕЛЬ НАСТРОЕК (МОДАЛЬНОЕ ОКНО) ==========
    
    function showSettingsPanel() {
        const lang = getCurrentLang();
        const preferences = getCookie('cookie_preferences');
        let prefs = { necessary: true, functional: false, analytics: false, advertising: false };
        
        if (preferences) {
            try {
                prefs = JSON.parse(preferences);
            } catch(e) {}
        }
        
        const modalHTML = `
            <div id="cookieSettingsModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                font-family: 'Montserrat', Arial, sans-serif;
            ">
                <div style="
                    background: white;
                    border-radius: 16px;
                    max-width: 450px;
                    width: 90%;
                    padding: 25px;
                    color: #333;
                ">
                    <h2 style="margin-top: 0; color: #0066CC;">
                        ${lang === 'ru' ? '⚙️ Настройки cookie' : '⚙️ Cookie settings'}
                    </h2>
                    
                    <div style="margin: 20px 0;">
                        <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <span>
                                    <strong>📋 ${lang === 'ru' ? 'Строго необходимые' : 'Strictly necessary'}</strong>
                                    <br><small style="color: #666;">${lang === 'ru' ? 'Обеспечивают работу сайта' : 'Ensure site functionality'}</small>
                                </span>
                                <span style="color: #999;">${lang === 'ru' ? 'Всегда включены' : 'Always on'}</span>
                            </label>
                        </div>
                        
                        <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <span>
                                    <strong>🎨 ${lang === 'ru' ? 'Функциональные' : 'Functional'}</strong>
                                    <br><small style="color: #666;">${lang === 'ru' ? 'Запоминают ваши предпочтения' : 'Remember your preferences'}</small>
                                </span>
                                <input type="checkbox" id="prefFunctional" ${prefs.functional ? 'checked' : ''} style="width: 20px; height: 20px;">
                            </label>
                        </div>
                        
                        <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <span>
                                    <strong>📊 ${lang === 'ru' ? 'Аналитические' : 'Analytics'}</strong>
                                    <br><small style="color: #666;">${lang === 'ru' ? 'Помогают улучшать сайт' : 'Help improve the site'}</small>
                                </span>
                                <input type="checkbox" id="prefAnalytics" ${prefs.analytics ? 'checked' : ''} style="width: 20px; height: 20px;">
                            </label>
                        </div>
                        
                        <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <span>
                                    <strong>🎯 ${lang === 'ru' ? 'Рекламные' : 'Advertising'}</strong>
                                    <br><small style="color: #666;">${lang === 'ru' ? 'Персонализированная реклама' : 'Personalized advertising'}</small>
                                </span>
                                <input type="checkbox" id="prefAdvertising" ${prefs.advertising ? 'checked' : ''} style="width: 20px; height: 20px;">
                            </label>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="saveSettingsBtn" style="
                            background: #0066CC;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                        ">${lang === 'ru' ? '💾 Сохранить' : '💾 Save'}</button>
                        <button id="closeSettingsBtn" style="
                            background: #ccc;
                            color: #333;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                        ">${lang === 'ru' ? '✖️ Закрыть' : '✖️ Close'}</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            const functional = document.getElementById('prefFunctional')?.checked || false;
            const analytics = document.getElementById('prefAnalytics')?.checked || false;
            const advertising = document.getElementById('prefAdvertising')?.checked || false;
            
            const newPrefs = { necessary: true, functional, analytics, advertising };
            setCookie('cookie_preferences', JSON.stringify(newPrefs), CONFIG.cookieLifetime);
            setCookie('cookie_consent', 'true', CONFIG.cookieLifetime);
            
            document.getElementById('cookieSettingsModal')?.remove();
            showMessage(lang === 'ru' ? '⚙️ Настройки сохранены' : '⚙️ Settings saved', 'success');
        });
        
        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
            document.getElementById('cookieSettingsModal')?.remove();
        });
    }
    
    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    
    function showMessage(text, type = 'info') {
        const msg = document.createElement('div');
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#333'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 999999;
            font-family: 'Montserrat', Arial, sans-serif;
            font-size: 14px;
            animation: slideInRight 0.3s ease, fadeOut 3s ease 2s forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; visibility: hidden; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 5000);
    }
    
    // ========== ЗАПУСК ПРИ ЗАГРУЗКЕ ==========
    
    async function init() {
        syncLanguageToCookie();
        await showBannerIfNeeded();
        addFooterPanel();
        console.log('cookies.js инициализирован');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ========== ПУБЛИЧНЫЙ API ==========
    window.MetroNewCookies = {
        setCookie: setCookie,
        getCookie: getCookie,
        deleteCookie: deleteCookie,
        deleteAllCookies: deleteAllCookies,
        syncLanguage: syncLanguageToCookie,
        getLanguage: getCurrentLang,
        showBanner: showBannerIfNeeded,
        hasConsent: hasConsent,
        acceptAll: acceptAllCookies,
        acceptNecessary: acceptNecessaryCookies,
        resetAll: resetAllSettings,
        showSettings: showSettingsPanel,
        detectLanguage: detectLanguageByGeo,
        getBrowserLang: getBrowserLanguage
    };
    
    console.log('cookies.js готов, API: window.MetroNewCookies');
    
})();
