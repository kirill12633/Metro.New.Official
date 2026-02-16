// ============================================
// ОСНОВНОЙ КОД АВТОРИЗАЦИИ
// ============================================

import { auth, db, googleProvider } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { 
    doc, setDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Глобальные переменные
let currentForm = 'register';
let currentStep = 1;
let resendTimer = 60;
let resendInterval = null;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Система авторизации запущена');
    
    fillDateSelectors();
    initEventHandlers();
    updateCopyrightYear();
});

// ========== ЗАПОЛНЕНИЕ ДАТ ==========
function fillDateSelectors() {
    const daySelect = document.getElementById('birthDay');
    const yearSelect = document.getElementById('birthYear');
    const currentYear = new Date().getFullYear();
    
    // Дни
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Годы
    for (let i = currentYear; i >= currentYear - 100; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

// ========== ОБНОВЛЕНИЕ КОПИРАЙТА ==========
function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    document.getElementById('copyrightYear').textContent = 
        `© ${currentYear} Метро New. Все права защищены.`;
}

// ========== ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ ==========
function initEventHandlers() {
    // Переключение форм
    document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('login');
    });
    
    document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        resetRegistration();
        showForm('register');
    });
    
    document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('reset');
    });
    
    document.getElementById('cancelResetBtn')?.addEventListener('click', () => {
        showForm('login');
    });
    
    document.getElementById('backToLoginFromResetBtn')?.addEventListener('click', () => {
        showForm('login');
    });
    
    document.getElementById('goToLoginBtn')?.addEventListener('click', () => {
        showForm('login');
    });
    
    document.getElementById('backFromAgeRestriction')?.addEventListener('click', (e) => {
        e.preventDefault();
        resetRegistration();
        showForm('register');
    });
    
    document.getElementById('goToParentPageBtn')?.addEventListener('click', () => {
        window.open('https://kirill12633.github.io/Metro.New.Official/ru/parents', '_blank');
    });
    
    document.getElementById('cancelRegistration')?.addEventListener('click', () => {
        resetRegistration();
        document.getElementById('registerDivider').style.display = 'block';
        document.getElementById('googleRegisterBtn').style.display = 'block';
        document.getElementById('registerLinks').style.display = 'block';
    });
    
    // Показать/скрыть пароль
    document.getElementById('togglePassword')?.addEventListener('click', togglePasswordVisibility);
    document.getElementById('toggleConfirmPassword')?.addEventListener('click', toggleConfirmPasswordVisibility);
    document.getElementById('toggleLoginPassword')?.addEventListener('click', toggleLoginPasswordVisibility);
    
    // Навигация по шагам
    document.getElementById('nextStep1')?.addEventListener('click', goToStep2);
    document.getElementById('prevStep2')?.addEventListener('click', goToStep1);
    document.getElementById('nextStep2')?.addEventListener('click', goToStep3);
    document.getElementById('prevStep3')?.addEventListener('click', goToStep2);
    document.getElementById('submitRegistration')?.addEventListener('click', submitRegistration);
    
    // Формы
    document.getElementById('loginFormElement')?.addEventListener('submit', (e) => {
        e.preventDefault();
        loginUser();
    });
    
    document.getElementById('resetPasswordFormElement')?.addEventListener('submit', (e) => {
        e.preventDefault();
        resetPassword();
    });
    
    // Google
    document.getElementById('googleRegisterBtn')?.addEventListener('click', googleAuth);
    document.getElementById('googleLoginBtn')?.addEventListener('click', googleAuth);
    
    // Повторная отправка
    document.getElementById('resendEmailBtn')?.addEventListener('click', resendVerificationEmail);
    
    // Валидация в реальном времени
    document.getElementById('firstName')?.addEventListener('input', validateName);
    document.getElementById('username')?.addEventListener('input', function() {
        validateUsername(this.value);
    });
    document.getElementById('email')?.addEventListener('input', validateEmail);
    document.getElementById('password')?.addEventListener('input', validatePassword);
    document.getElementById('confirmPassword')?.addEventListener('input', validatePasswordMatch);
    document.getElementById('birthDay')?.addEventListener('change', validateAge);
    document.getElementById('birthMonth')?.addEventListener('change', validateAge);
    document.getElementById('birthYear')?.addEventListener('change', validateAge);
    
    // Политика
    document.querySelector('.terms-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showPolicyModal('Пользовательское соглашение', 
            'https://docs.google.com/document/d/e/2PACX-1vQ86klpumdzVv8phucQPYhv-ZSqS75ZpQB0t8NdSmPu7zo0EY3tesGqFgiPscv5cp-5ouw8oRHeyFwG/pub?embedded=true');
    });
    
    document.querySelector('.privacy-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        showPolicyModal('Политика конфиденциальности',
            'https://docs.google.com/document/d/e/2PACX-1vRvligepysBxTXy4KcWzNquDcvaKLr9E4rO6_KuKUr0ELwDlq8qafWuiGY7aM4wDmZ24XNmBahgoh8t/pub?embedded=true');
    });
    
    // Модалка
    document.getElementById('closePolicyModal')?.addEventListener('click', closePolicyModal);
    document.getElementById('closePolicyModalBtn')?.addEventListener('click', closePolicyModal);
    document.getElementById('acceptPolicyBtn')?.addEventListener('click', acceptPolicy);
    document.querySelector('.modal-overlay')?.addEventListener('click', closePolicyModal);
    
    // ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePolicyModal();
    });
}

