// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ===== Конфигурация Firebase =====
const firebaseConfig = {
  apiKey: "AIzaSyCi2bgSNDjqTM5UoY_ep9Hn54kCaHouF74",
  authDomain: "metro-c2eb7.firebaseapp.com",
  projectId: "metro-c2eb7",
  storageBucket: "metro-c2eb7.firebasestorage.app",
  messagingSenderId: "307692086177",
  appId: "1:307692086177:web:1e5892b19fa484386ea1e0",
  measurementId: "G-M9GRVZTZ9K"
};

// ===== Инициализация Firebase =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ===== Функции для работы с пользователями =====

// Регистрация нового пользователя
export async function register(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "profile.html"; // редирект после регистрации
  } catch (error) {
    alert(error.message);
  }
}

// Вход существующего пользователя
export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "profile.html"; // редирект после входа
  } catch (error) {
    alert(error.message);
  }
}

// Выход пользователя
export async function logout() {
  await signOut(auth);
  window.location.href = "login.html"; // редирект после выхода
}

// Проверка авторизации на личной странице
export function checkAuth(profileCallback, redirectUrl = "login.html") {
  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = redirectUrl; // если не авторизован
    } else {
      profileCallback(user); // вызываем callback с пользователем
    }
  });
}

// Делаем функции доступными глобально
window.myFirebase = { register, login, logout, checkAuth, auth };
