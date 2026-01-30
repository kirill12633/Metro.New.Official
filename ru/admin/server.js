const express = require("express");
const admin = require("firebase-admin");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cookieParser());

// 🔒 Используем GitHub Secret напрямую
// В GitHub Codespaces / Actions нужно создать Secret:
// Name: FIREBASE_SDK_ADMIN_KEY
// Value: полный JSON ключа service account
const serviceAccount = JSON.parse(process.env.FIREBASE_SDK_ADMIN_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Раздаём страницы
app.use("/admin/login", express.static(path.join(__dirname, "admin/login")));

// Middleware для проверки сессии
function checkAuth(req, res, next) {
  const sessionCookie = req.cookies.session || "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => next())
    .catch(() => res.redirect("/admin/login/index.html"));
}

// Защищаем search
app.use("/admin/search", checkAuth, express.static(path.join(__dirname, "admin/search")));

// POST /login — создаём сессию
app.post("/login", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "Нет токена" });

  try {
    // Сессия на 1 день
    const expiresIn = 60 * 60 * 24 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    res.cookie("session", sessionCookie, {
      httpOnly: true, // защищено от JS
      secure: true,   // на HTTPS
      maxAge: expiresIn,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: "Не удалось создать сессию" });
  }
});

// API поиска пользователя
app.get("/api/search", checkAuth, async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Введите email" });

  try {
    const user = await admin.auth().getUserByEmail(email);
    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
  } catch (err) {
    res.status(404).json({ error: "Пользователь не найден" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
