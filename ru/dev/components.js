// components.js - ЕДИНСТВЕННЫЙ файл для всего сайта

// ===========================================
// 1. КОНФИГУРАЦИЯ (меняете только здесь!)
// ===========================================
const SITE_CONFIG = {
    // НАВИГАЦИЯ (список страниц)
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

    // СОЦСЕТИ (ссылки)
    social: {
        discord: 'https://discord.com/invite/WjGZBs3HMX',
        telegram: 'https://t.me/metronewroblox',
        youtube: 'https://www.youtube.com/@Metro-RP-NEW-Roblox',
        roblox: 'https://www.roblox.com/communities/34820737/RP-NEW'
    },

    // КОНТАКТЫ
    contacts: {
        email: 'support@metronew.ru',
        support: 'https://kirill12633.github.io/support.metro.new/'
    },

    // ДОКУМЕНТЫ
    docs: {
        privacy: 'https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html',
        terms: 'https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html',
        refund: 'https://kirill12633.github.io/Metro.New.Official/Rules/refund-policy.html'
    }
};

// ===========================================
// 2. СОЗДАНИЕ ВСЕХ ЭЛЕМЕНТОВ НА СТРАНИЦЕ
// ===========================================
class SiteBuilder {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.build();
    }

    // Определяем текущую страницу
    getCurrentPage() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        return path;
    }

    // ГЛАВНАЯ ФУНКЦИЯ - СОЗДАЕТ ВСЁ
    build() {
        this.createHeader();
        this.createNavigation();
        this.createAccountSystem();
        this.createFooter();
        this.createModals();
        this.initAuth();
    }

    // СОЗДАЕМ ХЕДЕР
    createHeader() {
        const header = document.createElement('header');
        header.className = 'main-header';
        header.innerHTML = `
            <div class="header-container">
                <div class="logo">
                    <span class="logo-icon">M</span>
                    <span>Метро New</span>
                </div>
                
                <!-- НАВИГАЦИЯ (будет заполнена дальше) -->
                <nav class="nav-links" id="siteNav"></nav>
                
                <!-- АККАУНТ (будет заполнен) -->
                <div class="header-right" id="accountContainer"></div>
            </div>
            
            <!-- ХЛЕБНЫЕ КРОШКИ -->
            <div class="breadcrumbs container" id="breadcrumbs"></div>
        `;
        
        document.body.prepend(header);
    }

    // СОЗДАЕМ НАВИГАЦИЮ
    createNavigation() {
        const nav = document.getElementById('siteNav');
        const currentPage = this.currentPage;
        
        // Генерируем ссылки из конфига
        nav.innerHTML = SITE_CONFIG.nav.map(item => {
            const isActive = item.url === currentPage;
            return `<a href="${item.url}" class="${isActive ? 'active' : ''}">${item.name}</a>`;
        }).join('');
        
        // Создаем хлебные крошки
        this.createBreadcrumbs();
    }

    // СОЗДАЕМ ХЛЕБНЫЕ КРОШКИ
    createBreadcrumbs() {
        const breadcrumbs = document.getElementById('breadcrumbs');
        const currentPage = SITE_CONFIG.nav.find(item => item.url === this.currentPage);
        
        if (this.currentPage === 'index.html') {
            breadcrumbs.innerHTML = `<span class="breadcrumb-current">Главная</span>`;
        } else {
            breadcrumbs.innerHTML = `
                <a href="index.html" class="breadcrumb-link">Главная</a>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-current">${currentPage?.name || 'Страница'}</span>
            `;
        }
    }

    // СОЗДАЕМ СИСТЕМУ АККАУНТА
    createAccountSystem() {
        const container = document.getElementById('accountContainer');
        
        container.innerHTML = `
            <div class="account-system">
                <!-- Иконка профиля -->
                <div class="user-profile" id="userProfile">
                    <div class="user-avatar" id="userAvatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-info">
                        <div class="user-name" id="userName">Гость</div>
                        <div class="user-status" id="userStatus">Войти</div>
                    </div>
                </div>

                <!-- Выпадающее меню -->
                <div class="dropdown-menu" id="userMenu">
                    <div class="dropdown-header">
                        <div id="menuUserName">Гость</div>
                        <small id="menuUserEmail">Не авторизован</small>
                    </div>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item" onclick="openAccountModal()">
                        <i class="fas fa-user-circle"></i> Мой аккаунт
                    </button>
                    <button class="dropdown-item" onclick="openSettings()">
                        <i class="fas fa-cog"></i> Настройки
                    </button>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item" onclick="openLogin()">
                        <i class="fas fa-sign-in-alt"></i> Войти
                    </button>
                    <button class="dropdown-item" onclick="openRegister()">
                        <i class="fas fa-user-plus"></i> Регистрация
                    </button>
                    <button class="dropdown-item logout" id="logoutBtn" style="display: none;" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </button>
                </div>
            </div>
        `;

        // Добавляем обработчик для открытия меню
        document.getElementById('userProfile').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('userMenu').classList.toggle('show');
        });

        // Закрытие меню при клике вне
        document.addEventListener('click', () => {
            document.getElementById('userMenu').classList.remove('show');
        });
    }

    // СОЗДАЕМ ФУТЕР
    createFooter() {
        const footer = document.createElement('footer');
        footer.className = 'main-footer';
        footer.innerHTML = `
            <div class="footer-container">
                <div class="footer-grid">
                    <!-- КОЛОНКА 1: Навигация -->
                    <div class="footer-column">
                        <h4><i class="fas fa-map"></i> Навигация</h4>
                        ${SITE_CONFIG.nav.map(item => 
                            `<a href="${item.url}">${item.name}</a>`
                        ).join('')}
                    </div>
                    
                    <!-- КОЛОНКА 2: Соцсети -->
                    <div class="footer-column">
                        <h4><i class="fas fa-share-alt"></i> Соцсети</h4>
                        <a href="${SITE_CONFIG.social.discord}" target="_blank"><i class="fab fa-discord"></i> Discord</a>
                        <a href="${SITE_CONFIG.social.telegram}" target="_blank"><i class="fab fa-telegram"></i> Telegram</a>
                        <a href="${SITE_CONFIG.social.youtube}" target="_blank"><i class="fab fa-youtube"></i> YouTube</a>
                        <a href="${SITE_CONFIG.social.roblox}" target="_blank"><i class="fab fa-roblox"></i> Roblox</a>
                    </div>
                    
                    <!-- КОЛОНКА 3: Документы -->
                    <div class="footer-column">
                        <h4><i class="fas fa-file-contract"></i> Документы</h4>
                        <a href="${SITE_CONFIG.docs.privacy}" target="_blank">Политика конфиденциальности</a>
                        <a href="${SITE_CONFIG.docs.terms}" target="_blank">Пользовательское соглашение</a>
                        <a href="${SITE_CONFIG.docs.refund}" target="_blank">Политика возврата</a>
                    </div>
                    
                    <!-- КОЛОНКА 4: Контакты -->
                    <div class="footer-column">
                        <h4><i class="fas fa-headset"></i> Поддержка</h4>
                        <a href="${SITE_CONFIG.contacts.support}" target="_blank">Техническая поддержка</a>
                        <a href="mailto:${SITE_CONFIG.contacts.email}">${SITE_CONFIG.contacts.email}</a>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; ${new Date().getFullYear()} Метро New. Все права защищены.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(footer);
    }

    // СОЗДАЕМ МОДАЛЬНЫЕ ОКНА
    createModals() {
        const modals = document.createElement('div');
        modals.innerHTML = `
            <!-- МОДАЛКА АККАУНТА -->
            <div class="modal" id="accountModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-circle"></i> Мой аккаунт</h3>
                        <button class="modal-close" onclick="closeModal('accountModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="account-header">
                            <div class="account-avatar" id="modalAvatar">
                                <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="account-info">
                                <h4 id="modalName">Гость</h4>
                                <p id="modalEmail">Не авторизован</p>
                            </div>
                        </div>
                        <div class="account-stats">
                            <p>Статус: <span id="modalStatus">Гость</span></p>
                            <p>UID: <span id="modalUID">—</span></p>
                        </div>
                        <div class="auth-buttons">
                            <button class="btn btn-primary" onclick="openLogin()">Войти</button>
                            <button class="btn btn-outline" onclick="openRegister()">Регистрация</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- МОДАЛКА ВХОДА -->
            <div class="modal" id="loginModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-sign-in-alt"></i> Вход</h3>
                        <button class="modal-close" onclick="closeModal('loginModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="email" id="loginEmail" placeholder="Email" class="modal-input">
                        <input type="password" id="loginPassword" placeholder="Пароль" class="modal-input">
                        <button class="btn btn-primary" onclick="login()">Войти</button>
                        <p class="modal-link" onclick="openRegister()">Нет аккаунта? Регистрация</p>
                    </div>
                </div>
            </div>

            <!-- МОДАЛКА РЕГИСТРАЦИИ -->
            <div class="modal" id="registerModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-plus"></i> Регистрация</h3>
                        <button class="modal-close" onclick="closeModal('registerModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="text" id="registerName" placeholder="Имя" class="modal-input">
                        <input type="email" id="registerEmail" placeholder="Email" class="modal-input">
                        <input type="password" id="registerPassword" placeholder="Пароль" class="modal-input">
                        <button class="btn btn-primary" onclick="register()">Зарегистрироваться</button>
                        <p class="modal-link" onclick="openLogin()">Уже есть аккаунт? Войти</p>
                    </div>
                </div>
            </div>

            <!-- МОДАЛКА НАСТРОЕК -->
            <div class="modal" id="settingsModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-cog"></i> Настройки</h3>
                        <button class="modal-close" onclick="closeModal('settingsModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="setting-item">
                            <span>Тема:</span>
                            <select id="themeSelect">
                                <option value="light">Светлая</option>
                                <option value="dark">Тёмная</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <span>Язык:</span>
                            <select id="langSelect">
                                <option value="ru">Русский</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modals);
    }

    // ИНИЦИАЛИЗАЦИЯ АВТОРИЗАЦИИ
    initAuth() {
        // Проверяем, есть ли сохраненный пользователь
        const user = localStorage.getItem('metro_user');
        if (user) {
            this.setLoggedIn(JSON.parse(user));
        }
        
        // Загружаем настройки
        this.loadSettings();
    }

    setLoggedIn(user) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userStatus').textContent = user.email;
        document.getElementById('menuUserName').textContent = user.name;
        document.getElementById('menuUserEmail').textContent = user.email;
        document.getElementById('modalName').textContent = user.name;
        document.getElementById('modalEmail').textContent = user.email;
        document.getElementById('modalStatus').textContent = 'Пользователь';
        document.getElementById('modalUID').textContent = user.uid;
        
        document.querySelectorAll('.auth-buttons').forEach(el => el.style.display = 'none');
        document.getElementById('logoutBtn').style.display = 'flex';
    }

    setLoggedOut() {
        document.getElementById('userName').textContent = 'Гость';
        document.getElementById('userStatus').textContent = 'Войти';
        document.getElementById('menuUserName').textContent = 'Гость';
        document.getElementById('menuUserEmail').textContent = 'Не авторизован';
        document.getElementById('modalName').textContent = 'Гость';
        document.getElementById('modalEmail').textContent = 'Не авторизован';
        document.getElementById('modalStatus').textContent = 'Гость';
        document.getElementById('modalUID').textContent = '—';
        
        document.querySelectorAll('.auth-buttons').forEach(el => el.style.display = 'flex');
        document.getElementById('logoutBtn').style.display = 'none';
    }

    loadSettings() {
        const theme = localStorage.getItem('metro_theme') || 'light';
        const lang = localStorage.getItem('metro_lang') || 'ru';
        
        document.getElementById('themeSelect').value = theme;
        document.getElementById('langSelect').value = lang;
        
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
    }
}

