// notifications.js
// Система уведомлений для Метро New

class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('metro_notifications')) || [
            {
                id: 1,
                title: 'Новое обновление!',
                message: 'Вышло обновление v2.5 с новыми станциями',
                time: '10 мин назад',
                read: false,
                date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                type: 'update'
            },
            {
                id: 2,
                title: 'Безопасность аккаунта',
                message: 'Ваши данные в полной безопасности',
                time: '1 час назад',
                read: false,
                date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                type: 'security'
            },
            {
                id: 3,
                title: 'Добро пожаловать!',
                message: 'Рады видеть вас в нашем проекте Метро New',
                time: 'Только что',
                read: false,
                date: new Date().toISOString(),
                type: 'welcome'
            }
        ];
        this.init();
    }

    init() {
        this.renderNotifications();
        this.updateBadge();
        this.setupEventListeners();
    }

    renderNotifications() {
        const list = document.getElementById('notifications-list');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-item">
                    <div class="notification-message" style="text-align: center; padding: 2rem; color: var(--gray);">
                        Нет новых уведомлений
                    </div>
                </div>
            `;
            return;
        }

        list.innerHTML = this.notifications.map(notif => {
            const icon = this.getIconByType(notif.type);
            const timeAgo = this.formatTime(notif.date);
            
            return `
                <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
                    <div class="notification-icon">${icon}</div>
                    <div class="notification-content">
                        <div class="notification-header">
                            <div class="notification-title">${this.escapeHtml(notif.title)}</div>
                            <div class="notification-time">${timeAgo}</div>
                        </div>
                        <div class="notification-message">${this.escapeHtml(notif.message)}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Добавляем обработчики кликов на уведомления
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-actions')) {
                    const id = parseInt(item.dataset.id);
                    this.markAsRead(id);
                }
            });
        });
    }

    getIconByType(type) {
        const icons = {
            'update': '<i class="fas fa-sync-alt"></i>',
            'security': '<i class="fas fa-shield-alt"></i>',
            'welcome': '<i class="fas fa-heart"></i>',
            'info': '<i class="fas fa-info-circle"></i>',
            'warning': '<i class="fas fa-exclamation-triangle"></i>',
            'error': '<i class="fas fa-times-circle"></i>',
            'success': '<i class="fas fa-check-circle"></i>'
        };
        return icons[type] || icons.info;
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
            return 'Только что';
        } else if (diffMins < 60) {
            return `${diffMins} мин назад`;
        } else if (diffHours < 24) {
            return `${diffHours} час${this.getRussianPlural(diffHours, ['', 'а', 'ов'])} назад`;
        } else if (diffDays < 7) {
            return `${diffDays} день${this.getRussianPlural(diffDays, ['', 'я', 'ей'])} назад`;
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }

    getRussianPlural(number, forms) {
        const n = Math.abs(number) % 100;
        const n1 = n % 10;
        
        if (n > 10 && n < 20) return forms[2];
        if (n1 > 1 && n1 < 5) return forms[1];
        if (n1 === 1) return forms[0];
        return forms[2];
    }

    updateBadge() {
        const badge = document.getElementById('notification-count');
        if (!badge) return;

        const unreadCount = this.notifications.filter(n => !n.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        
        // Обновляем title кнопки
        const notificationBtn = document.getElementById('notification-btn');
        if (notificationBtn) {
            notificationBtn.title = unreadCount > 0 
                ? `Уведомления (${unreadCount} новых)`
                : 'Уведомления';
        }
    }

    addNotification(title, message, type = 'info') {
        const newNotif = {
            id: Date.now(),
            title: this.escapeHtml(title),
            message: this.escapeHtml(message),
            time: 'Только что',
            read: false,
            date: new Date().toISOString(),
            type: type
        };

        this.notifications.unshift(newNotif);
        
        // Ограничиваем количество уведомлений
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }

        this.save();
        this.renderNotifications();
        this.updateBadge();
        
        // Показываем тост-уведомление
        this.showToastNotification(title, message, type);
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.save();
            this.updateBadge();
            
            // Обновляем стиль уведомления
            const item = document.querySelector(`.notification-item[data-id="${id}"]`);
            if (item) {
                item.classList.remove('unread');
                item.classList.add('read');
            }
        }
    }

    markAllAsRead() {
        let changed = false;
        this.notifications.forEach(notif => {
            if (!notif.read) {
                notif.read = true;
                changed = true;
            }
        });
        
        if (changed) {
            this.save();
            this.renderNotifications();
            this.updateBadge();
        }
    }

    clearAll() {
        if (this.notifications.length > 0) {
            this.notifications = [];
            this.save();
            this.renderNotifications();
            this.updateBadge();
        }
    }

    clearRead() {
        this.notifications = this.notifications.filter(n => !n.read);
        this.save();
        this.renderNotifications();
        this.updateBadge();
    }

    showToastNotification(title, message, type = 'info') {
        // Создаем тост
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--notification-bg, var(--dark));
            color: var(--notification-color, white);
            padding: 1rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            max-width: 350px;
            min-width: 300px;
            animation: notificationSlideIn 0.3s ease;
            border-left: 4px solid ${this.getTypeColor(type)};
            display: flex;
            gap: 12px;
            align-items: flex-start;
        `;
        
        const icon = this.getIconByType(type);
        
        toast.innerHTML = `
            <div class="toast-icon" style="color: ${this.getTypeColor(type)}; font-size: 1.2rem;">
                ${icon}
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px; font-size: 0.95rem;">
                    ${this.escapeHtml(title)}
                </div>
                <div style="font-size: 0.85rem; opacity: 0.9; line-height: 1.4;">
                    ${this.escapeHtml(message)}
                </div>
            </div>
            <button class="toast-close" style="background: none; border: none; color: inherit; cursor: pointer; opacity: 0.7; font-size: 0.9rem;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // Обработчик закрытия
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.hideToast(toast);
        });
        
        // Автоматическое закрытие через 5 секунд
        const autoClose = setTimeout(() => {
            this.hideToast(toast);
        }, 5000);
        
        // Останавливаем таймер при наведении
        toast.addEventListener('mouseenter', () => {
            clearTimeout(autoClose);
        });
        
        toast.addEventListener('mouseleave', () => {
            setTimeout(() => {
                this.hideToast(toast);
            }, 2000);
        });
    }

    hideToast(toast) {
        toast.style.animation = 'notificationSlideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    getTypeColor(type) {
        const colors = {
            'update': '#4d94ff',
            'security': '#ff6b6b',
            'welcome': '#ffd93d',
            'info': '#6bc5ff',
            'warning': '#ffa726',
            'error': '#ff4757',
            'success': '#2ed573'
        };
        return colors[type] || colors.info;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    save() {
        localStorage.setItem('metro_notifications', JSON.stringify(this.notifications));
    }

    setupEventListeners() {
        // Кнопка очистки всех уведомлений
        const clearAllBtn = document.getElementById('clear-notifications-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.notifications.length > 0) {
                    if (confirm('Вы уверены, что хотите удалить все уведомления?')) {
                        this.clearAll();
                    }
                }
            });
        }

        // Кнопка пометить все как прочитанные
        const markAllReadBtn = document.getElementById('mark-all-read-btn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAllAsRead();
            });
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.notificationSystem = new NotificationSystem();
    
    // Добавляем CSS анимации для уведомлений
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes notificationSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes notificationSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-toast {
                transition: all 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
});

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}
