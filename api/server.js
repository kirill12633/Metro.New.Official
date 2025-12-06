require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

// Конфигурация
const CONFIG = {
    discord: {
        clientId: process.env.DISCORD_CLIENT_ID || '1289899050371518476',
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI || 'https://your-api.onrender.com/api/discord/callback'
    },
    mongoUri: process.env.MONGODB_URI || 'mongodb+srv://metro_admin:o2lxi4D92JMCItdp@cluster0.nwzjrth.mongodb.net/metro_db?retryWrites=true&w=majority'
};

// Подключение к MongoDB
let db;
async function connectDB() {
    try {
        const client = new MongoClient(CONFIG.mongoUri);
        await client.connect();
        db = client.db('metro_db');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
}

// Главный endpoint для Discord OAuth
app.get('/api/discord/callback', async (req, res) => {
    try {
        const { code, error } = req.query;
        
        if (error) {
            return res.status(400).send(`
                <h2>❌ Discord Error</h2>
                <p>${error}</p>
                <button onclick="window.close()">Close</button>
            `);
        }
        
        if (!code) {
            return res.status(400).send('No authorization code provided');
        }
        
        console.log('📥 Received Discord code:', code.substring(0, 20) + '...');
        
        // 1. Обмен кода на токен Discord
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: CONFIG.discord.clientId,
                client_secret: CONFIG.discord.clientSecret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: CONFIG.discord.redirectUri,
                scope: 'identify guilds email'
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        const { access_token, refresh_token } = tokenResponse.data;
        
        // 2. Получаем данные пользователя
        const [userResponse, guildsResponse] = await Promise.all([
            axios.get('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${access_token}` }
            }),
            axios.get('https://discord.com/api/users/@me/guilds', {
                headers: { Authorization: `Bearer ${access_token}` }
            })
        ]);
        
        // 3. Формируем данные для сохранения
        const userData = {
            discord_id: userResponse.data.id,
            username: userResponse.data.username,
            discriminator: userResponse.data.discriminator,
            email: userResponse.data.email,
            avatar: userResponse.data.avatar,
            locale: userResponse.data.locale,
            verified: userResponse.data.verified,
            guilds: guildsResponse.data.map(guild => ({
                id: guild.id,
                name: guild.name,
                icon: guild.icon,
                owner: guild.owner,
                permissions: guild.permissions
            })),
            access_token: access_token,
            refresh_token: refresh_token,
            last_login: new Date(),
            ip_address: req.ip || req.headers['x-forwarded-for'],
            user_agent: req.headers['user-agent']
        };
        
        console.log('👤 User data:', userData.username, userData.email);
        
        // 4. Сохраняем в MongoDB
        if (db) {
            const usersCollection = db.collection('users');
            
            // Обновляем или создаем пользователя
            await usersCollection.updateOne(
                { discord_id: userData.discord_id },
                { $set: userData },
                { upsert: true }
            );
            
            console.log('💾 Saved to MongoDB');
        }
        
        // 5. Отправляем успешный ответ
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>✅ Verification Complete</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 50px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    .container {
                        background: rgba(255,255,255,0.1);
                        padding: 40px;
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                        display: inline-block;
                    }
                    h1 {
                        font-size: 2.5em;
                        margin-bottom: 20px;
                    }
                    .user-info {
                        background: rgba(255,255,255,0.2);
                        padding: 20px;
                        border-radius: 10px;
                        margin: 20px 0;
                    }
                    .close-btn {
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 15px 40px;
                        font-size: 1.2em;
                        border-radius: 50px;
                        cursor: pointer;
                        margin-top: 20px;
                    }
                    .close-btn:hover {
                        background: #45a049;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ Verification Complete!</h1>
                    <div class="user-info">
                        <p><strong>Username:</strong> ${userData.username}#${userData.discriminator}</p>
                        <p><strong>Email:</strong> ${userData.email || 'Not provided'}</p>
                        <p><strong>Guilds:</strong> ${userData.guilds.length}</p>
                        <p><small>Data saved to database</small></p>
                    </div>
                    <p>You can safely close this window</p>
                    <button class="close-btn" onclick="window.close()">Close Window</button>
                </div>
                
                <script>
                    // Отправляем данные в родительское окно
                    window.opener.postMessage({
                        type: 'DISCORD_AUTH_SUCCESS',
                        user: {
                            id: "${userData.discord_id}",
                            username: "${userData.username}",
                            avatar: "${userData.avatar}",
                            email: "${userData.email}"
                        }
                    }, '*');
                    
                    // Автоматическое закрытие через 3 секунды
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                </script>
            </body>
            </html>
        `);
        
    } catch (error) {
        console.error('❌ API Error:', error.response?.data || error.message);
        
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <body style="text-align: center; padding: 50px; font-family: Arial;">
                <h2 style="color: #ff4757;">❌ Authentication Failed</h2>
                <p>${error.message}</p>
                <button onclick="window.close()" 
                        style="padding: 10px 20px; background: #ff4757; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Close Window
                </button>
            </body>
            </html>
        `);
    }
});

// API для получения всех пользователей (только для теста)
app.get('/api/users', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        
        const users = await db.collection('users')
            .find({})
            .project({ 
                username: 1, 
                email: 1, 
                last_login: 1,
                guilds: 1,
                _id: 0 
            })
            .sort({ last_login: -1 })
            .limit(50)
            .toArray();
            
        res.json({
            count: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Metro Verification API',
        database: db ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString(),
        discord_client_id: CONFIG.discord.clientId ? 'Configured' : 'Missing'
    });
});

// Стартовая страница
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Metro Verification API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .endpoint {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 10px 0;
                    font-family: monospace;
                }
                .test-btn {
                    background: #7289da;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <h1>🚇 Metro Verification API</h1>
            <p>API is running successfully!</p>
            
            <h2>📡 Endpoints:</h2>
            <div class="endpoint">GET /health - Health check</div>
            <div class="endpoint">GET /api/users - Get all users (test)</div>
            <div class="endpoint">GET /api/discord/callback - Discord OAuth callback</div>
            
            <h2>🔗 Test Links:</h2>
            <a href="/health" class="test-btn">Health Check</a>
            <a href="/api/users" class="test-btn">View Users</a>
            
            <h2>🚀 Discord OAuth Test:</h2>
            <p>Use this URL to test Discord login:</p>
            <div class="endpoint">
                https://discord.com/api/oauth2/authorize?client_id=${CONFIG.discord.clientId}&response_type=code&redirect_uri=${encodeURIComponent(CONFIG.discord.redirectUri)}&scope=identify+guilds+email
            </div>
            
            <p><strong>Make sure to update REDIRECT_URI in Discord Developer Portal!</strong></p>
        </body>
        </html>
    `);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Discord Client ID: ${CONFIG.discord.clientId}`);
    
    await connectDB();
    
    console.log(`📊 MongoDB URI: ${CONFIG.mongoUri ? 'Configured' : 'Missing'}`);
    console.log(`✅ API is ready!`);
    console.log(`👉 Open: http://localhost:${PORT}`);
});
