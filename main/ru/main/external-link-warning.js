// ============================================
// СИСТЕМА ПРЕДУПРЕЖДЕНИЯ О ВНЕШНИХ ССЫЛКАХ
// Простая и рабочая версия
// ============================================

(function() {
    'use strict';
    
    console.log('🚀 Запуск системы предупреждения о внешних ссылках...');
    
    // Настройки
    const CONFIG = {
        // Наш сайт (текущий домен)
        ourDomain: window.location.hostname,
        
        // Доверенные сайты (без предупреждения)
        trustedDomains: [
            'discord.com',
            'roblox.com',
            'robloxgames.com',
            'github.com',
            'youtube.com',
            'youtu.be',
            'twitter.com',
            'x.com',
            'vk.com',
            'web.telegram.org'
        ],
        
        // Сообщения
        messages: {
            title: '⚠️ Внимание: Внешняя ссылка',
            text: 'Вы собираетесь перейти на другой сайт. Мы не контролируем контент на внешних ресурсах.',
            stay: 'Остаться здесь',
            proceed: 'Перейти (на свой риск)',
            url: 'Ссылка: '
        }
    };
    
    // Проверяем, внешняя ли ссылка
    function isExternalLink(href) {
        if (!href) return false;
        
        try {
            // Если это якорная ссылка (#) или javascript:
            if (href.startsWith('#') || href.startsWith('javascript:')) {
                return false;
            }
            
            // Если это относительная ссылка
            if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
                return false;
            }
            
            // Создаем URL объект
            let url;
            try {
                url = new URL(href);
            } catch (e) {
                // Если не валидный URL, вероятно относительная ссылка
                return false;
            }
            
            const targetHost = url.hostname;
            const currentHost = CONFIG.ourDomain;
            
            console.log(`🔗 Проверка ссылки: ${href}`);
            console.log(`🏠 Наш домен: ${currentHost}`);
            console.log(`🎯 Целевой домен: ${targetHost}`);
            
            // Если это наш домен
            if (targetHost === currentHost || 
                targetHost.endsWith('.' + currentHost) || 
                currentHost.endsWith('.' + targetHost)) {
                console.log('✅ Это наш домен');
                return false;
            }
            
            // Проверяем доверенные домены
            for (const trusted of CONFIG.trustedDomains) {
                if (targetHost === trusted || 
                    targetHost.endsWith('.' + trusted) ||
                    targetHost.includes(trusted)) {
                    console.log(`✅ Доверенный домен: ${trusted}`);
                    return false;
                }
            }
            
            console.log('🚨 Это внешняя ссылка!');
            return true;
            
        } catch (error) {
            console.warn('Ошибка проверки ссылки:', error);
            return false;
        }
    }
    
    // Создаем модальное окно
    function createModal(url) {
        // Удаляем старую модалку если есть
        const oldModal = document.getElementById('external-warning-modal');
        if (oldModal) {
            document.body.removeChild(oldModal);
        }
        
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.id = 'external-warning-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
        `;
        
        // Содержимое модалки
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
            ">
                <h2 style="
                    color: #d35400;
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <span>⚠️</span>
                    <span>${CONFIG.messages.title}</span>
                </h2>
                
                <p style="
                    color: #333;
                    line-height: 1.6;
                    margin-bottom: 20px;
                    font-size: 16px;
                ">
                    ${CONFIG.messages.text}
                </p>
                
                <div style="
                    background: #fff8e1;
                    border-left: 4px solid #f39c12;
                    padding: 15px;
                    margin-bottom: 25px;
                    border-radius: 0 4px 4px 0;
                ">
                    <strong style="color: #d35400;">${CONFIG.messages.url}</strong>
                    <span style="
                        color: #2c3e50;
                        word-break: break-all;
                        font-size: 14px;
                    ">${url}</span>
                </div>
                
                <div style="
                    display: flex;
                    gap: 15px;
                    margin-top: 30px;
                ">
                    <button id="stay-btn" style="
                        flex: 1;
                        padding: 14px;
                        background: #ecf0f1;
                        border: 2px solid #bdc3c7;
                        border-radius: 8px;
                        color: #2c3e50;
                        font-weight: bold;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        ${CONFIG.messages.stay}
                    </button>
                    
                    <button id="proceed-btn" style="
                        flex: 1;
                        padding: 14px;
                        background: #e74c3c;
                        border: 2px solid #c0392b;
                        border-radius: 8px;
                        color: white;
                        font-weight: bold;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        ${CONFIG.messages.proceed}
                    </button>
                </div>
            </div>
        `;
        
        // Добавляем анимацию
        const style = document.createElement('style');
        style.textContent = `
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
            
            #stay-btn:hover {
                background: #d5dbdb !important;
                transform: translateY(-2px);
            }
            
            #proceed-btn:hover {
                background: #c0392b !important;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(231, 76, 60, 0.4);
            }
        `;
        document.head.appendChild(style);
        
        // Добавляем модалку в DOM
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Назначаем обработчики
        setTimeout(() => {
            document.getElementById('stay-btn').addEventListener('click', function() {
                closeModal();
            });
            
            document.getElementById('proceed-btn').addEventListener('click', function() {
                window.location.href = url;
            });
            
            // Закрытие по клику на фон
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // Закрытие по ESC
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeModal();
                }
            });
        }, 100);
        
        return modal;
    }
    
    // Закрываем модалку
    function closeModal() {
        const modal = document.getElementById('external-warning-modal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
                document.body.style.overflow = '';
            }, 300);
        }
    }
    
    // Обработчик клика по ссылке
    function handleLinkClick(e) {
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        if (!href) return;
        
        console.log(`🖱️ Клик по ссылке: ${href}`);
        
        // Если это внешняя ссылка и не открывается в новой вкладке
        if (isExternalLink(href) && (!link.target || link.target === '_self')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🛑 Остановлен переход по внешней ссылке');
            
            // Показываем предупреждение
            createModal(href);
            return false;
        }
        
        // Если ссылка открывается в новой вкладке, пропускаем
        console.log('✅ Ссылка открывается в новой вкладке или это внутренняя ссылка');
        return true;
    }
    
    // Добавляем обработчики ко всем ссылкам
    function attachListeners() {
        console.log('🔍 Поиск всех ссылок на странице...');
        
        // Находим ВСЕ ссылки
        const allLinks = document.querySelectorAll('a[href]');
        console.log(`📊 Найдено ссылок: ${allLinks.length}`);
        
        let externalCount = 0;
        
        allLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            
            if (isExternalLink(href)) {
                externalCount++;
                
                // Добавляем иконку внешней ссылки
                if (!link.querySelector('.ext-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'ext-icon';
                    icon.innerHTML = ' ↗';
                    icon.style.cssText = `
                        font-size: 12px;
                        color: #e74c3c;
                        margin-left: 3px;
                        font-weight: bold;
                    `;
                    link.appendChild(icon);
                }
                
                // Добавляем стиль для внешних ссылок
                link.style.cssText += `
                    border-bottom: 1px dashed #e74c3c;
                    position: relative;
                `;
                
                // Добавляем обработчик
                link.addEventListener('click', handleLinkClick);
                
                console.log(`🔗 Внешняя ссылка ${externalCount}: ${href}`);
            }
        });
        
        console.log(`🎯 Всего внешних ссылок: ${externalCount}`);
        
        // Также обрабатываем динамически добавленные ссылки
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    console.log('🔄 Обнаружены новые элементы, проверяем ссылки...');
                    setTimeout(attachListeners, 100);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Запуск
    function init() {
        console.log('🚀 Инициализация системы предупреждения...');
        
        // Ждем полной загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                console.log('📄 DOM загружен, запускаем...');
                setTimeout(attachListeners, 500);
            });
        } else {
            console.log('📄 DOM уже загружен, запускаем...');
            setTimeout(attachListeners, 500);
        }
    }
    
    // Запускаем сразу
    init();
    
    // Экспортируем функции для отладки
    window.MetroLinkProtection = {
        isExternalLink: isExternalLink,
        showWarning: function(url) {
            createModal(url);
        },
        testLinks: function() {
            const links = document.querySelectorAll('a[href]');
            console.log('=== ТЕСТ ССЫЛОК ===');
            links.forEach((link, i) => {
                const href = link.getAttribute('href');
                console.log(`${i + 1}. ${href} - внешняя: ${isExternalLink(href)}`);
            });
        }
    };
    
    console.log('✅ Система предупреждения инициализирована');
    console.log('Для теста в консоли: MetroLinkProtection.testLinks()');
    
})();
