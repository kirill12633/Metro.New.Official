// ============================================
// СИСТЕМА ПРЕДУПРЕЖДЕНИЯ О ВНЕШНИХ ССЫЛКАХ
// Для защиты пользователей Metro New
// ============================================

(function() {
    'use strict';
    
    // Конфигурация
    const CONFIG = {
        // Белый список наших доменов
        ourDomains: [
            'metronew.dev',
            'metro-new.ru',
            'localhost',
            '127.0.0.1'
        ],
        
        // Предупреждаем о всех внешних ссылках
        warnAllExternal: true,
        
        // Не показывать предупреждение для этих доменов
        trustedDomains: [
            'discord.com',
            'roblox.com',
            'github.com',
            'youtube.com'
        ],
        
        // Тексты
        messages: {
            title: '⚠️ Внимание: Внешняя ссылка',
            message: 'Вы покидаете официальный сайт Metro New. Мы не можем гарантировать безопасность внешних ресурсов.',
            details: `Вы переходите по ссылке: <br><strong id="warning-url"></strong><br><br>
                     <strong>Важно:</strong><br>
                     • На внешних сайтах действуют свои правила<br>
                     • Мы не несем ответственности за контент других сайтов<br>
                     • Будьте осторожны при вводе личных данных<br>
                     • Проверяйте адресную строку браузера`,
            stayBtn: 'Остаться на сайте',
            proceedBtn: 'Перейти (на свой страх и риск)',
            rememberCheckbox: 'Запомнить выбор для этого сайта'
        },
        
        // Настройки localStorage
        storageKey: 'metro_external_links_settings'
    };
    
    // Проверяем, является ли ссылка внешней
    function isExternalLink(url) {
        if (!url) return false;
        
        try {
            const urlObj = new URL(url, window.location.origin);
            const currentHost = window.location.hostname;
            const targetHost = urlObj.hostname;
            
            // Проверяем наш ли это домен
            for (const domain of CONFIG.ourDomains) {
                if (currentHost.includes(domain) || targetHost.includes(domain)) {
                    return false;
                }
            }
            
            // Проверяем доверенные домены
            for (const domain of CONFIG.trustedDomains) {
                if (targetHost.includes(domain)) {
                    return false;
                }
            }
            
            // Если домен не наш и не доверенный - это внешняя ссылка
            return targetHost && targetHost !== currentHost;
        } catch (e) {
            return false;
        }
    }
    
    // Получаем настройки из localStorage
    function getSettings() {
        try {
            const settings = localStorage.getItem(CONFIG.storageKey);
            return settings ? JSON.parse(settings) : {};
        } catch (e) {
            return {};
        }
    }
    
    // Сохраняем настройки в localStorage
    function saveSettings(settings) {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(settings));
        } catch (e) {
            console.warn('Не удалось сохранить настройки');
        }
    }
    
    // Показываем предупреждение
    function showWarning(url, originalEvent) {
        // Если пользователь уже разрешил этот домен
        const settings = getSettings();
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        if (settings.allowedDomains && settings.allowedDomains.includes(domain)) {
            proceedToUrl(url);
            return;
        }
        
        // Отменяем стандартное действие
        if (originalEvent) {
            originalEvent.preventDefault();
            originalEvent.stopPropagation();
        }
        
        // Создаем модальное окно
        createWarningModal(url);
    }
    
    // Создаем модальное окно предупреждения
    function createWarningModal(url) {
        // Удаляем старые модалки
        const oldModal = document.getElementById('metro-external-warning');
        if (oldModal) oldModal.remove();
        
        // Создаем HTML
        const modalHTML = `
            <div id="metro-external-warning" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                z-index: 1000000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            ">
                <div style="
                    background: white;
                    border-radius: 15px;
                    max-width: 500px;
                    width: 100%;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    animation: slideUp 0.3s ease;
                ">
                    <!-- Заголовок -->
                    <div style="
                        background: linear-gradient(135deg, #ff6b6b, #ffa726);
                        color: white;
                        padding: 20px;
                        text-align: center;
                    ">
                        <div style="font-size: 24px; font-weight: 700; margin-bottom: 5px;">
                            ⚠️
                        </div>
                        <div style="font-size: 18px; font-weight: 600;">
                            ${CONFIG.messages.title}
                        </div>
                    </div>
                    
                    <!-- Сообщение -->
                    <div style="padding: 25px;">
                        <div style="
                            font-size: 16px;
                            color: #333;
                            line-height: 1.6;
                            margin-bottom: 20px;
                        ">
                            ${CONFIG.messages.message}
                        </div>
                        
                        <div style="
                            background: #fff8e1;
                            border-left: 4px solid #ffa726;
                            padding: 15px;
                            margin-bottom: 20px;
                            border-radius: 0 8px 8px 0;
                        ">
                            ${CONFIG.messages.details}
                        </div>
                        
                        <!-- Чекбокс "Запомнить" -->
                        <div style="margin-bottom: 25px;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" id="remember-choice" style="
                                    margin-right: 10px;
                                    width: 18px;
                                    height: 18px;
                                ">
                                <span style="color: #666; font-size: 14px;">
                                    ${CONFIG.messages.rememberCheckbox}
                                </span>
                            </label>
                        </div>
                        
                        <!-- Кнопки -->
                        <div style="display: flex; gap: 15px;">
                            <button id="stay-btn" style="
                                flex: 1;
                                background: #f8f9fa;
                                border: 2px solid #dee2e6;
                                color: #495057;
                                padding: 14px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-family: inherit;
                                font-weight: 600;
                                font-size: 16px;
                                transition: all 0.3s;
                            ">
                                ${CONFIG.messages.stayBtn}
                            </button>
                            
                            <button id="proceed-btn" style="
                                flex: 1;
                                background: #dc3545;
                                border: 2px solid #dc3545;
                                color: white;
                                padding: 14px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-family: inherit;
                                font-weight: 600;
                                font-size: 16px;
                                transition: all 0.3s;
                            ">
                                ${CONFIG.messages.proceedBtn}
                            </button>
                        </div>
                    </div>
                    
                    <!-- Предупреждение внизу -->
                    <div style="
                        background: #f8f9fa;
                        border-top: 1px solid #dee2e6;
                        padding: 15px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    ">
                        <strong>Внимание:</strong> Мы не контролируем контент на других сайтах
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем в DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
        document.body.style.overflow = 'hidden';
        
        // Устанавливаем URL
        setTimeout(() => {
            document.getElementById('warning-url').textContent = url;
        }, 100);
        
        // Назначаем обработчики
        setTimeout(() => {
            document.getElementById('stay-btn').addEventListener('click', closeWarning);
            document.getElementById('proceed-btn').addEventListener('click', () => proceedWithWarning(url));
            
            // Закрытие по клику вне модалки
            document.getElementById('metro-external-warning').addEventListener('click', function(e) {
                if (e.target === this) closeWarning();
            });
            
            // Закрытие по ESC
            document.addEventListener('keydown', handleEscape);
        }, 100);
    }
    
    // Обработка нажатия ESC
    function handleEscape(e) {
        if (e.key === 'Escape') {
            closeWarning();
        }
    }
    
    // Закрыть предупреждение
    function closeWarning() {
        const modal = document.getElementById('metro-external-warning');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleEscape);
            }, 300);
        }
    }
    
    // Перейти с учетом предупреждения
    function proceedWithWarning(url) {
        const remember = document.getElementById('remember-choice')?.checked;
        
        if (remember) {
            const settings = getSettings();
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            if (!settings.allowedDomains) {
                settings.allowedDomains = [];
            }
            
            if (!settings.allowedDomains.includes(domain)) {
                settings.allowedDomains.push(domain);
                saveSettings(settings);
            }
        }
        
        proceedToUrl(url);
    }
    
    // Перейти по URL
    function proceedToUrl(url) {
        closeWarning();
        
        // Добавляем небольшой таймаут для плавности
        setTimeout(() => {
            window.location.href = url;
        }, 100);
    }
    
    // Вешаем обработчики на все внешние ссылки
    function attachLinkListeners() {
        // Находим все ссылки
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            if (isExternalLink(href)) {
                // Добавляем иконку внешней ссылки
                if (!link.querySelector('.external-link-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'external-link-icon';
                    icon.innerHTML = ' ↗';
                    icon.style.cssText = `
                        font-size: 12px;
                        color: #666;
                        margin-left: 2px;
                    `;
                    link.appendChild(icon);
                }
                
                // Добавляем атрибут для стилизации
                link.setAttribute('data-external-link', 'true');
                
                // Вешаем обработчик
                link.addEventListener('click', function(e) {
                    // Если это не новая вкладка
                    if (!link.target || link.target === '_self') {
                        showWarning(href, e);
                    }
                });
            }
        });
    }
    
    // Добавляем стили для внешних ссылок
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Стили для внешних ссылок */
            a[data-external-link="true"] {
                position: relative;
            }
            
            a[data-external-link="true"]:after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, #0066cc, transparent);
                opacity: 0.5;
            }
            
            a[data-external-link="true"]:hover:after {
                opacity: 1;
            }
            
            /* Кнопки в модалке */
            #stay-btn:hover {
                background: #e9ecef !important;
                transform: translateY(-2px);
            }
            
            #proceed-btn:hover {
                background: #c82333 !important;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Инициализация
    function init() {
        addStyles();
        attachLinkListeners();
        
        // Также обрабатываем динамически добавляемые ссылки
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    attachLinkListeners();
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('🚇 Metro New: Система защиты от внешних ссылок активирована');
    }
    
    // Запускаем
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Экспортируем API
    window.MetroLinkWarning = {
        showWarning: showWarning,
        closeWarning: closeWarning,
        isExternalLink: isExternalLink,
        getSettings: getSettings,
        saveSettings: saveSettings
    };
    
})();
