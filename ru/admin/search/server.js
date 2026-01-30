require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Admin SDK ключ из GitHub Secret
const serviceAccount = JSON.parse(process.env.FIREBASE_SDK_ADMIN_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// API поиска пользователя
app.get("/api/search", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Введите email" });

  try {
    const user = await admin.auth().getUserByEmail(email);
    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (err) {
    res.status(404).json({ error: "Пользователь не найден" });
  }
});

// Отдаём фронтенд
app.use("/", express.static("."));

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
