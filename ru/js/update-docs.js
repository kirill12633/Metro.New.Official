// update-docs.js - Уведомление об обновлении документов
// https://kirill12633.github.io/Metro.New.Official/ru/js/update-docs.js

(function() {
    'use strict';
    
    // ========== НАСТРОЙКИ ДОКУМЕНТОВ ==========
    const DOCS = {
        privacy: {
            version: '1.0.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/privacy-policy/',
            name: 'Политика конфиденциальности',
            icon: '🔒',
            lastUpdate: '9 февраля 2026'
        },
        terms: {
            version: '1.0.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/terms-of-service/',
            name: 'Пользовательское соглашение',
            icon: '📝',
            lastUpdate: '17 февраля 2026'
        },
        refund: {
            version: '1.0.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/refund-policy/',
            name: 'Политика возврата',
            icon: '💰',
            lastUpdate: '—'
        },
        cookies: {
            version: '2.0.0',     // ← обновлён
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/cookies/',
            name: 'Политика использования cookie',
            icon: '🍪',
            lastUpdate: '5 апреля 2026'
        },
        copyright: {
            version: '1.0.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/copyright-policy/',
            name: 'Политика авторских прав',
            icon: '©️',
            lastUpdate: '2 февраля 2026'
        },
        community: {
            version: '1.0.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/community-guidelines/',
            name: 'Правила сообщества Discord',
            icon: '💬',
            lastUpdate: '—'
        },
        site: {
            version: '1.0.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/site-guidelines/',
            name: 'Правила использования сайта',
            icon: '🌐',
            lastUpdate: '9 февраля 2026'
        }
    };
    
    // ========== ПРОВЕРКА ОБНОВЛЕНИЙ ==========
    function getUpdatedDocs() {
        const updated = [];
        for (const [key, doc] of Object.entries(DOCS)) {
            const savedVersion = localStorage.getItem(`metro_doc_${key}_v`);
            if (savedVersion !== doc.version) {
                updated.push(doc);
            }
        }
        return updated;
    }
    
    // ========== СОХРАНЕНИЕ ПРИНЯТИЯ ==========
    function acceptUpdates(docs) {
        for (const doc of docs) {
            const key = Object.keys(DOCS).find(k => DOCS[k].name === doc.name);
            if (key) {
                localStorage.setItem(`metro_doc_${key}_v`, doc.version);
                localStorage.setItem(`metro_doc_${key}_accepted`, new Date().toISOString());
            }
        }
    }
    
    // ========== ПОКАЗАТЬ УВЕДОМЛЕНИЕ ==========
    function showModal(docs) {
        // Проверяем, что body существует
        if (!document.body) {
            console.log('Body ещё не загружен, ждём...');
            document.addEventListener('DOMContentLoaded', function() {
                showModal(docs);
            });
            return;
        }
        
        // Блокируем прокрутку
        document.body.style.overflow = 'hidden';
        
        // Список документов
        const docsList = docs.map(doc => `
            <li style="
                margin-bottom: 12px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 3px solid #FFD700;
            ">
                <a href="${doc.url}" target="_blank" style="
                    color: #0066CC;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 500;
                ">
                    <span style="font-size: 20px;">${doc.icon}</span>
                    <span style="flex: 1;">${doc.name}</span>
                    <span style="
                        font-size: 11px;
                        background: #dc3545;
                        color: white;
                        padding: 2px 8px;
                        border-radius: 20px;
                    ">обновлён</span>
                </a>
                ${doc.lastUpdate !== '—' ? `<div style="font-size: 11px; color: #999; margin-top: 5px; margin-left: 35px;">от ${doc.lastUpdate}</div>` : ''}
            </li>
        `).join('');
        
        // Создаём модальное окно
        const modal = document.createElement('div');
        modal.id = 'metroUpdateModal';
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                z-index: 9999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Montserrat', Arial, sans-serif;
            ">
                <div style="
                    background: white;
                    border-radius: 20px;
                    max-width: 450px;
                    width: 90%;
                    text-align: center;
                    padding: 0;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                    animation: slideUp 0.3s ease;
                ">
                    <div style="
                        background: linear-gradient(135deg, #0066CC, #0052a3);
                        padding: 25px;
                        color: white;
                    ">
                        <div style="
                            width: 60px;
                            height: 60px;
                            background: #FFD700;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 15px;
                        ">
                            <i class="fas fa-file-alt" style="font-size: 28px; color: #0066CC;"></i>
                        </div>
                        <h2 style="margin: 0; font-size: 22px;">📢 Обновление документов</h2>
                        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 13px;">
                            Пожалуйста, ознакомьтесь с изменениями
                        </p>
                    </div>
                    
                    <div style="padding: 20px;">
                        <ul style="list-style: none; margin: 0; padding: 0; text-align: left;">
                            ${docsList}
                        </ul>
                        
                        <div style="
                            background: #f0f0f0;
                            border-radius: 10px;
                            padding: 12px;
                            margin: 15px 0;
                            font-size: 12px;
                            color: #666;
                            text-align: left;
                        ">
                            <i class="fas fa-info-circle"></i>
                            Продолжая использование сайта, вы принимаете обновлённые условия
                        </div>
                        
                        <button id="acceptUpdatesBtn" style="
                            background: #FFD700;
                            color: #1a1a2e;
                            border: none;
                            width: 100%;
                            padding: 14px;
                            border-radius: 40px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s;
                            margin-top: 10px;
                        ">
                            ✅ Принять и продолжить
                        </button>
                        
                        <p style="font-size: 11px; color: #999; margin-top: 15px;">
                            <i class="fas fa-lock"></i>
                            Вы можете ознакомиться с документами по ссылкам выше
                        </p>
                    </div>
                </div>
            </div>
            <style>
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
            </style>
        `;
        
        document.body.appendChild(modal);
        
        // Подключаем Font Awesome если нет
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }
        
        // Кнопка принятия
        const acceptBtn = document.getElementById('acceptUpdatesBtn');
        if (acceptBtn) {
            acceptBtn.onclick = function() {
                acceptUpdates(docs);
                modal.remove();
                document.body.style.overflow = '';
            };
        }
    }
    
    // ========== ЗАПУСК ==========
    // Ждём полной загрузки DOM перед проверкой
    function init() {
        const updatedDocs = getUpdatedDocs();
        if (updatedDocs.length > 0) {
            console.log('Обновлённые документы:', updatedDocs.map(d => d.name));
            showModal(updatedDocs);
        } else {
            console.log('Все документы актуальны');
        }
    }
    
    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ========== ДЛЯ РАЗРАБОТЧИКОВ ==========
    window.MetroUpdateDocs = {
        forceShow: function() {
            // Сбрасываем все версии
            for (const [key, doc] of Object.entries(DOCS)) {
                localStorage.removeItem(`metro_doc_${key}_v`);
            }
            location.reload();
        },
        getVersions: function() {
            const versions = {};
            for (const [key, doc] of Object.entries(DOCS)) {
                versions[key] = {
                    current: doc.version,
                    saved: localStorage.getItem(`metro_doc_${key}_v`)
                };
            }
            return versions;
        }
    };
    
    console.log('update-docs.js загружен, документов:', Object.keys(DOCS).length);
    
})();
