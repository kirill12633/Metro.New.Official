// update-docs.js - Система обязательного уведомления об обновлении документов
// Разместить по адресу: https://kirill12633.github.io/Metro.New.Official/ru/js/update-docs.js

(function() {
    'use strict';
    
    console.log('update-docs.js загружен');
    
    // ========== НАСТРОЙКИ ДОКУМЕНТОВ ==========
    // ★★★ ПРИ ОБНОВЛЕНИИ - МЕНЯЙТЕ ЗДЕСЬ ★★★
    const DOCS_CONFIG = {
        version: '2.0.0',           // Версия обновления (увеличивайте при каждом изменении)
        date: '15.01.2024',         // Дата обновления
        title: 'Обновление политики конфиденциальности',
        
        // Какие документы обновлены
        documents: [
            {
                name: 'Политика конфиденциальности',
                url: '/ru/help/privacy-policy/',
                changes: 'Добавлен раздел о сборе аналитических данных'
            },
            {
                name: 'Пользовательское соглашение',
                url: '/ru/help/terms-of-service/',
                changes: 'Обновлены правила поведения в игре'
            },
            {
                name: 'Политика использования cookie',
                url: '/ru/help/cookies',
                changes: 'Новые категории cookie и сроки хранения'
            }
        ],
        
        // Что изменилось (кратко)
        summary: [
            '📊 Добавлены аналитические cookie для улучшения работы сайта',
            '🔒 Усилена защита персональных данных',
            '📝 Обновлены правила пользования игрой',
            '🤝 Добавлены новые партнёрские сервисы (Discord, YouTube)'
        ]
    };
    
    // ========== ПРОВЕРКА НУЖНО ЛИ ПОКАЗЫВАТЬ ==========
    
    function needsUpdate() {
        try {
            const acceptedVersion = localStorage.getItem('metro_docs_accepted_version');
            const acceptedDate = localStorage.getItem('metro_docs_accepted_date');
            
            // Если версия не совпадает - показываем
            if (acceptedVersion !== DOCS_CONFIG.version) {
                console.log('Новая версия документов, требуется подтверждение');
                return true;
            }
            
            // Если дата не указана - показываем
            if (!acceptedDate) {
                return true;
            }
            
            return false;
        } catch(e) {
            console.warn('Ошибка проверки:', e);
            return true;
        }
    }
    
    // ========== СОХРАНЕНИЕ ПРИНЯТИЯ ==========
    
    function acceptUpdate() {
        try {
            localStorage.setItem('metro_docs_accepted_version', DOCS_CONFIG.version);
            localStorage.setItem('metro_docs_accepted_date', new Date().toISOString());
            localStorage.setItem('metro_docs_accepted_at', Date.now());
            console.log('Пользователь принял обновление документов');
            
            // Удаляем модальное окно
            const modal = document.getElementById('mandatoryUpdateModal');
            if (modal) modal.remove();
            
            return true;
        } catch(e) {
            console.error('Ошибка сохранения:', e);
            return false;
        }
    }
    
    // ========== СОЗДАНИЕ МОДАЛЬНОГО ОКНА (НЕЛЬЗЯ ЗАКРЫТЬ) ==========
    
    function createModal() {
        // Удаляем старый модал если есть
        const oldModal = document.getElementById('mandatoryUpdateModal');
        if (oldModal) oldModal.remove();
        
        // Формируем список документов
        const documentsList = DOCS_CONFIG.documents.map(doc => `
            <li style="margin-bottom: 10px;">
                <a href="${doc.url}" target="_blank" style="color: #FFD700; text-decoration: underline;">
                    📄 ${doc.name}
                </a>
                <span style="display: block; font-size: 12px; color: #aaa; margin-top: 3px;">
                    Изменения: ${doc.changes}
                </span>
            </li>
        `).join('');
        
        // Формируем список изменений
        const summaryList = DOCS_CONFIG.summary.map(item => `
            <li style="margin-bottom: 8px;">${item}</li>
        `).join('');
        
        const modalHTML = `
            <div id="mandatoryUpdateModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999999;
                font-family: 'Montserrat', Arial, sans-serif;
                backdrop-filter: blur(5px);
            ">
                <div style="
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border-radius: 24px;
                    max-width: 550px;
                    width: 90%;
                    max-height: 85vh;
                    overflow-y: auto;
                    padding: 0;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,215,0,0.3);
                ">
                    <!-- Шапка -->
                    <div style="
                        background: linear-gradient(135deg, #dc3545, #c82333);
                        padding: 25px;
                        text-align: center;
                        border-radius: 24px 24px 0 0;
                    ">
                        <div style="
                            width: 70px;
                            height: 70px;
                            background: white;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 15px;
                        ">
                            <i class="fas fa-file-contract" style="font-size: 35px; color: #dc3545;"></i>
                        </div>
                        <h2 style="
                            color: white;
                            margin: 0;
                            font-size: 22px;
                        ">⚠️ ${DOCS_CONFIG.title}</h2>
                        <p style="
                            color: rgba(255,255,255,0.9);
                            margin: 10px 0 0;
                            font-size: 14px;
                        ">
                            Версия ${DOCS_CONFIG.version} от ${DOCS_CONFIG.date}
                        </p>
                    </div>
                    
                    <!-- Контент -->
                    <div style="padding: 25px; color: #eee;">
                        <p style="margin-bottom: 20px; font-size: 15px; line-height: 1.5;">
                            <strong>Уважаемый пользователь!</strong><br>
                            В наши документы внесены важные изменения. Пожалуйста, ознакомьтесь с ними перед продолжением использования сайта.
                        </p>
                        
                        <div style="
                            background: rgba(0,0,0,0.3);
                            border-radius: 12px;
                            padding: 15px;
                            margin-bottom: 20px;
                        ">
                            <h3 style="color: #FFD700; margin: 0 0 10px 0; font-size: 16px;">
                                📋 Что изменилось:
                            </h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                ${summaryList}
                            </ul>
                        </div>
                        
                        <div style="
                            background: rgba(0,0,0,0.3);
                            border-radius: 12px;
                            padding: 15px;
                            margin-bottom: 20px;
                        ">
                            <h3 style="color: #FFD700; margin: 0 0 10px 0; font-size: 16px;">
                                📄 Обновлённые документы:
                            </h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                ${documentsList}
                            </ul>
                        </div>
                        
                        <div style="
                            background: rgba(255,100,100,0.15);
                            border-left: 3px solid #dc3545;
                            padding: 12px;
                            border-radius: 8px;
                            margin-bottom: 25px;
                        ">
                            <p style="margin: 0; font-size: 13px; color: #ffaaaa;">
                                <i class="fas fa-info-circle"></i> 
                                Для продолжения использования сайта необходимо принять обновлённые условия.
                                Вы можете закрыть страницу, если не согласны с изменениями.
                            </p>
                        </div>
                        
                        <!-- Кнопка принятия (только она) -->
                        <button id="acceptUpdateBtn" style="
                            background: linear-gradient(135deg, #FFD700, #e6c200);
                            color: #1a1a2e;
                            border: none;
                            width: 100%;
                            padding: 16px;
                            border-radius: 50px;
                            font-size: 18px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                        ">
                            <i class="fas fa-check-circle"></i>
                            Я ознакомился и принимаю изменения
                        </button>
                        
                        <p style="
                            text-align: center;
                            font-size: 11px;
                            color: #888;
                            margin-top: 15px;
                        ">
                            <i class="fas fa-lock"></i> 
                            Это обязательное уведомление. Вы не сможете использовать сайт до его принятия.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Подключаем Font Awesome если нет
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }
        
        // Назначаем обработчик
        const acceptBtn = document.getElementById('acceptUpdateBtn');
        if (acceptBtn) {
            acceptBtn.onclick = function() {
                acceptUpdate();
            };
            
            // Hover эффект
            acceptBtn.onmouseover = function() {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
            };
            acceptBtn.onmouseout = function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            };
        }
        
        // Блокируем прокрутку страницы
        document.body.style.overflow = 'hidden';
        
        // Добавляем обработчик на ESC (не работает, но можно оставить)
        document.addEventListener('keydown', function preventEsc(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                // Ничего не делаем - нельзя закрыть!
            }
        });
    }
    
    // ========== БЛОКИРОВКА ВСЕХ ДЕЙСТВИЙ НА СТРАНИЦЕ ==========
    
    function blockPageInteraction() {
        // Создаём затемнённый оверлей поверх всего (на всякий случай)
        const overlay = document.createElement('div');
        overlay.id = 'blockOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 9999998;
            display: none;
        `;
        document.body.appendChild(overlay);
    }
    
    // ========== ЗАПУСК ==========
    
    function init() {
        // Добавляем блокировку фона (на случай если модал не сработает)
        blockPageInteraction();
        
        // Проверяем, нужно ли показать обновление
        if (needsUpdate()) {
            console.log('Требуется подтверждение обновления документов');
            createModal();
        } else {
            console.log('Документы актуальны, модальное окно не требуется');
            // Убираем блокировку если была
            const overlay = document.getElementById('blockOverlay');
            if (overlay) overlay.remove();
            document.body.style.overflow = '';
        }
    }
    
    // Запускаем при загрузке страницы (самый высокий приоритет)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ========== ПУБЛИЧНЫЙ API ДЛЯ ЛЁГКОГО ОБНОВЛЕНИЯ ==========
    
    window.MetroUpdateDocs = {
        // ★★★ ГЛАВНАЯ ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ ★★★
        // Когда нужно добавить новое обновление - просто вызовите:
        // MetroUpdateDocs.setNewVersion('2.1.0', '01.02.2024', 'Новое обновление')
        
        setNewVersion: function(version, date, title, documents = null, summary = null) {
            // Эта функция для разработчиков - обновляет конфиг программно
            console.log('Обновление версии документов до:', version);
            
            // Сохраняем новую версию в отдельный ключ
            localStorage.setItem('metro_docs_pending_version', version);
            localStorage.setItem('metro_docs_pending_date', date);
            localStorage.setItem('metro_docs_pending_title', title);
            
            // При следующем заходе покажется новое уведомление
            if (documents) {
                localStorage.setItem('metro_docs_pending_documents', JSON.stringify(documents));
            }
            if (summary) {
                localStorage.setItem('metro_docs_pending_summary', JSON.stringify(summary));
            }
            
            // Сбрасываем принятую версию, чтобы показать уведомление
            localStorage.removeItem('metro_docs_accepted_version');
            
            // Перезагружаем страницу
            location.reload();
        },
        
        // Получить текущую версию
        getCurrentVersion: function() {
            return DOCS_CONFIG.version;
        },
        
        // Принудительно показать уведомление (для тестов)
        forceShow: function() {
            localStorage.removeItem('metro_docs_accepted_version');
            location.reload();
        }
    };
    
    console.log('update-docs.js готов, версия:', DOCS_CONFIG.version);
    
})();
