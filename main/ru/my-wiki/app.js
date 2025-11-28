// ===== Firebase config (твой реальный) =====
const firebaseConfig = {
  apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
  authDomain: "metro-new-85226.firebaseapp.com",
  databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
  projectId: "metro-new-85226",
  storageBucket: "metro-new-85226.firebasestorage.app",
  messagingSenderId: "905640751733",
  appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

// ===== Инициализация Firebase =====
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== Авторизация через Google =====
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

function logout() {
  auth.signOut();
}

// ===== Получение IP =====
async function getUserIP() {
  try {
    const resp = await fetch("https://api.ipify.org?format=json");
    const data = await resp.json();
    return data.ip;
  } catch (e) {
    return "unknown";
  }
}

// ===== Обработчик смены авторизации =====
auth.onAuthStateChanged(async (user) => {
  const authBlock = document.getElementById('auth');
  const actionsBlock = document.getElementById('actions');
  const userInfo = document.getElementById('userInfo');
  const emailSpan = document.getElementById('userEmail');
  const roleSpan = document.getElementById('userRole');

  if (!user) {
    // Не авторизован
    if (authBlock) authBlock.style.display = 'block';
    if (actionsBlock) actionsBlock.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    return;
  }

  // Авторизован
  if (authBlock) authBlock.style.display = 'none';
  if (userInfo) userInfo.style.display = 'block';

  // Создаём запись о пользователе, если её ещё нет
  const userRef = db.collection("wikiUsers").doc(user.uid);
  const snap = await userRef.get();
  if (!snap.exists) {
    await userRef.set({
      email: user.email,
      role: "user" // по умолчанию
    });
  }

  // Читаем актуальную роль
  const userData = (await userRef.get()).data();
  const role = userData.role || "user";

  if (emailSpan) emailSpan.textContent = user.email;
  if (roleSpan) roleSpan.textContent = role;

  // На index.html – показываем блок действий
  if (actionsBlock) {
    actionsBlock.style.display = 'block';
  }

  // На wiki.html – если есть wikiControls, проверяем роль
  const wikiControls = document.getElementById("wikiControls");
  if (wikiControls && ["admin", "moderator"].includes(role)) {
    wikiControls.style.display = "block";
  }
});

// ===== Список страниц на index.html =====
async function loadPageList() {
  const listElem = document.getElementById("pageList");
  if (!listElem) return;

  listElem.innerHTML = "...загружаю страницы...";

  const snap = await db.collection("wikiPages").orderBy("timestamp", "desc").get();
  listElem.innerHTML = "";

  if (snap.empty) {
    listElem.innerHTML = "<li>Пока нет страниц</li>";
    return;
  }

  snap.forEach(doc => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `wiki.html?page=${encodeURIComponent(doc.id)}`;
    a.textContent = doc.id;
    li.appendChild(a);
    listElem.appendChild(li);
  });
}

// ===== Создание новой страницы (index.html) =====
async function createPage() {
  const input = document.getElementById('newPageName');
  if (!input) return;

  const pageName = input.value.trim();
  if (!pageName) {
    alert("Введите название страницы");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Сначала войдите через Google");
    return;
  }

  const ip = await getUserIP();

  await db.collection("wikiPages").doc(pageName).set({
    content: "",
    createdBy: user.email,
    editedBy: user.email,
    timestamp: Date.now(),
    ip: ip
  });

  window.location.href = `wiki.html?page=${encodeURIComponent(pageName)}`;
}

// ===== Загрузка страницы wiki (wiki.html) =====
async function loadWikiPage() {
  const params = new URLSearchParams(window.location.search);
  const pageName = params.get("page");
  if (!pageName) return;

  const titleElem = document.getElementById("pageTitle");
  const viewContent = document.getElementById("viewContent");
  const editArea = document.getElementById("content");

  if (titleElem) titleElem.textContent = pageName;

  const doc = await db.collection("wikiPages").doc(pageName).get();
  if (!doc.exists) {
    const text = "Страница ещё не существует (но файл для неё уже можно сохранить).";
    if (viewContent) viewContent.textContent = text;
    if (editArea) editArea.value = "";
    return;
  }

  const data = doc.data();
  if (viewContent) viewContent.textContent = data.content || "";
  if (editArea) editArea.value = data.content || "";
}

// ===== Сохранение страницы (wiki.html, только moderator/admin) =====
async function savePage() {
  const user = auth.currentUser;
  if (!user) {
    alert("Войдите, чтобы редактировать");
    return;
  }

  // проверяем роль
  const userRef = db.collection("wikiUsers").doc(user.uid);
  const snap = await userRef.get();
  const role = snap.data()?.role || "user";

  if (!["admin", "moderator"].includes(role)) {
    alert("У вас нет прав редактировать эту страницу");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const pageName = params.get("page");
  if (!pageName) return;

  const editArea = document.getElementById("content");
  if (!editArea) return;

  const ip = await getUserIP();

  await db.collection("wikiPages").doc(pageName).set({
    content: editArea.value,
    editedBy: user.email,
    timestamp: Date.now(),
    ip: ip
  }, { merge: true });

  alert("Сохранено");
  const viewContent = document.getElementById("viewContent");
  if (viewContent) viewContent.textContent = editArea.value;
}

// ===== Удаление страницы (только admin) =====
async function deletePage() {
  const user = auth.currentUser;
  if (!user) {
    alert("Войдите, чтобы удалять");
    return;
  }

  const userRef = db.collection("wikiUsers").doc(user.uid);
  const snap = await userRef.get();
  const role = snap.data()?.role || "user";

  if (role !== "admin") {
    alert("Только admin может удалять страницы");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const pageName = params.get("page");
  if (!pageName) return;

  if (!confirm(`Точно удалить страницу "${pageName}"?`)) return;

  await db.collection("wikiPages").doc(pageName).delete();
  alert("Страница удалена");
  window.location.href = "index.html";
}
