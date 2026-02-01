// Конфигурация
const CONFIG = {
    WORKER_URL: 'https://metro-new-auth.kirilltyr123.workers.dev',
    RECAPTCHA_KEY: '6LfgAZkrAAAAAOOU9svqDc-yVa23p4BRbEfElYJ-',
    MAX_ATTEMPTS: 5,
    BLOCK_TIME: 5 * 60 * 1000,
    IP_API: 'https://api.ipify.org?format=json',
    SECURITY_THRESHOLD: 0.5
};

// Состояние приложения
const state = {
    userIP: null,
    attempts: 0,
    isBlocked: false,
    blockEndTime: null,
    securityScore: 0,
    recaptchaToken: null,
    isLoading: false,
    mouseMovements: 0,
    reactionTime: null,
    currentToken: null,
    userData: null,
    isVerified: false,
    mouseMonitor: null,
    lastActivity: Date.now()
};

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Запуск системы Discord авторизации...');
    
    try {
        // Инициализация состояния
        await initState();
        
        // Проверка блокировки
        checkBlockStatus();
        
        // Проверка токена из URL
        checkUrlToken();
        
        // Инициализация интерфейса
        initUI();
        
        // Запуск мониторинга безопасности
        startSecurityMonitoring();
        
        console.log('✅ Система готова к работе');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        showNotification('Ошибка инициализации системы', 'error');
    }
});

// Инициализация состояния
async function initState() {
    // Получаем IP
    state.userIP = await getClientIP();
    console.log('🌐 IP пользователя:', state.userIP);
    
    // Загружаем историю
    state.attempts = parseInt(localStorage.getItem('discord_auth_attempts') || '0');
    
    // Загружаем сохраненные данные
    const savedData = localStorage.getItem('discord_verification_data');
    if (savedData) {
        try {
            state.userData = JSON.parse(savedData);
            state.isVerified = true;
            showUserInfo(state.userData);
            updateStatus('verified', 'Аккаунт верифицирован', 'badge-success');
        } catch (e) {
            console.warn('Ошибка загрузки сохраненных данных:', e);
        }
    }
}

// Инициализация интерфейса
function initUI() {
    // Элементы DOM
    window.elements = {
        statusSection: document.getElementById('statusSection'),
        statusIcon: document.getElementById('statusIcon'),
        statusTitle: document.getElementById('statusTitle'),
        statusText: document.getElementById('statusText'),
        statusBadge: document.getElementById('statusBadge'),
        tokenSection: document.getElementById('tokenSection'),
        tokenInput: document.getElementById('tokenInput'),
        verifyTokenBtn: document.getElementById('verifyTokenBtn'),
        userInfoSection: document.getElementById('userInfoSection'),
        userInfoGrid: document.getElementById('userInfoGrid'),
        startAuthBtn: document.getElementById('startAuthBtn'),
        securityCheckBtn: document.getElementById('securityCheckBtn'),
        securityPanel: document.getElementById('securityPanel'),
        securityProgress: document.getElementById('securityProgress'),
        securityMetrics: document.getElementById('securityMetrics'),
        loadingSection: document.getElementById('loadingSection'),
        loadingTitle: document.getElementById('loadingTitle'),
        loadingText: document.getElementById('loadingText'),
        notification: document.getElementById('notification'),
        notificationText: document.getElementById('notificationText')
    };

    // Обработчики событий
    elements.startAuthBtn.addEventListener('click', startDiscordAuth);
    elements.securityCheckBtn.addEventListener('click', runSecurityCheck);
    elements.verifyTokenBtn.addEventListener('click', verifyTokenHandler);
    elements.tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') elements.verifyTokenBtn.click();
    });

    // Мониторинг мыши для безопасности
    startMouseMonitoring();
}

