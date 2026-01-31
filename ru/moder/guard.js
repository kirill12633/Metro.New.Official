// ===== Проверка, что firebaseConfig определён =====
if (!window.firebaseConfig) {
  console.error("firebaseConfig не определён! Добавь config.js перед guard.js");
}

// ===== Инициализация Firebase (если ещё не инициализировано) =====
if (!firebase.apps.length) {
  firebase.initializeApp(window.firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ===== Проверка доступа на dashboard =====
auth.onAuthStateChanged(user => {
  if (!user) {
    // Пользователь не вошёл → редирект на вход
    window.location.href = "index.html";
    return;
  }

  // Получаем документ пользователя из Firestore
  db.collection("users").doc(user.uid).get()
    .then(doc => {
      if (!doc.exists) {
        throw "Пользователь не найден в базе!";
      }

      const role = doc.data().role;

      // Только moder или admin могут остаться на dashboard
      if (role !== "moder" && role !== "admin") {
        throw "Нет доступа!";
      }

      console.log("Доступ разрешён. Роль:", role);
    })
    .catch(err => {
      console.error(err);
      // Нет доступа → редирект
      window.location.href = "index.html";
    });
});

// ===== Функция выхода =====
window.logout = function () {
  auth.signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error("Ошибка выхода:", err);
    });
};
