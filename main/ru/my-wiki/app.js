// ==========================
// Wiki App - Firebase + Google Login + App Check
// ==========================

// -------------------------
// Логгер на странице
// -------------------------
function log(msg) {
    const box = document.getElementById("log");
    if (!box) return;
    const time = new Date().toLocaleTimeString();
    box.innerHTML += `[${time}] ${msg}<br>`;
    box.scrollTop = box.scrollHeight;
}

// -------------------------
// Включаем App Check Debug mode
// -------------------------
self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

// -------------------------
// Firebase config
// -------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
  authDomain: "metro-new-85226.firebaseapp.com",
  databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
  projectId: "metro-new-85226",
  storageBucket: "metro-new-85226.firebasestorage.app",
  messagingSenderId: "905640751733",
  appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// -------------------------
// App Check
// -------------------------
const appCheck = firebase.appCheck();
appCheck.activate('unused', true); // ключ не нужен для Debug mode
log("App Check Debug mode включён");

// -------------------------
// Настройка persistence для GitHub Pages
// -------------------------
auth.setPersistence(firebase.auth.Auth.Persistence.NONE)
    .then(() => log("Persistence: NONE"))
    .catch(e => log("Persistence error: " + e.message));

// -------------------------
// Кнопка Google Login
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
    log("Страница загружена.");

    const googleBtn = document.getElementById("googleLogin");
    if (!googleBtn) {
        log("⚠️ Кнопка входа не найдена");
        return;
    }

    googleBtn.onclick = async () => {
        log("▶ Открываю окно Google Login...");
        const provider = new firebase.auth.GoogleAuthProvider();

        try {
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            log("✅ Вход успешен");
            log("Email: " + user.email);

            // Сохраняем пользователя в wikiUsers
            const userRef = db.collection("wikiUsers").doc(user.uid);
            await userRef.set({
                email: user.email,
                role: "user", // по умолчанию
                lastLogin: new Date(),
                ip: "auto"
            }, { merge: true });

            log("Пользователь записан в Firestore");
            // Перейти на wiki.html
            window.location.href = "wiki.html";
        } catch (err) {
            log("❌ Ошибка входа:");
            log(err.message);
            log("Код ошибки: " + err.code);
        }
    };
});

// -------------------------
// Проверка статуса авторизации
// -------------------------
auth.onAuthStateChanged(user => {
    if (user) {
        log("✔ Пользователь авторизован: " + user.email);
    } else {
        log("✖ Пользователь НЕ авторизован.");
    }
});
