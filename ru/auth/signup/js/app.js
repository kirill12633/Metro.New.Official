// ============================================
// ГЛАВНЫЙ ФАЙЛ ПРИЛОЖЕНИЯ
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Приложение запускается...');
    
    // Проверка поддержки браузера
    if (!utils.checkBrowserSupport()) {
        showCriticalError('Ваш браузер устарел. Пожалуйста, используйте современный браузер.');
        return;
    }
    
    // Инициализация Firebase
    const firebaseReady = await initFirebase();
    
    if (!firebaseReady) {
        console.warn('⚠️ Firebase не инициализирован, работаем в ограниченном режиме');
        ui.showNotification('Некоторые функции могут быть недоступны', 'warning', 5000);
    }
    
    // Заполнение селекторов дат
    utils.fillDateSelectors();
    
    // Обновление копирайта
    utils.updateCopyrightYear();
    
    // Установка ссылок из конфига
    setConfigLinks();
    
    // Инициализация GUI для сообщения об ошибке
    initErrorReportModal();
    
    // Инициализация обработчиков событий
    initEventHandlers();
    
    // Инициализация анализатора поведения
    initBehaviorTracking();
    
    // Восстановление сохранённого email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const loginEmailInput = document.getElementById('loginEmail');
        if (loginEmailInput) {
            loginEmailInput.value = rememberedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }
    
    console.log('✅ Приложение готово');
});

