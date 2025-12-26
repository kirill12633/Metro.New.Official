document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // --- КОНСТАНТЫ ---
    const MODAL_VERSION = '0.2';
    const REDIRECT_LOGO_URL = 'https://kirill12633.github.io/Metro.New.Official/main/ru/profile/metro-new-official-1.html';
    const SUPPORT_URL = 'https://kirill12633.github.io/support.metro.new/';
    const OFFICIAL_EMAIL = 'metro.new.help@gmail.com';
    const SITE_KEY = '0x4AAAAAACJJ-EXmOljL2_UU';
    const MIN_AGE = 13;
    const STORAGE_KEY = 'metro_verified_v1';
    const LOG_KEY = 'metro_attempt_log';
    const LOCK_KEY = 'metro_lock_until';

    // --- Проверка уже пройденного модала ---
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    const lockedUntil = Number(localStorage.getItem(LOCK_KEY) || 0);
    if (lockedUntil && Date.now() < lockedUntil) {
        alert('Слишком много попыток. Попробуйте позже.');
        return;
    }

    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // --- Стили ---
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --primary: #0066CC;
            --primary-dark: #0052a3;
            --secondary: #FFD700;
            --dark: #1A1A1A;
            --light: #F8F9FA;
            --gray: #6C757D;
            --success: #28A745;
            --danger: #DC3545;
            --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
            --shadow-lg: 0 8px 25px rgba(0,0,0,0.2);
            --radius-xl: 15px;
        }
        body { overflow: hidden; }
        #metro-overlay {
            position: fixed; inset:0;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            display:flex; justify-content:center; align-items:center;
            z-index:99999;
        }
        #metro-box {
            background:${dark?'#0b1220':'#fff'};
            color:${dark?'#e5e7eb':'#1A1A1A'};
            border-radius: var(--radius-xl);
            padding: 32px;
            max-width: 450px;
            width: 90%;
            text-align:center;
            box-shadow: var(--shadow-lg);
            animation: appear .6s cubic-bezier(.2,.8,.2,1);
        }
        @keyframes appear { from {opacity:0; transform: translateY(40px) scale(.95);} to {opacity:1; transform:none;} }
        h1 { font-size:28px; background:linear-gradient(90deg,var(--secondary),var(--primary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:15px; }
        p { font-size:14px; margin-bottom:15px; }
        input { width:100%; padding:14px; border-radius:12px; border:none; font-size:16px; text-align:center; margin-bottom:18px; background:${dark?'#1A1A1A':'#f0f0f0'}; color:${dark?'#e5e7eb':'#1A1A1A'};}
        button { width:100%; padding:16px; border:none; border-radius:12px; font-weight:700; font-size:16px; cursor:pointer; background:linear-gradient(135deg,var(--secondary),var(--primary)); color:${dark?'#1A1A1A':'#1A1A1A'}; transition:0.3s;}
        button:disabled { opacity:0.5; cursor:not-allowed;}
        .error { color:var(--danger); font-size:13px; margin-top:12px; display:none;}
        .loader { display:none; margin-top:10px; }
        .loader span { display:inline-block; width:8px; height:8px; background:var(--secondary); border-radius:50%; margin:0 4px; animation:blink 1.4s infinite both;}
        .loader span:nth-child(2){animation-delay:.2s}
        .loader span:nth-child(3){animation-delay:.4s}
        @keyframes blink {0%{opacity:.2}20%{opacity:1}100%{opacity:.2}}
    `;
    document.head.appendChild(style);

    // --- HTML ---
    const overlay = document.createElement('div');
    overlay.id='metro-overlay';
    overlay.innerHTML=`
        <div id="metro-box">
            <h1>Metro New</h1>
            <p>Введите год рождения. Доступ с ${MIN_AGE} лет.</p>
            <input id="birthYear" type="number" placeholder="Год рождения" />
            <div id="turnstile"></div>
            <button id="continue" disabled>Продолжить</button>
            <div class="error" id="error"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    // --- Логирование ---
    function logAttempt(result, reason) {
        const log = JSON.parse(localStorage.getItem(LOG_KEY)||'[]');
        log.push({time:Date.now(),result,reason});
        localStorage.setItem(LOG_KEY,JSON.stringify(log.slice(-20)));
    }
    function lock(seconds) { localStorage.setItem(LOCK_KEY,Date.now()+seconds*1000); }

    // --- Turnstile ---
    let turnstilePassed=false;
    window.onloadTurnstileCallback = () => {
        turnstile.render('#turnstile',{
            sitekey: SITE_KEY,
            callback:()=>{ turnstilePassed=true; checkReady();}
        });
    };
    const tsScript=document.createElement('script');
    tsScript.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
    tsScript.async=true;
    document.head.appendChild(tsScript);

    // --- Логика ---
    const input=overlay.querySelector('#birthYear');
    const button=overlay.querySelector('#continue');
    const error=overlay.querySelector('#error');
    let errors=0;

    function checkReady(){
        const age=new Date().getFullYear()-Number(input.value);
        button.disabled = !(turnstilePassed && age>=MIN_AGE);
        if(error.style.display==='block') error.style.display='none';
    }

    input.addEventListener('input',checkReady);

    button.addEventListener('click',()=>{
        const age=new Date().getFullYear()-Number(input.value);
        if(!turnstilePassed){
            error.textContent='Проверка Turnstile не пройдена';
            error.style.display='block';
            logAttempt('fail','turnstile');
            return;
        }
        if(age<MIN_AGE){
            errors++;
            error.textContent='Возраст не подходит';
            error.style.display='block';
            logAttempt('fail','age');
            if(errors>=3){ lock(30); location.reload(); }
            return;
        }
        logAttempt('success','ok');
        localStorage.setItem(STORAGE_KEY,'true');
        overlay.remove();
        document.body.style.overflow='';
    });

    overlay.querySelector('h1').addEventListener('click',()=>{ window.open(REDIRECT_LOGO_URL,'_blank'); });
});
