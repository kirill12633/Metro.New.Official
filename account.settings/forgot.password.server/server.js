const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(cors());
app.use(express.json());

// Простой ответ для теста
app.get('/test', (req, res) => {
    res.json({ message: 'Сервер работает!', status: 'OK' });
});

// Отправка кода (упрощенная версия)
app.post('/send-code', async (req, res) => {
    const { email, code } = req.body;
    
    console.log('Получен запрос на отправку кода:', { email, code });
    
    // Всегда возвращаем успех для тестирования
    res.json({ 
        success: true, 
        message: 'Код отправлен (тестовый режим)',
        test_code: code 
    });
});

app.listen(3001, '0.0.0.0', () => {
    console.log('✅ Сервер восстановления запущен на http://localhost:3001');
});
