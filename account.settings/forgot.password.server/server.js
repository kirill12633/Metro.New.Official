const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(cors());
app.use(express.json());

// Настройка почты
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});

// Отправка кода
app.post('/send-code', async (req, res) => {
    const { email, code } = req.body;
    
    try {
        await transporter.sendMail({
            from: 'Метро New <noreply@metro.new>',
            to: email,
            subject: 'Код восстановления',
            html: `<h2>Ваш код: ${code}</h2><p>Введите его на сайте</p>`
        });
        
        res.json({ success: true, message: 'Код отправлен' });
    } catch (error) {
        res.json({ success: false, message: 'Ошибка отправки' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Сервер восстановления запущен на порту ${process.env.PORT}`);
});