// Основные функции авторизации
async function startDiscordAuth() {
    if (state.isBlocked) {
        showBlockedModal();
        return;
    }

    if (state.isLoading) return;

    try {
        // Проверка безопасности
        await runSecurityCheck();
        
        // Если security score низкий, показываем предупреждение
        if (state.securityScore < CONFIG.SECURITY_THRESHOLD) {
            showModal('errorModal', 'Низкий уровень безопасности. Попробуйте снова.');
            return;
        }

        // Увеличиваем счетчик попыток
        state.attempts++;
        localStorage.setItem('discord_auth_attempts', state.attempts);
        
        // Проверяем лимит попыток
        if (state.attempts >= CONFIG.MAX_ATTEMPTS) {
            blockUser('Слишком много попыток авторизации');
            return;
        }

        // Получаем reCAPTCHA токен
        showLoading('Подготовка авторизации...');
        const recaptchaToken = await getRecaptchaToken('discord_auth');
        
        // Создаем сессию
        const sessionId = generateSessionId();
        sessionStorage.setItem('auth_session_id', sessionId);
        sessionStorage.setItem('auth_timestamp', Date.now());
        sessionStorage.setItem('security_score', state.securityScore);

        // Сохраняем попытку
        await saveAuthAttempt({
            sessionId,
            ip: state.userIP,
            securityScore: state.securityScore,
            recaptchaToken,
            timestamp: new Date().toISOString(),
            action: 'discord_auth_start'
        });

        // Перенаправляем на Discord OAuth
        const authUrl = `${CONFIG.WORKER_URL}/login?` + new URLSearchParams({
            session: sessionId,
            ip: state.userIP,
            recaptcha: recaptchaToken,
            score: state.securityScore.toFixed(2),
            ua: encodeURIComponent(navigator.userAgent)
        }).toString();

        showNotification('Перенаправление на Discord...', 'success');
        
        setTimeout(() => {
            window.location.href = authUrl;
        }, 1000);

    } catch (error) {
        console.error('Ошибка авторизации:', error);
        showNotification('Ошибка авторизации: ' + error.message, 'error');
        hideLoading();
    }
}

// Проверка токена верификации
async function verifyTokenHandler() {
    const token = elements.tokenInput.value.trim();
    
    if (!validateTokenFormat(token)) {
        showNotification('Неверный формат токена! Используйте: verify-discord-XXXXXXXXXX', 'error');
        return;
    }

    await verifyToken(token);
}

// Проверка безопасности
async function runSecurityCheck() {
    try {
        showLoading('Проверка безопасности...');
        
        // Сбрасываем счетчик
        state.securityScore = 0.5;
        state.mouseMovements = 0;
        
        // Проверка поведения мыши
        await analyzeMouseBehavior();
        updateSecurityMetric('mouse', 'Поведение мыши', state.mouseMovements > 10 ? 'Хорошо' : 'Подозрительно');
        
        // Проверка времени реакции
        await testReactionTime();
        updateSecurityMetric('reaction', 'Время реакции', state.reactionTime ? `${state.reactionTime}мс` : 'Ошибка');
        
        // Проверка reCAPTCHA
        try {
            const recaptchaToken = await getRecaptchaToken('security_check');
            state.recaptchaToken = recaptchaToken;
            updateSecurityMetric('recaptcha', 'reCAPTCHA v3', '✓ Проверен');
            state.securityScore += 0.2;
        } catch (e) {
            updateSecurityMetric('recaptcha', 'reCAPTCHA v3', '✗ Ошибка');
        }
        
        // Проверка браузера
        checkBrowserFeatures();
        
        // Итоговый расчет
        calculateFinalSecurityScore();
        
        // Показываем панель безопасности
        showSecurityPanel();
        
        // Если score высокий - показываем успех
        if (state.securityScore > 0.7) {
            showNotification('✅ Проверка безопасности пройдена успешно!', 'success');
        }
        
        hideLoading();
        
    } catch (error) {
        console.error('Ошибка проверки безопасности:', error);
        showNotification('Ошибка проверки безопасности', 'error');
        hideLoading();
    }
}

// Остальные функции из предыдущего кода...
// (Все вспомогательные функции остаются здесь)
