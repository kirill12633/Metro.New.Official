// maintenance-banner.js - Баннер о техработах (не блокирует сайт)
// https://kirill12633.github.io/Metro.New.Official/ru/js/maintenance-banner.js

(function() {
    'use strict';
    
    console.log('maintenance-banner.js загружен');
    
    // ========== НАСТРОЙКИ ==========
    const MAINTENANCE_ACTIVE = false;  // ← true = показывать баннер, false = не показывать
    
    const BANNER_CONFIG = {
        title: '🛠️ Технические работы',
        message: 'На сайте проходят технические работы. Просим быть аккуратнее. Если что-то не работает — сообщите нам.',
        email: 'metro.new.help@gmail.com',
        statusUrl: 'https://kirill12633.github.io/status.metro.new/',
        discordUrl: 'https://discord.com/invite/WjGZBs3HMX',
        
        // Цвета
        bgColor: '#FFF8E1',      // фон
        borderColor: '#FFD700',   // рамка
        textColor: '#856404',     // текст
        accentColor: '#FFC107'    // акцент
    };
    
    // ========== СОЗДАНИЕ БАННЕРА ==========
    function createBanner() {
        // Проверяем, что body существует
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', createBanner);
            return;
        }
        
        // Удаляем старый баннер если есть
        const oldBanner = document.getElementById('maintenanceBanner');
        if (oldBanner) oldBanner.remove();
        
        // Создаём баннер
        const banner = document.createElement('div');
        banner.id = 'maintenanceBanner';
        banner.style.cssText = `
            position: relative;
            width: 100%;
            background: ${BANNER_CONFIG.bgColor};
            border-bottom: 3px solid ${BANNER_CONFIG.borderColor};
            padding: 12px 20px;
            font-family: 'Montserrat', Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            animation: slideDown 0.4s ease;
        `;
        
        banner.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 2; min-width: 200px;">
                    <span style="font-size: 24px;">🛠️</span>
                    <div>
                        <strong style="color: ${BANNER_CONFIG.textColor};">${BANNER_CONFIG.title}</strong>
                        <p style="margin: 2px 0 0; font-size: 13px; color: ${BANNER_CONFIG.textColor}; opacity: 0.9;">
                            ${BANNER_CONFIG.message}
                        </p>
                    </div>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <a href="mailto:${BANNER_CONFIG.email}" style="
                        background: #0066CC;
                        color: white;
                        text-decoration: none;
                        padding: 6px 14px;
                        border-radius: 25px;
                        font-size: 12px;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                    ">
                        <i class="fas fa-envelope"></i> Написать
                    </a>
                    <a href="${BANNER_CONFIG.statusUrl}" target="_blank" style="
                        background: transparent;
                        border: 1px solid ${BANNER_CONFIG.accentColor};
                        color: ${BANNER_CONFIG.textColor};
                        text-decoration: none;
                        padding: 6px 14px;
                        border-radius: 25px;
                        font-size: 12px;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                    ">
                        <i class="fas fa-chart-line"></i> Статус
                    </a>
                    <a href="${BANNER_CONFIG.discordUrl}" target="_blank" style="
                        background: #5865F2;
                        color: white;
                        text-decoration: none;
                        padding: 6px 14px;
                        border-radius: 25px;
                        font-size: 12px;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                    ">
                        <i class="fab fa-discord"></i> Discord
                    </a>
                    <button id="closeBannerBtn" style="
                        background: transparent;
                        border: none;
                        font-size: 18px;
                        cursor: pointer;
                        color: ${BANNER_CONFIG.textColor};
                        opacity: 0.6;
                        padding: 0 5px;
                    ">
                        ✕
                    </button>
                </div>
            </div>
        `;
        
        // Вставляем в начало страницы (после header)
        const header = document.querySelector('header');
        if (header && header.parentNode) {
            header.insertAdjacentElement('afterend', banner);
        } else {
            document.body.insertBefore(banner, document.body.firstChild);
        }
        
        // Добавляем стили анимации
        if (!document.querySelector('#bannerStyles')) {
            const style = document.createElement('style');
            style.id = 'bannerStyles';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Кнопка закрытия (сохраняет в localStorage)
        const closeBtn = document.getElementById('closeBannerBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                banner.remove();
                localStorage.setItem('metro_banner_closed', 'true');
            });
        }
        
        // Подключаем Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fa);
        }
    }
    
    // ========== ПРОВЕРКА ПОКАЗА ==========
    function shouldShowBanner() {
        // Проверяем, не закрыл ли пользователь
        const isClosed = localStorage.getItem('metro_banner_closed') === 'true';
        if (isClosed) return false;
        
        // Проверяем настройки
        return MAINTENANCE_ACTIVE;
    }
    
    // ========== ЗАПУСК ==========
    if (shouldShowBanner()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createBanner);
        } else {
            createBanner();
        }
    }
    
    // API для управления
    window.MetroBanner = {
        show: () => {
            localStorage.removeItem('metro_banner_closed');
            createBanner();
        },
        hide: () => {
            const banner = document.getElementById('maintenanceBanner');
            if (banner) banner.remove();
            localStorage.setItem('metro_banner_closed', 'true');
        },
        isVisible: () => document.getElementById('maintenanceBanner') !== null
    };
    
})();
