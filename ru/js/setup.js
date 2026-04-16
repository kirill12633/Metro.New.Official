// setup.js - Страница настройки Метро New
// https://kirill12633.github.io/Metro.New.Official/ru/js/setup.js

(function() {
    'use strict';
    
    // ========== КОНФИГУРАЦИЯ ==========
    const CONFIG = {
        redirectUrl: '/ru/',
        discordUrl: 'https://discord.com/invite/WjGZBs3HMX',
        storageVersion: '2.0',
        debug: false
    };
    
    // ========== ЛОГГЕР ==========
    const log = {
        info: (...args) => CONFIG.debug && console.log('[INFO]', ...args),
        error: (...args) => CONFIG.debug && console.error('[ERROR]', ...args),
        warn: (...args) => CONFIG.debug && console.warn('[WARN]', ...args)
    };
    
    // ========== КЭШ DOM ЭЛЕМЕНТОВ ==========
    const DOM = {
        steps: {
            1: null,
            2: null,
            3: null,
            4: null
        },
        avatars: null,
        designCards: null,
        themeBtns: null,
        progressDots: null,
        nextBtn1: null,
        nextBtn2: null,
        nextBtn3: null,
        prevBtn2: null,
        prevBtn3: null,
        prevBtn4: null,
        skipBtn: null,
        finishBtn: null,
        resetBtn: null,
        discordLink: null,
        yearSpan: null
    };
    
    // ========== СОСТОЯНИЕ (простой объект, без лишней реактивности) ==========
    let state = {
        avatar: null,
        design: null,
        theme: 'auto',
        currentStep: 1,
        isSaving: false,
        isTransitioning: false
    };
    
    // ========== STORAGE SERVICE (с мягкой миграцией) ==========
    const storageService = {
        _prefix: 'metro_',
        
        _getKey(key) {
            return `${this._prefix}${key}`;
        },
        
        set(key, value) {
            try {
                localStorage.setItem(this._getKey(key), value);
                return true;
            } catch(e) {
                if (e.name === 'QuotaExceededError') {
                    this._showQuotaWarning();
                }
                log.error('Storage set error:', e);
                return false;
            }
        },
        
        get(key) {
            try {
                return localStorage.getItem(this._getKey(key));
            } catch(e) {
                log.error('Storage get error:', e);
                return null;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(this._getKey(key));
                return true;
            } catch(e) {
                log.error('Storage remove error:', e);
                return false;
            }
        },
        
        _showQuotaWarning() {
            const warning = document.createElement('div');
            warning.className = 'storage-warning';
            warning.textContent = '⚠️ Место в хранилище закончилось. Некоторые настройки не сохранятся.';
            warning.style.cssText = 'background: #fff3cd; color: #856404; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 12px;';
            const card = document.querySelector('.setup-card');
            if (card && !document.querySelector('.storage-warning')) {
                card.insertBefore(warning, card.firstChild);
                setTimeout(() => warning.remove(), 5000);
            }
        },
        
        // Мягкая миграция (не удаляет всё)
        migrate() {
            const savedVersion = this.get('storage_version');
            if (savedVersion !== CONFIG.storageVersion) {
                log.info(`Storage migration: ${savedVersion} -> ${CONFIG.storageVersion}`);
                // Здесь можно добавить миграции для разных версий
                this.set('storage_version', CONFIG.storageVersion);
            }
        },
        
        saveSettings(settings) {
            this.set('avatar', settings.avatar);
            this.set('design', settings.design);
            this.set('theme', settings.theme);
            this.set('setup_completed', 'true');
            this.set('setup_date', new Date().toISOString());
            this.migrate();
        },
        
        loadSettings() {
            return {
                avatar: this.get('avatar'),
                design: this.get('design'),
                theme: this.get('theme') || 'auto',
                completed: this.get('setup_completed') === 'true'
            };
        },
        
        clearAll() {
            ['avatar', 'design', 'theme', 'setup_completed', 'setup_date', 'storage_version'].forEach(key => {
                this.remove(key);
            });
        }
    };
    
    // ========== КАСТОМНАЯ МОДАЛКА ==========
    function showModal(options) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.setAttribute('role', 'dialog');
            
            overlay.innerHTML = `
                <div class="modal">
                    <div class="modal-icon">${options.icon || '❓'}</div>
                    <h3>${escapeHtml(options.title || 'Подтверждение')}</h3>
                    <p>${escapeHtml(options.message || 'Вы уверены?')}</p>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-confirm" id="modalConfirm">${escapeHtml(options.confirmText || 'Да')}</button>
                        <button class="modal-btn modal-btn-cancel" id="modalCancel">${escapeHtml(options.cancelText || 'Нет')}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            
            const confirmBtn = overlay.querySelector('#modalConfirm');
            const cancelBtn = overlay.querySelector('#modalCancel');
            
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
    
    // Простой escape для защиты от XSS
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    // ========== UI ОБНОВЛЕНИЯ ==========
    function updateProgress() {
        if (!DOM.progressDots) return;
        DOM.progressDots.forEach((dot, index) => {
            if (index < state.currentStep) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }
    
    function showStep(step) {
        if (state.isTransitioning) return;
        state.isTransitioning = true;
        
        // Скрываем все шаги
        Object.values(DOM.steps).forEach(stepEl => {
            if (stepEl) stepEl.classList.remove('active');
        });
        
        // Показываем нужный
        if (DOM.steps[step]) DOM.steps[step].classList.add('active');
        
        state.currentStep = step;
        updateProgress();
        
        // Fallback на случай, если анимация не сработает
        setTimeout(() => {
            state.isTransitioning = false;
        }, 300);
    }
    
    function showError(step, message) {
        const errorEl = document.getElementById(`step${step}Error`);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
            setTimeout(() => errorEl.classList.remove('show'), 3000);
        }
    }
    
    // ========== ВАЛИДАЦИЯ ==========
    function validateStep(step) {
        if (step === 2 && !state.avatar) {
            showError(2, 'Пожалуйста, выберите аватар');
            return false;
        }
        if (step === 3 && !state.design) {
            showError(3, 'Пожалуйста, выберите стиль сайта');
            return false;
        }
        return true;
    }
    
    // ========== ВЫБОР АВАТАРА ==========
    function selectAvatar(avatar) {
        state.avatar = avatar;
        
        DOM.avatars?.forEach(av => {
            av.classList.remove('selected');
            av.setAttribute('aria-selected', 'false');
        });
        
        const selected = document.querySelector(`.avatar[data-avatar="${avatar}"]`);
        if (selected) {
            selected.classList.add('selected');
            selected.setAttribute('aria-selected', 'true');
        }
        
        log.info(`Avatar selected: ${avatar}`);
    }
    
    // ========== ВЫБОР СТИЛЯ ==========
    function selectThemeForDesign(design, theme) {
        state.design = design;
        state.theme = theme;
        
        // Подсветка карточки
        DOM.designCards?.forEach(card => {
            card.classList.remove('selected');
            card.setAttribute('aria-selected', 'false');
        });
        
        const selectedCard = document.getElementById(`design-${design}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            selectedCard.setAttribute('aria-selected', 'true');
        }
        
        // Подсветка кнопки темы
        DOM.themeBtns?.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`#design-${design} .theme-btn[data-theme="${theme}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Предпросмотр темы
        document.body.classList.remove('light-theme', 'dark-theme');
        if (theme === 'light') document.body.classList.add('light-theme');
        if (theme === 'dark') document.body.classList.add('dark-theme');
        
        log.info(`Design selected: ${design}, theme: ${theme}`);
    }
    
    // ========== СОХРАНЕНИЕ ==========
    async function saveAndContinue() {
        if (state.isSaving) return;
        
        if (!state.avatar) {
            showError(2, 'Пожалуйста, выберите аватар');
            showStep(2);
            return;
        }
        if (!state.design) {
            showError(3, 'Пожалуйста, выберите стиль сайта');
            showStep(3);
            return;
        }
        
        state.isSaving = true;
        
        if (DOM.finishBtn) {
            DOM.finishBtn.disabled = true;
            DOM.finishBtn.innerHTML = '<span class="loader"></span> Сохранение...';
        }
        
        try {
            storageService.saveSettings({
                avatar: state.avatar,
                design: state.design,
                theme: state.theme
            });
            
            log.info('Settings saved:', { avatar: state.avatar, design: state.design, theme: state.theme });
            
            await new Promise(r => setTimeout(r, 500));
            window.location.href = CONFIG.redirectUrl;
            
        } catch (error) {
            log.error('Save error:', error);
            showModal({
                title: 'Ошибка',
                message: 'Не удалось сохранить настройки. Попробуйте ещё раз.',
                icon: '❌',
                confirmText: 'Повторить',
                cancelText: 'Пропустить'
            }).then(confirmed => {
                state.isSaving = false;
                if (DOM.finishBtn) {
                    DOM.finishBtn.disabled = false;
                    DOM.finishBtn.innerHTML = 'Завершить настройку ✓';
                }
                if (confirmed) {
                    saveAndContinue();
                } else {
                    window.location.href = CONFIG.redirectUrl;
                }
            });
        }
    }
    
    // ========== СБРОС ==========
    async function resetSettings() {
        const confirmed = await showModal({
            title: 'Сброс настроек',
            message: 'Вы уверены? Все ваши настройки будут сброшены.',
            icon: '🗑️',
            confirmText: 'Да, сбросить',
            cancelText: 'Отмена'
        });
        
        if (confirmed) {
            storageService.clearAll();
            location.reload();
        }
    }
    
    // ========== ПРОПУСТИТЬ ==========
    async function skipSetup() {
        const confirmed = await showModal({
            title: 'Пропустить настройку',
            message: 'Вы можете завершить настройку позже. Продолжить без сохранения?',
            icon: '⏭️',
            confirmText: 'Да, пропустить',
            cancelText: 'Остаться'
        });
        if (confirmed) {
            window.location.href = CONFIG.redirectUrl;
        }
    }
    
    // ========== DISCORD ==========
    async function confirmDiscordRedirect() {
        const confirmed = await showModal({
            title: 'Переход на Discord',
            message: 'Вы переходите на сторонний сайт Discord. Мы не отвечаем за их политику конфиденциальности. Продолжить?',
            icon: '💬',
            confirmText: 'Перейти',
            cancelText: 'Отмена'
        });
        if (confirmed) {
            window.open(CONFIG.discordUrl, '_blank');
        }
    }
    
    // ========== ЗАГРУЗКА СОХРАНЁННЫХ НАСТРОЕК ==========
    function loadSavedSettings() {
        storageService.migrate();
        const saved = storageService.loadSettings();
        
        if (saved.avatar) selectAvatar(saved.avatar);
        if (saved.design) selectThemeForDesign(saved.design, saved.theme);
        
        if (saved.completed) {
            log.info('Setup already completed, redirecting...');
            window.location.href = CONFIG.redirectUrl;
            return true;
        }
        return false;
    }
    
    // ========== НАСТРОЙКА ACCESSIBILITY ==========
    function setupAccessibility() {
        DOM.avatars?.forEach(av => {
            av.setAttribute('role', 'button');
            av.setAttribute('tabindex', '0');
            av.setAttribute('aria-selected', 'false');
        });
        
        DOM.designCards?.forEach(card => {
            card.setAttribute('role', 'region');
            card.setAttribute('aria-label', 'Стиль сайта');
        });
        
        DOM.themeBtns?.forEach(btn => {
            btn.setAttribute('role', 'button');
            btn.setAttribute('tabindex', '0');
        });
    }
    
    // ========== КЭШИРОВАНИЕ DOM ==========
    function cacheDom() {
        DOM.steps[1] = document.getElementById('step1');
        DOM.steps[2] = document.getElementById('step2');
        DOM.steps[3] = document.getElementById('step3');
        DOM.steps[4] = document.getElementById('step4');
        DOM.avatars = document.querySelectorAll('.avatar');
        DOM.designCards = document.querySelectorAll('.design-card');
        DOM.themeBtns = document.querySelectorAll('.theme-btn');
        DOM.progressDots = document.querySelectorAll('.progress-dot');
        DOM.nextBtn1 = document.getElementById('nextBtn1');
        DOM.nextBtn2 = document.getElementById('nextBtn2');
        DOM.nextBtn3 = document.getElementById('nextBtn3');
        DOM.prevBtn2 = document.getElementById('prevBtn2');
        DOM.prevBtn3 = document.getElementById('prevBtn3');
        DOM.prevBtn4 = document.getElementById('prevBtn4');
        DOM.skipBtn = document.getElementById('skipBtn');
        DOM.finishBtn = document.getElementById('finishBtn');
        DOM.resetBtn = document.getElementById('resetBtn');
        DOM.discordLink = document.getElementById('discordLink');
        DOM.yearSpan = document.getElementById('currentYear');
    }
    
    // ========== НАВЕШИВАНИЕ СОБЫТИЙ ==========
    function bindEvents() {
        if (DOM.nextBtn1) DOM.nextBtn1.addEventListener('click', () => showStep(2));
        if (DOM.nextBtn2) DOM.nextBtn2.addEventListener('click', () => { if (validateStep(2)) showStep(3); });
        if (DOM.nextBtn3) DOM.nextBtn3.addEventListener('click', () => { if (validateStep(3)) showStep(4); });
        if (DOM.prevBtn2) DOM.prevBtn2.addEventListener('click', () => showStep(1));
        if (DOM.prevBtn3) DOM.prevBtn3.addEventListener('click', () => showStep(2));
        if (DOM.prevBtn4) DOM.prevBtn4.addEventListener('click', () => showStep(3));
        if (DOM.skipBtn) DOM.skipBtn.addEventListener('click', skipSetup);
        if (DOM.finishBtn) DOM.finishBtn.addEventListener('click', saveAndContinue);
        if (DOM.resetBtn) DOM.resetBtn.addEventListener('click', resetSettings);
        if (DOM.discordLink) DOM.discordLink.addEventListener('click', (e) => { e.preventDefault(); confirmDiscordRedirect(); });
        
        // Аватары
        DOM.avatars?.forEach(av => {
            av.addEventListener('click', () => selectAvatar(av.getAttribute('data-avatar')));
            av.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectAvatar(av.getAttribute('data-avatar'));
                }
            });
        });
        
        // Кнопки тем
        DOM.themeBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const designCard = btn.closest('.design-card');
                const design = designCard?.getAttribute('data-design');
                const theme = btn.getAttribute('data-theme');
                if (design && theme) selectThemeForDesign(design, theme);
            });
        });
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function init() {
        cacheDom();
        
        if (DOM.yearSpan) {
            DOM.yearSpan.textContent = new Date().getFullYear();
        }
        
        setupAccessibility();
        
        const redirecting = loadSavedSettings();
        if (redirecting) return;
        
        bindEvents();
        
        log.info('setup.js initialized');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
