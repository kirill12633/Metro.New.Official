document.addEventListener('DOMContentLoaded', function() {
    const MODAL_VERSION = '1.1';
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
            message: 'Для использования приложения необходимо принять условия',
            button: 'Принять и продолжить',
            buttonUnderage: 'Мне нет 13 лет',
            ageQuestion: 'Сколько вам лет?',
            exitWarning: 'Приложение закроется через 5 секунд',
            supportTitle: 'Поддержка',
            supportText: 'Если есть вопросы, обращайтесь:',
            accountText: 'Для создания аккаунта пишите:',
            recaptchaError: 'Подтвердите, что вы не робот',
            acceptNote: 'Нажимая "Принять", вы соглашаетесь с нашими правилами'
        },
        en: {
            title: 'Metro New',
            message: 'To use the app you must accept the terms',
            button: 'Accept and continue',
            buttonUnderage: "I'm under 13",
            ageQuestion: 'How old are you?',
            exitWarning: 'App will close in 5 seconds',
            supportTitle: 'Support',
            supportText: 'If you have questions, contact:',
            accountText: 'To create an account write to:',
            recaptchaError: 'Confirm you are not a robot',
            acceptNote: 'By clicking "Accept" you agree to our rules'
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
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            padding: 20px;
            font-family: 'Arial', sans-serif;
            backdrop-filter: blur(5px);
        }
        
        .modal-container {
            background: linear-gradient(145deg, #ffffff, #f5f5f5);
            border-radius: 15px;
            padding: 30px;
            max-width: 450px;
            width: 100%;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25),
                        0 0 0 1px rgba(255, 255, 255, 0.1) inset;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(0, 102, 204, 0.2);
        }
        
        .modal-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #0066CC, #00CCFF, #0066CC);
        }
        
        .modal-header {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .logo-title {
            font-size: 32px;
            font-weight: 800;
            color: #0066CC;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 102, 204, 0.1);
            letter-spacing: -0.5px;
        }
        
        .logo-subtitle {
            font-size: 14px;
            color: #666;
            font-weight: 500;
        }
        
        .modal-content-box {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        }
        
        .modal-message {
            font-size: 15px;
            color: #333;
            line-height: 1.5;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .modal-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 15px 0;
        }
        
        .modal-links a {
            color: #0066CC;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            padding: 8px 15px;
            border-radius: 8px;
            background: rgba(0, 102, 204, 0.08);
            transition: all 0.2s;
        }
        
        .modal-links a:hover {
            background: rgba(0, 102, 204, 0.15);
            transform: translateY(-2px);
        }
        
        .age-section {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.1));
            border: 2px solid #FFD700;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .age-question {
            font-size: 18px;
            font-weight: 700;
            color: #0066CC;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .age-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 10px;
        }
        
        .age-btn {
            padding: 14px;
            border: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s;
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
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        .age-btn:active {
            transform: translateY(-1px);
        }
        
        .age-warning {
            font-size: 13px;
            color: #FF6B35;
            text-align: center;
            font-weight: 600;
            margin-top: 10px;
            background: rgba(255, 107, 53, 0.1);
            padding: 8px;
            border-radius: 8px;
        }
        
        .recaptcha-section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #dee2e6;
            display: none;
            justify-content: center;
            align-items: center;
            min-height: 80px;
        }
        
        .recaptcha-error {
            color: #dc3545;
            font-size: 13px;
            text-align: center;
            margin-top: 10px;
            font-weight: 600;
            display: none;
        }
        
        .main-button-container {
            margin: 25px 0 15px;
        }
        
        .main-button {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #0066CC, #0099FF);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 17px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 6px 20px rgba(0, 102, 204, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .main-button:hover:not(:disabled) {
            background: linear-gradient(135deg, #0052a3, #0088e6);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 102, 204, 0.4);
        }
        
        .main-button:disabled {
            background: linear-gradient(135deg, #6c757d, #868e96);
            cursor: not-allowed;
            transform: none !important;
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
        }
        
        .accept-note {
            font-size: 12px;
            color: #666;
            text-align: center;
            margin-top: 10px;
            font-style: italic;
        }
        
        .footer-section {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .footer-block {
            background: rgba(0, 102, 204, 0.05);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #0066CC;
        }
        
        .footer-title {
            font-size: 14px;
            font-weight: 700;
            color: #0066CC;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .footer-title::before {
            content: '💬';
        }
        
        .footer-text {
            font-size: 13px;
            color: #555;
            line-height: 1.5;
            margin-bottom: 8px;
        }
        
        .footer-link {
            color: #0066CC;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            padding: 2px 0;
            border-bottom: 1px dashed #0066CC;
            transition: all 0.2s;
        }
        
        .footer-link:hover {
            color: #004C99;
            border-bottom: 1px solid #004C99;
        }
        
        .footer-email {
            color: #28A745;
            font-weight: 600;
            background: rgba(40, 167, 69, 0.1);
            padding: 8px 12px;
            border-radius: 8px;
            display: inline-block;
            margin-top: 5px;
            font-family: monospace;
            font-size: 13px;
            border: 1px solid rgba(40, 167, 69, 0.2);
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .footer-email:hover {
            background: rgba(40, 167, 69, 0.2);
        }
        
        .success-text {
            color: #28A745;
            font-weight: 600;
            text-align: center;
            font-size: 15px;
            animation: fadeIn 0.3s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @media (max-width: 500px) {
            .modal-container {
                padding: 25px 20px;
            }
            
            .logo-title {
                font-size: 28px;
            }
            
            .age-buttons {
                grid-template-columns: 1fr;
                gap: 10px;
            }
            
            .modal-links {
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            
            .modal-links a {
                width: 100%;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(styleSheet);

    // ===== ЗАГРУЗКА RECAPTCHA =====
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
    
    const logoTitle = document.createElement('div');
    logoTitle.className = 'logo-title';
    logoTitle.textContent = texts[lang].title;
    
    const logoSubtitle = document.createElement('div');
    logoSubtitle.className = 'logo-subtitle';
    logoSubtitle.textContent = lang === 'ru' ? 'Официальный проект' : 'Official project';
    
    header.appendChild(logoTitle);
    header.appendChild(logoSubtitle);

    // Контент
    const contentBox = document.createElement('div');
    contentBox.className = 'modal-content-box';
    
    const message = document.createElement('div');
    message.className = 'modal-message';
    message.textContent = texts[lang].message;
    
    const links = document.createElement('div');
    links.className = 'modal-links';
    links.innerHTML = lang === 'ru' 
        ? `<a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank">Правила</a>
           <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank">Конфиденциальность</a>`
        : `<a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank">Rules</a>
           <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank">Privacy</a>`;
    
    contentBox.appendChild(message);
    contentBox.appendChild(links);

    // Возрастная проверка
    const ageSection = document.createElement('div');
    ageSection.className = 'age-section';
    
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
    
    const recaptchaError = document.createElement('div');
    recaptchaError.className = 'recaptcha-error';
    recaptchaError.textContent = texts[lang].recaptchaError;

    // Кнопка
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'main-button-container';
    
    const mainButton = document.createElement('button');
    mainButton.className = 'main-button';
    mainButton.textContent = texts[lang].button;
    mainButton.disabled = true;
    
    const acceptNote = document.createElement('div');
    acceptNote.className = 'accept-note';
    acceptNote.textContent = texts[lang].acceptNote;
    
    buttonContainer.appendChild(mainButton);
    buttonContainer.appendChild(acceptNote);

    // Футер
    const footerSection = document.createElement('div');
    footerSection.className = 'footer-section';
    
    // Поддержка
    const supportBlock = document.createElement('div');
    supportBlock.className = 'footer-block';
    
    const supportTitle = document.createElement('div');
    supportTitle.className = 'footer-title';
    supportTitle.textContent = texts[lang].supportTitle;
    
    const supportText = document.createElement('div');
    supportText.className = 'footer-text';
    supportText.innerHTML = `${texts[lang].supportText} <a href="${SUPPORT_URL}" target="_blank" class="footer-link">Support</a>`;
    
    supportBlock.appendChild(supportTitle);
    supportBlock.appendChild(supportText);
    
    // Email
    const accountBlock = document.createElement('div');
    accountBlock.className = 'footer-block';
    
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
            emailElement.textContent = lang === 'ru' ? '✓ Скопировано!' : '✓ Copied!';
            emailElement.style.background = 'rgba(40, 167, 69, 0.2)';
            setTimeout(() => {
                emailElement.textContent = originalText;
                emailElement.style.background = 'rgba(40, 167, 69, 0.1)';
            }, 2000);
        });
    });
    
    accountBlock.appendChild(accountText);
    accountBlock.appendChild(emailElement);
    
    footerSection.appendChild(supportBlock);
    footerSection.appendChild(accountBlock);

    // Переменные
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

    // Обработчики
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
        ageWarning.classList.add('age-warning');
        
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
            recaptchaSection.style.border = '1px solid #dc3545';
            setTimeout(() => {
                recaptchaSection.style.border = '1px solid #dee2e6';
            }, 1000);
            return;
        }
        
        mainButton.textContent = lang === 'ru' ? '✓ Принято!' : '✓ Accepted!';
        mainButton.disabled = true;
        mainButton.style.background = 'linear-gradient(135deg, #28A745, #20C997)';
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
                
                localStorage.setItem('privacy_modal_version', MODAL_VERSION);
                localStorage.setItem('age_verified', 'true');
                localStorage.setItem('agreement_date', new Date().toISOString());
            }, 300);
        }, 800);
    });

    // Сборка
    modal.appendChild(header);
    modal.appendChild(contentBox);
    modal.appendChild(ageSection);
    modal.appendChild(recaptchaSection);
    modal.appendChild(recaptchaError);
    modal.appendChild(buttonContainer);
    modal.appendChild(footerSection);
    
    overlay.appendChild(modal);

    // Закрытие
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
