// firebase-config.js

// ⚠️ ВАЖНО: ЗАМЕНИ ЭТИ КЛЮЧИ НА СВОИ!
class MetroFirebaseConfig {
    static getConfig() {
        return {
            apiKey: "AIzaSyAVSAXTU1VqF36GJA1pQOfxRxo3_ixW7F4",
            authDomain: "metro-new-admin.firebaseapp.com",
            projectId: "metro-new-admin",
            storageBucket: "metro-new-admin.firebasestorage.app",
            messagingSenderId: "769002010414",
            appId: "1:769002010414:web:bdeb93a7eddc4cab63ecbf"
        };
    }

    // Ключ reCAPTCHA v3 для App Check
    static getAppCheckKey() {
        return '6LcC3s0pAAAAAJjQHG3e9_2R0wKZ8g9d7b7gXqX7';
    }

    // Ключ reCAPTCHA v3 для сайта
    static getRecaptchaKey() {
        return '6LcC3s0pAAAAAJjQHG3e9_2R0wKZ8g9d7b7gXqX7';
    }

    // Discord Webhook для уведомлений
    static getDiscordWebhook() {
        return 'https://discord.com/api/webhooks/1442931647052910704/vTJSi647mtSlg0qYnyLAiMdyqTtDMeg6xpu8LVw3NgtSQbs2k6HecudFlfktopNhUUWX';
    }

    // Коды доступа для разных ролей
    static getSecurityCodes() {
        return {
            admin: "ADMIN2024",      // Полный доступ
            moder: "MODER2024",      // Доступ модератора
            pending: "METRO2024"     // Ожидание подтверждения
        };
    }

    // URL иконки Metro
    static getMetroIcon() {
        return "https://kirill12633.github.io/Metro.New.Official/ru/images/metro-icon.png";
    }

    // Настройки по умолчанию для новой базы
    static getDefaultAdminData() {
        return {
            email: "admin@metro-new.com",
            name: "Главный Администратор",
            role: "admin",
            avatar: this.getMetroIcon(),
            status: "active",
            permissions: {
                canDelete: true,
                canBan: true,
                canEdit: true,
                canManageUsers: true,
                canViewLogs: true,
                canCreateReports: true,
                canModerate: true
            }
        };
    }

    // Стили для Metro темы
    static getThemeColors() {
        return {
            primary: "#0066CC",
            secondary: "#FFD700",
            danger: "#DC3545",
            success: "#28A745",
            warning: "#FFC107",
            metroRed: "#D52B1E",
            metroBlue: "#0078BE",
            metroGreen: "#009D58",
            adminBg: "#1a1a2e",
            adminSidebar: "#16213e",
            adminCard: "#0f3460"
        };
    }

    // Проверка валидности конфигурации
    static validateConfig(config) {
        const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        const missing = required.filter(key => !config[key] || config[key].includes('YOUR'));
        
        if (missing.length > 0) {
            throw new Error(`Отсутствуют обязательные поля конфигурации: ${missing.join(', ')}`);
        }
        
        return true;
    }
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetroFirebaseConfig;
}