// ========== НАВИГАЦИЯ ПО ШАГАМ ==========
function goToStep1() {
    currentStep = 1;
    showStep(1);
    updateProgressBar();
}

function goToStep2() {
    if (validateStep1()) {
        const birthDay = document.getElementById('birthDay').value;
        const birthMonth = document.getElementById('birthMonth').value;
        const birthYear = document.getElementById('birthYear').value;
        
        // Проверка возраста
        const ageCheck = AgeValidator.check(birthDay, birthMonth, birthYear);
        
        if (!ageCheck.isValid) {
            Notifications.warning(ageCheck.message);
            return;
        }
        
        if (ageCheck.age < 13) {
            // Показываем понятное сообщение
            const yearsUntil = 13 - ageCheck.age;
            document.getElementById('ageRestrictionMessage').innerHTML = 
                `Тебе ${ageCheck.age} ${AgeValidator.getYearWord(ageCheck.age)}. 
                 Регистрация доступна с 13 лет.<br>
                 <strong>Вернись через ${yearsUntil} ${AgeValidator.getYearWord(yearsUntil)}</strong> 😊`;
            showForm('ageRestrictionScreen');
            return;
        }
        
        currentStep = 2;
        showStep(2);
        updateProgressBar();
    }
}

function goToStep3() {
    if (validateStep2()) {
        currentStep = 3;
        showStep(3);
        updateProgressBar();
        updateDataSummary();
    }
}

function showStep(stepNumber) {
    document.querySelectorAll('.registration-step').forEach(step => {
        step.classList.remove('active');
    });
    
    document.getElementById(`step${stepNumber}`).classList.add('active');
    
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
        const stepNum = parseInt(step.dataset.step);
        
        if (stepNum === stepNumber) {
            step.classList.add('active');
        } else if (stepNum < stepNumber) {
            step.classList.add('completed');
        }
    });
    
    const showExtra = stepNumber === 1;
    document.getElementById('registerDivider').style.display = showExtra ? 'block' : 'none';
    document.getElementById('googleRegisterBtn').style.display = showExtra ? 'block' : 'none';
    document.getElementById('registerLinks').style.display = showExtra ? 'block' : 'none';
}

function updateProgressBar() {
    const percentage = (currentStep / 3) * 100;
    document.getElementById('progressFill').style.width = `${percentage}%`;
}

