import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { registerLimiter, loginLimiter, usernameCheckLimiter, emailLimiter } from './middleware/rateLimiter.js';
import * as authController from './controllers/authController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Маршруты
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Проверка username
app.post('/api/auth/check-username', usernameCheckLimiter, authController.checkUsername);

// Регистрация
app.post('/api/auth/register', registerLimiter, authController.register);

// Подтверждение email
app.post('/api/auth/verify-email', authController.verifyEmail);

// Вход
app.post('/api/auth/login', loginLimiter, authController.login);

// Забыли пароль
app.post('/api/auth/forgot-password', emailLimiter, authController.forgotPassword);

// Сброс пароля
app.post('/api/auth/reset-password', authController.resetPassword);

// Повторная отправка подтверждения
app.post('/api/auth/resend-verification', emailLimiter, authController.resendVerification);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
