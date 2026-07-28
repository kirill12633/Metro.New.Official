// lang-selector.js - Выбор языка с таймером 24 часа

(function() {
    'use strict';

    console.log('🌐 Language Selector загружен');

    // ========== КОНФИГ ==========
    const CONFIG = {
        // Ключи для localStorage
        STORAGE_KEY: 'metro_lang_selected',
        TIMER_KEY: 'metro_lang_timer_start',
        HIDE_KEY: 'metro_lang_hidden',

        // Таймер (24 часа в миллисекундах)
        TIMER_DURATION: 24 * 60 * 60 * 1000,

        // Доступные языки
        languages: {
            ru: { name: 'Русский', flag: '🇷🇺', available: true },
            en: { name: 'English', flag: '🇬🇧', available: true },
            uk: { name: 'Українська', flag: '🇺🇦', available: false },
            kk: { name: 'Қазақша', flag: '🇰🇿', available: false },
            be: { name: 'Беларуская', flag: '🇧🇾', available: false },
            de: { name: 'Deutsch', flag: '🇩🇪', available: false },
            es: { name: 'Español', flag: '🇪🇸', available: false },
            fr: { name: 'Français', flag: '🇫🇷', available: false },
            zh: { name: '中文', flag: '🇨🇳', available: false },
            ja: { name: '日本語', flag: '🇯🇵', available: false }
        },

        // Соответствие языков для переадресации
        paths: {
            ru: 'https://kirill12633.github.io/Metro.New.Official/ru/',
            en: 'https://kirill12633.github.io/Metro.New.Official/en/',
            uk: 'https://kirill12633.github.io/Metro.New.Official/uk/',
            kk: 'https://kirill12633.github.io/Metro.New.Official/kk/',
            be: 'https://kirill12633.github.io/Metro.New.Official/be/',
            de: 'https://kirill12633.github.io/Metro.New.Official/de/',
            es: 'https://kirill12633.github.io/Metro.New.Official/es/',
            fr: 'https://kirill12633.github.io/Metro.New.Official/fr/',
            zh: 'https://kirill12633.github.io/Metro.New.Official/zh/',
            ja: 'https://kirill12633.github.io/Metro.New.Official/ja/'
        }
    };

    // ========== ОСНОВНЫЕ ФУНКЦИИ ==========

    // Получить сохранённый язык
    function getSavedLanguage() {
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEY);
        } catch(e) {
            return null;
        }
    }

    // Сохранить язык
    function saveLanguage(lang) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, lang);
            localStorage.setItem(CONFIG.TIMER_KEY, Date.now().toString());
            return true;
        } catch(e) {
            return false;
        }
    }

    // Получить время начала таймера
    function getTimerStart() {
        try {
            return parseInt(localStorage.getItem(CONFIG.TIMER_KEY), 10);
        } catch(e) {
            return null;
        }
    }

    // Проверить, прошло ли 24 часа
    function isTimerExpired() {
        const timerStart = getTimerStart();
        if (!timerStart) return true;
        return (Date.now() - timerStart) >= CONFIG.TIMER_DURATION;
    }

    // Проверить, нужно ли показывать модалку
    function shouldShowModal() {
        const savedLang = getSavedLanguage();

        // Если язык не выбран — показываем
        if (!savedLang) return true;

        // Если таймер истёк — показываем
        if (isTimerExpired()) return true;

        // Иначе не показываем
        return false;
    }

    // Получить язык браузера
    function getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        if (browserLang.startsWith('ru')) return 'ru';
        if (browserLang.startsWith('uk')) return 'uk';
        if (browserLang.startsWith('kk')) return 'kk';
        if (browserLang.startsWith('be')) return 'be';
        if (browserLang.startsWith('de')) return 'de';
        if (browserLang.startsWith('es')) return 'es';
        if (browserLang.startsWith('fr')) return 'fr';
        if (browserLang.startsWith('zh')) return 'zh';
        if (browserLang.startsWith('ja')) return 'ja';
        return 'en';
    }

    // ========== ПЕРЕАДРЕСАЦИЯ ==========

    function redirectToLanguage(lang) {
        const targetUrl = CONFIG.paths[lang];
        if (!targetUrl) return false;

        const currentUrl = window.location.href;
        if (currentUrl.includes(CONFIG.paths[lang]) || currentUrl === targetUrl) {
            return false;
        }

        // Не перенаправляем на странице выбора языка
        if (currentUrl.includes('/language/')) {
            return false;
        }

        window.location.href = targetUrl;
        return true;
    }

    // ========== ВЫБОР ЯЗЫКА ==========

    function selectLanguage(lang) {
        const langData = CONFIG.languages[lang];
        if (!langData) return;

        // Проверяем доступность
        if (!langData.available) {
            showToast('🚧 Этот язык пока в разработке', 'warning');
            return;
        }

        // Сохраняем язык
        saveLanguage(lang);

        // Скрываем модалку
        hideModal();

        // Показываем уведомление
        showToast(`🌐 Выбран язык: ${langData.name}`, 'success');

        // Перенаправляем
        setTimeout(() => {
            redirectToLanguage(lang);
        }, 500);
    }

    // ========== МОДАЛЬНОЕ ОКНО ==========

    function createModal() {
        // Удаляем старую модалку если есть
        const oldModal = document.getElementById('metroLangModal');
        if (oldModal) oldModal.remove();

        // Строим список языков
        let langHTML = '';
        for (const [code, data] of Object.entries(CONFIG.languages)) {
            const status = data.available ? '✅' : '🚧';
            const statusClass = data.available ? '' : 'disabled';
            langHTML += `
                <button class="lang-btn ${statusClass}" onclick="window.LangSelector.select('${code}')">
                    <span class="flag">${data.flag}</span>
                    ${data.name}
                    <span class="status ${data.available ? '' : 'dev'}">${status}</span>
                </button>
            `;
        }

        const modalHTML = `
            <div id="metroLangModal" class="lang-overlay active">
                <div class="lang-modal">
                    <div class="lang-icon">
                        <i class="fas fa-language"></i>
                    </div>
                    <div class="lang-title">Выберите язык</div>
                    <div class="lang-subtitle">Choose your preferred language</div>

                    <div class="lang-timer" id="langTimer">
                        <i class="fas fa-clock"></i>
                        <span id="timerText">Доступно 24:00:00</span>
                    </div>

                    <div class="lang-grid">
                        ${langHTML}
                    </div>

                    <div class="lang-hint">
                        <i class="fas fa-save"></i> Выбор сохраняется на 24 часа
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Добавляем стили (если ещё нет)
        injectStyles();

        // Запускаем таймер
        startTimer();

        // Закрытие по клику вне модалки
        const overlay = document.getElementById('metroLangModal');
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                // Если язык уже выбран — можно закрыть
                if (getSavedLanguage()) {
                    hideModal();
                }
            }
        });

        // Закрытие по ESC (только если язык уже выбран)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && getSavedLanguage()) {
                hideModal();
            }
        });
    }

    function showModal() {
        const existing = document.getElementById('metroLangModal');
        if (existing) {
            existing.classList.add('active');
            existing.style.display = 'flex';
            startTimer();
        } else {
            createModal();
        }
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        const modal = document.getElementById('metroLangModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
        document.body.style.overflow = '';
    }

    // ========== ТАЙМЕР ==========

    let timerInterval = null;

    function startTimer() {
        // Останавливаем старый таймер
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        const timerText = document.getElementById('timerText');
        if (!timerText) return;

        // Получаем оставшееся время
        const timerStart = getTimerStart();
        let timeLeft = CONFIG.TIMER_DURATION;

        if (timerStart) {
            const elapsed = Date.now() - timerStart;
            timeLeft = Math.max(0, CONFIG.TIMER_DURATION - elapsed);
        }

        // Обновляем сразу
        updateTimerDisplay(timeLeft);

        // Запускаем интервал
        timerInterval = setInterval(function() {
            timeLeft -= 1000;
            if (timeLeft < 0) timeLeft = 0;
            updateTimerDisplay(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerText.textContent = '⏰ Время вышло, выберите язык заново';
                timerText.style.color = '#FFD700';
            }
        }, 1000);
    }

    function updateTimerDisplay(milliseconds) {
        const timerText = document.getElementById('timerText');
        if (!timerText) return;

        if (milliseconds <= 0) {
            timerText.textContent = '⏰ Время вышло, выберите язык заново';
            return;
        }

        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        timerText.textContent =
            `Доступно ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // ========== СТИЛИ ==========

    function injectStyles() {
        if (document.getElementById('metroLangStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'metroLangStyles';
        styles.textContent = `
            /* ===== МОДАЛЬНОЕ ОКНО ВЫБОРА ЯЗЫКА ===== */
            .lang-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(13, 21, 38, 0.92);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                backdrop-filter: blur(12px);
                animation: langFadeIn 0.4s ease;
            }
            .lang-overlay.active {
                display: flex;
            }

            .lang-modal {
                background: linear-gradient(145deg, #182444, #0d1526);
                border: 1px solid rgba(255, 215, 0, 0.15);
                border-radius: 24px;
                padding: 40px 35px;
                max-width: 480px;
                width: 92%;
                text-align: center;
                box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 60px rgba(255, 215, 0, 0.05);
                animation: langSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .lang-icon {
                width: 72px;
                height: 72px;
                background: linear-gradient(135deg, #FFD700, #e6c200);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                box-shadow: 0 0 40px rgba(255, 215, 0, 0.2);
            }
            .lang-icon i {
                font-size: 32px;
                color: #0d1526;
            }

            .lang-title {
                color: #f2f4fa;
                font-size: 24px;
                font-weight: 800;
                margin-bottom: 6px;
                background: linear-gradient(135deg, #f2f4fa 40%, #FFD700 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .lang-subtitle {
                color: #a6b0cc;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 20px;
            }

            .lang-timer {
                font-size: 12px;
                color: #77819e;
                margin-bottom: 18px;
                padding: 8px 16px;
                background: rgba(255,255,255,0.04);
                border-radius: 30px;
                display: inline-block;
                border: 1px solid rgba(37, 52, 96, 0.3);
            }
            .lang-timer i {
                color: #FFD700;
                margin-right: 6px;
            }

            .lang-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 18px;
            }

            .lang-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px 14px;
                background: rgba(19, 28, 51, 0.6);
                border: 2px solid rgba(37, 52, 96, 0.4);
                border-radius: 12px;
                color: #a6b0cc;
                font-family: 'Montserrat', Arial, sans-serif;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 100%;
            }
            .lang-btn:hover {
                background: rgba(255, 215, 0, 0.08);
                border-color: #FFD700;
                color: #f2f4fa;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.08);
            }
            .lang-btn .flag {
                font-size: 22px;
            }
            .lang-btn .status {
                font-size: 10px;
                padding: 2px 8px;
                border-radius: 10px;
                background: rgba(52, 168, 83, 0.2);
                color: #34a853;
                border: 1px solid rgba(52, 168, 83, 0.2);
                font-weight: 700;
            }
            .lang-btn .status.dev {
                background: rgba(255, 215, 0, 0.12);
                color: #FFD700;
                border: 1px solid rgba(255, 215, 0, 0.1);
            }
            .lang-btn.disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            .lang-btn.disabled:hover {
                transform: none;
                background: rgba(19, 28, 51, 0.6);
                border-color: rgba(37, 52, 96, 0.4);
                box-shadow: none;
            }

            .lang-hint {
                font-size: 11px;
                color: #77819e;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                margin-top: 2px;
            }
            .lang-hint i {
                color: #FFD700;
            }

            /* ===== TOAST ===== */
            .lang-toast {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: #182444;
                border: 1px solid #FFD700;
                color: #f2f4fa;
                padding: 14px 28px;
                border-radius: 50px;
                z-index: 99999;
                font-family: 'Montserrat', Arial, sans-serif;
                font-weight: 600;
                font-size: 14px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                animation: langFadeIn 0.3s ease;
                backdrop-filter: blur(8px);
                max-width: 90%;
                text-align: center;
            }
            .lang-toast.success { border-color: #34a853; color: #34a853; }
            .lang-toast.warning { border-color: #FFD700; color: #FFD700; }
            .lang-toast.error { border-color: #f28b82; color: #f28b82; }

            @keyframes langFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes langSlideUp {
                from { opacity: 0; transform: scale(0.92) translateY(30px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }

            /* ===== АДАПТИВ ===== */
            @media (max-width: 480px) {
                .lang-modal {
                    padding: 20px 16px;
                    max-width: 100%;
                    border-radius: 16px;
                }
                .lang-grid {
                    grid-template-columns: 1fr;
                    gap: 6px;
                }
                .lang-btn {
                    padding: 10px 14px;
                    font-size: 13px;
                }
                .lang-btn .flag {
                    font-size: 18px;
                }
                .lang-title {
                    font-size: 18px;
                }
                .lang-icon {
                    width: 56px;
                    height: 56px;
                }
                .lang-icon i {
                    font-size: 24px;
                }
            }
        `;

        document.head.appendChild(styles);

        // Подключаем Font Awesome если его нет
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }
    }

    // ========== УВЕДОМЛЕНИЯ ==========

    function showToast(message, type) {
        type = type || 'success';

        const existing = document.querySelector('.lang-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `lang-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========

    function init() {
        console.log('🌐 Language Selector инициализация...');

        // Проверяем, нужно ли показывать модалку
        if (shouldShowModal()) {
            console.log('📌 Показываем модалку выбора языка');
            showModal();
        } else {
            console.log('✅ Язык уже выбран, модалка скрыта');
            const savedLang = getSavedLanguage();
            if (savedLang && !window.location.pathname.includes('/language/')) {
                // Проверяем, нужно ли перенаправить
                redirectToLanguage(savedLang);
            }
        }
    }

    // ========== ПУБЛИЧНЫЙ API ==========

    window.LangSelector = {
        select: selectLanguage,
        show: showModal,
        hide: hideModal,
        getSavedLang: getSavedLanguage,
        setLang: function(lang) {
            if (CONFIG.languages[lang] && CONFIG.languages[lang].available) {
                selectLanguage(lang);
            }
        },
        languages: CONFIG.languages,
        isTimerExpired: isTimerExpired,
        init: init
    };

    // ========== ЗАПУСК ==========

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('🌐 LangSelector API доступен: window.LangSelector');
    console.log('📌 Используйте: window.LangSelector.setLang("ru")');
})();
