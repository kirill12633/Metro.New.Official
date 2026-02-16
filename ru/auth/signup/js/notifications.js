// ============================================
// УВЕДОМЛЕНИЯ (SweetAlert стиль без библиотек)
// ============================================

const Notifications = {
    // ========== ПОКАЗАТЬ УСПЕХ ==========
    success(message, title = '✅ Успешно!') {
        this.show({
            title: title,
            message: message,
            type: 'success',
            icon: '✅',
            color: '#1e8e3e',
            bg: 'rgba(30, 142, 62, 0.1)',
            border: 'rgba(30, 142, 62, 0.2)'
        });
    },

    // ========== ПОКАЗАТЬ ОШИБКУ ==========
    error(message, title = '❌ Ошибка') {
        this.show({
            title: title,
            message: message,
            type: 'error',
            icon: '❌',
            color: '#d93025',
            bg: 'rgba(217, 48, 37, 0.1)',
            border: 'rgba(217, 48, 37, 0.2)'
        });
    },

    // ========== ПОКАЗАТЬ ПРЕДУПРЕЖДЕНИЕ ==========
    warning(message, title = '⚠️ Внимание') {
        this.show({
            title: title,
            message: message,
            type: 'warning',
            icon: '⚠️',
            color: '#fbbc04',
            bg: 'rgba(251, 188, 4, 0.1)',
            border: 'rgba(251, 188, 4, 0.2)'
        });
    },

    // ========== ПОКАЗАТЬ ИНФОРМАЦИЮ ==========
    info(message, title = 'ℹ️ Информация') {
        this.show({
            title: title,
            message: message,
            type: 'info',
            icon: 'ℹ️',
            color: '#0066CC',
            bg: 'rgba(0, 102, 204, 0.1)',
            border: 'rgba(0, 102, 204, 0.2)'
        });
    },

    // ========== ОСНОВНАЯ ФУНКЦИЯ ПОКАЗА ==========
    show(options) {
        // Удаляем предыдущее уведомление если есть
        const oldToast = document.querySelector('.custom-toast');
        if (oldToast) oldToast.remove();

        // Создаем уведомление
        const toast = document.createElement('div');
        toast.className = `custom-toast toast-${options.type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            padding: 16px 20px;
            background: ${options.bg};
            border: 1px solid ${options.border};
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            color: ${options.color};
            font-family: 'Montserrat', sans-serif;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="font-size: 24px;">${options.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${options.title}</div>
                    <div style="font-size: 0.875rem; opacity: 0.9;">${options.message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: ${options.color}; cursor: pointer; font-size: 18px;">×</button>
            </div>
            <div class="toast-progress" style="
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: ${options.color};
                width: 100%;
                animation: progress 5s linear forwards;
            "></div>
        `;

        // Добавляем стили анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);

        // Автоматически скрыть через 5 секунд
        setTimeout(() => {
            if (toast && toast.parentElement) {
                toast.style.animation = 'slideIn 0.3s reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    },

    // ========== ПОКАЗАТЬ ПОДТВЕРЖДЕНИЕ ==========
    confirm(message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        `;

        modal.innerHTML = `
            <div style="
                background: var(--light);
                padding: 24px;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            ">
                <h3 style="margin: 0 0 12px; color: var(--dark);">❓ Подтверждение</h3>
                <p style="margin: 0 0 20px; color: var(--gray);">${message}</p>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button class="btn btn-secondary" id="cancelConfirm">Отмена</button>
                    <button class="btn btn-primary" id="okConfirm">Да</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('cancelConfirm').onclick = () => {
            modal.remove();
            if (onCancel) onCancel();
        };

        document.getElementById('okConfirm').onclick = () => {
            modal.remove();
            if (onConfirm) onConfirm();
        };
    },

    // ========== ПОКАЗАТЬ ЗАГРУЗКУ ==========
    loading(message = 'Загрузка...') {
        const loader = document.createElement('div');
        loader.className = 'custom-loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        loader.innerHTML = `
            <div style="
                background: var(--light);
                padding: 30px;
                border-radius: 12px;
                text-align: center;
            ">
                <div class="loading-spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid var(--gray-border);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                "></div>
                <div style="color: var(--gray);">${message}</div>
            </div>
        `;

        document.body.appendChild(loader);
        return loader;
    },

    // ========== ПОКАЗАТЬ РЕЗУЛЬТАТ РЕГИСТРАЦИИ ==========
    registrationResult(success, message) {
        if (success) {
            this.success(message || 'Регистрация прошла успешно! ✅');
            
            // Перенаправление через 3 секунды
            setTimeout(() => {
                window.location.href = 'https://kirill12633.github.io/Metro.New.Official/ru/';
            }, 3000);
        } else {
            this.error(message || 'Ошибка регистрации. Попробуйте еще раз');
        }
    }
};

// ========== ЭКСПОРТ ==========
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Notifications;
} else {
    window.Notifications = Notifications;
}
