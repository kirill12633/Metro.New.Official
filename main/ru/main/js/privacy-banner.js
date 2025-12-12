document.addEventListener('DOMContentLoaded', function() {
    const MODAL_VERSION = '0.3';
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
            button: 'Принять и продолжить',
            buttonUnderage: 'Мне нет 13 лет',
            ageQuestion: 'Сколько вам лет?',
            ageConfirm: 'Подтвердите, что вам 13 лет или больше',
            exitWarning: 'Если вам нет 13 лет, приложение будет закрыто',
            supportTitle: 'Нужна помощь?',
            supportText: 'Если у вас есть вопросы или вы нашли ошибку, прошу обратиться в',
            supportLink: 'Службу поддержки',
            accountTitle: 'Хотите создать аккаунт на сайте?',
            accountText: 'Если вы хотите создать свой аккаунт, прошу написать в поддержку на официальную почту:',
            recaptchaError: 'Пожалуйста, подтвердите что вы не робот',
            loading: 'Загрузка...',
            acceptNote: 'Нажимая "Принять и продолжить", вы соглашаетесь с нашими условиями'
        },
        en: {
            title: 'Welcome to Metro New',
            message: `
                To use our app, you must accept the 
                <a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank" class="modal-link">Terms of Service</a> 
                and <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank" class="modal-link">Privacy Policy</a>. 
                We collect minimal data: IP and username. Recommended age — 13+.
            `,
            button: 'Accept and continue',
            buttonUnderage: "I'm under 13",
            ageQuestion: 'How old are you?',
            ageConfirm: 'Confirm you are 13 years or older',
            exitWarning: 'If you are under 13, the app will close',
            supportTitle: 'Need help?',
            supportText: 'If you have questions or found a bug, please contact',
            supportLink: 'Support Service',
            accountTitle: 'Want to create a VK account?',
            accountText: 'If you want to create your own account, please write to support at official email:',
            recaptchaError: 'Please confirm you are not a robot',
            loading: 'Loading...',
            acceptNote: 'By clicking "Accept and continue", you agree to our terms'
        }
    };

    // ===== СОЗДАЕМ СТИЛИ =====
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        :root {
            --primary: #0066CC;
            --primary-dark: #0052a3;
            --primary-light: #4d94ff;
            --secondary: #FFD700;
            --secondary-dark: #e6c200;
            --dark: #1A1A1A;
            --light: #F8F9FA;
            --gray: #6C757D;
            --success: #28A745;
            --danger: #FF6B35;
            --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
            --shadow-lg: 0 8px 25px rgba(0,0,0,0.2);
            --radius-md: 8px;
            --radius-lg: 12px;
            --radius-xl: 15px;
        }
        
        @keyframes floatIn {
            0% {
                opacity: 0;
                transform: scale(0.9) translateY(30px);
            }
            100% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes shine {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
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
            animation: fadeIn 0.3s ease forwards;
            backdrop-filter: blur(10px);
        }
        
        .modal-container {
            background: white;
            border-radius: var(--radius-xl);
            padding: 30px;
            max-width: 550px;
            width: 92%;
            box-shadow: var(--shadow-lg);
            position: relative;
            overflow: hidden;
            font-family: 'Montserrat', 'Segoe UI', system-ui, sans-serif;
            animation: floatIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            opacity: 0;
            border: 1px solid rgba(0, 102, 204, 0.1);
        }
        
        .modal-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 10px;
            border-radius: var(--radius-lg);
            background: linear-gradient(135deg, rgba(0, 102, 204, 0.05), rgba(0, 153, 255, 0.05));
            position: relative;
            overflow: hidden;
        }
        
        .modal-header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                to right,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.8) 50%,
                rgba(255, 255, 255, 0) 100%
            );
            transform: rotate(45deg);
            animation: shine 3s infinite;
        }
        
        .logo-title {
            font-size: 2rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 1;
        }
        
        .verified-badge {
            font-size: 0.8rem;
            color: var(--success);
            font-weight: 700;
            padding: 6px 12px;
            background: rgba(40, 167, 69, 0.15);
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 5px;
            border: 1px solid rgba(40, 167, 69, 0.3);
            position: relative;
            z-index: 1;
        }
        
        .verified-badge::before {
            content: '✓';
            font-weight: bold;
        }
        
        .age-check-section {
            background: rgba(255, 215, 0, 0.1);
            border-radius: var(--radius-lg);
            padding: 20px;
            margin: 20px 0;
            border: 2px dashed var(--secondary);
            animation: fadeIn 0.5s ease forwards;
        }
        
        .age-question {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 15px;
            text-align: center;
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
            border-radius: var(--radius-md);
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            flex: 1;
            max-width: 200px;
            min-height: 48px;
        }
        
        .age-btn.yes {
            background: linear-gradient(135deg, var(--success), #20C997);
            color: white;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }
        
        .age-btn.no {
            background: linear-gradient(135deg, var(--danger), #FF8E53);
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
            color: var(--danger);
            margin-top: 10px;
            font-weight: 600;
            text-align: center;
            background: rgba(255, 107, 53, 0.1);
            padding: 8px 12px;
            border-radius: var(--radius-md);
        }
        
        .recaptcha-section {
            background: #f8f9fa;
            border-radius: var(--radius-lg);
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
            text-align: center;
            display: none;
        }
        
        .modal-content {
            font-size: 14px;
            line-height: 1.6;
            color: var(--gray);
            margin-bottom: 20px;
            text-align: left;
            padding: 0 5px;
            background: var(--light);
            padding: 15px;
            border-radius: var(--radius-md);
            border-left: 4px solid var(--primary);
        }
        
        .modal-button {
            padding: 16px 32px;
            border: none;
            border-radius: var(--radius-lg);
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(0, 102, 204, 0.3);
            width: 100%;
            margin: 25px auto 15px;
            display: block;
            position: relative;
            overflow: hidden;
        }
        
        .modal-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 102, 204, 0.4);
            background: linear-gradient(135deg, var(--primary-dark), #004C99);
        }
        
        .modal-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
            background: linear-gradient(135deg, var(--gray), #6C757D);
        }
        
        .accept-note {
            font-size: 12px;
            color: var(--gray);
            text-align: center;
            margin-top: 10px;
            font-style: italic;
        }
        
        .exit-timer {
            animation: pulse 1s infinite;
        }
        
        .footer-section {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: left;
        }
        
        .support-block, .account-block {
            background: rgba(0, 102, 204, 0.05);
            border-radius: var(--radius-md);
            padding: 15px;
            margin-bottom: 15px;
            border-left: 3px solid var(--primary);
        }
        
        .footer-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .footer-title::before {
            content: '💬';
            font-size: 12px;
        }
        
        .account-block .footer-title::before {
            content: '👤';
        }
        
        .footer-text {
            font-size: 13px;
            color: var(--gray);
            line-height: 1.5;
            margin-bottom: 8px;
        }
        
        .footer-link {
            color: var(--primary);
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
            display: inline-block;
            padding: 2px 0;
            border-bottom: 1px dashed var(--primary);
        }
        
        .footer-link:hover {
            color: var(--primary-dark);
            border-bottom: 1px solid var(--primary-dark);
        }
        
        .footer-email {
            color: var(--success);
            font-weight: 600;
            font-family: monospace;
            background: rgba(40, 167, 69, 0.1);
            padding: 6px 10px;
            border-radius: var(--radius-md);
            display: inline-block;
            margin-top: 5px;
            font-size: 12px;
            border: 1px solid rgba(40, 167, 69, 0.2);
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .footer-email:hover {
            background: rgba(40, 167, 69, 0.2);
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
        
        .g-recaptcha {
            display: inline-block;
            transform: scale(0.95);
            transform-origin: center;
        }
        
        @media (max-width: 650px) {
            .modal-container {
                width: 95%;
                padding: 20px 15px;
            }
            
            .logo-title {
                font-size: 1.6rem;
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
                transform: scale(0.85);
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

    // Примечание о принятии условий
    const acceptNote = document.createElement('div');
    acceptNote.className = 'accept-note';
    acceptNote.textContent = texts[lang].acceptNote;

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

    // Блок аккаунта
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
    emailElement.title = lang === 'ru' ? 'Кликните чтобы скопировать' : 'Click to copy';
    
    emailElement.addEventListener('click', () => {
        navigator.clipboard.writeText(OFFICIAL_EMAIL).then(() => {
            const originalText = emailElement.textContent;
            emailElement.textContent = lang === 'ru' ? 'Скопировано!' : 'Copied!';
            emailElement.style.background = 'rgba(40, 167, 69, 0.3)';
            
            setTimeout(() => {
                emailElement.textContent = originalText;
                emailElement.style.background = 'rgba(40, 167, 69, 0.1)';
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
        if (!mainButton.disabled) {
            mainButton.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
        }
    }

    // Основная кнопка
    mainButton.addEventListener('click', () => {
        if (!ageConfirmed || !recaptchaVerified) {
            if (!recaptchaVerified) {
                recaptchaError.style.display = 'block';
                recaptchaSection.style.animation = 'shake 0.5s';
                setTimeout(() => recaptchaSection.style.animation = '', 500);
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
        mainButton.style.background = 'linear-gradient(135deg, var(--success), #20C997)';
        mainButton.textContent = lang === 'ru' ? '✓ Принято!' : '✓ Accepted!';
        mainButton.disabled = true;
        
        // Отправка токена на сервер (опционально)
        // fetch('/verify-recaptcha', {
        //     method: 'POST',
        //     body: JSON.stringify({ token: recaptchaResponse }),
        //     headers: { 'Content-Type': 'application/json' }
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
    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(ageSection);
    modal.appendChild(recaptchaSection);
    modal.appendChild(recaptchaError);
    modal.appendChild(mainButton);
    modal.appendChild(acceptNote);
    modal.appendChild(footerSection);
    
    overlay.appendChild(modal);

    // ===== АНИМАЦИЯ ПОЯВЛЕНИЯ =====
    setTimeout(() => {
        overlay.style.opacity = '1';
        
        // Последовательное появление элементов
        const elements = [header, content, ageSection, mainButton, acceptNote, footerSection];
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 200 + (index * 100));
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