// ========== ВАЛИДАЦИЯ ШАГОВ ==========
function validateStep1() {
    const firstName = document.getElementById('firstName').value.trim();
    const username = document.getElementById('username').value.trim();
    const birthDay = document.getElementById('birthDay').value;
    const birthMonth = document.getElementById('birthMonth').value;
    const birthYear = document.getElementById('birthYear').value;
    
    let isValid = true;
    
    // Имя
    if (!firstName) {
        showFieldError('firstName', 'Введите имя');
        isValid = false;
    } else if (firstName.length < 2) {
        showFieldError('firstName', 'Минимум 2 символа');
        isValid = false;
    } else {
        clearFieldError('firstName');
    }
    
    // Никнейм
    if (!username) {
        showFieldError('username', 'Введите никнейм');
        isValid = false;
    } else {
        // Проверка на маты
        const profanityCheck = ProfanityFilter.check(username);
        if (profanityCheck.hasProfanity) {
            showFieldError('username', 'Никнейм содержит неприемлемые слова');
            Notifications.warning(`Обнаружены запрещенные слова: ${profanityCheck.foundWords.join(', ')}`);
            isValid = false;
        } else if (username.length < 3) {
            showFieldError('username', 'Минимум 3 символа');
            isValid = false;
        } else if (username.length > 20) {
            showFieldError('username', 'Максимум 20 символов');
            isValid = false;
        } else {
            clearFieldError('username');
        }
    }
    
    // Дата рождения
    if (!birthDay || !birthMonth || !birthYear) {
        showFieldError('birthDay', 'Выберите дату');
        isValid = false;
    } else {
        clearFieldError('birthDay');
    }
    
    return isValid;
}

function validateStep2() {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    let isValid = true;
    
    // Email
    if (!email) {
        showFieldError('email', 'Введите email');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('email', 'Некорректный email');
        isValid = false;
    } else {
        // Проверка черного списка
        const emailCheck = EmailBlacklist.check(email);
        if (!emailCheck.isValid) {
            showFieldError('email', emailCheck.reason);
            Notifications.warning(emailCheck.reason);
            isValid = false;
        } else {
            clearFieldError('email');
        }
    }
    
    // Пароль
    if (!password) {
        showFieldError('password', 'Введите пароль');
        isValid = false;
    } else if (password.length < 8) {
        showFieldError('password', 'Минимум 8 символов');
        isValid = false;
    } else {
        const requirements = checkPasswordRequirements(password);
        if (!requirements.allMet) {
            showFieldError('password', 'Пароль не соответствует требованиям');
            isValid = false;
        } else {
            clearFieldError('password');
        }
    }
    
    // Подтверждение
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Подтвердите пароль');
        isValid = false;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Пароли не совпадают');
        isValid = false;
    } else {
        clearFieldError('confirmPassword');
    }
    
    return isValid;
}

function updateDataSummary() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName')?.value.trim() || '';
    const username = document.getElementById('username').value.trim();
    const birthDay = document.getElementById('birthDay').value;
    const birthMonth = document.getElementById('birthMonth').value;
    const birthYear = document.getElementById('birthYear').value;
    const email = document.getElementById('email').value.trim().toLowerCase();
    
    const age = AgeValidator.calculateAge(birthDay, birthMonth, birthYear);
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    let summary = `
        <div>👤 <strong>${firstName} ${lastName}</strong> (@${username})</div>
        <div>📅 ${birthDay} ${months[birthMonth-1]} ${birthYear} (${age} лет)</div>
        <div>📧 ${email}</div>
    `;
    
    document.getElementById('userDataSummary').innerHTML = summary;
}

// ========== ПОКАЗАТЬ ФОРМУ ==========
function showForm(formName) {
    currentForm = formName;
    
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
    });
    
    const formElement = document.getElementById(formName + 'Form') || 
                       document.getElementById(formName);
    if (formElement) {
        formElement.classList.add('active');
    }
    
    updateFormTitles(formName);
    clearErrors();
}

function updateFormTitles(formName) {
    const titles = {
        'register': { title: 'Создать аккаунт', subtitle: 'Для входа в Метро New' },
        'login': { title: 'Войти в аккаунт', subtitle: 'Добро пожаловать обратно' },
        'reset': { title: 'Сброс пароля', subtitle: 'Восстановление доступа' },
        'loadingScreen': { title: 'Загрузка...', subtitle: 'Пожалуйста, подождите' },
        'success': { title: 'Аккаунт создан', subtitle: 'Регистрация завершена' },
        'ageRestrictionScreen': { title: 'Ограничение', subtitle: 'Для вашей безопасности' }
    };
    
    const titleData = titles[formName] || titles.register;
    document.getElementById('formTitle').textContent = titleData.title;
    document.getElementById('formSubtitle').textContent = titleData.subtitle;
}

