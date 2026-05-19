// ============================================
// КОНФИГУРАЦИЯ И НАСТРОЙКИ
// ============================================

const CONFIG = {
    // Версии документов
    termsVersion: '1.2',
    privacyVersion: '1.1',
    
    // Возрастные ограничения
    minAge: 13,
    maxAge: 100,
    
    // Ограничения
    usernameMinLength: 3,
    usernameMaxLength: 20,
    passwordMinLength: 8,
    nameMinLength: 2,
    nameMaxLength: 30,
    
    // Rate limiting
    maxLoginAttempts: 5,
    maxRegistrationAttempts: 3,
    rateLimitWindow: 60000, // 1 минута
    blockDuration: 30 * 60 * 1000, // 30 минут
    
    // Таймеры
    resendEmailCooldown: 60, // секунд
    usernameCheckDelay: 500, // миллисекунд
    
    // Email поддержки
    supportEmail: 'metro.new.help@gmail.com',
    
    // Ссылки
    termsUrl: 'https://docs.google.com/document/d/e/2PACX-1vQ86klpumdzVv8phucQPYhv-ZSqS75ZpQB0t8NdSmPu7zo0EY3tesGqFgiPscv5cp-5ouw8oRHeyFwG/pub',
    privacyUrl: 'https://docs.google.com/document/d/e/2PACX-1vRvligepysBxTXy4KcWzNquDcvaKLr9E4rO6_KuKUr0ELwDlq8qafWuiGY7aM4wDmZ24XNmBahgoh8t/pub',
    helpUrl: 'https://kirill12633.github.io/Metro.New.Official/ru/help/',
    parentsUrl: 'https://kirill12633.github.io/Metro.New.Official/ru/help/parents/',
    loginUrl: 'https://kirill12633.github.io/Metro.New.Official/ru/auth/login/',
    homeUrl: 'https://kirill12633.github.io/Metro.New.Official/ru/',
    
    // Страница с которой подана заявка на создание
    registrationPage: window.location.href,
    
    // Возрастные группы
    ageGroups: ['<13', '13+', '16+', '18+', '20+', '30+', '40+', '50+', '60+', '70+', '80+', '90+', '100+'],
    
    // Типы устройств
    deviceTypes: ['desktop', 'mobile', 'tablet', 'unknown']
};

// ============================================
// БЕЛЫЙ СПИСОК ПОЧТОВЫХ ДОМЕНОВ
// ============================================

const EMAIL_WHITELIST = {
    // Разрешённые домены
    allowed: [
        // Российские
        'mail.ru', 'list.ru', 'bk.ru', 'inbox.ru',
        'yandex.ru', 'yandex.com', 'ya.ru',
        'rambler.ru', 'lenta.ru', 'ro.ru',
        
        // Международные
        'gmail.com', 'googlemail.com',
        'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
        'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
        'protonmail.com', 'proton.me',
        'icloud.com', 'me.com', 'mac.com',
        'aol.com', 'aim.com',
        'zoho.com', 'zohomail.com',
        'gmx.com', 'gmx.de', 'gmx.net',
        'web.de', 't-online.de',
        'qq.com', '163.com', '126.com', 'sina.com',
        
        // Образовательные
        'edu.ru', 'edu.com', 'edu.org',
        'student.ru', 'study.com',
        
        // Корпоративные (можно расширить)
        'corp.ru', 'company.com'
    ],
    
    // Запрещённые (временные почты)
    blocked: [
        'temp-mail.org', '10minutemail.com', '10minutemail.net',
        'guerrillamail.com', 'guerrillamail.org', 'guerrillamail.net',
        'guerrillamail.biz', 'guerrillamail.de',
        'mailinator.com', 'mailinator.net', 'mailinator.org',
        'yopmail.com', 'yopmail.fr', 'yopmail.net',
        'throwaway.com', 'throwaway.email',
        'trashmail.com', 'trashmail.net',
        'sharklasers.com', 'sharklasers.net',
        'dispostable.com', 'dispostable.net',
        'fakeinbox.com', 'fakemail.net',
        'tempmail.com', 'tempmail.net', 'tempmail.org',
        'tempr.email', 'temp.email',
        'maildrop.cc', 'maildrop.com',
        'getnada.com', 'nada.email',
        'spam4.me', 'spam.com',
        'wegwerfmail.de', 'wegwerfmail.net',
        'trash-mail.com', 'trashmail.de',
        'einrot.com', 'einrot.de',
        'mintemail.com', 'mintemail.net',
        'opayq.com', 'opayq.net',
        'mytrashmail.com', 'mytrashmail.net'
    ],
    
    // Подозрительные ключевые слова в домене
    suspiciousKeywords: [
        'temp', 'temporary', 'disposable', 'throwaway',
        'trash', 'spam', 'fake', 'dump', 'junk',
        'burner', 'one-time', '10min', '10minute',
        'guerrilla', 'sharklaser', 'nada', 'yop'
    ]
};

// ============================================
// ЗАПРЕЩЁННЫЕ ИМЕНА ПОЛЬЗОВАТЕЛЕЙ
// ============================================

const USERNAME_BLACKLIST = [
    // Системные
    'admin', 'administrator', 'root', 'system', 'sys',
    'moderator', 'mod', 'moderation',
    'support', 'help', 'info', 'contact',
    'metro', 'metronew', 'metro_new', 'metro-new',
    'official', 'team', 'staff',
    
    // Неприличные (можно расширить)
    'fuck', 'shit', 'ass', 'bitch', 'dick',
    'porn', 'sex', 'xxx', 'adult',
    
    // Обманные
    'security', 'secure', 'verify', 'verification',
    'password', 'passwd', 'login',
    
    // Социальные
    'bot', 'spam', 'scam', 'hack',
    'test', 'testing', 'demo', 'example',
    'null', 'undefined', 'none', 'anonymous'
];

// ============================================
// ЗАПРЕЩЁННЫЕ СЛОВА В ИМЕНИ
// ============================================

const NAME_BLACKLIST = [
    'admin', 'administrator', 'root', 'system',
    'moderator', 'support', 'test', 'user',
    'fuck', 'shit', 'ass', 'bitch',
    'spam', 'bot', 'scam'
];

// ============================================
// НАСТРОЙКИ ОТОБРАЖЕНИЯ EMAIL
// ============================================

function maskEmail(email) {
    if (!email || !email.includes('@')) return '***@***.***';
    
    const [localPart, domain] = email.split('@');
    
    if (localPart.length <= 4) {
        return localPart[0] + '***@' + domain;
    }
    
    return localPart.substring(0, 3) + '***' + localPart.substring(localPart.length - 1) + '@' + domain;
}

function maskIP(ip) {
    if (!ip) return '*.*.*.*';
    
    const parts = ip.split('.');
    if (parts.length !== 4) return '*.*.*.*';
    
    return parts[0] + '.*.*.' + parts[3];
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        EMAIL_WHITELIST,
        USERNAME_BLACKLIST,
        NAME_BLACKLIST,
        maskEmail,
        maskIP
    };
}

console.log('✅ Конфигурация загружена');
console.log('📧 Белый список почт:', EMAIL_WHITELIST.allowed.length, 'доменов');
console.log('🚫 Чёрный список:', EMAIL_WHITELIST.blocked.length, 'доменов');
console.log('👤 Запрещённых имён:', USERNAME_BLACKLIST.length);
