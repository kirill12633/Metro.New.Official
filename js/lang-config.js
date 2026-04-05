// lang-config.js - Language selection and redirect module

(function() {
    // Language configuration
    const LANG_CONFIG = {
        defaultLang: 'en',
        availableLangs: ['ru', 'en'],
        langNames: {
            ru: 'Русский',
            en: 'English'
        },
        paths: {
            ru: 'https://kirill12633.github.io/Metro.New.Official/ru/',
            en: 'https://kirill12633.github.io/Metro.New.Official/en/'
        }
    };

    // Get current language from URL path
    function getCurrentLangFromURL() {
        const path = window.location.pathname;
        if (path.startsWith('/ru/') || path === '/ru' || path.startsWith('/ru')) {
            return 'ru';
        }
        if (path.startsWith('/en/') || path === '/en' || path.startsWith('/en')) {
            return 'en';
        }
        return null;
    }

    // Get saved language from localStorage
    function getSavedLanguage() {
        try {
            const saved = localStorage.getItem('metro_new_language');
            if (saved && LANG_CONFIG.availableLangs.includes(saved)) {
                return saved;
            }
        } catch(e) {
            console.warn('Cannot read localStorage:', e);
        }
        return null;
    }

    // Save language to localStorage
    function saveLanguage(lang) {
        try {
            localStorage.setItem('metro_new_language', lang);
            localStorage.setItem('metro_new_language_selected', 'true');
            localStorage.setItem('metro_new_language_date', new Date().toISOString());
            return true;
        } catch(e) {
            console.warn('Cannot save to localStorage:', e);
            return false;
        }
    }

    // Check if language was already selected
    function isLanguageSelected() {
        try {
            return localStorage.getItem('metro_new_language_selected') === 'true';
        } catch(e) {
            return false;
        }
    }

    // Redirect to language version
    function redirectToLanguage(lang) {
        const targetUrl = LANG_CONFIG.paths[lang];
        if (targetUrl && window.location.href !== targetUrl && !window.location.href.startsWith(targetUrl)) {
            window.location.href = targetUrl;
            return true;
        }
        return false;
    }

    // Create modal window HTML
    function createLanguageModal() {
        const modalHTML = `
            <div id="langModal" style="
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
                font-family: 'Montserrat', sans-serif;
            ">
                <div style="
                    background: linear-gradient(135deg, #fff, #f5f5f5);
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    animation: fadeInUp 0.4s ease-out;
                ">
                    <div style="margin-bottom: 20px;">
                        <div style="
                            width: 70px;
                            height: 70px;
                            background: linear-gradient(135deg, #0066CC, #0052a3);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 15px;
                        ">
                            <i class="fas fa-language" style="font-size: 35px; color: #FFD700;"></i>
                        </div>
                        <h2 style="
                            color: #1A1A1A;
                            margin-bottom: 10px;
                            font-size: 24px;
                        ">Welcome! / Добро пожаловать!</h2>
                        <p style="
                            color: #6C757D;
                            margin-bottom: 25px;
                            font-size: 14px;
                        ">Please select your preferred language<br>Пожалуйста, выберите удобный язык</p>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 20px;">
                        <button id="langBtnEn" style="
                            background: linear-gradient(135deg, #0066CC, #0052a3);
                            color: white;
                            border: none;
                            padding: 14px 30px;
                            border-radius: 50px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        " onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 20px rgba(0,0,0,0.2)'" 
                           onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                            <i class="fas fa-language"></i>
                            English
                        </button>
                        <button id="langBtnRu" style="
                            background: linear-gradient(135deg, #FFD700, #e6c200);
                            color: #1A1A1A;
                            border: none;
                            padding: 14px 30px;
                            border-radius: 50px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        " onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 20px rgba(0,0,0,0.2)'" 
                           onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                            <i class="fas fa-language"></i>
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
                @keyframes fadeInUp {
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
        
        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add event listeners
        const enBtn = document.getElementById('langBtnEn');
        const ruBtn = document.getElementById('langBtnRu');
        const modal = document.getElementById('langModal');
        
        if (enBtn) {
            enBtn.addEventListener('click', function() {
                selectLanguage('en');
            });
        }
        
        if (ruBtn) {
            ruBtn.addEventListener('click', function() {
                selectLanguage('ru');
            });
        }
        
        function selectLanguage(lang) {
            saveLanguage(lang);
            if (modal) modal.remove();
            
            // Redirect to correct URL
            const targetUrl = LANG_CONFIG.paths[lang];
            const currentUrl = window.location.href;
            const currentLang = getCurrentLangFromURL();
            
            if (currentLang !== lang) {
                window.location.href = targetUrl;
            } else {
                // Already on correct language page, just reload to apply
                window.location.reload();
            }
        }
    }

    // Main initialization
    function initLanguageSelector() {
        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                checkAndShowModal();
            });
        } else {
            checkAndShowModal();
        }
    }
    
    function checkAndShowModal() {
        const currentLang = getCurrentLangFromURL();
        const savedLang = getSavedLanguage();
        const langSelected = isLanguageSelected();
        
        // If no language selected yet, show modal
        if (!langSelected && !savedLang) {
            // Make sure Font Awesome is loaded
            if (typeof document !== 'undefined') {
                createLanguageModal();
            }
            return;
        }
        
        // If language selected but URL doesn't match, redirect
        if (savedLang && currentLang !== savedLang) {
            redirectToLanguage(savedLang);
        }
    }

    // Export functions for use in other scripts
    window.MetroNewLang = {
        getCurrentLang: getCurrentLangFromURL,
        getSavedLang: getSavedLanguage,
        setLang: function(lang) {
            if (LANG_CONFIG.availableLangs.includes(lang)) {
                saveLanguage(lang);
                redirectToLanguage(lang);
            }
        },
        availableLangs: LANG_CONFIG.availableLangs,
        langNames: LANG_CONFIG.langNames
    };
    
    // Start the language selector
    initLanguageSelector();
})();