// ============================================
// КРИТИЧЕСКАЯ ОШИБКА
// ============================================
function showCriticalError(message) {
    document.body.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f8f9fa;
            font-family: 'Montserrat', sans-serif;
            padding: 20px;
        ">
            <div style="
                background: white;
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                max-width: 500px;
                width: 100%;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: #d93025;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 40px;
                    color: white;
                ">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style="color: #202124; margin-bottom: 12px;">Ошибка</h2>
                <p style="color: #5f6368; margin-bottom: 24px;">${message}</p>
                <button onclick="location.reload()" style="
                    background: #0066CC;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 16px;
                ">
                    <i class="fas fa-redo"></i> Обновить страницу
                </button>
            </div>
        </div>
    `;
}

// ============================================
// МОДАЛЬНОЕ ОКНО ДЛЯ ОТЧЁТА ОБ ОШИБКЕ
// ============================================
function initErrorReportModal() {
    // Создаём модальное окно
    const modalHTML = `
        <div id="errorReportModal" style="
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
        ">
            <div style="
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 520px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease;
                font-family: 'Montserrat', sans-serif;
            ">
                <!-- Заголовок -->
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                ">
                    <div style="
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, #FF6B6B, #d93025);
                        border-radius: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        color: white;
                        flex-shrink: 0;
                    ">
                        <i class="fas fa-bug"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: #202124; font-size: 1.3rem;">Сообщить об ошибке</h3>
                        <p style="margin: 4px 0 0; color: #5f6368; font-size: 0.85rem;">
                            Помогите нам стать лучше
                        </p>
                    </div>
                    <button onclick="closeErrorReport()" style="
                        margin-left: auto;
                        background: none;
                        border: none;
                        font-size: 24px;
                        color: #5f6368;
                        cursor: pointer;
                        padding: 4px 8px;
                        border-radius: 8px;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#f1f3f4'" onmouseout="this.style.background='none'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Форма -->
                <form id="errorReportForm" onsubmit="submitErrorReport(event)">
                    <!-- Тип проблемы -->
                    <div style="margin-bottom: 16px;">
                        <label style="
                            display: block;
                            margin-bottom: 6px;
                            font-weight: 600;
                            color: #202124;
                            font-size: 0.9rem;
                        ">
                            Тип проблемы
                        </label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            ${['🐛 Баг', '🔒 Безопасность', '💡 Идея', '❓ Другое'].map((type, i) => `
                                <label style="
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    padding: 10px 14px;
                                    border: 2px solid #dadce0;
                                    border-radius: 12px;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    font-size: 0.85rem;
                                " onmouseover="this.style.borderColor='#0066CC'" onmouseout="if(!this.querySelector('input').checked) this.style.borderColor='#dadce0'">
                                    <input type="radio" name="errorType" value="${type}" 
                                           style="accent-color: #0066CC;" 
                                           ${i === 0 ? 'checked' : ''}>
                                    ${type}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Описание -->
                    <div style="margin-bottom: 16px;">
                        <label style="
                            display: block;
                            margin-bottom: 6px;
                            font-weight: 600;
                            color: #202124;
                            font-size: 0.9rem;
                        ">
                            Опишите проблему
                        </label>
                        <textarea id="errorDescription" 
                                  placeholder="Что случилось? Что вы делали перед этим?"
                                  style="
                            width: 100%;
                            min-height: 100px;
                            padding: 12px;
                            border: 2px solid #dadce0;
                            border-radius: 12px;
                            font-family: 'Montserrat', sans-serif;
                            font-size: 0.9rem;
                            resize: vertical;
                            transition: border-color 0.2s;
                            outline: none;
                        " onfocus="this.style.borderColor='#0066CC'" onblur="this.style.borderColor='#dadce0'"></textarea>
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-top: 4px;
                        ">
                            <span style="font-size: 0.75rem; color: #5f6368;" id="charCount">0/500</span>
                            <span style="font-size: 0.75rem; color: #5f6368;">
                                <i class="fas fa-shield-alt"></i> Данные защищены
                            </span>
                        </div>
                    </div>
                    
                    <!-- Техническая информация -->
                    <details style="margin-bottom: 16px;">
                        <summary style="
                            cursor: pointer;
                            color: #0066CC;
                            font-size: 0.85rem;
                            padding: 8px;
                            border-radius: 8px;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='none'">
                            <i class="fas fa-code"></i> Техническая информация
                        </summary>
                        <div id="techInfo" style="
                            margin-top: 8px;
                            padding: 12px;
                            background: #f8f9fa;
                            border-radius: 8px;
                            font-size: 0.75rem;
                            color: #5f6368;
                            font-family: monospace;
                            max-height: 150px;
                            overflow-y: auto;
                        "></div>
                    </details>
                    
                    <!-- Кнопки -->
                    <div style="display: flex; gap: 12px;">
                        <button type="button" onclick="closeErrorReport()" style="
                            flex: 1;
                            padding: 12px;
                            border: 2px solid #dadce0;
                            border-radius: 12px;
                            background: white;
                            cursor: pointer;
                            font-family: 'Montserrat', sans-serif;
                            font-size: 0.9rem;
                            font-weight: 500;
                            color: #5f6368;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#f1f3f4'" onmouseout="this.style.background='white'">
                            Отмена
                        </button>
                        <button type="submit" style="
                            flex: 2;
                            padding: 12px;
                            border: none;
                            border-radius: 12px;
                            background: linear-gradient(135deg, #0066CC, #0052a3);
                            color: white;
                            cursor: pointer;
                            font-family: 'Montserrat', sans-serif;
                            font-size: 0.9rem;
                            font-weight: 600;
                            transition: all 0.2s;
                            box-shadow: 0 2px 8px rgba(0,102,204,0.3);
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,102,204,0.4)'" 
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,102,204,0.3)'">
                            <i class="fas fa-paper-plane"></i> Отправить
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <style>
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        </style>
    `;
    
    // Добавляем модальное окно на страницу
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Обработчик для кнопки "Сообщить об ошибке"
    document.getElementById('reportErrorFooter')?.addEventListener('click', function(e) {
        e.preventDefault();
        openErrorReport();
    });
    
    // Закрытие по клику на фон
    document.getElementById('errorReportModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeErrorReport();
        }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeErrorReport();
        }
    });
    
    // Счётчик символов
    document.getElementById('errorDescription')?.addEventListener('input', function() {
        const count = this.value.length;
        const counter = document.getElementById('charCount');
        if (counter) {
            counter.textContent = `${count}/500`;
            counter.style.color = count > 450 ? '#d93025' : count > 400 ? '#fbbc04' : '#5f6368';
        }
    });
}

// ============================================
// ОТКРЫТИЕ/ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
// ============================================
function openErrorReport() {
    const modal = document.getElementById('errorReportModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Заполняем техническую информацию
        updateTechInfo();
    }
}

function closeErrorReport() {
    const modal = document.getElementById('errorReportModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Очищаем форму
        const form = document.getElementById('errorReportForm');
        if (form) form.reset();
        
        const textarea = document.getElementById('errorDescription');
        if (textarea) textarea.value = '';
        
        const counter = document.getElementById('charCount');
        if (counter) counter.textContent = '0/500';
    }
}