// ===========================================
// 3. ГЛОБАЛЬНЫЕ ФУНКЦИИ (для кнопок)
// ===========================================
function openAccountModal() {
    document.getElementById('userMenu').classList.remove('show');
    document.getElementById('accountModal').classList.add('show');
}

function openSettings() {
    document.getElementById('userMenu').classList.remove('show');
    document.getElementById('settingsModal').classList.add('show');
}

function openLogin() {
    closeModal('accountModal');
    closeModal('registerModal');
    document.getElementById('loginModal').classList.add('show');
}

function openRegister() {
    closeModal('accountModal');
    closeModal('loginModal');
    document.getElementById('registerModal').classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password) {
        const user = {
            name: email.split('@')[0],
            email: email,
            uid: 'user_' + Date.now()
        };
        
        localStorage.setItem('metro_user', JSON.stringify(user));
        window.siteBuilder.setLoggedIn(user);
        closeModal('loginModal');
        alert('Добро пожаловать!');
    }
}

function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (name && email && password) {
        const user = {
            name: name,
            email: email,
            uid: 'user_' + Date.now()
        };
        
        localStorage.setItem('metro_user', JSON.stringify(user));
        window.siteBuilder.setLoggedIn(user);
        closeModal('registerModal');
        alert('Регистрация успешна!');
    }
}

function logout() {
    localStorage.removeItem('metro_user');
    window.siteBuilder.setLoggedOut();
    document.getElementById('userMenu').classList.remove('show');
}

// Следим за изменениями настроек
document.addEventListener('change', function(e) {
    if (e.target.id === 'themeSelect') {
        localStorage.setItem('metro_theme', e.target.value);
        document.body.className = e.target.value === 'dark' ? 'dark-theme' : '';
    }
    if (e.target.id === 'langSelect') {
        localStorage.setItem('metro_lang', e.target.value);
        alert('Язык изменен');
    }
});

// ===========================================
// 4. ЗАПУСК
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    window.siteBuilder = new SiteBuilder();
});
