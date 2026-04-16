// setup.js - Страница настройки Метро New
// https://kirill12633.github.io/Metro.New.Official/ru/js/setup.js

(function() {
    'use strict';
    
    console.log('setup.js загружен');
    
    // ========== СОСТОЯНИЕ ==========
    let settings = {
        avatar: null,
        design: null,
        theme: 'auto'
    };
    let currentStep = 1;
    let isSaving = false;
    
    // ========== DOM ЭЛЕМЕНТЫ ==========
    const steps = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3'),
        4: document.getElementById('step4')
    };
    
    // ========== КАСТОМНАЯ МОДАЛКА ==========
    function showModal(options) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            
            overlay.innerHTML = `
                <div class="modal">
                    <div class="modal-icon">${options.icon || '❓'}</div>
                    <h3>${options.title || 'Подтверждение'}</h3>
                    <p>${options.message || 'Вы уверены?'}</p>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-confirm" id="modalConfirm">${options.confirmText || 'Да'}</button>
                        <button class="modal-btn modal-btn-cancel" id="modalCancel">${options.cancelText || 'Нет'}</button>
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
    
    // ========== ПОКАЗ ОШИБКИ ==========
    function showError(step, message) {
        const errorEl = document.getElementById(`step${step}Error`);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
            setTimeout(() => errorEl.classList.remove('show'), 3000);
        }
    }
    
    // ========== ОБНОВЛЕНИЕ ПРОГРЕССА ==========
    function updateProgress() {
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            if (index < currentStep) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }
    
    function showStep(step) {
        Object.values(steps).forEach(s => s?.classList.remove('active'));
        if (steps[step]) steps[step].classList.add('active');
        updateProgress();
    }
    
    // ========== ВАЛИДАЦИЯ ==========
    function validateStep(step) {
        if (step === 2 && !settings.avatar) {
            showError(2, 'Пожалуйста, выберите аватар');
            return false;
        }
        if (step === 3 && !settings.design) {
            showError(3, 'Пожалуйста, выберите стиль сайта');
            return false;
        }
        return true;
    }
    
    // ========== ВЫБОР АВАТАРА ==========
    function selectAvatar(avatar) {
        settings.avatar = avatar;
        document.querySelectorAll('.avatar').forEach(av => av.classList.remove('selected'));
        const selected = document.querySelector(`.avatar[data-avatar="${avatar}"]`);
        if (selected) selected.classList.add('selected');
    }
    
    // ========== ВЫБОР СТИЛЯ И ТЕМЫ ==========
    function selectThemeForDesign(design, theme) {
        settings.design = design;
        settings.theme = theme;
        
        // Подсветка карточки
        document.querySelectorAll('.design-card').forEach(card => card.classList.remove('selected'));
        const selectedCard = document.getElementById(`design-${design}`);
        if (selectedCard) selectedCard.classList.add('selected');
        
        // Подсветка кнопки темы
        document.querySelectorAll('.design-card .theme-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`#design-${design} .theme-btn[data-theme="${theme}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Предпросмотр темы
        document.body.classList.remove('light-theme', 'dark-theme');
        if (theme === 'light') document.body.classList.add('light-theme');
        if (theme === 'dark') document.body.classList.add('dark-theme');
        
        console.log(`Выбран стиль: ${design}, тема: ${theme}`);
    }
    
    // ========== СОХРАНЕНИЕ ==========
    async function saveAndContinue() {
        if (isSaving) return;
        
        if (!settings.avatar) {
            showError(2, 'Пожалуйста, выберите аватар');
            currentStep = 2;
            showStep(2);
            return;
        }
        if (!settings.design) {
            showError(3, 'Пожалуйста, выберите стиль сайта');
            currentStep = 3;
            showStep(3);
            return;
        }
        
        isSaving = true;
        const finishBtn = document.getElementById('finishBtn');
        if (finishBtn) {
            finishBtn.disabled = true;
            finishBtn.innerHTML = '<span class="loader"></span> Сохранение...';
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('metro_avatar', settings.avatar);
        localStorage.setItem('metro_design', settings.design);
        localStorage.setItem('metro_theme', settings.theme);
        localStorage.setItem('metro_setup_completed', 'true');
        localStorage.setItem('metro_setup_date', new Date().toISOString());
        
        console.log('✅ Настройки сохранены:', settings);
        
        await new Promise(r => setTimeout(r, 500));
        window.location.href = '/ru/';
    }
    
    // ========== СБРОС ==========
    async function resetSettings() {
        const confirmed = await showModal({
            title: 'Сброс настроек',
            message: 'Вы уверены? Все ваши настройки будут сброшены. Страница перезагрузится.',
            icon: '🗑️',
            confirmText: 'Да, сбросить',
            cancelText: 'Отмена'
        });
        
        if (confirmed) {
            const keysToRemove = ['metro_avatar', 'metro_design', 'metro_theme', 'metro_setup_completed', 'metro_setup_date'];
            keysToRemove.forEach(key => localStorage.removeItem(key));
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
            window.location.href = '/ru/';
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
            window.open('https://discord.com/invite/WjGZBs3HMX', '_blank');
        }
    }
    
    // ========== ЗАГРУЗКА СОХРАНЁННЫХ НАСТРОЕК ==========
    function loadSavedSettings() {
        const savedAvatar = localStorage.getItem('metro_avatar');
        if (savedAvatar) selectAvatar(savedAvatar);
        
        const savedDesign = localStorage.getItem('metro_design');
        const savedTheme = localStorage.getItem('metro_theme') || 'auto';
        if (savedDesign) selectThemeForDesign(savedDesign, savedTheme);
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function init() {
        console.log('setup.js инициализация');
        
        // Устанавливаем текущий год
        const yearSpan = document.getElementById('currentYear');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
        
        // Загружаем сохранённые настройки
        loadSavedSettings();
        
        // Проверяем, не завершена ли уже настройка
        const setupCompleted = localStorage.getItem('metro_setup_completed');
        if (setupCompleted === 'true') {
            console.log('Настройка уже завершена, перенаправление...');
            window.location.href = '/ru/';
            return;
        }
        
        // ========== НАВИГАЦИЯ ==========
        const nextBtn1 = document.getElementById('nextBtn1');
        const nextBtn2 = document.getElementById('nextBtn2');
        const nextBtn3 = document.getElementById('nextBtn3');
        const prevBtn2 = document.getElementById('prevBtn2');
        const prevBtn3 = document.getElementById('prevBtn3');
        const prevBtn4 = document.getElementById('prevBtn4');
        const skipBtn = document.getElementById('skipBtn');
        const finishBtn = document.getElementById('finishBtn');
        const resetBtn = document.getElementById('resetBtn');
        const discordLink = document.getElementById('discordLink');
        
        if (nextBtn1) {
            nextBtn1.addEventListener('click', () => {
                currentStep = 2;
                showStep(2);
            });
        }
        
        if (nextBtn2) {
            nextBtn2.addEventListener('click', () => {
                if (validateStep(2)) {
                    currentStep = 3;
                    showStep(3);
                }
            });
        }
        
        if (nextBtn3) {
            nextBtn3.addEventListener('click', () => {
                if (validateStep(3)) {
                    currentStep = 4;
                    showStep(4);
                }
            });
        }
        
        if (prevBtn2) {
            prevBtn2.addEventListener('click', () => {
                currentStep = 1;
                showStep(1);
            });
        }
        
        if (prevBtn3) {
            prevBtn3.addEventListener('click', () => {
                currentStep = 2;
                showStep(2);
            });
        }
        
        if (prevBtn4) {
            prevBtn4.addEventListener('click', () => {
                currentStep = 3;
                showStep(3);
            });
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', skipSetup);
        }
        
        if (finishBtn) {
            finishBtn.addEventListener('click', saveAndContinue);
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', resetSettings);
        }
        
        if (discordLink) {
            discordLink.addEventListener('click', (e) => {
                e.preventDefault();
                confirmDiscordRedirect();
            });
        }
        
        // ========== ВЫБОР АВАТАРА ==========
        document.querySelectorAll('.avatar').forEach(av => {
            av.addEventListener('click', () => {
                selectAvatar(av.getAttribute('data-avatar'));
            });
            av.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    selectAvatar(av.getAttribute('data-avatar'));
                }
            });
        });
        
        // ========== ВЫБОР СТИЛЯ ==========
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const designCard = btn.closest('.design-card');
                const design = designCard?.getAttribute('data-design');
                const theme = btn.getAttribute('data-theme');
                if (design && theme) {
                    selectThemeForDesign(design, theme);
                }
            });
        });
    }
    
    // Запуск после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