// ========== РЕГИСТРАЦИЯ ==========
async function submitRegistration(e) {
    e.preventDefault();
    
    if (!document.getElementById('agreeTerms').checked) {
        Notifications.warning('Необходимо принять пользовательское соглашение');
        return;
    }
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName')?.value.trim() || '';
    const username = document.getElementById('username').value.trim();
    const birthDay = document.getElementById('birthDay').value;
    const birthMonth = document.getElementById('birthMonth').value;
    const birthYear = document.getElementById('birthYear').value;
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    
    const age = AgeValidator.calculateAge(birthDay, birthMonth, birthYear);
    
    // Показываем загрузку
    const loader = Notifications.loading('Создание аккаунта...');
    
    try {
        // 1. Создать пользователя
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. Обновить профиль
        await updateProfile(userCredential.user, {
            displayName: firstName + (lastName ? ' ' + lastName : '')
        });
        
        // 3. Отправить подтверждение email
        await sendEmailVerification(userCredential.user);
        
        // 4. Получить IP (можно через сервис)
        const ip = '0.0.0.0'; // Заглушка, лучше получать реальный
        
        // 5. Сохранить в Firestore
        const formData = {
            firstName, lastName, username,
            birthDay, birthMonth, birthYear,
            age
        };
        
        await FirebaseStructure.createUserInFirestore(db, userCredential.user.uid, formData, email, ip);
        
        // 6. Успех
        loader.remove();
        
        Notifications.registrationResult(true, '✅ Аккаунт создан! Проверьте почту для подтверждения');
        
        setTimeout(() => {
            showForm('success');
            document.getElementById('successMessage').textContent = 
                `На адрес ${email} отправлено письмо для подтверждения.`;
            startResendTimer();
        }, 1000);
        
    } catch (error) {
        loader.remove();
        console.error('Ошибка:', error);
        
        let message = 'Ошибка регистрации';
        if (error.code === 'auth/email-already-in-use') {
            message = 'Этот email уже используется';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Неверный формат email';
        } else if (error.code === 'auth/weak-password') {
            message = 'Слишком слабый пароль';
        } else {
            message = error.message;
        }
        
        Notifications.registrationResult(false, message);
    }
}

// ========== ВХОД ==========
async function loginUser() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        Notifications.warning('Заполните все поля');
        return;
    }
    
    const loader = Notifications.loading('Вход...');
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        loader.remove();
        Notifications.success('Вход выполнен! Перенаправление...');
        
        setTimeout(() => {
            window.location.href = 'https://kirill12633.github.io/Metro.New.Official/ru/';
        }, 1500);
        
    } catch (error) {
        loader.remove();
        
        let message = 'Ошибка входа';
        if (error.code === 'auth/invalid-credential') {
            message = 'Неверный email или пароль';
        } else if (error.code === 'auth/user-not-found') {
            message = 'Пользователь не найден';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Слишком много попыток. Попробуйте позже';
        } else {
            message = error.message;
        }
        
        Notifications.error(message);
    }
}

// ========== СБРОС ПАРОЛЯ ==========
async function resetPassword() {
    const email = document.getElementById('resetEmail').value.trim().toLowerCase();
    
    if (!email || !isValidEmail(email)) {
        Notifications.warning('Введите корректный email');
        return;
    }
    
    const loader = Notifications.loading('Отправка письма...');
    
    try {
        await sendPasswordResetEmail(auth, email);
        loader.remove();
        
        Notifications.success('Письмо отправлено! Проверьте почту');
        
        setTimeout(() => {
            showForm('resetSuccess');
            document.getElementById('resetSuccessMessage').textContent = 
                `Ссылка для сброса пароля отправлена на ${email}`;
        }, 1000);
        
    } catch (error) {
        loader.remove();
        
        let message = 'Ошибка отправки';
        if (error.code === 'auth/user-not-found') {
            message = 'Пользователь с таким email не найден';
        } else {
            message = error.message;
        }
        
        Notifications.error(message);
    }
}

