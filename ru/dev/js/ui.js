// Утилиты для UI
import { store } from './store.js';

// Кеширование DOM элементов
const $ = {
    // По ID
    id: (id) => document.getElementById(id),
    
    // По селектору (один)
    q: (selector) => document.querySelector(selector),
    
    // По селектору (все)
    qa: (selector) => document.querySelectorAll(selector),
    
    // Создать элемент с классами
    create: (tag, classes = []) => {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes);
        return el;
    }
};

// Debounce для оптимизации производительности
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle для ограничения частоты вызовов
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Показать toast уведомление
export function showToast(message, type = 'info', duration = 3000) {
    const container = $.id('toastContainer') || (() => {
        const div = $.create('div', ['toast-container']);
        div.id = 'toastContainer';
        document.body.appendChild(div);
        return div;
    })();
    
    const toast = $.create('div', ['toast', type]);
    toast.setAttribute('role', 'alert');
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type];
    
    toast.innerHTML = `
        <i class="${icon}" aria-hidden="true"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Показать модальное окно
export function showModal(modalId) {
    const modal = $.id(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        store.openModal(modalId.replace('Modal', '').toLowerCase());
    }
}

// Скрыть модальное окно
export function hideModal(modalId) {
    const modal = $.id(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        store.closeModal(modalId.replace('Modal', '').toLowerCase());
    }
}

// Инициализация всех модальных окон
export function initModals() {
    $.qa('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal.id);
        });
    });
    
    $.qa('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            $.qa('.modal.show').forEach(modal => {
                hideModal(modal.id);
            });
        }
    });
}

// Обновление интерфейса в зависимости от состояния
export function updateUI(state) {
    const { user, settings } = state;
    
    // Обновляем тему
    if (settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // Обновляем информацию о пользователе в хедере
    updateHeader(user);
    
    // Обновляем модалку аккаунта
    updateAccountModal(user);
    
    // Обновляем счетчик уведомлений
    updateNotificationBadge();
}

function updateHeader(user) {
    const userName = $.id('userName');
    const userStatus = $.id('userStatus');
    const userAvatar = $.id('userAvatar');
    
    if (user) {
        const displayName = user.displayName || 'Пользователь';
        const email = user.email || 'Без email';
        const isAnonymous = user.isAnonymous;
        const isEmailVerified = user.emailVerified;
        
        userName.textContent = isAnonymous ? 'Гость' : displayName;
        userStatus.textContent = isAnonymous ? 'Гостевой режим' : (isEmailVerified ? '✓ ' : '') + email;
        
        if (user.photoURL) {
            userAvatar.innerHTML = `<img src="${user.photoURL}" alt="${displayName}" loading="lazy">`;
        } else {
            userAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
        }
    } else {
        userName.textContent = 'Гость';
        userStatus.textContent = 'Войти в аккаунт';
        userAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
    }
}

function updateAccountModal(user) {
    const accountName = $.id('accountName');
    const accountEmail = $.id('accountEmail');
    const accountBadge = $.id('accountBadge');
    const accountAvatar = $.id('accountAvatar');
    const profileStatus = $.id('profileStatus');
    const profileRegDate = $.id('profileRegDate');
    const profileLastLogin = $.id('profileLastLogin');
    const profileUID = $.id('profileUID');
    const profileActions = $.id('profileActionsSection');
    const authNote = $.id('authNote');
    
    if (user) {
        const displayName = user.displayName || 'Пользователь';
        const email = user.email || 'Без email';
        const isAnonymous = user.isAnonymous;
        const isEmailVerified = user.emailVerified;
        
        accountName.textContent = isAnonymous ? 'Гость' : displayName;
        accountEmail.textContent = isAnonymous ? 'Гостевой режим' : (isEmailVerified ? '✓ ' : '') + email;
        accountBadge.textContent = isAnonymous ? 'Гость' : (isEmailVerified ? 'Верифицирован' : 'Пользователь');
        profileStatus.textContent = isAnonymous ? 'Гость' : (isEmailVerified ? 'Верифицированный' : 'Пользователь');
        profileRegDate.textContent = user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('ru-RU') : '—';
        profileLastLogin.textContent = user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString('ru-RU') : '—';
        profileUID.textContent = user.uid ? user.uid.substring(0, 8) + '...' : '—';
        
        if (user.photoURL) {
            accountAvatar.innerHTML = `<img src="${user.photoURL}" alt="${displayName}" loading="lazy">`;
        } else {
            accountAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
        }
        
        if (!isAnonymous) {
            profileActions.style.display = 'block';
            authNote.textContent = isEmailVerified ? 'Email подтверждён ✓' : 'Подтвердите email для полного доступа';
        } else {
            profileActions.style.display = 'none';
            authNote.textContent = 'Вы в гостевом режиме. Войдите в аккаунт, чтобы сохранить прогресс.';
        }
    } else {
        accountName.textContent = 'Гость';
        accountEmail.textContent = 'Не авторизован';
        accountBadge.textContent = 'Гость';
        profileStatus.textContent = 'Гость';
        profileRegDate.textContent = '—';
        profileLastLogin.textContent = '—';
        profileUID.textContent = '—';
        accountAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
        profileActions.style.display = 'none';
        authNote.textContent = 'Войдите в аккаунт для доступа ко всем функциям';
    }
}

function updateNotificationBadge() {
    const badge = $.id('notifBadge');
    if (badge) {
        const count = store.getUnreadCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Экспорт утилит
export { $ };
