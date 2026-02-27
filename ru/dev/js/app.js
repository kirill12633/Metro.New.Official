// Главный файл приложения
import { store } from './store.js';
import { initAuthListener, signInWithEmail, signInWithGoogle, signInAsGuest, signOut, sendPasswordReset } from './auth.js';
import { initAvatarUpload, previewAvatar, uploadAvatar, removeAvatar } from './profile.js';
import { initModals, showModal, hideModal, updateUI, showToast, $, debounce } from './ui.js';

// Инициализация приложения
export function initializeApp() {
    console.log('Инициализация приложения...');
    
    // Установка текущего года
    $.id('currentYear').textContent = new Date().getFullYear();
    $.id('currentDate').textContent = new Date().toLocaleDateString('ru-RU');
    
    // Инициализация компонентов
    initModals();
    initAuthListener();
    initEventHandlers();
    initSettings();
    
    // Подписка на изменения состояния
    store.subscribe(updateUI);
    
    console.log('Приложение готово');
}

// Инициализация обработчиков событий
function initEventHandlers() {
    // Выпадающее меню
    const userDropdown = $.id('userDropdown');
    userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', () => {
        userDropdown.classList.remove('show');
    });
    
    // Кнопки в хедере
    $.id('aboutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Информация о проекте скоро будет доступна', 'info');
    });
    
    // Открытие модалки аккаунта
    $.id('userAvatar')?.addEventListener('click', () => {
        showModal('accountModal');
    });
    
    // Кнопки в модалке аккаунта
    $.id('loginBtn')?.addEventListener('click', () => {
        hideModal('accountModal');
        showModal('authModal');
    });
    
    $.id('guestLoginBtn')?.addEventListener('click', () => {
        hideModal('accountModal');
        signInAsGuest();
    });
    
    // Кнопки авторизации
    $.id('anonymousLoginBtn')?.addEventListener('click', signInAsGuest);
    $.id('googleLoginBtn')?.addEventListener('click', signInWithGoogle);
    
    // Форма входа
    $.id('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = $.id('loginEmail').value;
        const password = $.id('loginPassword').value;
        const rememberMe = $.id('rememberMe').checked;
        await signInWithEmail(email, password, rememberMe);
    });
    
    // Восстановление пароля
    $.id('forgotPasswordBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('authModal');
        showModal('passwordResetModal');
    });
    
    $.id('sendResetBtn')?.addEventListener('click', async () => {
        const email = $.id('resetEmail').value;
        await sendPasswordReset(email);
    });
    
    // Управление профилем
    $.id('changeAvatarBtn')?.addEventListener('click', () => {
        showModal('avatarModal');
        initAvatarUpload();
    });
    
    $.id('chooseAvatarBtn')?.addEventListener('click', () => {
        $.id('avatarFileInput').click();
    });
    
    $.id('avatarFileInput')?.addEventListener('change', (e) => {
        previewAvatar(e.target.files[0]);
    });
    
    $.id('uploadAvatarBtn')?.addEventListener('click', uploadAvatar);
    $.id('removeAvatarBtn')?.addEventListener('click', removeAvatar);
    
    // Смена пароля
    $.id('changePasswordBtn')?.addEventListener('click', () => {
        showModal('passwordChangeModal');
    });
    
    $.id('submitPasswordChangeBtn')?.addEventListener('click', async () => {
        await changePassword();
    });
    
    // Выход
    $.id('logoutBtn')?.addEventListener('click', signOut);
    
    // Настройки темы
    $.qa('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            store.updateSettings({ theme });
            
            $.qa('.theme-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.theme === theme);
                opt.setAttribute('aria-pressed', opt.dataset.theme === theme);
            });
        });
    });
    
    // Настройки языка
    $.qa('.lang-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            store.updateSettings({ language: lang });
            
            $.qa('.lang-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.lang === lang);
            });
            
            showToast(`Язык изменён на ${getLanguageName(lang)}`, 'info');
        });
    });
    
    // Настройки уведомлений
    $.id('emailNotifications')?.addEventListener('change', (e) => {
        store.updateSettings({ emailNotifications: e.target.checked });
    });
    
    $.id('projectNews')?.addEventListener('change', (e) => {
        store.updateSettings({ projectNews: e.target.checked });
    });
    
    // Ссылки в футере
    $.id('privacyPolicyBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Политика конфиденциальности скоро будет доступна', 'info');
    });
    
    $.id('termsOfServiceBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showModal('termsModal');
    });
    
    $.id('rulesBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Правила сообщества скоро будут доступны', 'info');
    });
    
    $.id('refundPolicyBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Политика возврата скоро будет доступна', 'info');
    });
    
    $.id('acceptTermsBtn')?.addEventListener('click', () => {
        hideModal('termsModal');
        showToast('Условия соглашения приняты', 'success');
    });
    
    // Поиск с debounce
    const searchInput = $.id('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            console.log('Поиск:', e.target.value);
            // Здесь будет логика поиска
        }, 500));
    }
}

// Инициализация настроек
function initSettings() {
    const { theme, language, emailNotifications, projectNews } = store.state.settings;
    
    // Тема
    $.qa('.theme-option').forEach(opt => {
        const isActive = opt.dataset.theme === theme;
        opt.classList.toggle('active', isActive);
        opt.setAttribute('aria-pressed', isActive);
    });
    
    // Язык
    $.qa('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === language);
    });
    
    // Чекбоксы
    if ($.id('emailNotifications')) $.id('emailNotifications').checked = emailNotifications;
    if ($.id('projectNews')) $.id('projectNews').checked = projectNews;
}

// Вспомогательные функции
function getLanguageName(lang) {
    const names = {
        ru: 'Русский',
        en: 'English',
        es: 'Español'
    };
    return names[lang] || lang;
}

// Экспорт для отладки
window.app = {
    store,
    showToast,
    showModal,
    hideModal,
    signOut
};
