// lang-config.js - Language selection and redirect module

(function() {
    'use strict';
    
    console.log('lang-config.js загружен');
    
    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        defaultLang: 'en',
        availableLangs: ['ru', 'en'],
        langNames: {
            ru: 'Русский',
            en: 'English'
        },
        langFlags: {
            ru: '🇷🇺',
            en: '🇬🇧'
        },
        paths: {
            ru: 'https://kirill12633.github.io/Metro.New.Official/ru/',
            en: 'https://kirill12633.github.io/Metro.New.Official/en/'
        }
    };
    
    // ========== ОПРЕДЕЛЕНИЕ ЯЗЫКА ==========
    
    // 1. Получить язык из URL
    function getCurrentLangFromURL() {
        const path = window.location.pathname;
        if (path.startsWith('/ru/') || path === '/ru') {
            return 'ru';
        }
        if (path.startsWith('/en/') || path === '/en') {
            return 'en';
        }
        return null;
    }
    
    // 2. Получить сохранённый язык из localStorage
    function getSavedLanguage() {
        try {
            const saved = localStorage.getItem('metro_new_language');
            if (saved && CONFIG.availableLangs.includes(saved)) {
                console.log('Сохранённый язык из localStorage:', saved);
                return saved;
            }
        } catch(e) {
            console.warn('Не удалось прочитать localStorage:', e);
        }
        return null;
    }
    
    // 3. Сохранить язык в localStorage
    function saveLanguage(lang) {
        try {
            localStorage.setItem('metro_new_language', lang);
            localStorage.setItem('metro_new_language_selected', 'true');
            localStorage.setItem('metro_new_language_date', new Date().toISOString());
            console.log('Язык сохранён в localStorage:', lang);
            return true;
        } catch(e) {
            console.warn('Не удалось сохранить в localStorage:', e);
            return false;
        }
    }
    
    // 4. Проверить, выбран ли язык ранее
    function isLanguageSelected() {
        try {
            return localStorage.getItem('metro_new_language_selected') === 'true';
        } catch(e) {
            return false;
        }
    }
    
    // 5. Определить язык браузера
    function getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        if (browserLang.startsWith('ru')) {
            return 'ru';
        }
        return 'en';
    }
    
    // 6. Определить язык по геолокации (IP)
    async function detectLanguageByGeo() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            console.log('Геолокация определена:', data.country_code, data.country_name);
            
            // Русскоязычные страны
            const russianCountries = ['RU', 'UA', 'BY', 'KZ', 'KG', 'AM', 'MD', 'TJ', 'UZ', 'AZ', 'GE'];
            if (russianCountries.includes(data.country_code)) {
                return 'ru';
            }
            return 'en';
        } catch(e) {
            console.warn('Геолокация не определена:', e);
            return null;
        }
    }
    
    // 7. Основная функция определения языка (с приоритетами)
    async function determineLanguage() {
        // Приоритет 1: Сохранённый язык
        const savedLang = getSavedLanguage();
        if (savedLang) {
            console.log('Язык определён (сохранённый):', savedLang);
            return savedLang;
        }
        
        // Приоритет 2: Язык из URL
        const urlLang = getCurrentLangFromURL();
        if (urlLang) {
            console.log('Язык определён (из URL):', urlLang);
            return urlLang;
        }
        
        // Приоритет 3: Геолокация
        const geoLang = await detectLanguageByGeo();
        if (geoLang) {
            console.log('Язык определён (геолокация):', geoLang);
            return geoLang;
        }
        
        // Приоритет 4: Язык браузера
        const browserLang = getBrowserLanguage();
        console.log('Язык определён (браузер):', browserLang);
        return browserLang;
    }
    
    // ========== ПЕРЕНАПРАВЛЕНИЕ ==========
    
    function redirectToLanguage(lang) {
        const targetUrl = CONFIG.paths[lang];
        const currentUrl = window.location.href;
        
        // Не перенаправляем, если уже на правильном URL
        if (currentUrl.includes(CONFIG.paths[lang]) || currentUrl === targetUrl) {
            console.log('Уже на правильной версии, перенаправление не требуется');
            return false;
        }
        
        console.log('Перенаправление на:', targetUrl);
        window.location.href = targetUrl;
        return true;
    }
    
    // ========== МОДАЛЬНОЕ ОКНО ВЫБОРА ЯЗЫКА ==========
    
    function createLanguageModal() {
        // Удаляем старый модал если есть
        const oldModal = document.getElementById('langModal');
        if (oldModal) oldModal.remove();
        
        const modalHTML = `
            <div id="langModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100000;
                font-family: 'Montserrat', Arial, sans-serif;
                animation: fadeIn 0.3s ease;
            ">
                <div style="
                    background: linear-gradient(135deg, #fff, #f8f9fa);
                    border-radius: 24px;
                    padding: 35px 30px;
                    max-width: 420px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                    animation: slideUp 0.4s ease;
                ">
                    <div style="margin-bottom: 20px;">
                        <div style="
                            width: 80px;
                            height: 80px;
                            background: linear-gradient(135deg, #0066CC, #0052a3);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 20px;
                        ">
                            <i class="fas fa-language" style="font-size: 40px; color: #FFD700;"></i>
                        </div>
                        <h2 style="
                            color: #1A1A1A;
                            margin-bottom: 10px;
                            font-size: 26px;
                            font-weight: 700;
                        ">Choose Language</h2>
                        <h2 style="
                            color: #6C757D;
                            margin-bottom: 15px;
                            font-size: 18px;
                            font-weight: 500;
                        ">Выберите язык</h2>
                        <p style="color: #6C757D; font-size: 13px; margin-bottom: 25px;">
                            Please select your preferred language<br>
                            Пожалуйста, выберите удобный язык
                        </p>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                        <button id="langBtnEn" style="
                            background: linear-gradient(135deg, #0066CC, #0052a3);
                            color: white;
                            border: none;
                            padding: 14px 20px;
                            border-radius: 50px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 12px;
                            width: 100%;
                        ">
                            <span style="font-size: 24px;">🇬🇧</span>
                            English
                        </button>
                        <button id="langBtnRu" style="
                            background: linear-gradient(135deg, #FFD700, #e6c200);
                            color: #1A1A1A;
                            border: none;
                            padding: 14px 20px;
                            border-radius: 50px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 12px;
                            width: 100%;
                        ">
                            <span style="font-size: 24px;">🇷🇺</span>
                            Русский
                        </button>
                    </div>
                    
                    <p style="
                        font-size: 11px;
                        color: #999;
                        margin-top: 15px;
                    ">
                        <i class="fas fa-save"></i> Your choice will be saved
                    </p>
                </div>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Добавляем Font Awesome если нет
        if (!document.querySelector('link[href*="font-awesome"]') && !document.querySelector('link[href*="fa.min.css"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }
        
        // Назначаем обработчики
        const enBtn = document.getElementById('langBtnEn');
        const ruBtn = document.getElementById('langBtnRu');
        const modal = document.getElementById('langModal');
        
        if (enBtn) {
            enBtn.onclick = function() {
                selectLanguage('en');
            };
            // Hover эффект
            enBtn.onmouseover = function() { this.style.transform = 'translateY(-3px)'; this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; };
            enBtn.onmouseout = function() { this.style.transform = 'translateY(0)'; this.style.boxShadow = 'none'; };
        }
        
        if (ruBtn) {
            ruBtn.onclick = function() {
                selectLanguage('ru');
            };
            ruBtn.onmouseover = function() { this.style.transform = 'translateY(-3px)'; this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; };
            ruBtn.onmouseout = function() { this.style.transform = 'translateY(0)'; this.style.boxShadow = 'none'; };
        }
        
        function selectLanguage(lang) {
            saveLanguage(lang);
            
            // Синхронизируем с cookie если есть функция
            if (window.MetroNewCookies && typeof window.MetroNewCookies.syncLanguage === 'function') {
                window.MetroNewCookies.syncLanguage();
            }
            
            // Удаляем модал
            if (modal) modal.remove();
            
            // Перенаправляем
            redirectToLanguage(lang);
        }
    }
    
    // Показать модальное окно
    function showLanguageModal() {
        // Ждём загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createLanguageModal);
        } else {
            createLanguageModal();
        }
    }
    
    // ========== ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА В ШАПКЕ ==========
    
    function addLanguageSwitcher() {
        // Ждём загрузки страницы
        setTimeout(() => {
            const navLinks = document.querySelector('.nav-links');
            if (!navLinks) {
                console.log('Панель навигации не найдена, переключатель не добавлен');
                return;
            }
            
            const currentLang = getSavedLanguage() || 'en';
            
            const switcherHTML = `
                <div class="language-switcher" style="
                    margin-left: auto;
                    display: flex;
                    gap: 5px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 30px;
                    padding: 4px;
                ">
                    <button class="lang-option ${currentLang === 'en' ? 'active' : ''}" data-lang="en" style="
                        background: ${currentLang === 'en' ? '#FFD700' : 'transparent'};
                        color: ${currentLang === 'en' ? '#1A1A1A' : 'white'};
                        border: none;
                        padding: 6px 14px;
                        border-radius: 30px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        transition: all 0.3s;
                    ">
                        🇬🇧 EN
                    </button>
                    <button class="lang-option ${currentLang === 'ru' ? 'active' : ''}" data-lang="ru" style="
                        background: ${currentLang === 'ru' ? '#FFD700' : 'transparent'};
                        color: ${currentLang === 'ru' ? '#1A1A1A' : 'white'};
                        border: none;
                        padding: 6px 14px;
                        border-radius: 30px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        transition: all 0.3s;
                    ">
                        🇷🇺 RU
                    </button>
                </div>
            `;
            
            // Вставляем перед кнопкой входа
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                loginBtn.insertAdjacentHTML('beforebegin', switcherHTML);
            } else {
                navLinks.insertAdjacentHTML('beforeend', switcherHTML);
            }
            
            // Назначаем обработчики
            document.querySelectorAll('.lang-option').forEach(btn => {
                btn.addEventListener('click', function() {
                    const newLang = this.getAttribute('data-lang');
                    const currentLang = getSavedLanguage() || 'en';
                    
                    if (newLang !== currentLang) {
                        saveLanguage(newLang);
                        
                        // Синхронизируем с cookie
                        if (window.MetroNewCookies && typeof window.MetroNewCookies.syncLanguage === 'function') {
                            window.MetroNewCookies.syncLanguage();
                        }
                        
                        // Перенаправляем
                        redirectToLanguage(newLang);
                    }
                });
                
                btn.onmouseover = function() {
                    if (!this.classList.contains('active')) {
                        this.style.background = 'rgba(255,255,255,0.2)';
                    }
                };
                btn.onmouseout = function() {
                    if (!this.classList.contains('active')) {
                        this.style.background = 'transparent';
                    }
                };
            });
            
            console.log('Переключатель языка добавлен в шапку');
        }, 500);
    }
    
    // ========== ПРЕДЛОЖЕНИЕ СМЕНИТЬ ЯЗЫК ==========
    
    async function suggestLanguageChange() {
        const savedLang = getSavedLanguage();
        const urlLang = getCurrentLangFromURL();
        
        // Если язык уже выбран вручную - не предлагаем
        if (savedLang) return;
        
        // Если язык из URL не совпадает с геолокацией
        const geoLang = await detectLanguageByGeo();
        if (geoLang && urlLang && geoLang !== urlLang) {
            const suggestModalHTML = `
                <div id="suggestLangModal" style="
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 12px;
                    padding: 15px 20px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                    z-index: 99999;
                    max-width: 300px;
                    border-left: 4px solid #FFD700;
                    animation: slideInRight 0.3s ease;
                ">
                    <p style="margin: 0 0 10px 0; font-size: 14px;">
                        🌍 ${geoLang === 'ru' ? 'Хотите переключить сайт на русский?' : 'Switch to English?'}
                    </p>
                    <div style="display: flex; gap: 10px;">
                        <button id="suggestAcceptBtn" style="
                            background: #0066CC;
                            color: white;
                            border: none;
                            padding: 6px 15px;
                            border-radius: 20px;
                            cursor: pointer;
                        ">${geoLang === 'ru' ? 'Да, на русский' : 'Yes, to English'}</button>
                        <button id="suggestDeclineBtn" style="
                            background: #ccc;
                            color: #333;
                            border: none;
                            padding: 6px 15px;
                            border-radius: 20px;
                            cursor: pointer;
                        ">${geoLang === 'ru' ? 'Нет, спасибо' : 'No, thanks'}</button>
                    </div>
                </div>
                <style>
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                </style>
            `;
            
            document.body.insertAdjacentHTML('beforeend', suggestModalHTML);
            
            document.getElementById('suggestAcceptBtn')?.addEventListener('click', () => {
                saveLanguage(geoLang);
                document.getElementById('suggestLangModal')?.remove();
                redirectToLanguage(geoLang);
            });
            
            document.getElementById('suggestDeclineBtn')?.addEventListener('click', () => {
                saveLanguage(urlLang || 'en');
                document.getElementById('suggestLangModal')?.remove();
            });
            
            // Автоматическое исчезновение через 10 секунд
            setTimeout(() => {
                document.getElementById('suggestLangModal')?.remove();
            }, 10000);
        }
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    
    async function init() {
        console.log('lang-config.js инициализация...');
        
        const savedLang = getSavedLanguage();
        const isSelected = isLanguageSelected();
        const urlLang = getCurrentLangFromURL();
        
        // Если язык не выбран - показываем модальное окно
        if (!isSelected && !savedLang) {
            console.log('Язык не выбран, показываем модальное окно');
            showLanguageModal();
        } 
        // Если язык выбран, но URL не соответствует - перенаправляем
        else if (savedLang && urlLang !== savedLang) {
            console.log('Перенаправление на сохранённый язык:', savedLang);
            redirectToLanguage(savedLang);
        }
        
        // Добавляем переключатель языка в шапку
        addLanguageSwitcher();
        
        // Предлагаем сменить язык если нужно
        await suggestLanguageChange();
        
        console.log('lang-config.js инициализирован');
    }
    
    // Запускаем инициализацию
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ========== ПУБЛИЧНЫЙ API ==========
    window.MetroNewLang = {
        getCurrentLang: getCurrentLangFromURL,
        getSavedLang: getSavedLanguage,
        setLang: function(lang) {
            if (CONFIG.availableLangs.includes(lang)) {
                saveLanguage(lang);
                redirectToLanguage(lang);
            }
        },
        detectLanguage: determineLanguage,
        showModal: showLanguageModal,
        availableLangs: CONFIG.availableLangs,
        langNames: CONFIG.langNames,
        langFlags: CONFIG.langFlags
    };
    
    console.log('lang-config.js готов, API: window.MetroNewLang');
    
})();
