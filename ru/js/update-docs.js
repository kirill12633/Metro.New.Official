// update-docs.js - Уведомление об обновлении документов
// https://kirill12633.github.io/Metro.New.Official/ru/js/update-docs.js

(function() {
    'use strict';
    
    // ========== НАСТРОЙКИ ДОКУМЕНТОВ ==========
    // ★ ПРИ ОБНОВЛЕНИИ ДОКУМЕНТА - МЕНЯЙТЕ version ★
    const DOCS = {
        privacy: { version: '1.4.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/privacy-policy/', name: 'Политика конфиденциальности', icon: '🔒', lastUpdate: '21 апреля 2026 года' },
        terms: { version: '1.1.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/terms-of-service/', name: 'Пользовательское соглашение', icon: '📝', lastUpdate: '6 апреля 2026 года' },
        refund: { version: '1.4.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/refund-policy/', name: 'Политика возврата', icon: '💰', lastUpdate: '4 мая 2026 года' },
        cookies: { version: '1.0.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/cookies/', name: 'Политика использования cookie', icon: '🍪', lastUpdate: '6 апреля 2026 года' },
        copyright: { version: '1.1.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/copyright-policy/', name: 'Политика авторских прав', icon: '©️', lastUpdate: '2 мая 2026' },
        community: { version: '1.0.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/community-guidelines/', name: 'Правила сообщества Discord', icon: '💬', lastUpdate: '29 января 2025 года' },
        site: { version: '1.0.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/site-guidelines/', name: 'Правила использования сайта', icon: '🌐', lastUpdate: '6 апреля 2026 года' }
    };
    
    // Находим обновлённые документы
    function getUpdatedDocs() {
        const updated = [];
        for (const [key, doc] of Object.entries(DOCS)) {
            const savedVersion = localStorage.getItem(`metro_doc_${key}_v`);
            if (savedVersion !== doc.version) {
                updated.push({ ...doc, key });
            }
        }
        return updated;
    }
    
    // Сохраняем принятие
    function acceptUpdates(docs) {
        for (const doc of docs) {
            localStorage.setItem(`metro_doc_${doc.key}_v`, doc.version);
            localStorage.setItem(`metro_doc_${doc.key}_accepted`, new Date().toISOString());
        }
    }
    
    // ========== ПОКАЗАТЬ ОКНО ==========
    const updatedDocs = getUpdatedDocs();
    
    if (updatedDocs.length > 0) {
        showModal(updatedDocs);
    }
    
    function showModal(docs) {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => showModal(docs));
            return;
        }
        
        document.body.style.overflow = 'hidden';
        
        // Список документов (просто ссылки)
        const docsList = docs.map(doc => `
            <li style="
                margin-bottom: 10px;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 12px;
                border-left: 3px solid #FFD700;
            ">
                <a href="${doc.url}" target="_blank" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                    color: #1a1a2e;
                ">
                    <span style="font-size: 24px;">${doc.icon}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${doc.name}</div>
                        <div style="font-size: 11px; color: #999;">от ${doc.lastUpdate}</div>
                    </div>
                    <span style="color: #0066CC; font-size: 14px;">📄 →</span>
                </a>
            </li>
        `).join('');
        
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
                font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                padding: 16px;
                box-sizing: border-box;
            ">
                <div style="
                    background: white;
                    border-radius: 24px;
                    max-width: 500px;
                    width: 100%;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                ">
                    <!-- Шапка -->
                    <div style="
                        background: linear-gradient(135deg, #0066CC, #0052a3);
                        padding: 24px 20px;
                        color: white;
                        text-align: center;
                        flex-shrink: 0;
                    ">
                        <div style="
                            width: 55px;
                            height: 55px;
                            background: #FFD700;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 12px;
                        ">
                            <i class="fas fa-file-alt" style="font-size: 26px; color: #0066CC;"></i>
                        </div>
                        <h2 style="margin: 0; font-size: 20px;">📢 Обновление документов</h2>
                        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">
                            Нажмите на документ, чтобы прочитать
                        </p>
                    </div>
                    
                    <!-- Список документов -->
                    <div style="
                        flex: 1;
                        overflow-y: auto;
                        padding: 20px;
                        -webkit-overflow-scrolling: touch;
                    ">
                        <ul style="list-style: none; margin: 0; padding: 0;">
                            ${docsList}
                        </ul>
                    </div>
                    
                    <!-- Кнопка принятия -->
                    <div style="
                        padding: 16px 20px;
                        border-top: 1px solid #eee;
                        flex-shrink: 0;
                    ">
                        <button id="acceptBtn" style="
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
                        ">
                            ✅ Я ознакомился и принимаю
                        </button>
                        <p style="
                            font-size: 11px;
                            color: #999;
                            text-align: center;
                            margin-top: 12px;
                        ">
                            <i class="fas fa-check-circle"></i> 
                            Нажимая «Принять», вы подтверждаете, что прочитали документы
                        </p>
                    </div>
                </div>
            </div>
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
        document.getElementById('acceptBtn').onclick = function() {
            acceptUpdates(docs);
            modal.remove();
            document.body.style.overflow = '';
        };
    }
    
    // ========== API ДЛЯ РАЗРАБОТЧИКОВ ==========
    window.MetroUpdateDocs = {
        forceShow: function() {
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