// ========== GOOGLE АВТОРИЗАЦИЯ ==========
async function googleAuth() {
    const loader = Notifications.loading('Авторизация через Google...');
    
    try {
        const result = await signInWithPopup(auth, googleProvider);
        loader.remove();
        
        Notifications.success('Вход выполнен! Перенаправление...');
        
        setTimeout(() => {
            window.location.href = 'https://kirill12633.github.io/Metro.New.Official/ru/';
        }, 1500);
        
    } catch (error) {
        loader.remove();
        
        let message = 'Ошибка авторизации';
        if (error.code === 'auth/popup-closed-by-user') {
            message = 'Окно авторизации закрыто';
        } else {
            message = error.message;
        }
        
        Notifications.error(message);
    }
}

// ========== ПОВТОРНАЯ ОТПРАВКА ==========
async function resendVerificationEmail() {
    if (!auth.currentUser) return;
    
    try {
        await sendEmailVerification(auth.currentUser);
        Notifications.success('Письмо отправлено повторно!');
        
        resendTimer = 60;
        startResendTimer();
        
    } catch (error) {
        Notifications.error('Не удалось отправить письмо');
    }
}

function startResendTimer() {
    const resendBtn = document.getElementById('resendEmailBtn');
    const timerText = document.getElementById('resendTimerText');
    
    if (resendInterval) clearInterval(resendInterval);
    
    resendBtn.disabled = true;
    
    resendInterval = setInterval(() => {
        resendTimer--;
        timerText.textContent = `Отправить повторно (${resendTimer})`;
        
        if (resendTimer <= 0) {
            clearInterval(resendInterval);
            resendBtn.disabled = false;
            timerText.textContent = 'Отправить повторно';
        }
    }, 1000);
}

// ========== МОДАЛЬНОЕ ОКНО ==========
function showPolicyModal(title, url) {
    const modal = document.getElementById('policyModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('policyIframe').src = url;
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 10);
}

function closePolicyModal() {
    const modal = document.getElementById('policyModal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('policyIframe').src = '';
        document.body.style.overflow = '';
    }, 300);
}

function acceptPolicy() {
    document.getElementById('agreeTerms').checked = true;
    closePolicyModal();
}

// ========== ВАЛИДАЦИЯ ==========
function validateName() {
    const value = document.getElementById('firstName').value.trim();
    if (!value) {
        showFieldError('firstName', 'Введите имя');
    } else if (value.length < 2) {
        showFieldError('firstName', 'Минимум 2 символа');
    } else {
        clearFieldError('firstName');
    }
}

function validateUsername(username) {
    if (!username) {
        showFieldError('username', 'Введите никнейм');
        return false;
    }
    
    const profanityCheck = ProfanityFilter.check(username);
    if (profanityCheck.hasProfanity) {
        showFieldError('username', 'Никнейм содержит неприемлемые слова');
        return false;
    }
    
    if (username.length < 3) {
        showFieldError('username', 'Минимум 3 символа');
        return false;
    }
    
    if (username.length > 20) {
        showFieldError('username', 'Максимум 20 символов');
        return false;
    }
    
    clearFieldError('username');
    return true;
}

function validateEmail() {
    const value = document.getElementById('email').value.trim().toLowerCase();
    
    if (!value) {
        showFieldError('email', 'Введите email');
        return false;
    }
    
    if (!isValidEmail(value)) {
        showFieldError('email', 'Некорректный email');
        return false;
    }
    
    const emailCheck = EmailBlacklist.check(value);
    if (!emailCheck.isValid) {
        showFieldError('email', emailCheck.reason);
        return false;
    }
    
    clearFieldError('email');
    return true;
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const requirements = checkPasswordRequirements(password);
    
    if (!password) {
        showFieldError('password', 'Введите пароль');
    } else if (password.length < 8) {
        showFieldError('password', 'Минимум 8 символов');
    } else if (!requirements.allMet) {
        showFieldError('password', 'Пароль не соответствует требованиям');
    } else {
        clearFieldError('password');
    }
    
    // Обновить индикатор
    updatePasswordStrength(password);
    updatePasswordRequirements(requirements);
}

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (!confirm) {
        showFieldError('confirmPassword', 'Подтвердите пароль');
    } else if (password !== confirm) {
        showFieldError('confirmPassword', 'Пароли не совпадают');
    } else {
        clearFieldError('confirmPassword');
    }
}

