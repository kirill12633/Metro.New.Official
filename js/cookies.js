// cookies.js - Cookie management for Metro New

(function() {
    'use strict';
    
    // Простая проверка загрузки
    console.log('cookies.js загружен');
    
    // ========== ОСНОВНЫЕ ФУНКЦИИ COOKIE ==========
    
    // Установить cookie
    function setCookie(name, value, days = 365) {
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
    
    // Получить cookie
    function getCookie(name) {
        try {
            const value = '; ' + document.cookie;
            const parts = value.split('; ' + name + '=');
            if (parts.length === 2) {
                const result = decodeURIComponent(parts.pop().split(';').shift());
                console.log('Cookie получен:', name, result);
                return result;
            }
            return null;
        } catch(e) {
            console.error('Ошибка получения cookie:', e);
            return null;
        }
    }
    
    // Удалить cookie
    function deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        console.log('Cookie удалён:', name);
    }
    
    // ========== ЯЗЫК И COOKIE ==========
    
    // Синхронизировать язык из localStorage в cookie
    function syncLanguageToCookie() {
        try {
            const savedLang = localStorage.getItem('metro_new_language');
            if (savedLang) {
                setCookie('metro_new_language', savedLang, 365);
                setCookie('metro_new_language_selected', 'true', 365);
                console.log('Язык синхронизирован в cookie:', savedLang);
            }
        } catch(e) {
            console.warn('Ошибка синхронизации языка:', e);
        }
    }
    
    // Получить язык из cookie
    function getLanguageFromCookie() {
        return getCookie('metro_new_language');
    }
    
    // ========== COOKIE СОГЛАСИЕ (GDPR) ==========
    
    // Проверить, есть ли согласие
    function hasConsent() {
        const consent = getCookie('cookie_consent');
        const preferences = getCookie('cookie_preferences');
        return !!(consent === 'true' || preferences);
    }
    
    // Сохранить согласие
    function saveConsent(consentType) {
        setCookie('cookie_consent', 'true', 365);
        setCookie('cookie_consent_type', consentType, 365);
        
        const preferences = {
            necessary: true,
            functional: consentType === 'all',
            analytics: consentType === 'all',
            advertising: consentType === 'all'
        };
        setCookie('cookie_preferences', JSON.stringify(preferences), 365);
        
        console.log('Согласие сохранено:', consentType);
    }
    
    // Принять все cookie
    function acceptAllCookies() {
        saveConsent('all');
        syncLanguageToCookie();
        removeBanner();
        showMessage('✅ Вы приняли все cookie');
        return true;
    }
    
    // Принять только необходимые
    function acceptNecessaryCookies() {
        saveConsent('necessary');
        syncLanguageToCookie();
        removeBanner();
        showMessage('⚙️ Используются только необходимые cookie');
        return true;
    }
    
    // ========== БАННЕР СОГЛАСИЯ ==========
    
    function showBannerIfNeeded() {
        // Если уже есть согласие - не показываем
        if (hasConsent()) {
            console.log('Согласие уже есть, баннер не показываем');
            return false;
        }
        
        // Если баннер уже есть - не создаём новый
        if (document.getElementById('metroCookieBanner')) {
            return false;
        }
        
        createBanner();
        return true;
    }
    
    function createBanner() {
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
                font-family: Arial, sans-serif;
                border-top: 3px solid #FFD700;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
            ">
                <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 15px;">
                    <div style="flex: 2; min-width: 200px;">
                        <strong>🍪 Мы используем cookie</strong>
                        <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.8;">
                            Для запоминания языка и улучшения работы сайта.
                            <a href="/help/cookies" style="color: #FFD700; text-decoration: underline;">Подробнее</a>
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button id="cookieAcceptAllBtn" style="
                            background: #FFD700;
                            color: #1a1a2e;
                            border: none;
                            padding: 8px 20px;
                            border-radius: 25px;
                            cursor: pointer;
                            font-weight: bold;
                        ">Принять все</button>
                        <button id="cookieAcceptNecessaryBtn" style="
                            background: transparent;
                            color: white;
                            border: 1px solid #FFD700;
                            padding: 8px 20px;
                            border-radius: 25px;
                            cursor: pointer;
                        ">Только необходимое</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', bannerHTML);
        
        // Назначаем обработчики
        const acceptAllBtn = document.getElementById('cookieAcceptAllBtn');
        const acceptNecessaryBtn = document.getElementById('cookieAcceptNecessaryBtn');
        
        if (acceptAllBtn) {
            acceptAllBtn.onclick = function() {
                acceptAllCookies();
            };
        }
        
        if (acceptNecessaryBtn) {
            acceptNecessaryBtn.onclick = function() {
                acceptNecessaryCookies();
            };
        }
        
        console.log('Баннер cookie создан');
    }
    
    function removeBanner() {
        const banner = document.getElementById('metroCookieBanner');
        if (banner) {
            banner.remove();
            console.log('Баннер cookie удалён');
        }
    }
    
    function showMessage(text) {
        // Всплывающее сообщение
        const msg = document.createElement('div');
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            animation: fadeOut 3s ease forwards;
        `;
        
        // Добавляем анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                0% { opacity: 1; }
                70% { opacity: 1; }
                100% { opacity: 0; visibility: hidden; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(msg);
        
        setTimeout(function() {
            if (msg) msg.remove();
        }, 3000);
    }
    
    // ========== ЗАПУСК ПРИ ЗАГРУЗКЕ ==========
    
    // Автоматическая синхронизация языка при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            syncLanguageToCookie();
            console.log('cookies.js: DOM загружен, язык синхронизирован');
        });
    } else {
        syncLanguageToCookie();
        console.log('cookies.js: язык синхронизирован');
    }
    
    // ========== ПУБЛИЧНЫЙ API ==========
    window.MetroNewCookies = {
        setCookie: setCookie,
        getCookie: getCookie,
        deleteCookie: deleteCookie,
        syncLanguage: syncLanguageToCookie,
        getLanguage: getLanguageFromCookie,
        showBanner: showBannerIfNeeded,
        hasConsent: hasConsent,
        acceptAll: acceptAllCookies,
        acceptNecessary: acceptNecessaryCookies
    };
    
    // Для отладки
    console.log('cookies.js готов, API доступен как window.MetroNewCookies');
    
})();
