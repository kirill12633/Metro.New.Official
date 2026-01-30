require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Подключаем Admin SDK через GitHub Secret
const serviceAccount = JSON.parse(process.env.FIREBASE_SDK_ADMIN_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// API поиска пользователя (только для авторизованных админов)
app.get("/api/search", async (req, res) => {
  const idToken = req.headers.authorization;
  if (!idToken) return res.status(401).json({ error: "Нет токена" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Здесь можно добавить проверку, что пользователь — админ
    // Например, проверяем email или кастомный claim
    const isAdmin = decodedToken.email === "твой_админ_email@domain.com";
    if (!isAdmin) return res.status(403).json({ error: "Нет прав" });

    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Введите email" });

    const user = await admin.auth().getUserByEmail(email);
    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
});

// Отдаём фронтенд
app.use("/", express.static("."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
