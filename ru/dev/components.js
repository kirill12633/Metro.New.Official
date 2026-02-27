// components.js - Единый файл для навигации, аккаунта и футера

// ===========================================
// КОНФИГУРАЦИЯ САЙТА (меняете только здесь!)
// ===========================================
const SITE_CONFIG = {
    // НАВИГАЦИЯ - список всех страниц
    nav: [
        { url: 'index.html', name: 'Главная' },
        { url: 'about.html', name: 'О проекте' },
        { url: 'news.html', name: 'Новости' },
        { url: 'wiki.html', name: 'Wiki' },
        { url: 'faq.html', name: 'FAQ' },
        { url: 'contact.html', name: 'Контакты' }
        // 🔥 ДОБАВЛЯЙТЕ НОВЫЕ СТРАНИЦЫ СЮДА
        // { url: 'gallery.html', name: 'Галерея' },
    ],

    // СОЦИАЛЬНЫЕ СЕТИ
    social: {
        discord: 'https://discord.com/invite/WjGZBs3HMX',
        telegram: 'https://t.me/metronewroblox',
        youtube: 'https://www.youtube.com/@Metro-RP-NEW-Roblox',
        roblox: 'https://www.roblox.com/communities/34820737/RP-NEW'
    },

    // ДОКУМЕНТЫ
    docs: {
        privacy: 'https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html',
        terms: 'https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html',
        refund: 'https://kirill12633.github.io/Metro.New.Official/Rules/refund-policy.html',
        rules: 'https://kirill12633.github.io/Metro.New.Official/Rules/legal.html'
    },

    // ПОДДЕРЖКА
    support: {
        main: 'https://kirill12633.github.io/support.metro.new/',
        status: 'https://kirill12633.github.io/status.metro.new/'
    }
};

// ===========================================
// ОСНОВНОЙ КЛАСС ДЛЯ УПРАВЛЕНИЯ КОМПОНЕНТАМИ
// ===========================================
class SiteComponents {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    // Определяем текущую страницу
    getCurrentPage() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        return path;
    }

    // Инициализация всех компонентов
    init() {
        this.updateNavigation();
        this.updateBreadcrumbs();
        this.updateFooter();
        this.updateUserMenu(); // Это обновит меню через Firebase
    }

    // ОБНОВЛЕНИЕ НАВИГАЦИИ
    updateNavigation() {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        const currentPage = this.currentPage;
        
        navLinks.innerHTML = SITE_CONFIG.nav.map(item => {
            const isActive = item.url === currentPage;
            return `<a href="${item.url}" class="${isActive ? 'active' : ''}">${item.name}</a>`;
        }).join('');
    }

    // ОБНОВЛЕНИЕ ХЛЕБНЫХ КРОШЕК
    updateBreadcrumbs() {
        const breadcrumbs = document.querySelector('.breadcrumbs');
        if (!breadcrumbs) return;

        const currentPage = SITE_CONFIG.nav.find(item => item.url === this.currentPage);
        
        if (this.currentPage === 'index.html') {
            breadcrumbs.innerHTML = `
                <div class="breadcrumb-item">
                    <span class="breadcrumb-current">Главная</span>
                </div>
            `;
        } else {
            breadcrumbs.innerHTML = `
                <div class="breadcrumb-item">
                    <a href="index.html">Главная</a>
                    <span class="breadcrumb-separator">›</span>
                </div>
                <div class="breadcrumb-item">
                    <span class="breadcrumb-current">${currentPage?.name || 'Страница'}</span>
                </div>
            `;
        }
    }

    // ОБНОВЛЕНИЕ ФУТЕРА
    updateFooter() {
        // Обновляем ссылки в футере
        this.updateFooterLinks();
        this.updateSocialLinks();
        this.updateYear();
    }

    updateFooterLinks() {
        // Документы
        const privacyBtn = document.getElementById('privacyPolicyBtn');
        const termsBtn = document.getElementById('termsOfServiceBtn');
        const rulesBtn = document.getElementById('rulesBtn');
        const refundBtn = document.getElementById('refundPolicyBtn');

        if (privacyBtn) privacyBtn.href = SITE_CONFIG.docs.privacy;
        if (termsBtn) termsBtn.href = SITE_CONFIG.docs.terms;
        if (rulesBtn) rulesBtn.href = SITE_CONFIG.docs.rules;
        if (refundBtn) refundBtn.href = SITE_CONFIG.docs.refund;

        // Поддержка
        const supportLinks = document.querySelectorAll('a[href="#support"]');
        supportLinks.forEach(link => {
            link.href = SITE_CONFIG.support.main;
        });

        const statusLinks = document.querySelectorAll('a[href="#status"]');
        statusLinks.forEach(link => {
            link.href = SITE_CONFIG.support.status;
        });
    }

    updateSocialLinks() {
        // Discord
        const discordLinks = document.querySelectorAll('a[href*="discord.com"]');
        discordLinks.forEach(link => {
            link.href = SITE_CONFIG.social.discord;
        });

        // Telegram
        const telegramLinks = document.querySelectorAll('a[href*="t.me"]');
        telegramLinks.forEach(link => {
            link.href = SITE_CONFIG.social.telegram;
        });

        // YouTube
        const youtubeLinks = document.querySelectorAll('a[href*="youtube.com"]');
        youtubeLinks.forEach(link => {
            link.href = SITE_CONFIG.social.youtube;
        });

        // Roblox
        const robloxLinks = document.querySelectorAll('a[href*="roblox.com"]');
        robloxLinks.forEach(link => {
            link.href = SITE_CONFIG.social.roblox;
        });
    }

    updateYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // ОБНОВЛЕНИЕ МЕНЮ ПОЛЬЗОВАТЕЛЯ (ЧЕРЕЗ FIREBASE)
    updateUserMenu() {
        // Эта функция будет вызвана из Firebase кода
        // Она обновляет меню в зависимости от статуса пользователя
    }
}

