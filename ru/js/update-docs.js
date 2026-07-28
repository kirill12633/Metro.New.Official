// update-docs.js - Уведомление об обновлении документов
// https://kirill12633.github.io/Metro.New.Official/ru/js/update-docs.js

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

    logger.log('📄 update-docs.js загружен');

    // ========== КОНФИГУРАЦИЯ ==========
    const STORAGE_PREFIX = 'metro_doc_';

    // ★ ПРИ ОБНОВЛЕНИИ ДОКУМЕНТА - МЕНЯЙТЕ version ★
    const DOCS = {
        privacy: {
            version: '1.5.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/privacy-policy/',
            name: 'Политика конфиденциальности',
            icon: '🔒',
            lastUpdate: '06 июня 2026 года'
        },
        terms: {
            version: '1.1.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/terms-of-service/',
            name: 'Пользовательское соглашение',
            icon: '📝',
            lastUpdate: '06 апреля 2026 года'
        },
        refund: {
            version: '1.4.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/refund-policy/',
            name: 'Политика возврата',
            icon: '💰',
            lastUpdate: '04 мая 2026 года'
        },
        cookies: {
            version: '1.0.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/cookies/',
            name: 'Политика использования cookie',
            icon: '🍪',
            lastUpdate: '06 апреля 2026 года'
        },
        copyright: {
            version: '1.1.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/copyright-policy/',
            name: 'Политика авторских прав',
            icon: '©️',
            lastUpdate: '02 мая 2026 года'
        },
        community: {
            version: '1.0.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/community-guidelines/',
            name: 'Правила сообщества Discord',
            icon: '💬',
            lastUpdate: '29 января 2025 года'
        },
        site: {
            version: '1.0.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/site-guidelines/',
            name: 'Правила использования сайта',
            icon: '🌐',
            lastUpdate: '06 апреля 2026 года'
        }
    };

    // ========== ОСНОВНЫЕ ФУНКЦИИ ==========

    /**
     * Безопасное получение данных из localStorage
     */
    function getStorageItem(key) {
        try {
            return localStorage.getItem(key);
        } catch(e) {
            logger.warn('⚠️ Не удалось прочитать localStorage:', key);
            return null;
        }
    }

    /**
     * Безопасное сохранение в localStorage
     */
    function setStorageItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch(e) {
            logger.warn('⚠️ Не удалось сохранить в localStorage:', key);
            return false;
        }
    }

    /**
     * Получить сохранённую версию документа
     */
    function getSavedVersion(docKey) {
        return getStorageItem(STORAGE_PREFIX + docKey + '_v');
    }

    /**
     * Сохранить версию документа
     */
    function saveVersion(docKey, version) {
        return setStorageItem(STORAGE_PREFIX + docKey + '_v', version);
    }

    /**
     * Сохранить дату принятия
     */
    function saveAcceptDate(docKey) {
        return setStorageItem(STORAGE_PREFIX + docKey + '_accepted', new Date().toISOString());
    }

    /**
     * Найти обновлённые документы
     */
    function getUpdatedDocs() {
        const updated = [];
        for (const [key, doc] of Object.entries(DOCS)) {
            const savedVersion = getSavedVersion(key);
            if (savedVersion !== doc.version) {
                updated.push({ ...doc, key });
            }
        }
        return updated;
    }

    /**
     * Принять обновления
     */
    function acceptUpdates(docs) {
        for (const doc of docs) {
            saveVersion(doc.key, doc.version);
            saveAcceptDate(doc.key);
        }
        logger.log('📄 Обновления приняты:', docs.map(d => d.name).join(', '));
    }

    // ========== СОЗДАНИЕ МОДАЛЬНОГО ОКНА (ЧЕРЕЗ createElement) ==========

    function showModal(docs) {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => showModal(docs));
            return;
        }

        // Блокируем скролл
        document.body.style.overflow = 'hidden';

        // ===== СОЗДАЁМ ОВЕРЛЕЙ =====
        const overlay = document.createElement('div');
        overlay.id = 'metroUpdateModal';
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
            animation: metroFadeIn 0.3s ease;
        `;

        // ===== МОДАЛЬНОЕ ОКНО =====
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(145deg, #182444, #0d1526);
            border: 1px solid rgba(255, 215, 0, 0.15);
            border-radius: 24px;
            max-width: 500px;
            width: 100%;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0,0,0,0.8);
            animation: metroSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;

        // ===== ШАПКА =====
        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #0066CC, #0052a3);
            padding: 24px 20px;
            color: white;
            text-align: center;
            flex-shrink: 0;
        `;

        const iconWrapper = document.createElement('div');
        iconWrapper.style.cssText = `
            width: 55px;
            height: 55px;
            background: #FFD700;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
        `;
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-alt';
        icon.style.cssText = 'font-size: 26px; color: #0066CC;';
        iconWrapper.appendChild(icon);

        const title = document.createElement('h2');
        title.style.cssText = 'margin: 0; font-size: 20px; font-weight: 700;';
        title.textContent = '📢 Обновление документов';

        const subtitle = document.createElement('p');
        subtitle.style.cssText = 'margin: 6px 0 0; font-size: 13px; opacity: 0.9;';
        subtitle.textContent = 'Нажмите на документ, чтобы прочитать';

        header.appendChild(iconWrapper);
        header.appendChild(title);
        header.appendChild(subtitle);

        // ===== СПИСОК ДОКУМЕНТОВ =====
        const listContainer = document.createElement('div');
        listContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            -webkit-overflow-scrolling: touch;
        `;

        const list = document.createElement('ul');
        list.style.cssText = 'list-style: none; margin: 0; padding: 0;';

        for (const doc of docs) {
            const item = document.createElement('li');
            item.style.cssText = `
                margin-bottom: 10px;
                padding: 12px 14px;
                background: rgba(255,255,255,0.04);
                border-radius: 12px;
                border-left: 3px solid #FFD700;
                transition: all 0.3s;
            `;

            const link = document.createElement('a');
            link.href = doc.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                text-decoration: none;
                color: #f2f4fa;
                cursor: pointer;
            `;

            // Иконка
            const iconSpan = document.createElement('span');
            iconSpan.style.cssText = 'font-size: 24px;';
            iconSpan.textContent = doc.icon;

            // Текст
            const textDiv = document.createElement('div');
            textDiv.style.cssText = 'flex: 1;';
            const nameSpan = document.createElement('div');
            nameSpan.style.cssText = 'font-weight: 600; color: #f2f4fa;';
            nameSpan.textContent = doc.name;
            const dateSpan = document.createElement('div');
            dateSpan.style.cssText = 'font-size: 11px; color: #77819e;';
            dateSpan.textContent = 'от ' + doc.lastUpdate;

            textDiv.appendChild(nameSpan);
            textDiv.appendChild(dateSpan);

            // Стрелка
            const arrow = document.createElement('span');
            arrow.style.cssText = 'color: #FFD700; font-size: 14px;';
            arrow.textContent = '📄 →';

            link.appendChild(iconSpan);
            link.appendChild(textDiv);
            link.appendChild(arrow);

            // Hover эффект
            item.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255,215,0,0.08)';
                this.style.transform = 'translateX(4px)';
            });
            item.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255,255,255,0.04)';
                this.style.transform = 'translateX(0)';
            });

            item.appendChild(link);
            list.appendChild(item);
        }

        listContainer.appendChild(list);

        // ===== КНОПКА ПРИНЯТИЯ =====
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 16px 20px;
            border-top: 1px solid rgba(37, 52, 96, 0.3);
            flex-shrink: 0;
        `;

        const acceptBtn = document.createElement('button');
        acceptBtn.id = 'acceptBtn';
        acceptBtn.textContent = '✅ Я ознакомился и принимаю';
        acceptBtn.style.cssText = `
            background: linear-gradient(135deg, #FFD700, #e6c200);
            color: #0d1526;
            border: none;
            width: 100%;
            padding: 14px;
            border-radius: 40px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Montserrat', Arial, sans-serif;
        `;

        acceptBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(255,215,0,0.3)';
        });
        acceptBtn.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });

        acceptBtn.addEventListener('click', function() {
            acceptUpdates(docs);
            overlay.remove();
            document.body.style.overflow = '';
            logger.log('📄 Документы приняты');
        });

        const hint = document.createElement('p');
        hint.style.cssText = `
            font-size: 11px;
            color: #77819e;
            text-align: center;
            margin-top: 12px;
        `;
        hint.innerHTML = '<i class="fas fa-check-circle"></i> Нажимая «Принять», вы подтверждаете, что прочитали документы';

        footer.appendChild(acceptBtn);
        footer.appendChild(hint);

        // ===== СБОРКА =====
        modal.appendChild(header);
        modal.appendChild(listContainer);
        modal.appendChild(footer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // ===== ЗАКРЫТИЕ ПО ESC =====
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                const modalEl = document.getElementById('metroUpdateModal');
                if (modalEl) {
                    modalEl.remove();
                    document.body.style.overflow = '';
                    document.removeEventListener('keydown', handler);
                }
            }
        });

        // ===== ПОДКЛЮЧАЕМ FONT AWESOME =====
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }

        // ===== ДОБАВЛЯЕМ СТИЛИ АНИМАЦИЙ =====
        const style = document.createElement('style');
        style.textContent = `
            @keyframes metroFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes metroSlideUp {
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

        logger.log('📄 Модальное окно обновлений показано');
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========

    function init() {
        const updatedDocs = getUpdatedDocs();

        if (updatedDocs.length > 0) {
            logger.log('📄 Найдены обновления документов:', updatedDocs.length);
            showModal(updatedDocs);
        } else {
            logger.log('✅ Все документы актуальны');
        }
    }

    // ========== ПУБЛИЧНЫЙ API ==========

    window.MetroUpdateDocs = {
        /**
         * Принудительно показать модальное окно (для тестирования)
         */
        forceShow: function() {
            for (const [key] of Object.entries(DOCS)) {
                localStorage.removeItem(STORAGE_PREFIX + key + '_v');
            }
            logger.log('🔄 Принудительный показ обновлений');
            window.location.reload();
        },

        /**
         * Получить версии документов
         */
        getVersions: function() {
            const versions = {};
            for (const [key, doc] of Object.entries(DOCS)) {
                versions[key] = {
                    current: doc.version,
                    saved: getSavedVersion(key),
                    name: doc.name,
                    lastUpdate: doc.lastUpdate
                };
            }
            return versions;
        },

        /**
         * Проверить наличие обновлений
         */
        checkUpdates: function() {
            return getUpdatedDocs();
        },

        /**
         * Принять все обновления программно
         */
        acceptAll: function() {
            const updated = getUpdatedDocs();
            if (updated.length > 0) {
                acceptUpdates(updated);
                logger.log('📄 Все обновления приняты программно');
                return true;
            }
            return false;
        },

        /**
         * Список всех документов
         */
        docs: DOCS,

        /**
         * Конфигурация
         */
        config: {
            storagePrefix: STORAGE_PREFIX,
            isProduction: isProduction
        }
    };

    // ========== ЗАПУСК ==========

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    logger.log('📄 MetroUpdateDocs API доступен');
    logger.log('📌 Используйте: window.MetroUpdateDocs.checkUpdates()');
})();
