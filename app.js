<script type="module">
  // Подключаем Firebase через CDN
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

  // Конфигурация Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyCi2bgSNDjqTM5UoY_ep9Hn54kCaHouF74",
    authDomain: "metro-c2eb7.firebaseapp.com",
    projectId: "metro-c2eb7",
    storageBucket: "metro-c2eb7.firebasestorage.app",
    messagingSenderId: "307692086177",
    appId: "1:307692086177:web:1e5892b19fa484386ea1e0",
    measurementId: "G-M9GRVZTZ9K"
  };

  // Инициализация Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // ======================
  // Функции для сайта
  // ======================

  // Регистрация
  export async function register(email, password) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // После регистрации сразу на личную страницу
      window.location.href = "profile.html";
    } catch (error) {
      alert(error.message);
    }
  }

  // Вход
  export async function login(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "profile.html";
    } catch (error) {
      alert(error.message);
    }
  }

  // Выход
  export async function logout() {
    await signOut(auth);
    window.location.href = "login.html";
  }

  // Проверка авторизации на личной странице
  export function checkAuth(profileCallback, redirectUrl = "login.html") {
    onAuthStateChanged(auth, user => {
      if (!user) {
        // Если не авторизован, редирект на вход
        window.location.href = redirectUrl;
      } else {
        // Если авторизован, вызываем callback с пользователем
        profileCallback(user);
      }
    });
  }

  // Делаем функции доступными глобально для HTML
  window.myFirebase = { register, login, logout, checkAuth, auth };
</script>
