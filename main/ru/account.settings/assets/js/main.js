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
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через указанное время
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    },

    // Показать ошибку поля
    showError: function(fieldId, message) {
        const errorElement = document.getElementById(fieldId + 'Error');
        const inputElement = document.getElementById(fieldId);
        
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            inputElement.classList.add('error');
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
        inputElements.forEach(el => el.classList.remove('error'));
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
            await db.collection('users').doc(userId).set(userData, { merge: true });
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
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
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
        const colors = ['#0066CC', '#FFD700', '#28A745', '#DC3545', '#6C757D'];
        const color = colors[name.length % colors.length];
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return `
            <div class="profile-avatar" style="width: ${size}px; height: ${size}px; background: ${color};">
                ${initials}
            </div>
        `;
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
            return 'Пароль слишком слабый';
        case 'auth/too-many-requests':
            return 'Слишком много попыток. Попробуйте позже.';
        case 'auth/network-request-failed':
            return 'Ошибка сети. Проверьте подключение к интернету.';
        default:
            return 'Произошла ошибка. Попробуйте снова.';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Анимация появления элементов формы
    setTimeout(() => {
        document.querySelectorAll('.form-group').forEach((group, index) => {
            if (group.style.opacity === '') {
                setTimeout(() => {
                    group.style.opacity = '1';
                    group.style.transform = 'translateX(0)';
                }, index * 200);
            }
        });
    }, 300);

    // Инициализация переключателей
    document.querySelectorAll('.switch input').forEach(switchInput => {
        switchInput.addEventListener('change', function() {
            const settingName = this.getAttribute('data-setting');
            const value = this.checked;
            
            // Сохраняем настройку
            const user = metroSystem.getCurrentUser();
            if (user) {
                user.settings = user.settings || {};
                user.settings[settingName] = value;
                metroSystem.saveUser(user);
                
                // Обновляем в Firestore
                if (user.uid) {
                    metroSystem.updateUserProfile(user.uid, {
                        settings: user.settings,
                        lastUpdated: new Date().toISOString()
                    });
                }
                
                metroSystem.showNotification('Настройка сохранена', 'success', 2000);
            }
        });
    });

    // Обработчик для кнопки выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            metroSystem.logout();
        });
    }

    // Обновление информации о пользователе в навигации
    const user = metroSystem.getCurrentUser();
    if (user) {
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        
        if (userAvatar) {
            userAvatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
        }
        
        if (userName) {
            userName.textContent = user.displayName || user.email;
        }
    }
});

// Service Worker для оффлайн работы
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker зарегистрирован: ', registration);
            })
            .catch(function(error) {
                console.log('Ошибка регистрации ServiceWorker: ', error);
            });
    });
}
