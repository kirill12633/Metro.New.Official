import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Конфиг
const firebaseConfig = {
  apiKey: "AIzaSyCi2bgSNDjqTM5UoY_ep9Hn54kCaHouF74",
  authDomain: "metro-c2eb7.firebaseapp.com",
  projectId: "metro-c2eb7",
  storageBucket: "metro-c2eb7.appspot.com",
  messagingSenderId: "307692086177",
  appId: "1:307692086177:web:1e5892b19fa484386ea1e0",
  measurementId: "G-M9GRVZTZ9K"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Регистрация ---
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Регистрация успешна!");
      window.location.href = "login.html";
    } catch (error) {
      alert("Ошибка: " + error.message);
    }
  });
}

// --- Вход ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "profile.html"; // После входа -> профиль
    } catch (error) {
      alert("Ошибка входа: " + error.message);
    }
  });
}

// --- Профиль ---
if (window.location.pathname.endsWith("profile.html")) {
  const userEmailEl = document.getElementById("userEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmailEl.textContent = "Вы вошли как: " + user.email;
    } else {
      // Если не авторизован — обратно на вход
      window.location.href = "login.html";
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}
