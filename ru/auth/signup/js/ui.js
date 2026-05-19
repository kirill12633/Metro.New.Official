// ============================================
// ИНТЕРФЕЙС И УВЕДОМЛЕНИЯ
// ============================================

class UIManager {
    constructor() {
        this.currentForm = 'register';
        this.currentStep = 1;
        this.resendTimer = null;
        this.resendSeconds = 60;
        this.notifications = [];
    }
    
    // ============================================
    // ПЕРЕКЛЮЧЕНИЕ ФОРМ
    // ============================================
    showForm(formName) {
        // Скрыть все формы
        document.querySelectorAll('.form-container').forEach(form => {
            form.classList.remove('active');
        });
        
        // Показать нужную
        const formMap = {
            'register': 'registerForm',
            'login': 'loginForm',
            'reset': 'resetPasswordForm',
            'loading': 'loadingScreen',
            'success': 'successScreen',
            'age-restriction': 'ageRestrictionScreen',
            'reset-success': 'resetSuccessScreen'
        };
        
        const formId = formMap[formName];
        if (formId) {
            const form = document.getElementById(formId);
            if (form) {
                form.classList.add('active');
                this.currentForm = formName;
            }
        }
        
        // Обновление заголовка
        this.updateHeader(formName);
    }
    
    // ============================================
    // ОБНОВЛЕНИЕ ЗАГОЛОВКА
    // ============================================
    updateHeader(formName) {
        const title = document.getElementById('formTitle');
        const subtitle = document.getElementById('formSubtitle');
        
        if (!title || !subtitle) return;
        
        const headers = {
            'register': {
                title: 'Создать аккаунт',
                subtitle: 'Для входа в Метро New'
            },
            'login': {
                title: 'Войти в аккаунт',
                subtitle: 'Добро пожаловать обратно'
            },
            'reset': {
                title: 'Сброс пароля',
                subtitle: 'Восстановление доступа'
            }
        };
        
        const header = headers[formName];
        if (header) {
            title.textContent = header.title;
            subtitle.textContent = header.subtitle;
        }
    }
    
    // ============================================
    // ШАГИ РЕГИСТРАЦИИ
    // ============================================
    goToStep(step) {
        // Скрыть все шаги
        document.querySelectorAll('.registration-step').forEach(s => {
            s.classList.remove('active');
        });
        
        // Показать нужный шаг
        const stepElement = document.getElementById(`step${step}`);
        if (stepElement) {
            stepElement.classList.add('active');
            this.currentStep = step;
        }
        
        // Обновление прогресс-бара
        this.updateProgress(step);
    }
    
    updateProgress(step) {
        const progressFill = document.getElementById('progressFill');
        const steps = document.querySelectorAll('.step');
        
        if (progressFill) {
            const percent = (step / 3) * 100;
            progressFill.style.width = `${percent}%`;
        }
        
        // Обновление индикаторов шагов
        steps.forEach((stepEl, index) => {
            const stepNum = index + 1;
            stepEl.classList.remove('active', 'completed');
            
            if (stepNum < step) {
                stepEl.classList.add('completed');
            } else if (stepNum === step) {
                stepEl.classList.add('active');
            }
        });
    }
    
