// maintenance.js - Режим технического обслуживания
// https://kirill12633.github.io/Metro.New.Official/ru/js/maintenance.js

(function() {
    'use strict';
    
    // ========== НАСТРОЙКИ ==========
    // ★★★ ДЛЯ ВКЛЮЧЕНИЯ РЕЖИМА - ПОМЕНЯТЬ maintenanceMode НА true ★★★
    const MAINTENANCE_MODE = false;  // ← СЮДА: true = сайт закрыт, false = сайт открыт
    
    const CONFIG = {
        title: 'Метро New',
        message: 'Сайт закрыт на технические работы',
        details: 'Мы обновляем сайт, чтобы сделать его лучше. Скоро всё заработает!',
        estimatedTime: 'Ориентировочно: 15-30 минут',
        contactEmail: 'metro.new.help@gmail.com',
        discordLink: 'https://discord.com/invite/WjGZBs3HMX',
        backgroundColor: 'linear-gradient(135deg, #0066CC, #0052a3)',
        // Фоновая картинка метро (опционально)
        backgroundImage: 'https://placehold.co/1920x1080/1a1a2e/FFFFFF?text=🚇'
    };
    
    // ========== ПРОВЕРКА РЕЖИМА ==========
    if (MAINTENANCE_MODE) {
        showMaintenancePage();
    }
    
    function showMaintenancePage() {
        // Очищаем страницу
        document.body.innerHTML = '';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.fontFamily = "'Montserrat', Arial, sans-serif";
        
        // Создаём страницу техработ
        const page = document.createElement('div');
        page.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${CONFIG.backgroundColor};
            background-image: url('${CONFIG.backgroundImage}');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999999;
            font-family: 'Montserrat', Arial, sans-serif;
        `;
        
        page.innerHTML = `
            <div style="
                background: rgba(255,255,255,0.95);
                border-radius: 30px;
                max-width: 500px;
                width: 90%;
                padding: 40px 30px;
                text-align: center;
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                animation: fadeInUp 0.5s ease;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: #FFD700;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                ">
                    <i class="fas fa-tools" style="font-size: 40px; color: #0066CC;"></i>
                </div>
                
                <h1 style="
                    color: #1a1a2e;
                    margin-bottom: 10px;
                    font-size: 28px;
                ">🔧 ${CONFIG.title}</h1>
                
                <h2 style="
                    color: #dc3545;
                    margin-bottom: 15px;
                    font-size: 22px;
                ">${CONFIG.message}</h2>
                
                <p style="
                    color: #666;
                    margin-bottom: 20px;
                    line-height: 1.6;
                ">${CONFIG.details}</p>
                
                <div style="
                    background: #f8f9fa;
                    border-radius: 15px;
                    padding: 15px;
                    margin-bottom: 25px;
                ">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                        <div class="loader" style="
                            width: 20px;
                            height: 20px;
                            border: 3px solid #f3f3f3;
                            border-top: 3px solid #FFD700;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                        "></div>
                        <span style="font-weight: 600;">Идут технические работы</span>
                    </div>
                    <p style="color: #999; font-size: 14px; margin: 0;">
                        ${CONFIG.estimatedTime}
                    </p>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 25px; flex-wrap: wrap;">
                    <a href="${CONFIG.discordLink}" target="_blank" style="
                        background: #5865F2;
                        color: white;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 25px;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                    ">
                        <i class="fab fa-discord"></i> Discord
                    </a>
                    <a href="mailto:${CONFIG.contactEmail}" style="
                        background: #0066CC;
                        color: white;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 25px;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 14px;
                    ">
                        <i class="fas fa-envelope"></i> Написать нам
                    </a>
                </div>
                
                <div style="
                    background: #fff3cd;
                    border-left: 4px solid #FFD700;
                    padding: 12px;
                    border-radius: 10px;
                    text-align: left;
                ">
                    <p style="margin: 0; font-size: 13px; color: #856404;">
                        <strong>💡 Что происходит?</strong><br>
                        Мы обновляем сайт, добавляем новые функции и исправляем ошибки.
                        Следите за новостями в нашем Discord-сообществе!
                    </p>
                </div>
                
                <p style="
                    color: #999;
                    font-size: 11px;
                    margin-top: 25px;
                ">
                    © 2026 Метро New. Все права защищены.
                </p>
            </div>
            <style>
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(page);
        
        // Подключаем Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fa);
        }
        
        // Автообновление каждые 30 секунд (проверка, не выключили ли режим)
        setInterval(() => {
            fetch(window.location.href, { cache: 'no-store' })
                .then(() => {
                    // Если страница загрузилась — возможно режим выключен
                    window.location.reload();
                })
                .catch(() => {});
        }, 30000);
    }
    
    // Для динамического управления (через консоль)
    window.MetroMaintenance = {
        enable: () => {
            localStorage.setItem('metro_maintenance', 'true');
            window.location.reload();
        },
        disable: () => {
            localStorage.removeItem('metro_maintenance');
            window.location.reload();
        },
        isEnabled: () => MAINTENANCE_MODE || localStorage.getItem('metro_maintenance') === 'true'
    };
    
})();
