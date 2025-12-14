document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // --- КОНСТАНТЫ ---
    const MODAL_VERSION = '0.2';
    const REDIRECT_LOGO_URL = 'https://kirill12633.github.io/Metro.New.Official/main/ru/profile/metro-new-official-1.html';
    const SUPPORT_URL = 'https://kirill12633.github.io/support.metro.new/';
    const OFFICIAL_EMAIL = 'metro.new.help@gmail.com';
    const RECAPTCHA_SITE_KEY = '6Lfr5g0sAAAAANmMqIPHhQ6pvNa3YnVcXs3A4eR2';

    // --- ПРОВЕРКА СОГЛАСИЯ И ЯЗЫК ---
    if (localStorage.getItem('privacy_modal_version') === MODAL_VERSION) {
        return;
    }

    const lang = navigator.language.startsWith('en') ? 'en' : 'ru';

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
            loading: 'Загрузка...',
            exitTimer: (seconds) => `Приложение закроется через ${seconds} секунд...`,
            exitInitial: 'Приложение закроется через 5 секунд...',
            accepted: '✓ Принято!',
            copyTip: 'Кликните чтобы скопировать',
            copied: 'Скопировано!'
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
            loading: 'Loading...',
            exitTimer: (seconds) => `App will close in ${seconds} seconds...`,
            exitInitial: 'App will close in 5 seconds...',
            accepted: '✓ Accepted!',
            copyTip: 'Click to copy',
            copied: 'Copied!'
        }
    };

    const t = (key) => texts[lang][key];
    const t_exit_timer = (seconds) => texts[lang].exitTimer(seconds);

    // --- СОСТОЯНИЕ ---
    let ageConfirmed = false;
    let recaptchaVerified = false;
    let recaptchaWidgetId = null;

    // --- ФУНКЦИИ УТИЛИТЫ ---

    // 1. Вставляет стили
    function injectStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            /* Анимации */
            @keyframes floatIn { 0% { opacity: 0; transform: scale(0.8) translateY(50px) rotateX(15deg); } 70% { opacity: 1; transform: scale(1.02) translateY(-5px) rotateX(0deg); } 100% { opacity: 1; transform: scale(1) translateY(0) rotateX(0deg); } }
            @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(0, 102, 204, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0); } }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
            @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }

            /* Основные стили модального окна */
            .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); display: flex; align-items: center; justify-content: center; z-index: 10000; opacity: 0; transition: opacity 0.5s ease; backdrop-filter: blur(10px); perspective: 1000px; }
            .modal-container { background: linear-gradient(145deg, #ffffff, #f5f5f5); border-radius: 20px; padding: 40px 35px; max-width: 600px; width: 92%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset; text-align: center; position: relative; font-family: 'Montserrat', 'Segoe UI', system-ui, sans-serif; color: #1A1A1A; transform-origin: center; animation: floatIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; border: 1px solid rgba(0, 102, 204, 0.1); max-height: 90vh; overflow-y: auto; }

            /* Бейдж безопасности */
            .security-badge { position: absolute; top: 15px; left: 15px; display: flex; align-items: center; gap: 6px; font-size: 11px; color: #28A745; font-weight: 600; background: rgba(40, 167, 69, 0.1); padding: 4px 10px; border-radius: 20px; animation: pulse 2s infinite; z-index: 2; }
            .security-badge::before { content: '🔒'; font-size: 10px; }

            /* Заголовок */
            .modal-header { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 25px; cursor: pointer; transition: all 0.3s ease; padding-top: 10px; }
            .modal-header:hover { transform: translateY(-3px); }
            .logo-title { font-size: 2.2rem; font-weight: 900; background: linear-gradient(135deg, #0066CC, #0099FF, #00CCFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 2px 4px rgba(0, 102, 204, 0.1); letter-spacing: -0.5px; }
            .verified-badge { font-size: 0.9rem; color: #28A745; font-weight: 700; padding: 6px 14px; background: rgba(40, 167, 69, 0.15); border-radius: 20px; display: flex; align-items: center; gap: 5px; border: 1px solid rgba(40, 167, 69, 0.3); }
            .verified-badge::before { content: '✓'; font-weight: bold; font-size: 16px; }

            /* Возрастная секция */
            .age-check-section { background: rgba(255, 215, 0, 0.1); border-radius: 15px; padding: 20px; margin: 20px 0; border: 2px dashed #FFD700; animation: slideDown 0.5s ease forwards; }
            .age-question { font-size: 18px; font-weight: 700; color: #0066CC; margin-bottom: 15px; }
            .age-buttons { display: flex; gap: 15px; justify-content: center; margin-bottom: 10px; }
            .age-btn { padding: 12px 25px; border: none; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease; flex: 1; max-width: 220px; }
            .age-btn.yes { background: linear-gradient(135deg, #28A745, #20C997); color: white; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); }
            .age-btn.no { background: linear-gradient(135deg, #FF6B35, #FF8E53); color: white; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3); }
            .age-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2); }
            .age-btn:active { transform: translateY(-1px); }
            .age-warning { font-size: 12px; color: #FF6B35; margin-top: 10px; font-weight: 600; }
            .exit-timer { font-size: 11px; color: #FF6B35; font-weight: 700; margin-top: 10px; background: rgba(255, 107, 53, 0.1); padding: 5px 10px; border-radius: 10px; display: inline-block; }

            /* reCAPTCHA */
            .recaptcha-section { background: #f8f9fa; border-radius: 15px; padding: 20px; margin: 20px 0; border: 1px solid #dee2e6; min-height: 80px; display: flex; align-items: center; justify-content: center; display: none; opacity: 0; transition: opacity 0.5s ease, transform 0.5s ease; transform: translateY(20px); }
            .recaptcha-error { color: #dc3545; font-size: 12px; font-weight: 600; margin-top: 5px; display: none; }
            .g-recaptcha { transform: scale(1.1); transform-origin: center; }

            /* Контент */
            .modal-content { font-size: 14px; line-height: 1.6; color: #495057; margin-bottom: 25px; text-align: left; padding: 0 5px; }
            .modal-link { color: #0066CC; font-weight: 600; text-decoration: none; border-bottom: 1px dashed #0066CC; transition: border-bottom 0.2s; }
            .modal-link:hover { border-bottom: 1px solid #0066CC; }

            /* Кнопка */
            .modal-button { padding: 16px 32px; border: none; border-radius: 12px; background: linear-gradient(135deg, #FFD700, #FFC107); color: #1A1A1A; font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3); width: 100%; max-width: 400px; margin: 25px auto 30px; display: block; position: relative; overflow: hidden; }
            .modal-button::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient( to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100% ); transform: rotate(30deg); transition: transform 0.6s; }
            .modal-button:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4); }
            .modal-button:hover::after { transform: rotate(30deg) translateX(100%); }
            .modal-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; box-shadow: none; }
            .shake { animation: shake 0.5s ease; }

            /* Футер */
            .footer-section { margin-top: 30px; padding-top: 25px; border-top: 1px solid #e9ecef; text-align: left; }
            .support-block, .account-block { background: rgba(0, 102, 204, 0.05); border-radius: 12px; padding: 18px; margin-bottom: 20px; border-left: 4px solid #0066CC; }
            .account-block { border-left: 4px solid #28A745; background: rgba(40, 167, 69, 0.05); }
            .support-block .footer-title { color: #0066CC; }
            .account-block .footer-title { color: #28A745; }
            .footer-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
            .support-block .footer-title::before { content: '💬'; font-size: 14px; }
            .account-block .footer-title::before { content: '👤'; }
            .footer-text { font-size: 13px; color: #495057; line-height: 1.5; margin-bottom: 8px; }
            .footer-link { color: #0066CC; font-weight: 600; text-decoration: none; transition: all 0.2s; display: inline-block; padding: 2px 0; border-bottom: 1px dashed #0066CC; }
            .footer-link:hover { color: #004C99; border-bottom: 1px solid #004C99; }
            .footer-email { color: #28A745; font-weight: 600; font-family: monospace; background: rgba(40, 167, 69, 0.1); padding: 4px 8px; border-radius: 6px; display: inline-block; margin-top: 5px; font-size: 12px; border: 1px solid rgba(40, 167, 69, 0.2); }

            /* Загрузка */
            .loading-dots { display: inline-block; font-size: 20px; letter-spacing: 2px; }
            .loading-dots span { animation: blink 1.4s infinite; animation-fill-mode: both; }
            .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
            .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

            /* Адаптивность */
            @media (max-width: 650px) {
                .modal-container { width: 95%; padding: 30px 20px; }
                .logo-title { font-size: 1.8rem; }
                .age-buttons { flex-direction: column; align-items: center; }
                .age-btn { max-width: 100%; width: 100%; }
                .g-recaptcha { transform: scale(0.9); }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // 2. Загружает reCAPTCHA
    function loadRecaptchaScript() {
        return new Promise((resolve) => {
            if (window.grecaptcha) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=explicit&hl=${lang}`;
            script.async = true;
            script.defer = true;
            script.onload = () => setTimeout(resolve, 500); // Даем время для инициализации
            script.onerror = () => {
                console.error('Failed to load reCAPTCHA');
                resolve(); // Продолжаем даже при ошибке, но recaptchaVerified останется false
            };
            document.head.appendChild(script);
        });
    }

    // 3. Устанавливает reCAPTCHA
    function initRecaptcha(containerElement) {
        if (!window.grecaptcha || !window.grecaptcha.render) {
            // Если скрипт загрузился, но API еще не готово, пробуем снова
            setTimeout(() => initRecaptcha(containerElement), 100);
            return;
        }

        containerElement.innerHTML = ''; // Очистка заглушки
        recaptchaWidgetId = grecaptcha.render(containerElement, {
            sitekey: RECAPTCHA_SITE_KEY,
            theme: 'light',
            size: 'normal',
            callback: (response) => {
                recaptchaVerified = true;
                document.getElementById('recaptcha-error').style.display = 'none';
                checkFormCompletion();
            },
            'expired-callback': () => {
                recaptchaVerified = false;
                checkFormCompletion();
            },
            'error-callback': () => {
                recaptchaVerified = false;
                document.getElementById('recaptcha-error').style.display = 'block';
                checkFormCompletion();
            }
        });
    }

    // 4. Проверяет готовность формы
    function checkFormCompletion(button) {
        button.disabled = !(ageConfirmed && recaptchaVerified);
    }

    // 5. Создает и показывает модальное окно
    function createAndShowModal() {
        // --- ПОСТРОЕНИЕ HTML ---
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container">
                    <div class="security-badge">${t('securityNote')}</div>

                    <div class="modal-header">
                        <div class="logo-title">Метро New</div>
                        <div class="verified-badge">${lang === 'ru' ? 'Официально' : 'Official'}</div>
                    </div>

                    <div class="modal-content">
                        ${t('message')}
                    </div>

                    <div id="age-check-section" class="age-check-section">
                        <div class="age-question">${t('ageQuestion')}</div>
                        <div class="age-buttons">
                            <button id="age-yes-btn" class="age-btn yes">13+</button>
                            <button id="age-no-btn" class="age-btn no">${t('buttonUnderage')}</button>
                        </div>
                        <div id="age-warning" class="age-warning">${t('exitWarning')}</div>
                    </div>

                    <div id="recaptcha-container" class="recaptcha-section">
                        <div class="loading-dots"><span>.</span><span>.</span><span>.</span></div>
                    </div>
                    <div id="recaptcha-error" class="recaptcha-error">${t('recaptchaError')}</div>

                    <button id="main-button" class="modal-button" disabled>${t('button')}</button>

                    <div class="footer-section">
                        <div class="support-block">
                            <div class="footer-title">${t('supportTitle')}</div>
                            <div class="footer-text">
                                ${t('supportText')} <a href="${SUPPORT_URL}" target="_blank" class="footer-link">${t('supportLink')}</a>
                            </div>
                        </div>
                        <div class="account-block">
                            <div class="footer-title">${t('accountTitle')}</div>
                            <div class="footer-text">${t('accountText')}</div>
                            <div id="email-element" class="footer-email" title="${t('copyTip')}">${OFFICIAL_EMAIL}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Вставка HTML и получение ссылок на элементы
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const overlay = document.querySelector('.modal-overlay');
        const ageSection = document.getElementById('age-check-section');
        const ageYesBtn = document.getElementById('age-yes-btn');
        const ageNoBtn = document.getElementById('age-no-btn');
        const ageWarning = document.getElementById('age-warning');
        const recaptchaSection = document.getElementById('recaptcha-container');
        const recaptchaError = document.getElementById('recaptcha-error');
        const mainButton = document.getElementById('main-button');
        const header = document.querySelector('.modal-header');
        const emailElement = document.getElementById('email-element');
        const modalContainer = document.querySelector('.modal-container');
        const modalElements = [header, document.querySelector('.modal-content'), ageSection, document.querySelector('.footer-section'), mainButton];

        document.body.style.overflow = 'hidden';

        // --- ОБРАБОТЧИКИ СОБЫТИЙ ---

        // Обработчик "Да, мне 13+"
        ageYesBtn.addEventListener('click', () => {
            if (ageConfirmed) return; // Защита от двойного клика
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
            loadRecaptchaScript().then(() => {
                initRecaptcha(recaptchaSection);
            });

            checkFormCompletion(mainButton);
        });

        // Обработчик "Мне нет 13"
        ageNoBtn.addEventListener('click', () => {
            ageWarning.textContent = t('exitInitial');
            ageWarning.classList.add('exit-timer');

            let seconds = 5;
            const timer = setInterval(() => {
                seconds--;
                ageWarning.textContent = t_exit_timer(seconds);

                if (seconds <= 0) {
                    clearInterval(timer);
                    window.location.href = 'about:blank'; // Самый безопасный способ закрыть/перенаправить
                }
            }, 1000);
            
            ageSection.style.pointerEvents = 'none';
            ageYesBtn.disabled = true;
            ageNoBtn.disabled = true;
        });

        // Обработчик копирования email
        emailElement.addEventListener('click', () => {
            navigator.clipboard.writeText(OFFICIAL_EMAIL).then(() => {
                const originalText = emailElement.textContent;
                emailElement.textContent = t('copied');
                emailElement.style.background = 'rgba(40, 167, 69, 0.2)';
                emailElement.style.color = '#28A745';

                setTimeout(() => {
                    emailElement.textContent = originalText;
                    emailElement.style.background = 'rgba(40, 167, 69, 0.1)';
                    emailElement.style.color = '#28A745';
                }, 2000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        });

        // Обработчик основной кнопки
        mainButton.addEventListener('click', () => {
            if (!ageConfirmed || !recaptchaVerified) {
                if (!recaptchaVerified) {
                    recaptchaError.style.display = 'block';
                    mainButton.classList.add('shake');
                    setTimeout(() => mainButton.classList.remove('shake'), 500);
                }
                return;
            }

            // Финальная проверка reCAPTCHA
            const recaptchaResponse = grecaptcha.getResponse(recaptchaWidgetId);
            if (!recaptchaResponse) {
                recaptchaError.style.display = 'block';
                mainButton.classList.add('shake');
                setTimeout(() => mainButton.classList.remove('shake'), 500);
                return;
            }

            // Анимация принятия
            mainButton.style.background = 'linear-gradient(135deg, #28A745, #20C997)';
            mainButton.textContent = t('accepted');
            mainButton.disabled = true;

            // ... Здесь можно отправить токен на сервер ...

            // Закрытие модального окна и сохранение
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

                }, 500); // Увеличен таймаут для плавного исчезновения
            }, 800);
        });

        // Обработчик клика по заголовку
        header.addEventListener('click', () => {
             window.open(REDIRECT_LOGO_URL, '_blank');
        });

        // Обработчик закрытия по клику вне модального окна
        overlay.addEventListener('click', (e) => {
             if (e.target === overlay) {
                // Если пользователь кликает вне модального окна, и он не "под 13", просто скрываем
                if (mainButton.disabled) {
                    // Если форма не заполнена (кнопка disabled), то не позволяем закрыть, чтобы не обойти проверку
                    modalContainer.classList.add('shake');
                    setTimeout(() => modalContainer.classList.remove('shake'), 500);
                    return;
                }
                
                 overlay.style.opacity = '0';
                 setTimeout(() => {
                     overlay.remove();
                     document.body.style.overflow = '';
                 }, 300);
             }
         });


        // --- АНИМАЦИЯ ПОЯВЛЕНИЯ ---
        setTimeout(() => {
            overlay.style.opacity = '1';

            // Последовательное появление элементов
            modalElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    el.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 300 + (index * 150));
            });

        }, 100);
    }

    // --- ЗАПУСК ---
    injectStyles();
    createAndShowModal();
});
