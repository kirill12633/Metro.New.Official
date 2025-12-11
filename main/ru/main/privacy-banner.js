document.addEventListener('DOMContentLoaded', function() {
    const MODAL_VERSION = '3.1';
    const REDIRECT_LOGO_URL = 'https://kirill12633.github.io/Metro.New.Official/main/ru/main/profile/metro-new-official-1.html';
    
    // Проверка локальной версии согласия
    let acceptedVersion = localStorage.getItem('privacy_modal_version');
    if (acceptedVersion === MODAL_VERSION) return;

    // Определяем язык (добавляем fallback на русский)
    let lang = navigator.language.startsWith('en') ? 'en' : 'ru';
    const savedLang = localStorage.getItem('preferred_lang');
    if (savedLang && ['en', 'ru'].includes(savedLang)) {
        lang = savedLang;
    }

    const texts = {
        ru: {
            title: 'Добро пожаловать в Метро New',
            message: `
                Для использования нашего приложения вы должны принять условия 
                <a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank" class="modal-link">Пользовательского соглашения</a> 
                и <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank" class="modal-link">Политики конфиденциальности</a>. 
                Мы собираем минимальные данные: IP и никнейм. Рекомендуемый возраст — от 13 лет.
            `,
            button: 'Согласен и продолжаю использовать',
            ageWarning: 'Если вам меньше 13 лет, пожалуйста, не используйте это приложение.'
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
            ageWarning: 'If you are under 13 years old, please do not use this application.'
        }
    };

    // Стили в CSS переменных для легкого управления
    const styles = {
        primaryColor: '#0066CC',
        accentColor: '#FFD700',
        successColor: '#28A745',
        warningColor: '#FF6B35',
        textDark: '#1A1A1A',
        textLight: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    };

    // Создаем и добавляем стили
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(3px);
        }
        
        .modal-container {
            background: white;
            border-radius: ${styles.borderRadius};
            padding: 30px 25px;
            max-width: 500px;
            width: 90%;
            box-shadow: ${styles.boxShadow};
            text-align: center;
            position: relative;
            font-family: 'Montserrat', 'Segoe UI', sans-serif;
            color: ${styles.textDark};
            transform: scale(0.9) translateY(20px);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .modal-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .modal-header:hover {
            transform: translateY(-2px);
        }
        
        .logo-title {
            font-size: 1.8rem;
            font-weight: 800;
            background: linear-gradient(135deg, ${styles.primaryColor}, #0099FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .verified-badge {
            font-size: 0.85rem;
            color: ${styles.successColor};
            font-weight: 600;
            padding: 4px 10px;
            background: rgba(40, 167, 69, 0.1);
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .verified-badge::before {
            content: '✓';
            font-weight: bold;
        }
        
        .modal-content {
            font-size: 14px;
            line-height: 1.6;
            color: #444;
            margin-bottom: 25px;
        }
        
        .modal-link {
            color: ${styles.primaryColor} !important;
            text-decoration: underline;
            font-weight: 600;
            transition: color 0.2s;
        }
        
        .modal-link:hover {
            color: #004C99 !important;
        }
        
        .age-warning {
            font-size: 12px;
            color: ${styles.warningColor};
            margin: 15px 0;
            padding: 8px 12px;
            background: rgba(255, 107, 53, 0.1);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .age-warning::before {
            content: '⚠';
            font-size: 14px;
        }
        
        .modal-button {
            padding: 14px 28px;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, ${styles.accentColor}, #FFE44D);
            color: ${styles.textDark};
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
            display: block;
        }
        
        .modal-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
        }
        
        .modal-button:active {
            transform: translateY(-1px);
        }
        
        .lang-selector {
            position: absolute;
            top: 15px;
            right: 15px;
            display: flex;
            gap: 5px;
        }
        
        .lang-btn {
            padding: 4px 10px;
            border: 2px solid ${styles.primaryColor};
            border-radius: 6px;
            background: white;
            color: ${styles.primaryColor};
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .lang-btn.active {
            background: ${styles.primaryColor};
            color: white;
        }
        
        .lang-btn:hover:not(.active) {
            background: rgba(0, 102, 204, 0.1);
        }
        
        .close-btn {
            position: absolute;
            top: 10px;
            left: 15px;
            background: none;
            border: none;
            font-size: 20px;
            color: #999;
            cursor: pointer;
            padding: 5px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            transition: all 0.2s;
        }
        
        .close-btn:hover {
            background: rgba(0, 0, 0, 0.05);
            color: #666;
        }
    `;
    document.head.appendChild(styleSheet);

    // Создаем overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);

    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal-container';
    
    // Кнопка закрытия (только скрывает, не сохраняет согласие)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.title = texts[lang].button;
    closeBtn.addEventListener('click', () => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.9) translateY(20px)';
        setTimeout(() => {
            overlay.remove();
            // Сохраняем время закрытия для таймера
            localStorage.setItem('modal_last_closed', Date.now().toString());
        }, 300);
    });

    // Селектор языка
    const langSelector = document.createElement('div');
    langSelector.className = 'lang-selector';

    ['ru', 'en'].forEach(l => {
        const btn = document.createElement('button');
        btn.className = `lang-btn ${l === lang ? 'active' : ''}`;
        btn.textContent = l.toUpperCase();
        btn.addEventListener('click', () => {
            lang = l;
            localStorage.setItem('preferred_lang', l);
            updateModalContent();
            // Обновляем активные кнопки
            langSelector.querySelectorAll('.lang-btn').forEach(b => {
                b.classList.toggle('active', b.textContent.toLowerCase() === l);
            });
        });
        langSelector.appendChild(btn);
    });

    // Заголовок с логотипом
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

    const warning = document.createElement('div');
    warning.className = 'age-warning';

    // Кнопка согласия
    const button = document.createElement('button');
    button.className = 'modal-button';

    function updateModalContent() {
        content.innerHTML = texts[lang].message;
        warning.textContent = texts[lang].ageWarning;
        button.textContent = texts[lang].button;
        verifiedBadge.textContent = lang === 'ru' ? 'Официально' : 'Official';
        closeBtn.title = texts[lang].button;
    }

    updateModalContent();

    button.addEventListener('click', () => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.9) translateY(20px)';
        setTimeout(() => {
            overlay.remove();
            localStorage.setItem('privacy_modal_version', MODAL_VERSION);
            // Также сохраняем выбранный язык
            localStorage.setItem('preferred_lang', lang);
            
            // Добавляем класс к body для возможных последующих стилей
            document.body.classList.add('privacy-accepted');
        }, 300);
    });

    // Добавляем элементы
    modal.appendChild(closeBtn);
    modal.appendChild(langSelector);
    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(warning);
    modal.appendChild(button);
    overlay.appendChild(modal);

    // Плавное появление
    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1) translateY(0)';
    }, 50);

    // Блокируем скролл на body при открытом модальном окне
    document.body.style.overflow = 'hidden';
    overlay.addEventListener('transitionend', function() {
        if (overlay.style.opacity === '0') {
            document.body.style.overflow = '';
        }
    });
});
