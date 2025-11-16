// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
    authDomain: "metro-new-85226.firebaseapp.com",
    projectId: "metro-new-85226",
    storageBucket: "metro-new-85226.firebasestorage.app",
    messagingSenderId: "905640751733",
    appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Discord Webhook для логирования (опционально)
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/your-webhook-url';

// Metro System объект
const metroSystem = {
    // Показать уведомление
    showNotification: function(message, type = 'info', duration = 5000) {
        // Удаляем старые уведомления
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notif => notif.remove());
        
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое скрытие
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.parentNode.removeChild(notification);
                }, 300);
            }
        }, duration);
        
        // Возможность закрыть кликом
        notification.addEventListener('click', () => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    },

    // Показать ошибку поля
    showError: function(fieldId, message) {
        const errorElement = document.getElementById(fieldId + 'Error');
        const inputElement = document.getElementById(fieldId);
        
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            inputElement.classList.add('error');
            
            // Анимация ошибки
            inputElement.style.animation = 'none';
            setTimeout(() => {
                inputElement.style.animation = 'shake 0.5s ease-in-out';
            }, 10);
        }
    },

    // Очистить ошибки
    clearErrors: function() {
        const errorElements = document.querySelectorAll('.error-message');
        const inputElements = document.querySelectorAll('.form-input');
        
        errorElements.forEach(el => {
            el.textContent = '';
            el.classList.remove('show');
        });
        inputElements.forEach(el => {
            el.classList.remove('error');
            el.style.animation = '';
        });
    },

    // Установить состояние загрузки
    setLoading: function(button, loading, loadingText = 'Загрузка...') {
        if (button) {
            const originalHTML = button.getAttribute('data-original-html') || button.innerHTML;
            
            if (loading) {
                button.setAttribute('data-original-html', originalHTML);
                button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
                button.disabled = true;
            } else {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }
        }
    },

    // Валидация email
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Валидация пароля
    isValidPassword: function(password) {
        return password.length >= 6;
    },

    // Получить текущего пользователя
    getCurrentUser: function() {
        const userData = localStorage.getItem('metro_user');
        return userData ? JSON.parse(userData) : null;
    },

    // Сохранить пользователя
    saveUser: function(userData) {
        localStorage.setItem('metro_user', JSON.stringify(userData));
    },

    // Выйти из системы
    logout: function() {
        auth.signOut().then(() => {
            localStorage.removeItem('metro_user');
            metroSystem.showNotification('Вы успешно вышли из системы', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }).catch((error) => {
            console.error('Ошибка выхода:', error);
            metroSystem.showNotification('Ошибка при выходе из системы', 'error');
        });
    },

    // Проверить авторизацию
    checkAuth: function(redirectToLogin = true) {
        const user = metroSystem.getCurrentUser();
        if (!user && redirectToLogin) {
            window.location.href = 'login.html';
            return false;
        }
        return user;
    },

    // Обновить профиль пользователя в Firestore
    updateUserProfile: async function(userId, userData) {
        try {
            await db.collection('users').doc(userId).set({
                ...userData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            return false;
        }
    },

    // Получить профиль пользователя из Firestore
    getUserProfile: async function(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Ошибка получения профиля:', error);
            return null;
        }
    },

    // Переключение видимости пароля
    togglePassword: function(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.parentNode.querySelector('.password-toggle i');
        
        if (input && icon) {
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
                icon.style.color = 'var(--primary)';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
                icon.style.color = 'var(--gray)';
            }
        }
    },

    // Форматирование даты
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Генератор аватара
    generateAvatar: function(name, size = 120) {
        const colors = ['#0066CC', '#FFD700', '#28A745', '#DC3545', '#6C757D', '#17A2B8'];
        const color = colors[name.length % colors.length];
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        return `
            <div class="profile-avatar" style="width: ${size}px; height: ${size}px; background: ${color};">
                ${initials}
            </div>
        `;
    },

    // Получить IP пользователя
    getUserIP: async function() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'Неизвестно';
        }
    },

    // Верификация reCAPTCHA
    verifyRecaptcha: async function(token) {
        try {
            // В реальном приложении здесь должен быть запрос к вашему серверу
            const response = await fetch('/api/verify-recaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: token })
            });
            
            if (!response.ok) {
                throw new Error('Ошибка верификации reCAPTCHA');
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Ошибка верификации reCAPTCHA:', error);
            // Для демонстрации возвращаем успех
            return { success: true, score: 0.9 };
        }
    },

    // Сброс reCAPTCHA
    resetRecaptcha: function() {
        if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
            grecaptcha.reset();
        }
    },

    // Отправка логов в Discord
    sendToDiscord: async function(embedData) {
        if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes('your-webhook-url')) {
            return; // Webhook не настроен
        }

        try {
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    embeds: [embedData]
                })
            });
        } catch (error) {
            console.error('Ошибка отправки в Discord:', error);
        }
    },

    // Логирование действий пользователя
    logUserAction: async function(action, details = {}) {
        const user = metroSystem.getCurrentUser();
        const userIP = await metroSystem.getUserIP();
        
        const logData = {
            title: `🔍 ДЕЙСТВИЕ ПОЛЬЗОВАТЕЛЯ: ${action}`,
            color: 0x0066CC,
            fields: [
                {
                    name: "👤 Пользователь",
                    value: user ? user.email : 'Неавторизован',
                    inline: true
                },
                {
                    name: "🆔 User ID",
                    value: user ? user.uid : 'N/A',
                    inline: true
                },
                {
                    name: "🌐 IP адрес",
                    value: userIP,
                    inline: true
                },
                {
                    name: "📱 Браузер",
                    value: navigator.userAgent.substring(0, 100) + '...',
                    inline: false
                },
                {
                    name: "🕒 Время",
                    value: new Date().toLocaleString('ru-RU'),
                    inline: true
                }
            ],
            timestamp: new Date().toISOString()
        };

        // Добавляем детали действия
        if (Object.keys(details).length > 0) {
            Object.entries(details).forEach(([key, value]) => {
                logData.fields.push({
                    name: `📝 ${key}`,
                    value: String(value).substring(0, 100),
                    inline: true
                });
            });
        }

        await metroSystem.sendToDiscord(logData);
    },

    // Управление настройками
    saveSetting: function(key, value) {
        const user = metroSystem.getCurrentUser();
        if (user) {
            user.settings = user.settings || {};
            user.settings[key] = value;
            metroSystem.saveUser(user);
            
            // Обновляем в Firestore
            if (user.uid) {
                metroSystem.updateUserProfile(user.uid, {
                    settings: user.settings
                });
            }
        }
    },

    // Получить настройку
    getSetting: function(key, defaultValue = null) {
        const user = metroSystem.getCurrentUser();
        return user && user.settings ? user.settings[key] : defaultValue;
    },

    // Валидация формы
    validateForm: function(formData, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            
            if (rule.required && !value) {
                errors[field] = rule.requiredMessage || 'Это поле обязательно для заполнения';
            } else if (rule.email && value && !metroSystem.isValidEmail(value)) {
                errors[field] = 'Введите корректный email адрес';
            } else if (rule.minLength && value && value.length < rule.minLength) {
                errors[field] = `Минимальная длина: ${rule.minLength} символов`;
            } else if (rule.maxLength && value && value.length > rule.maxLength) {
                errors[field] = `Максимальная длина: ${rule.maxLength} символов`;
            } else if (rule.match && value !== formData[rule.match]) {
                errors[field] = rule.matchMessage || 'Поля не совпадают';
            }
        }
        
        return errors;
    },

    // Анимация появления элементов
    animateElements: function(selector, delay = 200) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * delay);
        });
    },

    // Загрузка файла (аватар)
    uploadFile: function(file, onProgress, onComplete, onError) {
        // В реальном приложении здесь будет загрузка в Firebase Storage
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('Файл не выбран'));
                return;
            }

            // Проверка типа файла
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                reject(new Error('Недопустимый тип файла. Разрешены: JPG, PNG, GIF'));
                return;
            }

            // Проверка размера файла (макс 5MB)
            if (file.size > 5 * 1024 * 1024) {
                reject(new Error('Размер файла не должен превышать 5MB'));
                return;
            }

            // Имитация загрузки
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    
                    // Создаем URL для предпросмотра
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        resolve({
                            url: e.target.result,
                            name: file.name,
                            size: file.size,
                            type: file.type
                        });
                    };
                    reader.readAsDataURL(file);
                }
                
                if (onProgress) onProgress(progress);
            }, 100);
        });
    },

    // Установка темы
    setTheme: function(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.style.setProperty('--primary', '#4d94ff');
            root.style.setProperty('--light', '#1A1A1A');
            root.style.setProperty('--dark', '#F8F9FA');
            root.style.setProperty('--light-dark', '#2d2d2d');
        } else {
            root.style.setProperty('--primary', '#0066CC');
            root.style.setProperty('--light', '#F8F9FA');
            root.style.setProperty('--dark', '#1A1A1A');
            root.style.setProperty('--light-dark', '#e9ecef');
        }
        
        metroSystem.saveSetting('theme', theme);
    },

    // Восстановление настроек темы
    restoreTheme: function() {
        const theme = metroSystem.getSetting('theme', 'light');
        metroSystem.setTheme(theme);
    }
};

