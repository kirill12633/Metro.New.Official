// lang-config.js - Модуль выбора и перенаправления языка (Метро New)

(function() {
    'use strict';

    console.log('🌐 Metro New Language Module загружен');

    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        defaultLang: 'ru',
        availableLangs: ['ru', 'en', 'uk', 'kk', 'be', 'de', 'es', 'fr', 'zh', 'ja', 'pt', 'it', 'pl', 'tr', 'ar', 'hi'],
        langNames: {
            ru: 'Русский',
            en: 'English',
            uk: 'Українська',
            kk: 'Қазақша',
            be: 'Беларуская',
            de: 'Deutsch',
            es: 'Español',
            fr: 'Français',
            zh: '中文',
            ja: '日本語',
            pt: 'Português',
            it: 'Italiano',
            pl: 'Polski',
            tr: 'Türkçe',
            ar: 'العربية',
            hi: 'हिन्दी'
        },
        langFlags: {
            ru: '🇷🇺',
            en: '🇬🇧',
            uk: '🇺🇦',
            kk: '🇰🇿',
            be: '🇧🇾',
            de: '🇩🇪',
            es: '🇪🇸',
            fr: '🇫🇷',
            zh: '🇨🇳',
            ja: '🇯🇵',
            pt: '🇵🇹',
            it: '🇮🇹',
            pl: '🇵🇱',
            tr: '🇹🇷',
            ar: '🇸🇦',
            hi: '🇮🇳'
        },
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
            ja: 'https://kirill12633.github.io/Metro.New.Official/ja/',
            pt: 'https://kirill12633.github.io/Metro.New.Official/pt/',
            it: 'https://kirill12633.github.io/Metro.New.Official/it/',
            pl: 'https://kirill12633.github.io/Metro.New.Official/pl/',
            tr: 'https://kirill12633.github.io/Metro.New.Official/tr/',
            ar: 'https://kirill12633.github.io/Metro.New.Official/ar/',
            hi: 'https://kirill12633.github.io/Metro.New.Official/hi/'
        }
    };

    // ========== ОПРЕДЕЛЕНИЕ ЯЗЫКА ==========

    function getCurrentLangFromURL() {
        const path = window.location.pathname;
        for (const lang of CONFIG.availableLangs) {
            if (path.startsWith(`/${lang}/`) || path === `/${lang}`) {
                return lang;
            }
        }
        return null;
    }

    function getSavedLanguage() {
        try {
            const saved = localStorage.getItem('metro_new_language');
            if (saved && CONFIG.availableLangs.includes(saved)) {
                return saved;
            }
        } catch(e) {}
        return null;
    }

    function saveLanguage(lang) {
        try {
            localStorage.setItem('metro_new_language', lang);
            localStorage.setItem('metro_new_language_selected', 'true');
            localStorage.setItem('metro_new_language_date', new Date().toISOString());
            return true;
        } catch(e) {
            return false;
        }
    }

    function isLanguageSelected() {
        try {
            return localStorage.getItem('metro_new_language_selected') === 'true';
        } catch(e) {
            return false;
        }
    }

    function getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        const langMap = {
            'ru': 'ru', 'uk': 'uk', 'kk': 'kk', 'be': 'be',
            'de': 'de', 'es': 'es', 'fr': 'fr', 'zh': 'zh',
            'ja': 'ja', 'pt': 'pt', 'it': 'it', 'pl': 'pl',
            'tr': 'tr', 'ar': 'ar', 'hi': 'hi'
        };
        for (const [prefix, lang] of Object.entries(langMap)) {
            if (browserLang.startsWith(prefix)) return lang;
        }
        return 'en';
    }

    function redirectToLanguage(lang) {
        const targetUrl = CONFIG.paths[lang];
        const currentUrl = window.location.href;

        if (currentUrl.includes(CONFIG.paths[lang]) || currentUrl === targetUrl) {
            return false;
        }

        window.location.href = targetUrl;
        return true;
    }

    // ========== СТИЛИ МЕТРО NEW ==========

    function injectStyles() {
        if (document.getElementById('metroNewLangStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'metroNewLangStyles';
        styles.textContent = `
            /* ===== МЕТРО NEW - СТИЛИ ДЛЯ МОДАЛЬНОГО ОКНА ===== */
            .metro-lang-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(13, 21, 38, 0.92);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                font-family: 'Montserrat', Arial, sans-serif;
                backdrop-filter: blur(12px);
                animation: metroFadeIn 0.4s ease;
            }

            .metro-lang-modal {
                background: linear-gradient(145deg, #182444, #0d1526);
                border: 1px solid rgba(255, 215, 0, 0.15);
                border-radius: 24px;
                padding: 40px 35px;
                max-width: 560px;
                width: 92%;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 60px rgba(255, 215, 0, 0.05);
                animation: metroSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .metro-lang-modal::-webkit-scrollbar {
                width: 4px;
            }
            .metro-lang-modal::-webkit-scrollbar-track {
                background: transparent;
            }
            .metro-lang-modal::-webkit-scrollbar-thumb {
                background: #FFD700;
                border-radius: 8px;
            }

            .metro-lang-header {
                text-align: center;
                margin-bottom: 28px;
            }

            .metro-lang-icon {
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

            .metro-lang-icon i {
                font-size: 32px;
                color: #0d1526;
            }

            .metro-lang-title {
                color: #f2f4fa;
                font-size: 26px;
                font-weight: 800;
                margin-bottom: 6px;
                background: linear-gradient(135deg, #f2f4fa 40%, #FFD700 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .metro-lang-subtitle {
                color: #a6b0cc;
                font-size: 14px;
                font-weight: 500;
            }

            .metro-lang-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 20px;
            }

            .metro-lang-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 16px;
                background: rgba(19, 28, 51, 0.6);
                border: 1px solid rgba(37, 52, 96, 0.4);
                border-radius: 12px;
                color: #a6b0cc;
                font-family: 'Montserrat', Arial, sans-serif;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
                width: 100%;
            }

            .metro-lang-btn:hover {
                background: rgba(255, 215, 0, 0.08);
                border-color: #FFD700;
                color: #f2f4fa;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.08);
            }

            .metro-lang-btn .flag {
                font-size: 22px;
                flex-shrink: 0;
            }

            .metro-lang-btn .lang-name {
                flex: 1;
            }

            .metro-lang-btn .lang-code {
                font-size: 11px;
                color: #77819e;
                font-weight: 500;
                padding: 2px 8px;
                background: rgba(119, 129, 158, 0.15);
                border-radius: 6px;
            }

            .metro-lang-btn.active {
                background: rgba(255, 215, 0, 0.12);
                border-color: #FFD700;
                color: #f2f4fa;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.06);
            }

            .metro-lang-btn .status-badge {
                font-size: 10px;
                padding: 2px 8px;
                border-radius: 10px;
                font-weight: 700;
                letter-spacing: 0.3px;
            }

            .metro-lang-btn .status-badge.available {
                background: rgba(52, 168, 83, 0.2);
                color: #34a853;
                border: 1px solid rgba(52, 168, 83, 0.2);
            }

            .metro-lang-btn .status-badge.development {
                background: rgba(255, 215, 0, 0.12);
                color: #FFD700;
                border: 1px solid rgba(255, 215, 0, 0.1);
                font-size: 8px;
            }

            .metro-lang-btn.disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            .metro-lang-btn.disabled:hover {
                transform: none;
                background: rgba(19, 28, 51, 0.6);
                border-color: rgba(37, 52, 96, 0.4);
                box-shadow: none;
            }

            .metro-lang-footer {
                text-align: center;
                padding-top: 16px;
                border-top: 1px solid rgba(37, 52, 96, 0.3);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
            }

            .metro-lang-footer .hint {
                color: #77819e;
                font-size: 11px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .metro-lang-footer .hint i {
                color: #FFD700;
            }

            .metro-lang-close {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(37, 52, 96, 0.3);
                border-radius: 30px;
                color: #a6b0cc;
                padding: 6px 18px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                font-family: 'Montserrat', Arial, sans-serif;
            }

            .metro-lang-close:hover {
                background: rgba(255, 215, 0, 0.08);
                border-color: #FFD700;
                color: #f2f4fa;
            }

            @keyframes metroFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes metroSlideUp {
                from {
                    opacity: 0;
                    transform: scale(0.92) translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            /* ===== МИНИ-ПЕРЕКЛЮЧАТЕЛЬ ===== */
            .metro-lang-mini {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(37, 52, 96, 0.3);
                border-radius: 30px;
                padding: 4px;
                transition: all 0.3s;
            }

            .metro-lang-mini:hover {
                border-color: rgba(255, 215, 0, 0.3);
            }

            .metro-lang-mini-btn {
                padding: 6px 14px;
                border: none;
                border-radius: 30px;
                cursor: pointer;
                font-family: 'Montserrat', Arial, sans-serif;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.3s;
                background: transparent;
                color: #a6b0cc;
            }

            .metro-lang-mini-btn:hover {
                color: #f2f4fa;
            }

            .metro-lang-mini-btn.active {
                background: #FFD700;
                color: #0d1526;
                box-shadow: 0 4px 20px rgba(255, 215, 0, 0.2);
            }

            .metro-lang-mini-btn .flag {
                margin-right: 4px;
            }

            .metro-lang-mini-more {
                padding: 6px 10px;
                border: none;
                border-radius: 30px;
                cursor: pointer;
                font-family: 'Montserrat', Arial, sans-serif;
                font-size: 13px;
                font-weight: 600;
                background: transparent;
                color: #77819e;
                transition: all 0.3s;
            }

            .metro-lang-mini-more:hover {
                color: #f2f4fa;
            }

            @media (max-width: 480px) {
                .metro-lang-modal {
                    padding: 24px 18px;
                    max-width: 100%;
                    border-radius: 16px;
                }
                .metro-lang-grid {
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .metro-lang-btn {
                    padding: 10px 12px;
                    font-size: 12px;
                }
                .metro-lang-btn .flag {
                    font-size: 18px;
                }
                .metro-lang-title {
                    font-size: 20px;
                }
                .metro-lang-mini-btn {
                    font-size: 11px;
                    padding: 4px 10px;
                }
            }

            @media (max-width: 380px) {
                .metro-lang-grid {
                    grid-template-columns: 1fr;
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

    // ========== МОДАЛЬНОЕ ОКНО ВЫБОРА ЯЗЫКА ==========

    function createLanguageModal() {
        const oldModal = document.getElementById('metroLangModal');
        if (oldModal) oldModal.remove();

        injectStyles();

        const currentLang = getSavedLanguage() || 'ru';
        const availableLangs = CONFIG.availableLangs;
        const developedLangs = ['ru', 'en']; // Только эти полностью готовы
        const inDevelopment = availableLangs.filter(l => !developedLangs.includes(l));

        let gridHTML = '';

        // Сначала доступные языки
        developedLangs.forEach(lang => {
            gridHTML += `
                <button class="metro-lang-btn active" data-lang="${lang}" onclick="window.MetroNewLang.select('${lang}')">
                    <span class="flag">${CONFIG.langFlags[lang]}</span>
                    <span class="lang-name">${CONFIG.langNames[lang]}</span>
                    <span class="lang-code">${lang.toUpperCase()}</span>
                    <span class="status-badge available">✅</span>
                </button>
            `;
        });

        // Затем языки в разработке
        inDevelopment.forEach(lang => {
            gridHTML += `
                <button class="metro-lang-btn disabled" data-lang="${lang}" onclick="window.MetroNewLang.select('${lang}')" title="В разработке">
                    <span class="flag">${CONFIG.langFlags[lang]}</span>
                    <span class="lang-name">${CONFIG.langNames[lang]}</span>
                    <span class="lang-code">${lang.toUpperCase()}</span>
                    <span class="status-badge development">🚧</span>
                </button>
            `;
        });

        const modalHTML = `
            <div id="metroLangModal" class="metro-lang-overlay">
                <div class="metro-lang-modal">
                    <div class="metro-lang-header">
                        <div class="metro-lang-icon">
                            <i class="fas fa-language"></i>
                        </div>
                        <div class="metro-lang-title">Выберите язык</div>
                        <div class="metro-lang-subtitle">Choose your preferred language</div>
                    </div>

                    <div class="metro-lang-grid">
                        ${gridHTML}
                    </div>

                    <div class="metro-lang-footer">
                        <span class="hint">
                            <i class="fas fa-save"></i> Ваш выбор будет сохранён
                        </span>
                        <button class="metro-lang-close" onclick="window.MetroNewLang.closeModal()">
                            <i class="fas fa-times"></i> Закрыть
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Закрытие по клику вне модалки
        const overlay = document.getElementById('metroLangModal');
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                window.MetroNewLang.closeModal();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                window.MetroNewLang.closeModal();
            }
        });
    }

    function closeModal() {
        const modal = document.getElementById('metroLangModal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    function showLanguageModal() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createLanguageModal);
        } else {
            createLanguageModal();
        }
    }

    // ========== ВЫБОР ЯЗЫКА ==========

    function selectLanguage(lang) {
        if (!CONFIG.availableLangs.includes(lang)) return;

        const developedLangs = ['ru', 'en'];
        if (!developedLangs.includes(lang)) {
            showToast('🚧 Этот язык пока в разработке', 'warning');
            return;
        }

        saveLanguage(lang);
        closeModal();
        redirectToLanguage(lang);
    }

    // ========== МИНИ-ПЕРЕКЛЮЧАТЕЛЬ В ШАПКЕ ==========

    function addLanguageSwitcher() {
        // Ждём загрузки DOM
        const checkNav = setInterval(() => {
            const navLinks = document.querySelector('.nav-links');
            if (!navLinks) return;

            clearInterval(checkNav);

            const currentLang = getSavedLanguage() || 'ru';
            const developedLangs = ['ru', 'en'];

            let miniHTML = `
                <div class="metro-lang-mini" id="metroLangMini">
            `;

            developedLangs.forEach(lang => {
                miniHTML += `
                    <button class="metro-lang-mini-btn ${currentLang === lang ? 'active' : ''}" 
                            onclick="window.MetroNewLang.setLang('${lang}')">
                        <span class="flag">${CONFIG.langFlags[lang]}</span>
                        ${lang.toUpperCase()}
                    </button>
                `;
            });

            miniHTML += `
                    <button class="metro-lang-mini-more" onclick="window.MetroNewLang.showModal()" title="Все языки">
                        <i class="fas fa-chevron-down" style="font-size: 11px;"></i>
                    </button>
                </div>
            `;

            // Вставляем после login-btn или в nav-links
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                loginBtn.insertAdjacentHTML('beforebegin', miniHTML);
            } else {
                navLinks.insertAdjacentHTML('beforeend', miniHTML);
            }

            // Обновляем активную кнопку при изменении языка
            window.MetroNewLang.updateSwitcher = function() {
                const newLang = getSavedLanguage() || 'ru';
                document.querySelectorAll('.metro-lang-mini-btn').forEach(btn => {
                    btn.classList.remove('active');
                    const btnLang = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                    if (btnLang === newLang) {
                        btn.classList.add('active');
                    }
                });
            };
        }, 100);
    }

    // ========== УВЕДОМЛЕНИЯ ==========

    function showToast(message, type) {
        type = type || 'success';

        const existing = document.querySelector('.metro-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'metro-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #182444;
            border: 1px solid ${type === 'warning' ? '#FFD700' : '#34a853'};
            color: #f2f4fa;
            padding: 14px 28px;
            border-radius: 50px;
            z-index: 99999;
            font-family: 'Montserrat', Arial, sans-serif;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: metroFadeIn 0.3s ease;
            backdrop-filter: blur(8px);
            max-width: 90%;
            text-align: center;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========

    async function init() {
        console.log('🌐 Metro New Language Module инициализация...');

        const savedLang = getSavedLanguage();
        const isSelected = isLanguageSelected();
        const urlLang = getCurrentLangFromURL();

        // Если язык не выбран и не сохранён — показываем модалку
        if (!isSelected && !savedLang) {
            console.log('📌 Язык не выбран, показываем модальное окно');
            showLanguageModal();
        } else if (savedLang && urlLang && urlLang !== savedLang) {
            console.log(`🔄 Перенаправление на сохранённый язык: ${savedLang}`);
            redirectToLanguage(savedLang);
        }

        addLanguageSwitcher();

        console.log('✅ Metro New Language Module готов');
        console.log(`🌐 Текущий язык: ${getSavedLanguage() || 'не выбран'}`);
    }

    // ========== ПУБЛИЧНЫЙ API ==========

    window.MetroNewLang = {
        // Основные методы
        getCurrentLang: getCurrentLangFromURL,
        getSavedLang: getSavedLanguage,
        setLang: function(lang) {
            if (CONFIG.availableLangs.includes(lang)) {
                saveLanguage(lang);
                if (this.updateSwitcher) this.updateSwitcher();
                redirectToLanguage(lang);
            }
        },
        select: selectLanguage,
        showModal: showLanguageModal,
        closeModal: closeModal,

        // Данные
        availableLangs: CONFIG.availableLangs,
        langNames: CONFIG.langNames,
        langFlags: CONFIG.langFlags,
        developedLangs: ['ru', 'en'],

        // Вспомогательные
        showToast: showToast,
        updateSwitcher: null
    };

    // ========== ЗАПУСК ==========

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('🌐 MetroNewLang API доступен: window.MetroNewLang');
})();
