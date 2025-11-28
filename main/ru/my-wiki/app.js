// -------------------------
// Логгер
function log(msg) {
    const box = document.getElementById("log");
    if (!box) return;
    const time = new Date().toLocaleTimeString();
    box.innerHTML += `[${time}] ${msg}<br>`;
    box.scrollTop = box.scrollHeight;
}

// -------------------------
// Debug mode
self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

// -------------------------
// Firebase config
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
const appCheck = firebase.appCheck();
appCheck.activate('unused', true);
log("App Check Debug mode включён");

// -------------------------
// Persistence
auth.setPersistence(firebase.auth.Auth.Persistence.NONE)
    .then(() => log("Persistence: NONE"))
    .catch(e => log("Persistence error: " + e.message));

// -------------------------
// Google Login
document.addEventListener("DOMContentLoaded", () => {
    const googleBtn = document.getElementById("googleLogin");
    if (!googleBtn) return;

    googleBtn.onclick = async () => {
        log("▶ Открываю Google Login...");
        const provider = new firebase.auth.GoogleAuthProvider();

        try {
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            log("✅ Вход успешен: " + user.email);

            // Сохраняем пользователя
            await db.collection("wikiUsers").doc(user.uid).set({
                email: user.email,
                role: "user",
                lastLogin: new Date(),
                ip: "auto"
            }, { merge: true });

            log("Пользователь сохранён в Firestore");
            window.location.href = "wiki.html";
        } catch (err) {
            log("❌ Ошибка входа: " + err.message + " (код: " + err.code + ")");
        }
    };
});

// -------------------------
// Проверка авторизации
auth.onAuthStateChanged(user => {
    if (user) log("✔ Пользователь авторизован: " + user.email);
    else log("✖ Пользователь НЕ авторизован");
});
