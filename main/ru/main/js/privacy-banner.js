document.addEventListener('DOMContentLoaded', function() {

    // ------------------------------------------------------------------
    // 1. КОНФИГУРАЦИЯ БАННЕРА
    // ------------------------------------------------------------------
    const CONFIG = {
        MODAL_VERSION: '0.3', // Версия модального окна для принудительного показа при обновлении
        RECAPTCHA_SITE_KEY: '6Lfr5g0sAAAAANmMqIPHhQ6pvNa3YnVcXs3A4eR2', // Публичный ключ reCAPTCHA
        // !!! КРИТИЧНО: ЭТА ТОЧКА ДОЛЖНА БЫТЬ НА СЕРВЕРЕ !!!
        VERIFICATION_ENDPOINT: '/verify-captcha-and-consent', 
        REDIRECT_LOGO_URL: 'https://kirill12633.github.io/Metro.New.Official/main/ru/profile/metro-new-official-1.html',
        SUPPORT_URL: 'https://kirill12633.github.io/support.metro.new/',
        OFFICIAL_EMAIL: 'metro.new.help@gmail.com'
    };
    
    // Проверка, дано ли согласие на текущую версию. Если да, прекращаем выполнение.
    let acceptedVersion = localStorage.getItem('privacy_modal_version');
    if (acceptedVersion === CONFIG.MODAL_VERSION) return;

    // Определяем язык
    const lang = navigator.language.startsWith('en') ? 'en' : 'ru';
    
    // ------------------------------------------------------------------
    // 2. ТЕКСТОВЫЕ КОНСТАНТЫ
    // ------------------------------------------------------------------
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
            buttonVerifying: 'Проверка...',
            buttonAccepted: '✓ Принято!',
            buttonUnderage: 'Мне нет 13 лет',
            ageQuestion: 'Сколько вам лет?',
            ageConfirm: 'Подтвердите, что вам 13 лет или больше',
            securityNote: 'Ваши данные защищены',
            exitWarning: 'Если вам нет 13 лет, приложение будет закрыто',
            exitTimer: 'Приложение закроется через ',
            supportTitle: 'Нужна помощь?',
            supportText: 'Если у вас есть вопросы или вы нашли ошибку, прошу обратиться в',
            supportLink: 'Службу поддержки',
            accountTitle: 'Хотите создать аккаунт на сайте?',
            accountText: 'Если вы хотите создать свой аккаунт, прошу написать в поддержку на официальную почту:',
            emailCopy: 'Кликните чтобы скопировать',
            emailCopied: 'Скопировано!',
            recaptchaError: 'Пожалуйста, подтвердите что вы не робот',
            verificationError: 'Ошибка проверки. Пожалуйста, повторите.',
            networkError: 'Ошибка сети. Пожалуйста, проверьте ваше соединение.'
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
            buttonVerifying: 'Verifying...',
            buttonAccepted: '✓ Accepted!',
            buttonUnderage: "I'm under 13",
            ageQuestion: 'How old are you?',
            ageConfirm: 'Confirm you are 13 years or older',
            securityNote: 'Your data is protected',
            exitWarning: 'If you are under 13, the app will close',
            exitTimer: 'App will close in ',
            supportTitle: 'Need help?',
            supportText: 'If you have questions or found a bug, please contact',
            supportLink: 'Support Service',
            accountTitle: 'Want to create a site account?',
            accountText: 'If you want to create your own account, please write to support at official email:',
            emailCopy: 'Click to copy',
            emailCopied: 'Copied!',
            recaptchaError: 'Please confirm you are not a robot',
            verificationError: 'Verification error. Please retry.',
            networkError: 'Network error. Please check your connection.'
        }
    };

    // ------------------------------------------------------------------
    // 3. ИНИЦИАЛИЗАЦИЯ СТИЛЕЙ (CSS)
    // ------------------------------------------------------------------
    const styleSheet = document.createElement('style');
    // Вставляем все ваши CSS стили (опущены здесь для краткости, но должны быть включены)
    styleSheet.textContent = `
        @keyframes floatIn { 0% { opacity: 0; transform: scale(0.8) translateY(50px) rotateX(15deg); } 70% { opacity: 1; transform: scale(1.02) translateY(-5px) rotateX(0deg); } 100% { opacity: 1; transform: scale(1) translateY(0) rotateX(0deg); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(0, 102, 204, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); display: flex; align-items: center; justify-content: center; z-index: 10000; opacity: 0; transition: opacity 0.5s ease; backdrop-filter: blur(10px); perspective: 1000px;
        }
        .modal-container {
            background: linear-gradient(145deg, #ffffff, #f5f5f5); border-radius: 20px; padding: 40px 35px; max-width: 600px; width: 92%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset; text-align: center; position: relative; font-family: 'Montserrat', 'Segoe UI', system-ui, sans-serif; color: #1A1A1A; transform-origin: center; animation: floatIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; border: 1px solid rgba(0, 102, 204, 0.1); max-height: 90vh; overflow-y: auto;
        }
        .security-badge { position: absolute; top: 15px; left: 15px; display: flex; align-items: center; gap: 6px; font-size: 11px; color: #28A745; font-weight: 600; background: rgba(40, 167, 69, 0.1); padding: 4px 10px; border-radius: 20px; animation: pulse 2s infinite; z-index: 2; }
        .security-badge::before { content: '🔒'; font-size: 10px; }
        .modal-header { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 25px; cursor: pointer; transition: all 0.3s ease; padding-top: 10px; }
        .modal-header:hover { transform: translateY(-3px); }
        .logo-title { font-size: 2.2rem; font-weight: 900; background: linear-gradient(135deg, #0066CC, #0099FF, #00CCFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 2px 4px rgba(0, 102, 204, 0.1); letter-spacing: -0.5px; }
        .verified-badge { font-size: 0.9rem; color: #28A745; font-weight: 700; padding: 6px 14px; background: rgba(40, 167, 69, 0.15); border-radius: 20px; display: flex; align-items: center; gap: 5px; border: 1px solid rgba(40, 167, 69, 0.3); }
        .verified-badge::before { content: '✓'; font-weight: bold; font-size: 16px; }
        .age-check-section { background: rgba(255, 215, 0, 0.1); border-radius: 15px; padding: 20px; margin: 20px 0; border: 2px dashed #FFD700; animation: slideDown 0.5s ease forwards; }
        .age-question { font-size: 18px; font-weight: 700; color: #0066CC; margin-bottom: 15px; }
        .age-buttons { display: flex; gap: 15px; justify-content: center; margin-bottom: 10px; }
        .age-btn { padding: 12px 25px; border: none; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease; flex: 1; max-width: 220px; }
        .age-btn.yes { background: linear-gradient(135deg, #28A745, #20C997); color: white; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); }
        .age-btn.no { background: linear-gradient(135deg, #FF6B35, #FF8E53); color: white; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3); }
        .age-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2); }
        .age-btn:active { transform: translateY(-1px); }
        .age-warning { font-size: 12px; color: #FF6B35; margin-top: 10px; font-weight: 600; }
        .recaptcha-section { background: #f8f9fa; border-radius: 15px; padding: 20px; margin: 20px 0; border: 1px solid #dee2e6; min-height: 80px; display: none; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.5s ease; }
        .recaptcha-error { color: #dc3545; font-size: 12px; font-weight: 600; margin-top: 5px; display: none; }
        .modal-content { font-size: 14px; line-height: 1.6; color: #495057; margin-bottom: 25px; text-align: left; padding: 0 5px; }
        .modal-button { padding: 16px 32px; border: none; border-radius: 12px; background: linear-gradient(135deg, #FFD700, #FFC107); color: #1A1A1A; font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3); width: 100%; max-width: 400px; margin: 25px auto 30px; display: block; position: relative; overflow: hidden; }
        .modal-button::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient( to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100% ); transform: rotate(30deg); transition: transform 0.6s; }
        .modal-button:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4); }
        .modal-button:hover::after { transform: rotate(30deg) translateX(100%); }
        .modal-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        .shake { animation: shake 0.5s ease; }
        .exit-timer { font-size: 11px; color: #FF6B35; font-weight: 700; margin-top: 10px; background: rgba(255, 107, 53, 0.1); padding: 5px 10px; border-radius: 10px; display: inline-block; }
        .footer-section { margin-top: 30px; padding-top: 25px; border-top: 1px solid #e9ecef; text-align: left; }
        .support-block, .account-block { background: rgba(0, 102, 204, 0.05); border-radius: 12px; padding: 18px; margin-bottom: 20px; border-left: 4px solid #0066CC; }
        .footer-title { font-size: 15px; font-weight: 700; color: #0066CC; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .footer-title::before { content: '💬'; font-size: 14px; }
        .account-block .footer-title::before { content: '👤'; }
        .footer-text { font-size: 13px; color: #495057; line-height: 1.5; margin-bottom: 8px; }
        .footer-link { color: #0066CC; font-weight: 600; text-decoration: none; transition: all 0.2s; display: inline-block; padding: 2px 0; border-bottom: 1px dashed #0066CC; }
        .footer-link:hover { color: #004C99; border-bottom: 1px solid #004C99; }
        .footer-email { color: #28A745; font-weight: 600; font-family: monospace; background: rgba(40, 167, 69, 0.1); padding: 4px 8px; border-radius: 6px; display: inline-block; margin-top: 5px; font-size: 12px; border: 1px solid rgba(40, 167, 69, 0.2); }
        .loading-dots { display: inline-block; font-size: 20px; letter-spacing: 2px; }
        .loading-dots span { animation: blink 1.4s infinite; animation-fill-mode: both; }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
        .g-recaptcha { display: inline-block; transform: scale(1.1); transform-origin: center; }
        @media (max-width: 650px) { .modal-container { width: 95%; padding: 30px 20px; } .logo-title { font-size: 1.8rem; } .age-buttons { flex-direction: column; align-items: center; } .age-btn { max-width: 100%; width: 100%; } .g-recaptcha { transform: scale(0.9); } }
    `;
    document.head.appendChild(styleSheet);


    // ------------------------------------------------------------------
    // 4. ФУНКЦИИ ИНИЦИАЛИЗАЦИИ
    // ------------------------------------------------------------------
    let recaptchaWidgetId = null;

    /** Асинхронно загружает API reCAPTCHA v2. */
    function loadRecaptcha() {
        return new Promise((resolve) => {
            if (window.grecaptcha && window.grecaptcha.render) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=explicit&hl=${lang}`; 
            script.async = true;
            script.defer = true;
            
            script.onload = () => setTimeout(resolve, 500); 
            script.onerror = resolve; // Разрешаем при ошибке, чтобы не блокировать UI
            
            document.head.appendChild(script);
        });
    }

    /** Рендеринг reCAPTCHA v2. */
    function renderRecaptcha(container) {
        if (!window.grecaptcha || !window.grecaptcha.render) {
            setTimeout(() => renderRecaptcha(container), 100);
            return;
        }

        container.innerHTML = '';
        recaptchaWidgetId = grecaptcha.render(container, {
            sitekey: CONFIG.RECAPTCHA_SITE_KEY,
            theme: 'light',
            callback: (response) => setRecaptchaState(true),
            'expired-callback': () => setRecaptchaState(false), 
            'error-callback': () => setRecaptchaState(false, true)
        });
        setRecaptchaState(false);
    }

    // ------------------------------------------------------------------
    // 5. СОЗДАНИЕ ИНТЕРФЕЙСА (DOM)
    // ------------------------------------------------------------------
    
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
    header.addEventListener('click', () => window.open(CONFIG.REDIRECT_LOGO_URL, '_blank'));

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
    content.innerHTML = texts[lang].message; // Безопасно, т.к. текст жестко задан

    // Возрастная проверка
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

    // reCAPTCHA Секция
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

    // Основная кнопка
    const mainButton = document.createElement('button');
    mainButton.className = 'modal-button';
    mainButton.textContent = texts[lang].button;
    mainButton.disabled = true;

    // Футер (Support и Account)
    const footerSection = document.createElement('div');
    footerSection.className = 'footer-section';

    const supportBlock = document.createElement('div');
    supportBlock.className = 'support-block';
    const supportTitle = document.createElement('div');
    supportTitle.className = 'footer-title';
    supportTitle.textContent = texts[lang].supportTitle;
    const supportText = document.createElement('div');
    supportText.className = 'footer-text';
    supportText.innerHTML = `${texts[lang].supportText} <a href="${CONFIG.SUPPORT_URL}" target="_blank" class="footer-link">${texts[lang].supportLink}</a>`;
    supportBlock.appendChild(supportTitle);
    supportBlock.appendChild(supportText);

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
    emailElement.textContent = CONFIG.OFFICIAL_EMAIL;
    emailElement.title = texts[lang].emailCopy;

    accountBlock.appendChild(accountTitle);
    accountBlock.appendChild(accountText);
    accountBlock.appendChild(emailElement);

    footerSection.appendChild(supportBlock);
    footerSection.appendChild(accountBlock);

    // ------------------------------------------------------------------
    // 6. ПЕРЕМЕННЫЕ СОСТОЯНИЯ И ОБНОВЛЕНИЕ UI
    // ------------------------------------------------------------------
    let ageConfirmed = false;
    let recaptchaVerified = false;
    let isVerifying = false; // Флаг для предотвращения двойных запросов

    /** Обновляет состояние reCAPTCHA и кнопки. */
    function setRecaptchaState(verified, showError = false) {
        recaptchaVerified = verified;
        mainButton.disabled = !(ageConfirmed && recaptchaVerified) || isVerifying;
        recaptchaError.style.display = showError && !verified ? 'block' : 'none';
        
        // Сброс текста кнопки после ошибки/истечения
        if (!isVerifying) {
             mainButton.textContent = texts[lang].button;
        }
    }


    // ------------------------------------------------------------------
    // 7. ОБРАБОТЧИКИ СОБЫТИЙ
    // ------------------------------------------------------------------
    
    // Копирование Email
    emailElement.addEventListener('click', () => {
        navigator.clipboard.writeText(CONFIG.OFFICIAL_EMAIL).then(() => {
            const originalText = emailElement.textContent;
            emailElement.textContent = texts[lang].emailCopied;
            emailElement.style.background = 'rgba(40, 167, 69, 0.2)';
            
            setTimeout(() => {
                emailElement.textContent = originalText;
                emailElement.style.background = 'rgba(40, 167, 69, 0.1)';
            }, 2000);
        });
    });

    // "Мне нет 13 лет"
    ageNoBtn.addEventListener('click', () => {
        ageWarning.textContent = `${texts[lang].exitTimer} 5 секунд...`;
        ageWarning.classList.add('exit-timer');
        
        let seconds = 5;
        const timer = setInterval(() => {
            seconds--;
            ageWarning.textContent = `${texts[lang].exitTimer} ${seconds} секунд...`;
            
            if (seconds <= 0) {
                clearInterval(timer);
                // Безопасное закрытие
                window.location.href = 'about:blank'; 
            }
        }, 1000);
    });

    // "13+"
    ageYesBtn.addEventListener('click', () => {
        ageConfirmed = true;
        ageSection.style.opacity = '0.6';
        ageSection.style.pointerEvents = 'none';
        
        recaptchaSection.style.display = 'flex';
        setTimeout(() => {
            recaptchaSection.style.opacity = '1';
        }, 10);
        
        loadRecaptcha().then(() => renderRecaptcha(recaptchaSection));
    });

    // Основная кнопка "Согласен и продолжаю" (Отправка на сервер)
    mainButton.addEventListener('click', async () => {
        if (isVerifying) return;

        const recaptchaResponse = grecaptcha.getResponse(recaptchaWidgetId);

        if (!ageConfirmed || !recaptchaResponse) {
            setRecaptchaState(false, true);
            mainButton.classList.add('shake');
            setTimeout(() => mainButton.classList.remove('shake'), 500);
            return;
        }

        isVerifying = true;
        mainButton.textContent = texts[lang].buttonVerifying;
        setRecaptchaState(true); // Отключаем, чтобы предотвратить повторный клик
        
        try {
            // !!! ОТПРАВКА ДАННЫХ НА СЕРВЕР ДЛЯ БЕЗОПАСНОЙ ПРОВЕРКИ !!!
            const response = await fetch(CONFIG.VERIFICATION_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    recaptchaToken: recaptchaResponse,
                    consentVersion: CONFIG.MODAL_VERSION,
                    // Дополнительно можно добавить user agent, ip, timestamp, если сервер их не получает автоматически
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // УСПЕХ: Сервер подтвердил
                mainButton.style.background = 'linear-gradient(135deg, #28A745, #20C997)';
                mainButton.textContent = texts[lang].buttonAccepted;
                
                localStorage.setItem('privacy_modal_version', CONFIG.MODAL_VERSION);

                setTimeout(() => {
                    overlay.style.opacity = '0';
                    document.body.style.overflow = '';
                    setTimeout(() => overlay.remove(), 300);
                }, 800);
                
            } else {
                // ПРОВАЛ ПРОВЕРКИ reCAPTCHA (Сервер отверг токен)
                alert(texts[lang].verificationError);
                grecaptcha.reset(recaptchaWidgetId); // Сброс reCAPTCHA
            }
            
        } catch (error) {
            // Ошибка сети
            console.error('Network or server error:', error);
            alert(texts[lang].networkError);
            grecaptcha.reset(recaptchaWidgetId);
            
        } finally {
            isVerifying = false;
            setRecaptchaState(recaptchaVerified); // Восстанавливаем состояние кнопки
            mainButton.textContent = texts[lang].button;
        }
    });

    // ------------------------------------------------------------------
    // 8. СБОРКА МОДАЛЬНОГО ОКНА И ЗАПУСК
    // ------------------------------------------------------------------
    
    modal.appendChild(securityBadge);
    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(ageSection);
    modal.appendChild(recaptchaSection);
    modal.appendChild(recaptchaError);
    modal.appendChild(mainButton);
    modal.appendChild(footerSection);
    
    overlay.appendChild(modal);

    // Анимация появления
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
});
