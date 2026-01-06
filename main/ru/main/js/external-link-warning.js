// =============================================
// M E T R O   N E W   E X T E R N A L   L I N K   P R O T E C T O R
// Простой скрипт защиты внешних ссылок
// © 2025 Метро New
// =============================================

(function() {
    'use strict';
    
    // === КОНФИГУРАЦИЯ ===
    const CONFIG = {
        // Домены, которые не требуют подтверждения
        SAFE_DOMAINS: [
            'roblox.com',
            'robloxgames.com',
            'discord.com',
            'discord.gg',
            'github.com',
            'youtube.com',
            'youtu.be',
            'twitter.com',
            'x.com',
            'vk.com',
            'web.telegram.org',
            't.me',
            'google.com',
            'microsoft.com',
            'apple.com'
        ],
        
        // Тексты
        TEXTS: {
            TITLE: "Внешний переход",
            QUESTION: "Вы переходите на сторонний сайт:",
            WARNING: "Метро New не отвечает за содержимое внешних ресурсов",
            BUTTON_YES: "Перейти",
            BUTTON_NO: "Отмена"
        }
    };
    
    // === УТИЛИТЫ ===
    
    // Проверка внешней ссылки
    function isExternalLink(href) {
        if (!href) return false;
        
        // Игнорируем пустые и специальные ссылки
        if (href.startsWith('#') || 
            href.startsWith('javascript:') || 
            href.startsWith('mailto:') ||
            href.startsWith('tel:')) {
            return false;
        }
        
        // Игнорируем относительные пути
        if (href.startsWith('/') || 
            href.startsWith('./') || 
            href.startsWith('../') ||
            !href.includes('://')) {
            return false;
        }
        
        try {
            const url = new URL(href);
            const currentHost = window.location.hostname;
            const targetHost = url.hostname;
            
            // Если это тот же домен
            if (targetHost === currentHost) return false;
            
            // Проверяем безопасные домены
            for (const safeDomain of CONFIG.SAFE_DOMAINS) {
                if (targetHost === safeDomain || targetHost.endsWith('.' + safeDomain)) {
                    return false;
                }
            }
            
            return true;
            
        } catch {
            return false;
        }
    }
    
    // Создание баннера
    function createBanner(targetUrl) {
        // Удаляем старый баннер если есть
        const oldBanner = document.getElementById('metro-link-guard');
        if (oldBanner) oldBanner.remove();
        
        // Создаем баннер
        const banner = document.createElement('div');
        banner.id = 'metro-link-guard';
        
        // Стили баннера
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        // Контент баннера
        banner.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 100%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                text-align: center;
            ">
                <div style="margin-bottom: 25px;">
                    <div style="
                        color: #0066CC;
                        font-size: 24px;
                        font-weight: 600;
                        margin-bottom: 5px;
                    ">🚇 ${CONFIG.TEXTS.TITLE}</div>
                    <div style="height: 3px; background: #FFD700; width: 60px; margin: 0 auto;"></div>
                </div>
                
                <div style="
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 15px;
                    line-height: 1.5;
                ">
                    ${CONFIG.TEXTS.QUESTION}
                </div>
                
                <div style="
                    background: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    word-break: break-all;
                    font-family: monospace;
                    font-size: 14px;
                    color: #0066CC;
                ">
                    ${targetUrl}
                </div>
                
                <div style="
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 12px;
                    margin: 20px 0;
                    color: #856404;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <div style="font-size: 18px;">⚠️</div>
                    <div>${CONFIG.TEXTS.WARNING}</div>
                </div>
                
                <div style="display: flex; gap: 15px; margin-top: 30px;">
                    <button id="metro-guard-cancel" style="
                        flex: 1;
                        padding: 12px;
                        background: #f8f9fa;
                        border: 1px solid #ddd;
                        border-radius: 6px;
                        color: #333;
                        font-size: 15px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">${CONFIG.TEXTS.BUTTON_NO}</button>
                    
                    <button id="metro-guard-continue" style="
                        flex: 1;
                        padding: 12px;
                        background: #0066CC;
                        border: none;
                        border-radius: 6px;
                        color: white;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">${CONFIG.TEXTS.BUTTON_YES}</button>
                </div>
                
                <div style="
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 1px solid #eee;
                    font-size: 12px;
                    color: #666;
                ">
                    © 2025 Метро New. Защита внешних ссылок.
                </div>
            </div>
        `;
        
        // Добавляем на страницу
        document.body.appendChild(banner);
        document.body.style.overflow = 'hidden';
        
        // Обработчики событий
        setupBannerEvents(banner, targetUrl);
    }
    
    // Настройка событий баннера
    function setupBannerEvents(banner, targetUrl) {
        // Кнопка "Отмена"
        document.getElementById('metro-guard-cancel').addEventListener('click', function() {
            closeBanner();
        });
        
        // Кнопка "Перейти"
        document.getElementById('metro-guard-continue').addEventListener('click', function() {
            // Визуальная обратная связь
            const originalText = this.innerHTML;
            this.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <div style="
                        width: 16px;
                        height: 16px;
                        border: 2px solid rgba(255,255,255,0.3);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: metro-spin 1s linear infinite;
                    "></div>
                    <span>Переход...</span>
                </div>
            `;
            this.disabled = true;
            
            // Переход через секунду
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 1000);
        });
        
        // Закрытие по клику на фон
        banner.addEventListener('click', function(e) {
            if (e.target === this) {
                closeBanner();
            }
        });
        
        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeBanner();
            }
        });
        
        // Добавляем CSS анимацию
        if (!document.getElementById('metro-guard-styles')) {
            const style = document.createElement('style');
            style.id = 'metro-guard-styles';
            style.textContent = `
                @keyframes metro-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .metro-external-link {
                    position: relative;
                }
                
                .metro-external-link::after {
                    content: ' ↗';
                    color: #0066CC;
                    font-size: 0.9em;
                    margin-left: 2px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Закрытие баннера
    function closeBanner() {
        const banner = document.getElementById('metro-link-guard');
        if (banner) {
            banner.style.opacity = '0';
            banner.style.transition = 'opacity 0.2s ease';
            
            setTimeout(() => {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
                document.body.style.overflow = '';
            }, 200);
        }
    }
    
    // Обработчик кликов по ссылкам
    function handleLinkClick(e) {
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        if (isExternalLink(href)) {
            e.preventDefault();
            e.stopPropagation();
            createBanner(href);
            return false;
        }
        
        return true;
    }
    
    // Инициализация
    function init() {
        // Находим все ссылки
        const links = document.querySelectorAll('a[href]');
        let externalCount = 0;
        
        links.forEach(link => {
            if (isExternalLink(link.href)) {
                externalCount++;
                link.classList.add('metro-external-link');
                
                // Удаляем старые обработчики чтобы избежать дублирования
                link.removeEventListener('click', handleLinkClick);
                link.addEventListener('click', handleLinkClick);
            }
        });
        
        console.log(`🚇 Metro Link Guard: ${externalCount} внешних ссылок защищено`);
        
        // Наблюдатель за динамическим контентом
        const observer = new MutationObserver(function() {
            // Переинициализируем при изменении DOM
            setTimeout(init, 100);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
