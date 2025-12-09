// =============================================
// M E T R O   N E W   L I N K   G U A R D
// Скрипт защиты внешних ссылок
// Лицензия: © 2025 Метро New. Все права защищены.
// =============================================

(function() {
    'use strict';
    
    // === КОНФИГУРАЦИЯ ===
    const METRO_CONFIG = {
        // Информация о лицензии
        LICENSE: {
            PROJECT: "Metro New",
            DATE: "09.12.2025",
            COPYRIGHT: "© 2025 Метро New. Все права защищены.",
            VERSION: "1.0.0"
        },
        
        // Безопасные домены (без предупреждения)
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
            't.me'
        ],
        
        // Тексты интерфейса
        TEXTS: {
            TITLE: "Внешний переход",
            QUESTION: "Вы хотите перейти на сайт:",
            WARNING_1: "Мы не отвечаем за вашу безопасность",
            WARNING_2: "На сайте могут быть другие правила",
            BUTTON_YES: "Да, перейти",
            BUTTON_NO: "Нет, остаться",
            LOADING: "Проверка безопасности..."
        },
        
        // Настройки стилей
        STYLES: {
            PRIMARY_COLOR: "rgba(0, 102, 204, 0.8)",    // Синий Metro
            SECONDARY_COLOR: "rgba(255, 215, 0, 0.8)",  // Желтый Metro
            GLASS_BLUR: "15px",
            ANIMATION_DURATION: "0.3s"
        }
    };
    
    // === ПЕРЕМЕННЫЕ СИСТЕМЫ ===
    let currentDomain = window.location.hostname;
    let isInitialized = false;
    
    // === ОСНОВНЫЕ ФУНКЦИИ ===
    
    // Проверка внешней ссылки
    function isExternalLink(url) {
        if (!url || typeof url !== 'string') return false;
        
        try {
            // Игнорируем специальные ссылки
            if (url.startsWith('#') || 
                url.startsWith('javascript:') || 
                url.startsWith('mailto:') ||
                url.startsWith('tel:')) {
                return false;
            }
            
            // Игнорируем относительные пути
            if (url.startsWith('/') || 
                url.startsWith('./') || 
                url.startsWith('../') ||
                !url.includes('://')) {
                return false;
            }
            
            // Парсим URL
            let parsedUrl;
            try {
                parsedUrl = new URL(url);
            } catch {
                return false;
            }
            
            const targetHost = parsedUrl.hostname.toLowerCase();
            
            // Проверяем наш ли это домен
            if (targetHost === currentDomain.toLowerCase()) {
                return false;
            }
            
            // Проверяем безопасные домены
            for (const safeDomain of METRO_CONFIG.SAFE_DOMAINS) {
                if (targetHost === safeDomain || 
                    targetHost.endsWith('.' + safeDomain)) {
                    return false;
                }
            }
            
            // Если дошли сюда - ссылка внешняя
            console.log(`🚇 Metro Guard: Обнаружена внешняя ссылка → ${targetHost}`);
            return true;
            
        } catch (error) {
            console.warn('Metro Guard: Ошибка проверки ссылки', error);
            return false;
        }
    }
    
    // Создание стеклянного баннера
    function createGlassBanner(targetUrl) {
        // Удаляем старый баннер если есть
        const existingBanner = document.getElementById('metro-glass-guard');
        if (existingBanner) {
            existingBanner.remove();
        }
        
        // Создаем основной контейнер
        const banner = document.createElement('div');
        banner.id = 'metro-glass-guard';
        
        // Стиль фона (стеклянный эффект)
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(${METRO_CONFIG.STYLES.GLASS_BLUR});
            -webkit-backdrop-filter: blur(${METRO_CONFIG.STYLES.GLASS_BLUR});
            z-index: 2147483647;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: metroFadeIn ${METRO_CONFIG.STYLES.ANIMATION_DURATION} ease;
            font-family: 'Montserrat', 'Segoe UI', system-ui, sans-serif;
        `;
        
        // Содержимое баннера
        banner.innerHTML = `
            <div style="
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.12);
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                border-radius: 24px;
                padding: 50px;
                max-width: 600px;
                width: 90%;
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 0 0 1px rgba(255, 255, 255, 0.05);
                text-align: center;
                color: rgba(255, 255, 255, 0.95);
                animation: metroSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            ">
                <!-- Заголовок -->
                <div style="
                    margin-bottom: 40px;
                ">
                    <div style="
                        font-size: 36px;
                        font-weight: 300;
                        letter-spacing: -0.5px;
                        margin-bottom: 10px;
                        background: linear-gradient(135deg, 
                            rgba(255, 255, 255, 0.95), 
                            rgba(255, 255, 255, 0.7));
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    ">
                        ${METRO_CONFIG.TEXTS.TITLE}
                    </div>
                    
                    <div style="
                        height: 2px;
                        width: 80px;
                        background: linear-gradient(90deg, 
                            transparent, 
                            ${METRO_CONFIG.STYLES.PRIMARY_COLOR}, 
                            transparent);
                        margin: 0 auto;
                        border-radius: 1px;
                    "></div>
                </div>
                
                <!-- Вопрос -->
                <div style="
                    font-size: 20px;
                    font-weight: 400;
                    margin-bottom: 25px;
                    color: rgba(255, 255, 255, 0.85);
                    line-height: 1.5;
                ">
                    ${METRO_CONFIG.TEXTS.QUESTION}
                </div>
                
                <!-- Целевой URL -->
                <div style="
                    background: rgba(0, 0, 0, 0.25);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 22px;
                    margin: 30px 0;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                ">
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 1px;
                        background: linear-gradient(90deg, 
                            transparent, 
                            ${METRO_CONFIG.STYLES.PRIMARY_COLOR}, 
                            transparent);
                    "></div>
                    
                    <div style="
                        font-family: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace;
                        font-size: 15px;
                        color: ${METRO_CONFIG.STYLES.PRIMARY_COLOR};
                        word-break: break-all;
                        line-height: 1.6;
                        text-shadow: 0 0 20px ${METRO_CONFIG.STYLES.PRIMARY_COLOR}40;
                    ">
                        ${targetUrl}
                    </div>
                    
                    <div style="
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 1px;
                        background: linear-gradient(90deg, 
                            transparent, 
                            ${METRO_CONFIG.STYLES.PRIMARY_COLOR}, 
                            transparent);
                    "></div>
                </div>
                
                <!-- Предупреждения -->
                <div style="
                    background: linear-gradient(135deg, 
                        rgba(255, 100, 100, 0.08), 
                        rgba(255, 150, 50, 0.05));
                    border: 1px solid rgba(255, 100, 100, 0.15);
                    border-radius: 16px;
                    padding: 25px;
                    margin: 35px 0;
                    text-align: left;
                    backdrop-filter: blur(10px);
                ">
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        gap: 15px;
                        margin-bottom: 15px;
                    ">
                        <div style="
                            color: rgba(255, 100, 100, 0.9);
                            font-size: 20px;
                            flex-shrink: 0;
                            margin-top: 2px;
                        ">
                            ⚠️
                        </div>
                        <div style="
                            color: rgba(255, 200, 200, 0.95);
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            ${METRO_CONFIG.TEXTS.WARNING_1}
                        </div>
                    </div>
                    
                    <div style="
                        display: flex;
                        align-items: flex-start;
                        gap: 15px;
                    ">
                        <div style="
                            color: rgba(255, 150, 50, 0.9);
                            font-size: 20px;
                            flex-shrink: 0;
                            margin-top: 2px;
                        ">
                            📋
                        </div>
                        <div style="
                            color: rgba(255, 220, 180, 0.95);
                            font-size: 16px;
                            line-height: 1.6;
                        ">
                            ${METRO_CONFIG.TEXTS.WARNING_2}
                        </div>
                    </div>
                </div>
                
                <!-- Кнопки действий -->
                <div style="
                    display: flex;
                    gap: 20px;
                    margin: 40px 0 30px;
                ">
                    <button id="metro-guard-cancel" style="
                        flex: 1;
                        padding: 20px;
                        background: rgba(255, 255, 255, 0.07);
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        border-radius: 14px;
                        color: rgba(255, 255, 255, 0.9);
                        font-size: 17px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        letter-spacing: 0.3px;
                    ">
                        ${METRO_CONFIG.TEXTS.BUTTON_NO}
                    </button>
                    
                    <button id="metro-guard-proceed" style="
                        flex: 1;
                        padding: 20px;
                        background: linear-gradient(135deg, 
                            ${METRO_CONFIG.STYLES.PRIMARY_COLOR}, 
                            rgba(0, 82, 163, 0.8));
                        border: 1px solid rgba(77, 148, 255, 0.3);
                        border-radius: 14px;
                        color: white;
                        font-size: 17px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        letter-spacing: 0.3px;
                        box-shadow: 0 8px 32px rgba(0, 102, 204, 0.25);
                        position: relative;
                        overflow: hidden;
                    ">
                        <span style="
                            position: relative;
                            z-index: 2;
                        ">
                            ${METRO_CONFIG.TEXTS.BUTTON_YES}
                        </span>
                        <div style="
                            position: absolute;
                            top: 0;
                            left: -100%;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(90deg, 
                                transparent, 
                                rgba(255, 255, 255, 0.2), 
                                transparent);
                            transition: left 0.6s;
                        "></div>
                    </button>
                </div>
                
                <!-- ЛИЦЕНЗИОННАЯ ИНФОРМАЦИЯ -->
                <div style="
                    margin-top: 40px;
                    padding-top: 25px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                ">
                    <div style="
                        font-size: 11px;
                        color: rgba(255, 255, 255, 0.3);
                        letter-spacing: 1px;
                        margin-bottom: 8px;
                        font-family: 'Courier New', monospace;
                    ">
                        ------------------------------------------------
                    </div>
                    
                    <div style="
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.4);
                        line-height: 1.8;
                        margin-bottom: 5px;
                    ">
                        Лицензия на использование для проекта ${METRO_CONFIG.LICENSE.PROJECT}
                    </div>
                    
                    <div style="
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.4);
                        line-height: 1.8;
                        margin-bottom: 5px;
                    ">
                        Дата: ${METRO_CONFIG.LICENSE.DATE}
                    </div>
                    
                    <div style="
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.4);
                        line-height: 1.8;
                        margin-bottom: 5px;
                    ">
                        Скрипт принадлежит проекту ${METRO_CONFIG.LICENSE.PROJECT}
                    </div>
                    
                    <div style="
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.5);
                        font-weight: 500;
                        line-height: 1.8;
                        margin: 10px 0;
                    ">
                        ${METRO_CONFIG.LICENSE.COPYRIGHT}
                    </div>
                    
                    <div style="
                        font-size: 11px;
                        color: rgba(255, 255, 255, 0.3);
                        letter-spacing: 1px;
                        margin-top: 8px;
                        font-family: 'Courier New', monospace;
                    ">
                        ------------------------------------------------
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем баннер на страницу
        document.body.appendChild(banner);
        document.body.style.overflow = 'hidden';
        
        // Добавляем анимации
        addAnimations();
        
        // Назначаем обработчики событий
        setTimeout(() => {
            // Кнопка "Нет, остаться"
            document.getElementById('metro-guard-cancel').addEventListener('click', closeBanner);
            document.getElementById('metro-guard-cancel').addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255, 255, 255, 0.12)';
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.1)';
            });
            document.getElementById('metro-guard-cancel').addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255, 255, 255, 0.07)';
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
            
            // Кнопка "Да, перейти"
            const proceedBtn = document.getElementById('metro-guard-proceed');
            proceedBtn.addEventListener('click', function() {
                // Добавляем анимацию загрузки
                const originalText = this.innerHTML;
                this.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <div style="
                            width: 18px;
                            height: 18px;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-top-color: white;
                            border-radius: 50%;
                            animation: metroSpin 1s linear infinite;
                        "></div>
                        <span>${METRO_CONFIG.TEXTS.LOADING}</span>
                    </div>
                `;
                this.disabled = true;
                
                // Задержка перед переходом
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 800);
            });
            
            proceedBtn.addEventListener('mouseenter', function() {
                if (!this.disabled) {
                    this.style.transform = 'translateY(-3px)';
                    this.style.boxShadow = '0 15px 40px rgba(0, 102, 204, 0.35)';
                    const shine = this.querySelector('div');
                    if (shine) {
                        shine.style.left = '100%';
                        shine.style.transition = 'left 0.8s';
                    }
                }
            });
            
            proceedBtn.addEventListener('mouseleave', function() {
                if (!this.disabled) {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 8px 32px rgba(0, 102, 204, 0.25)';
                    const shine = this.querySelector('div');
                    if (shine) {
                        shine.style.left = '-100%';
                    }
                }
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
            
        }, 10);
    }
    
    // Закрытие баннера
    function closeBanner() {
        const banner = document.getElementById('metro-glass-guard');
        if (banner) {
            banner.style.opacity = '0';
            banner.style.transition = `opacity ${METRO_CONFIG.STYLES.ANIMATION_DURATION} ease`;
            
            setTimeout(() => {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
                document.body.style.overflow = '';
            }, 300);
        }
    }
    
    // Добавление CSS анимаций
    function addAnimations() {
        const style = document.createElement('style');
        style.id = 'metro-guard-styles';
        style.textContent = `
            @keyframes metroFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes metroSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(40px) scale(0.98);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes metroSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Стиль для внешних ссылок */
            .metro-external-link {
                position: relative;
                transition: all 0.3s ease;
            }
            
            .metro-external-link:hover {
                opacity: 0.9;
            }
            
            .metro-external-link::after {
                content: ' ↗';
                font-size: 0.85em;
                color: ${METRO_CONFIG.STYLES.PRIMARY_COLOR};
                opacity: 0.7;
                margin-left: 2px;
                transition: opacity 0.3s;
            }
            
            .metro-external-link:hover::after {
                opacity: 1;
            }
        `;
        
        if (!document.getElementById('metro-guard-styles')) {
            document.head.appendChild(style);
        }
    }
    
    // Обработчик кликов по ссылкам
    function handleLinkClick(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        if (!href) return true;
        
        if (isExternalLink(href)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            createGlassBanner(href);
            return false;
        }
        
        return true;
    }
    
    // Инициализация системы
    function initLinkProtection() {
        if (isInitialized) return;
        
        console.log(`%c🚇 METRO NEW LINK GUARD v${METRO_CONFIG.LICENSE.VERSION}`, 
            'color: #0066CC; font-size: 14px; font-weight: bold;');
        console.log(`%c${METRO_CONFIG.LICENSE.COPYRIGHT}`, 
            'color: #666; font-size: 11px;');
        
        // Ищем все ссылки на странице
        const allLinks = document.querySelectorAll('a[href]');
        let protectedCount = 0;
        
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (isExternalLink(href)) {
                protectedCount++;
                
                // Добавляем класс для стилизации
                link.classList.add('metro-external-link');
                
                // Удаляем старые обработчики и добавляем новый
                link.removeEventListener('click', handleLinkClick);
                link.addEventListener('click', handleLinkClick, true);
            }
        });
        
        console.log(`🔒 Защищено ссылок: ${protectedCount}`);
        isInitialized = true;
        
        // Отслеживаем динамически добавленные ссылки
        const observer = new MutationObserver(function(mutations) {
            let needsUpdate = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate) {
                setTimeout(initLinkProtection, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
    }
    
    // Защита кода от копирования
    function protectCode() {
        // Защита от копирования через контекстное меню
        document.addEventListener('contextmenu', function(e) {
            if (e.target.closest('script') || 
                e.target.closest('#metro-glass-guard')) {
                e.preventDefault();
                
                // Показываем уведомление о лицензии
                const notice = document.createElement('div');
                notice.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 102, 204, 0.9);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    z-index: 999999;
                    animation: metroFadeIn 0.3s ease;
                    font-family: inherit;
                    font-size: 14px;
                    max-width: 300px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                `;
                notice.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px;">🔒 ${METRO_CONFIG.LICENSE.PROJECT}</div>
                    <div style="font-size: 12px; opacity: 0.9;">${METRO_CONFIG.LICENSE.COPYRIGHT}</div>
                `;
                
                document.body.appendChild(notice);
                setTimeout(() => notice.remove(), 3000);
                
                return false;
            }
        });
        
        // Защита от копирования через Ctrl+C
        document.addEventListener('copy', function(e) {
            const selectedText = window.getSelection().toString();
            if (selectedText.includes('metro-link-guard') || 
                selectedText.includes('METRO_CONFIG') ||
                selectedText.includes('createGlassBanner')) {
                
                e.preventDefault();
                alert('🚫 Копирование кода защищено лицензией!\n\n' + 
                      `${METRO_CONFIG.LICENSE.COPYRIGHT}\n` +
                      `Лицензия: ${METRO_CONFIG.LICENSE.DATE}`);
                
                return false;
            }
        });
    }
    
    // Инициализация
    function initialize() {
        protectCode();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initLinkProtection, 500);
            });
        } else {
            setTimeout(initLinkProtection, 500);
        }
        
        // Экспорт для отладки
        window.MetroGuard = {
            version: METRO_CONFIG.LICENSE.VERSION,
            testLink: isExternalLink,
            showBanner: createGlassBanner,
            license: METRO_CONFIG.LICENSE,
            config: METRO_CONFIG
        };
    }
    
    // Запуск
    initialize();
    
})();