// ===========================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // Создаем экземпляр компонентов
    window.siteComponents = new SiteComponents();
    
    // Обновляем год
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// ===========================================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ FIREBASE
// ===========================================

// Функция для обновления меню (будет вызываться из Firebase)
function updateUserMenuFromFirebase(user) {
    const userMenu = document.getElementById('userMenu');
    if (!userMenu) return;

    if (user) {
        // Пользователь авторизован
        const displayName = user.displayName || 'Пользователь';
        const email = user.email || 'Без email';
        const isAnonymous = user.isAnonymous;
        const isEmailVerified = user.emailVerified;

        userMenu.innerHTML = `
            <div class="dropdown-header" style="padding: 0.75rem 1rem;">
                <div style="font-weight: 600;">${isAnonymous ? 'Гость' : displayName}</div>
                <small style="color: var(--gray);">${isAnonymous ? 'Гостевой режим' : (isEmailVerified ? '✓ ' : '') + email}</small>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" id="openAccountBtn">
                <i class="fas fa-user-circle"></i>
                <span>Мой аккаунт</span>
            </button>
            <div class="dropdown-divider"></div>
            ${isAnonymous ? `
                <button class="dropdown-item" id="upgradeAccountBtn">
                    <i class="fas fa-user-plus"></i>
                    <span>Создать аккаунт</span>
                </button>
            ` : ''}
            <button class="dropdown-item logout" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i>
                <span>${isAnonymous ? 'Выйти из гостевого режима' : 'Выйти'}</span>
            </button>
        `;

        // Добавляем обработчики
        setTimeout(() => {
            document.getElementById('logoutBtn')?.addEventListener('click', signOut);
            document.getElementById('upgradeAccountBtn')?.addEventListener('click', () => {
                document.getElementById('userDropdown')?.classList.remove('show');
                document.getElementById('authModal')?.classList.add('show');
                document.querySelector('[data-tab="register"]')?.click();
            });
        }, 100);

    } else {
        // Гость
        userMenu.innerHTML = `
            <div class="dropdown-header" style="padding: 0.75rem 1rem;">
                <div style="font-weight: 600;">Гость</div>
                <small style="color: var(--gray);">Не авторизован</small>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" id="openAccountBtn">
                <i class="fas fa-user-circle"></i>
                <span>Мой аккаунт</span>
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" id="loginMenuBtn">
                <i class="fas fa-sign-in-alt"></i>
                <span>Войти в аккаунт</span>
            </button>
            <button class="dropdown-item" id="registerMenuBtn">
                <i class="fas fa-user-plus"></i>
                <span>Зарегистрироваться</span>
            </button>
            <button class="dropdown-item" id="guestLoginBtn">
                <i class="fas fa-user-secret"></i>
                <span>Продолжить как гость</span>
            </button>
        `;

        // Добавляем обработчики
        setTimeout(() => {
            document.getElementById('loginMenuBtn')?.addEventListener('click', () => {
                document.getElementById('userDropdown')?.classList.remove('show');
                document.getElementById('authModal')?.classList.add('show');
                document.querySelector('[data-tab="login"]')?.click();
            });
            
            document.getElementById('registerMenuBtn')?.addEventListener('click', () => {
                document.getElementById('userDropdown')?.classList.remove('show');
                document.getElementById('authModal')?.classList.add('show');
                document.querySelector('[data-tab="register"]')?.click();
            });
            
            document.getElementById('guestLoginBtn')?.addEventListener('click', () => {
                document.getElementById('userDropdown')?.classList.remove('show');
                if (typeof signInAnonymously === 'function') {
                    signInAnonymously();
                }
            });
        }, 100);
    }
}

// Экспортируем функцию глобально
window.updateUserMenuFromFirebase = updateUserMenuFromFirebase;
