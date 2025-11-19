// Firebase config (ПОМЕНЯЙ КЛЮЧИ!)
const firebaseConfig = {
  apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
  authDomain: "metro-new-85226.firebaseapp.com",
  projectId: "metro-new-85226",
  storageBucket: "metro-new-85226.firebasestorage.app",
  messagingSenderId: "905640751733",
  appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

// Инициализация Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Простая капча
function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

// Добавляем капчу на страницу
function setupCaptcha() {
    const container = document.getElementById('captchaContainer');
    if (!container) return null;
    
    let currentCaptcha = generateCaptcha();
    
    container.innerHTML = `
        <div class="captcha-container">
            <label>Введите код с картинки:</label>
            <div class="captcha-code">${currentCaptcha}</div>
            <input type="text" id="captchaInput" placeholder="Введите код" required>
            <button type="button" class="refresh-btn" onclick="refreshCaptcha()">🔄 Обновить</button>
        </div>
    `;
    
    return currentCaptcha;
}

// Обновление капчи
function refreshCaptcha() {
    const container = document.getElementById('captchaContainer');
    if (container) {
        setupCaptcha();
    }
}

// Проверка капчи
function validateCaptcha() {
    const input = document.getElementById('captchaInput');
    const container = document.getElementById('captchaContainer');
    
    if (!input || !container) return true; // Если капчи нет, пропускаем
    
    const userInput = input.value.toUpperCase();
    const captchaText = container.querySelector('.captcha-code').textContent;
    
    return userInput === captchaText;
}

// Логика для страницы входа
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    let currentCaptcha = setupCaptcha();
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Проверяем капчу
        if (!validateCaptcha()) {
            alert('❌ Неверный код капчи! Попробуйте еще раз.');
            refreshCaptcha();
            return;
        }
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            alert('✅ Вход успешен!');
            window.location.href = 'profile.html';
        } catch (error) {
            alert('❌ Ошибка входа: ' + error.message);
            refreshCaptcha(); // Обновляем капчу при ошибке
        }
    });
}

// Проверка авторизации
auth.onAuthStateChanged((user) => {
    console.log('Статус авторизации:', user ? 'вошел' : 'не вошел');
});
