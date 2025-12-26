document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // --- КОНСТАНТЫ ---
    const MODAL_VERSION = '0.2';
    const REDIRECT_LOGO_URL = 'https://kirill12633.github.io/Metro.New.Official/main/ru/profile/metro-new-official-1.html';
    const SUPPORT_URL = 'https://kirill12633.github.io/support.metro.new/';
    const OFFICIAL_EMAIL = 'metro.new.help@gmail.com';
    const STORAGE_KEY = 'metro_verified_v1';

    // Проверяем, показывать ли модалку
    if (localStorage.getItem(STORAGE_KEY) === MODAL_VERSION) return;

    const lang = navigator.language.startsWith('en') ? 'en' : 'ru';
    const texts = {
        ru: {
            title: 'Добро пожаловать в Метро New',
            message: 'Для использования нашего приложения вы должны принять условия <a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank">Пользовательского соглашения</a> и <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank">Политики конфиденциальности</a>.',
            ageQuestion: 'Вам 13 лет или больше?',
            button: 'Продолжить',
            underage: 'Мне нет 13 лет',
            exitMessage: 'Приложение закроется через 5 секунд...'
        },
        en: {
            title: 'Welcome to Metro New',
            message: 'To use our app, you must accept the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>.',
            ageQuestion: 'Are you 13 years or older?',
            button: 'Continue',
            underage: "I'm under 13",
            exitMessage: 'App will close in 5 seconds...'
        }
    };
    const t = texts[lang];

    // --- СОЗДАЕМ МОДАЛЬНОЕ ОКНО ---
    const modalHTML = `
    <div class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">${t.title}</div>
            <div class="modal-content">${t.message}</div>
            <div class="age-check-section">
                <div class="age-question">${t.ageQuestion}</div>
                <div class="age-buttons">
                    <button id="age-yes-btn" class="age-btn yes">13+</button>
                    <button id="age-no-btn" class="age-btn no">${t.underage}</button>
                </div>
                <div id="age-warning" class="age-warning"></div>
            </div>
            <button id="main-button" class="modal-button" disabled>${t.button}</button>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const overlay = document.querySelector('.modal-overlay');
    const ageYesBtn = document.getElementById('age-yes-btn');
    const ageNoBtn = document.getElementById('age-no-btn');
    const mainButton = document.getElementById('main-button');
    const ageWarning = document.getElementById('age-warning');

    document.body.style.overflow = 'hidden';

    // --- ОБРАБОТЧИКИ ---
    let ageConfirmed = false;

    ageYesBtn.addEventListener('click', () => {
        ageConfirmed = true;
        ageYesBtn.disabled = true;
        ageNoBtn.disabled = true;
        mainButton.disabled = false;
    });

    ageNoBtn.addEventListener('click', () => {
        ageWarning.textContent = t.exitMessage;
        let seconds = 5;
        const timer = setInterval(() => {
            seconds--;
            ageWarning.textContent = t.exitMessage.replace('5', seconds);
            if (seconds <= 0) {
                clearInterval(timer);
                window.location.href = 'about:blank';
            }
        }, 1000);
        ageYesBtn.disabled = true;
        ageNoBtn.disabled = true;
        mainButton.disabled = true;
    });

    mainButton.addEventListener('click', () => {
        if (!ageConfirmed) return;
        overlay.remove();
        document.body.style.overflow = '';
        localStorage.setItem(STORAGE_KEY, MODAL_VERSION);
    });
});
