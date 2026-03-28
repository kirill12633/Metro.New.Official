import { auth, db } from '../../config/firebase.js';
import { validateEmail, validateUsername, validatePassword, validateAge } from '../utils/validators.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import crypto from 'crypto';

// @desc    Проверка доступности username
// @route   POST /api/auth/check-username
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const validation = validateUsername(username);
    
    if (!validation.valid) {
      return res.json({ available: false, message: validation.message });
    }
    
    // Проверка в Firestore
    const usersRef = db.collection('users_public');
    const query = await usersRef.where('username', '==', username.toLowerCase()).limit(1).get();
    
    if (!query.empty) {
      return res.json({ available: false, message: 'Это имя пользователя занято' });
    }
    
    res.json({ available: true, message: 'Имя доступно' });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Ошибка проверки' });
  }
};

// @desc    Регистрация пользователя
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { 
      firstName, 
      username, 
      email, 
      password, 
      birthDay, 
      birthMonth, 
      birthYear, 
      marketingConsent 
    } = req.body;
    
    // Валидация
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.message, field: 'email' });
    }
    
    const usernameCheck = validateUsername(username);
    if (!usernameCheck.valid) {
      return res.status(400).json({ error: usernameCheck.message, field: 'username' });
    }
    
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message, field: 'password' });
    }
    
    const ageCheck = validateAge(birthDay, birthMonth, birthYear);
    if (!ageCheck.valid) {
      return res.status(400).json({ error: ageCheck.message, field: 'birthDate' });
    }
    
    // Проверка существования username в Firestore
    const usersRef = db.collection('users_public');
    const usernameQuery = await usersRef.where('username', '==', username.toLowerCase()).limit(1).get();
    if (!usernameQuery.empty) {
      return res.status(400).json({ error: 'Никнейм уже занят', field: 'username' });
    }
    
    // Создание пользователя в Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: firstName,
        emailVerified: false
      });
    } catch (authError) {
      if (authError.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: 'Email уже зарегистрирован', field: 'email' });
      }
      throw authError;
    }
    
    // Генерация токена для email верификации
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Сохранение данных в Firestore
    const userData = {
      uid: userRecord.uid,
      firstName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      birthDate: { day: parseInt(birthDay), month: parseInt(birthMonth), year: parseInt(birthYear) },
      age: ageCheck.age,
      marketingConsent: marketingConsent || false,
      emailVerified: false,
      verificationToken,
      verificationExpires: admin.firestore.Timestamp.fromDate(verificationExpires),
      status: 'pending_verification',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastIP: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    await db.collection('users_public').doc(userRecord.uid).set(userData);
    
    // Отправка письма подтверждения
    await sendVerificationEmail(email, firstName, verificationToken);
    
    res.status(201).json({
      success: true,
      user: {
        uid: userRecord.uid,
        firstName,
        username,
        email,
        emailVerified: false
      },
      message: 'Аккаунт создан. Проверьте email для подтверждения.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Ошибка сервера. Попробуйте позже.' });
  }
};

// @desc    Подтверждение email
// @route   POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Токен не указан' });
    }
    
    // Поиск пользователя по токену
    const usersRef = db.collection('users_public');
    const query = await usersRef.where('verificationToken', '==', token).limit(1).get();
    
    if (query.empty) {
      return res.status(400).json({ error: 'Неверный или просроченный токен' });
    }
    
    const userDoc = query.docs[0];
    const userData = userDoc.data();
    
    // Проверка срока действия
    if (userData.verificationExpires && userData.verificationExpires.toDate() < new Date()) {
      return res.status(400).json({ error: 'Токен просрочен. Запросите новый.' });
    }
    
    // Обновление в Firebase Auth
    await auth.updateUser(userData.uid, {
      emailVerified: true
    });
    
    // Обновление в Firestore
    await userDoc.ref.update({
      emailVerified: true,
      status: 'active',
      verificationToken: admin.firestore.FieldValue.delete(),
      verificationExpires: admin.firestore.FieldValue.delete(),
      emailVerifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Email подтвержден!' });
    
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Ошибка подтверждения' });
  }
};

