// setup.js - Страница настройки Метро New
// https://kirill12633.github.io/Metro.New.Official/ru/js/setup.js

(function() {
    'use strict';
    
    // ========== КОНФИГУРАЦИЯ ==========
    const CONFIG = {
        redirectUrl: '/ru/',
        discordUrl: 'https://discord.com/invite/WjGZBs3HMX',
        storageVersion: '2.0',
        debug: false,
        enableTelemetry: false  // Включить аналитику
    };
    
    // ========== FEATURE FLAGS ==========
    const FEATURES = {
        discord: true,
        animations: true,
        themePreview: true,
        analytics: CONFIG.enableTelemetry
    };
    
    // ========== ЛОГГЕР ==========
    const logger = {
        info: (...args) => CONFIG.debug && console.log('[INFO]', ...args),
        error: (...args) => CONFIG.debug && console.error('[ERROR]', ...args),
        warn: (...args) => CONFIG.debug && console.warn('[WARN]', ...args)
    };
    
    // ========== TELEMETRY (аналитика) ==========
    function track(eventName, eventData = {}) {
        if (!FEATURES.analytics) return;
        
        const data = {
            event: eventName,
            timestamp: new Date().toISOString(),
            page: 'setup',
            ...eventData
        };
        
        logger.info('📊 Telemetry:', data);
        
        // Отправка на сервер (если есть)
        // if (navigator.sendBeacon) {
        //     navigator.sendBeacon('/api/track', JSON.stringify(data));
        // }
    }
    
    // ========== STATE MANAGER (immutable) ==========
    let state = {
        settings: {
            avatar: null,
            design: null,
            theme: 'auto'
        },
        ui: {
            currentStep: 1,
            isSaving: false,
            isTransitioning: false
        }
    };
    
    // Подписчики на изменения
    const subscribers = new Set();
    
    function subscribe(callback) {
        subscribers.add(callback);
        return () => subscribers.delete(callback);
    }
    
    function notify() {
        subscribers.forEach(cb => cb(state));
    }
    
    function updateSettings(patch) {
        state.settings = { ...state.settings, ...patch };
        notify();
        logger.info('Settings updated:', state.settings);
        track('settings_update', { patch: Object.keys(patch) });
    }
    
    function updateUI(patch) {
        state.ui = { ...state.ui, ...patch };
        notify();
    }
    
    function getState() {
        return { ...state };
    }
    
    // ========== SERVICE LAYER (бизнес-логика) ==========
    const storageService = {
        _prefix: 'metro_',
        
        _getKey(key) {
            return `${this._prefix}${key}`;
        },
        
        set(key, value) {
            try {
                const fullKey = this._getKey(key);
                localStorage.setItem(fullKey, value);
                logger.info(`Storage saved: ${key} = ${value}`);
                return true;
            } catch(e) {
                if (e.name === 'QuotaExceededError') {
                    this._showQuotaWarning();
                }
                logger.error('Storage set error:', e);
                track('storage_error', { operation: 'set', key, error: e.name });
                return false;
            }
        },
        
        get(key) {
            try {
                const fullKey = this._getKey(key);
                return localStorage.getItem(fullKey);
            } catch(e) {
                logger.error('Storage get error:', e);
                return null;
            }
        },
        
        remove(key) {
            try {
                const fullKey = this._getKey(key);
                localStorage.removeItem(fullKey);
                return true;
            } catch(e) {
                logger.error('Storage remove error:', e);
                return false;
            }
        },
        
        _showQuotaWarning() {
            const warning = document.createElement('div');
            warning.className = 'storage-warning';
            warning.setAttribute('role', 'alert');
            warning.textContent = '⚠️ Место в хранилище закончилось. Некоторые настройки могут не сохраниться.';
            warning.style.cssText = 'background: #fff3cd; color: #856404; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 12px;';
            const card = document.querySelector('.setup-card');
            if (card && !document.querySelector('.storage-warning')) {
                card.insertBefore(warning, card.firstChild);
                setTimeout(() => warning.remove(), 5000);
            }
        },
        
        saveVersion() {
            this.set('storage_version', CONFIG.storageVersion);
        },
        
        checkVersion() {
            const savedVersion = this.get('storage_version');
            if (savedVersion !== CONFIG.storageVersion) {
                logger.info(`Storage version mismatch: ${savedVersion} -> ${CONFIG.storageVersion}`);
                this.clearAll();
                this.saveVersion();
                return false;
            }
            return true;
        },
        
        clearAll() {
            const keys = ['avatar', 'design', 'theme', 'setup_completed', 'setup_date', 'storage_version'];
            keys.forEach(key => this.remove(key));
            logger.info('All storage cleared');
        }
    };
    
    const settingsService = {
        save(settings) {
            track('save_settings', settings);
            
            const results = {
                avatar: storageService.set('avatar', settings.avatar),
                design: storageService.set('design', settings.design),
                theme: storageService.set('theme', settings.theme),
                completed: storageService.set('setup_completed', 'true'),
                date: storageService.set('setup_date', new Date().toISOString())
            };
            
            const success = Object.values(results).every(v => v === true);
            if (success) {
                track('save_success', settings);
            } else {
                track('save_failed', { errors: results });
            }
            
            return success;
        },
        
        load() {
            const avatar = storageService.get('avatar');
            const design = storageService.get('design');
            const theme = storageService.get('theme') || 'auto';
            const completed = storageService.get('setup_completed') === 'true';
            
            track('load_settings', { completed, hasAvatar: !!avatar, hasDesign: !!design });
            
            return { avatar, design, theme, completed };
        },
        
        clear() {
            storageService.clearAll();
            track('clear_settings');
        }
    };
    
    // ========== UI HELPER (безопасное создание элементов) ==========
    function createSafeElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'className') {
                element.className = value;
            } else if (key === 'id') {
                element.id = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        return element;
    }
    
    // ========== КАСТОМНАЯ МОДАЛКА (без innerHTML) ==========
    function showModal(options) {
        return new Promise((resolve) => {
            const overlay = createSafeElement('div', {
                className: 'modal-overlay',
                role: 'dialog',
                'aria-modal': 'true',
                'aria-label': options.title || 'Подтверждение'
            });
            
            const modal = createSafeElement('div', { className: 'modal' });
            const iconDiv = createSafeElement('div', { className: 'modal-icon', textContent: options.icon || '❓' });
            const title = createSafeElement('h3', { textContent: options.title || 'Подтверждение' });
            const message = createSafeElement('p', { textContent: options.message || 'Вы уверены?' });
            const buttonsDiv = createSafeElement('div', { className: 'modal-buttons' });
            
            const confirmBtn = createSafeElement('button', {
                className: 'modal-btn modal-btn-confirm',
                textContent: options.confirmText || 'Да',
                'aria-label': 'Подтвердить'
            });
            
            const cancelBtn = createSafeElement('button', {
                className: 'modal-btn modal-btn-cancel',
                textContent: options.cancelText || 'Нет',
                'aria-label': 'Отмена'
            });
            
            buttonsDiv.appendChild(confirmBtn);
            buttonsDiv.appendChild(cancelBtn);
            modal.appendChild(iconDiv);
            modal.appendChild(title);
            modal.appendChild(message);
            modal.appendChild(buttonsDiv);
            overlay.appendChild(modal);
            
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            
            const close = (result) => {
                overlay.remove();
                document.body.style.overflow = '';
                resolve(result);
            };
            
            confirmBtn.addEventListener('click', () => close(true));
            cancelBtn.addEventListener('click', () => close(false));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(false);
            });
            
            confirmBtn.focus();
        });
    }
    
    // ========== ERROR BOUNDARY ==========
    function errorBoundary(fn, fallback, context = 'unknown') {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                logger.error(`Error in ${context}:`, error);
                track('error_boundary', { context, error: error.message });
                
                if (fallback) {
                    return fallback(error);
                }
                
                showModal({
                    title: 'Ошибка',
                    message: `Произошла ошибка: ${error.message}. Пожалуйста, обновите страницу.`,
                    icon: '❌',
                    confirmText: 'Обновить',
                    cancelText: 'Отмена'
                }).then(confirmed => {
                    if (confirmed) location.reload();
                });
                
                return null;
            }
        };
    }
    
    // ========== ПОКАЗ ОШИБКИ UI ==========
    function showErrorUI(step, message) {
        const errorEl = document.getElementById(`step${step}Error`);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
            setTimeout(() => errorEl.classList.remove('show'), 3000);
        }
        track('ui_error', { step, message });
    }
    
    // ========== ОБНОВЛЕНИЕ ПРОГРЕССА ==========
    function updateProgress() {
        const dots = document.querySelectorAll('.progress-dot');
        const currentStep = state.ui.currentStep;
        dots.forEach((dot, index) => {
            if (index < currentStep) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }
    
    // ========== СМЕНА ШАГА (с transitionend) ==========
    function showStep(step) {
        if (state.ui.isTransitioning) return;
        
        updateUI({ isTransitioning: true });
        
        const stepsElements = {
            1: document.getElementById('step1'),
            2: document.getElementById('step2'),
            3: document.getElementById('step3'),
            4: document.getElementById('step4')
        };
        
        const currentStepEl = stepsElements[state.ui.currentStep];
        const nextStepEl = stepsElements[step];
        
        if (!currentStepEl || !nextStepEl) {
            updateUI({ isTransitioning: false });
            return;
        }
        
        const onTransitionEnd = () => {
            currentStepEl.classList.remove('active');
            nextStepEl.classList.add('active');
            currentStepEl.removeEventListener('transitionend', onTransitionEnd);
            updateUI({ isTransitioning: false, currentStep: step });
            updateProgress();
            track('step_change', { from: state.ui.currentStep, to: step });
        };
        
        if (FEATURES.animations) {
            currentStepEl.addEventListener('transitionend', onTransitionEnd, { once: true });
            currentStepEl.classList.add('fade-out');
            nextStepEl.classList.add('fade-in');
        } else {
            onTransitionEnd();
        }
    }
    
    // ========== ВАЛИДАЦИЯ ==========
    function validateStep(step) {
        if (step === 2 && !state.settings.avatar) {
            showErrorUI(2, 'Пожалуйста, выберите аватар');
            return false;
        }
        if (step === 3 && !state.settings.design) {
            showErrorUI(3, 'Пожалуйста, выберите стиль сайта');
            return false;
        }
        return true;
    }
    
    // ========== ВЫБОР АВАТАРА ==========
    function selectAvatar(avatar) {
        updateSettings({ avatar });
        
        document.querySelectorAll('.avatar').forEach(av => {
            av.classList.remove('selected');
            av.setAttribute('aria-selected', 'false');
        });
        const selected = document.querySelector(`.avatar[data-avatar="${avatar}"]`);
        if (selected) {
            selected.classList.add('selected');
            selected.setAttribute('aria-selected', 'true');
        }
        
        track('avatar_selected', { avatar });
    }
    
    // ========== ВЫБОР СТИЛЯ ==========
    function selectThemeForDesign(design, theme) {
        updateSettings({ design, theme });
        
        document.querySelectorAll('.design-card').forEach(card => {
            card.classList.remove('selected');
            card.setAttribute('aria-selected', 'false');
        });
        const selectedCard = document.getElementById(`design-${design}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            selectedCard.setAttribute('aria-selected', 'true');
        }
        
        document.querySelectorAll('.design-card .theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`#design-${design} .theme-btn[data-theme="${theme}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        if (FEATURES.themePreview) {
            document.body.classList.remove('light-theme', 'dark-theme');
            if (theme === 'light') document.body.classList.add('light-theme');
            if (theme === 'dark') document.body.classList.add('dark-theme');
        }
        
        track('design_selected', { design, theme });
    }
    
    // ========== СОХРАНЕНИЕ ==========
    const saveAndContinue = errorBoundary(async () => {
        if (state.ui.isSaving) return;
        
        if (!state.settings.avatar) {
            showErrorUI(2, 'Пожалуйста, выберите аватар');
            showStep(2);
            return;
        }
        if (!state.settings.design) {
            showErrorUI(3, 'Пожалуйста, выберите стиль сайта');
            showStep(3);
            return;
        }
        
        updateUI({ isSaving: true });
        const finishBtn = document.getElementById('finishBtn');
        if (finishBtn) {
            finishBtn.disabled = true;
            finishBtn.innerHTML = '<span class="loader"></span> Сохранение...';
        }
        
        const success = settingsService.save(state.settings);
        
        if (!success) {
            showModal({
                title: 'Ошибка сохранения',
                message: 'Не удалось сохранить настройки. Попробуйте ещё раз.',
                icon: '❌',
                confirmText: 'Повторить',
                cancelText: 'Позже'
            }).then(confirmed => {
                if (confirmed) {
                    updateUI({ isSaving: false });
                    finishBtn.disabled = false;
                    finishBtn.innerHTML = 'Завершить настройку ✓';
                    saveAndContinue();
                } else {
                    window.location.href = CONFIG.redirectUrl;
                }
            });
            return;
        }
        
        storageService.saveVersion();
        track('setup_completed', state.settings);
        
        await new Promise(r => setTimeout(r, 500));
        window.location.href = CONFIG.redirectUrl;
    }, null, 'saveAndContinue');
    
    // ========== СБРОС ==========
    const resetSettings = errorBoundary(async () => {
        const confirmed = await showModal({
            title: 'Сброс настроек',
            message: 'Вы уверены? Все ваши настройки будут сброшены. Страница перезагрузится.',
            icon: '🗑️',
            confirmText: 'Да, сбросить',
            cancelText: 'Отмена'
        });
        
        if (confirmed) {
            settingsService.clear();
            track('settings_reset');
            location.reload();
        }
    }, null, 'resetSettings');
    
    // ========== ПРОПУСТИТЬ ==========
    const skipSetup = errorBoundary(async () => {
        const confirmed = await showModal({
            title: 'Пропустить настройку',
            message: 'Вы можете завершить настройку позже. Продолжить без сохранения?',
            icon: '⏭️',
            confirmText: 'Да, пропустить',
            cancelText: 'Остаться'
        });
        if (confirmed) {
            track('setup_skipped');
            window.location.href = CONFIG.redirectUrl;
        }
    }, null, 'skipSetup');
    
    // ========== DISCORD ==========
    const confirmDiscordRedirect = errorBoundary(async () => {
        if (!FEATURES.discord) {
            logger.info('Discord feature disabled');
            return;
        }
        
        const confirmed = await showModal({
            title: 'Переход на Discord',
            message: 'Вы переходите на сторонний сайт Discord. Мы не отвечаем за их политику конфиденциальности. Продолжить?',
            icon: '💬',
            confirmText: 'Перейти',
            cancelText: 'Отмена'
        });
        if (confirmed) {
            track('discord_redirect');
            window.open(CONFIG.discordUrl, '_blank');
        }
    }, null, 'discordRedirect');
    
    // ========== ЗАГРУЗКА СОХРАНЁННЫХ НАСТРОЕК ==========
    function loadSavedSettings() {
        storageService.checkVersion();
        const saved = settingsService.load();
        
        if (saved.avatar) selectAvatar(saved.avatar);
        if (saved.design) selectThemeForDesign(saved.design, saved.theme);
        
        if (saved.completed) {
            logger.info('Setup already completed, redirecting...');
            track('already_completed_redirect');
            window.location.href = CONFIG.redirectUrl;
            return true;
        }
        return false;
    }
    
    // ========== НАСТРОЙКА ARIA ==========
    function setupAccessibility() {
        document.querySelectorAll('.avatar').forEach(av => {
            av.setAttribute('role', 'button');
            av.setAttribute('tabindex', '0');
            av.setAttribute('aria-selected', 'false');
        });
        
        document.querySelectorAll('.design-card').forEach(card => {
            card.setAttribute('role', 'region');
            card.setAttribute('aria-label', 'Стиль сайта');
        });
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
        });
    }
    
    // ========== ОЧИСТКА ==========
    function cleanup() {
        logger.info('Cleanup');
        track('page_unload');
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function init() {
        logger.info('setup.js init, features:', FEATURES);
        
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        setupAccessibility();
        
        const redirecting = loadSavedSettings();
        if (redirecting) return;
        
        // Навигация
        document.getElementById('nextBtn1')?.addEventListener('click', () => showStep(2));
        document.getElementById('nextBtn2')?.addEventListener('click', () => { if (validateStep(2)) showStep(3); });
        document.getElementById('nextBtn3')?.addEventListener('click', () => { if (validateStep(3)) showStep(4); });
        document.getElementById('prevBtn2')?.addEventListener('click', () => showStep(1));
        document.getElementById('prevBtn3')?.addEventListener('click', () => showStep(2));
        document.getElementById('prevBtn4')?.addEventListener('click', () => showStep(3));
        document.getElementById('skipBtn')?.addEventListener('click', skipSetup);
        document.getElementById('finishBtn')?.addEventListener('click', saveAndContinue);
        document.getElementById('resetBtn')?.addEventListener('click', resetSettings);
        document.getElementById('discordLink')?.addEventListener('click', (e) => { e.preventDefault(); confirmDiscordRedirect(); });
        
        // Аватары
        document.querySelectorAll('.avatar').forEach(av => {
            av.addEventListener('click', () => selectAvatar(av.getAttribute('data-avatar')));
            av.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectAvatar(av.getAttribute('data-avatar'));
                }
            });
        });
        
        // Стили
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const designCard = btn.closest('.design-card');
                const design = designCard?.getAttribute('data-design');
                const theme = btn.getAttribute('data-theme');
                if (design && theme) selectThemeForDesign(design, theme);
            });
        });
        
        window.addEventListener('beforeunload', cleanup);
        track('page_view');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
