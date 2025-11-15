// 📄 forgot.password.server/server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(cors());
app.use(express.json());

// Настройка почты Gmail
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'metro.new.help@gmail.com',
        pass: 'abcd efgh ijkl mnop' // Пароль приложения Gmail
    }
});

// Тестовый маршрут
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Сервер Метро New работает! ✅', 
        status: 'OK',
        email: 'metro.new.help@gmail.com'
    });
});

// Отправка кода восстановления
app.post('/send-code', async (req, res) => {
    const { email, code } = req.body;
    
    console.log('📧 Отправка кода:', email, 'Код:', code);
    
    try {
        // Отправляем реальный email
        await transporter.sendMail({
            from: 'Метро New <metro.new.help@gmail.com>',
            to: email,
            subject: 'Код восстановления пароля - Метро New',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0;">🚇 Метро New</h1>
                        <p style="margin: 10px 0 0 0;">Восстановление пароля</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">Ваш код восстановления</h2>
                        <p>Для восстановления пароля используйте следующий код:</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                            <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #667eea;">
                                ${code}
                            </div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            Код действителен в течение 15 минут. Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.
                        </p>
                    </div>
                    
                    <div style="padding: 20px; text-align: center; background: #eee; color: #666; font-size: 12px;">
                        <p>© 2025 Метро New. Все права защищены.</p>
                    </div>
                </div>
            `
        });
        
        console.log('✅ Email отправлен на:', email);
        res.json({ 
            success: true, 
            message: 'Код отправлен на ваш email',
            email: email
        });
        
    } catch (error) {
        console.error('❌ Ошибка отправки email:', error);
        res.json({ 
            success: false, 
            message: 'Ошибка отправки email',
            error: error.message
        });
    }
});

// Проверка здоровья сервера
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Metro New Password Recovery',
        timestamp: new Date().toISOString()
    });
});

app.listen(3001, () => {
    console.log('🚀 Сервер восстановления пароля запущен!');
    console.log('📍 Порт: 3001');
    console.log('📧 Email: metro.new.help@gmail.com');
    console.log('✅ Тест: http://localhost:3001/test');
    console.log('❤️  Health: http://localhost:3001/health');
});
