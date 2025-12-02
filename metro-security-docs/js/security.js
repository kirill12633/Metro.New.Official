// Основная система безопасности

class SecuritySystem {
    constructor() {
        this.db = firebaseDB;
        this.auth = firebaseAuth;
        this.storage = firebaseStorage;
    }
    
    // Проверка доступа к документу
    async checkDocumentAccess(documentId) {
        const user = this.auth.currentUser;
        if (!user) return false;
        
        try {
            // Получаем данные пользователя
            const userDoc = await this.db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) return false;
            
            const userData = userDoc.data();
            
            // Получаем данные документа
            const documentDoc = await this.db.collection('documents').doc(documentId).get();
            if (!documentDoc.exists) return false;
            
            const documentData = documentDoc.data();
            
            // Проверка ролей
            if (userData.role === 'admin') return true;
            if (userData.role === 'manager' && documentData.department === userData.department) return true;
            if (userData.role === 'employee' && documentData.department === userData.department) {
                return documentData.accessLevel === 'department' || documentData.accessLevel === 'public';
            }
            
            return false;
        } catch (error) {
            console.error('Ошибка проверки доступа:', error);
            return false;
        }
    }
    
    // Геолокационный контроль
    async checkGeolocation() {
        try {
            const ip = await this.getClientIP();
            
            // Получаем геоданные
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            const geoData = await response.json();
            
            // Разрешенные страны
            const allowedCountries = ['RU', 'BY', 'KZ'];
            
            if (!allowedCountries.includes(geoData.country_code)) {
                await this.logSecurityEvent('geoblock', {
                    ip: ip,
                    country: geoData.country_name,
                    reason: 'Доступ запрещен из вашей страны'
                });
                return false;
            }
            
            return {
                allowed: true,
                ip: ip,
                country: geoData.country_name,
                city: geoData.city,
                isp: geoData.org
            };
        } catch (error) {
            console.error('Ошибка геолокации:', error);
            return { allowed: true, error: 'Не удалось определить местоположение' };
        }
    }
    
    // Водяные знаки
    async applyWatermark(canvas, documentId) {
        const user = this.auth.currentUser;
        if (!user) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Получаем данные для водяного знака
        const ip = await this.getClientIP();
        const date = new Date().toLocaleString('ru-RU');
        const userEmail = user.email;
        
        // Создаем водяной знак
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.font = '20px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Поворачиваем текст
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 4);
        
        // Множественный текст
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                ctx.fillText(`${userEmail} • ${date} • ${ip}`, i * 300, j * 200);
            }
        }
        
        ctx.restore();
        
        // Логируем применение водяного знака
        await this.logSecurityEvent('watermark_applied', {
            documentId: documentId,
            userEmail: userEmail,
            ip: ip
        });
    }
    
    // Защита от скачивания
    protectFromDownload(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Блокировка контекстного меню
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showSecurityMessage('Скачивание документа запрещено');
            return false;
        });
        
        // Блокировка клавиш PrintScreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                this.takeAntiScreenshot();
            }
            
            // Ctrl+S, Ctrl+P
            if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
                e.preventDefault();
                this.showSecurityMessage('Сохранение и печать заблокированы');
            }
        });
        
        // Защита от скриншотов через devtools
        this.detectDevTools();
    }
    
    // Анти-скриншот
    takeAntiScreenshot() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            z-index: 999999;
        `;
        overlay.innerHTML = '<div>СКРИНШОТЫ ЗАПРЕЩЕНЫ</div>';
        
        document.body.appendChild(overlay);
        
        setTimeout(() => overlay.remove(), 1000);
    }
    
    // Детект DevTools
    detectDevTools() {
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: () => {
                this.showSecurityMessage('Обнаружены инструменты разработчика');
            }
        });
        
        console.log('%c', element);
    }
    
    // Система аудита
    async logSecurityEvent(action, data = {}) {
        const user = this.auth.currentUser;
        
        const logEntry = {
            userId: user?.uid || 'anonymous',
            userEmail: user?.email || 'guest',
            action: action,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ip: await this.getClientIP(),
            userAgent: navigator.userAgent,
            data: data
        };
        
        await this.db.collection('security_logs').add(logEntry);
        
        // Критичные события - отправляем алерт
        if (this.isCriticalEvent(action)) {
            await this.sendAlert(action, logEntry);
        }
    }
    
    // Отправка алертов
    async sendAlert(action, data) {
        await this.db.collection('alerts').add({
            type: 'security_alert',
            action: action,
            data: data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false,
            severity: 'high'
        });
    }
    
    // Получение IP
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }
    
    // Показать сообщение безопасности
    showSecurityMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'security-message';
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(msgDiv);
        
        setTimeout(() => {
            msgDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => msgDiv.remove(), 300);
        }, 3000);
    }
    
    // Критичные события
    isCriticalEvent(action) {
        const critical = [
            'unauthorized_access',
            'brute_force_detected',
            'document_download_attempt',
            'geoblock_violation'
        ];
        return critical.includes(action);
    }
}

// Инициализация системы безопасности
const securitySystem = new SecuritySystem();
window.securitySystem = securitySystem;
