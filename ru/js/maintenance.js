// maintenance.js - Режим техобслуживания (без CORS)
// https://kirill12633.github.io/Metro.New.Official/ru/js/maintenance.js

(function() {
    'use strict';
    
    const CONFIG = {
        // Ручной режим
        mode: 'manual',  // 'auto' или 'manual'
        manualMaintenance: false,  // ← сюда true чтобы включить техработы
        
        // Расписание плановых работ (если mode = 'auto')
        scheduled: {
            enabled: true,
            day: 17,        // число месяца
            startHour: 3,
            endHour: 5
        },
        
        // Время открытия (для таймера)
        openTime: { hour: 2, minute: 30, second: 0 },
        
        // Discord webhook
        discordWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC'
    };
    
    let isMaintenance = false;
    
    // ========== ПРОВЕРКА ==========
    function checkMaintenance() {
        if (CONFIG.mode === 'manual') {
            return CONFIG.manualMaintenance;
        }
        
        // Автоматический режим — проверяем расписание
        if (CONFIG.scheduled.enabled) {
            const now = new Date();
            const day = now.getDate();
            const hour = now.getHours();
            
            if (day === CONFIG.scheduled.day && hour >= CONFIG.scheduled.startHour && hour < CONFIG.scheduled.endHour) {
                console.log('🔧 Плановые технические работы');
                return true;
            }
        }
        
        return false;
    }
    
    // ========== ПОКАЗ СТРАНИЦЫ ==========
    function showPage() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', showPage);
            return;
        }
        
        document.body.innerHTML = '';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.fontFamily = "'Montserrat', sans-serif";
        document.body.style.background = 'linear-gradient(135deg, #0a0a2a, #1a1a3e)';
        document.body.style.minHeight = '100vh';
        document.body.style.display = 'flex';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.position = 'relative';
        
        // Анимированный фон
        document.body.innerHTML = `
            <style>
                *{margin:0;padding:0;box-sizing:border-box}
                .circle{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,215,0,0.08) 0%,transparent 70%);animation:float 15s infinite}
                .c1{width:250px;height:250px;top:-100px;left:-100px}
                .c2{width:180px;height:180px;bottom:-80px;right:-80px;animation-delay:2s}
                @keyframes float{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,20px)}}
                @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
                .card{background:rgba(255,255,255,0.98);border-radius:32px;max-width:400px;width:90%;padding:40px 30px;text-align:center;animation:fadeIn 0.5s ease;position:relative;z-index:10}
                .icon{background:#FFD700;width:70px;height:70px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:pulse 2s infinite}
                .icon i{font-size:32px;color:#1a1a2e}
                h1{font-size:24px;color:#1a1a2e;margin-bottom:10px}
                .badge{color:#dc3545;font-size:14px;font-weight:600;margin-bottom:20px}
                p{color:#666;font-size:14px;margin-bottom:25px;line-height:1.6}
                .timer-box{background:#f8f9fa;border-radius:20px;padding:15px;margin-bottom:25px}
                .timer-label{font-size:12px;color:#999;margin-bottom:5px}
                .timer{font-size:28px;font-weight:700;font-family:monospace;color:#1a1a2e}
                .buttons{display:flex;gap:12px;justify-content:center;margin-bottom:25px;flex-wrap:wrap}
                .btn{text-decoration:none;padding:10px 20px;border-radius:40px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:8px;transition:0.3s;cursor:pointer}
                .btn-primary{background:#0066CC;color:white}
                .btn-discord{background:#5865F2;color:white}
                .btn-outline{background:transparent;border:2px solid #FFD700;color:#1a1a2e}
                .btn:hover{transform:translateY(-2px)}
                .footer{margin-top:20px;font-size:10px;color:#999}
            </style>
            <div class="circle c1"></div>
            <div class="circle c2"></div>
            <div class="card">
                <div class="icon"><i class="fas fa-tools"></i></div>
                <h1>Метро New</h1>
                <div class="badge"><i class="fas fa-cog fa-spin"></i> Временно не работает</div>
                <p>Проводим технические работы.<br>Приносим извинения за неудобства.</p>
                <div class="timer-box">
                    <div class="timer-label"><i class="fas fa-hourglass-half"></i> Плановое открытие</div>
                    <div class="timer" id="maintenanceTimer">02:30:00</div>
                </div>
                <div class="buttons">
                    <a href="mailto:metro.new.help@gmail.com" class="btn btn-primary"><i class="fas fa-envelope"></i> Написать</a>
                    <a href="https://discord.com/invite/WjGZBs3HMX" target="_blank" class="btn btn-discord"><i class="fab fa-discord"></i> Discord</a>
                    <a href="https://kirill12633.github.io/status.metro.new/" target="_blank" class="btn btn-outline"><i class="fas fa-chart-line"></i> Статус</a>
                </div>
                <div class="footer">© 2026 Метро New</div>
            </div>
        `;
        
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
            if (now > target) target.setDate(target.getDate() + 1);
            const diff = target - now;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            const timer = document.getElementById('maintenanceTimer');
            if (timer) timer.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }
        updateTimer();
        setInterval(updateTimer, 1000);
        
        // Автообновление каждые 30 секунд
        setInterval(() => {
            if (!checkMaintenance()) location.reload();
        }, 30000);
    }
    
    // ========== ЗАПУСК ==========
    function init() {
        isMaintenance = checkMaintenance();
        console.log(`maintenance.js: режим=${CONFIG.mode}, техработы=${isMaintenance}`);
        if (isMaintenance) showPage();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // API
    window.MetroMaintenance = {
        enable: () => { CONFIG.mode = 'manual'; CONFIG.manualMaintenance = true; location.reload(); },
        disable: () => { CONFIG.mode = 'manual'; CONFIG.manualMaintenance = false; location.reload(); },
        isEnabled: () => checkMaintenance()
    };
    
})();
