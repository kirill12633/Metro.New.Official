// cookies.js - Cookie management for Metro New
// GDPR compliant cookie consent system

(function() {
    // Cookie names
    const COOKIE_NAMES = {
        language: 'metro_new_language',
        languageSelected: 'metro_new_language_selected',
        cookieConsent: 'cookie_consent',
        cookiePreferences: 'cookie_preferences'
    };

    // Cookie categories
    const COOKIE_CATEGORIES = {
        NECESSARY: 'necessary',
        FUNCTIONAL: 'functional',
        ANALYTICS: 'analytics',
        ADVERTISING: 'advertising'
    };

    // Default cookie settings
    const DEFAULT_SETTINGS = {
        necessary: true,    // Always true - cannot be disabled
        functional: false,
        analytics: false,
        advertising: false
    };

    // Current user preferences
    let userPreferences = null;

    // ========== UTILITY FUNCTIONS ==========

    // Set a cookie
    function setCookie(name, value, days = 365, path = '/') {
        try {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${path}; SameSite=Lax`;
            return true;
        } catch(e) {
            console.warn('Cannot set cookie:', e);
            return false;
        }
    }

    // Get a cookie
    function getCookie(name) {
        try {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        } catch(e) {
            console.warn('Cannot get cookie:', e);
            return null;
        }
    }

    // Delete a cookie
    function deleteCookie(name, path = '/') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    }

    // ========== USER PREFERENCES ==========

    // Load user preferences from cookie
    function loadUserPreferences() {
        const saved = getCookie(COOKIE_NAMES.cookiePreferences);
        if (saved) {
            try {
                userPreferences = JSON.parse(saved);
                return userPreferences;
            } catch(e) {
                console.warn('Cannot parse cookie preferences:', e);
            }
        }
        
        // Check old consent system for backward compatibility
        const oldConsent = getCookie(COOKIE_NAMES.cookieConsent);
        if (oldConsent === 'true') {
            userPreferences = { ...DEFAULT_SETTINGS, functional: true, analytics: true, advertising: true };
            saveUserPreferences();
        } else {
            userPreferences = { ...DEFAULT_SETTINGS };
        }
        
        return userPreferences;
    }

    // Save user preferences to cookie
    function saveUserPreferences() {
        if (userPreferences) {
            setCookie(COOKIE_NAMES.cookiePreferences, JSON.stringify(userPreferences), 365);
        }
    }

    // Update specific category preference
    function updatePreference(category, value) {
        if (!userPreferences) {
            loadUserPreferences();
        }
        
        if (userPreferences.hasOwnProperty(category) && category !== 'necessary') {
            userPreferences[category] = value;
            saveUserPreferences();
            
            // Apply changes immediately
            applyCookiesByPreferences();
        }
    }

    // Check if cookie category is allowed
    function isCategoryAllowed(category) {
        if (!userPreferences) {
            loadUserPreferences();
        }
        return userPreferences[category] === true;
    }

    // ========== APPLY COOKIES BASED ON PREFERENCES ==========

    function applyCookiesByPreferences() {
        // Language cookie is NECESSARY - always allowed
        const savedLang = localStorage.getItem('metro_new_language');
        if (savedLang) {
            setCookie(COOKIE_NAMES.language, savedLang, 365);
            setCookie(COOKIE_NAMES.languageSelected, 'true', 365);
        }
        
        // FUNCTIONAL cookies
        if (isCategoryAllowed(COOKIE_CATEGORIES.FUNCTIONAL)) {
            // Add functional cookies here if needed
            console.log('Functional cookies enabled');
        }
        
        // ANALYTICS cookies
        if (isCategoryAllowed(COOKIE_CATEGORIES.ANALYTICS)) {
            // Add analytics cookies here (Google Analytics, etc.)
            console.log('Analytics cookies enabled');
        }
        
        // ADVERTISING cookies
        if (isCategoryAllowed(COOKIE_CATEGORIES.ADVERTISING)) {
            // Add advertising cookies here
            console.log('Advertising cookies enabled');
        }
    }

    // ========== LANGUAGE SYNC ==========

    // Sync language from localStorage to cookie
    function syncLanguageToCookie() {
        try {
            const savedLang = localStorage.getItem('metro_new_language');
            if (savedLang) {
                setCookie(COOKIE_NAMES.language, savedLang, 365);
                setCookie(COOKIE_NAMES.languageSelected, 'true', 365);
            }
        } catch(e) {
            console.warn('Cannot sync language to cookie:', e);
        }
    }

    // Get language from cookie (fallback if localStorage is unavailable)
    function getLanguageFromCookie() {
        return getCookie(COOKIE_NAMES.language);
    }

    // ========== CONSENT BANNER ==========

    // Check if user has given consent
    function hasConsent() {
        const consent = getCookie(COOKIE_NAMES.cookiePreferences);
        const oldConsent = getCookie(COOKIE_NAMES.cookieConsent);
        return !!(consent || oldConsent);
    }

    // Show consent banner (to be called from main page)
    function showConsentBannerIfNeeded() {
        if (hasConsent()) {
            return false;
        }
        
        createConsentBanner();
        return true;
    }

    // Create the consent banner HTML
    function createConsentBanner() {
        const bannerHTML = `
            <div id="cookieConsentBanner" style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                color: white;
                padding: 20px;
                z-index: 10000;
                box-shadow: 0 -5px 30px rgba(0,0,0,0.4);
                border-top: 3px solid #FFD700;
                font-family: 'Montserrat', sans-serif;
            ">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px;">
                        <div style="flex: 2; min-width: 250px;">
                            <h3 style="margin: 0 0 10px 0; color: #FFD700;">
                                <i class="fas fa-cookie-bite"></i> Мы ценим вашу конфиденциальность
                            </h3>
                            <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                                Мы используем cookie для запоминания языка, аналитики и работы сторонних сервисов.
                                <a href="/help/cookies" style="color: #FFD700; text-decoration: underline;">Подробнее</a>
                            </p>
                        </div>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                            <button id="cookieAcceptAll" style="
                                background: linear-gradient(135deg, #FFD700, #e6c200);
                                color: #1a1a2e;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 30px;
                                font-weight: 600;
                                cursor: pointer;
                                font-family: inherit;
                            ">
                                ✅ Принять все
                            </button>
                            <button id="cookieAcceptNecessary" style="
                                background: transparent;
                                color: white;
                                border: 1px solid #FFD700;
                                padding: 10px 20px;
                                border-radius: 30px;
                                font-weight: 500;
                                cursor: pointer;
                                font-family: inherit;
                            ">
                                ⚙️ Только необходимые
                            </button>
                            <button id="cookieSettings" style="
                                background: transparent;
                                color: #aaa;
                                border: 1px solid #555;
                                padding: 10px 20px;
                                border-radius: 30px;
                                font-weight: 500;
                                cursor: pointer;
                                font-family: inherit;
                            ">
                                ⚙️ Настроить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', bannerHTML);
        
        // Add event listeners
        document.getElementById('cookieAcceptAll')?.addEventListener('click', () => {
            acceptAllCookies();
            removeBanner();
        });
        
        document.getElementById('cookieAcceptNecessary')?.addEventListener('click', () => {
            acceptNecessaryCookies();
            removeBanner();
        });
        
        document.getElementById('cookieSettings')?.addEventListener('click', () => {
            showDetailedSettings();
        });
    }

    function removeBanner() {
        const banner = document.getElementById('cookieConsentBanner');
        if (banner) banner.remove();
    }

    function acceptAllCookies() {
        userPreferences = {
            necessary: true,
            functional: true,
            analytics: true,
            advertising: true
        };
        saveUserPreferences();
        applyCookiesByPreferences();
        
        // Show success message
        showToast('✅ Вы приняли все cookie', 'success');
    }

    function acceptNecessaryCookies() {
        userPreferences = { ...DEFAULT_SETTINGS };
        saveUserPreferences();
        applyCookiesByPreferences();
        
        showToast('⚙️ Используются только необходимые cookie', 'info');
    }

    function showDetailedSettings() {
        const modalHTML = `
            <div id="cookieSettingsModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                font-family: 'Montserrat', sans-serif;
            ">
                <div style="
                    background: white;
                    border-radius: 16px;
                    max-width: 500px;
                    width: 90%;
                    padding: 25px;
                    color: #333;
                ">
                    <h2 style="margin-top: 0; color: #0066CC;">Настройки cookie</h2>
                    
                    <div style="margin: 20px 0;">
                        <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <span><strong>📋 Строго необходимые</strong><br><small style="color: #666;">Обеспечивают работу сайта</small></span>
                            <span style="color: #999;">Всегда включены</span>
                        </label>
                        
                        <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <span><strong>🎨 Функциональные</strong><br><small style="color: #666;">Запоминают ваши предпочтения</small></span>
                            <input type="checkbox" id="prefFunctional" ${userPreferences?.functional ? 'checked' : ''}>
                        </label>
                        
                        <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <span><strong>📊 Аналитические</strong><br><small style="color: #666;">Помогают улучшать сайт</small></span>
                            <input type="checkbox" id="prefAnalytics" ${userPreferences?.analytics ? 'checked' : ''}>
                        </label>
                        
                        <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <span><strong>🎯 Рекламные</strong><br><small style="color: #666;">Персонализированная реклама</small></span>
                            <input type="checkbox" id="prefAdvertising" ${userPreferences?.advertising ? 'checked' : ''}>
                        </label>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="saveSettingsBtn" style="
                            background: #0066CC;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                        ">Сохранить</button>
                        <button id="closeSettingsBtn" style="
                            background: #ccc;
                            color: #333;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                        ">Закрыть</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            const functional = document.getElementById('prefFunctional')?.checked || false;
            const analytics = document.getElementById('prefAnalytics')?.checked || false;
            const advertising = document.getElementById('prefAdvertising')?.checked || false;
            
            updatePreference('functional', functional);
            updatePreference('analytics', analytics);
            updatePreference('advertising', advertising);
            
            document.getElementById('cookieSettingsModal')?.remove();
            showToast('⚙️ Настройки cookie сохранены', 'success');
            
            if (document.getElementById('cookieConsentBanner')) {
                removeBanner();
            }
        });
        
        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
            document.getElementById('cookieSettingsModal')?.remove();
        });
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#333'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10002;
            animation: fadeInOut 3s ease;
            font-family: 'Montserrat', sans-serif;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    // ========== PUBLIC API ==========
    window.MetroNewCookies = {
        // Get/set preferences
        getPreferences: () => loadUserPreferences(),
        updatePreference: (category, value) => updatePreference(category, value),
        isAllowed: (category) => isCategoryAllowed(category),
        
        // Language sync
        syncLanguage: () => syncLanguageToCookie(),
        getLanguageFromCookie: () => getLanguageFromCookie(),
        
        // Consent banner
        showBannerIfNeeded: () => showConsentBannerIfNeeded(),
        hasConsent: () => hasConsent(),
        
        // Manual control
        acceptAll: () => acceptAllCookies(),
        acceptNecessary: () => acceptNecessaryCookies(),
        
        // Cookie utilities
        set: (name, value, days) => setCookie(name, value, days),
        get: (name) => getCookie(name),
        delete: (name) => deleteCookie(name),
        
        // Categories
        CATEGORIES: COOKIE_CATEGORIES
    };
    
    // Auto-sync language when page loads
    document.addEventListener('DOMContentLoaded', () => {
        syncLanguageToCookie();
    });
    
    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(20px); }
            15% { opacity: 1; transform: translateY(0); }
            85% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(20px); }
        }
    `;
    document.head.appendChild(style);
    
})();
