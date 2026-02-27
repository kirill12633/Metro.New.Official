// Управление состоянием приложения
class Store {
    constructor() {
        this.state = {
            user: null,
            settings: {
                theme: localStorage.getItem('theme') || 'light',
                language: localStorage.getItem('language') || 'ru',
                emailNotifications: true,
                projectNews: true
            },
            notifications: [],
            loading: false,
            modals: {
                account: false,
                auth: false,
                avatar: false,
                passwordReset: false,
                passwordChange: false,
                terms: false
            }
        };
        
        this.listeners = [];
        this.loginAttempts = new Map(); // для rate limiting
    }
    
    // Получить состояние
    getState() {
        return this.state;
    }
    
    // Подписаться на изменения
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    // Обновить состояние
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.listeners.forEach(listener => listener(this.state));
    }
    
    // Обновить конкретное поле
    updateState(key, value) {
        this.setState({ [key]: value });
    }
    
    // Установить пользователя
    setUser(user) {
        this.setState({ user });
    }
    
    // Очистить пользователя
    clearUser() {
        this.setState({ user: null });
    }
    
    // Управление модальными окнами
    openModal(modalName) {
        this.setState({
            modals: { ...this.state.modals, [modalName]: true }
        });
    }
    
    closeModal(modalName) {
        this.setState({
            modals: { ...this.state.modals, [modalName]: false }
        });
    }
    
    closeAllModals() {
        const closedModals = Object.keys(this.state.modals).reduce((acc, key) => {
            acc[key] = false;
            return acc;
        }, {});
        this.setState({ modals: closedModals });
    }
    
    // Rate limiting для защиты от брутфорса
    checkRateLimit(email) {
        const now = Date.now();
        const attempts = this.loginAttempts.get(email) || [];
        const recentAttempts = attempts.filter(t => now - t < 60000); // последняя минута
        
        if (recentAttempts.length >= 5) {
            throw new Error('Слишком много попыток входа. Подождите минуту.');
        }
        
        return recentAttempts;
    }
    
    addLoginAttempt(email) {
        const attempts = this.loginAttempts.get(email) || [];
        attempts.push(Date.now());
        // Оставляем только попытки за последние 5 минут
        const recentAttempts = attempts.filter(t => Date.now() - t < 300000);
        this.loginAttempts.set(email, recentAttempts);
    }
    
    // Настройки
    updateSettings(settings) {
        const newSettings = { ...this.state.settings, ...settings };
        this.setState({ settings: newSettings });
        
        // Сохраняем в localStorage
        if (settings.theme) localStorage.setItem('theme', settings.theme);
        if (settings.language) localStorage.setItem('language', settings.language);
    }
    
    // Уведомления
    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            read: false,
            timestamp: new Date().toISOString(),
            ...notification
        };
        this.setState({
            notifications: [newNotification, ...this.state.notifications]
        });
    }
    
    markNotificationAsRead(id) {
        const notifications = this.state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        );
        this.setState({ notifications });
    }
    
    markAllNotificationsAsRead() {
        const notifications = this.state.notifications.map(n => ({ ...n, read: true }));
        this.setState({ notifications });
    }
    
    clearNotifications() {
        this.setState({ notifications: [] });
    }
    
    getUnreadCount() {
        return this.state.notifications.filter(n => !n.read).length;
    }
}

// Создаем и экспортируем единственный экземпляр
export const store = new Store();