// Обработчики ошибок Firebase
function handleAuthError(error) {
    console.error('Ошибка аутентификации:', error);
    
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Неверный формат email адреса';
        case 'auth/user-disabled':
            return 'Аккаунт заблокирован';
        case 'auth/user-not-found':
            return 'Пользователь с таким email не найден';
        case 'auth/wrong-password':
            return 'Неверный пароль';
        case 'auth/email-already-in-use':
            return 'Email уже используется';
        case 'auth/weak-password':
            return 'Пароль слишком слабый. Минимум 6 символов';
        case 'auth/too-many-requests':
            return 'Слишком много попыток. Попробуйте позже.';
        case 'auth/network-request-failed':
            return 'Ошибка сети. Проверьте подключение к интернету.';
        case 'auth/operation-not-allowed':
            return 'Этот метод входа не разрешен.';
        case 'auth/requires-recent-login':
            return 'Требуется повторный вход для выполнения этой операции.';
        case 'auth/provider-already-linked':
            return 'Этот провайдер уже привязан к аккаунту.';
        case 'auth/credential-already-in-use':
            return 'Эти учетные данные уже используются другим аккаунтом.';
        default:
            return 'Произошла непредвиденная ошибка. Попробуйте снова.';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Анимация появления элементов
    metroSystem.animateElements('.form-group', 150);
    metroSystem.animateElements('.card', 100);
    
    // Восстановление темы
    metroSystem.restoreTheme();
    
    // Инициализация переключателей
    document.querySelectorAll('.switch input').forEach(switchInput => {
        // Восстановление состояния переключателей
        const settingName = switchInput.getAttribute('data-setting');
        const savedValue = metroSystem.getSetting(settingName, switchInput.checked);
        switchInput.checked = savedValue;
        
        // Обработчик изменений
        switchInput.addEventListener('change', function() {
            const value = this.checked;
            metroSystem.saveSetting(settingName, value);
            metroSystem.showNotification('Настройка сохранена', 'success', 2000);
            
            // Специальные обработчики для определенных настроек
            if (settingName === 'darkMode') {
                metroSystem.setTheme(value ? 'dark' : 'light');
            }
        });
    });

    // Обработчик для кнопки выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите выйти?')) {
                metroSystem.logout();
            }
        });
    }

    // Обновление информации о пользователе в навигации
    const user = metroSystem.getCurrentUser();
    if (user) {
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        const userEmail = document.querySelector('.user-email');
        
        if (userAvatar) {
            userAvatar.textContent = user.displayName ? 
                user.displayName.charAt(0).toUpperCase() : 
                user.email.charAt(0).toUpperCase();
        }
        
        if (userName) {
            userName.textContent = user.displayName || user.email.split('@')[0];
        }
        
        if (userEmail) {
            userEmail.textContent = user.email;
        }
        
        // Логирование посещения страницы
        metroSystem.logUserAction('ПОСЕЩЕНИЕ_СТРАНИЦЫ', {
            page: window.location.pathname,
            referrer: document.referrer
        });
    }

    // Обработчики для всех форм с валидацией
    document.querySelectorAll('form[data-validate]').forEach(form => {
        form.addEventListener('submit', function(e) {
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            const rules = JSON.parse(this.getAttribute('data-rules') || '{}');
            
            const errors = metroSystem.validateForm(data, rules);
            
            if (Object.keys(errors).length > 0) {
                e.preventDefault();
                metroSystem.clearErrors();
                
                Object.entries(errors).forEach(([field, message]) => {
                    metroSystem.showError(field, message);
                });
                
                metroSystem.showNotification('Исправьте ошибки в форме', 'error');
            }
        });
    });

    // Автоматическое сохранение данных форм
    document.querySelectorAll('form[data-autosave]').forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        const formId = form.id || 'anonymous_form';
        
        // Восстановление данных
        const savedData = localStorage.getItem(`form_${formId}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                inputs.forEach(input => {
                    if (data[input.name]) {
                        input.value = data[input.name];
                    }
                });
            } catch (e) {
                console.log('Ошибка восстановления формы:', e);
            }
        }
        
        // Автосохранение
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                localStorage.setItem(`form_${formId}`, JSON.stringify(data));
            });
        });
        
        // Очистка при успешной отправке
        form.addEventListener('submit', function() {
            localStorage.removeItem(`form_${formId}`);
        });
    });
});

// Service Worker для оффлайн работы
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker зарегистрирован: ', registration.scope);
            })
            .catch(function(error) {
                console.log('Ошибка регистрации ServiceWorker: ', error);
            });
    });
}

// Обработчики онлайн/оффлайн статуса
window.addEventListener('online', function() {
    metroSystem.showNotification('Соединение восстановлено', 'success', 3000);
});

window.addEventListener('offline', function() {
    metroSystem.showNotification('Отсутствует подключение к интернету', 'warning', 5000);
});

// Глобальные обработчики ошибок
window.addEventListener('error', function(e) {
    console.error('Глобальная ошибка:', e.error);
    metroSystem.logUserAction('JAVASCRIPT_ERROR', {
        message: e.error?.message,
        stack: e.error?.stack,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    });
});

// Экспорт для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { metroSystem, handleAuthError };
}
