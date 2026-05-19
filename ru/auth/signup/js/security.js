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
    
    validateEmail(email) {
        if (!email || !email.includes('@')) {
            return { valid: false, code: 'INVALID_FORMAT', message: 'Неверный формат email' };
        }
        
        var parts = email.split('@');
        var localPart = parts[0];
        var domain = parts[1];
        
        if (localPart.length < 1 || localPart.length > 64) {
            return { valid: false, code: 'INVALID_LOCAL', message: 'Неверная локальная часть email' };
        }
        
        if (domain.length < 3 || domain.length > 255) {
            return { valid: false, code: 'INVALID_DOMAIN', message: 'Неверный домен email' };
        }
        
        if (localPart.startsWith('.') || localPart.endsWith('.')) {
            return { valid: false, code: 'DOT_POSITION', message: 'Точка не может быть в начале или конце' };
        }
        
        var normalizedDomain = domain.toLowerCase();
        
        if (EMAIL_WHITELIST.blocked.indexOf(normalizedDomain) !== -1) {
            return { valid: false, code: 'BLACKLISTED', message: 'Временные почтовые ящики запрещены' };
        }
        
        for (var i = 0; i < EMAIL_WHITELIST.suspiciousKeywords.length; i++) {
            if (normalizedDomain.indexOf(EMAIL_WHITELIST.suspiciousKeywords[i]) !== -1) {
                return { valid: false, code: 'SUSPICIOUS', message: 'Подозрительный почтовый домен' };
            }
        }
        
        if (EMAIL_WHITELIST.allowed.indexOf(normalizedDomain) === -1) {
            return { valid: false, code: 'NOT_ALLOWED', message: 'Регистрация с этим доменом недоступна' };
        }
        
        return { valid: true, code: 'OK', message: '', domain: normalizedDomain };
    }
    
    validateUsername(username) {
        if (!username) {
            return { valid: false, code: 'EMPTY', message: 'Введите имя пользователя' };
        }
        
        if (username.length < CONFIG.usernameMinLength) {
            return { valid: false, code: 'TOO_SHORT', message: 'Минимум ' + CONFIG.usernameMinLength + ' символа' };
        }
        
        if (username.length > CONFIG.usernameMaxLength) {
            return { valid: false, code: 'TOO_LONG', message: 'Максимум ' + CONFIG.usernameMaxLength + ' символов' };
        }
        
        var validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(username)) {
            return { valid: false, code: 'INVALID_CHARS', message: 'Только буквы, цифры, дефис и подчёркивание' };
        }
        
        if (/^[0-9]/.test(username)) {
            return { valid: false, code: 'STARTS_WITH_NUMBER', message: 'Имя не может начинаться с цифры' };
        }
        
        var lowerUsername = username.toLowerCase();
        for (var i = 0; i < USERNAME_BLACKLIST.length; i++) {
            if (lowerUsername === USERNAME_BLACKLIST[i] || lowerUsername.indexOf(USERNAME_BLACKLIST[i]) !== -1) {
                return { valid: false, code: 'BLACKLISTED', message: 'Это имя пользователя недоступно' };
            }
        }
        
        return { valid: true, code: 'OK', message: '' };
    }
    
    validateName(name) {
        if (!name) {
            return { valid: false, code: 'EMPTY', message: 'Введите имя' };
        }
        
        if (name.length < CONFIG.nameMinLength) {
            return { valid: false, code: 'TOO_SHORT', message: 'Минимум ' + CONFIG.nameMinLength + ' символа' };
        }
        
        if (name.length > CONFIG.nameMaxLength) {
            return { valid: false, code: 'TOO_LONG', message: 'Максимум ' + CONFIG.nameMaxLength + ' символов' };
        }
        
        var validPattern = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
        if (!validPattern.test(name)) {
            return { valid: false, code: 'INVALID_CHARS', message: 'Имя может содержать только буквы' };
        }
        
        var lowerName = name.toLowerCase();
        for (var i = 0; i < NAME_BLACKLIST.length; i++) {
            if (lowerName.indexOf(NAME_BLACKLIST[i]) !== -1) {
                return { valid: false, code: 'BLACKLISTED', message: 'Это имя недоступно' };
            }
        }
        
        return { valid: true, code: 'OK', message: '' };
    }
    
    validatePassword(password) {
        if (!password) {
            return { valid: false, score: 0, code: 'EMPTY', message: 'Введите пароль', requirements: [] };
        }
        
        var score = 0;
        var requirements = [];
        
        if (password.length >= CONFIG.passwordMinLength) {
            score++;
        } else {
            requirements.push('минимум ' + CONFIG.passwordMinLength + ' символов');
        }
        
        if (/[A-Z]/.test(password)) {
            score++;
        } else {
            requirements.push('заглавные буквы (A-Z)');
        }
        
        if (/[0-9]/.test(password)) {
            score++;
        } else {
            requirements.push('цифры (0-9)');
        }
        
        if (/[^A-Za-z0-9]/.test(password)) {
            score++;
        } else {
            requirements.push('спецсимволы (!@#$%...)');
        }
        
        var commonPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'password123', '123456789', 'qwertyuiop'];
        
        if (commonPasswords.indexOf(password.toLowerCase()) !== -1) {
            return { valid: false, score: 0, code: 'COMMON', message: 'Слишком простой пароль', requirements: ['используйте уникальный пароль'] };
        }
        
        var strengthLabels = ['', 'Слабый', 'Средний', 'Хороший', 'Отличный'];
        
        return {
            valid: score >= 3,
            score: score,
            code: score >= 3 ? 'OK' : 'WEAK',
            message: strengthLabels[score],
            requirements: requirements
        };
    }
    
    calculateAge(day, month, year) {
        var birthDay = parseInt(day);
        var birthMonth = parseInt(month);
        var birthYear = parseInt(year);
        
        if (isNaN(birthDay) || isNaN(birthMonth) || isNaN(birthYear)) {
            return { valid: false, age: 0, group: '<13' };
        }
        
        var today = new Date();
        var birthDate = new Date(birthYear, birthMonth - 1, birthDay);
        var age = today.getFullYear() - birthDate.getFullYear();
        var monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        var group;
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
        
        return { valid: age >= CONFIG.minAge, age: age, group: group, canRegister: age >= CONFIG.minAge };
    }
    
    checkRateLimit(key) {
        var now = Date.now();
        var attempts = this.rateLimits.get(key) || [];
        var recentAttempts = attempts.filter(function(time) { return now - time < CONFIG.rateLimitWindow; });
        this.rateLimits.set(key, recentAttempts);
        
        if (recentAttempts.length >= CONFIG.maxLoginAttempts) {
            var oldestAttempt = recentAttempts[0];
            var timeLeft = Math.ceil((CONFIG.rateLimitWindow - (now - oldestAttempt)) / 1000);
            return { limited: true, timeLeft: timeLeft };
        }
        
        recentAttempts.push(now);
        this.rateLimits.set(key, recentAttempts);
        return { limited: false };
    }
    
    checkIPBlock(ip) {
        var blockData = this.blockedIPs.get(ip);
        if (blockData) {
            var timeLeft = blockData.until - Date.now();
            if (timeLeft > 0) {
                return { blocked: true, timeLeft: Math.ceil(timeLeft / 1000), reason: blockData.reason };
            } else {
                this.blockedIPs.delete(ip);
            }
        }
        return { blocked: false };
    }
    
    blockIP(ip, reason) {
        if (!reason) reason = 'Превышен лимит попыток';
        var until = Date.now() + CONFIG.blockDuration;
        this.blockedIPs.set(ip, { until: until, reason: reason });
        console.warn('🚫 IP заблокирован: ' + maskIP(ip) + ' на ' + (CONFIG.blockDuration / 60000) + ' минут');
    }
    
    async acquireRegistrationLock(email) {
        if (this.registrationLocks.has(email)) {
            var lockTime = this.registrationLocks.get(email);
            if (Date.now() - lockTime < 10000) return false;
        }
        this.registrationLocks.set(email, Date.now());
        return true;
    }
    
    releaseRegistrationLock(email) {
        this.registrationLocks.delete(email);
    }
    
    getDeviceInfo() {
        var ua = navigator.userAgent;
        var deviceType = 'desktop';
        var os = 'Unknown';
        var browser = 'Unknown';
        
        if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
            deviceType = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
        }
        
        if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Mac/i.test(ua)) os = 'macOS';
        else if (/Linux/i.test(ua)) os = 'Linux';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';
        
        if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
        else if (/Firefox/i.test(ua)) browser = 'Firefox';
        else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
        else if (/Edge/i.test(ua)) browser = 'Edge';
        else if (/Opera|OPR/i.test(ua)) browser = 'Opera';
        
        return {
            userAgent: ua,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: window.screen.width + 'x' + window.screen.height,
            deviceType: deviceType,
            os: os,
            browser: browser,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
    
    async hashEmail(email) {
        var encoder = new TextEncoder();
        var data = encoder.encode(email.toLowerCase().trim());
        var hashBuffer = await crypto.subtle.digest('SHA-256', data);
        var hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    }
    
    sanitizeInput(input) {
        if (!input) return '';
        return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim();
    }
    
    logError(error, context) {
        if (!context) context = {};
        var errorMessage = error.message || String(error);
        
        var expectedErrors = [
            'email-already-in-use', 'user-not-found', 'wrong-password',
            'invalid-credential', 'EMAIL_NOT_VERIFIED', 'username-taken',
            'popup-closed-by-user', 'Missing or insufficient permissions'
        ];
        
        var isExpected = false;
        for (var i = 0; i < expectedErrors.length; i++) {
            if (errorMessage.toLowerCase().indexOf(expectedErrors[i].toLowerCase()) !== -1) {
                isExpected = true;
                break;
            }
        }
        
        if (isExpected) {
            console.warn('ℹ️ ' + errorMessage);
            return;
        }
        
        var errorLog = {
            timestamp: new Date().toISOString(),
            message: errorMessage,
            stack: error.stack || '',
            url: window.location.href,
            userAgent: navigator.userAgent,
            context: context
        };
        
        console.error('❌ Ошибка:', errorLog);
        
        try {
            var errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
            errors.push(errorLog);
            if (errors.length > 50) errors.shift();
            localStorage.setItem('errorLog', JSON.stringify(errors));
        } catch (e) {}
    }
}

// Вспомогательные функции
function maskEmail(email) {
    if (!email || email.indexOf('@') === -1) return '***@***.***';
    var parts = email.split('@');
    var localPart = parts[0];
    var domain = parts[1];
    if (localPart.length <= 2) return localPart[0] + '***@' + domain;
    if (localPart.length <= 4) return localPart[0] + '***' + localPart[localPart.length - 1] + '@' + domain;
    return localPart.substring(0, 3) + '***' + localPart.substring(localPart.length - 1) + '@' + domain;
}

function maskIP(ip) {
    if (!ip || ip === '0.0.0.0') return '*.*.*.*';
    var parts = ip.split('.');
    if (parts.length !== 4) return '*.*.*.*';
    return parts[0] + '.*.*.' + parts[3];
}

var security = new SecurityManager();

console.log('🔒 Модуль безопасности загружен');
