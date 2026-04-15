// maintenance.js - Режим техобслуживания с проверкой Better Uptime
// https://kirill12633.github.io/Metro.New.Official/ru/js/maintenance.js

(function() {
    'use strict';
    
    const CONFIG = {
        betterUptimeUrl: 'https://metro_new.betteruptime.com/',
        maintenanceUrl: 'https://metro_new.betteruptime.com/maintenance',
        checkInterval: 60000,
        mode: 'auto',  // 'auto' или 'manual'
        manual: false
    };
    
    let isMaintenance = false;
    let checkTimer = null;
    
    // ========== ПРОВЕРКА СТАТУСА ==========
    async function checkBetterUptime() {
        try {
            // Проверяем страницу техобслуживания
            const maintRes = await fetch(CONFIG.maintenanceUrl, { cache: 'no-store' });
            if (maintRes.ok) {
                const html = await maintRes.text();
                if (html.includes('maintenance') || html.includes('технические работы')) {
                    console.log('🔧 Better Uptime: режим техобслуживания');
                    return true;
                }
            }
            
            // Проверяем основную страницу статуса
            const statusRes = await fetch(CONFIG.betterUptimeUrl, { cache: 'no-store' });
            if (statusRes.ok) {
                const html = await statusRes.text();
                if (html.includes('down') || html.includes('не работает') || html.includes('incident')) {
                    console.log('⚠️ Better Uptime: сайт недоступен');
                    return true;
                }
                if (html.includes('up') || html.includes('работает') || html.includes('operational')) {
                    console.log('✅ Better Uptime: всё работает');
                    return false;
                }
            }
            
            return checkManualMode();
        } catch(e) {
            console.warn('Better Uptime недоступен:', e);
            return checkManualMode();
        }
    }
    
    function checkManualMode() {
        if (CONFIG.mode === 'manual') return CONFIG.manual;
        return false;
    }
    
    // ========== ПОКАЗ СТРАНИЦЫ ==========
    function showPage() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', showPage);
            return;
        }
        
        document.body.innerHTML = `
            <style>
                *{margin:0;padding:0;box-sizing:border-box}
                body{font-family:'Montserrat',sans-serif;background:linear-gradient(135deg,#0a0a2a,#1a1a3e);min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative}
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
                .btn{text-decoration:none;padding:10px 20px;border-radius:40px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:8px;transition:0.3s}
                .btn-primary{background:#0066CC;color:white}
                .btn-discord{background:#5865F2;color:white}
                .btn-outline{background:transparent;border:2px solid #FFD700;color:#1a1a2e}
                .btn:hover{transform:translateY(-2px)}
                .footer{margin-top:20px;font-size:10px;color:#999}
                @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
                @keyframes float{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,20px)}}
                .circle{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,215,0,0.08) 0%,transparent 70%);animation:float 15s infinite}
                .c1{width:250px;height:250px;top:-100px;left:-100px}
                .c2{width:180px;height:180px;bottom:-80px;right:-80px;animation-delay:2s}
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
                    <div class="timer" id="timer">02:30:00</div>
                </div>
                <div class="buttons">
                    <a href="mailto:metro.new.help@gmail.com" class="btn btn-primary"><i class="fas fa-envelope"></i> Написать</a>
                    <a href="https://discord.com/invite/WjGZBs3HMX" target="_blank" class="btn btn-discord"><i class="fab fa-discord"></i> Discord</a>
                    <a href="${CONFIG.betterUptimeUrl}" target="_blank" class="btn btn-outline"><i class="fas fa-chart-line"></i> Статус</a>
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
            target.setHours(2, 30, 0, 0);
            if (now > target) target.setDate(target.getDate() + 1);
            const diff = target - now;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            const timer = document.getElementById('timer');
            if (timer) timer.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }
        updateTimer();
        setInterval(updateTimer, 1000);
        
        // Автообновление каждые 30 секунд
        setTimeout(() => location.reload(), 30000);
    }
    
    // ========== ЗАПУСК ==========
    async function init() {
        if (CONFIG.mode === 'auto') {
            isMaintenance = await checkBetterUptime();
            setInterval(async () => {
                const newStatus = await checkBetterUptime();
                if (newStatus !== isMaintenance) {
                    isMaintenance = newStatus;
                    if (!isMaintenance) location.reload();
                }
            }, CONFIG.checkInterval);
        } else {
            isMaintenance = CONFIG.manual;
        }
        
        if (isMaintenance) showPage();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.MetroMaintenance = {
        enable: () => { CONFIG.mode = 'manual'; CONFIG.manual = true; location.reload(); },
        disable: () => { CONFIG.mode = 'manual'; CONFIG.manual = false; location.reload(); }
    };
    
})();
