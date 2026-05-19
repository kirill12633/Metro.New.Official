// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

class Utils {
    constructor() {
        this.debounceTimers = new Map();
    }
    
    // ============================================
    // DEBOUNCE (задержка выполнения)
    // ============================================
    debounce(key, callback, delay = 300) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        this.debounceTimers.set(key, setTimeout(() => {
            callback();
            this.debounceTimers.delete(key);
        }, delay));
    }
    
    // ============================================
    // ФОРМАТИРОВАНИЕ ДАТЫ
    // ============================================
    formatDate(timestamp) {
        if (!timestamp) return 'Неизвестно';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        
        return date.toLocaleDateString('ru-RU', options);
    }
    
    // ============================================
    // ГЕНЕРАЦИЯ СЛУЧАЙНОЙ СТРОКИ
    // ============================================
    generateRandomString(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }
    
    // ============================================
    // ПРОВЕРКА ПОДДЕРЖКИ БРАУЗЕРА
    // ============================================
    checkBrowserSupport() {
        const features = {
            localStorage: !!window.localStorage,
            sessionStorage: !!window.sessionStorage,
            fetch: !!window.fetch,
            crypto: !!window.crypto && !!window.crypto.subtle,
            indexedDB: !!window.indexedDB
        };
        
        const unsupported = Object.entries(features)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        if (unsupported.length > 0) {
            console.warn('Браузер не поддерживает:', unsupported.join(', '));
            return false;
        }
        
        return true;
    }
    
    // ============================================
    // ПОЛУЧЕНИЕ ПАРАМЕТРОВ URL
    // ============================================
    getURLParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    // ============================================
    // УСТАНОВКА COOKIE
    // ============================================
    setCookie(name, value, days = 30) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    }
    
    // ============================================
    // ПОЛУЧЕНИЕ COOKIE
    // ============================================
    getCookie(name) {
        const cookieName = `${name}=`;
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length);
            }
        }
        
        return null;
    }
    
    // ============================================
    // УДАЛЕНИЕ COOKIE
    // ============================================
    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
    
    // ============================================
    // КОПИРОВАНИЕ В БУФЕР ОБМЕНА
    // ============================================
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Не удалось скопировать:', error);
            return false;
        }
    }
    
    // ============================================
    // ОТПРАВКА ОТЧЁТА ОБ ОШИБКЕ
    // ============================================
    reportError() {
        const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
        const lastErrors = errors.slice(-3).map(e => 
            `${e.timestamp}: ${e.message}`
        ).join('\n');
        
        const subject = encodeURIComponent('Ошибка на сайте Метро New');
        const body = encodeURIComponent(
            `Опишите проблему:\n` +
            `------------------------\n` +
            `Техническая информация:\n` +
            `${lastErrors}\n\n` +
            `User Agent: ${navigator.userAgent}\n` +
            `URL: ${window.location.href}\n` +
            `Время: ${new Date().toLocaleString()}`
        );
        
        window.location.href = `mailto:${CONFIG.supportEmail}?subject=${subject}&body=${body}`;
    }
    
    // ============================================
    // ОБНОВЛЕНИЕ ГОДА В ФУТЕРЕ
    // ============================================
    updateCopyrightYear() {
        const element = document.getElementById('copyrightYear');
        if (element) {
            element.textContent = `© ${new Date().getFullYear()} Метро New. Все права защищены.`;
        }
    }
    
    // ============================================
    // ЗАПОЛНЕНИЕ ВЫПАДАЮЩИХ СПИСКОВ ДАТ
    // ============================================
    fillDateSelectors() {
        const daySelect = document.getElementById('birthDay');
        const yearSelect = document.getElementById('birthYear');
        
        if (!daySelect || !yearSelect) return;
        
        // Заполнение дней
        daySelect.innerHTML = '<option value="">День</option>';
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
        
        // Заполнение годов
        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '<option value="">Год</option>';
        for (let i = currentYear; i >= currentYear - 100; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }
    }
    
    // ============================================
    // ПОЛУЧЕНИЕ СТРАНЫ ПОЛЬЗОВАТЕЛЯ
    // ============================================
    async getUserCountry() {
        try {
            const response = await fetch('https://ipapi.co/country_code/');
            const country = await response.text();
            return country.trim() || 'UNKNOWN';
        } catch (error) {
            return 'UNKNOWN';
        }
    }
    
    // ============================================
    // ПРОВЕРКА НА БОТА
    // ============================================
    isBot() {
        const ua = navigator.userAgent.toLowerCase();
        const botPatterns = [
            'bot', 'crawler', 'spider', 'scraper',
            'curl', 'wget', 'python', 'java',
            'headless', 'phantom', 'selenium'
        ];
        
        for (const pattern of botPatterns) {
            if (ua.includes(pattern)) {
                return true;
            }
        }
        
        // Проверка на отсутствие навигационных свойств
        if (!navigator.webdriver === false) {
            return true;
        }
        
        return false;
    }
    
    // ============================================
    // СОЗДАНИЕ ЗАДЕРЖКИ
    // ============================================
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ============================================
    // БЕЗОПАСНЫЙ JSON ПАРСИНГ
    // ============================================
    safeJSONParse(str, fallback = null) {
        try {
            return JSON.parse(str);
        } catch (error) {
            return fallback;
        }
    }
}

// Создание глобального экземпляра
const utils = new Utils();

console.log('🛠️ Модуль утилит загружен');
