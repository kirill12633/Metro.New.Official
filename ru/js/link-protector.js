// external-link-protection.js - Защита от внешних ссылок
// Версия: 2.0.0
// https://kirill12633.github.io/Metro.New.Official/ru/js/external-link-protection.js

(function() {
    'use strict';

    // ========== ОПРЕДЕЛЕНИЕ СРЕДЫ ==========
    const isProduction = window.location.hostname !== 'localhost' &&
                        !window.location.hostname.includes('127.0.0.1') &&
                        !window.location.hostname.includes('github.io');

    // ========== ЛОГГЕР ==========
    const logger = {
        log: function() {
            if (!isProduction) console.log.apply(console, arguments);
        },
        warn: function() {
            if (!isProduction) console.warn.apply(console, arguments);
        },
        error: function() {
            if (!isProduction) console.error.apply(console, arguments);
        }
    };

    logger.log('🛡️ External Link Protection загружен');

    // ========== КОНФИГУРАЦИЯ ==========
    const CONFIG = {
        // Разрешённые домены (свои)
        allowedDomains: [
            'kirill12633.github.io',
            'metro-new.com',
            'support.metro.new',
            'status.metro.new'
        ],
        // Разрешённые протоколы
        allowedProtocols: ['http:', 'https:'],
        // Исключения (ссылки, которые не нужно проверять)
        exceptions: [
            '#',
            'javascript:void(0)',
            'mailto:',
            'tel:',
            'whatsapp:',
            'tg://'
        ],
        // Whois API для проверки доменов
        whoisApiUrl: 'https://api.metro.new/whois'
    };

    // ========== ПРОВЕРКА ССЫЛОК ==========

    /**
     * Проверка, является ли ссылка внешней
     */
    function isExternalLink(href) {
        if (!href || typeof href !== 'string') return false;

        // Проверяем исключения
        for (const exception of CONFIG.exceptions) {
            if (href.startsWith(exception) || href === exception) {
                return false;
            }
        }

        // Проверяем протокол
        const protocol = href.split(':')[0] + ':';
        if (!CONFIG.allowedProtocols.includes(protocol)) {
            return false;
        }

        try {
            const url = new URL(href);
            const hostname = url.hostname.toLowerCase();

            // Проверяем разрешённые домены
            for (const domain of CONFIG.allowedDomains) {
                if (hostname === domain || hostname.endsWith('.' + domain)) {
                    return false;
                }
            }

            // Если это тот же домен
            if (hostname === window.location.hostname) {
                return false;
            }

            return true;
        } catch(e) {
            // Если не удалось разобрать URL, считаем внутренней
            return false;
        }
    }

    /**
     * Получить имя домена для отображения
     */
    function getDomainName(href) {
        try {
            const url = new URL(href);
            return url.hostname.replace(/^www\./, '');
        } catch(e) {
            return href.split('/')[2] || href;
        }
    }

    /**
     * Проверить безопасность домена (проверка через whois API)
     */
    async function checkDomainSafety(domain) {
        // Список известных безопасных доменов (кэш)
        const safeDomains = [
            'google.com', 'youtube.com', 'roblox.com',
            'discord.com', 'telegram.org', 't.me',
            'github.com', 'gitlab.com', 'bitbucket.org',
            'wikipedia.org', 'wikimedia.org'
        ];

        if (safeDomains.includes(domain)) {
            return { safe: true, reason: 'Известный безопасный домен' };
        }

        // Проверка через whois API (если доступно)
        try {
            const response = await fetch(CONFIG.whoisApiUrl + '?domain=' + encodeURIComponent(domain));
            if (response.ok) {
                const data = await response.json();
                return {
                    safe: data.safe !== false,
                    reason: data.reason || 'Проверка через whois'
                };
            }
        } catch(e) {
            logger.warn('⚠️ Не удалось проверить домен через whois:', domain);
        }

        // Если не удалось проверить, считаем безопасным с предупреждением
        return { safe: true, reason: 'Не удалось проверить, переходите на свой страх и риск' };
    }

    // ========== ПОКАЗ ПРЕДУПРЕЖДЕНИЯ ==========

    function showWarning(href) {
        const domain = getDomainName(href);

        // Удаляем старые модалки
        const oldModal = document.getElementById('externalLinkModal');
        if (oldModal) oldModal.remove();

        // Блокируем скролл
        document.body.style.overflow = 'hidden';

        // Создаём оверлей
        const overlay = document.createElement('div');
        overlay.id = 'externalLinkModal';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(13, 21, 38, 0.95);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            padding: 16px;
            box-sizing: border-box;
            backdrop-filter: blur(8px);
            animation: fadeInOverlay 0.3s ease;
        `;

        // Модальное окно
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(145deg, #182444, #0d1526);
            border: 1px solid rgba(255, 215, 0, 0.15);
            border-radius: 24px;
            max-width: 440px;
            width: 100%;
            padding: 32px 28px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.8);
            animation: slideUpModal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-align: center;
        `;

        // Иконка
        const iconWrapper = document.createElement('div');
        iconWrapper.style.cssText = `
            width: 64px;
            height: 64px;
            background: rgba(255, 215, 0, 0.12);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            border: 2px solid rgba(255, 215, 0, 0.2);
        `;
        const icon = document.createElement('i');
        icon.className = 'fas fa-external-link-alt';
        icon.style.cssText = 'font-size: 28px; color: #FFD700;';
        iconWrapper.appendChild(icon);

        // Заголовок
        const title = document.createElement('h2');
        title.style.cssText = 'color: #f2f4fa; font-size: 22px; font-weight: 700; margin-bottom: 8px;';
        title.textContent = '⚠️ Внешняя ссылка';

        // Подзаголовок
        const subtitle = document.createElement('p');
        subtitle.style.cssText = 'color: #a6b0cc; font-size: 14px; margin-bottom: 6px;';
        subtitle.textContent = 'Вы переходите на сайт:';

        // Домен
        const domainDisplay = document.createElement('div');
        domainDisplay.style.cssText = `
            background: rgba(255,255,255,0.04);
            border-radius: 12px;
            padding: 12px 16px;
            margin: 12px 0 16px;
            border: 1px solid rgba(255, 215, 0, 0.1);
        `;
        const domainLink = document.createElement('a');
        domainLink.href = href;
        domainLink.target = '_blank';
        domainLink.rel = 'noopener noreferrer';
        domainLink.style.cssText = 'color: #FFD700; font-size: 18px; font-weight: 600; text-decoration: none; word-break: break-all;';
        domainLink.textContent = domain;
        domainDisplay.appendChild(domainLink);

        // Предупреждение
        const warningText = document.createElement('p');
        warningText.style.cssText = 'color: #77819e; font-size: 13px; line-height: 1.6; margin-bottom: 20px;';
        warningText.innerHTML = `
            <i class="fas fa-shield-alt" style="color: #FFD700; margin-right: 6px;"></i>
            Мы не несём ответственности за содержимое внешних сайтов.
            <br>Пожалуйста, будьте осторожны.
        `;

        // Кнопки
        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;';

        // Кнопка "Перейти"
        const goBtn = document.createElement('button');
        goBtn.textContent = '🔗 Перейти на сайт';
        goBtn.style.cssText = `
            background: linear-gradient(135deg, #FFD700, #e6c200);
            color: #0d1526;
            border: none;
            padding: 12px 28px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Montserrat', Arial, sans-serif;
            flex: 1;
            min-width: 140px;
        `;
        goBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(255,215,0,0.3)';
        });
        goBtn.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
        goBtn.addEventListener('click', function() {
            window.open(href, '_blank', 'noopener,noreferrer');
            overlay.remove();
            document.body.style.overflow = '';
        });

        // Кнопка "Отмена"
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '✖️ Отмена';
        cancelBtn.style.cssText = `
            background: transparent;
            color: #a6b0cc;
            border: 1px solid rgba(37, 52, 96, 0.4);
            padding: 12px 28px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Montserrat', Arial, sans-serif;
            flex: 1;
            min-width: 140px;
        `;
        cancelBtn.addEventListener('mouseenter', function() {
            this.style.borderColor = '#FFD700';
            this.style.color = '#f2f4fa';
        });
        cancelBtn.addEventListener('mouseleave', function() {
            this.style.borderColor = 'rgba(37, 52, 96, 0.4)';
            this.style.color = '#a6b0cc';
        });
        cancelBtn.addEventListener('click', function() {
            overlay.remove();
            document.body.style.overflow = '';
        });

        btnGroup.appendChild(goBtn);
        btnGroup.appendChild(cancelBtn);

        // Сборка модалки
        modal.appendChild(iconWrapper);
        modal.appendChild(title);
        modal.appendChild(subtitle);
        modal.appendChild(domainDisplay);
        modal.appendChild(warningText);
        modal.appendChild(btnGroup);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Закрытие по клику вне модалки
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.remove();
                document.body.style.overflow = '';
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                const modalEl = document.getElementById('externalLinkModal');
                if (modalEl) {
                    modalEl.remove();
                    document.body.style.overflow = '';
                    document.removeEventListener('keydown', handler);
                }
            }
        });

        // Подключаем Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }

        // Стили анимаций
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOverlay {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUpModal {
                from {
                    opacity: 0;
                    transform: scale(0.92) translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        logger.log('🛡️ Показано предупреждение для:', domain);
    }

    // ========== ПЕРЕХВАТ ССЫЛОК ==========

    function handleLinkClick(event) {
        const target = event.target.closest('a');
        if (!target) return;

        const href = target.getAttribute('href');
        if (!href) return;

        // Проверяем, нужно ли обрабатывать
        if (target.getAttribute('data-no-protection') === 'true') {
            return;
        }

        // Проверяем, внешняя ли ссылка
        if (isExternalLink(href)) {
            event.preventDefault();
            event.stopPropagation();
            showWarning(href);
            logger.log('🛡️ Защита сработала для:', href);
        }
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========

    function init() {
        // Слушаем клики на всём документе
        document.addEventListener('click', handleLinkClick);

        // Обрабатываем уже существующие ссылки
        document.querySelectorAll('a[href]').forEach(function(link) {
            const href = link.getAttribute('href');
            if (href && isExternalLink(href)) {
                link.setAttribute('data-external', 'true');
            }
        });

        // Добавляем визуальный индикатор для внешних ссылок
        const style = document.createElement('style');
        style.textContent = `
            a[data-external="true"]::after {
                content: '↗';
                display: inline-block;
                margin-left: 4px;
                font-size: 0.8em;
                opacity: 0.5;
                transition: opacity 0.3s;
            }
            a[data-external="true"]:hover::after {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        logger.log('🛡️ Защита от внешних ссылок активирована');
    }

    // ========== ПУБЛИЧНЫЙ API ==========

    window.MetroExternalProtection = {
        /**
         * Проверить, является ли ссылка внешней
         */
        isExternal: isExternalLink,

        /**
         * Получить домен из ссылки
         */
        getDomain: getDomainName,

        /**
         * Показать предупреждение вручную
         */
        showWarning: showWarning,

        /**
         * Проверить безопасность домена
         */
        checkDomain: checkDomainSafety,

        /**
         * Добавить домен в белый список
         */
        addAllowedDomain: function(domain) {
            if (domain && !CONFIG.allowedDomains.includes(domain)) {
                CONFIG.allowedDomains.push(domain);
                logger.log('➕ Добавлен домен в белый список:', domain);
                return true;
            }
            return false;
        },

        /**
         * Получить список разрешённых доменов
         */
        getAllowedDomains: function() {
            return [...CONFIG.allowedDomains];
        },

        /**
         * Конфигурация
         */
        config: CONFIG
    };

    // ========== ЗАПУСК ==========

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    logger.log('🛡️ MetroExternalProtection API доступен');
    logger.log('📌 Разрешённые домены:', CONFIG.allowedDomains);

})();
