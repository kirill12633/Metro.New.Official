document.addEventListener('DOMContentLoaded', function() {

const MODAL_VERSION = '0.2';

const REDIRECT_LOGO_URL = 'https://kirill12633.github.io/Metro.New.Official/main/ru/profile/metro-new-official-1.html';

const SUPPORT_URL = 'https://kirill12633.github.io/support.metro.new/';

const OFFICIAL_EMAIL = 'metro.new.help@gmail.com';

const RECAPTCHA_SITE_KEY = '6Lfr5g0sAAAAANmMqIPHhQ6pvNa3YnVcXs3A4eR2';

// Проверка локальной версии согласия

let acceptedVersion = localStorage.getItem('privacy_modal_version');

if (acceptedVersion === MODAL_VERSION) return;


// Определяем язык

let lang = navigator.language.startsWith('en') ? 'en' : 'ru';


const texts = {

ru: {

title: 'Добро пожаловать в Метро New',

message: `

Для использования нашего приложения вы должны принять условия

<a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank" class="modal-link">Пользовательского соглашения</a>

и <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank" class="modal-link">Политики конфиденциальности</a>.

Мы собираем минимальные данные: IP и никнейм. Рекомендуемый возраст — от 13 лет.

`,

button: 'Согласен и продолжаю',

buttonUnderage: 'Мне нет 13 лет',

ageQuestion: 'Сколько вам лет?',

ageConfirm: 'Подтвердите, что вам 13 лет или больше',

securityNote: 'Ваши данные защищены',

exitWarning: 'Если вам нет 13 лет, приложение будет закрыто',

supportTitle: 'Нужна помощь?',

supportText: 'Если у вас есть вопросы или вы нашли ошибку, прошу обратиться в',

supportLink: 'Службу поддержки',

accountTitle: 'Хотите создать аккаунт на сайте?',

accountText: 'Если вы хотите создать свой аккаунт, прошу написать в поддержку на официальную почту:',

recaptchaError: 'Пожалуйста, подтвердите что вы не робот',

loading: 'Загрузка...'

},

en: {

title: 'Welcome to Metro New',

message: `

To use our app, you must accept the

<a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank" class="modal-link">Terms of Service</a>

and <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank" class="modal-link">Privacy Policy</a>.

We collect minimal data: IP and username. Recommended age — 13+.

`,

button: 'Agree and continue',

buttonUnderage: "I'm under 13",

ageQuestion: 'How old are you?',

ageConfirm: 'Confirm you are 13 years or older',

securityNote: 'Your data is protected',

exitWarning: 'If you are under 13, the app will close',

supportTitle: 'Need help?',

supportText: 'If you have questions or found a bug, please contact',

supportLink: 'Support Service',

accountTitle: 'Want to create a VK account?',

accountText: 'If you want to create your own account, please write to support at official email:',

recaptchaError: 'Please confirm you are not a robot',

loading: 'Loading...'

}

};


// ===== СОЗДАЕМ СТИЛИ =====

const styleSheet = document.createElement('style');

styleSheet.textContent = `

@keyframes floatIn {

0% {

opacity: 0;

transform: scale(0.8) translateY(50px) rotateX(15deg);

}

70% {

opacity: 1;

transform: scale(1.02) translateY(-5px) rotateX(0deg);

}

100% {

opacity: 1;

transform: scale(1) translateY(0) rotateX(0deg);

}

}

@keyframes pulse {

0% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.4); }

70% { box-shadow: 0 0 0 15px rgba(0, 102, 204, 0); }

100% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0); }

}

@keyframes shake {

0%, 100% { transform: translateX(0); }

10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }

20%, 40%, 60%, 80% { transform: translateX(5px); }

}

@keyframes slideDown {

from { transform: translateY(-20px); opacity: 0; }

to { transform: translateY(0); opacity: 1; }

}

.modal-overlay {

position: fixed;

top: 0;

left: 0;

width: 100%;

height: 100%;

background: rgba(0, 0, 0, 0.85);

display: flex;

align-items: center;

justify-content: center;

z-index: 10000;

opacity: 0;

transition: opacity 0.5s ease;

backdrop-filter: blur(10px);

perspective: 1000px;

}

.modal-container {

background: linear-gradient(145deg, #ffffff, #f5f5f5);

border-radius: 20px;

padding: 40px 35px;

max-width: 600px; /* УВЕЛИЧЕНА ШИРИНА */

width: 92%;

box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),

0 0 0 1px rgba(255, 255, 255, 0.1) inset;

text-align: center;

position: relative;

font-family: 'Montserrat', 'Segoe UI', system-ui, sans-serif;

color: #1A1A1A;

transform-origin: center;

animation: floatIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;

opacity: 0;

border: 1px solid rgba(0, 102, 204, 0.1);

max-height: 90vh;

overflow-y: auto;

}

.security-badge {

position: absolute;

top: 15px;

left: 15px;

display: flex;

align-items: center;

gap: 6px;

font-size: 11px;

color: #28A745;

font-weight: 600;

background: rgba(40, 167, 69, 0.1);

padding: 4px 10px;

border-radius: 20px;

animation: pulse 2s infinite;

z-index: 2;

}

.security-badge::before {

content: '🔒';

font-size: 10px;

}

.modal-header {

display: flex;

align-items: center;

justify-content: center;

gap: 12px;

margin-bottom: 25px;

cursor: pointer;

transition: all 0.3s ease;

padding-top: 10px;

}

.modal-header:hover {

transform: translateY(-3px);

}

.logo-title {

font-size: 2.2rem; /* УВЕЛИЧЕН РАЗМЕР */

font-weight: 900;

background: linear-gradient(135deg, #0066CC, #0099FF, #00CCFF);

-webkit-background-clip: text;

-webkit-text-fill-color: transparent;

background-clip: text;

text-shadow: 0 2px 4px rgba(0, 102, 204, 0.1);

letter-spacing: -0.5px;

}

.verified-badge {

font-size: 0.9rem; /* УВЕЛИЧЕН РАЗМЕР */

color: #28A745;

font-weight: 700;

padding: 6px 14px;

background: rgba(40, 167, 69, 0.15);

border-radius: 20px;

display: flex;

align-items: center;

gap: 5px;

border: 1px solid rgba(40, 167, 69, 0.3);

}

.verified-badge::before {

content: '✓';

font-weight: bold;

font-size: 16px;

}

.age-check-section {

background: rgba(255, 215, 0, 0.1);

border-radius: 15px;

padding: 20px;

margin: 20px 0;

border: 2px dashed #FFD700;

animation: slideDown 0.5s ease forwards;

}

.age-question {

font-size: 18px;

font-weight: 700;

color: #0066CC;

margin-bottom: 15px;

}

.age-buttons {

display: flex;

gap: 15px;

justify-content: center;

margin-bottom: 10px;

}

.age-btn {

padding: 12px 25px;

border: none;

border-radius: 12px;

font-weight: 600;

font-size: 14px;

cursor: pointer;

transition: all 0.3s ease;

flex: 1;

max-width: 220px; /* УВЕЛИЧЕНА ШИРИНА */

}

.age-btn.yes {

background: linear-gradient(135deg, #28A745, #20C997);

color: white;

box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);

}

.age-btn.no {

background: linear-gradient(135deg, #FF6B35, #FF8E53);

color: white;

box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);

}

.age-btn:hover {

transform: translateY(-3px);

box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);

}

.age-btn:active {

transform: translateY(-1px);

}

.age-warning {

font-size: 12px;

color: #FF6B35;

margin-top: 10px;

font-weight: 600;

}

.recaptcha-section {

background: #f8f9fa;

border-radius: 15px;

padding: 20px;

margin: 20px 0;

border: 1px solid #dee2e6;

min-height: 80px;

display: flex;

align-items: center;

justify-content: center;

display: none;

}

.recaptcha-error {

color: #dc3545;

font-size: 12px;

font-weight: 600;

margin-top: 5px;

display: none;

}

.modal-content {

font-size: 14px;

line-height: 1.6;

color: #495057;

margin-bottom: 25px;

text-align: left;

padding: 0 5px;

}

.modal-button {

padding: 16px 32px;

border: none;

border-radius: 12px;

background: linear-gradient(135deg, #FFD700, #FFC107);

color: #1A1A1A;

font-weight: 800;

font-size: 16px;

cursor: pointer;

transition: all 0.3s ease;

box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);

width: 100%;

max-width: 400px; /* УВЕЛИЧЕНА ШИРИНА */

margin: 25px auto 30px;

display: block;

position: relative;

overflow: hidden;

}

.modal-button::after {

content: '';

position: absolute;

top: -50%;

left: -50%;

width: 200%;

height: 200%;

background: linear-gradient(

to right,

rgba(255, 255, 255, 0) 0%,

rgba(255, 255, 255, 0.3) 50%,

rgba(255, 255, 255, 0) 100%

);

transform: rotate(30deg);

transition: transform 0.6s;

}

.modal-button:hover {

transform: translateY(-4px) scale(1.02);

box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);

}

.modal-button:hover::after {

transform: rotate(30deg) translateX(100%);

}

.modal-button:disabled {

opacity: 0.6;

cursor: not-allowed;

transform: none !important;

}

.shake {

animation: shake 0.5s ease;

}

.exit-timer {

font-size: 11px;

color: #FF6B35;

font-weight: 700;

margin-top: 10px;

background: rgba(255, 107, 53, 0.1);

padding: 5px 10px;

border-radius: 10px;

display: inline-block;

}

.footer-section {

margin-top: 30px;

padding-top: 25px;

border-top: 1px solid #e9ecef;

text-align: left;

}

.support-block, .account-block {

background: rgba(0, 102, 204, 0.05);

border-radius: 12px;

padding: 18px;

margin-bottom: 20px;

border-left: 4px solid #0066CC;

}

.footer-title {

font-size: 15px;

font-weight: 700;

color: #0066CC;

margin-bottom: 8px;

display: flex;

align-items: center;

gap: 8px;

}

.footer-title::before {

content: '💬';

font-size: 14px;

}

.account-block .footer-title::before {

content: '👤';

}

.footer-text {

font-size: 13px;

color: #495057;

line-height: 1.5;

margin-bottom: 8px;

}

.footer-link {

color: #0066CC;

font-weight: 600;

text-decoration: none;

transition: all 0.2s;

display: inline-block;

padding: 2px 0;

border-bottom: 1px dashed #0066CC;

}

.footer-link:hover {

color: #004C99;

border-bottom: 1px solid #004C99;

}

.footer-email {

color: #28A745;

font-weight: 600;

font-family: monospace;

background: rgba(40, 167, 69, 0.1);

padding: 4px 8px;

border-radius: 6px;

display: inline-block;

margin-top: 5px;

font-size: 12px;

border: 1px solid rgba(40, 167, 69, 0.2);

}

.loading-dots {

display: inline-block;

font-size: 20px;

letter-spacing: 2px;

}

.loading-dots span {

animation: blink 1.4s infinite;

animation-fill-mode: both;

}

.loading-dots span:nth-child(2) {

animation-delay: 0.2s;

}

.loading-dots span:nth-child(3) {

animation-delay: 0.4s;

}

@keyframes blink {

0% { opacity: 0.2; }

20% { opacity: 1; }

100% { opacity: 0.2; }

}

/* Стили для reCAPTCHA */

.g-recaptcha {

display: inline-block;

transform: scale(1.1);

transform-origin: center;

}

/* Адаптивность */

@media (max-width: 650px) {

.modal-container {

width: 95%;

padding: 30px 20px;

}

.logo-title {

font-size: 1.8rem;

}

.age-buttons {

flex-direction: column;

align-items: center;

}

.age-btn {

max-width: 100%;

width: 100%;

}

.g-recaptcha {

transform: scale(0.9);

}

}

`;

document.head.appendChild(styleSheet);


// ===== ЗАГРУЗКА GOOGLE RECAPTCHA =====

function loadRecaptcha() {

return new Promise((resolve) => {

if (window.grecaptcha) {

resolve();

return;

}

const script = document.createElement('script');

script.src = `https://www.google.com/recaptcha/api.js?render=explicit&hl=${lang}`;

script.async = true;

script.defer = true;

script.onload = () => {

setTimeout(resolve, 500);

};

script.onerror = () => {

console.error('Failed to load reCAPTCHA');

resolve();

};

document.head.appendChild(script);

});

}


// ===== СОЗДАЕМ МОДАЛЬНОЕ ОКНО =====

const overlay = document.createElement('div');

overlay.className = 'modal-overlay';

document.body.appendChild(overlay);

document.body.style.overflow = 'hidden';


const modal = document.createElement('div');

modal.className = 'modal-container';


// Бейдж безопасности

const securityBadge = document.createElement('div');

securityBadge.className = 'security-badge';

securityBadge.textContent = texts[lang].securityNote;


// Заголовок

const header = document.createElement('div');

header.className = 'modal-header';

header.addEventListener('click', () => {

window.open(REDIRECT_LOGO_URL, '_blank');

});


const logoTitle = document.createElement('div');

logoTitle.className = 'logo-title';

logoTitle.textContent = 'Метро New';


const verifiedBadge = document.createElement('div');

verifiedBadge.className = 'verified-badge';

verifiedBadge.textContent = lang === 'ru' ? 'Официально' : 'Official';


header.appendChild(logoTitle);

header.appendChild(verifiedBadge);


// Контент соглашения

const content = document.createElement('div');

content.className = 'modal-content';

content.innerHTML = texts[lang].message;


// ===== ВОЗРАСТНАЯ ПРОВЕРКА =====

const ageSection = document.createElement('div');

ageSection.className = 'age-check-section';


const ageQuestion = document.createElement('div');

ageQuestion.className = 'age-question';

ageQuestion.textContent = texts[lang].ageQuestion;


const ageButtons = document.createElement('div');

ageButtons.className = 'age-buttons';


const ageYesBtn = document.createElement('button');

ageYesBtn.className = 'age-btn yes';

ageYesBtn.textContent = '13+';

const ageNoBtn = document.createElement('button');

ageNoBtn.className = 'age-btn no';

ageNoBtn.textContent = texts[lang].buttonUnderage;


const ageWarning = document.createElement('div');

ageWarning.className = 'age-warning';

ageWarning.textContent = texts[lang].exitWarning;


ageButtons.appendChild(ageYesBtn);

ageButtons.appendChild(ageNoBtn);

ageSection.appendChild(ageQuestion);

ageSection.appendChild(ageButtons);

ageSection.appendChild(ageWarning);


// ===== GOOGLE RECAPTCHA СЕКЦИЯ =====

const recaptchaSection = document.createElement('div');

recaptchaSection.className = 'recaptcha-section';

recaptchaSection.id = 'recaptcha-container';

const loadingText = document.createElement('div');

loadingText.className = 'loading-dots';

loadingText.innerHTML = '<span>.</span><span>.</span><span>.</span>';

recaptchaSection.appendChild(loadingText);

const recaptchaError = document.createElement('div');

recaptchaError.className = 'recaptcha-error';

recaptchaError.textContent = texts[lang].recaptchaError;


// ===== ОСНОВНАЯ КНОПКА =====

const mainButton = document.createElement('button');

mainButton.className = 'modal-button';

mainButton.textContent = texts[lang].button;

mainButton.disabled = true;


// ===== НИЖНЯЯ СЕКЦИЯ (Support и Account) =====

const footerSection = document.createElement('div');

footerSection.className = 'footer-section';


// Блок поддержки

const supportBlock = document.createElement('div');

supportBlock.className = 'support-block';

const supportTitle = document.createElement('div');

supportTitle.className = 'footer-title';

supportTitle.textContent = texts[lang].supportTitle;

const supportText = document.createElement('div');

supportText.className = 'footer-text';

supportText.innerHTML = `${texts[lang].supportText} <a href="${SUPPORT_URL}" target="_blank" class="footer-link">${texts[lang].supportLink}</a>`;

supportBlock.appendChild(supportTitle);

supportBlock.appendChild(supportText);


// Блок аккаунта ВК

const accountBlock = document.createElement('div');

accountBlock.className = 'account-block';

const accountTitle = document.createElement('div');

accountTitle.className = 'footer-title';

accountTitle.textContent = texts[lang].accountTitle;

const accountText = document.createElement('div');

accountText.className = 'footer-text';

accountText.innerHTML = texts[lang].accountText;

const emailElement = document.createElement('div');

emailElement.className = 'footer-email';

emailElement.textContent = OFFICIAL_EMAIL;

emailElement.style.cursor = 'pointer';

emailElement.title = lang === 'ru' ? 'Кликните чтобы скопировать' : 'Click to copy';

emailElement.addEventListener('click', () => {

navigator.clipboard.writeText(OFFICIAL_EMAIL).then(() => {

const originalText = emailElement.textContent;

emailElement.textContent = lang === 'ru' ? 'Скопировано!' : 'Copied!';

emailElement.style.background = 'rgba(40, 167, 69, 0.2)';

emailElement.style.color = '#28A745';

setTimeout(() => {

emailElement.textContent = originalText;

emailElement.style.background = 'rgba(40, 167, 69, 0.1)';

emailElement.style.color = '#28A745';

}, 2000);

});

});

accountBlock.appendChild(accountTitle);

accountBlock.appendChild(accountText);

accountBlock.appendChild(emailElement);


// Собираем футер

footerSection.appendChild(supportBlock);

footerSection.appendChild(accountBlock);


// ===== ПЕРЕМЕННЫЕ СОСТОЯНИЯ =====

let ageConfirmed = false;

let recaptchaVerified = false;

let recaptchaWidgetId = null;


// ===== ИНИЦИАЛИЗАЦИЯ RECAPTCHA =====

function initRecaptcha() {

if (!window.grecaptcha || !window.grecaptcha.render) {

setTimeout(initRecaptcha, 100);

return;

}

recaptchaSection.innerHTML = '';

recaptchaWidgetId = grecaptcha.render(recaptchaSection, {

sitekey: RECAPTCHA_SITE_KEY,

theme: 'light',

size: 'normal',

callback: function(response) {

recaptchaVerified = true;

recaptchaError.style.display = 'none';

checkFormCompletion();

},

'expired-callback': function() {

recaptchaVerified = false;

checkFormCompletion();

},

'error-callback': function() {

recaptchaVerified = false;

recaptchaError.style.display = 'block';

checkFormCompletion();

}

});

}


// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====

ageYesBtn.addEventListener('click', () => {

ageConfirmed = true;

ageSection.style.opacity = '0.6';

ageSection.style.pointerEvents = 'none';

// Показываем reCAPTCHA

recaptchaSection.style.display = 'flex';

setTimeout(() => {

recaptchaSection.style.opacity = '1';

recaptchaSection.style.transform = 'translateY(0)';

}, 10);

// Загружаем и инициализируем reCAPTCHA

loadRecaptcha().then(() => {

initRecaptcha();

});

checkFormCompletion();

});


ageNoBtn.addEventListener('click', () => {

ageWarning.textContent = lang === 'ru'

? 'Приложение закроется через 5 секунд...'

: 'App will close in 5 seconds...';

ageWarning.classList.add('exit-timer');

let seconds = 5;

const timer = setInterval(() => {

seconds--;

ageWarning.textContent = lang === 'ru'

? `Приложение закроется через ${seconds} секунд...`

: `App will close in ${seconds} seconds...`;

if (seconds <= 0) {

clearInterval(timer);

window.location.href = 'about:blank';

}

}, 1000);

});


// Проверка готовности формы

function checkFormCompletion() {

mainButton.disabled = !(ageConfirmed && recaptchaVerified);

}


// Основная кнопка

mainButton.addEventListener('click', () => {

if (!ageConfirmed || !recaptchaVerified) {

if (!recaptchaVerified) {

recaptchaError.style.display = 'block';

mainButton.classList.add('shake');

setTimeout(() => mainButton.classList.remove('shake'), 500);

}

return;

}

// Получаем токен reCAPTCHA

const recaptchaResponse = grecaptcha.getResponse(recaptchaWidgetId);

if (!recaptchaResponse) {

recaptchaError.style.display = 'block';

return;

}

// Анимация принятия

mainButton.style.background = 'linear-gradient(135deg, #28A745, #20C997)';

mainButton.textContent = lang === 'ru' ? '✓ Принято!' : '✓ Accepted!';

mainButton.disabled = true;

// Можно отправить токен на сервер для проверки

// fetch('/verify-recaptcha', {

// method: 'POST',

// body: JSON.stringify({ token: recaptchaResponse }),

// headers: { 'Content-Type': 'application/json' }

// })

setTimeout(() => {

overlay.style.opacity = '0';

setTimeout(() => {

overlay.remove();

document.body.style.overflow = '';

// Сохраняем в localStorage

localStorage.setItem('privacy_modal_version', MODAL_VERSION);

localStorage.setItem('age_verified', 'true');

localStorage.setItem('recaptcha_passed', 'true');

localStorage.setItem('verification_timestamp', Date.now().toString());

}, 300);

}, 800);

});


// ===== СОБИРАЕМ МОДАЛКУ =====

modal.appendChild(securityBadge);

modal.appendChild(header);

modal.appendChild(content);

modal.appendChild(ageSection);

modal.appendChild(recaptchaSection);

modal.appendChild(recaptchaError);

modal.appendChild(mainButton);

modal.appendChild(footerSection);

overlay.appendChild(modal);


// ===== АНИМАЦИЯ ПОЯВЛЕНИЯ =====

setTimeout(() => {

overlay.style.opacity = '1';

// Последовательное появление элементов

const elements = [header, content, ageSection, footerSection, mainButton];

elements.forEach((el, index) => {

el.style.opacity = '0';

el.style.transform = 'translateY(20px)';

setTimeout(() => {

el.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

el.style.opacity = '1';

el.style.transform = 'translateY(0)';

}, 300 + (index * 150));

});

}, 100);


// Очистка при закрытии

overlay.addEventListener('click', (e) => {

if (e.target === overlay) {

overlay.style.opacity = '0';

setTimeout(() => {

overlay.remove();

document.body.style.overflow = '';

}, 300);

}

});

}); 