function validateAge() {
    const day = document.getElementById('birthDay').value;
    const month = document.getElementById('birthMonth').value;
    const year = document.getElementById('birthYear').value;
    
    if (!day || !month || !year) {
        showFieldError('birthDay', 'Выберите дату');
        return;
    }
    
    const ageCheck = AgeValidator.check(day, month, year);
    
    if (ageCheck.isValid) {
        clearFieldError('birthDay');
        document.getElementById('birthDayHint').textContent = `✅ Возраст: ${ageCheck.age} лет`;
        document.getElementById('birthDayHint').className = 'form-hint success';
    } else {
        document.getElementById('birthDayHint').textContent = ageCheck.message;
        document.getElementById('birthDayHint').className = 'form-hint error';
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ==========
function checkPasswordRequirements(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
        allMet: false
    };
}

function updatePasswordRequirements(requirements) {
    requirements.allMet = requirements.length && requirements.uppercase && 
                         requirements.lowercase && requirements.number && requirements.special;
    
    const reqs = ['length', 'uppercase', 'lowercase', 'number', 'special'];
    reqs.forEach(req => {
        const el = document.getElementById(`req${req.charAt(0).toUpperCase() + req.slice(1)}`);
        if (el) {
            if (requirements[req]) {
                el.classList.add('met');
                el.querySelector('i').className = 'fas fa-check-circle';
            } else {
                el.classList.remove('met');
                el.querySelector('i').className = 'fas fa-circle';
            }
        }
    });
}

function updatePasswordStrength(password) {
    const strength = ProfanityFilter.checkPasswordStrength?.(password) || 
                    { class: '', text: 'Введите пароль' };
    
    const strengthDiv = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');
    
    if (!password) {
        strengthDiv.className = 'password-strength';
        strengthText.textContent = 'Введите пароль';
    } else if (password.length < 8) {
        strengthDiv.className = 'password-strength strength-weak';
        strengthText.textContent = 'Слишком слабый';
    } else {
        strengthDiv.className = `password-strength strength-${strength.class || 'medium'}`;
        strengthText.textContent = strength.text || 'Средний';
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const hint = document.getElementById(fieldId + 'Hint');
    
    if (field) field.classList.add('error');
    if (hint) {
        hint.textContent = message;
        hint.className = 'form-hint error';
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const hint = document.getElementById(fieldId + 'Hint');
    
    if (field) field.classList.remove('error');
    if (hint) {
        hint.className = 'form-hint';
        const hints = {
            firstName: 'Как к вам обращаться',
            lastName: 'Необязательно',
            username: 'Будет отображаться другим пользователям',
            email: 'Ваш email для входа',
            password: 'Минимум 8 символов',
            confirmPassword: 'Пароли должны совпадать',
            birthDay: 'Для подтверждения возраста'
        };
        hint.textContent = hints[fieldId] || '';
    }
}

function clearErrors() {
    ['errorAlert', 'loginErrorAlert', 'resetErrorAlert'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function resetRegistration() {
    currentStep = 1;
    showStep(1);
    updateProgressBar();
    
    ['firstName', 'lastName', 'username', 'email', 'password', 'confirmPassword'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    ['birthDay', 'birthMonth', 'birthYear'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    document.getElementById('agreeTerms').checked = false;
    
    // Сброс ошибок
    ['firstName', 'lastName', 'username', 'birthDay', 'email', 'password', 'confirmPassword'].forEach(id => {
        clearFieldError(id);
    });
    
    document.getElementById('passwordStrength').className = 'password-strength';
    document.getElementById('strengthText').textContent = 'Введите пароль';
    
    document.querySelectorAll('.requirement').forEach(req => {
        req.classList.remove('met');
        req.querySelector('i').className = 'fas fa-circle';
    });
}

function togglePasswordVisibility() {
    const input = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function toggleConfirmPasswordVisibility() {
    const input = document.getElementById('confirmPassword');
    const icon = this.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function toggleLoginPasswordVisibility() {
    const input = document.getElementById('loginPassword');
    const icon = this.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}
