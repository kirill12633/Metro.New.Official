<!-- ОСНОВНОЙ JAVASCRIPT (ВСЕ В ОДНОМ ФАЙЛЕ) -->
<script type="module">
// ============================================
// FIREBASE КОНФИГУРАЦИЯ
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
    authDomain: "metro-new-85226.firebaseapp.com",
    databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
    projectId: "metro-new-85226",
    storageBucket: "metro-new-85226.firebasestorage.app",
    messagingSenderId: "905640751733",
    appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ============================================
// ФИЛЬТР МАТОВ
// ============================================
const ProfanityFilter = {
    blacklist: [
        'хуй', 'пизда', 'еблан', 'мудак', 'гандон', 'шлюха',
        'блядь', 'сука', 'пидор', 'лох', 'чмо', 'мразь',
        'тварь', 'уебок', 'залупа', 'пиздец', 'хуйня',
        'долбоеб', 'ебать', 'ебанутый', 'распиздяй',
        'fuck', 'shit', 'bitch', 'asshole', 'dick',
        'pussy', 'cunt', 'nigger', 'faggot',
        'дебил', 'идиот', 'кретин', 'даун', 'тупой'
    ],

    options: {
        checkSubstrings: true,
        ignoreCase: true,
        checkTranslit: true,
        checkLeet: true,
        minWordLength: 3,
        mode: 'strict'
    },

    check(text) {
        if (!text || text.length < this.options.minWordLength) {
            return { hasProfanity: false, foundWords: [], cleanText: text };
        }

        const foundWords = [];
        let testText = text;
        
        if (this.options.ignoreCase) {
            testText = testText.toLowerCase();
        }

        const words = testText.split(/[\s\.\,\!\?\-\_]+/);

        for (let word of words) {
            if (word.length < this.options.minWordLength) continue;

            for (let badWord of this.blacklist) {
                if (this.options.checkSubstrings) {
                    if (word.includes(badWord.toLowerCase())) {
                        foundWords.push(word);
                        if (this.options.mode === 'strict') {
                            return {
                                hasProfanity: true,
                                foundWords: foundWords,
                                cleanText: this.censor(text, foundWords),
                                message: '❌ Обнаружены запрещенные слова'
                            };
                        }
                    }
                }
            }
        }

        return {
            hasProfanity: foundWords.length > 0,
            foundWords: foundWords,
            cleanText: foundWords.length > 0 ? this.censor(text, foundWords) : text,
            message: foundWords.length > 0 ? '⚠️ Есть подозрительные слова' : '✅ Текст чист'
        };
    },

    censor(text, foundWords) {
        let censored = text;
        for (let word of foundWords) {
            const regex = new RegExp(word, 'gi');
            censored = censored.replace(regex, '*'.repeat(Math.min(word.length, 5)));
        }
        return censored;
    },

    addWords(...words) {
        this.blacklist.push(...words);
        return this.blacklist.length;
    }
};

// ============================================
// ЧЕРНЫЙ СПИСОК EMAIL
// ============================================
const EmailBlacklist = {
    temporaryDomains: [
        'tempmail.com', 'temp-mail.org', '10minutemail.com',
        'guerrillamail.com', 'yopmail.com', 'mailinator.com',
        'throwaway.com', 'sharklasers.com', 'grr.la',
        'spam4.me', 'trashmail.com', 'fakeinbox.com',
        'dispostable.com', 'mailcatch.com', 'getnada.com',
        'tempail.com', 'mohmal.com', 'emailfake.com'
    ],

    blockedEmails: [
        'spam@mail.ru', 'bot@yandex.ru', 'fake@gmail.com',
        'test@test.com', 'admin@admin.com'
    ],

    check(email) {
        const result = { isValid: true, blocked: false, reason: '', suggestions: [] };

        if (!email || !email.includes('@')) {
            result.isValid = false;
            result.reason = 'Неверный формат email';
            return result;
        }

        const [localPart, domain] = email.toLowerCase().split('@');

        if (this.temporaryDomains.includes(domain)) {
            result.isValid = false;
            result.blocked = true;
            result.reason = 'Временные почты запрещены';
            return result;
        }

        if (this.blockedEmails.includes(email.toLowerCase())) {
            result.isValid = false;
            result.blocked = true;
            result.reason = 'Этот email заблокирован';
            return result;
        }

        if (localPart.length < 3) {
            result.isValid = false;
            result.reason = 'Слишком короткий логин';
            return result;
        }

        return result;
    }
};

