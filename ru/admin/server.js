const express = require("express");
const admin = require("firebase-admin");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cookieParser());

// JSON ключ из GitHub Secret
const serviceAccount = JSON.parse(process.env.FIREBASE_SDK_ADMIN_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware сессии
function checkAuth(req, res, next) {
  const sessionCookie = req.cookies.session || '';
  admin.auth().verifySessionCookie(sessionCookie, true)
    .then(() => next())
    .catch(() => res.status(401).send('Unauthorized'));
}

// Статика
app.use("/admin/login", express.static(path.join(__dirname, "admin/login")));
app.use("/admin/search", checkAuth, express.static(path.join(__dirname, "admin/search")));

// Получение всех пользователей
app.get("/api/users", checkAuth, async (req, res) => {
  const users = [];
  let result = await admin.auth().listUsers(1000); // максимум 1000 пользователей
  result.users.forEach(u => {
    users.push({
      email: u.email,
      providers: u.providerData.map(p => p.providerId),
      createdAt: u.metadata.creationTime,
      lastSignIn: u.metadata.lastSignInTime,
      uid: u.uid
    });
  });
  res.json(users);
});

// Деактивация
app.post("/api/deactivate", checkAuth, async (req, res) => {
  const uid = req.query.uid;
  if (!uid) return res.status(400).send("UID не указан");
  try {
    await admin.auth().updateUser(uid, { disabled: true });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Сброс пароля
app.post("/api/reset-password", checkAuth, async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).send("Email не указан");
  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    // TODO: отправить на почту через nodemailer или другой сервис
    console.log("Ссылка для сброса пароля:", link);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
