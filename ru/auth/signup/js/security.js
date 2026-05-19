// ============================================
// БЕЗОПАСНОСТЬ И ВАЛИДАЦИЯ
// ============================================

class SecurityManager {
    constructor() {
        this.failedAttempts = new Map();
        this.blockedIPs = new Map();
        this.rateLimits = new Map();
        this.registrationLocks = new Map();
    }
    
    // ============================================
    // ПРОВЕРКА EMAIL
    // ============================================
    validateEmail(email) {
        if (!email || !email.includes('@')) {
            return { valid: false, code: 'INVALID_FORMAT', message: 'Неверный формат email' };
        }
        
        const [localPart, domain] = email.split('@');
        
        // Проверка локальной части
        if (localPart.length < 1 || localPart.length > 64) {
            return { valid: false, code: 'INVALID_LOCAL', message: 'Неверная локальная часть email' };
        }
        
        // Проверка домена
        if (domain.length < 3 || domain.length > 255) {
            return { valid: false, code: 'INVALID_DOMAIN', message: 'Неверный домен email' };
        }
        
        // Проверка на точку в начале/конце
        if (localPart.startsWith('.') || localPart.endsWith('.')) {
            return { valid: false, code: 'DOT_POSITION', message: 'Точка не может быть в начале или конце' };
        }
        
        // Нормализация домена
        const normalizedDomain = domain.toLowerCase();
        
        // Проверка по чёрному списку
        if (EMAIL_WHITELIST.blocked.includes(normalizedDomain)) {
            return { 
                valid: false, 
                code: 'BLACKLISTED', 
                message: 'Временные почтовые ящики запрещены' 
            };
        }
        
        // Проверка на подозрительные ключевые слова
        for (const keyword of EMAIL_WHITELIST.suspiciousKeywords) {
            if (normalizedDomain.includes(keyword)) {
                return { 
                    valid: false, 
                    code: 'SUSPICIOUS', 
                    message: 'Подозрительный почтовый домен' 
                };
            }
        }
        
        // Проверка по белому списку
        if (!EMAIL_WHITELIST.allowed.includes(normalizedDomain)) {
            return { 
                valid: false, 
                code: 'NOT_ALLOWED', 
                message: 'Регистрация с этим доменом недоступна' 
            };
        }
        
        return { valid: true, code: 'OK', message: '', domain: normalizedDomain };
    }
    
    // ============================================
    // ПРОВЕРКА ИМЕНИ ПОЛЬЗОВАТЕЛЯ
    // ============================================
    validateUsername(username) {
        if (!username) {
            return { valid: false, code: 'EMPTY', message: 'Введите имя пользователя' };
        }
        
        if (username.length < CONFIG.usernameMinLength) {
            return { 
                valid: false, 
                code: 'TOO_SHORT', 
                message: `Минимум ${CONFIG.usernameMinLength} символа` 
            };
        }
        
        if (username.length > CONFIG.usernameMaxLength) {
            return { 
                valid: false, 
                code: 'TOO_LONG', 
                message: `Максимум ${CONFIG.usernameMaxLength} символов` 
            };
        }
        
        // Проверка формата (только буквы, цифры, подчёркивание, дефис)
        const validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(username)) {
            return { 
                valid: false, 
                code: 'INVALID_CHARS', 
                message: 'Только буквы, цифры, дефис и подчёркивание' 
            };
        }
        
        // Проверка на начало с цифры
        if (/^[0-9]/.test(username)) {
            return { 
                valid: false, 
                code: 'STARTS_WITH_NUMBER', 
                message: 'Имя не может начинаться с цифры' 
            };
        }
        
        // Проверка по чёрному списку
        const lowerUsername = username.toLowerCase();
        for (const blocked of USERNAME_BLACKLIST) {
            if (lowerUsername === blocked || lowerUsername.includes(blocked)) {
                return { 
                    valid: false, 
                    code: 'BLACKLISTED', 
                    message: 'Это имя пользователя недоступно' 
                };
            }
        }
        
