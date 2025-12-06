require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

// Environment Variables на Render.com
const CONFIG = {
    discord: {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        redirectUri: 'https://kirill12633.github.io/Metro.New.Official/'
    },
    mongoUri: process.env.MONGODB_URI
};

// Подключение к MongoDB
let db;
async function connectDB() {
    const client = new MongoClient(CONFIG.mongoUri);
    await client.connect();
    db = client.db('metro_verification');
    console.log('✅ Connected to MongoDB');
}

// Основной endpoint для обработки Discord callback
app.get('/api/discord/callback', async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.status(400).send('No code provided');
        }

        // 1. Обмен кода на access_token
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

        const { access_token } = tokenResponse.data;

        // 2. Получаем данные пользователя от Discord
        const [userResponse, guildsResponse] = await Promise.all([
            axios.get('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${access_token}` }
            }),
            axios.get('https://discord.com/api/users/@me/guilds', {
                headers: { Authorization: `Bearer ${access_token}` }
            })
        ]);

        // 3. Подготавливаем данные для сохранения
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
            access_token: access_token, // Сохраняем если нужно
            refresh_token: tokenResponse.data.refresh_token,
            timestamp: new Date(),
            ip_address: req.ip
        };

        // 4. Сохраняем в MongoDB
        const usersCollection = db.collection('users');
        
        // Проверяем, есть ли уже пользователь
        const existingUser = await usersCollection.findOne({ 
            discord_id: userData.discord_id 
        });

        if (existingUser) {
            // Обновляем существующего
            await usersCollection.updateOne(
                { discord_id: userData.discord_id },
                { $set: userData }
            );
            console.log(`📝 Updated user: ${userData.username}`);
        } else {
            // Добавляем нового
            await usersCollection.insertOne(userData);
            console.log(`✅ New user saved: ${userData.username}`);
        }

        // 5. Отправляем ответ (можно просто редирект)
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Verification Complete</title>
                <script>
                    window.opener.postMessage({
                        type: 'DISCORD_AUTH_SUCCESS',
                        user: ${JSON.stringify({
                            username: userData.username,
                            avatar: userData.avatar,
                            email: userData.email
                        })}
                    }, '*');
                    window.close();
                </script>
            </head>
            <body>
                <h2>✅ Verification Complete!</h2>
                <p>You can close this window.</p>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <body>
                <h2>❌ Authentication Failed</h2>
                <p>${error.message}</p>
                <button onclick="window.close()">Close</button>
            </body>
            </html>
        `);
    }
});

// Endpoint для проверки данных (опционально)
app.get('/api/users', async (req, res) => {
    try {
        const users = await db.collection('users').find({}).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Discord Client ID: ${CONFIG.discord.clientId}`);
});
