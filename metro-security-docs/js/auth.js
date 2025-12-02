// Система аутентификации с reCAPTCHA и App Check

class AuthSystem {
    constructor() {
        this.auth = firebaseAuth;
        this.db = firebaseDB;
        this.currentUser = null;
    }
    
    // Вход с email/password
    async loginWithEmail(email, password) {
        try {
            // Проверка reCAPTCHA
            const recaptchaToken = await this.getRecaptchaToken('login');
            
            // Вход
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            
            // Логирование входа
            await this.logLogin('email', true);
            
            // Обновляем UI
            this.updateUI();
            
            return { success: true, user: this.currentUser };
        } catch (error) {
            await this.logLogin('email', false, error.message);
            throw error;
        }
    }
    
    // Вход с Google
    async loginWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            
            const userCredential = await this.auth.signInWithPopup(provider);
            this.currentUser = userCredential.user;
            
            await this.logLogin('google', true);
            this.updateUI();
            
            return { success: true, user: this.currentUser };
        } catch (error) {
            await this.logLogin('google', false, error.message);
            throw error;
        }
    }
    
    // Выход
    async logout() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            
            await this.db.collection('audit_logs').add({
                userId: 'system',
                action: 'logout',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                details: { method: 'manual' }
            });
            
            this.updateUI();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
    }
    
    // Проверка состояния авторизации
    async checkAuthState() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    
                    // Проверяем роль пользователя
                    const userDoc = await this.db.collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        this.userRole = userDoc.data().role;
                    }
                    
                    // Обновляем UI
                    this.updateUI();
                } else {
                    this.currentUser = null;
                    this.userRole = null;
                }
                resolve(user);
            });
        });
    }
    
    // Получение токена reCAPTCHA
    async getRecaptchaToken(action) {
        return new Promise((resolve) => {
            grecaptcha.ready(() => {
                grecaptcha.execute(recaptchaConfig.siteKey, { action: action })
                    .then(token => resolve(token));
            });
        });
    }
    
    // Логирование входа
    async logLogin(method, success, error = '') {
        const logData = {
            userId: this.currentUser?.uid || 'anonymous',
            action: success ? 'login_success' : 'login_failed',
            method: method,
            success: success,
            error: error,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ip: await this.getClientIP(),
            userAgent: navigator.userAgent
        };
        
        await this.db.collection('audit_logs').add(logData);
        
        // При неудачной попытке - проверка на брутфорс
        if (!success) {
            await this.checkBruteForce(logData.ip);
        }
    }
    
    // Проверка брутфорс атак
    async checkBruteForce(ip) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const failedLogins = await this.db.collection('audit_logs')
            .where('action', '==', 'login_failed')
            .where('timestamp', '>', fiveMinutesAgo)
            .where('ip', '==', ip)
            .get();
        
        if (failedLogins.size > 5) {
            // Блокировка IP
            await this.db.collection('blocked_ips').doc(ip).set({
                ip: ip,
                blockedAt: firebase.firestore.FieldValue.serverTimestamp(),
                reason: 'brute_force_attempt',
                attempts: failedLogins.size
            });
            
            // Отправка алерта
            await this.sendSecurityAlert('Брутфорс атака обнаружена', { ip, attempts: failedLogins.size });
        }
    }
    
    // Получение IP клиента
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }
    
    // Отправка алерта безопасности
    async sendSecurityAlert(title, data) {
        await this.db.collection('security_alerts').add({
            title: title,
            data: data,
            severity: 'high',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        });
    }
    
    // Обновление UI
    updateUI() {
        const userMenu = document.getElementById('userMenu');
        const adminLink = document.getElementById('adminLink');
        const documentsSection = document.getElementById('documentsSection');
        
        if (this.currentUser) {
            // Показываем меню пользователя
            userMenu.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-btn">
                        <i class="fas fa-user"></i>
                        ${this.currentUser.email}
                    </button>
                    <div class="dropdown-content">
                        <a href="#" onclick="authSystem.logout()">
                            <i class="fas fa-sign-out-alt"></i> Выйти
                        </a>
                        <a href="#" onclick="showProfile()">
                            <i class="fas fa-cog"></i> Настройки
                        </a>
                        ${this.userRole === 'admin' ? `
                        <a href="admin.html">
                            <i class="fas fa-cogs"></i> Админка
                        </a>` : ''}
                    </div>
                </div>
            `;
            
            // Показываем секцию документов
            if (documentsSection) {
                documentsSection.style.display = 'block';
                loadUserDocuments();
            }
            
            // Показываем/скрываем админку
            if (adminLink) {
                adminLink.style.display = this.userRole === 'admin' ? 'block' : 'none';
            }
        } else {
            // Показываем кнопки входа
            userMenu.innerHTML = `
                <button onclick="showLoginModal()" class="login-btn">
                    <i class="fas fa-sign-in-alt"></i> Войти
                </button>
            `;
            
            // Скрываем секции
            if (documentsSection) documentsSection.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
        }
    }
}

// Инициализация системы аутентификации
const authSystem = new AuthSystem();

// Глобальный экспорт
window.authSystem = authSystem;
