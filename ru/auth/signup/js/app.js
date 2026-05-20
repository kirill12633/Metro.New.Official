// ============================================
// ОБРАБОТКА ДАННЫХ И ЛОГИКА
// ============================================

var AppData = {
    
    // Сохранение данных пользователя
    saveUserData: async function(userData) {
        var data = {
            firstName: userData.firstName,
            username: userData.username,
            email: maskEmail(userData.email),
            age: security.calculateAge(userData.birthDay, userData.birthMonth, userData.birthYear).age,
            ageGroup: security.calculateAge(userData.birthDay, userData.birthMonth, userData.birthYear).group,
            createdAt: new Date().toISOString(),
            ip: await this.getIP(),
            country: await this.getCountry()
        };
        
        // Сохранение в localStorage как резерв
        var users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        users.push(data);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        return data;
    },
    
    // Получение IP
    getIP: async function() {
        try {
            var resp = await fetch('https://api.ipify.org?format=json');
            var data = await resp.json();
            return data.ip;
        } catch(e) {
            return 'unknown';
        }
    },
    
    // Получение страны
    getCountry: async function() {
        try {
            var resp = await fetch('https://ipapi.co/country_name/');
            var country = await resp.text();
            return country.trim() || 'unknown';
        } catch(e) {
            return 'unknown';
        }
    },
    
    // Валидация всех данных
    validateAll: function(data) {
        var errors = [];
        
        if (!security.validateName(data.firstName).valid) {
            errors.push('Некорректное имя');
        }
        
        if (!security.validateUsername(data.username).valid) {
            errors.push('Некорректный никнейм');
        }
        
        if (!security.validateEmail(data.email).valid) {
            errors.push('Некорректный email');
        }
        
        if (!security.validatePassword(data.password).valid) {
            errors.push('Слабый пароль');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    // Форматирование данных для Firestore
    formatForFirestore: function(userData) {
        return {
            uid: userData.uid || '',
            email: maskEmail(userData.email),
            emailHash: userData.emailHash || '',
            firstName: security.sanitizeInput(userData.firstName),
            username: security.sanitizeInput(userData.username.toLowerCase()),
            displayName: security.sanitizeInput(userData.firstName),
            birthDate: {
                day: parseInt(userData.birthDay),
                month: parseInt(userData.birthMonth),
                year: parseInt(userData.birthYear)
            },
            age: userData.age || 0,
            ageGroup: userData.ageGroup || '<13',
            marketingConsent: userData.marketingConsent || false,
            termsAccepted: true,
            privacyAccepted: true,
            createdAt: new Date().toISOString()
        };
    }
};

console.log('📦 Модуль обработки данных загружен');