    // ============================================
    // УВЕДОМЛЕНИЯ
    // ============================================
    showNotification(message, type = 'info', duration = 3000) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas ${icons[type] || icons.info}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        this.notifications.push(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease';
        }, 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            this.hideNotification(notification);
        }, duration);
        
        return notification;
    }
    
    hideNotification(notification) {
        notification.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => {
            notification.remove();
            this.notifications = this.notifications.filter(n => n !== notification);
        }, 300);
    }
    
    // ============================================
    // АЛЕРТЫ
    // ============================================
    showAlert(message, type = 'info', container = 'errorAlert') {
        const alert = document.getElementById(container);
        if (!alert) return;
        
        const icons = {
            error: 'fa-exclamation-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `<i class="fas ${icons[type]}"></i> <span>${message}</span>`;
        alert.style.display = 'flex';
        
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
    }
    
    hideAlert(container = 'errorAlert') {
        const alert = document.getElementById(container);
        if (alert) {
            alert.style.display = 'none';
        }
    }
    
    // ============================================
    // ЗАГРУЗКА
    // ============================================
    showLoading(message = 'Загрузка...') {
        this.showForm('loading');
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
    
    hideLoading() {
        // Возврат к предыдущей форме
        this.showForm(this.currentForm);
    }
    
    // ============================================
    // ТАЙМЕР ПОВТОРНОЙ ОТПРАВКИ
    // ============================================
    startResendTimer(callback) {
        const btn = document.getElementById('resendEmailBtn');
        const timerText = document.getElementById('resendTimerText');
        
        if (!btn || !timerText) return;
        
        let seconds = this.resendSeconds;
        btn.disabled = true;
        
        if (this.resendTimer) {
            clearInterval(this.resendTimer);
        }
        
        this.resendTimer = setInterval(() => {
            seconds--;
            timerText.textContent = `Отправить повторно (${seconds}с)`;
            
            if (seconds <= 0) {
                clearInterval(this.resendTimer);
                btn.disabled = false;
                timerText.textContent = 'Отправить повторно';
                
                if (callback && typeof callback === 'function') {
                    btn.onclick = callback;
                }
            }
        }, 1000);
    }
    
    // ============================================
    // ВАЛИДАЦИЯ ПОЛЕЙ (визуальная)
    // ============================================
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const hint = document.getElementById(`${fieldId}Hint`);
        
        if (field) {
            field.classList.add('error');
        }
        
        if (hint) {
            hint.textContent = message;
            hint.className = 'form-hint error';
        }
    }
    
    showFieldSuccess(fieldId, message) {
        const field = document.getElementById(fieldId);
        const hint = document.getElementById(`${fieldId}Hint`);
        
        if (field) {
            field.classList.remove('error');
        }
        
        if (hint) {
            hint.textContent = message;
            hint.className = 'form-hint success';
        }
    }
    
    clearFieldState(fieldId) {
        const field = document.getElementById(fieldId);
        const hint = document.getElementById(`${fieldId}Hint`);
        
        if (field) {
            field.classList.remove('error');
        }
        
        if (hint) {
            hint.className = 'form-hint';
        }
    }
    
    // ============================================
    // ОТОБРАЖЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
    // ============================================
    showUserDataSummary(data) {
        const summary = document.getElementById('userDataSummary');
        if (!summary) return;
        
        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        
        summary.innerHTML = `
            <div>👤 <strong>${data.firstName}</strong> (@${data.username})</div>
            <div>📧 ${data.email}</div>
            ${data.birthDate ? `<div>📅 ${data.birthDate.day} ${months[data.birthDate.month - 1]} ${data.birthDate.year} (${data.age} лет)</div>` : ''}
            <div>🏷️ Возрастная группа: ${data.ageGroup}</div>
        `;
    }
    
    // ============================================
    // ПОКАЗ ЭКРАНА ВОЗРАСТНОГО ОГРАНИЧЕНИЯ
    // ============================================
    showAgeRestriction(age) {
        this.showForm('age-restriction');
        
        const yearsLeft = 13 - age;
        let yearWord = 'лет';
        if (yearsLeft === 1) yearWord = 'год';
        else if (yearsLeft >= 2 && yearsLeft <= 4) yearWord = 'года';
        
        const message = document.getElementById('ageRestrictionMessage');
        if (message) {
            message.innerHTML = `
                Тебе ${age} лет. Регистрация доступна с 13 лет.<br><br>
                <strong>Вернись через ${yearsLeft} ${yearWord}</strong>
            `;
        }
    }
    
    // ============================================
    // ПОКАЗ УСПЕШНОЙ РЕГИСТРАЦИИ
    // ============================================
    showRegistrationSuccess(email) {
        this.showForm('success');
        
        const message = document.getElementById('successMessage');
        if (message) {
            message.innerHTML = `
                Аккаунт создан!<br>
                <small style="font-size: 0.875rem;">
                    На адрес <strong>${email}</strong> отправлено письмо для подтверждения.
                    <br>Пожалуйста, подтвердите email, чтобы войти.
                </small>
            `;
        }
    }
    
    // ============================================
    // ОЧИСТКА ВСЕХ ФОРМ
    // ============================================
    clearForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => form.reset());
        
        // Очистка подсказок
        document.querySelectorAll('.form-hint').forEach(hint => {
            hint.className = 'form-hint';
        });
        
        // Очистка ошибок полей
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
    }
    
    // ============================================
    // БЛОКИРОВКА/РАЗБЛОКИРОВКА КНОПОК
    // ============================================
    disableButton(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        }
    }
    
    enableButton(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    }
    
    // ============================================
    // ПОДТВЕРЖДЕНИЕ ДЕЙСТВИЯ
    // ============================================
    async confirmAction(message) {
        return new Promise((resolve) => {
            const result = confirm(message);
            resolve(result);
        });
    }
}

// Создание глобального экземпляра
const ui = new UIManager();

console.log('🎨 Модуль интерфейса загружен');
