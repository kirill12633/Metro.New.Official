// Authentication system with App Check and Firestore
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.loginAttempts = {};
        this.init();
    }

    async init() {
        // Monitor auth state
        firebaseConfig.auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = await firebaseConfig.getCurrentUserWithVerification();
                this.updateUI();
                this.startSessionTimer();
                await this.logActivity('login', 'Успешный вход в систему');
            } else {
                this.currentUser = null;
                this.updateUI();
            }
        });
    }

    async loginUser(email, password, twoFactorCode = null) {
        try {
            // Verify App Check first
            const appCheckToken = await firebase.appCheck().getToken();
            if (!appCheckToken) {
                throw new Error('Проверка безопасности не пройдена');
            }

            // Check login attempts
            if (this.loginAttempts[email] >= 5) {
                await this.logSecurityEvent('blocked_login', email, 'Превышено количество попыток входа');
                throw new Error('Аккаунт временно заблокирован. Обратитесь к администратору.');
            }

            // Sign in with Firebase Auth
            const userCredential = await firebaseConfig.auth.signInWithEmailAndPassword(email, password);
            
            // Check if user exists in Firestore
            const userDoc = await firebaseConfig.db
                .collection(firebaseConfig.collections.USERS)
                .doc(userCredential.user.uid)
                .get();

            if (!userDoc.exists) {
                await userCredential.user.delete();
                throw new Error('Пользователь не найден в системе');
            }

            const userData = userDoc.data();

            // Check if account is active
            if (!userData.active) {
                throw new Error('Аккаунт деактивирован');
            }

            // Verify 2FA if enabled
            if (userData.twoFactorEnabled && twoFactorCode) {
                const isValid = await this.verifyTwoFactor(userCredential.user.uid, twoFactorCode);
                if (!isValid) {
                    throw new Error('Неверный код двухфакторной аутентификации');
                }
            }

            // Update last login
            await firebaseConfig.db
                .collection(firebaseConfig.collections.USERS)
                .doc(userCredential.user.uid)
                .update({
                    lastLogin: firebaseConfig.getCurrentTimestamp(),
                    loginCount: (userData.loginCount || 0) + 1
                });

            // Create session record
            await this.createSessionRecord(userCredential.user.uid);

            // Reset login attempts
            this.loginAttempts[email] = 0;

            return {
                success: true,
                user: {
                    ...userCredential.user,
                    ...userData
                }
            };

        } catch (error) {
            // Track failed attempts
            this.loginAttempts[email] = (this.loginAttempts[email] || 0) + 1;
            
            await this.logSecurityEvent('failed_login', email, error.message);
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    async createSessionRecord(userId) {
        const sessionId = firebaseConfig.generateUniqueId();
        const sessionData = {
            sessionId,
            userId,
            startTime: firebaseConfig.getCurrentTimestamp(),
            ipAddress: await this.getIPAddress(),
            userAgent: navigator.userAgent,
            active: true
        };

        await firebaseConfig.db
            .collection(firebaseConfig.collections.SESSIONS)
            .doc(sessionId)
            .set(sessionData);

        localStorage.setItem('metro_session_id', sessionId);
        return sessionId;
    }

    async logout() {
        try {
            const sessionId = localStorage.getItem('metro_session_id');
            if (sessionId) {
                await firebaseConfig.db
                    .collection(firebaseConfig.collections.SESSIONS)
                    .doc(sessionId)
                    .update({
                        endTime: firebaseConfig.getCurrentTimestamp(),
                        active: false
                    });
            }

            await this.logActivity('logout', 'Выход из системы');
            
            // Clear all local data
            localStorage.removeItem('metro_session_id');
            sessionStorage.clear();
            
            // Sign out from Firebase
            await firebaseConfig.auth.signOut();
            
            // Redirect to login
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
    }

    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    async verifyTwoFactor(userId, code) {
        // Здесь должна быть интеграция с 2FA сервисом
        // Для демо используем статический код
        const userDoc = await firebaseConfig.db
            .collection(firebaseConfig.collections.USERS)
            .doc(userId)
            .get();

        const userData = userDoc.data();
        return code === userData.twoFactorBackupCode; // Только для демо
    }

    async logActivity(action, details) {
        if (!this.currentUser) return;

        const logData = {
            userId: this.currentUser.uid,
            userEmail: this.currentUser.email,
            action,
            details,
            timestamp: firebaseConfig.getCurrentTimestamp(),
            ipAddress: await this.getIPAddress(),
            userAgent: navigator.userAgent
        };

        await firebaseConfig.db
            .collection(firebaseConfig.collections.AUDIT_LOGS)
            .add(logData);
    }

    async logSecurityEvent(eventType, userId, details) {
        const eventData = {
            eventType,
            userId,
            details,
            timestamp: firebaseConfig.getCurrentTimestamp(),
            ipAddress: await this.getIPAddress(),
            severity: this.getEventSeverity(eventType)
        };

        await firebaseConfig.db
            .collection(firebaseConfig.collections.SECURITY_EVENTS)
            .add(eventData);

        // Send notification for critical events
        if (eventData.severity === 'high') {
            await this.notifyAdmins(eventType, details);
        }
    }

    getEventSeverity(eventType) {
        const severityMap = {
            'failed_login': 'medium',
            'blocked_login': 'high',
            'access_denied': 'high',
            'suspicious_activity': 'high',
            'data_export': 'low',
            'document_view': 'low'
        };
        return severityMap[eventType] || 'low';
    }

    async notifyAdmins(eventType, details) {
        // Get all admins
        const adminsSnapshot = await firebaseConfig.db
            .collection(firebaseConfig.collections.USERS)
            .where('role', '==', firebaseConfig.USER_ROLES.ADMIN)
            .get();

        adminsSnapshot.forEach(async (adminDoc) => {
            await this.sendNotification(adminDoc.id, eventType, details);
        });
    }

    async sendNotification(userId, title, message) {
        // Здесь должна быть интеграция с системой уведомлений
        // Для демо просто сохраняем в Firestore
        const notificationData = {
            userId,
            title,
            message,
            read: false,
            timestamp: firebaseConfig.getCurrentTimestamp()
        };

        await firebaseConfig.db
            .collection('notifications')
            .add(notificationData);
    }

    startSessionTimer() {
        const timeout = firebaseConfig.SECURITY_SETTINGS.SESSION_TIMEOUT;
        
        this.sessionTimer = setTimeout(async () => {
            await this.logActivity('session_timeout', 'Сессия истекла по таймауту');
            await this.logout();
        }, timeout);

        // Reset timer on user activity
        document.addEventListener('mousemove', this.resetSessionTimer.bind(this));
        document.addEventListener('keypress', this.resetSessionTimer.bind(this));
    }

    resetSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.startSessionTimer();
        }
    }

    updateUI() {
        // Update login/logout buttons
        const loginLink = document.getElementById('loginLink');
        const adminLink = document.getElementById('adminLink');
        const logoutBtns = document.querySelectorAll('.btn-logout, .btn-logout-small');

        if (this.currentUser) {
            if (loginLink) loginLink.style.display = 'none';
            if (adminLink && this.currentUser.role === firebaseConfig.USER_ROLES.ADMIN) {
                adminLink.style.display = 'block';
            }
            
            // Update user info in UI
            const userElements = document.querySelectorAll('[id$="UserName"], [id$="UserEmail"]');
            userElements.forEach(el => {
                if (el.id.includes('Name')) {
                    el.textContent = this.currentUser.displayName || this.currentUser.email;
                } else if (el.id.includes('Email')) {
                    el.textContent = this.currentUser.email;
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

    async checkAdminAccess() {
        if (!this.currentUser || this.currentUser.role !== firebaseConfig.USER_ROLES.ADMIN) {
            await this.logSecurityEvent('access_denied', 'anonymous', 'Попытка доступа к админ-панели');
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
}

// Initialize auth system
const authSystem = new AuthSystem();

// Global functions for HTML onclick handlers
async function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const twoFactorCode = document.getElementById('twoFactorCode')?.value;
    const messageEl = document.getElementById('loginMessage');

    const result = await authSystem.loginUser(email, password, twoFactorCode);

    if (result.success) {
        messageEl.textContent = 'Вход выполнен успешно!';
        messageEl.className = 'message success';
        
        setTimeout(() => {
            if (result.user.role === firebaseConfig.USER_ROLES.ADMIN) {
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
    authSystem.logout();
}

function checkAuthState() {
    authSystem.updateUI();
}

function checkAdminAccess() {
    return authSystem.checkAdminAccess();
}

function checkViewerAccess() {
    return authSystem.checkViewerAccess();
}

// Export
window.authSystem = authSystem;
window.loginUser = loginUser;
window.logout = logout;
window.checkAuthState = checkAuthState;
window.checkAdminAccess = checkAdminAccess;
window.checkViewerAccess = checkViewerAccess;
