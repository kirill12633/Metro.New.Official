// firebase-init.js
class FirebaseAdmin {
    constructor() {
        this.config = {
            apiKey: "AIzaSyAVSAXTU1VqF36GJA1pQOfxRxo3_ixW7F4",
            authDomain: "metro-new-admin.firebaseapp.com",
            projectId: "metro-new-admin",
            storageBucket: "metro-new-admin.firebasestorage.app",
            messagingSenderId: "769002010414",
            appId: "1:769002010414:web:bdeb93a7eddc4cab63ecbf"
        };
        
        this.appCheckSiteKey = '6LcC3s0pAAAAAJjQHG3e9_2R0wKZ8g9d7b7gXqX7';
        this.discordWebhook = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL';
        
        this.init();
    }
    
    init() {
        if (!firebase.apps.length) {
            firebase.initializeApp(this.config);
            
            // Инициализация App Check
            const appCheck = firebase.appCheck();
            appCheck.activate(this.appCheckSiteKey, true);
        }
        
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.currentUser = null;
        this.userData = null;
    }
    
    // Проверка авторизации
    async checkAuth(requiredRole = null) {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (!user) {
                    reject(new Error('Не авторизован'));
                    return;
                }
                
                this.currentUser = user;
                
                try {
                    const userDoc = await this.db.collection('users').doc(user.uid).get();
                    
                    if (!userDoc.exists) {
                        reject(new Error('Пользователь не найден в базе'));
                        return;
                    }
                    
                    this.userData = userDoc.data();
                    
                    // Проверка роли если требуется
                    if (requiredRole && this.userData.role !== requiredRole) {
                        reject(new Error('Недостаточно прав'));
                        return;
                    }
                    
                    resolve({
                        user: user,
                        data: this.userData
                    });
                    
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
    
    // Логирование действий
    async log(action, level, details, section = 'system') {
        try {
            const ip = await this.getIPAddress();
            
            const logData = {
                userId: this.currentUser?.uid || 'anonymous',
                userEmail: this.currentUser?.email || 'anonymous',
                action: action,
                section: section,
                details: details,
                level: level,
                ip: ip,
                userAgent: navigator.userAgent,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await this.db.collection('admin_logs').add(logData);
            
            // Отправка важных событий в Discord
            if (level === 'danger' || level === 'warning' || action === 'login' || action === 'logout') {
                await this.sendToDiscord(`📝 **${action.toUpperCase()}**\n👤 ${logData.userEmail}\n📋 ${details}\n🌐 ${ip}`);
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка логирования:', error);
            return false;
        }
    }
    
    // Получение IP адреса
    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }
    
    // Отправка в Discord
    async sendToDiscord(message) {
        try {
            await fetch(this.discordWebhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: message,
                    username: 'Metro New Security',
                    avatar_url: 'https://kirill12633.github.io/Metro.New.Official/ru/images/metro-icon.png'
                })
            });
        } catch (error) {
            console.error('Ошибка отправки в Discord:', error);
        }
    }
    
    // Получение статистики
    async getStats() {
        try {
            const [
                usersCount,
                complaintsCount,
                queueCount,
                bannedCount
            ] = await Promise.all([
                this.db.collection('users').count().get(),
                this.db.collection('complaints').where('status', '==', 'pending').count().get(),
                this.db.collection('queue_items').where('status', '==', 'pending').count().get(),
                this.db.collection('banned_users').where('expiresAt', '>', new Date()).count().get()
            ]);
            
            return {
                totalUsers: usersCount.data().count,
                pendingComplaints: complaintsCount.data().count,
                queueItems: queueCount.data().count,
                activeBans: bannedCount.data().count
            };
        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            return {
                totalUsers: 0,
                pendingComplaints: 0,
                queueItems: 0,
                activeBans: 0
            };
        }
    }
    
    // Получение последних действий
    async getRecentActivity(limit = 10) {
        try {
            const snapshot = await this.db.collection('admin_logs')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id
                };
            });
        } catch (error) {
            console.error('Ошибка получения активности:', error);
            return [];
        }
    }
    
    // Выход из системы
    async logout() {
        try {
            await this.log('logout', 'info', 'Выход из системы');
            await this.auth.signOut();
            return true;
        } catch (error) {
            console.error('Ошибка выхода:', error);
            return false;
        }
    }
}

// Глобальный экземпляр
window.firebaseAdmin = new FirebaseAdmin();
