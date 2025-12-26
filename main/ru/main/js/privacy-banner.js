<script>
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // --- КОНСТАНТЫ ---
    const MODAL_VERSION = '0.2';
    const STORAGE_KEY = 'metro_verified_v1';
    const REDIRECT_LOGO_URL = 'https://kirill12633.github.io/Metro.New.Official/main/ru/profile/metro-new-official-1.html';
    const SUPPORT_URL = 'https://kirill12633.github.io/support.metro.new/';
    const OFFICIAL_EMAIL = 'metro.new.help@gmail.com';

    if (localStorage.getItem(STORAGE_KEY) === MODAL_VERSION) return;

    const lang = navigator.language.startsWith('en') ? 'en' : 'ru';
    const texts = {
        ru: {
            title: 'Добро пожаловать в Метро New',
            message: 'Для использования нашего приложения вы должны принять <a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank">Пользовательское соглашение</a> и <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank">Политику конфиденциальности</a>.',
            ageQuestion: 'Вам 13 лет или больше?',
            button: 'Продолжить',
            underage: 'Мне нет 13 лет',
            exitMessage: 'Приложение закроется через 5 секунд...',
            supportTitle: 'Нужна помощь?',
            supportText: 'Если у вас есть вопросы или вы нашли ошибку, прошу обратиться в',
            supportLink: 'Службу поддержки',
            accountTitle: 'Хотите создать аккаунт на сайте?',
            accountText: 'Если вы хотите создать свой аккаунт, прошу написать в поддержку на официальную почту:'
        },
        en: {
            title: 'Welcome to Metro New',
            message: 'To use our app, you must accept the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>.',
            ageQuestion: 'Are you 13 years or older?',
            button: 'Continue',
            underage: "I'm under 13",
            exitMessage: 'App will close in 5 seconds...',
            supportTitle: 'Need help?',
            supportText: 'If you have questions or found a bug, please contact',
            supportLink: 'Support Service',
            accountTitle: 'Want to create an account?',
            accountText: 'If you want to create your own account, please write to support at official email:'
        }
    };
    const t = texts[lang];

    // --- Стили ---
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:10000;animation:fadeIn 0.5s;}
        .modal-container {background:#fff;padding:30px;border-radius:20px;max-width:600px;width:90%;text-align:center;font-family:sans-serif;color:#1A1A1A;box-shadow:0 10px 30px rgba(0,0,0,0.3);transform:translateY(-30px);animation:slideDown 0.5s forwards;}
        h2 {margin-bottom:15px;}
        p {margin-bottom:20px;}
        .age-check-section {margin:20px 0;}
        .age-check-section button {margin:5px;padding:10px 20px;border:none;border-radius:12px;cursor:pointer;font-weight:bold;transition:all 0.3s;}
        .age-check-section button:hover {transform:translateY(-2px);}
        #age-yes-btn {background:green;color:white;}
        #age-no-btn {background:red;color:white;}
        #main-button {padding:12px 25px;margin-top:15px;border:none;border-radius:12px;background:gold;cursor:pointer;font-weight:bold;transition:all 0.3s;opacity:0.9;}
        #main-button:hover {opacity:1;transform:scale(1.03);}
        #main-button:disabled {opacity:0.5;cursor:not-allowed;}
        #age-warning {margin-top:10px;color:red;font-weight:bold;}
        .footer-section {margin-top:20px;text-align:left;font-size:14px;}
        .footer-block {background:rgba(0,0,0,0.05);padding:10px;margin:10px 0;border-radius:10px;}
        .footer-block a {color:#0066CC;text-decoration:none;}
        @keyframes fadeIn {from {opacity:0;} to {opacity:1;}}
        @keyframes slideDown {to {transform:translateY(0);}}
    `;
    document.head.appendChild(style);

    // --- HTML ---
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-container">
                <h2>${t.title}</h2>
                <p>${t.message}</p>
                <div class="age-check-section">
                    <div class="age-question" style="font-weight:bold;margin-bottom:10px;">${t.ageQuestion}</div>
                    <button id="age-yes-btn">13+</button>
                    <button id="age-no-btn">${t.underage}</button>
                    <div id="age-warning"></div>
                </div>
                <button id="main-button" disabled>${t.button}</button>
                <div class="footer-section">
                    <div class="footer-block">
                        <b>${t.supportTitle}</b>
                        <p>${t.supportText} <a href="${SUPPORT_URL}" target="_blank">${t.supportLink}</a></p>
                    </div>
                    <div class="footer-block">
                        <b>${t.accountTitle}</b>
                        <p>${t.accountText} <span style="font-weight:bold;">${OFFICIAL_EMAIL}</span></p>
                    </div>
                </div>
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
</script>