// ============================================
// ПРОВЕРКА ВОЗРАСТА
// ============================================
const AgeValidator = {
    minAge: 13,
    maxAge: 120,

    check(day, month, year) {
        const result = {
            isValid: false,
            age: null,
            message: '',
            canRegister: false
        };

        if (!day || !month || !year) {
            result.message = '❌ Выберите дату рождения';
            return result;
        }

        if (!this.isValidDate(day, month, year)) {
            result.message = '❌ Некорректная дата';
            return result;
        }

        const age = this.calculateAge(day, month, year);
        result.age = age;

        if (age > this.maxAge) {
            result.message = '❌ Проверьте дату';
            return result;
        }

        if (age >= this.minAge) {
            result.isValid = true;
            result.canRegister = true;
            result.message = `✅ Возраст: ${age} лет`;
        } else {
            result.isValid = false;
            result.canRegister = false;
            const yearsUntil = this.minAge - age;
            result.message = `❌ Тебе ${age} лет. Регистрация с 13 лет. Вернись через ${yearsUntil} ${this.getYearWord(yearsUntil)}`;
        }

        return result;
    },

    calculateAge(day, month, year) {
        const today = new Date();
        const birthDate = new Date(year, month - 1, day);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },

    isValidDate(day, month, year) {
        const date = new Date(year, month - 1, day);
        return date.getFullDate == year && 
               date.getMonth() == month - 1 && 
               date.getDate() == day;
    },

    getYearWord(years) {
        if (years % 10 === 1 && years % 100 !== 11) return 'год';
        if ([2,3,4].includes(years % 10) && ![12,13,14].includes(years % 100)) return 'года';
        return 'лет';
    }
};

