// ----------------------------------------------------------
//  ЛОГГЕР — открытый вывод событий на страницу
// ----------------------------------------------------------
function log(msg) {
    const box = document.getElementById("log");
    if (!box) return;

    const time = new Date().toLocaleTimeString();
    box.innerHTML += `[${time}] ${msg}<br>`;
    box.scrollTop = box.scrollHeight;
}

// ----------------------------------------------------------
//  Инициализация Firebase
// ----------------------------------------------------------
log("Инициализация Firebase...");

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

// ----------------------------------------------------------
//  Установка локальной сессии (важно для GitHub Pages)
// ----------------------------------------------------------
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => log("Persistence установлен: LOCAL"))
  .catch(err => log("Ошибка persistence: " + err.message));

// ----------------------------------------------------------
//  КНОПКА ВХОДА GOOGLE
// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    log("Страница загружена.");

    const googleBtn = document.getElementById("googleLogin");
    if (!googleBtn) {
        log("⚠️ Кнопка входа не найдена");
        return;
    }

    googleBtn.onclick = () => {
        log("Открываю окно Google Login...");

        const provider = new firebase.auth.GoogleAuthProvider();

        auth.signInWithPopup(provider)
            .then(result => {
                const user = result.user;
                log("✅ Вход выполнен!");
                log("Email: " + user.email);

                // Сохраняем пользователя в базе wikiUsers
                const userRef = db.collection("wikiUsers").doc(user.uid);

                userRef.set({
                    email: user.email,
                    role: "user",        // по умолчанию
                    lastLogin: new Date(),
                    ip: "auto"
                }, { merge: true })
                .then(() => {
                    log("Пользователь записан в Firestore.");
                    log("Переход в wiki.html...");

                    // Переход
                    window.location.href = "wiki.html";
                })
                .catch(err => {
                    log("Ошибка записи Firestore: " + err.message);
                });
            })
            .catch(error => {
                log("❌ Ошибка входа: " + error.message);
            });
    };
});

// ----------------------------------------------------------
//  ПРОВЕРКА СТАТУСА АВТОРИЗАЦИИ
// ----------------------------------------------------------
auth.onAuthStateChanged(user => {
    if (user) {
        log("✔ Пользователь авторизован: " + user.email);
    } else {
        log("✖ Пользователь НЕ авторизован.");
    }
});
