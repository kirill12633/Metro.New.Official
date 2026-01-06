(function() {
    'use strict';
    
    // ============ КОНФИГУРАЦИЯ ============
    const CONFIG = {
        // Основные настройки
        storage: {
            statusKey: '$48$9$metro_new_privacy_status', // Шифрованный ключ статуса
            dataKey: '$48$9$metro_new_privacy_data',     // Шифрованный ключ данных
            analyticsKey: '$48$9$metro_new_analytics',   // Шифрованный ключ аналитики
            cookieKey: '$48$9$metro_cookie_prefs'       // Настройки cookie
        },
        
        // Временные настройки
        timings: {
            showDelay: 1000,               // Задержка перед показом (мс)
            autoHideDelay: 10000,          // Автоскрытие через 10 сек
            animationDuration: 500,        // Длительность анимации
            reappearAfter: 10 * 60 * 1000, // Повторный показ через 10 минут (в мс)
            checkInterval: 60000           // Проверка каждую минуту
        },
        
        // Тема и язык
        appearance: {
            theme: 'metro',               // metro, dark, light
            position: 'bottom',           // bottom, top
            language: 'auto',             // auto, ru, en
            showAnimation: 'slideUp',     // slideUp, fade, bounce
            hideAnimation: 'slideDown'    // slideDown, fade
        },
        
        // Контент
        content: {
            policyUrl: 'https://docs.google.com/document/d/1Y_3cs7qEcSehVIirIPSSqJQjxOco5ixipMF6zXSSO_I/edit',
            termsUrl: 'https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html',
            cookieUrl: 'https://kirill12633.github.io/Metro.New.Official/Rules/legal.html'
        },
        
        // Аналитика
        analytics: {
            enabled: true,
            endpoint: '/api/analytics', // Эндпоинт для отправки статистики
            trackEvents: ['accept', 'decline', 'settings', 'details', 'auto_hide']
        },
        
        // Расширенные настройки
        features: {
            mobileOptimized: true,
            keyboardNavigation: true,
            savePreferences: true,
            showSettings: true,
            debugMode: false
        }
    };
    
    // ============ УТИЛИТЫ ============
    class StorageManager {
        static encrypt(text) {
            // Простое шифрование Base64 + реверс для усложнения
            return btoa(text.split('').reverse().join(''));
        }
        
        static decrypt(text) {
            try {
                return atob(text).split('').reverse().join('');
            } catch {
                return null;
            }
        }
        
        static setEncrypted(key, data) {
            const encrypted = this.encrypt(JSON.stringify(data));
            localStorage.setItem(key, encrypted);
        }
        
        static getEncrypted(key) {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            
            const decrypted = this.decrypt(encrypted);
            if (!decrypted) return null;
            
            try {
                return JSON.parse(decrypted);
            } catch {
                return null;
            }
        }
        
        static removeEncrypted(key) {
            localStorage.removeItem(key);
        }
    }
    
    class LanguageManager {
        static getLanguage() {
            if (CONFIG.appearance.language !== 'auto') {
                return CONFIG.appearance.language;
            }
            
            const userLang = navigator.language || navigator.userLanguage;
            return userLang.includes('ru') ? 'ru' : 'en';
        }
        
        static getText(lang) {
            const translations = {
                ru: {
                    title: "🚇 Метро New",
                    message: "Используя сайт «Метро New», вы подтверждаете согласие с",
                    policy: "Политикой конфиденциальности",
                    terms: "Пользовательским соглашением",
                    cookie: "Политикой использования cookie",
                    accept: "Принимаю всё",
                    acceptEssential: "Только необходимое",
                    settings: "Настройки",
                    details: "Подробнее",
                    close: "Закрыть",
                    later: "Напомнить позже",
                    cookieEssential: "Необходимые",
                    cookieAnalytics: "Аналитика",
                    cookieMarketing: "Маркетинг",
                    save: "Сохранить",
                    reset: "Сбросить"
                },
                en: {
                    title: "🚇 Metro New",
                    message: "By using «Metro New» website, you confirm your agreement with",
                    policy: "Privacy Policy",
                    terms: "Terms of Service",
                    cookie: "Cookie Policy",
                    accept: "Accept All",
                    acceptEssential: "Essential Only",
                    settings: "Settings",
                    details: "Details",
                    close: "Close",
                    later: "Remind Later",
                    cookieEssential: "Essential",
                    cookieAnalytics: "Analytics",
                    cookieMarketing: "Marketing",
                    save: "Save",
                    reset: "Reset"
                }
            };
            
            return translations[lang] || translations.ru;
        }
    }
    
    class AnalyticsManager {
        static track(event, data = {}) {
            if (!CONFIG.analytics.enabled) return;
            
            const analytics = StorageManager.getEncrypted(CONFIG.storage.analyticsKey) || {
                events: [],
                firstVisit: new Date().toISOString(),
                lastVisit: new Date().toISOString()
            };
            
            analytics.events.push({
                event,
                data,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                referrer: document.referrer
            });
            
            // Храним только последние 100 событий
            if (analytics.events.length > 100) {
                analytics.events = analytics.events.slice(-100);
            }
            
            analytics.lastVisit = new Date().toISOString();
            StorageManager.setEncrypted(CONFIG.storage.analyticsKey, analytics);
            
            // Отправка на сервер (если настроен)
            if (CONFIG.analytics.endpoint) {
                this.sendToServer(event, data);
            }
            
            if (CONFIG.features.debugMode) {
                console.log(`[Analytics] ${event}:`, data);
            }
        }
        
        static sendToServer(event, data) {
            // Асинхронная отправка без блокировки
            setTimeout(() => {
                const payload = {
                    event,
                    data,
                    timestamp: new Date().toISOString(),
                    domain: window.location.hostname
                };
                
                // Используем navigator.sendBeacon если доступен
                if (navigator.sendBeacon) {
                    const blob = new Blob([JSON.stringify(payload)], {type: 'application/json'});
                    navigator.sendBeacon(CONFIG.analytics.endpoint, blob);
                }
            }, 0);
        }
        
        static getStats() {
            const analytics = StorageManager.getEncrypted(CONFIG.storage.analyticsKey);
            if (!analytics) return null;
            
            const stats = {
                totalEvents: analytics.events.length,
                firstVisit: analytics.firstVisit,
                lastVisit: analytics.lastVisit,
                eventsByType: {},
                acceptRate: 0
            };
            
            analytics.events.forEach(event => {
                stats.eventsByType[event.event] = (stats.eventsByType[event.event] || 0) + 1;
            });
            
            const totalAccepts = stats.eventsByType.accept || 0;
            const totalDeclines = stats.eventsByType.decline || 0;
            stats.acceptRate = totalAccepts + totalDeclines > 0 
                ? Math.round((totalAccepts / (totalAccepts + totalDeclines)) * 100) 
                : 0;
            
            return stats;
        }
    }
    
    // ============ ОСНОВНОЙ КЛАСС БАННЕРА ============
    class PrivacyBanner {
        constructor() {
            this.banner = null;
            this.modal = null;
            this.settingsModal = null;
            this.autoHideTimeout = null;
            this.reappearTimeout = null;
            this.checkInterval = null;
            this.language = LanguageManager.getLanguage();
            this.texts = LanguageManager.getText(this.language);
            this.init();
        }
        
        init() {
            // Проверяем нужно ли показывать баннер
            if (!this.shouldShowBanner()) return;
            
            // Инициализируем аналитику
            AnalyticsManager.track('page_view', {
                path: window.location.pathname,
                query: window.location.search
            });
            
            // Загружаем сохраненные настройки
            this.loadPreferences();
            
            // Создаем баннер с задержкой
            setTimeout(() => this.createBanner(), CONFIG.timings.showDelay);
            
            // Запускаем проверку для повторного показа
            this.startReappearCheck();
        }
        
        shouldShowBanner() {
            const status = StorageManager.getEncrypted(CONFIG.storage.statusKey);
            
            if (!status) {
                return true; // Первый визит
            }
            
            // Проверяем время последнего показа
            const lastShown = new Date(status.lastShown || 0).getTime();
            const now = Date.now();
            const timeSinceLastShow = now - lastShown;
            
            // Если пользователь закрыл "напомнить позже" и прошло меньше 10 минут
            if (status.action === 'later' && timeSinceLastShow < CONFIG.timings.reappearAfter) {
                return false;
            }
            
            // Если пользователь полностью принял
            if (status.action === 'accept_all' && status.permanent === true) {
                return false;
            }
            
            return true;
        }
        
        loadPreferences() {
            const prefs = StorageManager.getEncrypted(CONFIG.storage.dataKey);
            if (prefs) {
                // Загружаем сохраненные настройки cookie
                this.applyCookiePreferences(prefs.cookieSettings);
            }
        }
        
        applyCookiePreferences(settings) {
            if (!settings) return;
            
            // Применяем настройки cookie
            if (settings.analytics !== true) {
                // Отключаем аналитику если не разрешено
                CONFIG.analytics.enabled = false;
            }
            
            // Здесь можно добавить другие настройки
        }
        
        createBanner() {
            // Создаем основной контейнер
            this.banner = document.createElement('div');
            this.banner.id = 'metro-privacy-banner';
            this.banner.setAttribute('role', 'dialog');
            this.banner.setAttribute('aria-label', this.texts.title);
            this.banner.setAttribute('aria-modal', 'true');
            
            // Применяем стили и тему
            this.applyStyles();
            this.applyTheme();
            
            // Добавляем контент
            this.banner.innerHTML = this.getBannerHTML();
            
            // Добавляем на страницу
            document.body.appendChild(this.banner);
            
            // Анимация появления
            setTimeout(() => {
                this.banner.classList.add('visible');
                AnalyticsManager.track('banner_shown');
                
                // Автоматическое скрытие через 10 секунд
                this.autoHideTimeout = setTimeout(() => {
                    this.hideWithAction('auto_hide');
                }, CONFIG.timings.autoHideDelay);
            }, 100);
            
            // Назначаем обработчики событий
            this.setupEventListeners();
            
            // Адаптивность для мобильных
            this.setupMobileOptimization();
            
            // Навигация с клавиатуры
            if (CONFIG.features.keyboardNavigation) {
                this.setupKeyboardNavigation();
            }
        }
        
        applyStyles() {
            const styles = {
                position: 'fixed',
                [CONFIG.appearance.position]: '0',
                left: '0',
                right: '0',
                zIndex: '10000',
                padding: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: `transform ${CONFIG.timings.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${CONFIG.timings.animationDuration}ms ease`,
                transform: 'translateY(100%)',
                opacity: '0',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
            };
            
            Object.assign(this.banner.style, styles);
        }
        
        applyTheme() {
            const themes = {
                metro: {
                    background: 'linear-gradient(135deg, #0066CC 0%, #0052a3 100%)',
                    color: '#FFFFFF',
                    accent: '#FFD700',
                    border: '2px solid #FFD700'
                },
                dark: {
                    background: '#1A1A1A',
                    color: '#F8F9FA',
                    accent: '#4dabf7',
                    border: '1px solid #444'
                },
                light: {
                    background: '#FFFFFF',
                    color: '#1A1A1A',
                    accent: '#0066CC',
                    border: '1px solid #DDD'
                }
            };
            
            const theme = themes[CONFIG.appearance.theme] || themes.metro;
            
            this.banner.style.background = theme.background;
            this.banner.style.color = theme.color;
            this.banner.style.borderTop = theme.border;
            
            // Добавляем CSS переменные для использования в кнопках
            this.banner.style.setProperty('--accent-color', theme.accent);
            this.banner.style.setProperty('--text-color', theme.color);
        }
        
        getBannerHTML() {
            return `
                <div class="privacy-content" style="flex:1;padding-right:20px;min-width:0;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px;">
                        <div style="width:24px;height:24px;background:var(--accent-color);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">M</div>
                        <strong style="font-size:16px;">${this.texts.title}</strong>
                    </div>
                    <p style="margin:0;font-size:14px;line-height:1.5;">
                        ${this.texts.message}
                        <a href="${CONFIG.content.policyUrl}" 
                           target="_blank" 
                           class="privacy-link"
                           style="color:var(--accent-color);text-decoration:underline;font-weight:500;margin:0 5px;">
                            ${this.texts.policy}
                        </a>${this.language === 'ru' ? ' и' : ' and'}
                        <a href="${CONFIG.content.termsUrl}" 
                           target="_blank" 
                           class="privacy-link"
                           style="color:var(--accent-color);text-decoration:underline;font-weight:500;margin:0 5px;">
                            ${this.texts.terms}
                        </a>
                    </p>
                </div>
                <div class="privacy-actions" style="display:flex;gap:10px;flex-shrink:0;">
                    <button class="privacy-btn secondary" 
                            data-action="details"
                            style="background:transparent;border:1px solid var(--accent-color);color:var(--accent-color);padding:10px 16px;cursor:pointer;border-radius:6px;font-weight:500;transition:all 0.2s;white-space:nowrap;">
                        ${this.texts.details}
                    </button>
                    <button class="privacy-btn primary" 
                            data-action="accept_all"
                            style="background:var(--accent-color);border:none;color:#1A1A1A;padding:10px 24px;cursor:pointer;border-radius:6px;font-weight:600;transition:all 0.2s;white-space:nowrap;">
                        ${this.texts.accept}
                    </button>
                </div>
            `;
        }
        
        setupEventListeners() {
            // Обработчики для кнопок
            this.banner.querySelectorAll('.privacy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.currentTarget.dataset.action;
                    this.handleAction(action);
                });
                
                // Эффекты при наведении
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                });
                
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                    btn.style.boxShadow = '';
                });
            });
            
            // Обработчики для ссылок
            this.banner.querySelectorAll('.privacy-link').forEach(link => {
                link.addEventListener('click', () => {
                    AnalyticsManager.track('policy_link_click', {
                        url: link.href,
                        type: link.textContent
                    });
                });
            });
            
            // Остановка автоскрытия при взаимодействии
            this.banner.addEventListener('mouseenter', () => {
                if (this.autoHideTimeout) {
                    clearTimeout(this.autoHideTimeout);
                    this.autoHideTimeout = null;
                }
            });
            
            // Скрытие при клике вне баннера
            document.addEventListener('click', (e) => {
                if (this.banner && !this.banner.contains(e.target) && !e.target.closest('.privacy-modal')) {
                    this.hideWithAction('outside_click');
                }
            });
        }
        
        setupMobileOptimization() {
            if (!CONFIG.features.mobileOptimized) return;
            
            const checkMobile = () => {
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    this.banner.style.flexDirection = 'column';
                    this.banner.style.gap = '15px';
                    this.banner.style.textAlign = 'center';
                    this.banner.style.padding = '15px';
                    
                    this.banner.querySelector('.privacy-content').style.paddingRight = '0';
                    
                    const actions = this.banner.querySelector('.privacy-actions');
                    actions.style.width = '100%';
                    actions.style.justifyContent = 'center';
                    
                    this.banner.querySelectorAll('.privacy-btn').forEach(btn => {
                        btn.style.minWidth = '140px';
                    });
                } else {
                    this.banner.style.flexDirection = 'row';
                    this.banner.style.gap = '';
                    this.banner.style.textAlign = '';
                    this.banner.style.padding = '20px';
                    
                    this.banner.querySelector('.privacy-content').style.paddingRight = '20px';
                    
                    const actions = this.banner.querySelector('.privacy-actions');
                    actions.style.width = '';
                    actions.style.justifyContent = '';
                }
            };
            
            // Проверяем при загрузке и при изменении размера
            checkMobile();
            window.addEventListener('resize', checkMobile);
        }
        
        setupKeyboardNavigation() {
            document.addEventListener('keydown', (e) => {
                if (!this.banner || !this.banner.classList.contains('visible')) return;
                
                const buttons = this.banner.querySelectorAll('.privacy-btn');
                const focused = document.activeElement;
                const focusedIndex = Array.from(buttons).indexOf(focused);
                
                switch(e.key) {
                    case 'Escape':
                        e.preventDefault();
                        this.hideWithAction('escape_key');
                        break;
                        
                    case 'Tab':
                        if (!buttons.length) break;
                        
                        if (!focused || focusedIndex === -1) {
                            e.preventDefault();
                            buttons[0].focus();
                        }
                        break;
                        
                    case 'Enter':
                    case ' ':
                        if (focused && focused.classList.contains('privacy-btn')) {
                            e.preventDefault();
                            focused.click();
                        }
                        break;
                        
                    case 'ArrowRight':
                    case 'ArrowLeft':
                        if (buttons.length > 1 && focusedIndex !== -1) {
                            e.preventDefault();
                            const newIndex = e.key === 'ArrowRight' 
                                ? (focusedIndex + 1) % buttons.length 
                                : (focusedIndex - 1 + buttons.length) % buttons.length;
                            buttons[newIndex].focus();
                        }
                        break;
                }
            });
        }
        
        handleAction(action) {
            AnalyticsManager.track(action);
            
            switch(action) {
                case 'accept_all':
                    this.savePreferences({
                        action: 'accept_all',
                        permanent: true,
                        cookieSettings: {
                            essential: true,
                            analytics: true,
                            marketing: true
                        }
                    });
                    this.hideWithAction(action);
                    break;
                    
                case 'details':
                    this.showSettingsModal();
                    break;
                    
                case 'settings':
                    this.showSettingsModal();
                    break;
                    
                case 'later':
                    this.savePreferences({
                        action: 'later',
                        permanent: false
                    });
                    this.hideWithAction(action);
                    break;
                    
                case 'essential_only':
                    this.savePreferences({
                        action: 'essential_only',
                        permanent: true,
                        cookieSettings: {
                            essential: true,
                            analytics: false,
                            marketing: false
                        }
                    });
                    this.hideWithAction(action);
                    break;
            }
        }
        
        savePreferences(data) {
            const status = {
                ...data,
                lastShown: new Date().toISOString(),
                version: '2.0',
                domain: window.location.hostname
            };
            
            // Сохраняем статус
            StorageManager.setEncrypted(CONFIG.storage.statusKey, status);
            
            // Если есть настройки cookie, сохраняем отдельно
            if (data.cookieSettings) {
                StorageManager.setEncrypted(CONFIG.storage.dataKey, {
                    cookieSettings: data.cookieSettings,
                    savedAt: new Date().toISOString()
                });
                
                // Применяем настройки немедленно
                this.applyCookiePreferences(data.cookieSettings);
            }
            
            // Обновляем аналитику
            AnalyticsManager.track('preferences_saved', {
                action: data.action,
                permanent: data.permanent
            });
        }
        
        hideWithAction(action) {
            if (!this.banner) return;
            
            AnalyticsManager.track('banner_hidden', { action });
            
            // Очищаем таймауты
            if (this.autoHideTimeout) {
                clearTimeout(this.autoHideTimeout);
                this.autoHideTimeout = null;
            }
            
            // Анимация скрытия
            this.banner.classList.remove('visible');
            
            setTimeout(() => {
                if (this.banner && this.banner.parentNode) {
                    this.banner.remove();
                    this.banner = null;
                }
                
                // Показываем подтверждение если нужно
                if (action === 'accept_all' || action === 'essential_only') {
                    this.showConfirmation(action);
                }
            }, CONFIG.timings.animationDuration);
        }
        
        showConfirmation(action) {
            const confirmation = document.createElement('div');
            confirmation.className = 'privacy-confirmation';
            confirmation.innerHTML = `
                <div style="position:fixed;top:20px;right:20px;background:var(--accent-color);color:#1A1A1A;padding:12px 20px;border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:10001;animation:slideInRight 0.3s ease;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:24px;height:24px;background:#1A1A1A;color:var(--accent-color);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">✓</div>
                        <div>
                            <strong>${action === 'accept_all' ? this.texts.accept : this.texts.acceptEssential}</strong>
                            <div style="font-size:12px;opacity:0.8;">${this.language === 'ru' ? 'Настройки сохранены' : 'Preferences saved'}</div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(confirmation);
            
            // Автоматическое скрытие через 3 секунды
            setTimeout(() => {
                if (confirmation.parentNode) {
                    confirmation.style.animation = 'slideOutRight 0.3s ease';
                    setTimeout(() => {
                        if (confirmation.parentNode) {
                            confirmation.remove();
                        }
                    }, 300);
                }
            }, 3000);
            
            // Добавляем анимации в CSS
            this.addConfirmationAnimations();
        }
        
        addConfirmationAnimations() {
            if (document.getElementById('privacy-animations')) return;
            
            const style = document.createElement('style');
            style.id = 'privacy-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideDown {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(100%); opacity: 0; }
                }
                #metro-privacy-banner.visible {
                    transform: translateY(0) !important;
                    opacity: 1 !important;
                }
            `;
            
            document.head.appendChild(style);
        }
        
        showSettingsModal() {
            if (this.settingsModal) return;
            
            this.settingsModal = document.createElement('div');
            this.settingsModal.className = 'privacy-modal';
            this.settingsModal.innerHTML = this.getSettingsHTML();
            
            Object.assign(this.settingsModal.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '10002',
                opacity: '0',
                transition: 'opacity 0.3s ease'
            });
            
            document.body.appendChild(this.settingsModal);
            
            // Анимация появления
            setTimeout(() => {
                this.settingsModal.style.opacity = '1';
            }, 10);
            
            // Обработчики для модального окна
            this.setupSettingsModalListeners();
        }
        
        getSettingsHTML() {
            const prefs = StorageManager.getEncrypted(CONFIG.storage.dataKey);
            
            return `
                <div style="background:#1A1A1A;color:#FFFFFF;border-radius:12px;padding:30px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.5);transform:translateY(20px);transition:transform 0.3s ease;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="margin:0;color:#FFD700;">${this.texts.settings}</h2>
                        <button class="modal-close" style="background:none;border:none;color:#FFFFFF;font-size:24px;cursor:pointer;padding:0;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">&times;</button>
                    </div>
                    
                    <div style="margin-bottom:25px;">
                        <h3 style="margin-bottom:15px;color:#FFD700;">${this.language === 'ru' ? 'Настройки cookie' : 'Cookie Settings'}</h3>
                        
                        <div class="cookie-option" style="margin-bottom:15px;padding:15px;background:#2A2A2A;border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                                <div>
                                    <strong>${this.texts.cookieEssential}</strong>
                                    <div style="font-size:12px;opacity:0.7;">${this.language === 'ru' ? 'Обязательные для работы сайта' : 'Required for website functionality'}</div>
                                </div>
                                <div style="color:#FFD700;font-weight:bold;">${this.language === 'ru' ? 'Всегда' : 'Always'}</div>
                            </div>
                        </div>
                        
                        <div class="cookie-option" style="margin-bottom:15px;padding:15px;background:#2A2A2A;border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                                <div>
                                    <strong>${this.texts.cookieAnalytics}</strong>
                                    <div style="font-size:12px;opacity:0.7;">${this.language === 'ru' ? 'Помогают улучшать наш сайт' : 'Help us improve our website'}</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="cookie-analytics" ${prefs?.cookieSettings?.analytics !== false ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="cookie-option" style="margin-bottom:25px;padding:15px;background:#2A2A2A;border-radius:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                                <div>
                                    <strong>${this.texts.cookieMarketing}</strong>
                                    <div style="font-size:12px;opacity:0.7;">${this.language === 'ru' ? 'Персонализированная реклама' : 'Personalized advertising'}</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="cookie-marketing" ${prefs?.cookieSettings?.marketing === true ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display:flex;gap:10px;justify-content:flex-end;">
                        <button class="modal-btn secondary" data-action="reset_settings" style="background:transparent;border:1px solid #555;color:#FFFFFF;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:500;">
                            ${this.texts.reset}
                        </button>
                        <button class="modal-btn primary" data-action="save_settings" style="background:#FFD700;border:none;color:#1A1A1A;padding:10px 24px;border-radius:6px;cursor:pointer;font-weight:600;">
                            ${this.texts.save}
                        </button>
                    </div>
                </div>
            `;
        }
        
        setupSettingsModalListeners() {
            // Кнопка закрытия
            this.settingsModal.querySelector('.modal-close').addEventListener('click', () => {
                this.closeSettingsModal();
            });
            
            // Клик вне модального окна
            this.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.settingsModal) {
                    this.closeSettingsModal();
                }
            });
            
            // Кнопки в модальном окне
            this.settingsModal.querySelectorAll('.modal-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.currentTarget.dataset.action;
                    
                    if (action === 'save_settings') {
                        this.saveModalPreferences();
                    } else if (action === 'reset_settings') {
                        this.resetModalPreferences();
                    }
                });
            });
            
            // Стили для переключателей
            const style = document.createElement('style');
            style.textContent = `
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #555;
                    transition: .3s;
                    border-radius: 24px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .3s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: #FFD700;
                }
                input:checked + .slider:before {
                    transform: translateX(26px);
                }
            `;
            this.settingsModal.appendChild(style);
        }
        
        saveModalPreferences() {
            const analytics = this.settingsModal.querySelector('#cookie-analytics').checked;
            const marketing = this.settingsModal.querySelector('#cookie-marketing').checked;
            
            this.savePreferences({
                action: 'custom_settings',
                permanent: true,
                cookieSettings: {
                    essential: true,
                    analytics,
                    marketing
                }
            });
            
            AnalyticsManager.track('custom_settings_saved', { analytics, marketing });
            this.closeSettingsModal();
            this.hideWithAction('custom_settings');
        }
        
        resetModalPreferences() {
            StorageManager.removeEncrypted(CONFIG.storage.dataKey);
            AnalyticsManager.track('settings_reset');
            
            // Сбрасываем чекбоксы
            this.settingsModal.querySelector('#cookie-analytics').checked = true;
            this.settingsModal.querySelector('#cookie-marketing').checked = false;
            
            if (CONFIG.features.debugMode) {
                console.log('[Privacy] Settings reset to default');
            }
        }
        
        closeSettingsModal() {
            if (!this.settingsModal) return;
            
            this.settingsModal.style.opacity = '0';
            
            setTimeout(() => {
                if (this.settingsModal && this.settingsModal.parentNode) {
                    this.settingsModal.remove();
                    this.settingsModal = null;
                }
            }, 300);
        }
        
        startReappearCheck() {
            // Проверяем каждую минуту, не пора ли показать баннер снова
            this.checkInterval = setInterval(() => {
                if (!this.banner && this.shouldShowBanner()) {
                    this.createBanner();
                }
            }, CONFIG.timings.checkInterval);
        }
        
        destroy() {
            // Очистка всех ресурсов
            if (this.autoHideTimeout) clearTimeout(this.autoHideTimeout);
            if (this.reappearTimeout) clearTimeout(this.reappearTimeout);
            if (this.checkInterval) clearInterval(this.checkInterval);
            
            if (this.banner && this.banner.parentNode) {
                this.banner.remove();
            }
            
            if (this.settingsModal && this.settingsModal.parentNode) {
                this.settingsModal.remove();
            }
            
            if (CONFIG.features.debugMode) {
                console.log('[Privacy] Banner destroyed');
            }
        }
    }
    
    // ============ ИНИЦИАЛИЗАЦИЯ ============
    // Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.metroPrivacyBanner = new PrivacyBanner();
        });
    } else {
        window.metroPrivacyBanner = new PrivacyBanner();
    }
    
    // Экспортируем API для доступа извне
    window.MetroPrivacy = {
        getAnalytics: () => AnalyticsManager.getStats(),
        resetPreferences: () => {
            StorageManager.removeEncrypted(CONFIG.storage.statusKey);
            StorageManager.removeEncrypted(CONFIG.storage.dataKey);
            if (window.metroPrivacyBanner) {
                window.metroPrivacyBanner.destroy();
                window.metroPrivacyBanner = new PrivacyBanner();
            }
            return true;
        },
        showSettings: () => {
            if (window.metroPrivacyBanner) {
                window.metroPrivacyBanner.showSettingsModal();
            }
        },
        getConfig: () => ({ ...CONFIG }),
        isAccepted: () => {
            const status = StorageManager.getEncrypted(CONFIG.storage.statusKey);
            return status && status.permanent === true;
        }
    };
    
    // Отладочный режим
    if (CONFIG.features.debugMode) {
        console.log('[Privacy] Initialized with config:', CONFIG);
        console.log('[Privacy] Storage keys:', {
            status: StorageManager.getEncrypted(CONFIG.storage.statusKey),
            data: StorageManager.getEncrypted(CONFIG.storage.dataKey),
            analytics: AnalyticsManager.getStats()
        });
    }
})();
