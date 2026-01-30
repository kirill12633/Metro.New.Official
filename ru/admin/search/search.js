import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
  authDomain: "metro-new-85226.firebaseapp.com",
  databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
  projectId: "metro-new-85226",
  storageBucket: "metro-new-85226.firebasestorage.app",
  messagingSenderId: "905640751733",
  appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

const app = initializeApp(firebaseConfig);

// App Check
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LfgAZkrAAAAAOOU9svqDc-yVa23p4BRbEfElYJ-'),
  isTokenAutoRefreshEnabled: true
});

// Загрузка всех пользователей
async function loadUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();
  const table = document.getElementById('userTable');
  table.innerHTML = '';
  
  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.email || ''}</td>
      <td>${user.providers.join(', ')}</td>
      <td>${new Date(user.createdAt).toLocaleString()}</td>
      <td>${new Date(user.lastSignIn).toLocaleString()}</td>
      <td>${user.uid}</td>
      <td>
        <button onclick="deactivateUser('${user.uid}')">Деактивировать</button>
        <button onclick="sendPasswordReset('${user.email}')">Сброс пароля</button>
      </td>
    `;
    table.appendChild(row);
  });
}

window.loadUsers = loadUsers;

// Деактивация пользователя
window.deactivateUser = async function(uid) {
  if (!confirm('Деактивировать пользователя?')) return;
  const res = await fetch(`/api/deactivate?uid=${uid}`, { method: 'POST' });
  if (res.ok) alert('Пользователь деактивирован');
  else alert('Ошибка');
  loadUsers();
}

// Отправка сброса пароля
window.sendPasswordReset = async function(email) {
  const res = await fetch(`/api/reset-password?email=${encodeURIComponent(email)}`, { method: 'POST' });
  if (res.ok) alert('Ссылка для сброса пароля отправлена');
  else alert('Ошибка');
}
