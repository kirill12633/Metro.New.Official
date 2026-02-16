// ============================================
// ЧЕРНЫЙ СПИСОК EMAIL
// ============================================

const EmailBlacklist = {
    // ========== ВРЕМЕННЫЕ ПОЧТЫ ==========
    temporaryDomains: [
        'tempmail.com',
        'temp-mail.org',
        '10minutemail.com',
        'guerrillamail.com',
        'yopmail.com',
        'mailinator.com',
        'throwaway.com',
        'sharklasers.com',
        'grr.la',
        'spam4.me',
        'trashmail.com',
        'fakeinbox.com',
        'dispostable.com',
        'mailcatch.com',
        'getnada.com',
        'tempinbox.com',
        'tempail.com',
        'mohmal.com',
        'emailfake.com',
        'tempr.email'
    ],

    // ========== ЗАБЛОКИРОВАННЫЕ ПОЛНЫЕ АДРЕСА ==========
    blockedEmails: [
        'spam@mail.ru',
        'bot@yandex.ru',
        'fake@gmail.com',
        'test@test.com',
        'admin@admin.com',
        'user@user.com'
    ],

    // ========== ЗАПРЕЩЕННЫЕ СИМВОЛЫ ==========
    forbiddenChars: [
        '--', '..', '__', '++',
        '===', '%%', '$$', '##'
    ],

    // ========== ОСНОВНАЯ ПРОВЕРКА ==========
    check(email) {
        const result = {
            isValid: true,
            blocked: false,
            reason: '',
            suggestions: []
        };

        if (!email || !email.includes('@')) {
            result.isValid = false;
            result.reason = 'Неверный формат email';
            return result;
        }

        const [localPart, domain] = email.toLowerCase().split('@');

        // Проверка на временные домены
        if (this.temporaryDomains.includes(domain)) {
            result.isValid = false;
            result.blocked = true;
            result.reason = 'Временные почты запрещены. Используйте постоянный email';
            return result;
        }

        // Проверка на заблокированные адреса
        if (this.blockedEmails.includes(email.toLowerCase())) {
            result.isValid = false;
            result.blocked = true;
            result.reason = 'Этот email заблокирован';
            return result;
        }

        // Проверка на запрещенные символы
        for (let chars of this.forbiddenChars) {
            if (localPart.includes(chars)) {
                result.isValid = false;
                result.reason = `Email содержит запрещенные символы: ${chars}`;
                return result;
            }
        }

        // Проверка длины
        if (localPart.length < 3) {
            result.isValid = false;
            result.reason = 'Слишком короткий логин';
            return result;
        }

        if (localPart.length > 64) {
            result.isValid = false;
            result.reason = 'Слишком длинный логин';
            return result;
        }

        // Генерация предложений если есть точка
        if (localPart.includes('.')) {
            const withoutDots = localPart.replace(/\./g, '');
            result.suggestions.push(`${withoutDots}@${domain}`);
        }

        return result;
    },

    // ========== ДОБАВИТЬ В ЧЕРНЫЙ СПИСОК ==========
    block(domain, type = 'domain') {
        if (type === 'domain') {
            this.temporaryDomains.push(domain);
        } else {
            this.blockedEmails.push(domain);
        }
        console.log(`✅ Добавлено в черный список: ${domain}`);
    },

    // ========== ПРОВЕРКА НА ОДНОРАЗОВЫЕ ПОЧТЫ ==========
    isTemporary(email) {
        const domain = email.split('@')[1].toLowerCase();
        return this.temporaryDomains.includes(domain);
    },

    // ========== ПОЛУЧИТЬ СТАТИСТИКУ ==========
    getStats() {
        return {
            temporaryDomains: this.temporaryDomains.length,
            blockedEmails: this.blockedEmails.length,
            total: this.temporaryDomains.length + this.blockedEmails.length
        };
    }
};

// ========== ЭКСПОРТ ==========
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailBlacklist;
} else {
    window.EmailBlacklist = EmailBlacklist;
}

// ========== ТЕСТ ==========
/*
console.log('=== ТЕСТ ЧЕРНОГО СПИСКА EMAIL ===');
console.log(EmailBlacklist.check('test@tempmail.com'));
console.log(EmailBlacklist.check('normal@gmail.com'));
console.log(EmailBlacklist.isTemporary('test@10minutemail.com'));
console.log('Статистика:', EmailBlacklist.getStats());
*/
