(function () {
  'use strict';

  /* ================= CONFIG ================= */

  const SITE_KEY = '0x4AAAAAACJJ-EXmOljL2_UU';
  const MIN_AGE = 13;

  const STORAGE_KEY = 'metro_verified_v1';
  const LOG_KEY = 'metro_attempt_log';
  const LOCK_KEY = 'metro_lock_until';

  /* ================= ALREADY VERIFIED ================= */

  if (localStorage.getItem(STORAGE_KEY) === 'true') return;

  /* ================= LOCK CHECK ================= */

  const lockedUntil = Number(localStorage.getItem(LOCK_KEY) || 0);
  if (lockedUntil && Date.now() < lockedUntil) {
    alert('Слишком много попыток. Попробуйте позже.');
    return;
  }

  /* ================= THEME AUTO ================= */

  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  /* ================= STYLES ================= */

  const style = document.createElement('style');
  style.textContent = `
  :root {
    --bg: ${dark ? '#020617' : '#f8fafc'};
    --card: ${dark ? '#0b1220' : '#ffffff'};
    --text: ${dark ? '#e5e7eb' : '#020617'};
    --accent: #38bdf8;
    --danger: #ef4444;
    --success: #22c55e;
  }

  * { box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI; }

  #metro-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
  }

  #metro-box {
    background: var(--card);
    color: var(--text);
    width: 92%;
    max-width: 420px;
    padding: 32px;
    border-radius: 18px;
    text-align: center;
    animation: appear .6s cubic-bezier(.2,.8,.2,1);
  }

  @keyframes appear {
    from { opacity:0; transform: translateY(40px) scale(.95); }
    to { opacity:1; transform: none; }
  }

  h1 {
    margin: 0 0 10px;
    font-size: 26px;
    font-weight: 900;
    background: linear-gradient(90deg,#38bdf8,#22c55e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p { font-size: 14px; line-height: 1.6; opacity: .9; }

  input {
    width: 100%;
    margin-top: 18px;
    padding: 14px;
    border-radius: 12px;
    border: none;
    font-size: 16px;
    background: #020617;
    color: white;
    text-align: center;
  }

  button {
    width: 100%;
    margin-top: 22px;
    padding: 16px;
    border-radius: 14px;
    border: none;
    background: linear-gradient(135deg,#38bdf8,#22c55e);
    color: #020617;
    font-weight: 900;
    font-size: 16px;
    cursor: pointer;
    transition: .25s;
  }

  button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .loader {
    margin-top: 18px;
    display: none;
  }

  .loader span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: var(--accent);
    border-radius: 50%;
    margin: 0 4px;
    animation: blink 1.4s infinite both;
  }

  .loader span:nth-child(2){animation-delay:.2s}
  .loader span:nth-child(3){animation-delay:.4s}

  @keyframes blink {
    0%{opacity:.2}
    20%{opacity:1}
    100%{opacity:.2}
  }

  .error {
    color: var(--danger);
    font-size: 13px;
    margin-top: 12px;
    display: none;
  }
  `;
  document.head.appendChild(style);

  /* ================= HTML ================= */

  const overlay = document.createElement('div');
  overlay.id = 'metro-overlay';
  overlay.innerHTML = `
    <div id="metro-box">
      <h1>Metro New</h1>
      <p>Введите год рождения.<br>Доступ разрешён с ${MIN_AGE} лет.</p>

      <input id="birthYear" type="number" placeholder="Год рождения" />

      <div class="loader" id="loader">
        <span></span><span></span><span></span>
      </div>

      <div id="turnstile"></div>

      <button id="continue" disabled>Продолжить</button>

      <div class="error" id="error"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ================= LOGGING ================= */

  function logAttempt(result, reason) {
    const log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    log.push({ time: Date.now(), result, reason });
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-20)));
  }

  function lock(seconds) {
    localStorage.setItem(LOCK_KEY, Date.now() + seconds * 1000);
  }

  /* ================= TURNSTILE ================= */

  let turnstilePassed = false;

  window.onloadTurnstileCallback = () => {
    turnstile.render('#turnstile', {
      sitekey: SITE_KEY,
      callback: () => {
        turnstilePassed = true;
        checkReady();
      }
    });
  };

  const tsScript = document.createElement('script');
  tsScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
  tsScript.async = true;
  document.head.appendChild(tsScript);

  /* ================= LOGIC ================= */

  const input = overlay.querySelector('#birthYear');
  const button = overlay.querySelector('#continue');
  const error = overlay.querySelector('#error');

  let errors = 0;

  function checkReady() {
    const age = new Date().getFullYear() - Number(input.value);
    button.disabled = !(turnstilePassed && age >= MIN_AGE);
  }

  input.addEventListener('input', checkReady);

  button.addEventListener('click', () => {
    const age = new Date().getFullYear() - Number(input.value);

    if (!turnstilePassed) {
      error.textContent = 'Проверка не пройдена';
      error.style.display = 'block';
      logAttempt('fail', 'turnstile');
      return;
    }

    if (age < MIN_AGE) {
      errors++;
      error.textContent = 'Возраст не подходит';
      error.style.display = 'block';
      logAttempt('fail', 'age');

      if (errors >= 3) {
        lock(30);
        location.reload();
      }
      return;
    }

    logAttempt('success', 'ok');
    localStorage.setItem(STORAGE_KEY, 'true');
    overlay.remove();
  });

})();