// @desc    Вход пользователя
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }
    
    // Аутентификация через Firebase Auth (REST API)
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.error?.message === 'EMAIL_NOT_FOUND' || data.error?.message === 'INVALID_PASSWORD') {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }
      if (data.error?.message === 'USER_DISABLED') {
        return res.status(403).json({ error: 'Аккаунт заблокирован' });
      }
      return res.status(401).json({ error: 'Ошибка входа' });
    }
    
    // Получение данных пользователя из Firestore
    const userDoc = await db.collection('users_public').doc(data.localId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const userData = userDoc.data();
    
    // Проверка подтверждения email
    if (!userData.emailVerified && !data.emailVerified) {
      return res.status(403).json({ 
        error: 'Email не подтвержден', 
        requiresVerification: true,
        email
      });
    }
    
    // Обновление данных входа
    await userDoc.ref.update({
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      lastIP: req.ip,
      loginCount: admin.firestore.FieldValue.increment(1)
    });
    
    res.json({
      success: true,
      user: {
        uid: data.localId,
        firstName: userData.firstName,
        username: userData.username,
        email: userData.email,
        emailVerified: userData.emailVerified
      },
      token: data.idToken,
      refreshToken: data.refreshToken
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// @desc    Отправка ссылки для сброса пароля
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Введите email' });
    }
    
    // Поиск пользователя
    const usersRef = db.collection('users_public');
    const query = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
    
    if (query.empty) {
      // Для безопасности не говорим, что email не найден
      return res.json({ success: true, message: 'Если аккаунт существует, письмо отправлено' });
    }
    
    const userDoc = query.docs[0];
    const userData = userDoc.data();
    
    // Генерация токена сброса
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    
    await userDoc.ref.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: admin.firestore.Timestamp.fromDate(resetExpires)
    });
    
    // Отправка письма
    await sendPasswordResetEmail(email, userData.firstName, resetToken);
    
    res.json({ success: true, message: 'Ссылка для сброса пароля отправлена на email' });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// @desc    Сброс пароля
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Недостаточно данных' });
    }
    
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }
    
    // Поиск пользователя по токену
    const usersRef = db.collection('users_public');
    const query = await usersRef.where('resetPasswordToken', '==', token).limit(1).get();
    
    if (query.empty) {
      return res.status(400).json({ error: 'Неверный или просроченный токен' });
    }
    
    const userDoc = query.docs[0];
    const userData = userDoc.data();
    
    // Проверка срока действия
    if (userData.resetPasswordExpires && userData.resetPasswordExpires.toDate() < new Date()) {
      return res.status(400).json({ error: 'Токен просрочен' });
    }
    
    // Обновление пароля в Firebase Auth
    await auth.updateUser(userData.uid, {
      password: newPassword
    });
    
    // Удаление токена
    await userDoc.ref.update({
      resetPasswordToken: admin.firestore.FieldValue.delete(),
      resetPasswordExpires: admin.firestore.FieldValue.delete(),
      passwordUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Пароль успешно изменен' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Ошибка сброса пароля' });
  }
};

// @desc    Повторная отправка письма подтверждения
// @route   POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const usersRef = db.collection('users_public');
    const query = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
    
    if (query.empty) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const userDoc = query.docs[0];
    const userData = userDoc.data();
    
    if (userData.emailVerified) {
      return res.status(400).json({ error: 'Email уже подтвержден' });
    }
    
    // Новый токен
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await userDoc.ref.update({
      verificationToken: newToken,
      verificationExpires: admin.firestore.Timestamp.fromDate(newExpires)
    });
    
    await sendVerificationEmail(email, userData.firstName, newToken);
    
    res.json({ success: true, message: 'Письмо отправлено повторно' });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Ошибка отправки' });
  }
};