// ============================================
// ОБНОВЛЕНИЕ ТЕХНИЧЕСКОЙ ИНФОРМАЦИИ
// ============================================
function updateTechInfo() {
    const techInfo = document.getElementById('techInfo');
    if (!techInfo) return;
    
    const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
    const lastErrors = errors.slice(-5).map(e => 
        `${e.timestamp}: ${e.message || 'Неизвестная ошибка'}`
    ).join('\n');
    
    techInfo.innerHTML = `
        <div style="margin-bottom: 4px;"><strong>Время:</strong> ${new Date().toLocaleString()}</div>
        <div style="margin-bottom: 4px;"><strong>URL:</strong> ${window.location.href}</div>
        <div style="margin-bottom: 4px;"><strong>Браузер:</strong> ${navigator.userAgent}</div>
        <div style="margin-bottom: 4px;"><strong>Язык:</strong> ${navigator.language}</div>
        <div style="margin-bottom: 4px;"><strong>Экран:</strong> ${screen.width}x${screen.height}</div>
        ${lastErrors ? `<div style="margin-top: 8px;"><strong>Последние ошибки:</strong><br>${lastErrors.replace(/\n/g, '<br>')}</div>` : ''}
    `;
}

// ============================================
// ОТПРАВКА ОТЧЁТА
// ============================================
async function submitErrorReport(event) {
    event.preventDefault();
    
    const errorType = document.querySelector('input[name="errorType"]:checked')?.value || '🐛 Баг';
    const description = document.getElementById('errorDescription')?.value.trim();
    
    if (!description || description.length < 10) {
        ui.showNotification('Пожалуйста, опишите проблему подробнее (минимум 10 символов)', 'warning');
        return;
    }
    
    // Показываем загрузку
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    submitBtn.disabled = true;
    
    try {
        // Сохраняем отчёт в Firestore если доступен
        if (window.firebaseDB?.db) {
            const { db, collection, addDoc, serverTimestamp } = window.firebaseDB;
            
            await addDoc(collection(db, 'error_reports'), {
                type: errorType,
                description: description,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: serverTimestamp(),
                language: navigator.language,
                screenResolution: `${screen.width}x${screen.height}`,
                errorLog: JSON.parse(localStorage.getItem('errorLog') || '[]').slice(-5)
            });
            
            ui.showNotification('✅ Спасибо! Ваш отчёт отправлен.', 'success');
            closeErrorReport();
            
        } else {
            // Если Firestore недоступен - открываем почту
            const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
            const lastErrors = errors.slice(-3).map(e => 
                `${e.timestamp}: ${e.message || 'Неизвестная ошибка'}`
            ).join('\n');
            
            const subject = encodeURIComponent(`Отчёт об ошибке: ${errorType}`);
            const body = encodeURIComponent(
                `Тип проблемы: ${errorType}\n\n` +
                `Описание:\n${description}\n\n` +
                `------------------------\n` +
                `Техническая информация:\n` +
                `URL: ${window.location.href}\n` +
                `Время: ${new Date().toLocaleString()}\n` +
                `Браузер: ${navigator.userAgent}\n` +
                `Язык: ${navigator.language}\n\n` +
                `Последние ошибки:\n${lastErrors}`
            );
            
            window.location.href = `mailto:${CONFIG.supportEmail}?subject=${subject}&body=${body}`;
        }
        
    } catch (error) {
        console.error('Ошибка отправки отчёта:', error);
        ui.showNotification('❌ Не удалось отправить отчёт. Попробуйте позже.', 'error');
        
    } finally {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ОТСЛЕЖИВАНИЯ ПОВЕДЕНИЯ
// ============================================
function initBehaviorTracking() {
    let mouseMovements = [];
    let keystrokes = [];
    const sessionStart = Date.now();
    
    document.addEventListener('mousemove', function(e) {
        mouseMovements.push({
            x: e.clientX,
            y: e.clientY,
            time: Date.now() - sessionStart
        });
        
        if (mouseMovements.length > 100) {
            mouseMovements.shift();
        }
    });
    
    document.addEventListener('keypress', function(e) {
        // Не сохраняем содержимое, только время и тип клавиши
        keystrokes.push({
            type: e.key.length === 1 ? 'character' : 'special',
            time: Date.now() - sessionStart
        });
        
        if (keystrokes.length > 50) {
            keystrokes.shift();
        }
    });
}

// ============================================
// УСТАНОВКА ССЫЛОК ИЗ КОНФИГА
// ============================================
function setConfigLinks() {
    const linkMap = {
        'termsLink': CONFIG.termsUrl,
        'privacyLink': CONFIG.privacyUrl,
        'helpLink': CONFIG.helpUrl,
        'supportLink': 'https://kirill12633.github.io/support.metro.new/',
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
        
        // Проверка никнейма в базе (если Firebase доступен)
        if (window.firebaseDB?.db) {
            try {
                const { db, collection, query, where, getDocs } = window.firebaseDB;
                const usernamesRef = collection(db, "usernames");
                const q = query(usernamesRef, where("reserved", "==", true));
                const querySnapshot = await getDocs(q);
                
                // Проверяем есть ли такой никнейм
                const exists = querySnapshot.docs.some(doc => doc.id === username.toLowerCase());
                
                if (exists) {
                    ui.showFieldError('username', 'Это имя уже занято');
                    return;
                }
            } catch (error) {
                console.warn('Не удалось проверить никнейм в базе:', error.message);
                // Не блокируем регистрацию, если база недоступна
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
        
        // Умная проверка пароля
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
            email: maskEmail(email),
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
        if (confirm('Отменить регистрацию? Все данные будут потеряны.')) {
            window.location.href = CONFIG.homeUrl;
        }
    });
    
    // ========== ОТПРАВКА РЕГИСТРАЦИИ ==========
    document.getElementById('submitRegistration')?.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Проверка согласия с условиями
        if (!document.getElementById('agreeTerms')?.checked) {
            ui.showAlert('Необходимо принять пользовательское соглашение', 'warning');
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
            ui.showRegistrationSuccess(maskEmail(userData.email));
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
            } else if (error.message.includes('permissions')) {
                errorMessage = 'Сервис временно недоступен. Попробуйте позже.';
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
            ui.showAlert('Заполните все поля', 'warning', 'loginErrorAlert');
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
            } else if (error.message.includes('permissions')) {
                errorMessage = 'Сервис временно недоступен. Попробуйте позже.';
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
            ui.showAlert('Введите email', 'warning', 'resetErrorAlert');
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
            
            // Проверка в базе данных (если доступна)
            if (window.firebaseDB?.db) {
                try {
                    const { db, doc, getDoc } = window.firebaseDB;
                    if (window.firebaseDB?.db) {
    try {
        const { db, doc, getDoc } = window.firebaseDB;  // <-- ДОЛЖЕН БЫТЬ getDoc
        const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
        
        if (usernameDoc.exists()) {
            statusEl.innerHTML = '<i class="fas fa-times"></i>';
            statusEl.className = 'username-status taken';
            ui.showFieldError('username', 'Это имя уже занято');
            return;
        }
    } catch (error) {
        console.warn('Не удалось проверить никнейм в базе:', error.message);
    }
}
                    
                    if (usernameDoc.exists()) {
                        statusEl.innerHTML = '<i class="fas fa-times"></i>';
                        statusEl.className = 'username-status taken';
                        ui.showFieldError('username', 'Это имя уже занято');
                        return;
                    }
                } catch (error) {
                    console.warn('Не удалось проверить никнейм в базе:', error.message);
                    // Продолжаем, если база недоступна
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
        const requirementsDiv = document.getElementById('passwordRequirements');
        
        // Сброс
        bars.forEach(bar => { if (bar) bar.className = 'bar'; });
        
        // Заполнение
        for (let i = 0; i < validation.score; i++) {
            if (bars[i]) bars[i].classList.add(`active-${Math.min(4, validation.score)}`);
        }
        
        // Текст
        if (label) {
            label.textContent = validation.message;
            label.style.color = validation.score >= 3 ? 'var(--success)' : 
                               validation.score >= 2 ? 'var(--warning)' : 'var(--danger)';
        }
        
        // Требования
        if (!requirementsDiv) {
            const meter = document.getElementById('passwordStrengthMeter');
            if (meter) {
                const div = document.createElement('div');
                div.id = 'passwordRequirements';
                div.style.cssText = 'margin-top: 8px; font-size: 0.75rem;';
                meter.appendChild(div);
            }
        }
        
        const reqDiv = document.getElementById('passwordRequirements');
        if (reqDiv) {
            if (validation.requirements.length > 0) {
                reqDiv.innerHTML = '<span style="color: var(--danger);">✗ ' + 
                    validation.requirements.join(', ') + '</span>';
            } else {
                reqDiv.innerHTML = '<span style="color: var(--success);">✓ Отличный пароль!</span>';
            }
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
}

console.log('📱 Модуль приложения загружен');
