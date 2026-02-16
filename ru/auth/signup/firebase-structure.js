// ============================================
// СТРУКТУРА FIREBASE FIRESTORE
// ============================================

const FirebaseStructure = {
    // ========== КОЛЛЕКЦИИ ==========
    collections: {
        // Публичные данные пользователей
        USERS_PUBLIC: 'users_public',
        
        // Приватные данные (email и т.д.)
        USERS_PRIVATE: 'users_private',
        
        // Юридические согласия
        LEGAL_CONSENTS: 'legal_consents',
        
        // Индекс никнеймов (для быстрой проверки)
        USERNAME_INDEX: 'username_index',
        
        // Индекс email (для быстрой проверки)
        EMAIL_INDEX: 'email_index',
        
        // Заблокированные пользователи
        BANNED_USERS: 'banned_users'
    },

    // ========== СТРУКТУРА USERS_PUBLIC ==========
    getPublicUserData(uid, formData) {
        return {
            uid: uid,
            username: formData.username,
            firstName: formData.firstName,
            lastName: formData.lastName || '',
            displayName: `${formData.firstName} ${formData.lastName || ''}`.trim(),
            avatar: null,
            
            // Возраст
            age: formData.age,
            birthDate: {
                day: parseInt(formData.birthDay),
                month: parseInt(formData.birthMonth),
                year: parseInt(formData.birthYear)
            },
            
            // Метаданные
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            
            // Настройки
            settings: {
                theme: 'auto',
                language: 'ru',
                notifications: true
            },
            
            // Согласия
            agreedToTerms: true,
            agreedToPrivacy: true
        };
    },

    // ========== СТРУКТУРА USERS_PRIVATE ==========
    getPrivateUserData(uid, email, ip) {
        return {
            uid: uid,
            email: email.toLowerCase(),
            emailVerified: false,
            phone: null,
            
            // Безопасность
            lastLogin: new Date().toISOString(),
            lastIp: ip,
            ipHistory: [ip],
            userAgent: navigator.userAgent,
            
            // Статистика
            loginCount: 1,
            lastActivity: new Date().toISOString(),
            
            // Восстановление
            resetPasswordRequested: false,
            resetPasswordToken: null,
            resetPasswordExpires: null
        };
    },

    // ========== СТРУКТУРА LEGAL_CONSENTS ==========
    getLegalConsentData(uid, ip) {
        return {
            uid: uid,
            termsVersion: '1.2',
            privacyVersion: '1.1',
            
            agreedAt: new Date().toISOString(),
            ip: ip,
            userAgent: navigator.userAgent,
            
            // Текст соглашений (на всякий случай)
            termsText: 'Я принимаю пользовательское соглашение...',
            privacyText: 'Я принимаю политику конфиденциальности...',
            
            // Маркетинг (опционально)
            agreedToMarketing: false
        };
    },

    // ========== СТРУКТУРА USERNAME_INDEX ==========
    getUsernameIndexData(username, uid) {
        return {
            username: username.toLowerCase(),
            uid: uid,
            reserved: true,
            reservedAt: new Date().toISOString()
        };
    },

    // ========== ПРАВИЛА FIRESTORE ==========
    getRules() {
        return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Публичные данные - все могут читать, писать только владелец
    match /${this.collections.USERS_PUBLIC}/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    
    // Приватные данные - только владелец
    match /${this.collections.USERS_PRIVATE}/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Юридические согласия - только запись при регистрации
    match /${this.collections.LEGAL_CONSENTS}/{userId} {
      allow read: if false;
      allow write: if request.auth.uid == userId;
    }
    
    // Индексы - для проверки уникальности
    match /${this.collections.USERNAME_INDEX}/{username} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /${this.collections.EMAIL_INDEX}/{email} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Заблокированные
    match /${this.collections.BANNED_USERS}/{userId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
        `;
    },

    // ========== НУЖНЫЕ ИНДЕКСЫ ==========
    getRequiredIndexes() {
        return [
            {
                collection: this.collections.USERS_PUBLIC,
                fields: [
                    { field: 'username', order: 'ASCENDING' },
                    { field: 'createdAt', order: 'DESCENDING' }
                ]
            },
            {
                collection: this.collections.USERS_PUBLIC,
                fields: [
                    { field: 'age', order: 'ASCENDING' },
                    { field: 'createdAt', order: 'DESCENDING' }
                ]
            },
            {
                collection: this.collections.USERNAME_INDEX,
                fields: [
                    { field: 'username', order: 'ASCENDING' },
                    { field: 'reserved', order: 'ASCENDING' }
                ]
            }
        ];
    },

    // ========== СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ ==========
    async createUserInFirestore(db, uid, formData, email, ip
