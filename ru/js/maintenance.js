// maintenance.js - Страница технического обслуживания
// https://kirill12633.github.io/Metro.New.Official/ru/js/maintenance.js

(function() {
    'use strict';
    
    // ========== НАСТРОЙКИ ==========
    // ★ Меняй здесь: true = сайт закрыт, false = открыт ★
    const MAINTENANCE_MODE = true;  // ← СЮДА
    
    // Время открытия (час, минута)
    const OPEN_TIME = { hour: 2, minute: 30, second: 46 };
    
    // ========== ПОКАЗ СТРАНИЦЫ ==========
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
        document.body.style.overflow = 'hidden';
        
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
            </div>
            
            <div style="background: rgba(255,215,0,0.1); border-radius: 15px; padding: 15px; border-left: 3px solid #FFD700;">
                <i class="fas fa-rocket" style="color: #FFD700; margin-right: 8px;"></i>
                <span style="font-size: 14px; color: #666;">Мы работаем над тем, чтобы вернуться как можно скорее!</span>
            </div>
            
            <div style="margin-top: 30px; font-size: 11px; color: #999;">
                © 2026 Метро New. Все права защищены.
            </div>
        `;
        
        document.body.appendChild(card);
        
        // Стили анимаций
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
        
        // Добавляем hover эффекты на кнопки
        const btns = document.querySelectorAll('a');
        btns.forEach(btn => {
            btn.classList.add('btn-hover');
        });
        
        // Таймер
        function updateTimer() {
            const now = new Date();
            const target = new Date();
            target.setHours(OPEN_TIME.hour, OPEN_TIME.minute, OPEN_TIME.second, 0);
            
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
            
            // Автообновление через 30 секунд
            if (diff < 30000 && diff > 0) {
                setTimeout(() => location.reload(), diff + 1000);
            }
        }
        
        updateTimer();
        setInterval(updateTimer, 1000);
    }
    
    // ========== ПРОВЕРКА РЕЖИМА ==========
    function checkAndShow() {
        if (MAINTENANCE_MODE) {
            showMaintenancePage();
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndShow);
    } else {
        checkAndShow();
    }
    
    // Для динамического управления
    window.MetroMaintenance = {
        enable: () => {
            localStorage.setItem('metro_maintenance', 'true');
            location.reload();
        },
        disable: () => {
            localStorage.removeItem('metro_maintenance');
            location.reload();
        },
        isEnabled: () => MAINTENANCE_MODE || localStorage.getItem('metro_maintenance') === 'true'
    };
    
})();
