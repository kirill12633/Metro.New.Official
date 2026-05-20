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
    var firebaseReady = await initFirebase();
    
    if (!firebaseReady) {
        console.warn('⚠️ Firebase не инициализирован');
    }
    
    // Заполнение дат
    utils.fillDateSelectors();
    
    // Копирайт
    utils.updateCopyrightYear();
    
    // Ссылки
    setConfigLinks();
    
    // Обработчики
    initEventHandlers();
    
    // Восстановление email
    var rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        var loginEmail = document.getElementById('loginEmail');
        if (loginEmail) loginEmail.value = rememberedEmail;
        var rememberMe = document.getElementById('rememberMe');
        if (rememberMe) rememberMe.checked = true;
    }
    
    console.log('✅ Приложение готово');
});

// Установка ссылок
function setConfigLinks() {
    var links = {
        'termsLink': CONFIG.termsUrl,
        'privacyLink': CONFIG.privacyUrl,
        'helpLink': CONFIG.helpUrl,
        'supportLink': 'https://kirill12633.github.io/support.metro.new/',
        'goToParentPageBtn': CONFIG.parentsUrl,
        'goToLoginBtn': CONFIG.loginUrl,
        'backToLoginBtn': CONFIG.loginUrl
    };
    
    for (var id in links) {
        var el = document.getElementById(id);
        if (el && links[id]) {
            if (el.tagName === 'A') el.href = links[id];
            else if (el.tagName === 'BUTTON') el.onclick = function() { window.open(links[id], '_blank'); };
        }
    }
}

