document.addEventListener('DOMContentLoaded', function() {
    const MODAL_VERSION = '1.0';
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
            title: 'Метро New',
            message: 'Для использования нашего приложения вы должны принять условия.',
            button: 'Принять и продолжить',
            buttonUnderage: 'Мне нет 13 лет',
            ageQuestion: 'Сколько вам лет?',
            exitWarning: 'Если вам нет 13 лет, приложение будет закрыто',
            supportTitle: 'Нужна помощь?',
            supportText: 'Если у вас есть вопросы, обратитесь в',
            supportLink: 'Службу поддержки',
            accountTitle: 'Создать аккаунт на сайте?',
            accountText: 'Если вы хотите создать свой аккаунт, напишите на почту:',
            recaptchaError: 'Подтвердите, что вы не робот',
            loading: 'Загрузка...',
            acceptNote: 'Нажимая "Принять", вы соглашаетесь с нашими условиями'
        },
        en: {
            title: 'Metro New',
            message: 'To use our app, you must accept the terms.',
            button: 'Accept and continue',
            buttonUnderage: "I'm under 13",
            ageQuestion: 'How old are you?',
            exitWarning: 'If you are under 13, the app will close',
            supportTitle: 'Need help?',
            supportText: 'If you have questions, contact',
            supportLink: 'Support Service',
            accountTitle: 'Create account on site?',
            accountText: 'If you want to create your account, write to email:',
            recaptchaError: 'Please confirm you are not a robot',
            loading: 'Loading...',
            acceptNote: 'By clicking "Accept", you agree to our terms'
        }
    };

    // ===== СОЗДАЕМ СТИЛИ =====
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        
        .modal-container {
            background: white;
            border-radius: 10px;
            padding: 25px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .modal-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
            cursor: pointer;
        }
        
        .logo-title {
            font-size: 24px;
            font-weight: bold;
            color: #0066CC;
        }
        
        .verified-badge {
            font-size: 12px;
            color: #28A745;
            font-weight: bold;
            padding: 4px 8px;
            background: rgba(40, 167, 69, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(40, 167, 69, 0.3);
        }
        
        .modal-content {
            font-size: 14px;
            line-height: 1.5;
            color: #333;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 3px solid #0066CC;
        }
        
        .modal-links {
            margin: 10px 0;
            font-size: 14px;
        }
        
        .modal-links a {
            color: #0066CC;
            text-decoration: none;
            font-weight: bold;
        }
        
        .modal-links a:hover {
            text-decoration: underline;
        }
        
        .age-check-section {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .age-question {
            font-size: 16px;
            font-weight: bold;
            color: #0066CC;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .age-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 10px;
        }
        
        .age-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.2s;
            flex: 1;
            max-width: 150px;
        }
        
        .age-btn.yes {
            background: #28A745;
            color: white;
        }
        
        .age-btn.no {
            background: #dc3545;
            color: white;
        }
        
        .age-btn:hover {
            opacity: 0.9;
        }
        
        .age-warning {
            font-size: 12px;
            color: #dc3545;
            text-align: center;
            font-weight: bold;
            margin-top: 5px;
        }
        
        .recaptcha-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            border: 1px solid #ddd;
            display: none;
            justify-content: center;
        }
        
        .recaptcha-error {
            color: #dc3545;
            font-size: 12px;
            text-align: center;
            margin-top: 5px;
            display: none;
        }
        
        .modal-button {
            width: 100%;
            padding: 12px;
            background: #0066CC;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin: 15px 0;
            transition: 0.2s;
        }
        
        .modal-button:hover:not(:disabled) {
            background: #0052a3;
        }
        
        .modal-button:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        
        .accept-note {
            font-size: 11px;
            color: #666;
            text-align: center;
            margin: 10px 0;
        }
        
        .footer-section {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        .support-block, .account-block {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
            font-size: 13px;
        }
        
        .footer-title {
            font-weight: bold;
            color: #0066CC;
            margin-bottom: 5px;
        }
        
        .footer-text {
            color: #555;
            margin-bottom: 5px;
        }
        
        .footer-link {
            color: #0066CC;
            font-weight: bold;
            text-decoration: none;
        }
        
        .footer-link:hover {
            text-decoration: underline;
        }
        
        .footer-email {
            color: #28A745;
            font-weight: bold;
            background: rgba(40, 167, 69, 0.1);
            padding: 5px 10px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 5px;
            cursor: pointer;
        }
        
        @media (max-width: 600px) {
            .modal-container {
                padding: 20px;
            }
            
            .age-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .age-btn {
                max-width: 100%;
                width: 100%;
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
            
            script.onload = resolve;
            script.onerror = resolve;
            
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
    logoTitle.textContent = texts[lang].title;

    const verifiedBadge = document.createElement('div');
    verifiedBadge.className = 'verified-badge';
    verifiedBadge.textContent = lang === 'ru' ? 'Официально' : 'Official';

    header.appendChild(logoTitle);
    header.appendChild(verifiedBadge);

    // Контент
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.textContent = texts[lang].message;
    
    // Ссылки
    const links = document.createElement('div');
    links.className = 'modal-links';
    links.innerHTML = lang === 'ru' 
        ? `<a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank">Пользовательское соглашение</a> | <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank">Политика конфиденциальности</a>`
        : `<a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank">Terms of Service</a> | <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank">Privacy Policy</a>`;

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

    // Recaptcha
    const recaptchaSection = document.createElement('div');
    recaptchaSection.className = 'recaptcha-section';
    recaptchaSection.id = 'recaptcha-container';
    
    const recaptchaError = document.createElement('div');
    recaptchaError.className = 'recaptcha-error';
    recaptchaError.textContent = texts[lang].recaptchaError;

    // Основная кнопка
    const mainButton = document.createElement('button');
    mainButton.className = 'modal-button';
    mainButton.textContent = texts[lang].button;
    mainButton.disabled = true;

    // Примечание
    const acceptNote = document.createElement('div');
    acceptNote.className = 'accept-note';
    acceptNote.textContent = texts[lang].acceptNote;

    // Футер
    const footerSection = document.createElement('div');
    footerSection.className = 'footer-section';

    // Поддержка
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

    // Аккаунт
    const accountBlock = document.createElement('div');
    accountBlock.className = 'account-block';
    
    const accountTitle = document.createElement('div');
    accountTitle.className = 'footer-title';
    accountTitle.textContent = texts[lang].accountTitle;
    
    const accountText = document.createElement('div');
    accountText.className = 'footer-text';
    accountText.textContent = texts[lang].accountText;
    
    const emailElement = document.createElement('div');
    emailElement.className = 'footer-email';
    emailElement.textContent = OFFICIAL_EMAIL;
    emailElement.title = lang === 'ru' ? 'Кликните чтобы скопировать' : 'Click to copy';
    
    emailElement.addEventListener('click', () => {
        navigator.clipboard.writeText(OFFICIAL_EMAIL).then(() => {
            const originalText = emailElement.textContent;
            emailElement.textContent = lang === 'ru' ? 'Скопировано!' : 'Copied!';
            setTimeout(() => {
                emailElement.textContent = originalText;
            }, 2000);
        });
    });
    
    accountBlock.appendChild(accountTitle);
    accountBlock.appendChild(accountText);
    accountBlock.appendChild(emailElement);

    // Собираем футер
    footerSection.appendChild(supportBlock);
    footerSection.appendChild(accountBlock);

    // Переменные состояния
    let ageConfirmed = false;
    let recaptchaWidgetId = null;

    // Инициализация Recaptcha
    function initRecaptcha() {
        if (!window.grecaptcha || !window.grecaptcha.render) {
            setTimeout(initRecaptcha, 100);
            return;
        }
        
        recaptchaWidgetId = grecaptcha.render(recaptchaSection, {
            sitekey: RECAPTCHA_SITE_KEY,
            theme: 'light',
            size: 'normal',
            callback: function() {
                mainButton.disabled = false;
                recaptchaError.style.display = 'none';
            },
            'expired-callback': function() {
                mainButton.disabled = true;
            },
            'error-callback': function() {
                recaptchaError.style.display = 'block';
                mainButton.disabled = true;
            }
        });
    }

    // Обработчики событий
    ageYesBtn.addEventListener('click', () => {
        ageConfirmed = true;
        ageSection.style.opacity = '0.6';
        ageSection.style.pointerEvents = 'none';
        
        recaptchaSection.style.display = 'flex';
        
        loadRecaptcha().then(() => {
            setTimeout(initRecaptcha, 500);
        });
    });

    ageNoBtn.addEventListener('click', () => {
        let seconds = 5;
        const timer = setInterval(() => {
            ageWarning.textContent = lang === 'ru'
                ? `Приложение закроется через ${seconds} секунд...`
                : `App will close in ${seconds} seconds...`;
            
            seconds--;
            
            if (seconds < 0) {
                clearInterval(timer);
                window.location.href = 'about:blank';
            }
        }, 1000);
    });

    mainButton.addEventListener('click', () => {
        if (!ageConfirmed || !grecaptcha || !grecaptcha.getResponse(recaptchaWidgetId)) {
            recaptchaError.style.display = 'block';
            return;
        }
        
        mainButton.textContent = lang === 'ru' ? '✓ Принято!' : '✓ Accepted!';
        mainButton.disabled = true;
        mainButton.style.background = '#28A745';
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
                
                localStorage.setItem('privacy_modal_version', MODAL_VERSION);
            }, 300);
        }, 800);
    });

    // Собираем модалку
    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(links);
    modal.appendChild(ageSection);
    modal.appendChild(recaptchaSection);
    modal.appendChild(recaptchaError);
    modal.appendChild(mainButton);
    modal.appendChild(acceptNote);
    modal.appendChild(footerSection);
    
    overlay.appendChild(modal);

    // Закрытие при клике на оверлей
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
