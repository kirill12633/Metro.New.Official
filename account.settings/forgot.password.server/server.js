// 📄 forgot.password.server/server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(cors());
app.use(express.json());

// Тестовый маршрут
app.get('/test', (req, res) => {
    res.json({ message: 'Сервер работает! ✅', status: 'OK' });
});

// Отправка кода
app.post('/send-code', async (req, res) => {
    const { email, code } = req.body;
    
    console.log('📧 Запрос на отправку кода:', email, 'Код:', code);
    
    // Всегда успех для теста
    res.json({ 
        success: true, 
        message: 'Код отправлен (тест)',
        test_code: code,
        email: email
    });
});

app.listen(3001, () => {
    console.log('🚀 Сервер запущен на http://localhost:3001');
    console.log('✅ Тест: http://localhost:3001/test');
});
