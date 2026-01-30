import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js";

// Конфиг Firebase
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
const app = initializeApp(firebaseConfig);

// App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LfgAZkrAAAAAOOU9svqDc-yVa23p4BRbEfElYJ-'),
  isTokenAutoRefreshEnabled: true
});

// Функция поиска пользователя
window.searchUser = async function () {
  const email = document.getElementById("searchInput").value;

  try {
    const res = await fetch(`/api/search?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    document.getElementById("result").textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById("result").textContent = err.message;
  }
}
