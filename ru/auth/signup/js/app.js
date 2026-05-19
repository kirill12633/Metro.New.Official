// ============================================
// ГЛАВНЫЙ ФАЙЛ ПРИЛОЖЕНИЯ
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Приложение запускается...');
    
    // Проверка поддержки браузера
    if (!utils.checkBrowserSupport()) {
        alert('Ваш браузер устарел. Пожалуйста, используйте современный браузер.');
        return;
    }
    
    // Инициализация Firebase
    const firebaseReady = await initFirebase();
    
    if (!firebaseReady) {
        ui.showNotification('Сервис временно недоступен. Попробуйте позже.', 'error', 5000);
        console.warn('⚠️ Firebase не инициализирован, работаем в ограниченном режиме');
    }
    
    // Заполнение селекторов дат
    utils.fillDateSelectors();
    
    // Обновление копирайта
    utils.updateCopyrightYear();
    
    // Установка ссылок из конфига
    setConfigLinks();
    
    // Инициализация обработчиков событий
    initEventHandlers();
    
    // Восстановление сохранённого email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const loginEmailInput = document.getElementById('loginEmail');
        if (loginEmailInput) {
            loginEmailInput.value = rememberedEmail;
        }
    }
    
    console.log('✅ Приложение готово');
});

// ============================================
// УСТАНОВКА ССЫЛОК ИЗ КОНФИГА
// ============================================
function setConfigLinks() {
    const linkMap = {
        'termsLink': CONFIG.termsUrl,
        'privacyLink': CONFIG.privacyUrl,
        'helpLink': CONFIG.helpUrl,
        'supportLink': CONFIG.supportUrl,
        'goToParentPageBtn': CONFIG.parentsUrl,
        'goToLoginBtn': CONFIG.loginUrl,
        'backToLoginBtn': CONFIG.loginUrl
    };
    
    Object.entries(linkMap).forEach(([id, url]) => {
        const element = document.getElementById(id);
        if (element && url) {
            if (element.tagName === 'A') {
                element.href = url;
            } else if (element.tagName === 'BUTTON') {
                element.onclick = () => window.open(url, '_blank');
            }
        }
    });
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ СОБЫТИЙ
// ============================================
function initEventHandlers() {
    
    // ========== НАВИГАЦИЯ ПО ШАГАМ ==========
    
    // Шаг 1 -> Шаг 2
    document.getElementById('nextStep1')?.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName')?.value.trim();
        const username = document.getElementById('username')?.value.trim();
        const birthDay = document.getElementById('birthDay')?.value;
        const birthMonth = document.getElementById('birthMonth')?.value;
        const birthYear = document.getElementById('birthYear')?.value;
        
        // Валидация имени
        const nameValidation = security.validateName(firstName);
        if (!nameValidation.valid) {
            ui.showFieldError('firstName', nameValidation.message);
            return;
        }
        ui.showFieldSuccess('firstName', 'Отлично!');
        
        // Валидация никнейма
        const usernameValidation = security.validateUsername(username);
        if (!usernameValidation.valid) {
            ui.showFieldError('username', usernameValidation.message);
            return;
        }
        
        // Проверка никнейма в базе
        if (window.firebaseDB?.db) {
            try {
                const { db, collection, query, where, getDocs } = window.firebaseDB;
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("username", "==", username.toLowerCase()));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    ui.showFieldError('username', 'Это имя уже занято');
                    return;
                }
            } catch (error) {
                console.warn('Не удалось проверить никнейм:', error);
            }
        }
        
        ui.showFieldSuccess('username', 'Имя доступно');
        
        // Валидация даты рождения
        if (!birthDay || !birthMonth || !birthYear) {
            ui.showFieldError('birthDay', 'Выберите дату рождения');
            return;
        }
        
        const ageData = security.calculateAge(birthDay, birthMonth, birthYear);
        
        if (!ageData.canRegister) {
            ui.showAgeRestriction(ageData.age);
            return;
        }
        
        // Переход к шагу 2
        ui.goToStep(2);
    });
    
    // Шаг 2 -> Шаг 3
    document.getElementById('nextStep2')?.addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        
        // Валидация email
        const emailValidation = security.validateEmail(email);
        if (!emailValidation.valid) {
            ui.showFieldError('email', emailValidation.message);
            return;
        }
        ui.showFieldSuccess('email', 'Email принят');
        
        // Валидация пароля
        const passwordValidation = security.validatePassword(password);
        if (!passwordValidation.valid) {
            ui.showFieldError('password', `Пароль слишком слабый. ${passwordValidation.requirements.join(', ')}`);
            return;
        }
        ui.showFieldSuccess('password', `Надёжность: ${passwordValidation.message}`);
        
        // Проверка совпадения паролей
        if (password !== confirmPassword) {
            ui.showFieldError('confirmPassword', 'Пароли не совпадают');
            return;
        }
        ui.showFieldSuccess('confirmPassword', 'Пароли совпадают');
        
        // Показ сводки данных
        const firstName = document.getElementById('firstName').value;
        const username = document.getElementById('username').value;
        const birthDay = document.getElementById('birthDay').value;
        const birthMonth = document.getElementById('birthMonth').value;
        const birthYear = document.getElementById('birthYear').value;
        const ageData = security.calculateAge(birthDay, birthMonth, birthYear);
        
        ui.showUserDataSummary({
            firstName,
            username,
            email,
            birthDate: {
                day: parseInt(birthDay),
                month: parseInt(birthMonth),
                year: parseInt(birthYear)
            },
            age: ageData.age,
            ageGroup: ageData.group
        });
        
        // Переход к шагу 3
        ui.goToStep(3);
    });
    
    // Назад из шага 2
    document.getElementById('prevStep2')?.addEventListener('click', function() {
        ui.goToStep(1);
    });
    
    // Назад из шага 3
    document.getElementById('prevStep3')?.addEventListener('click', function() {
        ui.goToStep(2);
    });
    
    // ========== ОТМЕНА РЕГИСТРАЦИИ ==========
    document.getElementById('cancelRegistration')?.addEventListener('click', function() {
        utils.confirmAction('Отменить регистрацию? Все данные будут потеряны.')
            .then(confirmed => {
                if (confirmed) {
                    window.location.href = CONFIG.homeUrl;
                }
            });
    });
    
    // ========== ОТПРАВКА РЕГИСТРАЦИИ ==========
    document.getElementById('submitRegistration')?.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Проверка согласия с условиями
        if (!document.getElementById('agreeTerms')?.checked) {
            ui.showAlert('Необходимо принять пользовательское соглашение', 'error');
            return;
        }
        
        // Сбор данных
        const userData = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            firstName: document.getElementById('firstName').value.trim(),
            username: document.getElementById('username').value.trim(),
            birthDay: document.getElementById('birthDay').value,
            birthMonth: document.getElementById('birthMonth').value,
            birthYear: document.getElementById('birthYear').value,
            marketingConsent: document.getElementById('marketingConsent')?.checked || false
        };
        
        try {
            // Показ загрузки
            ui.showLoading('Создание аккаунта...');
            ui.disableButton('submitRegistration');
            
            // Регистрация
            const result = await authManager.register(userData);
            
            // Успех
            ui.showRegistrationSuccess(userData.email);
            ui.startResendTimer(async () => {
                try {
                    await authManager.resendVerification();
                    ui.showNotification('Письмо отправлено повторно!', 'success');
                } catch (error) {
                    ui.showNotification('Не удалось отправить письмо', 'error');
                }
            });
            
            ui.showNotification(result.message, 'success');
            
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            
            let errorMessage = 'Произошла ошибка при регистрации';
            
            if (error.message.includes('email уже используется')) {
                errorMessage = 'Этот email уже зарегистрирован';
            } else if (error.message.includes('занято')) {
                errorMessage = error.message;
            } else if (error.message.includes('пароль')) {
                errorMessage = error.message;
            }
            
            ui.showAlert(errorMessage, 'error');
            ui.showNotification(errorMessage, 'error');
            
        } finally {
            ui.hideLoading();
            ui.enableButton('submitRegistration');
        }
    });
    
    // ========== ПЕРЕКЛЮЧЕНИЕ ФОРМ ==========
    document.getElementById('showLoginLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        ui.showForm('login');
    });
    
    document.getElementById('showRegisterLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        ui.showForm('register');
    });
    
    document.getElementById('forgotPasswordLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        ui.showForm('reset');
    });
    
    document.getElementById('cancelResetBtn')?.addEventListener('click', function() {
        ui.showForm('login');
    });
    
    document.getElementById('backFromAgeRestriction')?.addEventListener('click', function(e) {
        e.preventDefault();
        ui.showForm('register');
    });
    
    // ========== ВХОД ==========
    document.getElementById('loginFormElement')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;
        
        if (!email || !password) {
            ui.showAlert('Заполните все поля', 'error', 'loginErrorAlert');
            return;
        }
        
        try {
            ui.showLoading('Вход...');
            ui.disableButton('loginBtn');
            
            const result = await authManager.login(email, password, rememberMe);
            
            ui.showNotification(result.message, 'success');
            
            setTimeout(() => {
                window.location.href = CONFIG.homeUrl;
            }, 1500);
            
        } catch (error) {
            console.error('Ошибка входа:', error);
            
            let errorMessage = 'Неверный email или пароль';
            
            if (error.message === 'EMAIL_NOT_VERIFIED') {
                errorMessage = 'Email не подтверждён. Проверьте почту.';
            } else if (error.message.includes('заблокирован')) {
                errorMessage = error.message;
            } else if (error.message.includes('попыток')) {
                errorMessage = error.message;
            }
            
            ui.showAlert(errorMessage, 'error', 'loginErrorAlert');
            ui.showNotification(errorMessage, 'error');
            
        } finally {
            ui.hideLoading();
            ui.enableButton('loginBtn');
        }
    });
    
    // ========== ВХОД ЧЕРЕЗ GOOGLE ==========
    document.getElementById('googleRegisterBtn')?.addEventListener('click', handleGoogleAuth);
    document.getElementById('googleLoginBtn')?.addEventListener('click', handleGoogleAuth);
    
    async function handleGoogleAuth() {
        try {
            ui.showLoading('Авторизация через Google...');
            
            const result = await authManager.loginWithGoogle();
            
            ui.showNotification(result.message, 'success');
            
            setTimeout(() => {
                window.location.href = CONFIG.homeUrl;
            }, 1500);
            
        } catch (error) {
            console.error('Ошибка Google авторизации:', error);
            ui.showNotification('Ошибка авторизации через Google', 'error');
            ui.hideLoading();
        }
    }
    
    // ========== СБРОС ПАРОЛЯ ==========
    document.getElementById('resetPasswordFormElement')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail')?.value.trim();
        
        if (!email) {
            ui.showAlert('Введите email', 'error', 'resetErrorAlert');
            return;
        }
        
        try {
            ui.showLoading('Отправка письма...');
            ui.disableButton('resetPasswordBtn');
            
            const result = await authManager.resetPassword(email);
            
            ui.showForm('reset-success');
            const resetMessage = document.getElementById('resetSuccessMessage');
            if (resetMessage) {
                resetMessage.textContent = `Ссылка для сброса пароля отправлена на ${email}`;
            }
            
            ui.showNotification(result.message, 'success');
            
        } catch (error) {
            console.error('Ошибка сброса пароля:', error);
            
            let errorMessage = 'Не удалось отправить письмо';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Пользователь с таким email не найден';
            }
            
            ui.showAlert(errorMessage, 'error', 'resetErrorAlert');
            
        } finally {
            ui.hideLoading();
            ui.enableButton('resetPasswordBtn');
        }
    });
    
    // ========== ПЕРЕКЛЮЧЕНИЕ ВИДИМОСТИ ПАРОЛЯ ==========
    document.getElementById('togglePassword')?.addEventListener('click', function() {
        togglePasswordVisibility('password', this);
    });
    
    document.getElementById('toggleConfirmPassword')?.addEventListener('click', function() {
        togglePasswordVisibility('confirmPassword', this);
    });
    
    document.getElementById('toggleLoginPassword')?.addEventListener('click', function() {
        togglePasswordVisibility('loginPassword', this);
    });
    
    function togglePasswordVisibility(inputId, button) {
        const input = document.getElementById(inputId);
        const icon = button.querySelector('i');
        
        if (!input || !icon) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
    
    // ========== ПРОВЕРКА НИКНЕЙМА В РЕАЛЬНОМ ВРЕМЕНИ ==========
    document.getElementById('username')?.addEventListener('input', function() {
        const username = this.value.trim();
        const statusEl = document.getElementById('usernameStatus');
        
        if (!statusEl) return;
        
        if (username.length < 3) {
            statusEl.innerHTML = '';
            ui.clearFieldState('username');
            return;
        }
        
        statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        statusEl.className = 'username-status checking';
        
        utils.debounce('username-check', async () => {
            const validation = security.validateUsername(username);
            
            if (!validation.valid) {
                statusEl.innerHTML = '<i class="fas fa-times"></i>';
                statusEl.className = 'username-status taken';
                ui.showFieldError('username', validation.message);
                return;
            }
            
            // Проверка в базе данных
            if (window.firebaseDB?.db) {
                try {
                    const { db, collection, query, where, getDocs } = window.firebaseDB;
                    const usersRef = collection(db, "users");
                    const q = query(usersRef, where("username", "==", username.toLowerCase()));
                    const querySnapshot = await getDocs(q);
                    
                    if (!querySnapshot.empty) {
                        statusEl.innerHTML = '<i class="fas fa-times"></i>';
                        statusEl.className = 'username-status taken';
                        ui.showFieldError('username', 'Это имя уже занято');
                        return;
                    }
                } catch (error) {
                    console.warn('Не удалось проверить никнейм:', error);
                }
            }
            
            statusEl.innerHTML = '<i class="fas fa-check"></i>';
            statusEl.className = 'username-status available';
            ui.showFieldSuccess('username', 'Имя доступно');
            
        }, 500);
    });
    
    // ========== ПРОВЕРКА ПАРОЛЯ В РЕАЛЬНОМ ВРЕМЕНИ ==========
    document.getElementById('password')?.addEventListener('input', function() {
        const password = this.value;
        const validation = security.validatePassword(password);
        
        updatePasswordStrengthUI(validation);
    });
    
    function updatePasswordStrengthUI(validation) {
        const bars = ['bar1', 'bar2', 'bar3', 'bar4'].map(id => document.getElementById(id));
        const label = document.getElementById('strengthLabel');
        
        // Сброс
        bars.forEach(bar => { if (bar) bar.className = 'bar'; });
        
        // Заполнение
        for (let i = 0; i < validation.score; i++) {
            if (bars[i]) bars[i].classList.add(`active-${validation.score}`);
        }
        
        // Текст
        if (label) {
            label.textContent = validation.message;
        }
    }
    
    // ========== ПОДСЧЁТ СИМВОЛОВ В НИКНЕЙМЕ ==========
    document.getElementById('username')?.addEventListener('input', function() {
        const count = this.value.length;
        const counter = document.getElementById('usernameCounter');
        if (counter) {
            counter.textContent = `${count}/${CONFIG.usernameMaxLength}`;
        }
    });
    
    // ========== ПОДСКАЗКИ EMAIL ==========
    initEmailSuggestions();
    
    function initEmailSuggestions() {
        const emailInput = document.getElementById('email');
        const suggestionsDiv = document.getElementById('emailSuggestions');
        
        if (!emailInput || !suggestionsDiv) return;
        
        emailInput.addEventListener('input', function() {
            const value = this.value.trim();
            const atIndex = value.indexOf('@');
            
            if (atIndex === -1 && value.length > 0) {
                const suggestions = EMAIL_WHITELIST.allowed
                    .slice(0, 5)
                    .map(domain => `
                        <div class="suggestion-item" data-email="${value}@${domain}">
                            <i class="fas fa-envelope"></i> ${value}@${domain}
                        </div>
                    `).join('');
                
                suggestionsDiv.innerHTML = suggestions;
                suggestionsDiv.classList.add('show');
            } else {
                suggestionsDiv.classList.remove('show');
            }
        });
        
        suggestionsDiv.addEventListener('click', function(e) {
            const item = e.target.closest('.suggestion-item');
            if (item && emailInput) {
                emailInput.value = item.dataset.email;
                suggestionsDiv.classList.remove('show');
            }
        });
        
        document.addEventListener('click', function(e) {
            if (emailInput && !emailInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                suggestionsDiv.classList.remove('show');
            }
        });
    }
    
    // ========== КНОПКА СООБЩЕНИЯ ОБ ОШИБКЕ ==========
    document.getElementById('reportErrorFooter')?.addEventListener('click', function(e) {
        e.preventDefault();
        utils.reportError();
    });
}

console.log('📱 Модуль приложения загружен');
