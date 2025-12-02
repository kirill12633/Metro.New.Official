class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loginAttempts = new Map();
        this.sessionTimer = null;
        this.init();
    }

    async init() {
        // Monitor auth state
        firebaseApp.auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = await this.getUserData(user.uid);
                await this.handleSuccessfulLogin(user.uid);
            } else {
                this.currentUser = null;
                this.clearSession();
            }
            this.updateUI();
        });
    }

    async getUserData(userId) {
        try {
            const userDoc = await firebaseApp.collections.USERS.doc(userId).get();
            if (!userDoc.exists) {
                await firebaseApp.auth.signOut();
                return null;
            }
            
            const userData = userDoc.data();
            const authUser = firebaseApp.auth.currentUser;
            
            return {
                uid: userId,
                email: authUser.email,
                ...userData
            };
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    async login(email, password, twoFactorCode = null) {
        try {
            // Check login attempts
            const attempts = this.loginAttempts.get(email) || 0;
            if (attempts >= firebaseApp.SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
                await this.logSecurityEvent('blocked_login', email, 'Превышено количество попыток входа');
                throw new Error('Аккаунт временно заблокирован. Обратитесь к администратору.');
            }

            // Sign in with Firebase Auth
            const userCredential = await firebaseApp.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Verify user exists in Firestore
            const userData = await this.getUserData(user.uid);
            if (!userData) {
                throw new Error('Пользователь не найден в системе');
            }

            // Check if account is active
            if (!userData.active) {
                throw new Error('Аккаунт деактивирован');
            }

            // Verify 2FA if enabled
            if (userData.twoFactorEnabled && twoFactorCode) {
                const isValid = await this.verifyTwoFactor(user.uid, twoFactorCode);
                if (!isValid) {
                    throw new Error('Неверный код двухфакторной аутентификации');
                }
            }

            // Update last login
            await firebaseApp.collections.USERS.doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                loginCount: (userData.loginCount || 0) + 1
            });

            // Reset login attempts
            this.loginAttempts.delete(email);

            return { success: true, user: userData };

        } catch (error) {
            // Track failed attempts
            this.loginAttempts.set(email, (this.loginAttempts.get(email) || 0) + 1);
            
            await this.logSecurityEvent('failed_login', email, error.message);
            
            return { success: false, error: error.message };
        }
    }

    async handleSuccessfulLogin(userId) {
        // Create session
        const ip = await firebaseApp.FirebaseHelper.getIPAddress();
        const sessionId = await firebaseApp.FirebaseHelper.createSession(userId, {
            ipAddress: ip,
            userAgent: navigator.userAgent
        });
        
        localStorage.setItem('metro_session_id', sessionId);

        // Start session timer
        this.startSessionTimer();

        // Log successful login
        await this.logAudit('login', 'Успешный вход в систему');
    }

    async logout() {
        try {
            const sessionId = localStorage.getItem('metro_session_id');
            if (sessionId) {
                await firebaseApp.FirebaseHelper.endSession(sessionId);
            }

            await this.logAudit('logout', 'Выход из системы');
            
            // Clear all local data
            localStorage.removeItem('metro_session_id');
            sessionStorage.clear();
            
            // Sign out from Firebase
            await firebaseApp.auth.signOut();
            
            // Redirect to login
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async verifyTwoFactor(userId, code) {
        // For demo - in production use proper 2FA service
        const userDoc = await firebaseApp.collections.USERS.doc(userId).get();
        const userData = userDoc.data();
        return code === userData.twoFactorBackupCode; // Only for demo
    }

    async logAudit(action, details) {
        if (!this.currentUser) return;

        await firebaseApp.FirebaseHelper.createAuditLog({
            userId: this.currentUser.uid,
            userEmail: this.currentUser.email,
            action,
            details,
            ipAddress: await firebaseApp.FirebaseHelper.getIPAddress(),
            userAgent: navigator.userAgent
        });
    }

    async logSecurityEvent(eventType, userId, details, severity = 'medium') {
        await firebaseApp.FirebaseHelper.createSecurityEvent(eventType, userId, details, severity);
    }

    startSessionTimer() {
        const timeout = firebaseApp.SECURITY_CONFIG.SESSION_TIMEOUT;
        
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }

        this.sessionTimer = setTimeout(async () => {
            await this.logAudit('session_timeout', 'Сессия истекла по таймауту');
            await this.logout();
        }, timeout);

        // Reset timer on user activity
        const resetTimer = () => {
            if (this.sessionTimer) {
                clearTimeout(this.sessionTimer);
                this.startSessionTimer();
            }
        };

        document.addEventListener('mousemove', resetTimer);
        document.addEventListener('keypress', resetTimer);
        document.addEventListener('click', resetTimer);
    }

    clearSession() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    updateUI() {
        // Update login/logout buttons
        const loginLink = document.getElementById('loginLink');
        const adminLink = document.getElementById('adminLink');
        const logoutBtns = document.querySelectorAll('.btn-logout, .btn-logout-small');

        if (this.currentUser) {
            if (loginLink) loginLink.style.display = 'none';
            if (adminLink && this.currentUser.role === firebaseApp.USER_ROLES.ADMIN) {
                adminLink.style.display = 'block';
            }
            
            // Update user info
            const userElements = document.querySelectorAll('[id*="User"]');
            userElements.forEach(el => {
                if (el.id.includes('Name')) {
                    el.textContent = this.currentUser.displayName || this.currentUser.email.split('@')[0];
                } else if (el.id.includes('Email')) {
                    el.textContent = this.currentUser.email;
                } else if (el.id.includes('Role')) {
                    el.textContent = this.getRoleText(this.currentUser.role);
                }
            });
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (adminLink) adminLink.style.display = 'none';
        }

        // Update logout buttons
        logoutBtns.forEach(btn => {
            btn.style.display = this.currentUser ? 'block' : 'none';
            btn.onclick = () => this.logout();
        });
    }

    getRoleText(role) {
        const roles = {
            [firebaseApp.USER_ROLES.ADMIN]: 'Администратор',
            [firebaseApp.USER_ROLES.MANAGER]: 'Менеджер',
            [firebaseApp.USER_ROLES.VIEWER]: 'Просмотрщик',
            [firebaseApp.USER_ROLES.AUDITOR]: 'Аудитор',
            [firebaseApp.USER_ROLES.GUEST]: 'Гость'
        };
        return roles[role] || role;
    }

    async checkAdminAccess() {
        if (!this.currentUser || this.currentUser.role !== firebaseApp.USER_ROLES.ADMIN) {
            await this.logSecurityEvent('access_denied', 
                this.currentUser?.uid || 'anonymous', 
                'Попытка доступа к админ-панели'
            );
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    async checkViewerAccess() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Global functions for HTML
async function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const twoFactorCode = document.getElementById('twoFactorCode')?.value;
    const messageEl = document.getElementById('loginMessage');

    const result = await authManager.login(email, password, twoFactorCode);

    if (result.success) {
        messageEl.textContent = 'Вход выполнен успешно!';
        messageEl.className = 'message success';
        
        setTimeout(() => {
            if (result.user.role === firebaseApp.USER_ROLES.ADMIN) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'viewer.html';
            }
        }, 1000);
    } else {
        messageEl.textContent = 'Ошибка: ' + result.error;
        messageEl.className = 'message error';
    }
}

function logout() {
    authManager.logout();
}

function checkAuthState() {
    authManager.updateUI();
}

function checkAdminAccess() {
    return authManager.checkAdminAccess();
}

function checkViewerAccess() {
    return authManager.checkViewerAccess();
}

// Export
window.authManager = authManager;
window.loginUser = loginUser;
window.logout = logout;
window.checkAuthState = checkAuthState;
window.checkAdminAccess = checkAdminAccess;
window.checkViewerAccess = checkViewerAccess;
