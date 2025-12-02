// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
  authDomain: "metro-new-85226.firebaseapp.com",
  databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
  projectId: "metro-new-85226",
  storageBucket: "metro-new-85226.firebasestorage.app",
  messagingSenderId: "905640751733",
  appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

// Инициализация Firebase
const app = firebase.initializeApp(firebaseConfig);

// Сервисы
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const functions = firebase.functions();

// Настройка App Check (твой App Check включен)
try {
    const appCheck = firebase.appCheck();
    // App Check автоматически определит твой сайт
    console.log("App Check инициализирован");
} catch (error) {
    console.log("App Check не настроен:", error);
}

// reCAPTCHA конфигурация
const recaptchaConfig = {
    siteKey: '6Ld9uw0sAAAAAMTSxQ9Vxd0LhEcwweHGF-DWdZIo',
    action: 'homepage'
};

// Инициализация приложения
async function initializeApp() {
    try {
        // Проверяем reCAPTCHA
        await loadRecaptcha();
        
        // Проверяем авторизацию
        await checkAuthState();
        
        console.log("Приложение инициализировано");
    } catch (error) {
        console.error("Ошибка инициализации:", error);
    }
}

// Загрузка reCAPTCHA
async function loadRecaptcha() {
    return new Promise((resolve) => {
        grecaptcha.ready(() => {
            grecaptcha.execute(recaptchaConfig.siteKey, {action: 'homepage'})
                .then(token => {
                    window.recaptchaToken = token;
                    resolve(token);
                });
        });
    });
}

// Экспорт
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;
window.firebaseFunctions = functions;
