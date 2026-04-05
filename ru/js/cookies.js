// cookies.js - Управление cookie (Русская версия)

(function() {
    'use strict';

    console.log('cookies.js (ru) загружен');

    const CONFIG = {
        cookieLifetime: 365,
        autoCloseBannerSeconds: 30
    };

    let bannerTimer = null;

    // ========== ОСНОВНЫЕ ФУНКЦИИ COOKIE ==========

    function setCookie(name, value, days = CONFIG.cookieLifetime) {
        try {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires.toUTCString() + '; path=/; SameSite=Lax';
            console.log('Cookie установлен:', name);
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

    // ========== СОГЛАСИЕ С COOKIE ==========

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
        showMessage('✅ Вы приняли все cookie');
    }

    function acceptNecessaryCookies() {
        if (bannerTimer) clearTimeout(bannerTimer);
        saveConsent('necessary');
        syncLanguageToCookie();
        removeBanner();
        showMessage('⚙️ Используются только необходимые cookie');
    }

    function resetAllSettings() {
        deleteAllCookies();
        localStorage.removeItem('metro_new_language');
        localStorage.removeItem('metro_new_language_selected');
        alert('✅ Все настройки сброшены. Страница перезагрузится.');
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

    // ========== БАННЕР COOKIE (РУССКИЙ) ==========

    function showBannerIfNeeded() {
        if (hasConsent()) {
            console.log('Согласие уже есть, баннер не показываем');
            return false;
        }
        if (document.getElementById('metroCookieBanner')) return false;

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
                font-family: 'Montserrat', Arial, sans-serif;
                border-top: 3px solid #FFD700;
                box-shadow: 0 -2px 15px rgba(0,0,0,0.3);
            ">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 15px;">
                        <div style="flex: 2; min-width: 200px;">
                            <strong style="font-size: 16px;">🍪 Мы используем cookie</strong>
                            <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.8;">
                                Для запоминания языка и улучшения работы сайта.
                                <a href="/ru/help/cookies" style="color: #FFD700; text-decoration: underline;">Подробнее</a>
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
                            ">✅ Принять все</button>
                            <button id="cookieAcceptNecessaryBtn" style="
                                background: transparent;
                                color: white;
                                border: 1px solid #FFD700;
                                padding: 8px 20px;
                                border-radius: 25px;
                                cursor: pointer;
                            ">⚙️ Только необходимое</button>
                            <button id="cookieSettingsBtn" style="
                                background: transparent;
                                color: #aaa;
                                border: 1px solid #555;
                                padding: 8px 20px;
                                border-radius: 25px;
                                cursor: pointer;
                            ">⚙️ Настроить</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', bannerHTML);

        bannerTimer = setTimeout(() => {
            if (document.getElementById('metroCookieBanner') && !hasConsent()) {
                acceptNecessaryCookies();
                console.log('Баннер закрыт автоматически через 30 секунд');
            }
        }, CONFIG.autoCloseBannerSeconds * 1000);

        document.getElementById('cookieAcceptAllBtn')?.addEventListener('click', acceptAllCookies);
        document.getElementById('cookieAcceptNecessaryBtn')?.addEventListener('click', acceptNecessaryCookies);
        document.getElementById('cookieSettingsBtn')?.addEventListener('click', showSettingsPanel);
    }

    function removeBanner() {
        const banner = document.getElementById('metroCookieBanner');
        if (banner) {
            banner.remove();
            if (bannerTimer) clearTimeout(bannerTimer);
        }
    }

    // ========== ПАНЕЛЬ НАСТРОЕК (РУССКАЯ) ==========

    function showSettingsPanel() {
        const preferences = getCookie('cookie_preferences');
        let prefs = { necessary: true, functional: false, analytics: false, advertising: false };
        if (preferences) {
            try { prefs = JSON.parse(preferences); } catch(e) {}
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
                    <h2 style="margin-top: 0; color: #0066CC;">⚙️ Настройки cookie</h2>

                    <div style="margin: 20px 0;">
                        <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                            <label style="display: flex; justify-content: space-between; align-items: center;">
                                <span><strong>📋 Строго необходимые</strong><br><small>Обеспечивают работу сайта</small></span>
                                <span style="color: #999;">Всегда включены</span>
                            </label>
                        </div>
                        <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                            <label style="display: flex; justify-content: space-between; align-items: center;">
                                <span><strong>🎨 Функциональные</strong><br><small>Запоминают ваши предпочтения</small></span>
                                <input type="checkbox" id="prefFunctional" ${prefs.functional ? 'checked' : ''} style="width: 20px; height: 20px;">
                            </label>
                        </div>
                        <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                            <label style="display: flex; justify-content: space-between; align-items: center;">
                                <span><strong>📊 Аналитические</strong><br><small>Помогают улучшать сайт</small></span>
                                <input type="checkbox" id="prefAnalytics" ${prefs.analytics ? 'checked' : ''} style="width: 20px; height: 20px;">
                            </label>
                        </div>
                        <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                            <label style="display: flex; justify-content: space-between; align-items: center;">
                                <span><strong>🎯 Рекламные</strong><br><small>Персонализированная реклама</small></span>
                                <input type="checkbox" id="prefAdvertising" ${prefs.advertising ? 'checked' : ''} style="width: 20px; height: 20px;">
                            </label>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="saveSettingsBtn" style="background: #0066CC; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">💾 Сохранить</button>
                        <button id="closeSettingsBtn" style="background: #ccc; color: #333; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">✖️ Закрыть</button>
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
            showMessage('⚙️ Настройки сохранены');
        });

        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
            document.getElementById('cookieSettingsModal')?.remove();
        });
    }

    function showMessage(text) {
        const msg = document.createElement('div');
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 999999;
            font-family: 'Montserrat', Arial, sans-serif;
            font-size: 14px;
            animation: slideInRight 0.3s ease, fadeOut 3s ease 2s forwards;
        `;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 5000);
    }

    // Добавляем анимации
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

    // ========== ПАНЕЛЬ В ФУТЕРЕ ==========

    function addFooterPanel() {
        setTimeout(() => {
            const footer = document.querySelector('footer');
            if (!footer) return;

            const panelHTML = `
                <div id="cookieControlPanel" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; text-align: center;">
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
                        <button id="resetAllSettingsBtn" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">🗑️ Сбросить все настройки</button>
                        <button id="openCookieSettingsBtn" style="background: #0066CC; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">⚙️ Настройки cookie</button>
                    </div>
                    <p style="font-size: 11px; margin-top: 10px; opacity: 0.6;">Вы можете изменить настройки cookie в любой момент</p>
                </div>
            `;
            footer.insertAdjacentHTML('beforeend', panelHTML);

            document.getElementById('resetAllSettingsBtn')?.addEventListener('click', resetAllSettings);
            document.getElementById('openCookieSettingsBtn')?.addEventListener('click', showSettingsPanel);
        }, 1000);
    }

    // ========== ЗАПУСК ==========

    function init() {
        syncLanguageToCookie();
        showBannerIfNeeded();
        addFooterPanel();
        console.log('cookies.js (ru) инициализирован');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ========== ПУБЛИЧНЫЙ API ==========
    window.MetroNewCookies = {
        setCookie, getCookie, deleteCookie, deleteAllCookies,
        syncLanguage: syncLanguageToCookie,
        hasConsent, acceptAll: acceptAllCookies, acceptNecessary: acceptNecessaryCookies,
        resetAll: resetAllSettings, showSettings: showSettingsPanel,
        showBanner: showBannerIfNeeded
    };

    console.log('cookies.js (ru) готов');
})();
