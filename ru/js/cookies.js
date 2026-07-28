// cookies.js - Управление cookie (Метро New)
// Версия: 2.0.0
// Совместимость: GDPR, 152-ФЗ (РФ), ePrivacy Directive

(function() {
    'use strict';

    console.log('🍪 cookies.js (Метро New) загружен');

    // ========== КОНФИГУРАЦИЯ ==========
    const CONFIG = {
        // Срок жизни cookie (дней)
        cookieLifetime: 365,
        // Автозакрытие баннера (секунд)
        autoCloseBannerSeconds: 30,
        // Домен для cookie (автоопределение)
        domain: window.location.hostname,
        // Безопасные cookie
        secure: window.location.protocol === 'https:',
        sameSite: 'Lax'
    };

    let bannerTimer = null;

    // ========== БЕЗОПАСНЫЕ ФУНКЦИИ COOKIE ==========

    /**
     * Установка cookie с защитой
     */
    function setCookie(name, value, days = CONFIG.cookieLifetime) {
        try {
            // Валидация имени cookie
            if (!/^[a-zA-Z0-9_\-]+$/.test(name)) {
                console.warn('⚠️ Некорректное имя cookie:', name);
                return false;
            }

            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

            let cookieString = name + '=' + encodeURIComponent(value) +
                '; expires=' + expires.toUTCString() +
                '; path=/';

            // Добавляем SameSite
            if (CONFIG.sameSite) {
                cookieString += '; SameSite=' + CONFIG.sameSite;
            }

            // Добавляем Secure если HTTPS
            if (CONFIG.secure) {
                cookieString += '; Secure';
            }

            // Добавляем Domain (только для продакшена)
            if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
                cookieString += '; Domain=' + CONFIG.domain;
            }

            document.cookie = cookieString;

            // Проверка успешности
            if (getCookie(name) === value) {
                console.log('✅ Cookie установлен:', name);
                return true;
            } else {
                console.warn('⚠️ Не удалось установить cookie:', name);
                return false;
            }
        } catch(e) {
            console.error('❌ Ошибка установки cookie:', e);
            return false;
        }
    }

    /**
     * Получение cookie с защитой от XSS
     */
    function getCookie(name) {
        try {
            if (!/^[a-zA-Z0-9_\-]+$/.test(name)) {
                console.warn('⚠️ Некорректное имя cookie:', name);
                return null;
            }

            const value = '; ' + document.cookie;
            const parts = value.split('; ' + name + '=');
            if (parts.length === 2) {
                const decoded = decodeURIComponent(parts.pop().split(';').shift());
                // Защита от XSS - удаляем потенциально опасные символы
                return decoded.replace(/[<>]/g, '');
            }
            return null;
        } catch(e) {
            console.error('❌ Ошибка получения cookie:', e);
            return null;
        }
    }

    /**
     * Удаление cookie
     */
    function deleteCookie(name) {
        try {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            if (window.location.hostname !== 'localhost') {
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Domain=' + CONFIG.domain;
            }
            console.log('🗑️ Cookie удалён:', name);
            return true;
        } catch(e) {
            console.error('❌ Ошибка удаления cookie:', e);
            return false;
        }
    }

    /**
     * Удаление всех cookie (кроме необходимых)
     */
    function deleteAllCookies() {
        const necessary = ['cookie_consent', 'cookie_consent_type', 'cookie_preferences'];
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            const name = cookie.split('=')[0].trim();
            if (!necessary.includes(name)) {
                deleteCookie(name);
            }
        }
        console.log('🗑️ Все необязательные cookie удалены');
    }

    // ========== СОГЛАСИЕ НА COOKIE (СООТВЕТСТВИЕ ЗАКОНАМ) ==========

    /**
     * Проверка наличия согласия
     * Соответствует GDPR, 152-ФЗ
     */
    function hasConsent() {
        const consent = getCookie('cookie_consent');
        return consent === 'true';
    }

    /**
     * Сохранение согласия с категориями
     */
    function saveConsent(consentType) {
        // Основное согласие
        setCookie('cookie_consent', 'true', CONFIG.cookieLifetime);

        // Тип согласия
        setCookie('cookie_consent_type', consentType, CONFIG.cookieLifetime);

        // Дата согласия (для аудита)
        setCookie('cookie_consent_date', new Date().toISOString(), CONFIG.cookieLifetime);

        // Предпочтения
        const preferences = {
            necessary: true,
            functional: consentType === 'all',
            analytics: consentType === 'all',
            advertising: consentType === 'all'
        };
        setCookie('cookie_preferences', JSON.stringify(preferences), CONFIG.cookieLifetime);

        console.log('📝 Согласие сохранено:', consentType);
    }

    /**
     * Принять все cookie
     */
    function acceptAllCookies() {
        if (bannerTimer) clearTimeout(bannerTimer);
        saveConsent('all');
        syncLanguageToCookie();
        removeBanner();
        showMessage('✅ Вы приняли все cookie', 'success');
    }

    /**
     * Принять только необходимые cookie
     */
    function acceptNecessaryCookies() {
        if (bannerTimer) clearTimeout(bannerTimer);
        saveConsent('necessary');
        syncLanguageToCookie();
        removeBanner();
        showMessage('⚙️ Используются только необходимые cookie', 'info');
    }

    /**
     * Сброс всех настроек
     */
    function resetAllSettings() {
        if (!confirm('⚠️ Вы уверены, что хотите сбросить все настройки?\n\n' +
                'Это удалит:\n' +
                '• Все cookie\n' +
                '• Сохранённый язык\n' +
                '• Настройки темы\n' +
                '• Прочие пользовательские настройки')) {
            return;
        }

        // Удаляем все cookie
        const allCookies = document.cookie.split(';');
        for (let cookie of allCookies) {
            const name = cookie.split('=')[0].trim();
            deleteCookie(name);
        }

        // Очищаем localStorage
        localStorage.clear();

        showMessage('✅ Все настройки сброшены. Страница перезагрузится.', 'success');

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }

    // ========== СИНХРОНИЗАЦИЯ ЯЗЫКА ==========

    function syncLanguageToCookie() {
        try {
            const savedLang = localStorage.getItem('metro_new_language');
            if (savedLang) {
                setCookie('metro_new_language', savedLang, CONFIG.cookieLifetime);
                setCookie('metro_new_language_selected', 'true', CONFIG.cookieLifetime);
                console.log('🌐 Язык синхронизирован в cookie:', savedLang);
            }
        } catch(e) {
            console.warn('⚠️ Ошибка синхронизации языка:', e);
        }
    }

    // ========== БАННЕР COOKIE (СООТВЕТСТВИЕ ЗАКОНАМ) ==========

    function showBannerIfNeeded() {
        // Проверяем, есть ли согласие
        if (hasConsent()) {
            console.log('✅ Согласие уже есть, баннер не показываем');
            return false;
        }

        // Проверяем, не скрыт ли баннер ранее
        if (getCookie('cookie_banner_hidden') === 'true') {
            return false;
        }

        // Проверяем, не отображается ли уже
        if (document.getElementById('metroCookieBanner')) {
            return false;
        }

        createBanner();
        return true;
    }

    function createBanner() {
        const bannerHTML = `
            <div id="metroCookieBanner" role="dialog" aria-label="Уведомление о cookie" style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(13, 21, 38, 0.97);
                backdrop-filter: blur(12px);
                color: #f2f4fa;
                padding: 16px 20px;
                z-index: 999999;
                font-family: 'Montserrat', Arial, sans-serif;
                border-top: 3px solid #FFD700;
                box-shadow: 0 -4px 30px rgba(0,0,0,0.5);
                animation: slideUpBanner 0.4s ease;
            ">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 15px;">
                        <div style="flex: 2; min-width: 200px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                                <span style="font-size: 22px;">🍪</span>
                                <strong style="font-size: 16px; color: #FFD700;">Мы используем cookie</strong>
                            </div>
                            <p style="margin: 0; font-size: 13px; opacity: 0.85; line-height: 1.5;">
                                Мы используем cookie для запоминания вашего языка, персонализации и улучшения работы сайта.
                                <a href="/ru/help/cookies" style="color: #FFD700; text-decoration: underline; font-weight: 600;">Подробнее</a>
                            </p>
                            <p style="margin: 4px 0 0; font-size: 11px; opacity: 0.5;">
                                <i class="fas fa-shield-alt"></i> Ваши данные защищены в соответствии с 152-ФЗ и GDPR
                            </p>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                            <button id="cookieAcceptAllBtn" style="
                                background: linear-gradient(135deg, #FFD700, #e6c200);
                                color: #0d1526;
                                border: none;
                                padding: 10px 24px;
                                border-radius: 30px;
                                cursor: pointer;
                                font-weight: 700;
                                font-size: 14px;
                                transition: all 0.3s;
                                font-family: 'Montserrat', Arial, sans-serif;
                            ">
                                ✅ Принять все
                            </button>
                            <button id="cookieAcceptNecessaryBtn" style="
                                background: transparent;
                                color: #f2f4fa;
                                border: 1px solid rgba(255, 215, 0, 0.4);
                                padding: 10px 20px;
                                border-radius: 30px;
                                cursor: pointer;
                                font-weight: 600;
                                font-size: 13px;
                                transition: all 0.3s;
                                font-family: 'Montserrat', Arial, sans-serif;
                            ">
                                ⚙️ Только необходимое
                            </button>
                            <button id="cookieSettingsBtn" style="
                                background: transparent;
                                color: #77819e;
                                border: 1px solid rgba(119, 129, 158, 0.3);
                                padding: 10px 16px;
                                border-radius: 30px;
                                cursor: pointer;
                                font-weight: 500;
                                font-size: 13px;
                                transition: all 0.3s;
                                font-family: 'Montserrat', Arial, sans-serif;
                            ">
                                ⚙️ Настроить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes slideUpBanner {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                #metroCookieBanner button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.15);
                }
                #cookieAcceptNecessaryBtn:hover {
                    border-color: #FFD700;
                    background: rgba(255, 215, 0, 0.05);
                }
                #cookieSettingsBtn:hover {
                    border-color: #FFD700;
                    color: #f2f4fa;
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', bannerHTML);

        // Автозакрытие через 30 секунд
        bannerTimer = setTimeout(() => {
            if (document.getElementById('metroCookieBanner') && !hasConsent()) {
                acceptNecessaryCookies();
                console.log('⏰ Баннер закрыт автоматически через 30 секунд');
            }
        }, CONFIG.autoCloseBannerSeconds * 1000);

        // Обработчики кнопок
        document.getElementById('cookieAcceptAllBtn')?.addEventListener('click', acceptAllCookies);
        document.getElementById('cookieAcceptNecessaryBtn')?.addEventListener('click', acceptNecessaryCookies);
        document.getElementById('cookieSettingsBtn')?.addEventListener('click', showSettingsPanel);
    }

    function removeBanner() {
        const banner = document.getElementById('metroCookieBanner');
        if (banner) {
            banner.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            banner.style.transform = 'translateY(100%)';
            banner.style.opacity = '0';
            setTimeout(() => {
                banner.remove();
            }, 300);
            if (bannerTimer) {
                clearTimeout(bannerTimer);
                bannerTimer = null;
            }
        }
    }

    // ========== ПАНЕЛЬ НАСТРОЕК ==========

    function showSettingsPanel() {
        const preferences = getCookie('cookie_preferences');
        let prefs = { necessary: true, functional: false, analytics: false, advertising: false };

        if (preferences) {
            try {
                prefs = JSON.parse(preferences);
            } catch(e) {
                console.warn('⚠️ Не удалось разобрать настройки cookie');
            }
        }

        const modalHTML = `
            <div id="cookieSettingsModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(13, 21, 38, 0.92);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000000;
                backdrop-filter: blur(8px);
                font-family: 'Montserrat', Arial, sans-serif;
                animation: fadeInModal 0.3s ease;
            ">
                <div style="
                    background: linear-gradient(145deg, #182444, #0d1526);
                    border: 1px solid rgba(255, 215, 0, 0.15);
                    border-radius: 24px;
                    max-width: 480px;
                    width: 92%;
                    padding: 30px 28px;
                    color: #f2f4fa;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.8);
                    animation: slideInModal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: #FFD700; margin: 0; font-size: 22px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-cookie-bite"></i> Настройки cookie
                        </h2>
                        <button id="closeSettingsBtn" style="
                            background: none;
                            border: none;
                            color: #77819e;
                            font-size: 24px;
                            cursor: pointer;
                            transition: all 0.3s;
                        ">✖️</button>
                    </div>

                    <div style="margin: 20px 0;">
                        <div style="margin-bottom: 12px; padding: 14px 16px; background: rgba(255,255,255,0.04); border-radius: 12px; border-left: 3px solid #FFD700;">
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: default;">
                                <div>
                                    <div style="font-weight: 600; color: #f2f4fa;">📋 Строго необходимые</div>
                                    <div style="font-size: 12px; color: #77819e;">Обеспечивают работу сайта</div>
                                </div>
                                <span style="color: #34a853; font-weight: 600; font-size: 13px;">Всегда включены</span>
                            </label>
                        </div>

                        <div style="margin-bottom: 12px; padding: 14px 16px; background: rgba(255,255,255,0.04); border-radius: 12px; border-left: 3px solid rgba(255,215,0,0.3);">
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <div>
                                    <div style="font-weight: 600; color: #f2f4fa;">🎨 Функциональные</div>
                                    <div style="font-size: 12px; color: #77819e;">Запоминают язык и предпочтения</div>
                                </div>
                                <input type="checkbox" id="prefFunctional" ${prefs.functional ? 'checked' : ''} style="
                                    width: 20px; height: 20px; accent-color: #FFD700; cursor: pointer;
                                ">
                            </label>
                        </div>

                        <div style="margin-bottom: 12px; padding: 14px 16px; background: rgba(255,255,255,0.04); border-radius: 12px; border-left: 3px solid rgba(255,215,0,0.3);">
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <div>
                                    <div style="font-weight: 600; color: #f2f4fa;">📊 Аналитические</div>
                                    <div style="font-size: 12px; color: #77819e;">Помогают улучшать работу сайта</div>
                                </div>
                                <input type="checkbox" id="prefAnalytics" ${prefs.analytics ? 'checked' : ''} style="
                                    width: 20px; height: 20px; accent-color: #FFD700; cursor: pointer;
                                ">
                            </label>
                        </div>

                        <div style="margin-bottom: 12px; padding: 14px 16px; background: rgba(255,255,255,0.04); border-radius: 12px; border-left: 3px solid rgba(255,215,0,0.3);">
                            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <div>
                                    <div style="font-weight: 600; color: #f2f4fa;">🎯 Рекламные</div>
                                    <div style="font-size: 12px; color: #77819e;">Персонализированная реклама</div>
                                </div>
                                <input type="checkbox" id="prefAdvertising" ${prefs.advertising ? 'checked' : ''} style="
                                    width: 20px; height: 20px; accent-color: #FFD700; cursor: pointer;
                                ">
                            </label>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
                        <button id="saveSettingsBtn" style="
                            background: linear-gradient(135deg, #FFD700, #e6c200);
                            color: #0d1526;
                            border: none;
                            padding: 10px 24px;
                            border-radius: 30px;
                            cursor: pointer;
                            font-weight: 700;
                            font-size: 14px;
                            font-family: 'Montserrat', Arial, sans-serif;
                        ">
                            💾 Сохранить
                        </button>
                        <button id="closeSettingsBtn2" style="
                            background: transparent;
                            color: #77819e;
                            border: 1px solid rgba(119, 129, 158, 0.3);
                            padding: 10px 20px;
                            border-radius: 30px;
                            cursor: pointer;
                            font-weight: 500;
                            font-size: 13px;
                            font-family: 'Montserrat', Arial, sans-serif;
                        ">
                            ✖️ Закрыть
                        </button>
                    </div>
                </div>
            </div>
            <style>
                @keyframes fadeInModal {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInModal {
                    from {
                        opacity: 0;
                        transform: scale(0.92) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                #cookieSettingsModal input[type="checkbox"]:hover {
                    transform: scale(1.1);
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Закрытие по клику вне модалки
        document.getElementById('cookieSettingsModal').addEventListener('click', function(e) {
            if (e.target === this) {
                this.remove();
            }
        });

        // Обработчики кнопок
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            const functional = document.getElementById('prefFunctional')?.checked || false;
            const analytics = document.getElementById('prefAnalytics')?.checked || false;
            const advertising = document.getElementById('prefAdvertising')?.checked || false;

            const newPrefs = { necessary: true, functional, analytics, advertising };
            setCookie('cookie_preferences', JSON.stringify(newPrefs), CONFIG.cookieLifetime);
            setCookie('cookie_consent', 'true', CONFIG.cookieLifetime);

            document.getElementById('cookieSettingsModal')?.remove();
            showMessage('⚙️ Настройки сохранены', 'success');
        });

        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
            document.getElementById('cookieSettingsModal')?.remove();
        });

        document.getElementById('closeSettingsBtn2')?.addEventListener('click', () => {
            document.getElementById('cookieSettingsModal')?.remove();
        });

        // Закрытие по ESC
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('cookieSettingsModal');
                if (modal) {
                    modal.remove();
                    document.removeEventListener('keydown', handler);
                }
            }
        });
    }

    // ========== УВЕДОМЛЕНИЯ ==========

    function showMessage(text, type) {
        type = type || 'success';

        const msg = document.createElement('div');
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#34a853' : type === 'error' ? '#f28b82' : '#FFD700'};
            color: ${type === 'success' ? '#fff' : type === 'error' ? '#fff' : '#0d1526'};
            padding: 14px 28px;
            border-radius: 30px;
            z-index: 9999999;
            font-family: 'Montserrat', Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            animation: fadeInModal 0.3s ease, fadeOutMessage 3s ease 2s forwards;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(msg);

        setTimeout(() => {
            if (msg.parentNode) {
                msg.remove();
            }
        }, 5000);
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========

    function init() {
        console.log('🍪 Инициализация cookie manager...');

        // Синхронизация языка
        syncLanguageToCookie();

        // Показ баннера если нужно
        showBannerIfNeeded();

        console.log('✅ cookie.js инициализирован');
    }

    // ========== ПУБЛИЧНЫЙ API ==========

    window.MetroNewCookies = {
        // Основные методы
        setCookie: setCookie,
        getCookie: getCookie,
        deleteCookie: deleteCookie,
        deleteAllCookies: deleteAllCookies,

        // Синхронизация
        syncLanguage: syncLanguageToCookie,

        // Согласие
        hasConsent: hasConsent,
        acceptAll: acceptAllCookies,
        acceptNecessary: acceptNecessaryCookies,

        // Настройки
        resetAll: resetAllSettings,
        showSettings: showSettingsPanel,

        // Баннер
        showBanner: showBannerIfNeeded,
        hideBanner: removeBanner,

        // Конфигурация
        config: CONFIG
    };

    // ========== ЗАПУСК ==========

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('🍪 MetroNewCookies API доступен');
    console.log('📌 Используйте: window.MetroNewCookies.acceptAll()');
})();
