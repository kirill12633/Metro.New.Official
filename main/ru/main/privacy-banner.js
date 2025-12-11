document.addEventListener('DOMContentLoaded', function() {
    const MODAL_VERSION = '3.2';
    const REDIRECT_LOGO_URL = 'https://kirill12633.github.io/Metro.New.Official/main/ru/main/profile/metro-new-official-1.html';
    
    // Проверка локальной версии согласия
    let acceptedVersion = localStorage.getItem('privacy_modal_version');
    if (acceptedVersion === MODAL_VERSION) return;

    // Проверяем, не был ли показан сегодня (анти-спам)
    const lastShownToday = localStorage.getItem('modal_shown_date');
    if (lastShownToday === new Date().toDateString()) {
        const showCount = parseInt(localStorage.getItem('modal_show_count') || '0');
        if (showCount > 3) return; // Максимум 3 показа в день
    }

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
            captchaTitle: 'Подтвердите, что вы не робот',
            captchaPlaceholder: 'Введите цифры',
            captchaError: 'Неверный код',
            captchaRefresh: 'Обновить код',
            securityNote: 'Ваши данные защищены',
            exitWarning: 'Если вам нет 13 лет, приложение будет закрыто'
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
            captchaTitle: 'Verify you are human',
            captchaPlaceholder: 'Enter the numbers',
            captchaError: 'Incorrect code',
            captchaRefresh: 'Refresh code',
            securityNote: 'Your data is protected',
            exitWarning: 'If you are under 13, the app will close'
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
            max-width: 480px;
            width: 90%;
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
        }
        
        .modal-header:hover {
            transform: translateY(-3px);
        }
        
        .logo-title {
            font-size: 2rem;
            font-weight: 900;
            background: linear-gradient(135deg, #0066CC, #0099FF, #00CCFF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 4px rgba(0, 102, 204, 0.1);
            letter-spacing: -0.5px;
        }
        
        .verified-badge {
            font-size: 0.85rem;
            color: #28A745;
            font-weight: 700;
            padding: 5px 12px;
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
            max-width: 200px;
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
        
        .captcha-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #dee2e6;
        }
        
        .captcha-title {
            font-size: 16px;
            font-weight: 700;
            color: #1A1A1A;
            margin-bottom: 15px;
        }
        
        .captcha-container {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .captcha-code {
            flex: 1;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 5px;
            color: #0066CC;
            background: white;
            padding: 15px;
            border-radius: 10px;
            border: 2px solid #0066CC;
            user-select: none;
            text-decoration: line-through;
            transform: rotate(-2deg);
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
        }
        
        .captcha-input {
            flex: 2;
            padding: 12px 15px;
            border: 2px solid #dee2e6;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s;
        }
        
        .captcha-input:focus {
            outline: none;
            border-color: #0066CC;
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }
        
        .captcha-input.error {
            border-color: #dc3545;
            animation: shake 0.5s ease;
        }
        
        .captcha-refresh {
            background: none;
            border: none;
            color: #0066CC;
            font-size: 20px;
            cursor: pointer;
            padding: 10px;
            border-radius: 50%;
            transition: all 0.3s;
        }
        
        .captcha-refresh:hover {
            background: rgba(0, 102, 204, 0.1);
            transform: rotate(180deg);
        }
        
        .captcha-error {
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
            max-width: 350px;
            margin: 20px auto 0;
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
    `;
    document.head.appendChild(styleSheet);

    // ===== СОЗДАЕМ МОДАЛЬНОЕ ОКНО =====
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    // Защита от инспектора кода
    overlay.addEventListener('contextmenu', e => e.preventDefault());
    overlay.addEventListener('keydown', e => {
        if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'i')) {
            e.preventDefault();
        }
    });

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

    // Контент
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

    // ===== КАПЧА =====
    const captchaSection = document.createElement('div');
    captchaSection.className = 'captcha-section';
    captchaSection.style.display = 'none';

    const captchaTitle = document.createElement('div');
    captchaTitle.className = 'captcha-title';
    captchaTitle.textContent = texts[lang].captchaTitle;

    const captchaContainer = document.createElement('div');
    captchaContainer.className = 'captcha-container';

    const captchaCode = document.createElement('div');
    captchaCode.className = 'captcha-code';
    
    const captchaInput = document.createElement('input');
    captchaInput.className = 'captcha-input';
    captchaInput.type = 'text';
    captchaInput.inputMode = 'numeric';
    captchaInput.maxLength = 5;
    captchaInput.placeholder = texts[lang].captchaPlaceholder;

    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'captcha-refresh';
    refreshBtn.innerHTML = '↻';
    refreshBtn.title = texts[lang].captchaRefresh;

    const captchaError = document.createElement('div');
    captchaError.className = 'captcha-error';
    captchaError.textContent = texts[lang].captchaError;

    captchaContainer.appendChild(captchaCode);
    captchaContainer.appendChild(captchaInput);
    captchaContainer.appendChild(refreshBtn);
    
    captchaSection.appendChild(captchaTitle);
    captchaSection.appendChild(captchaContainer);
    captchaSection.appendChild(captchaError);

    // ===== ОСНОВНАЯ КНОПКА =====
    const mainButton = document.createElement('button');
    mainButton.className = 'modal-button';
    mainButton.textContent = texts[lang].button;
    mainButton.disabled = true;

    // ===== ГЕНЕРАТОР КАПЧИ =====
    function generateCaptcha() {
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += Math.floor(Math.random() * 10);
        }
        captchaCode.textContent = code;
        captchaInput.value = '';
        captchaError.style.display = 'none';
        captchaInput.classList.remove('error');
        return code;
    }

    let currentCaptcha = generateCaptcha();
    let ageConfirmed = false;
    let captchaSolved = false;

    // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
    ageYesBtn.addEventListener('click', () => {
        ageConfirmed = true;
        ageSection.style.opacity = '0.6';
        ageSection.style.pointerEvents = 'none';
        
        // Показываем капчу через 0.5 секунды
        setTimeout(() => {
            captchaSection.style.display = 'block';
            setTimeout(() => {
                captchaSection.style.opacity = '1';
                captchaSection.style.transform = 'translateY(0)';
            }, 10);
            captchaInput.focus();
        }, 500);
        
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

    refreshBtn.addEventListener('click', () => {
        currentCaptcha = generateCaptcha();
        captchaInput.focus();
    });

    captchaInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
        if (e.target.value === currentCaptcha) {
            captchaSolved = true;
            captchaInput.classList.remove('error');
            captchaError.style.display = 'none';
            checkFormCompletion();
        } else if (e.target.value.length === 5) {
            captchaSolved = false;
            captchaInput.classList.add('error');
            captchaError.style.display = 'block';
            mainButton.classList.add('shake');
            setTimeout(() => mainButton.classList.remove('shake'), 500);
        }
    });

    // Проверка готовности формы
    function checkFormCompletion() {
        mainButton.disabled = !(ageConfirmed && captchaSolved);
    }

    // Основная кнопка
    mainButton.addEventListener('click', () => {
        if (!ageConfirmed || !captchaSolved) return;
        
        // Анимация принятия
        mainButton.style.background = 'linear-gradient(135deg, #28A745, #20C997)';
        mainButton.textContent = lang === 'ru' ? '✓ Принято!' : '✓ Accepted!';
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
                
                // Сохраняем в localStorage
                localStorage.setItem('privacy_modal_version', MODAL_VERSION);
                localStorage.setItem('age_verified', 'true');
                localStorage.setItem('verification_timestamp', Date.now().toString());
                
                // Счетчик показов
                const today = new Date().toDateString();
                if (localStorage.getItem('modal_shown_date') === today) {
                    const count = parseInt(localStorage.getItem('modal_show_count') || '0') + 1;
                    localStorage.setItem('modal_show_count', count.toString());
                } else {
                    localStorage.setItem('modal_shown_date', today);
                    localStorage.setItem('modal_show_count', '1');
                }
                
                // Добавляем аудио-эффект (опционально)
                try {
                    const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
                    audio.volume = 0.3;
                    audio.play();
                } catch (e) {}
                
            }, 300);
        }, 500);
    });

    // ===== СОБИРАЕМ МОДАЛКУ =====
    modal.appendChild(securityBadge);
    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(ageSection);
    modal.appendChild(captchaSection);
    modal.appendChild(mainButton);
    overlay.appendChild(modal);

    // ===== АНИМАЦИЯ ПОЯВЛЕНИЯ =====
    setTimeout(() => {
        overlay.style.opacity = '1';
        
        // Последовательное появление элементов
        const elements = [header, content, ageSection, mainButton];
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 300 + (index * 150));
        });
        
        // Защита от копирования
        document.addEventListener('copy', (e) => {
            e.clipboardData.setData('text/plain', 'Копирование запрещено');
            e.preventDefault();
        });
        
    }, 100);
});
