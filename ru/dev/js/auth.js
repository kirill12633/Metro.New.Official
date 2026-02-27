// Функции аутентификации
import { auth, db, googleProvider } from './firebase.js';
import { store } from './store.js';
import { showToast, showModal, hideModal, $ } from './ui.js';
import { 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    signInAnonymously,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Инициализация слушателя аутентификации
export function initAuthListener() {
    onAuthStateChanged(auth, async (user) => {
        store.setUser(user);
        
        if (user) {
            await loadUserData(user.uid);
            showToast(`Добро пожаловать${user.displayName ? ', ' + user.displayName : ''}!`, 'success');
        }
    });
}

// Вход по email
export async function signInWithEmail(email, password, rememberMe = true) {
    const loginBtn = $.id('loginSubmitBtn');
    const loginError = $.id('loginError');
    
    try {
        // Валидация
        if (!email || !password) {
            throw new Error('Заполните все поля');
        }
        
        if (!validateEmail(email)) {
            throw new Error('Неверный формат email');
        }
        
        // Rate limiting
        const recentAttempts = store.checkRateLimit(email);
        
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        loginError.style.display = 'none';
        
        // Устанавливаем persistence
        const persistence = rememberMe ? 'local' : 'session';
        // В Firebase persistence настраивается отдельно
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        store.addLoginAttempt(email); // очищаем попытки после успешного входа
        
        showToast('Вход выполнен успешно!', 'success');
        hideModal('authModal');
        
        // Очищаем форму
        $.id('loginEmail').value = '';
        $.id('loginPassword').value = '';
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        
        store.addLoginAttempt(email);
        
        let errorMessage = 'Ошибка входа. ';
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage += 'Неверный формат email.';
                break;
            case 'auth/user-disabled':
                errorMessage += 'Аккаунт заблокирован.';
                break;
            case 'auth/user-not-found':
            case 'auth/invalid-login-credentials':
                errorMessage += 'Неверный email или пароль.';
                break;
            case 'auth/wrong-password':
                errorMessage += 'Неверный пароль.';
                break;
            case 'auth/too-many-requests':
                errorMessage += 'Слишком много попыток. Попробуйте позже.';
                break;
            case 'auth/network-request-failed':
                errorMessage += 'Ошибка сети. Проверьте подключение.';
                break;
            default:
                errorMessage += error.message;
        }
        
        loginError.textContent = errorMessage;
        loginError.style.display = 'block';
        
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
    }
}

// Вход через Google
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const isNewUser = result._tokenResponse?.isNewUser;
        
        if (isNewUser) {
            await saveUserData(result.user.uid, {
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
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'Вход отменен';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Всплывающее окно заблокировано. Разрешите всплывающие окна.';
                break;
            default:
                errorMessage += error.message;
        }
        
        showToast(errorMessage, 'error');
    }
}

// Гостевой вход
export async function signInAsGuest() {
    try {
        const result = await signInAnonymously(auth);
        showToast('Вход в гостевом режиме', 'info');
        hideModal('authModal');
    } catch (error) {
        console.error('Ошибка гостевого входа:', error);
        showToast('Ошибка гостевого входа', 'error');
    }
}

// Выход
export async function signOut() {
    try {
        await firebaseSignOut(auth);
        showToast('Вы вышли из аккаунта', 'info');
        store.clearUser();
    } catch (error) {
        console.error('Ошибка выхода:', error);
        showToast('Ошибка выхода', 'error');
    }
}

// Восстановление пароля
export async function sendPasswordReset(email) {
    const resetBtn = $.id('sendResetBtn');
    const resetMessage = $.id('resetMessage');
    
    try {
        if (!email || !validateEmail(email)) {
            throw new Error('Введите корректный email');
        }
        
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
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage += 'Пользователь не найден';
                break;
            case 'auth/too-many-requests':
                errorMessage += 'Слишком много запросов';
                break;
            default:
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

// Вспомогательные функции
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function saveUserData(uid, data) {
    try {
        await setDoc(doc(db, 'users', uid), data, { merge: true });
        return true;
    } catch (error) {
        console.error('Ошибка сохранения данных:', error);
        return false;
    }
}

async function loadUserData(uid) {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.settings) {
                store.updateSettings(data.settings);
            }
            return data;
        }
        return null;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        return null;
    }
}
