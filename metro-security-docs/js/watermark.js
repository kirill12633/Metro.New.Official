// js/watermark.js
class WatermarkSystem {
    constructor() {
        this.watermarkElement = null;
        this.userInfo = null;
        this.init();
    }

    async init() {
        // Получаем информацию о пользователе
        await this.loadUserInfo();
        // Создаем водяной знак
        this.createWatermark();
        // Защищаем от удаления
        this.protectWatermark();
    }

    async loadUserInfo() {
        const user = firebase.auth().currentUser;
        if (!user) return;

        try {
            const ip = await this.getIPAddress();
            const timestamp = new Date().toLocaleString('ru-RU');
            
            this.userInfo = {
                email: user.email,
                userId: user.uid,
                ip: ip,
                timestamp: timestamp,
                userAgent: navigator.userAgent
            };
        } catch (error) {
            console.error('Ошибка загрузки информации:', error);
        }
    }

    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    createWatermark() {
        // Удаляем старый водяной знак если есть
        if (this.watermarkElement) {
            this.watermarkElement.remove();
        }

        // Создаем новый водяной знак
        this.watermarkElement = document.createElement('div');
        this.watermarkElement.id = 'security-watermark';
        
        const watermarkText = this.userInfo 
            ? `${this.userInfo.email} | ${this.userInfo.ip} | ${this.userInfo.timestamp}`
            : 'Metro Security Docs | Конфиденциально';
        
        this.watermarkElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999999;
            opacity: 0.15;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 150px,
                rgba(255, 0, 0, 0.1) 150px,
                rgba(255, 0, 0, 0.1) 300px
            );
        `;

        // Добавляем текстовый водяной знак
        const textOverlay = document.createElement('div');
        textOverlay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 28px;
            color: rgba(255, 0, 0, 0.4);
            white-space: nowrap;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            letter-spacing: 2px;
        `;
        textOverlay.textContent = watermarkText;

        // Добавляем скрытый водяной знак для PDF
        const hiddenWatermark = document.createElement('div');
        hiddenWatermark.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 1px;
            color: transparent;
            user-select: none;
        `;
        hiddenWatermark.textContent = `METRO_SECURITY:${btoa(JSON.stringify(this.userInfo))}`;

        this.watermarkElement.appendChild(textOverlay);
        this.watermarkElement.appendChild(hiddenWatermark);
        document.body.appendChild(this.watermarkElement);
    }

    protectWatermark() {
        // Защита от удаления через MutationObserver
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.removedNodes.length) {
                    mutation.removedNodes.forEach((node) => {
                        if (node === this.watermarkElement || node.contains?.(this.watermarkElement)) {
                            console.warn('⚠️ Попытка удаления водяного знака!');
                            document.body.appendChild(this.watermarkElement);
                            
                            // Логируем попытку удаления
                            this.logSecurityEvent('watermark_removal_attempt');
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true });

        // Защита от копирования
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.logSecurityEvent('copy_attempt');
            alert('⚠️ Копирование запрещено системой безопасности!');
        });

        // Защита от скриншотов (частичная)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                this.logSecurityEvent('print_attempt');
                alert('⚠️ Печать документов разрешена только администратором!');
            }
            
            // Блокировка PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                this.logSecurityEvent('screenshot_attempt');
                alert('⚠️ Создание скриншотов запрещено!');
            }
        });
    }

    async logSecurityEvent(eventType) {
        try {
            const user = firebase.auth().currentUser;
            if (!user) return;

            const ip = await this.getIPAddress();
            
            await firebase.firestore().collection('security_events').add({
                eventType: eventType,
                userId: user.uid,
                userEmail: user.email,
                ipAddress: ip,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
                severity: 'high',
                details: 'Попытка обхода системы безопасности'
            });
        } catch (error) {
            console.error('Ошибка логирования:', error);
        }
    }

    // Динамическое обновление водяного знака
    updateWatermark(newInfo = {}) {
        this.userInfo = { ...this.userInfo, ...newInfo };
        this.createWatermark();
    }

    // Удаление водяного знака (только для админа)
    removeWatermark() {
        if (this.watermarkElement) {
            this.watermarkElement.remove();
            this.watermarkElement = null;
        }
    }
}

// Инициализация системы водяных знаков
let watermarkSystem = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('viewer.html')) {
        setTimeout(() => {
            watermarkSystem = new WatermarkSystem();
        }, 1000);
    }
});

// Экспорт для использования в других файлах
window.WatermarkSystem = WatermarkSystem;
