<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Metro New Verification</title>
<!-- Turnstile CAPTCHA -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<style>
:root {
    --primary: #0066CC; --primary-dark: #0052a3;
    --secondary: #FFD700; --secondary-dark: #e6c200;
    --dark: #1A1A1A; --light: #F8F9FA;
    --success: #28A745; --warning: #FFC107; --danger: #DC3545;
    --radius: 12px; --shadow: 0 4px 12px rgba(0,0,0,0.15);
}
body { font-family: 'Montserrat', sans-serif; margin:0; padding:0; background: var(--light); color: var(--dark); display:flex; align-items:center; justify-content:center; height:100vh; }
body.dark { background: var(--dark); color: var(--light); }
.modal { background: white; padding:2rem; border-radius: var(--radius); box-shadow: var(--shadow); width:90%; max-width:400px; text-align:center; }
body.dark .modal { background: #222; color:white; }
.modal h2 { margin-bottom:1rem; }
.modal input { width: 100%; padding:0.5rem; margin-bottom:1rem; border-radius:6px; border:1px solid #ccc; }
.modal button { padding:0.8rem 1.5rem; background: var(--secondary); border:none; border-radius: var(--radius); color: var(--dark); font-weight:600; cursor:pointer; }
.modal button:disabled { opacity:0.6; cursor:not-allowed; }
.message { margin-top:0.5rem; font-size:0.9rem; }
</style>
</head>
<body>
<div class="modal">
    <h2>Подтвердите возраст</h2>
    <p>Введите ваш год рождения:</p>
    <input type="number" id="birthYear" placeholder="Например, 2010" min="1900" max="2025">
    <div id="turnstile"></div>
    <button id="verifyBtn" disabled>Продолжить</button>
    <div class="message" id="message"></div>
</div>

<script>
const SITE_KEY = '0x4AAAAAACJJ-EXmOljL2_UU';
const MIN_AGE = 13;
const STORAGE_KEY = 'metro_verified_v1';
const LOG_KEY = 'metro_attempt_log';
const LOCK_KEY = 'metro_lock_until';

let turnstilePassed = false;
let birthValid = false;

// Dark/light auto
if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    document.body.classList.add('dark');
}

const btn = document.getElementById('verifyBtn');
const yearInput = document.getElementById('birthYear');
const messageEl = document.getElementById('message');

function logAttempt(success) {
    const log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    log.push({ timestamp: Date.now(), success, year: yearInput.value });
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

function checkLock() {
    const lockUntil = Number(localStorage.getItem(LOCK_KEY) || 0);
    if(Date.now() < lockUntil){
        const remaining = Math.ceil((lockUntil - Date.now())/1000);
        btn.disabled = true;
        messageEl.textContent = `Слишком много ошибок. Попробуйте через ${remaining} сек.`;
        return true;
    }
    return false;
}

function checkReady(){
    if(checkLock()) return;
    btn.disabled = !(birthValid && turnstilePassed);
}

yearInput.addEventListener('input', () => {
    const year = Number(yearInput.value);
    const age = new Date().getFullYear() - year;
    birthValid = age >= MIN_AGE;
    if(!birthValid) messageEl.textContent = `Вам должно быть ${MIN_AGE}+ лет`;
    else messageEl.textContent = '';
    checkReady();
});

// Init Turnstile
function initTurnstile(){
    turnstile.render('#turnstile', {
        sitekey: SITE_KEY,
        callback: () => { turnstilePassed = true; checkReady(); },
        'error-callback': () => { turnstilePassed = false; checkReady(); },
        'expired-callback': () => { turnstilePassed = false; checkReady(); }
    });
}
window.addEventListener('load', initTurnstile);

btn.addEventListener('click', () => {
    if(!birthValid) return;

    // Проверка блокировки
    if(checkLock()) return;

    if(turnstilePassed && birthValid){
        localStorage.setItem(STORAGE_KEY, 'true');
        messageEl.textContent = '✓ Подтверждено!';
        logAttempt(true);
        btn.disabled = true;
    } else {
        messageEl.textContent = 'Ошибка проверки!';
        logAttempt(false);

        // блокировка 10 сек после 3 неудачных попыток
        const log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
        const recentFails = log.filter(l => !l.success && (Date.now()-l.timestamp)<60000).length;
        if(recentFails >= 3){
            localStorage.setItem(LOCK_KEY, Date.now() + 10000); // 10 секунд блок
            checkReady();
        }
    }
});
</script>
</body>
</html>
