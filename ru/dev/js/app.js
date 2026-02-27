// Единый файл app.js - объединяем все модули
(function() {
    // ========== STORE ==========
    class Store {
        constructor() {
            this.state = {
                user: null,
                settings: {
                    theme: localStorage.getItem('theme') || 'light',
                    language: localStorage.getItem('language') || 'ru',
                    emailNotifications: true,
                    projectNews: true
                },
                notifications: [],
                loading: false,
                modals: {
                    account: false, auth: false, avatar: false,
                    passwordReset: false, passwordChange: false, terms: false
                }
            };
            this.listeners = [];
            this.loginAttempts = new Map();
        }
        
        getState() { return this.state; }
        
        subscribe(listener) {
            this.listeners.push(listener);
            return () => { this.listeners = this.listeners.filter(l => l !== listener); };
        }
        
        setState(newState) {
            this.state = { ...this.state, ...newState };
            this.listeners.forEach(listener => listener(this.state));
        }
        
        setUser(user) { this.setState({ user }); }
        clearUser() { this.setState({ user: null }); }
        
        openModal(modalName) {
            this.setState({ modals: { ...this.state.modals, [modalName]: true } });
        }
        
        closeModal(modalName) {
            this.setState({ modals: { ...this.state.modals, [modalName]: false } });
        }
        
        checkRateLimit(email) {
            const now = Date.now();
            const attempts = this.loginAttempts.get(email) || [];
            const recentAttempts = attempts.filter(t => now - t < 60000);
            if (recentAttempts.length >= 5) {
                throw new Error('Слишком много попыток входа. Подождите минуту.');
            }
            return recentAttempts;
        }
        
        addLoginAttempt(email) {
            const attempts = this.loginAttempts.get(email) || [];
            attempts.push(Date.now());
            const recentAttempts = attempts.filter(t => Date.now() - t < 300000);
            this.loginAttempts.set(email, recentAttempts);
        }
        
        updateSettings(settings) {
            const newSettings = { ...this.state.settings, ...settings };
            this.setState({ settings: newSettings });
            if (settings.theme) localStorage.setItem('theme', settings.theme);
            if (settings.language) localStorage.setItem('language', settings.language);
        }
        
        getUnreadCount() {
            return this.state.notifications.filter(n => !n.read).length;
        }
    }
    
    const store = new Store();
    
    // ========== FIREBASE ==========
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
    import { 
        getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signOut as firebaseSignOut,
        sendPasswordResetEmail, signInAnonymously, signInWithPopup, onAuthStateChanged,
        updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider
    } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
    import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
    import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
    
    const firebaseConfig = {
        apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
        authDomain: "metro-new-85226.firebaseapp.com",
        databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
        projectId: "metro-new-85226",
        storageBucket: "metro-new-85226.firebasestorage.app",
        messagingSenderId: "905640751733",
        appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
    };
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    
    // ========== UI UTILS ==========
    const $ = {
        id: (id) => document.getElementById(id),
        q: (selector) => document.querySelector(selector),
        qa: (selector) => document.querySelectorAll(selector),
        create: (tag, classes = []) => {
            const el = document.createElement(tag);
            if (classes.length) el.classList.add(...classes);
            return el;
        }
    };
    
    function debounce(func, wait) {
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
    
    function showToast(message, type = 'info', duration = 3000) {
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
        
        toast.innerHTML = `<i class="${icon}" aria-hidden="true"></i><span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    function showModal(modalId) {
        const modal = $.id(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            store.openModal(modalId.replace('Modal', '').toLowerCase());
        }
    }
    
    function hideModal(modalId) {
        const modal = $.id(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            store.closeModal(modalId.replace('Modal', '').toLowerCase());
        }
    }
    
    function initModals() {
        $.qa('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                hideModal(modal.id);
            });
        });
        
        $.qa('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) hideModal(modal.id);
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                $.qa('.modal.show').forEach(modal => hideModal(modal.id));
            }
        });
    }
    
    function updateUI(state) {
        const { user, settings } = state;
        
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        updateHeader(user);
        updateAccountModal(user);
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
    
    // ========== AUTH FUNCTIONS ==========
    async function signInWithEmail(email, password, rememberMe = true) {
        const loginBtn = $.id('loginSubmitBtn');
        const loginError = $.id('loginError');
        
        try {
            if (!email || !password) throw new Error('Заполните все поля');
            if (!validateEmail(email)) throw new Error('Неверный формат email');
            
            store.checkRateLimit(email);
            
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
            loginError.style.display = 'none';
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            store.addLoginAttempt(email);
            showToast('Вход выполнен успешно!', 'success');
            hideModal('authModal');
            
            $.id('loginEmail').value = '';
            $.id('loginPassword').value = '';
            
        } catch (error) {
            console.error('Ошибка входа:', error);
            store.addLoginAttempt(email);
            
            let errorMessage = 'Ошибка входа. ';
            switch (error.code) {
                case 'auth/invalid-email': errorMessage += 'Неверный формат email.'; break;
                case 'auth/user-disabled': errorMessage += 'Аккаунт заблокирован.'; break;
                case 'auth/user-not-found': case 'auth/invalid-login-credentials': errorMessage += 'Неверный email или пароль.'; break;
                case 'auth/wrong-password': errorMessage += 'Неверный пароль.'; break;
                case 'auth/too-many-requests': errorMessage += 'Слишком много попыток. Попробуйте позже.'; break;
                case 'auth/network-request-failed': errorMessage += 'Ошибка сети. Проверьте подключение.'; break;
                default: errorMessage += error.message;
            }
            
            loginError.textContent = errorMessage;
            loginError.style.display = 'block';
            
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
        }
    }
    
    async function signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const isNewUser = result._tokenResponse?.isNewUser;
            
            if (isNewUser) {
                await setDoc(doc(db, 'users', result.user.uid), {
                    username: result.user.displayName,
                    email: result.user.email,
                    createdAt: new Date().toISOString(),
                    emailVerified: result.user.emailVerified,
                    settings: store.state.settings
                });
                showToast('Аккаунт создан через Google!', 'success');
            } else {
                showToast(`Добро пожаловать, ${result.user.displayName}!`, 'success');
            }
            
            hideModal('authModal');
            
        } catch (error) {
            console.error('Ошибка входа через Google:', error);
            let errorMessage = 'Ошибка входа через Google. ';
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Вход отменен';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Всплывающее окно заблокировано. Разрешите всплывающие окна.';
            } else {
                errorMessage += error.message;
            }
            showToast(errorMessage, 'error');
        }
    }
    
    async function signInAsGuest() {
        try {
            await signInAnonymously(auth);
            showToast('Вход в гостевом режиме', 'info');
            hideModal('authModal');
        } catch (error) {
            console.error('Ошибка гостевого входа:', error);
            showToast('Ошибка гостевого входа', 'error');
        }
    }
    
    async function signOut() {
        try {
            await firebaseSignOut(auth);
            showToast('Вы вышли из аккаунта', 'info');
            store.clearUser();
        } catch (error) {
            console.error('Ошибка выхода:', error);
            showToast('Ошибка выхода', 'error');
        }
    }
    
    async function sendPasswordReset(email) {
        const resetBtn = $.id('sendResetBtn');
        const resetMessage = $.id('resetMessage');
        
        try {
            if (!email || !validateEmail(email)) throw new Error('Введите корректный email');
            
            resetBtn.disabled = true;
            resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            resetMessage.style.display = 'none';
            
            await sendPasswordResetEmail(auth, email);
            
            resetMessage.textContent = `Ссылка отправлена на ${email}`;
            resetMessage.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
            resetMessage.style.color = 'var(--success)';
            resetMessage.style.display = 'block';
            
            setTimeout(() => {
                hideModal('passwordResetModal');
                $.id('resetEmail').value = '';
            }, 3000);
            
        } catch (error) {
            console.error('Ошибка восстановления:', error);
            let errorMessage = 'Ошибка. ';
            if (error.code === 'auth/user-not-found') {
                errorMessage += 'Пользователь не найден';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage += 'Слишком много запросов';
            } else {
                errorMessage += error.message;
            }
            
            resetMessage.textContent = errorMessage;
            resetMessage.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
            resetMessage.style.color = 'var(--danger)';
            resetMessage.style.display = 'block';
            
        } finally {
            resetBtn.disabled = false;
            resetBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить ссылку';
        }
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // ========== PROFILE FUNCTIONS ==========
    function initAvatarUpload() {
        const user = auth.currentUser;
        if (!user || user.isAnonymous) {
            showToast('Недоступно для гостевого режима', 'warning');
            return;
        }
        
        $.id('avatarPreviewImg').style.display = 'none';
        $.id('avatarPreviewIcon').style.display = 'block';
        $.id('removeAvatarBtn').style.display = user.photoURL ? 'inline-flex' : 'none';
        $.id('uploadAvatarBtn').disabled = true;
        $.id('avatarMessage').style.display = 'none';
        
        if (user.photoURL) {
            $.id('avatarPreviewImg').src = user.photoURL;
            $.id('avatarPreviewImg').style.display = 'block';
            $.id('avatarPreviewIcon').style.display = 'none';
        }
    }
    
    function previewAvatar(file) {
        if (!file) return;
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 2 * 1024 * 1024;
        
        if (!validTypes.includes(file.type)) {
            showToast('Только JPG, PNG, GIF или WebP', 'error');
            return;
        }
        
        if (file.size > maxSize) {
            showToast('Максимальный размер: 2MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            $.id('avatarPreviewImg').src = e.target.result;
            $.id('avatarPreviewImg').style.display = 'block';
            $.id('avatarPreviewIcon').style.display = 'none';
            $.id('uploadAvatarBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    async function uploadAvatar() {
        const file = $.id('avatarFileInput').files[0];
        const user = auth.currentUser;
        
        if (!file || !user || user.isAnonymous) return;
        
        const uploadBtn = $.id('uploadAvatarBtn');
        
        try {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
            
            const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            await updateProfile(user, { photoURL: downloadURL });
            await setDoc(doc(db, 'users', user.uid), { avatarUrl: downloadURL }, { merge: true });
            
            showToast('Аватар обновлён!', 'success');
            
            setTimeout(() => {
                hideModal('avatarModal');
                store.setUser(auth.currentUser);
            }, 1500);
            
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            showToast('Ошибка загрузки аватара', 'error');
            
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Загрузить аватар';
        }
    }
    
    async function removeAvatar() {
        const user = auth.currentUser;
        if (!user || user.isAnonymous) return;
        
        try {
            if (user.photoURL && user.photoURL.includes('firebasestorage')) {
                try {
                    const photoRef = ref(storage, user.photoURL);
                    await deleteObject(photoRef);
                } catch (storageError) {
                    console.warn('Не удалось удалить из Storage:', storageError);
                }
            }
            
            await updateProfile(user, { photoURL: null });
            await setDoc(doc(db, 'users', user.uid), { avatarUrl: null }, { merge: true });
            
            showToast('Аватар удалён', 'info');
            hideModal('avatarModal');
            store.setUser(auth.currentUser);
            
        } catch (error) {
            console.error('Ошибка удаления:', error);
            showToast('Ошибка удаления аватара', 'error');
        }
    }
    
    // ========== INITIALIZATION ==========
    function initEventHandlers() {
        const userDropdown = $.id('userDropdown');
        userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            userDropdown.classList.remove('show');
        });
        
        $.id('aboutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Информация о проекте скоро будет доступна', 'info');
        });
        
        $.id('userAvatar')?.addEventListener('click', () => {
            showModal('accountModal');
        });
        
        $.id('loginBtn')?.addEventListener('click', () => {
            hideModal('accountModal');
            showModal('authModal');
        });
        
        $.id('guestLoginBtn')?.addEventListener('click', () => {
            hideModal('accountModal');
            signInAsGuest();
        });
        
        $.id('anonymousLoginBtn')?.addEventListener('click', signInAsGuest);
        $.id('googleLoginBtn')?.addEventListener('click', signInWithGoogle);
        
        $.id('loginForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = $.id('loginEmail').value;
            const password = $.id('loginPassword').value;
            const rememberMe = $.id('rememberMe').checked;
            await signInWithEmail(email, password, rememberMe);
        });
        
        $.id('forgotPasswordBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('authModal');
            showModal('passwordResetModal');
        });
        
        $.id('sendResetBtn')?.addEventListener('click', async () => {
            const email = $.id('resetEmail').value;
            await sendPasswordReset(email);
        });
        
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
        
        $.id('logoutBtn')?.addEventListener('click', signOut);
        
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
        
        $.qa('.lang-option').forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.dataset.lang;
                store.updateSettings({ language: lang });
                
                $.qa('.lang-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.lang === lang);
                });
                
                showToast(`Язык изменён на ${lang === 'ru' ? 'Русский' : lang === 'en' ? 'English' : 'Español'}`, 'info');
            });
        });
        
        $.id('emailNotifications')?.addEventListener('change', (e) => {
            store.updateSettings({ emailNotifications: e.target.checked });
        });
        
        $.id('projectNews')?.addEventListener('change', (e) => {
            store.updateSettings({ projectNews: e.target.checked });
        });
        
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
    }
    
    function initSettings() {
        const { theme, language, emailNotifications, projectNews } = store.state.settings;
        
        $.qa('.theme-option').forEach(opt => {
            const isActive = opt.dataset.theme === theme;
            opt.classList.toggle('active', isActive);
            opt.setAttribute('aria-pressed', isActive);
        });
        
        $.qa('.lang-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.lang === language);
        });
        
        if ($.id('emailNotifications')) $.id('emailNotifications').checked = emailNotifications;
        if ($.id('projectNews')) $.id('projectNews').checked = projectNews;
    }
    
    function initAuthListener() {
        onAuthStateChanged(auth, async (user) => {
            store.setUser(user);
            
            if (user) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().settings) {
                        store.updateSettings(docSnap.data().settings);
                    }
                } catch (error) {
                    console.error('Ошибка загрузки данных:', error);
                }
                
                if (!user.isAnonymous) {
                    showToast(`Добро пожаловать${user.displayName ? ', ' + user.displayName : ''}!`, 'success');
                }
            }
        });
    }
    
    // Главная функция инициализации
    window.initializeApp = function() {
        console.log('Инициализация приложения...');
        
        $.id('currentYear').textContent = new Date().getFullYear();
        $.id('currentDate').textContent = new Date().toLocaleDateString('ru-RU');
        
        initModals();
        initAuthListener();
        initEventHandlers();
        initSettings();
        
        store.subscribe(updateUI);
        
        console.log('Приложение готово');
    };
    
    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();
