// maintenance.js - Режим технического обслуживания с проверкой статуса
// https://kirill12633.github.io/Metro.New.Official/ru/js/maintenance.js

(function() {
    'use strict';
    
    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        // Ссылка на страницу статуса
        statusPageUrl: 'https://kirill12633.github.io/status.metro.new/',
        
        // Режим: 'auto' - автоматический, 'manual' - ручной
        mode: 'auto',
        
        // Ручной режим (если mode = 'manual')
        manualMaintenance: false,  // ← сюда true чтобы включить вручную
        
        // Время открытия при ручном режиме
        openTime: { hour: 2, minute: 30, second: 46 },
        
        // Интервал проверки статуса (мс)
        checkInterval: 60000, // 1 минута
        
        // Discord webhook для уведомлений
        discordWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC'
    };
    
    // ========== ПЕРЕМЕННЫЕ ==========
    let isMaintenance = false;
    let checkTimer = null;
    
    // ========== ПРОВЕРКА СТАТУСА ==========
    async function checkStatus() {
        try {
            // Пытаемся получить страницу статуса
            const response = await fetch(CONFIG.statusPageUrl, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            if (!response.ok) {
                console.log('Страница статуса недоступна, использую ручной режим');
                return checkManualMode();
            }
            
            const html = await response.text();
            
            // Проверяем наличие признаков техработ на странице статуса
            const hasMaintenance = 
                html.includes('Технические работы') ||
                html.includes('maintenance') ||
                html.includes('плановые технические работы') ||
                html.includes('ведутся работы');
            
            // Также проверяем дату плановых работ (17 января)
            const hasScheduledMaintenance = 
                html.includes('17 января') && 
                (html.includes('03:00') || html.includes('3:00'));
            
            if (hasMaintenance || hasScheduledMaintenance) {
                console.log('🔧 Обнаружены технические работы на странице статуса');
                return true;
            }
            
            // Проверяем, что все системы работают нормально
            const allWorking = 
                html.includes('Все системы работают нормально') ||
                html.includes('штатном режиме');
            
            if (allWorking) {
                console.log('✅ Все системы работают нормально');
                return false;
            }
            
            return checkManualMode();
            
        } catch(error) {
            console.warn('Ошибка проверки статуса:', error);
            return checkManualMode();
        }
    }
    
    function checkManualMode() {
        if (CONFIG.mode === 'manual') {
            return CONFIG.manualMaintenance;
        }
        
        // Проверка по расписанию (17 число, 3-5 утра)
        const now = new Date();
        const day = now.getDate();
        const hour = now.getHours();
        
        // Плановые работы 17 числа с 3 до 5 утра
        if (day === 17 && hour >= 3 && hour < 5) {
            console.log('🔧 Плановые технические работы (17 число, 3-5 утра)');
            return true;
        }
        
        return false;
    }
    
    // ========== ОТПРАВКА В DISCORD ==========
    async function sendDiscordNotification(message, type = 'info') {
        if (!CONFIG.discordWebhook) return;
        
        const colors = {
            info: 0x0066CC,
            warning: 0xff9800,
            error: 0xdc3545,
            success: 0x4CAF50
        };
        
        const embed = {
            title: type === 'warning' ? '🔧 РЕЖИМ ТЕХОБСЛУЖИВАНИЯ' : 'ℹ️ СТАТУС САЙТА',
            color: colors[type] || colors.info,
            timestamp: new Date().toISOString(),
            description: message,
            fields: [
                { name: 'Время', value: new Date().toLocaleString('ru-RU'), inline: true },
                { name: 'Режим', value: CONFIG.mode, inline: true }
            ]
        };
        
        try {
            await fetch(CONFIG.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch(e) {}
    }
    
    // ========== ПОКАЗ СТРАНИЦЫ ТЕХРАБОТ ==========
    function showMaintenancePage() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', showMaintenancePage);
            return;
        }
        
        document.body.innerHTML = '';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.fontFamily = "'Montserrat', sans-serif";
        document.body.style.background = 'linear-gradient(135deg, #0a0a2a 0%, #1a1a3e 50%, #0a0a2a 100%)';
        document.body.style.minHeight = '100vh';
        document.body.style.display = 'flex';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.position = 'relative';
        
        // Анимированные круги
        const circles = document.createElement('div');
        circles.innerHTML = `
            <div style="position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%); border-radius: 50%; top: -150px; left: -150px; animation: float 20s ease-in-out infinite;"></div>
            <div style="position: absolute; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%); border-radius: 50%; bottom: -100px; right: -100px; animation: float 15s ease-in-out infinite reverse;"></div>
            <div style="position: absolute; width: 150px; height: 150px; background: radial-gradient(circle, rgba(0,102,204,0.08) 0%, transparent 70%); border-radius: 50%; top: 30%; right: 10%; animation: float 12s ease-in-out infinite;"></div>
        `;
        document.body.appendChild(circles);
        
        // Карточка
        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(255,255,255,0.98);
            border-radius: 40px;
            max-width: 500px;
            width: 90%;
            padding: 50px 40px;
            text-align: center;
            position: relative;
            z-index: 10;
            box-shadow: 0 30px 60px rgba(0,0,0,0.3);
            animation: fadeInUp 0.6s ease;
        `;
        
        card.innerHTML = `
            <div style="background: linear-gradient(135deg, #FFD700, #e6c200); width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; animation: pulse 2s ease-in-out infinite;">
                <i class="fas fa-tools" style="font-size: 40px; color: #1a1a2e;"></i>
            </div>
            
            <h1 style="font-size: 28px; color: #1a1a2e; margin-bottom: 10px; font-weight: 700;">Метро New</h1>
            
            <p style="color: #dc3545; font-size: 16px; font-weight: 600; margin-bottom: 20px;">
                <i class="fas fa-cog fa-spin"></i> Временно не работает
            </p>
            
            <p style="color: #666; line-height: 1.7; margin-bottom: 30px; font-size: 15px;">
                В настоящее время мы проводим технические работы на сайте.<br>
                Приносим извинения за временные неудобства.
            </p>
            
            <div style="background: #f8f9fa; border-radius: 20px; padding: 20px; margin-bottom: 30px;">
                <div style="font-size: 13px; color: #999; margin-bottom: 10px;">
                    <i class="fas fa-hourglass-half"></i> Работа будет завершена:
                </div>
                <div id="maintenanceTimer" style="font-size: 32px; font-weight: 700; color: #1a1a2e; font-family: monospace; letter-spacing: 3px;">
                    00:00:00
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 30px; flex-wrap: wrap;">
                <a href="mailto:metro.new.help@gmail.com" style="background: #0066CC; color: white; text-decoration: none; padding: 12px 25px; border-radius: 40px; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; transition: all 0.3s;">
                    <i class="fas fa-envelope"></i> Написать нам
                </a>
                <a href="https://discord.com/invite/WjGZBs3HMX" target="_blank" style="background: #5865F2; color: white; text-decoration: none; padding: 12px 25px; border-radius: 40px; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; transition: all 0.3s;">
                    <i class="fab fa-discord"></i> Чат поддержки
                </a>
                <button onclick="window.location.href='${CONFIG.statusPageUrl}'" style="background: transparent; border: 2px solid #FFD700; color: #1a1a2e; padding: 12px 25px; border-radius: 40px; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; transition: all 0.3s; cursor: pointer;">
                    <i class="fas fa-chart-line"></i> Статус сервисов
                </button>
            </div>
            
            <div style="background: rgba(255,215,0,0.1); border-radius: 15px; padding: 15px; border-left: 3px solid #FFD700;">
                <i class="fas fa-rocket" style="color: #FFD700; margin-right: 8px;"></i>
                <span style="font-size: 14px; color: #666;">Мы работаем над тем, чтобы вернуться как можно скорее!</span>
            </div>
            
            <div style="margin-top: 30px; font-size: 11px; color: #999;">
                <a href="${CONFIG.statusPageUrl}" style="color: #0066CC; text-decoration: none;">Проверить статус</a> | 
                Следующая проверка: <span id="nextCheck">через 1 минуту</span>
            </div>
            
            <div style="margin-top: 15px; font-size: 10px; color: #ccc;">
                © 2026 Метро New. Все права защищены.
            </div>
        `;
        
        document.body.appendChild(card);
        
        // Стили
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,215,0,0.4); }
                50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(255,215,0,0); }
            }
            @keyframes float {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(30px, 30px); }
            }
            .btn-hover:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
        `;
        document.head.appendChild(style);
        
        // Подключаем Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fa);
        }
        
        // Таймер
        function updateTimer() {
            const now = new Date();
            const target = new Date();
            target.setHours(CONFIG.openTime.hour, CONFIG.openTime.minute, CONFIG.openTime.second, 0);
            
            if (now > target) {
                target.setDate(target.getDate() + 1);
            }
            
            const diff = target - now;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            const timerElement = document.getElementById('maintenanceTimer');
            if (timerElement) {
                timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
        
        updateTimer();
        setInterval(updateTimer, 1000);
        
        // Обновление информации о следующей проверке
        let nextCheckSeconds = CONFIG.checkInterval / 1000;
        setInterval(() => {
            nextCheckSeconds--;
            if (nextCheckSeconds <= 0) {
                nextCheckSeconds = CONFIG.checkInterval / 1000;
            }
            const nextCheckSpan = document.getElementById('nextCheck');
            if (nextCheckSpan) {
                nextCheckSpan.textContent = `через ${Math.floor(nextCheckSeconds)} сек`;
            }
        }, 1000);
    }
    
    // ========== ОСНОВНАЯ ФУНКЦИЯ ==========
    async function init() {
        console.log('maintenance.js загружен, режим:', CONFIG.mode);
        
        if (CONFIG.mode === 'auto') {
            // Автоматический режим — проверяем статус
            isMaintenance = await checkStatus();
            
            // Периодическая проверка
            if (checkTimer) clearInterval(checkTimer);
            checkTimer = setInterval(async () => {
                const newStatus = await checkStatus();
                if (newStatus !== isMaintenance) {
                    isMaintenance = newStatus;
                    if (isMaintenance) {
                        await sendDiscordNotification('🔧 Режим технического обслуживания АКТИВИРОВАН', 'warning');
                        showMaintenancePage();
                    } else {
                        await sendDiscordNotification('✅ Режим технического обслуживания ОТКЛЮЧЁН', 'success');
                        location.reload();
                    }
                }
            }, CONFIG.checkInterval);
            
        } else {
            // Ручной режим
            isMaintenance = CONFIG.manualMaintenance;
        }
        
        if (isMaintenance) {
            await sendDiscordNotification('🔧 Сайт перешёл в режим технического обслуживания', 'warning');
            showMaintenancePage();
        }
    }
    
    // ========== API ДЛЯ УПРАВЛЕНИЯ ==========
    window.MetroMaintenance = {
        enable: () => {
            CONFIG.mode = 'manual';
            CONFIG.manualMaintenance = true;
            location.reload();
        },
        disable: () => {
            CONFIG.mode = 'manual';
            CONFIG.manualMaintenance = false;
            location.reload();
        },
        isEnabled: () => isMaintenance,
        checkNow: async () => {
            return await checkStatus();
        }
    };
    
    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
