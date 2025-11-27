// ===== Firebase config =====
const firebaseConfig = {
  apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
  authDomain: "metro-new-85226.firebaseapp.com",
  databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
  projectId: "metro-new-85226",
  storageBucket: "metro-new-85226.firebasestorage.app",
  messagingSenderId: "905640751733",
  appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== Авторизация =====
function login() {
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
}

function logout() {
  auth.signOut();
}

// Проверяем авторизацию
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('auth')?.style.display = 'none';
    document.getElementById('actions')?.style.display = 'block';

    // Создаём запись пользователя, если нет
    db.collection("wikiUsers").doc(user.uid).get().then(doc => {
      if (!doc.exists) {
        db.collection("wikiUsers").doc(user.uid).set({
          email: user.email,
          role: "user"  // по умолчанию user
        });
      }
    });
  } else {
    document.getElementById('auth')?.style.display = 'block';
    document.getElementById('actions')?.style.display = 'none';
  }
});

// ===== Создание новой страницы =====
async function createPage() {
  const pageName = document.getElementById('newPageName').value.trim();
  if (!pageName) return alert("Введите название страницы");

  const user = auth.currentUser;
  if (!user) return alert("Сначала войдите");

  const ip = await getUserIP();

  db.collection("wikiPages").doc(pageName).set({
    content: "",
    createdBy: user.email,
    editedBy: user.email,
    timestamp: Date.now(),
    ip: ip
  }).then(() => {
    alert("Страница создана!");
    window.location.href = `wiki.html?page=${encodeURIComponent(pageName)}`;
  });
}

// ===== Загрузка страницы =====
async function loadPage() {
  const params = new URLSearchParams(window.location.search);
  const pageName = params.get("page");
  if (!pageName) return;

  document.getElementById("pageTitle").innerText = pageName;

  const doc = await db.collection("wikiPages").doc(pageName).get();
  if (doc.exists) {
    document.getElementById("content").value = doc.data().content;
  } else {
    document.getElementById("content").value = "";
  }

  const user = auth.currentUser;
  if (user) {
    // Проверяем роль
    const roleDoc = await db.collection("wikiUsers").doc(user.uid).get();
    const role = roleDoc.data()?.role;
    if (["admin","moderator"].includes(role)) {
      document.getElementById("wikiControls").style.display = "block";
    }
  }
}

// ===== Сохранение страницы =====
async function savePage() {
  const user = auth.currentUser;
  if (!user) return alert("Войдите чтобы редактировать");

  const pageName = document.getElementById("pageTitle").innerText;
  const content = document.getElementById("content").value;
  const ip = await getUserIP();

  const roleDoc = await db.collection("wikiUsers").doc(user.uid).get();
  const role = roleDoc.data()?.role;
  if (!["admin","moderator"].includes(role)) {
    return alert("У вас нет прав редактировать страницу");
  }

  db.collection("wikiPages").doc(pageName).update({
    content: content,
    editedBy: user.email,
    timestamp: Date.now(),
    ip: ip
  }).then(() => alert("Сохранено!"));
}

// ===== Удаление страницы =====
async function deletePage() {
  const user = auth.currentUser;
  if (!user) return alert("Войдите чтобы удалять");

  const pageName = document.getElementById("pageTitle").innerText;
  const roleDoc = await db.collection("wikiUsers").doc(user.uid).get();
  const role = roleDoc.data()?.role;
  if (role !== "admin") return alert("Только админ может удалять");

  db.collection("wikiPages").doc(pageName).delete().then(() => {
    alert("Страница удалена!");
    window.location.href = "index.html";
  });
}

// ===== Получение внешнего IP =====
async function getUserIP() {
  try {
    const resp = await fetch("https://api.ipify.org?format=json");
    const data = await resp.json();
    return data.ip;
  } catch {
    return "unknown";
  }
}
