// ============================================
// ПРОЗРАЧНЫЙ БАННЕР С ЛИЦЕНЗИЕЙ
// Лицензия на использование для проекта Метро NEW
// Дата: 09.12.2025
// Скрипт принадлежит проекту Метро NEW
// ============================================

(function() {
    'use strict';
    
    console.log('🚇 Metro NEW: Защита ссылок активирована');
    
    // Настройки
    const CONFIG = {
        license: {
            project: "Metro NEW",
            date: "09.12.2025",
            owner: "Проект Metro NEW",
            version: "1.0"
        },
        
        // Наш домен
        ourDomain: window.location.hostname,
        
        // Не проверяем эти домены
        skipDomains: [
            'roblox.com',
            'discord.gg',
            'discord.com',
            'youtube.com',
            'youtu.be',
            'github.com',
            'vk.com',
            'web.telegram.org'
        ],
        
        // Сообщения
        messages: {
            title: "Внешний переход",
            question: "Вы хотите перейти на сайт:",
            warning: "Мы не отвечаем за вашу безопасность",
            warning2: "На сайте могут быть другие правила",
            yes: "Да, перейти",
            no: "Нет, остаться"
        }
    };
    
    // Проверяем внешняя ли ссылка
    function isExternalLink(href) {
        if (!href || typeof href !== 'string') return false;
        
        try {
            // Пропускаем якоря и javascript
            if (href.startsWith('#') || href.startsWith('javascript:')) {
                return false;
            }
            
            // Пропускаем относительные
            if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
                return false;
            }
            
            // Создаем URL
            let url;
            try {
                url = new URL(href);
            } catch {
                return false;
            }
            
            const targetHost = url.hostname;
            
            // Пропускаем наш домен
            if (targetHost === CONFIG.ourDomain) {
                return false;
            }
            
            // Пропускаем доверенные домены
            for (const domain of CONFIG.skipDomains) {
                if (targetHost.includes(domain)) {
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            console.warn('Ошибка проверки ссылки:', error);
            return false;
        }
    }
    
    // Создаем стеклянный баннер
    function createGlassBanner(url) {
        // Удаляем старый баннер
        const oldBanner = document.getElementById('metro-glass-banner');
        if (oldBanner) oldBanner.remove();
        
        // Создаем баннер
        const banner = document.createElement('div');
        banner.id = 'metro-glass-banner';
        
        // Стиль баннера (стекло)
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.3s ease;
        `;
        
        // Содержимое (стеклянная карточка)
        banner.innerHTML = `
            <div style="
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                width: 90%;
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                text-align: center;
                color: white;
                font-family: 'Segoe UI', Arial, sans-serif;
                animation: slideUp 0.4s ease;
            ">
                <!-- Заголовок -->
                <div style="
                    font-size: 28px;
                    font-weight: 300;
                    margin-bottom: 30px;
                    color: rgba(255, 255, 255, 0.9);
                    letter-spacing: 1px;
                ">
                    ${CONFIG.messages.title}
                </div>
                
                <!-- Вопрос -->
                <div style="
                    font-size: 18px;
                    margin-bottom: 20px;
                    color: rgba(255, 255, 255, 0.8);
                ">
                    ${CONFIG.messages.question}
                </div>
                
                <!-- URL -->
                <div style="
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 15px;
                    margin: 20px 0;
                    word-break: break-all;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    color: #4d94ff;
                ">
                    ${url}
                </div>
                
                <!-- Предупреждения -->
                <div style="
                    background: rgba(255, 100, 100, 0.1);
                    border-left: 3px solid rgba(255, 100, 100, 0.5);
                    padding: 15px;
                    margin: 25px 0;
                    text-align: left;
                    border-radius: 0 8px 8px 0;
                ">
                    <div style="
                        color: rgba(255, 200, 200, 0.9);
                        font-size: 14px;
                        margin-bottom: 8px;
                    ">
                        ⚠️ ${CONFIG.messages.warning}
                    </div>
                    <div style="
                        color: rgba(255, 200, 200, 0.7);
                        font-size: 14px;
                    ">
                        ⚠️ ${CONFIG.messages.warning2}
                    </div>
                </div>
                
                <!-- Кнопки -->
                <div style="
                    display: flex;
                    gap: 20px;
                    margin-top: 30px;
                ">
                    <button id="metro-no-btn" style="
                        flex: 1;
                        padding: 16px;
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 12px;
                        color: white;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-weight: 500;
                    ">
                        ${CONFIG.messages.no}
                    </button>
                    
                    <button id="metro-yes-btn" style="
                        flex: 1;
                        padding: 16px;
                        background: linear-gradient(135deg, rgba(77, 148, 255, 0.8), rgba(0, 102, 204, 0.8));
                        border: 1px solid rgba(77, 148, 255, 0.3);
                        border-radius: 12px;
                        color: white;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-weight: 500;
                        box-shadow: 0 4px 15px rgba(77, 148, 255, 0.3);
                    ">
                        ${CONFIG.messages.yes}
                    </button>
                </div>
                
                <!-- Лицензия -->
                <div style="
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    line-height: 1.5;
                ">
                    <div>--------------------------------</div>
                    <div>Лицензия на использование для проекта ${CONFIG.license.project}</div>
                    <div>Дата: ${CONFIG.license.date}</div>
                    <div>Скрипт принадлежит проекту ${CONFIG.license.project}</div>
                    <div>--------------------------------</div>
                </div>
            </div>
        `;
        
        // Добавляем на страницу
        document.body.appendChild(banner);
        document.body.style.overflow = 'hidden';
        
        // Анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            #metro-no-btn:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(255, 255, 255, 0.1);
            }
            
            #metro-yes-btn:hover {
                background: linear-gradient(135deg, rgba(77, 148, 255, 1), rgba(0, 102, 204, 1)) !important;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(77, 148, 255, 0.5);
            }
        `;
        document.head.appendChild(style);
        
        // Обработчики
        setTimeout(() => {
            // Нет - закрыть
            document.getElementById('metro-no-btn').addEventListener('click', () => {
                closeBanner();
            });
            
            // Да - перейти
            document.getElementById('metro-yes-btn').addEventListener('click', () => {
                window.location.href = url;
            });
            
            // Закрытие по ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeBanner();
            });
            
            // Закрытие по клику на фон
            banner.addEventListener('click', (e) => {
                if (e.target === banner) closeBanner();
            });
        }, 100);
    }
    
    // Закрыть баннер
    function closeBanner() {
        const banner = document.getElementById('metro-glass-banner');
        if (banner) {
            banner.style.opacity = '0';
            banner.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
                document.body.style.overflow = '';
            }, 300);
        }
    }
    
    // Обработчик кликов
    function handleLinkClick(e) {
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        if (!href) return true;
        
        // Проверяем внешняя ли ссылка
        if (isExternalLink(href)) {
            e.preventDefault();
            e.stopPropagation();
            
            // Показываем баннер
            createGlassBanner(href);
            return false;
        }
        
        return true;
    }
    
    // Добавляем обработчики
    function setupLinks() {
        console.log('🔗 Поиск ссылок на странице...');
        
        const allLinks = document.querySelectorAll('a[href]');
        let externalCount = 0;
        
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (isExternalLink(href)) {
                externalCount++;
                
                // Добавляем иконку
                if (!link.querySelector('.metro-ext-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'metro-ext-icon';
                    icon.innerHTML = ' ↗';
                    icon.style.cssText = `
                        font-size: 12px;
                        color: #4d94ff;
                        opacity: 0.7;
                        margin-left: 3px;
                    `;
                    link.appendChild(icon);
                }
                
                // Стиль для внешних ссылок
                link.style.cssText += `
                    position: relative;
                    transition: opacity 0.3s;
                `;
                
                link.addEventListener('mouseenter', () => {
                    link.style.opacity = '0.9';
                });
                
                link.addEventListener('mouseleave', () => {
                    link.style.opacity = '1';
                });
                
                // Обработчик клика
                link.addEventListener('click', handleLinkClick);
            }
        });
        
        console.log(`✅ Найдено внешних ссылок: ${externalCount}`);
    }
    
    // Защита кода
    function protectCode() {
        // Запрещаем копирование кода
        document.addEventListener('copy', (e) => {
            if (window.location.href.includes('/external-link-warning.js')) {
                e.preventDefault();
                alert('Копирование кода защищено лицензией!');
            }
        });
        
        // Запрещаем просмотр исходного кода
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('script[src*="transparent-warning"]')) {
                e.preventDefault();
                return false;
            }
        });
        
        // Шифрование в консоли
        console.log(`%c🔒 ${CONFIG.license.project} - Защищенный скрипт`, 
            'color: #4d94ff; font-size: 16px; font-weight: bold;');
        console.log(`%cЛицензия: ${CONFIG.license.date} | Версия: ${CONFIG.license.version}`,
            'color: #888; font-size: 12px;');
    }
    
    // Инициализация
    function init() {
        console.log('🚇 Инициализация системы защиты ссылок...');
        
        // Защищаем код
        protectCode();
        
        // Настраиваем ссылки
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(setupLinks, 1000);
            });
        } else {
            setTimeout(setupLinks, 1000);
        }
        
        // Отслеживаем новые ссылки
        const observer = new MutationObserver(() => {
            setupLinks();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Запускаем
    init();
    
    // Экспортируем для отладки
    window.MetroLinkGuard = {
        version: CONFIG.license.version,
        testLink: function(url) {
            return isExternalLink(url);
        },
        showBanner: function(url) {
            createGlassBanner(url);
        },
        licenseInfo: CONFIG.license
    };
    
})();
