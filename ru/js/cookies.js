// cookies.js - Управление cookie (Метро New)
// Версия: 3.0.0
// Совместимость: GDPR, 152-ФЗ (РФ), ePrivacy Directive

(function() {
    'use strict';

    // ========== ОПРЕДЕЛЕНИЕ СРЕДЫ ==========
    const isProduction = window.location.hostname !== 'localhost' &&
                        !window.location.hostname.includes('127.0.0.1') &&
                        !window.location.hostname.includes('github.io');

    // ========== ЛОГГЕР (отключается в production) ==========
    const logger = {
        log: function() {
            if (!isProduction) console.log.apply(console, arguments);
        },
        warn: function() {
            if (!isProduction) console.warn.apply(console, arguments);
        },
        error: function() {
            if (!isProduction) console.error.apply(console, arguments);
        }
    };

    logger.log('🍪 cookies.js (Метро New) загружен');
    if (isProduction) {
        logger.log('🔒 Production режим: логи отключены');
    }

    // ========== КОНФИГУРАЦИЯ ==========
    const CONFIG = {
        cookieLifetime: 365,
        sameSite: 'Lax',
        secure: window.location.protocol === 'https:'
    };

    // ========== БЕЗОПАСНЫЕ ФУНКЦИИ COOKIE ==========

    /**
     * Установка cookie с защитой
     * Без Domain, только Path, SameSite, Secure
     */
    function setCookie(name, value, days = CONFIG.cookieLifetime) {
        try {
            // Валидация имени cookie
            if (!/^[a-zA-Z0-9_\-]+$/.test(name)) {
                logger.warn('⚠️ Некорректное имя cookie:', name);
                return false;
            }

            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

            let cookieString = name + '=' + encodeURIComponent(value) +
                '; expires=' + expires.toUTCString() +
                '; path=/';

            if (CONFIG.sameSite) {
                cookieString += '; SameSite=' + CONFIG.sameSite;
            }

            if (CONFIG.secure) {
                cookieString += '; Secure';
            }

            document.cookie = cookieString;

            // Проверка успешности
            if (getCookie(name) === value) {
                logger.log('✅ Cookie установлен:', name);
                return true;
            } else {
                logger.warn('⚠️ Не удалось установить cookie:', name);
                return false;
            }
        } catch(e) {
            logger.error('❌ Ошибка установки cookie:', e);
            return false;
        }
    }

    /**
     * Получение cookie с безопасным декодированием
     * Без ложной "защиты" replace(/[<>]/g,'')
     */
    function getCookie(name) {
        try {
            if (!/^[a-zA-Z0-9_\-]+$/.test(name)) {
                logger.warn('⚠️ Некорректное имя cookie:', name);
                return null;
            }

            const value = '; ' + document.cookie;
            const parts = value.split('; ' + name + '=');
            if (parts.length === 2) {
                return decodeURIComponent(parts.pop().split(';').shift());
            }
            return null;
        } catch(e) {
            logger.error('❌ Ошибка получения cookie:', e);
            return null;
        }
    }

    /**
     * Удаление cookie с теми же атрибутами (Path, SameSite, Secure)
     * Это гарантирует правильное удаление
     */
    function deleteCookie(name) {
        try {
            let cookieString = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';

            if (CONFIG.sameSite) {
                cookieString += '; SameSite=' + CONFIG.sameSite;
            }

            if (CONFIG.secure) {
                cookieString += '; Secure';
            }

            document.cookie = cookieString;

            logger.log('🗑️ Cookie удалён:', name);
            return true;
        } catch(e) {
            logger.error('❌ Ошибка удаления cookie:', e);
            return false;
        }
    }

    /**
     * Удаление всех cookie (кроме необходимых)
     * Без Domain
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
        logger.log('🗑️ Все необязательные cookie удалены');
    }

    // ========== СОГЛАСИЕ НА COOKIE ==========

    function hasConsent() {
        const consent = getCookie('cookie_consent');
        return consent === 'true';
    }

    function saveConsent(consentType) {
        setCookie('cookie_consent', 'true', CONFIG.cookieLifetime);
        setCookie('cookie_consent_type', consentType, CONFIG.cookieLifetime);
        setCookie('cookie_consent_date', new Date().toISOString(), CONFIG.cookieLifetime);

        const preferences = {
            necessary: true,
            functional: consentType === 'all',
            analytics: consentType === 'all',
            advertising: consentType === 'all'
        };
        setCookie('cookie_preferences', JSON.stringify(preferences), CONFIG.cookieLifetime);

        logger.log('📝 Согласие сохранено:', consentType);
    }

    // ========== СОГЛАСИЕ БЕЗ АВТОМАТИЧЕСКОГО ПРИНЯТИЯ ==========

    function acceptAllCookies() {
        if (bannerTimer) {
            clearTimeout(bannerTimer);
            bannerTimer = null;
        }
        saveConsent('all');
        syncLanguageToCookie();
        removeBanner();
        showMessage('✅ Вы приняли все cookie', 'success');
    }

    function acceptNecessaryCookies() {
        if (bannerTimer) {
            clearTimeout(bannerTimer);
            bannerTimer = null;
        }
        saveConsent('necessary');
        syncLanguageToCookie();
        removeBanner();
        showMessage('⚙️ Используются только необходимые cookie', 'info');
    }

    // ========== СБРОС НАСТРОЕК (БЕЗ localStorage.clear()) ==========

    function resetAllSettings() {
        if (!confirm('⚠️ Вы уверены, что хотите сбросить все настройки?\n\n' +
                'Это удалит:\n' +
                '• Все cookie (кроме необходимых)\n' +
                '• Сохранённый язык\n' +
                '• Настройки темы')) {
            return;
        }

        // Удаляем все необязательные cookie
        deleteAllCookies();

        // Удаляем только специфичные ключи из localStorage
        const keysToRemove = ['metro_new_language', 'metro_new_language_selected', 'metro_new_theme'];
        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
                logger.log('🗑️ Удалён ключ localStorage:', key);
            } catch(e) {
                logger.warn('⚠️ Не удалось удалить ключ:', key);
            }
        });

        showMessage('✅ Настройки сброшены. Страница перезагрузится.', 'success');

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
                logger.log('🌐 Язык синхронизирован в cookie:', savedLang);
            }
        } catch(e) {
            logger.warn('⚠️ Ошибка синхронизации языка:', e);
        }
    }

    // ========== БАННЕР COOKIE (БЕЗ АВТОПРИНЯТИЯ) ==========

    let bannerTimer = null;

    function showBannerIfNeeded() {
        if (hasConsent()) {
            logger.log('✅ Согласие уже есть, баннер не показываем');
            return false;
        }

        if (getCookie('cookie_banner_hidden') === 'true') {
            return false;
        }

        if (document.getElementById('metroCookieBanner')) {
            return false;
        }

        createBanner();
        return true;
    }

    function createBanner() {
        // Создаём элементы через createElement()
        const banner = document.createElement('div');
        banner.id = 'metroCookieBanner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Уведомление о cookie');
        banner.style.cssText = `
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
        `;

        // Внутренний контейнер
        const inner = document.createElement('div');
        inner.style.cssText = 'max-width: 1200px; margin: 0 auto;';

        const flex = document.createElement('div');
        flex.style.cssText = 'display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 15px;';

        // Текстовая часть
        const textBlock = document.createElement('div');
        textBlock.style.cssText = 'flex: 2; min-width: 200px;';

        const title = document.createElement('div');
        title.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 4px;';
        const icon = document.createElement('span');
        icon.textContent = '🍪';
        icon.style.fontSize = '22px';
        const strong = document.createElement('strong');
        strong.style.cssText = 'font-size: 16px; color: #FFD700;';
        strong.textContent = 'Мы используем cookie';
        title.appendChild(icon);
        title.appendChild(strong);

        const desc = document.createElement('p');
        desc.style.cssText = 'margin: 0; font-size: 13px; opacity: 0.85; line-height: 1.5;';
        desc.innerHTML = 'Мы используем cookie для запоминания вашего языка, персонализации и улучшения работы сайта. ' +
            '<a href="https://kirill12633.github.io/Metro.New.Official/ru/help/cookies/" style="color: #FFD700; text-decoration: underline; font-weight: 600;">Подробнее</a>';

        const legal = document.createElement('p');
        legal.style.cssText = 'margin: 4px 0 0; font-size: 11px; opacity: 0.5;';
        legal.innerHTML = '<i class="fas fa-shield-alt"></i> Ваши данные защищены в соответствии с 152-ФЗ и GDPR';

        textBlock.appendChild(title);
        textBlock.appendChild(desc);
        textBlock.appendChild(legal);

        // Кнопки
        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; align-items: center;';

        const btnAcceptAll = document.createElement('button');
        btnAcceptAll.id = 'cookieAcceptAllBtn';
        btnAcceptAll.textContent = '✅ Принять все';
        btnAcceptAll.style.cssText = `
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
        `;
        btnAcceptAll.addEventListener('click', acceptAllCookies);
        btnAcceptAll.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 20px rgba(255,215,0,0.3)';
        });
        btnAcceptAll.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });

        const btnNecessary = document.createElement('button');
        btnNecessary.id = 'cookieAcceptNecessaryBtn';
        btnNecessary.textContent = '⚙️ Только необходимое';
        btnNecessary.style.cssText = `
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
        `;
        btnNecessary.addEventListener('click', acceptNecessaryCookies);
        btnNecessary.addEventListener('mouseenter', function() {
            this.style.borderColor = '#FFD700';
            this.style.background = 'rgba(255,215,0,0.05)';
        });
        btnNecessary.addEventListener('mouseleave', function() {
            this.style.borderColor = 'rgba(255,215,0,0.4)';
            this.style.background = 'transparent';
        });

        const btnSettings = document.createElement('button');
        btnSettings.id = 'cookieSettingsBtn';
        btnSettings.textContent = '⚙️ Настроить';
        btnSettings.style.cssText = `
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
        `;
        btnSettings.addEventListener('click', showSettingsPanel);
        btnSettings.addEventListener('mouseenter', function() {
            this.style.borderColor = '#FFD700';
            this.style.color = '#f2f4fa';
        });
        btnSettings.addEventListener('mouseleave', function() {
            this.style.borderColor = 'rgba(119,129,158,0.3)';
            this.style.color = '#77819e';
        });

        btnGroup.appendChild(btnAcceptAll);
        btnGroup.appendChild(btnNecessary);
        btnGroup.appendChild(btnSettings);

        flex.appendChild(textBlock);
        flex.appendChild(btnGroup);
        inner.appendChild(flex);
        banner.appendChild(inner);

        document.body.appendChild(banner);

        // Добавляем анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUpBanner {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        logger.log('🍪 Баннер cookie создан');
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
            logger.log('🍪 Баннер cookie удалён');
        }
    }

    // ========== ПАНЕЛЬ НАСТРОЕК (ЧЕРЕЗ createElement) ==========

    function showSettingsPanel() {
        const preferences = getCookie('cookie_preferences');
        let prefs = { necessary: true, functional: false, analytics: false, advertising: false };

        if (preferences) {
            try {
                prefs = JSON.parse(preferences);
            } catch(e) {
                logger.warn('⚠️ Не удалось разобрать настройки cookie');
            }
        }

        // Создаём элементы
        const overlay = document.createElement('div');
        overlay.id = 'cookieSettingsModal';
        overlay.style.cssText = `
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
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(145deg, #182444, #0d1526);
            border: 1px solid rgba(255, 215, 0, 0.15);
            border-radius: 24px;
            max-width: 480px;
            width: 92%;
            padding: 30px 28px;
            color: #f2f4fa;
            box-shadow: 0 30px 60px rgba(0,0,0,0.8);
            animation: slideInModal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;

        // Заголовок
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;';
        const h2 = document.createElement('h2');
        h2.style.cssText = 'color: #FFD700; margin: 0; font-size: 22px; display: flex; align-items: center; gap: 10px;';
        const h2Icon = document.createElement('i');
        h2Icon.className = 'fas fa-cookie-bite';
        h2.appendChild(h2Icon);
        h2.appendChild(document.createTextNode(' Настройки cookie'));

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✖️';
        closeBtn.style.cssText = 'background: none; border: none; color: #77819e; font-size: 24px; cursor: pointer; transition: all 0.3s;';
        closeBtn.addEventListener('click', function() {
            overlay.remove();
        });
        closeBtn.addEventListener('mouseenter', function() {
            this.style.color = '#f2f4fa';
        });
        closeBtn.addEventListener('mouseleave', function() {
            this.style.color = '#77819e';
        });

        header.appendChild(h2);
        header.appendChild(closeBtn);

        // Список настроек
        const settingsList = document.createElement('div');
        settingsList.style.cssText = 'margin: 20px 0;';

        const categories = [
            { id: 'necessary', label: '📋 Строго необходимые', desc: 'Обеспечивают работу сайта', always: true },
            { id: 'functional', label: '🎨 Функциональные', desc: 'Запоминают язык и предпочтения', always: false },
            { id: 'analytics', label: '📊 Аналитические', desc: 'Помогают улучшать работу сайта', always: false },
            { id: 'advertising', label: '🎯 Рекламные', desc: 'Персонализированная реклама', always: false }
        ];

        categories.forEach(cat => {
            const item = document.createElement('div');
            item.style.cssText = `
                margin-bottom: 12px;
                padding: 14px 16px;
                background: rgba(255,255,255,0.04);
                border-radius: 12px;
                border-left: 3px solid ${cat.always ? '#FFD700' : 'rgba(255,215,0,0.3)'};
            `;

            const label = document.createElement('label');
            label.style.cssText = 'display: flex; justify-content: space-between; align-items: center; cursor: default;';

            const info = document.createElement('div');
            const name = document.createElement('div');
            name.style.cssText = 'font-weight: 600; color: #f2f4fa;';
            name.textContent = cat.label;
            const desc = document.createElement('div');
            desc.style.cssText = 'font-size: 12px; color: #77819e;';
            desc.textContent = cat.desc;
            info.appendChild(name);
            info.appendChild(desc);

            if (cat.always) {
                const always = document.createElement('span');
                always.style.cssText = 'color: #34a853; font-weight: 600; font-size: 13px;';
                always.textContent = 'Всегда включены';
                label.appendChild(info);
                label.appendChild(always);
            } else {
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = 'pref' + cat.id.charAt(0).toUpperCase() + cat.id.slice(1);
                input.checked = prefs[cat.id] || false;
                input.style.cssText = 'width: 20px; height: 20px; accent-color: #FFD700; cursor: pointer;';
                label.style.cursor = 'pointer';
                label.onclick = function(e) {
                    if (e.target !== input) {
                        input.checked = !input.checked;
                    }
                };
                label.appendChild(info);
                label.appendChild(input);
            }

            item.appendChild(label);
            settingsList.appendChild(item);
        });

        // Кнопки внизу
        const footer = document.createElement('div');
        footer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 Сохранить';
        saveBtn.style.cssText = `
            background: linear-gradient(135deg, #FFD700, #e6c200);
            color: #0d1526;
            border: none;
            padding: 10px 24px;
            border-radius: 30px;
            cursor: pointer;
            font-weight: 700;
            font-size: 14px;
            font-family: 'Montserrat', Arial, sans-serif;
        `;
        saveBtn.addEventListener('click', function() {
            const functional = document.getElementById('prefFunctional')?.checked || false;
            const analytics = document.getElementById('prefAnalytics')?.checked || false;
            const advertising = document.getElementById('prefAdvertising')?.checked || false;

            const newPrefs = { necessary: true, functional, analytics, advertising };
            setCookie('cookie_preferences', JSON.stringify(newPrefs), CONFIG.cookieLifetime);
            setCookie('cookie_consent', 'true', CONFIG.cookieLifetime);

            overlay.remove();
            showMessage('⚙️ Настройки сохранены', 'success');
        });

        const closeBtn2 = document.createElement('button');
        closeBtn2.textContent = '✖️ Закрыть';
        closeBtn2.style.cssText = `
            background: transparent;
            color: #77819e;
            border: 1px solid rgba(119, 129, 158, 0.3);
            padding: 10px 20px;
            border-radius: 30px;
            cursor: pointer;
            font-weight: 500;
            font-size: 13px;
            font-family: 'Montserrat', Arial, sans-serif;
        `;
        closeBtn2.addEventListener('click', function() {
            overlay.remove();
        });

        footer.appendChild(saveBtn);
        footer.appendChild(closeBtn2);

        modal.appendChild(header);
        modal.appendChild(settingsList);
        modal.appendChild(footer);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Закрытие по клику вне модалки
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.remove();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                const modalEl = document.getElementById('cookieSettingsModal');
                if (modalEl) {
                    modalEl.remove();
                    document.removeEventListener('keydown', handler);
                }
            }
        });

        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
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
        `;
        document.head.appendChild(style);

        logger.log('⚙️ Панель настроек cookie открыта');
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
        logger.log('🍪 Инициализация cookie manager...');

        // Синхронизация языка
        syncLanguageToCookie();

        // Показ баннера если нужно (без автопринятия)
        showBannerIfNeeded();

        logger.log('✅ cookie.js инициализирован');
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
        config: CONFIG,
        isProduction: isProduction
    };

    // ========== ЗАПУСК ==========

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    logger.log('🍪 MetroNewCookies API доступен');
})();