// Обработчики
function initEventHandlers() {
    
    // Шаг 1 -> 2
    var nextStep1 = document.getElementById('nextStep1');
    if (nextStep1) {
        nextStep1.addEventListener('click', async function(e) {
            e.preventDefault();
            
            var firstName = document.getElementById('firstName').value.trim();
            var username = document.getElementById('username').value.trim();
            var birthDay = document.getElementById('birthDay').value;
            var birthMonth = document.getElementById('birthMonth').value;
            var birthYear = document.getElementById('birthYear').value;
            
            // Проверка имени
            var nameCheck = security.validateName(firstName);
            if (!nameCheck.valid) {
                document.getElementById('firstNameHint').textContent = nameCheck.message;
                document.getElementById('firstNameHint').className = 'form-hint error';
                return;
            }
            document.getElementById('firstNameHint').textContent = 'Отлично!';
            document.getElementById('firstNameHint').className = 'form-hint success';
            
            // Проверка никнейма
            var usernameCheck = security.validateUsername(username);
            if (!usernameCheck.valid) {
                document.getElementById('usernameHint').textContent = usernameCheck.message;
                document.getElementById('usernameHint').className = 'form-hint error';
                return;
            }
            
            // Проверка в базе
            if (window.firebaseDB && window.firebaseDB.db) {
                try {
                    var db = window.firebaseDB.db;
                    var doc = window.firebaseDB.doc;
                    var getDoc = window.firebaseDB.getDoc;
                    
                    var usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
                    if (usernameDoc.exists()) {
                        document.getElementById('usernameHint').textContent = 'Имя занято';
                        document.getElementById('usernameHint').className = 'form-hint error';
                        return;
                    }
                } catch(err) {}
            }
            
            document.getElementById('usernameHint').textContent = 'Имя доступно';
            document.getElementById('usernameHint').className = 'form-hint success';
            
            // Проверка даты
            if (!birthDay || !birthMonth || !birthYear) {
                document.getElementById('birthDayHint').textContent = 'Выберите дату';
                document.getElementById('birthDayHint').className = 'form-hint error';
                return;
            }
            
            var ageData = security.calculateAge(birthDay, birthMonth, birthYear);
            if (!ageData.canRegister) {
                // Показ ограничения
                document.querySelectorAll('.form-container').forEach(function(f) { f.classList.remove('active'); });
                document.getElementById('ageRestrictionScreen').classList.add('active');
                
                var yearsLeft = 13 - ageData.age;
                var word = 'лет';
                if (yearsLeft === 1) word = 'год';
                else if (yearsLeft < 5) word = 'года';
                
                document.getElementById('ageRestrictionMessage').innerHTML = 
                    'Тебе ' + ageData.age + ' лет. Регистрация с 13 лет.<br><br>' +
                    '<strong>Вернись через ' + yearsLeft + ' ' + word + '</strong>';
                return;
            }
            
            // Переход к шагу 2
            document.querySelectorAll('.registration-step').forEach(function(s) { s.classList.remove('active'); });
            document.getElementById('step2').classList.add('active');
            document.getElementById('progressFill').style.width = '66%';
            
            var steps = document.querySelectorAll('.step');
            steps[0].classList.add('completed');
            steps[1].classList.add('active');
            steps[0].classList.remove('active');
        });
    }
    
    // Шаг 2 -> 3
    var nextStep2 = document.getElementById('nextStep2');
    if (nextStep2) {
        nextStep2.addEventListener('click', function(e) {
            e.preventDefault();
            
            var email = document.getElementById('email').value.trim();
            var password = document.getElementById('password').value;
            var confirmPassword = document.getElementById('confirmPassword').value;
            
            // Проверка email
            var emailCheck = security.validateEmail(email);
            if (!emailCheck.valid) {
                document.getElementById('emailHint').textContent = emailCheck.message;
                document.getElementById('emailHint').className = 'form-hint error';
                return;
            }
            document.getElementById('emailHint').textContent = 'Email принят';
            document.getElementById('emailHint').className = 'form-hint success';
            
            // Проверка пароля
            var passCheck = security.validatePassword(password);
            if (!passCheck.valid) {
                document.getElementById('passwordHint').textContent = 'Слабый пароль: ' + passCheck.requirements.join(', ');
                document.getElementById('passwordHint').className = 'form-hint error';
                return;
            }
            document.getElementById('passwordHint').textContent = 'Надёжность: ' + passCheck.message;
            document.getElementById('passwordHint').className = 'form-hint success';
            
            // Совпадение паролей
            if (password !== confirmPassword) {
                document.getElementById('confirmPasswordHint').textContent = 'Пароли не совпадают';
                document.getElementById('confirmPasswordHint').className = 'form-hint error';
                return;
            }
            document.getElementById('confirmPasswordHint').textContent = 'Пароли совпадают';
            document.getElementById('confirmPasswordHint').className = 'form-hint success';
            
            // Сводка
            var firstName = document.getElementById('firstName').value;
            var username = document.getElementById('username').value;
            var birthDay = document.getElementById('birthDay').value;
            var birthMonth = document.getElementById('birthMonth').value;
            var birthYear = document.getElementById('birthYear').value;
            var ageData = security.calculateAge(birthDay, birthMonth, birthYear);
            
            var months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
            
            document.getElementById('userDataSummary').innerHTML = 
                '👤 <strong>' + firstName + '</strong> (@' + username + ')<br>' +
                '📧 ' + email + '<br>' +
                '📅 ' + birthDay + ' ' + months[parseInt(birthMonth)-1] + ' ' + birthYear + ' (' + ageData.age + ' лет)<br>' +
                '🏷️ Группа: ' + ageData.group;
            
            // Переход к шагу 3
            document.querySelectorAll('.registration-step').forEach(function(s) { s.classList.remove('active'); });
            document.getElementById('step3').classList.add('active');
            document.getElementById('progressFill').style.width = '100%';
            
            var steps = document.querySelectorAll('.step');
            steps[0].classList.add('completed');
            steps[1].classList.add('completed');
            steps[2].classList.add('active');
        });
    }
    
    // Назад из шага 2
    var prevStep2 = document.getElementById('prevStep2');
    if (prevStep2) {
        prevStep2.addEventListener('click', function() {
            document.querySelectorAll('.registration-step').forEach(function(s) { s.classList.remove('active'); });
            document.getElementById('step1').classList.add('active');
            document.getElementById('progressFill').style.width = '33%';
            
            var steps = document.querySelectorAll('.step');
            steps[0].classList.add('active');
            steps[1].classList.remove('active', 'completed');
        });
    }
    
    // Назад из шага 3
    var prevStep3 = document.getElementById('prevStep3');
    if (prevStep3) {
        prevStep3.addEventListener('click', function() {
            document.querySelectorAll('.registration-step').forEach(function(s) { s.classList.remove('active'); });
            document.getElementById('step2').classList.add('active');
            document.getElementById('progressFill').style.width = '66%';
            
            var steps = document.querySelectorAll('.step');
            steps[1].classList.add('active');
            steps[2].classList.remove('active', 'completed');
        });
    }
    
    // Отмена
    var cancelBtn = document.getElementById('cancelRegistration');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('Отменить регистрацию?')) {
                window.location.href = CONFIG.homeUrl;
            }
        });
    }
    
    // Отправка регистрации
    var submitBtn = document.getElementById('submitRegistration');
    if (submitBtn) {
        submitBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!document.getElementById('agreeTerms').checked) {
                alert('Примите пользовательское соглашение');
                return;
            }
            
            var userData = {
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                firstName: document.getElementById('firstName').value.trim(),
                username: document.getElementById('username').value.trim(),
                birthDay: document.getElementById('birthDay').value,
                birthMonth: document.getElementById('birthMonth').value,
                birthYear: document.getElementById('birthYear').value,
                marketingConsent: document.getElementById('marketingConsent') ? document.getElementById('marketingConsent').checked : false
            };
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание...';
                
                var result = await authManager.register(userData);
                
                // Успех
                document.querySelectorAll('.form-container').forEach(function(f) { f.classList.remove('active'); });
                document.getElementById('successScreen').classList.add('active');
                document.getElementById('successMessage').innerHTML = 
                    'Аккаунт создан!<br><small>Письмо отправлено на <strong>' + userData.email + '</strong></small>';
                
                // Таймер повторной отправки
                startResendTimer();
                
            } catch (error) {
                alert('Ошибка: ' + (error.message || 'Попробуйте позже'));
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Создать аккаунт';
            }
        });
    }
    
    // Переключение форм
    var showLoginLink = document.getElementById('showLoginLink');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.form-container').forEach(function(f) { f.classList.remove('active'); });
            document.getElementById('loginForm').classList.add('active');
        });
    }
    
    var showRegisterLink = document.getElementById('showRegisterLink');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.form-container').forEach(function(f) { f.classList.remove('active'); });
            document.getElementById('registerForm').classList.add('active');
        });
    }
    
    var forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.form-container').forEach(function(f) { f.classList.remove('active'); });
            document.getElementById('resetPasswordForm').classList.add('active');
        });
    }
    
    var cancelReset = document.getElementById('cancelResetBtn');
    if (cancelReset) {
        cancelReset.addEventListener('click', function() {
            document.querySelectorAll('.form-container').forEach(function(f) { f.classList.remove('active'); });
            document.getElementById('loginForm').classList.add('active');
        });
    }
    
    var backAge = document.getElementById('backFromAgeRestriction');
    if (backAge) {
        backAge.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.form-container').forEach(function(f) { f.classList.remove('active'); });
            document.getElementById('registerForm').classList.add('active');
            document.querySelectorAll('.registration-step').forEach(function(s) { s.classList.remove('active'); });
            document.getElementById('step1').classList.add('active');
        });
    }
    
    // Вход
    var loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            var email = document.getElementById('loginEmail').value.trim();
            var password = document.getElementById('loginPassword').value;
            var rememberMe = document.getElementById('rememberMe').checked;
            
            if (!email || !password) {
                alert('Заполните все поля');
                return;
            }
            
            try {
                var loginBtn = document.getElementById('loginBtn');
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
                
                var result = await authManager.login(email, password, rememberMe);
                
                alert('✅ ' + result.message);
                setTimeout(function() { window.location.href = CONFIG.homeUrl; }, 1000);
                
            } catch (error) {
                alert('Ошибка: ' + (error.message || 'Неверный email или пароль'));
            } finally {
                var loginBtn = document.getElementById('loginBtn');
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
            }
        });
    }
    
    // Google вход
    var googleReg = document.getElementById('googleRegisterBtn');
    var googleLogin = document.getElementById('googleLoginBtn');
    
    async function googleAuth() {
        try {
            var result = await authManager.loginWithGoogle();
            alert('✅ ' + result.message);
            setTimeout(function() { window.location.href = CONFIG.homeUrl; }, 1000);
        } catch (error) {
            alert('Ошибка Google входа');
        }
    }
    
    if (googleReg) googleReg.addEventListener('click', googleAuth);
    if (googleLogin) googleLogin.addEventListener('click', googleAuth);
    
    // Сброс пароля
    var resetForm = document.getElementById('resetPasswordFormElement');
    if (resetForm) {
        resetForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            var email = document.getElementById('resetEmail').value.trim();
            if (!email) { alert('Введите email'); return; }
            
            try {
                var resetBtn = document.getElementById('resetPasswordBtn');
                resetBtn.disabled = true;
                resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
                
                var result = await authManager.resetPassword(email);
                
                document.querySelectorAll('.form-container').forEach(function(f) { f.classList.remove('active'); });
                document.getElementById('resetSuccessScreen').classList.add('active');
                document.getElementById('resetSuccessMessage').textContent = 'Письмо отправлено на ' + email;
                
            } catch (error) {
                alert('Ошибка: ' + (error.message || 'Не удалось отправить'));
            } finally {
                var resetBtn = document.getElementById('resetPasswordBtn');
                resetBtn.disabled = false;
                resetBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить ссылку';
            }
        });
    }
    
    // Переключение видимости пароля
    function togglePassword(inputId, btn) {
        var input = document.getElementById(inputId);
        var icon = btn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
    
    var togglePass = document.getElementById('togglePassword');
    if (togglePass) togglePass.addEventListener('click', function() { togglePassword('password', this); });
    
    var toggleConfirm = document.getElementById('toggleConfirmPassword');
    if (toggleConfirm) toggleConfirm.addEventListener('click', function() { togglePassword('confirmPassword', this); });
    
    var toggleLogin = document.getElementById('toggleLoginPassword');
    if (toggleLogin) toggleLogin.addEventListener('click', function() { togglePassword('loginPassword', this); });
    
    // Проверка никнейма при вводе
    var usernameInput = document.getElementById('username');
    if (usernameInput) {
        var checkTimeout;
        usernameInput.addEventListener('input', function() {
            var username = this.value.trim();
            var statusEl = document.getElementById('usernameStatus');
            var counter = document.getElementById('usernameCounter');
            
            if (counter) counter.textContent = username.length + '/20';
            
            if (username.length < 3) {
                if (statusEl) { statusEl.innerHTML = ''; statusEl.className = 'username-status'; }
                return;
            }
            
            if (statusEl) { statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; statusEl.className = 'username-status checking'; }
            
            clearTimeout(checkTimeout);
            checkTimeout = setTimeout(async function() {
                var check = security.validateUsername(username);
                if (!check.valid) {
                    if (statusEl) { statusEl.innerHTML = '<i class="fas fa-times"></i>'; statusEl.className = 'username-status taken'; }
                    return;
                }
                
                if (window.firebaseDB && window.firebaseDB.db) {
                    try {
                        var db = window.firebaseDB.db;
                        var doc = window.firebaseDB.doc;
                        var getDoc = window.firebaseDB.getDoc;
                        var usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
                        
                        if (usernameDoc.exists()) {
                            if (statusEl) { statusEl.innerHTML = '<i class="fas fa-times"></i>'; statusEl.className = 'username-status taken'; }
                            return;
                        }
                    } catch(err) {}
                }
                
                if (statusEl) { statusEl.innerHTML = '<i class="fas fa-check"></i>'; statusEl.className = 'username-status available'; }
            }, 500);
        });
    }
    
    // Проверка пароля при вводе
    var passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            var check = security.validatePassword(this.value);
            
            var bars = ['bar1','bar2','bar3','bar4'];
            bars.forEach(function(id) {
                var bar = document.getElementById(id);
                if (bar) bar.className = 'bar';
            });
            
            for (var i = 0; i < check.score; i++) {
                var bar = document.getElementById(bars[i]);
                if (bar) bar.className = 'bar active-' + Math.min(4, check.score);
            }
            
            var label = document.getElementById('strengthLabel');
            if (label) label.textContent = check.message;
        });
    }
    
    // Подсказки email
    var emailInput = document.getElementById('email');
    var suggestionsDiv = document.getElementById('emailSuggestions');
    
    if (emailInput && suggestionsDiv) {
        emailInput.addEventListener('input', function() {
            var value = this.value.trim();
            var atIndex = value.indexOf('@');
            
            if (atIndex === -1 && value.length > 0) {
                var domains = EMAIL_WHITELIST.allowed.slice(0, 5);
                var html = '';
                for (var i = 0; i < domains.length; i++) {
                    html += '<div class="suggestion-item" data-email="' + value + '@' + domains[i] + '">' +
                        '<i class="fas fa-envelope"></i> ' + value + '@' + domains[i] + '</div>';
                }
                suggestionsDiv.innerHTML = html;
                suggestionsDiv.classList.add('show');
            } else {
                suggestionsDiv.classList.remove('show');
            }
        });
        
        suggestionsDiv.addEventListener('click', function(e) {
            var item = e.target.closest('.suggestion-item');
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
}

// Таймер повторной отправки
function startResendTimer() {
    var btn = document.getElementById('resendEmailBtn');
    var text = document.getElementById('resendTimerText');
    if (!btn || !text) return;
    
    var seconds = 60;
    btn.disabled = true;
    
    var timer = setInterval(function() {
        seconds--;
        text.textContent = 'Отправить повторно (' + seconds + 'с)';
        
        if (seconds <= 0) {
            clearInterval(timer);
            btn.disabled = false;
            text.textContent = 'Отправить повторно';
            
            btn.onclick = async function() {
                try {
                    await authManager.resendVerification();
                    alert('✅ Письмо отправлено!');
                    startResendTimer();
                } catch(err) {
                    alert('Ошибка отправки');
                }
            };
        }
    }, 1000);
}

console.log('📱 Модуль приложения загружен');