// ============================================
// УВЕДОМЛЕНИЯ
// ============================================
const Notifications = {
    success(message, title = '✅ Успешно!') {
        this.show({
            title: title,
            message: message,
            icon: '✅',
            color: '#1e8e3e',
            bg: 'rgba(30, 142, 62, 0.1)',
            border: 'rgba(30, 142, 62, 0.2)'
        });
    },

    error(message, title = '❌ Ошибка') {
        this.show({
            title: title,
            message: message,
            icon: '❌',
            color: '#d93025',
            bg: 'rgba(217, 48, 37, 0.1)',
            border: 'rgba(217, 48, 37, 0.2)'
        });
    },

    warning(message, title = '⚠️ Внимание') {
        this.show({
            title: title,
            message: message,
            icon: '⚠️',
            color: '#fbbc04',
            bg: 'rgba(251, 188, 4, 0.1)',
            border: 'rgba(251, 188, 4, 0.2)'
        });
    },

    info(message, title = 'ℹ️ Информация') {
        this.show({
            title: title,
            message: message,
            icon: 'ℹ️',
            color: '#0066CC',
            bg: 'rgba(0, 102, 204, 0.1)',
            border: 'rgba(0, 102, 204, 0.2)'
        });
    },

    show(options) {
        const oldToast = document.querySelector('.custom-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'custom-toast';
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

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast && toast.parentElement) {
                toast.style.animation = 'slideIn 0.3s reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    },

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

    registrationResult(success, message) {
        if (success) {
            this.success(message || 'Регистрация прошла успешно!');
            setTimeout(() => {
                window.location.href = 'https://kirill12633.github.io/Metro.New.Official/ru/';
            }, 3000);
        } else {
            this.error(message || 'Ошибка регистрации');
        }
    }
};

// ============================================
// СТРУКТУРА FIREBASE
// ============================================
const FirebaseStructure = {
    collections: {
        USERS_PUBLIC: 'users_public',
        USERS_PRIVATE: 'users_private',
        LEGAL_CONSENTS: 'legal_consents',
        USERNAME_INDEX: 'username_index'
    },

    async createUserInFirestore(db, uid, formData, email, ip) {
        try {
            // Публичные данные
            const publicData = {
                uid: uid,
                username: formData.username,
                firstName: formData.firstName,
                lastName: formData.lastName || '',
                displayName: `${formData.firstName} ${formData.lastName || ''}`.trim(),
                age: formData.age,
                birthDate: {
                    day: parseInt(formData.birthDay),
                    month: parseInt(formData.birthMonth),
                    year: parseInt(formData.birthYear)
                },
                createdAt: serverTimestamp(),
                status: 'active',
                agreedToTerms: true
            };
            await setDoc(doc(db, this.collections.USERS_PUBLIC, uid), publicData);

            // Приватные данные
            const privateData = {
                uid: uid,
                email: email.toLowerCase(),
                emailVerified: false,
                lastLogin: serverTimestamp(),
                ipHistory: [ip],
                userAgent: navigator.userAgent
            };
            await setDoc(doc(db, this.collections.USERS_PRIVATE, uid), privateData);

            // Индекс никнейма
            await setDoc(doc(db, this.collections.USERNAME_INDEX, formData.username.toLowerCase()), {
                uid: uid,
                username: formData.username.toLowerCase(),
                reserved: true
            });

            console.log('✅ Пользователь создан');
            return true;
        } catch (error) {
            console.error('❌ Ошибка:', error);
            throw error;
        }
    }
};

// ============================================
// ОСНОВНОЙ КОД АВТОРИЗАЦИИ
// ============================================

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
    
    // Очищаем
    daySelect.innerHTML = '<option value="">День</option>';
    yearSelect.innerHTML = '<option value="">Год</option>';
    
    // Дни (1-31)
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Годы (текущий - 100 лет)
    for (let i = currentYear; i >= currentYear - 100; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
    
    console.log('📅 Даты загружены');
}

// ========== ОБНОВЛЕНИЕ КОПИРАЙТА ==========
function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    const copyrightEl = document.getElementById('copyrightYear');
    if (copyrightEl) {
        copyrightEl.textContent = `© ${currentYear} Метро New. Все права защищены.`;
    }
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
        
        const ageCheck = AgeValidator.check(birthDay, birthMonth, birthYear);
        
        if (!ageCheck.isValid) {
            Notifications.warning(ageCheck.message);
            return;
        }
        
        if (ageCheck.age < 13) {
            const yearsUntil = 13 - ageCheck.age;
            document.getElementById('ageRestrictionMessage').innerHTML = 
                `Тебе ${ageCheck.age} ${AgeValidator.getYearWord(ageCheck.age)}.<br>
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
    
    const stepEl = document.getElementById(`step${stepNumber}`);
    if (stepEl) stepEl.classList.add('active');
    
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
    const divider = document.getElementById('registerDivider');
    const googleBtn = document.getElementById('googleRegisterBtn');
    const links = document.getElementById('registerLinks');
    
    if (divider) divider.style.display = showExtra ? 'block' : 'none';
    if (googleBtn) googleBtn.style.display = showExtra ? 'block' : 'none';
    if (links) links.style.display = showExtra ? 'block' : 'none';
}

function updateProgressBar() {
    const percentage = (currentStep / 3) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
}

// ========== ВАЛИДАЦИЯ ШАГОВ ==========
function validateStep1() {
    const firstName = document.getElementById('firstName')?.value.trim() || '';
    const username = document.getElementById('username')?.value.trim() || '';
    const birthDay = document.getElementById('birthDay')?.value;
    const birthMonth = document.getElementById('birthMonth')?.value;
    const birthYear = document.getElementById('birthYear')?.value;
    
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
        const profanityCheck = ProfanityFilter.check(username);
        if (profanityCheck.hasProfanity) {
            showFieldError('username', 'Никнейм содержит неприемлемые слова');
            Notifications.warning(`Обнаружены запрещенные слова`);
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
    const email = document.getElementById('email')?.value.trim().toLowerCase() || '';
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    
    let isValid = true;
    
    // Email
    if (!email) {
        showFieldError('email', 'Введите email');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('email', 'Некорректный email');
        isValid = false;
    } else {
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
        clearFieldError('password');
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
    const firstName = document.getElementById('firstName')?.value.trim() || '';
    const lastName = document.getElementById('lastName')?.value.trim() || '';
    const username = document.getElementById('username')?.value.trim() || '';
    const birthDay = document.getElementById('birthDay')?.value;
    const birthMonth = document.getElementById('birthMonth')?.value;
    const birthYear = document.getElementById('birthYear')?.value;
    const email = document.getElementById('email')?.value.trim().toLowerCase() || '';
    
    const age = AgeValidator.calculateAge(birthDay, birthMonth, birthYear);
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const summary = document.getElementById('userDataSummary');
    if (summary) {
        summary.innerHTML = `
            <div>👤 <strong>${firstName} ${lastName}</strong> (@${username})</div>
            <div>📅 ${birthDay} ${months[birthMonth-1]} ${birthYear} (${age} лет)</div>
            <div>📧 ${email}</div>
        `;
    }
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
    const titleEl = document.getElementById('formTitle');
    const subtitleEl = document.getElementById('formSubtitle');
    
    if (titleEl) titleEl.textContent = titleData.title;
    if (subtitleEl) subtitleEl.textContent = titleData.subtitle;
}

// ========== РЕГИСТРАЦИЯ ==========
async function submitRegistration(e) {
    e.preventDefault();
    
    if (!document.getElementById('agreeTerms')?.checked) {
        Notifications.warning('Необходимо принять пользовательское соглашение');
        return;
    }
    
    const firstName = document.getElementById('firstName')?.value.trim() || '';
    const lastName = document.getElementById('lastName')?.value.trim() || '';
    const username = document.getElementById('username')?.value.trim() || '';
    const birthDay = document.getElementById('birthDay')?.value;
    const birthMonth = document.getElementById('birthMonth')?.value;
    const birthYear = document.getElementById('birthYear')?.value;
    const email = document.getElementById('email')?.value.trim().toLowerCase() || '';
    const password = document.getElementById('password')?.value || '';
    
    const age = AgeValidator.calculateAge(birthDay, birthMonth, birthYear);
    
    const loader = Notifications.loading('Создание аккаунта...');
    
    try {
        // 1. Создать пользователя
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 2. Обновить профиль
        await updateProfile(userCredential.user, {
            displayName: firstName + (lastName ? ' ' + lastName : '')
        });
        
        // 3. Отправить подтверждение
        await sendEmailVerification(userCredential.user);
        
        // 4. IP (заглушка)
        const ip = '0.0.0.0';
        
        // 5. Сохранить в Firestore
        const formData = {
            firstName, lastName, username,
            birthDay, birthMonth, birthYear,
            age
        };
        
        await FirebaseStructure.createUserInFirestore(db, userCredential.user.uid, formData, email, ip);
        
        // 6. Успех
        loader.remove();
        
        Notifications.registrationResult(true, '✅ Аккаунт создан! Проверьте почту');
        
        setTimeout(() => {
            showForm('success');
            const successMsg = document.getElementById('successMessage');
            if (successMsg) {
                successMsg.textContent = `На адрес ${email} отправлено письмо для подтверждения.`;
            }
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
    const email = document.getElementById('loginEmail')?.value.trim().toLowerCase() || '';
    const password = document.getElementById('loginPassword')?.value || '';
    
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
    const email = document.getElementById('resetEmail')?.value.trim().toLowerCase() || '';
    
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
            const resetMsg = document.getElementById('resetSuccessMessage');
            if (resetMsg) {
                resetMsg.textContent = `Ссылка для сброса пароля отправлена на ${email}`;
            }
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
        await signInWithPopup(auth, googleProvider);
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
    
    if (!resendBtn || !timerText) return;
    
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
    const modalTitle = document.getElementById('modalTitle');
    const iframe = document.getElementById('policyIframe');
    
    if (!modal || !modalTitle || !iframe) return;
    
    modalTitle.textContent = title;
    iframe.src = url;
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 10);
}

function closePolicyModal() {
    const modal = document.getElementById('policyModal');
    const iframe = document.getElementById('policyIframe');
    
    if (!modal) return;
    
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        if (iframe) iframe.src = '';
        document.body.style.overflow = '';
    }, 300);
}

function acceptPolicy() {
    const agreeTerms = document.getElementById('agreeTerms');
    if (agreeTerms) agreeTerms.checked = true;
    closePolicyModal();
}

// ========== ВАЛИДАЦИЯ ==========
function validateName() {
    const input = document.getElementById('firstName');
    if (!input) return;
    
    const value = input.value.trim();
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
    const input = document.getElementById('email');
    if (!input) return;
    
    const value = input.value.trim().toLowerCase();
    
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
    const input = document.getElementById('password');
    if (!input) return;
    
    const password = input.value;
    
    if (!password) {
        showFieldError('password', 'Введите пароль');
    } else if (password.length < 8) {
        showFieldError('password', 'Минимум 8 символов');
    } else {
        clearFieldError('password');
    }
    
    // Обновить индикатор
    updatePasswordStrength(password);
}

function validatePasswordMatch() {
    const password = document.getElementById('password')?.value || '';
    const confirm = document.getElementById('confirmPassword')?.value || '';
    
    if (!confirm) {
        showFieldError('confirmPassword', 'Подтвердите пароль');
    } else if (password !== confirm) {
        showFieldError('confirmPassword', 'Пароли не совпадают');
    } else {
        clearFieldError('confirmPassword');
    }
}

function validateAge() {
    const day = document.getElementById('birthDay')?.value;
    const month = document.getElementById('birthMonth')?.value;
    const year = document.getElementById('birthYear')?.value;
    const hint = document.getElementById('birthDayHint');
    
    if (!day || !month || !year) {
        if (hint) {
            hint.textContent = 'Выберите дату';
            hint.className = 'form-hint error';
        }
        return;
    }
    
    const ageCheck = AgeValidator.check(day, month, year);
    
    if (ageCheck.isValid) {
        clearFieldError('birthDay');
        if (hint) {
            hint.textContent = `✅ Возраст: ${ageCheck.age} лет`;
            hint.className = 'form-hint success';
        }
    } else {
        if (hint) {
            hint.textContent = ageCheck.message;
            hint.className = 'form-hint error';
        }
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ==========
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function updatePasswordStrength(password) {
    const strengthDiv = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthDiv || !strengthText) return;
    
    if (!password) {
        strengthDiv.className = 'password-strength';
        strengthText.textContent = 'Введите пароль';
        return;
    }
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) {
        strengthDiv.className = 'password-strength strength-weak';
        strengthText.textContent = 'Слабый';
    } else if (score <= 4) {
        strengthDiv.className = 'password-strength strength-medium';
        strengthText.textContent = 'Средний';
    } else {
        strengthDiv.className = 'password-strength strength-strong';
        strengthText.textContent = 'Сильный';
    }
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
    
    const agreeTerms = document.getElementById('agreeTerms');
    if (agreeTerms) agreeTerms.checked = false;
    
    ['firstName', 'lastName', 'username', 'birthDay', 'email', 'password', 'confirmPassword'].forEach(id => {
        clearFieldError(id);
    });
    
    const strengthDiv = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');
    if (strengthDiv) strengthDiv.className = 'password-strength';
    if (strengthText) strengthText.textContent = 'Введите пароль';
    
    document.querySelectorAll('.requirement').forEach(req => {
        req.classList.remove('met');
        const icon = req.querySelector('i');
        if (icon) icon.className = 'fas fa-circle';
    });
}

function togglePasswordVisibility() {
    const input = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (!input || !icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function toggleConfirmPasswordVisibility() {
    const input = document.getElementById('confirmPassword');
    const icon = this.querySelector('i');
    
    if (!input || !icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function toggleLoginPasswordVisibility() {
    const input = document.getElementById('loginPassword');
    const icon = this.querySelector('i');
    
    if (!input || !icon) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Добавляем стили для анимаций
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

console.log('✅ Система авторизации готова');
</script>