        return { valid: true, code: 'OK', message: '' };
    }
    
    // ============================================
    // ПРОВЕРКА ИМЕНИ
    // ============================================
    validateName(name) {
        if (!name) {
            return { valid: false, code: 'EMPTY', message: 'Введите имя' };
        }
        
        if (name.length < CONFIG.nameMinLength) {
            return { 
                valid: false, 
                code: 'TOO_SHORT', 
                message: `Минимум ${CONFIG.nameMinLength} символа` 
            };
        }
        
        if (name.length > CONFIG.nameMaxLength) {
            return { 
                valid: false, 
                code: 'TOO_LONG', 
                message: `Максимум ${CONFIG.nameMaxLength} символов` 
            };
        }
        
        // Проверка на буквы и пробелы
        const validPattern = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
        if (!validPattern.test(name)) {
            return { 
                valid: false, 
                code: 'INVALID_CHARS', 
                message: 'Имя может содержать только буквы' 
            };
        }
        
        // Проверка по чёрному списку
        const lowerName = name.toLowerCase();
        for (const blocked of NAME_BLACKLIST) {
            if (lowerName.includes(blocked)) {
                return { 
                    valid: false, 
                    code: 'BLACKLISTED', 
                    message: 'Это имя недоступно' 
                };
            }
        }
        
        return { valid: true, code: 'OK', message: '' };
    }
    
    // ============================================
    // ПРОВЕРКА ПАРОЛЯ
    // ============================================
    validatePassword(password) {
        if (!password) {
            return { 
                valid: false, 
                score: 0, 
                code: 'EMPTY', 
                message: 'Введите пароль',
                requirements: [] 
            };
        }
        
        let score = 0;
        const requirements = [];
        
        // Длина
        if (password.length >= CONFIG.passwordMinLength) {
            score++;
        } else {
            requirements.push(`минимум ${CONFIG.passwordMinLength} символов`);
        }
        
        // Заглавные буквы
        if (/[A-Z]/.test(password)) {
            score++;
        } else {
            requirements.push('заглавные буквы (A-Z)');
        }
        
        // Цифры
        if (/[0-9]/.test(password)) {
            score++;
        } else {
            requirements.push('цифры (0-9)');
        }
        
        // Спецсимволы
        if (/[^A-Za-z0-9]/.test(password)) {
            score++;
        } else {
            requirements.push('спецсимволы (!@#$%...)');
        }
        
        // Проверка на простые пароли
        const commonPasswords = [
            'password', '12345678', 'qwerty123', 'admin123',
            'password123', '123456789', 'qwertyuiop'
        ];
        
        if (commonPasswords.includes(password.toLowerCase())) {
            return { 
                valid: false, 
                score: 0, 
                code: 'COMMON', 
                message: 'Слишком простой пароль',
                requirements: ['используйте уникальный пароль'] 
            };
        }
        
        const strengthLabels = ['', 'Слабый', 'Средний', 'Хороший', 'Отличный'];
        
        return {
            valid: score >= 3,
            score: score,
            code: score >= 3 ? 'OK' : 'WEAK',
            message: strengthLabels[score],
            requirements: requirements
        };
    }
    
    // ============================================
    // ПРОВЕРКА ВОЗРАСТА
    // ============================================
    calculateAge(day, month, year) {
        const birthDay = parseInt(day);
        const birthMonth = parseInt(month);
        const birthYear = parseInt(year);
        
        if (isNaN(birthDay) || isNaN(birthMonth) || isNaN(birthYear)) {
            return { valid: false, age: 0, group: '<13' };
        }
        
        const today = new Date();
        const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        // Определение возрастной группы
        let group;
        if (age < 13) group = '<13';
        else if (age < 16) group = '13+';
        else if (age < 18) group = '16+';
        else if (age < 20) group = '18+';
        else if (age < 30) group = '20+';
        else if (age < 40) group = '30+';
        else if (age < 50) group = '40+';
        else if (age < 60) group = '50+';
        else if (age < 70) group = '60+';
        else if (age < 80) group = '70+';
        else if (age < 90) group = '80+';
        else if (age < 100) group = '90+';
        else group = '100+';
        
        return {
            valid: age >= CONFIG.minAge,
            age: age,
            group: group,
            canRegister: age >= CONFIG.minAge
        };
    }
    
    // ============================================
    // RATE LIMITING
    // ============================================
    checkRateLimit(key) {
        const now = Date.now();
        const attempts = this.rateLimits.get(key) || [];
        
        // Очистка старых попыток
        const recentAttempts = attempts.filter(time => now - time < CONFIG.rateLimitWindow);
        this.rateLimits.set(key, recentAttempts);
        
        if (recentAttempts.length >= CONFIG.maxLoginAttempts) {
            const oldestAttempt = recentAttempts[0];
            const timeLeft = Math.ceil((CONFIG.rateLimitWindow - (now - oldestAttempt)) / 1000);
            return { limited: true, timeLeft: timeLeft };
        }
        
        recentAttempts.push(now);
        this.rateLimits.set(key, recentAttempts);
        return { limited: false };
    }
    
    // ============================================
    // БЛОКИРОВКА IP
    // ============================================
    checkIPBlock(ip) {
        const blockData = this.blockedIPs.get(ip);
        
        if (blockData) {
            const timeLeft = blockData.until - Date.now();
            
            if (timeLeft > 0) {
                return { 
                    blocked: true, 
                    timeLeft: Math.ceil(timeLeft / 1000),
                    reason: blockData.reason 
                };
            } else {
                this.blockedIPs.delete(ip);
            }
        }
        
        return { blocked: false };
    }
    
    blockIP(ip, reason = 'Превышен лимит попыток') {
        const until = Date.now() + CONFIG.blockDuration;
        this.blockedIPs.set(ip, { until, reason });
        
        console.warn(`🚫 IP заблокирован: ${maskIP(ip)} на ${CONFIG.blockDuration / 60000} минут`);
    }
    
    // ============================================
    // БЛОКИРОВКА РЕГИСТРАЦИИ
    // ============================================
    async acquireRegistrationLock(email) {
        if (this.registrationLocks.has(email)) {
            const lockTime = this.registrationLocks.get(email);
            if (Date.now() - lockTime < 10000) {
                return false;
            }
        }
        
        this.registrationLocks.set(email, Date.now());
        return true;
    }
    
    releaseRegistrationLock(email) {
        this.registrationLocks.delete(email);
    }
    
    // ============================================
    // ПОЛУЧЕНИЕ ИНФОРМАЦИИ ОБ УСТРОЙСТВЕ
    // ============================================
    getDeviceInfo() {
        const ua = navigator.userAgent;
        let deviceType = 'desktop';
        let os = 'Unknown';
        let browser = 'Unknown';
        
        // Определение устройства
        if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
            deviceType = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
        }
        
        // Определение ОС
        if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Mac/i.test(ua)) os = 'macOS';
        else if (/Linux/i.test(ua)) os = 'Linux';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';
        
        // Определение браузера
        if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
        else if (/Firefox/i.test(ua)) browser = 'Firefox';
        else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
        else if (/Edge/i.test(ua)) browser = 'Edge';
        else if (/Opera|OPR/i.test(ua)) browser = 'Opera';
        
        return {
            userAgent: ua,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            deviceType: deviceType,
            os: os,
            browser: browser,
            cookiesEnabled: navigator.cookieEnabled,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
    
    // ============================================
    // ХЕШИРОВАНИЕ EMAIL (для хранения)
    // ============================================
    async hashEmail(email) {
        const encoder = new TextEncoder();
        const data = encoder.encode(email.toLowerCase().trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // ============================================
    // САНИТАЙЗИНГ (очистка ввода)
    // ============================================
    sanitizeInput(input) {
        if (!input) return '';
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .trim();
    }
    
    // ============================================
    // ЛОГИРОВАНИЕ ОШИБОК
    // ============================================
    logError(error, context = {}) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            message: error.message || String(error),
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            context: context
        };
        
        console.error('❌ Ошибка:', errorLog);
        
        // Сохранение в localStorage для отладки
        try {
            const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
            errors.push(errorLog);
            if (errors.length > 50) errors.shift();
            localStorage.setItem('errorLog', JSON.stringify(errors));
        } catch (e) {
            console.warn('Не удалось сохранить лог ошибки');
        }
    }
}

// Создание глобального экземпляра
const security = new SecurityManager();

console.log('🔒 Модуль безопасности загружен');
