// ===== Firebase config =====
const firebaseConfig = {
  apiKey: "AIzaSyAVSAXTU1VqF36GJA1pQOfxRxo3_ixW7F4",
  authDomain: "metro-new-admin.firebaseapp.com",
  projectId: "metro-new-admin",
  storageBucket: "metro-new-admin.firebasestorage.app",
  messagingSenderId: "769002010414",
  appId: "1:769002010414:web:bdeb93a7eddc4cab63ecbf"
};

// ===== Init Firebase =====
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ===== LOGIN FUNCTION (GLOBAL!) =====
window.login = function () {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorBox = document.getElementById("error");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    errorBox.innerText = "Введите email и пароль";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((cred) => {
      return db.collection("users").doc(cred.user.uid).get();
    })
    .then((doc) => {
      if (!doc.exists) {
        throw "Пользователь не найден в базе";
      }

      const role = doc.data().role;

      if (role !== "moder" && role !== "admin") {
        throw "Нет доступа";
      }

      // ✅ доступ разрешён
      window.location.href = "dashboard.html";
    })
    .catch((err) => {
      console.error(err);
      errorBox.innerText = typeof err === "string" ? err : "Ошибка входа";
    });
};
