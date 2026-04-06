// update-docs.js - Простое уведомление об обновлении документов
// https://kirill12633.github.io/Metro.New.Official/ru/js/update-docs.js

(function() {
    'use strict';
    
    // ========== НАСТРОЙКИ ==========
    const DOCS = {
        privacy: { version: '1.1.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/privacy-policy/', name: 'Политика конфиденциальности', icon: '🔒', lastUpdate: '6 апреля 2026 года' },
        terms: { version: '1.1.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/terms-of-service/', name: 'Пользовательское соглашение', icon: '📝', lastUpdate: '6 апреля 2026 года' },
        refund: { version: '1.0.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/refund-policy/', name: 'Политика возврата', icon: '💰', lastUpdate: '2 февраля 2026 года' },
        cookies: { version: '1.0.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/cookies/', name: 'Политика использования cookie', icon: '🍪', lastUpdate: '6 апреля 2026 года' },
        copyright: { version: '1.0.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/copyright-policy/', name: 'Политика авторских прав', icon: '©️', lastUpdate: '2 февраля 2026' },
        community: { version: '1.0.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/community-guidelines/', name: 'Правила сообщества Discord', icon: '💬', lastUpdate: '29 января 2025 года' },
        site: { version: '1.0.0', url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/site-guidelines/', name: 'Правила использования сайта', icon: '🌐', lastUpdate: '6 апреля 2026 года' }
    };
    
    // Какие документы открыл пользователь
    let openedCount = 0;
    let totalUpdated = 0;
    
    // Находим обновлённые документы
    function getUpdated() {
        const result = [];
        for (const [key, doc] of Object.entries(DOCS)) {
            const saved = localStorage.getItem(`doc_${key}_v`);
            if (saved !== doc.version) {
                result.push({...doc, key});
            }
        }
        totalUpdated = result.length;
        return result;
    }
    
    // Проверяем, все ли открыты
    function allOpened() {
        return openedCount >= totalUpdated;
    }
    
    // Обновляем кнопку
    function updateButton() {
        const btn = document.getElementById('acceptBtn');
        const btnText = document.getElementById('btnText');
        if (!btn) return;
        
        if (allOpened()) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            if (btnText) btnText.innerHTML = '✅ Принять и продолжить';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            if (btnText) btnText.innerHTML = `🔒 Осталось открыть ${totalUpdated - openedCount} документов`;
        }
    }
    
    // Открыть все документы
    function openAllDocs(docs) {
        for (const doc of docs) {
            window.open(doc.url, '_blank');
        }
        openedCount = totalUpdated;
        updateButton();
    }
    
    // ========== ПОКАЗАТЬ ОКНО ==========
    const updatedDocs = getUpdated();
    
    if (updatedDocs.length > 0) {
        showModal(updatedDocs);
    }
    
    function showModal(docs) {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => showModal(docs));
            return;
        }
        
        document.body.style.overflow = 'hidden';
        
        // Список документов
        const docsList = docs.map(doc => `
            <li style="
                margin-bottom: 12px;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 12px;
                border-left: 3px solid #FFD700;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 24px;">${doc.icon}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${doc.name}</div>
                        <div style="font-size: 11px; color: #999;">от ${doc.lastUpdate}</div>
                    </div>
                </div>
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
                font-family: 'Montserrat', Arial, sans-serif;
            ">
                <div style="
                    background: white;
                    border-radius: 24px;
                    max-width: 450px;
                    width: 90%;
                    text-align: center;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
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
                        <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.9;">
                            Чтобы продолжить, откройте и ознакомьтесь с документами
                        </p>
                    </div>
                    
                    <div style="padding: 20px; max-height: 400px; overflow-y: auto;">
                        <ul style="list-style: none; margin: 0; padding: 0;">
                            ${docsList}
                        </ul>
                        
                        <button id="openAllBtn" style="
                            background: #0066CC;
                            color: white;
                            border: none;
                            width: 100%;
                            padding: 12px;
                            border-radius: 40px;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            margin: 15px 0;
                        ">
                            📖 Открыть все документы
                        </button>
                    </div>
                    
                    <div style="padding: 20px; border-top: 1px solid #eee;">
                        <button id="acceptBtn" disabled style="
                            background: #FFD700;
                            color: #1a1a2e;
                            border: none;
                            width: 100%;
                            padding: 14px;
                            border-radius: 40px;
                            font-size: 16px;
                            font-weight: bold;
                            opacity: 0.5;
                            cursor: not-allowed;
                        ">
                            <span id="btnText">🔒 Откройте документы</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Подключаем Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fa = document.createElement('link');
            fa.rel = 'stylesheet';
            fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fa);
        }
        
        // Кнопка "Открыть все"
        document.getElementById('openAllBtn').onclick = function() {
            for (const doc of docs) {
                window.open(doc.url, '_blank');
            }
            openedCount = docs.length;
            updateButton();
        };
        
        // Кнопка принятия
        document.getElementById('acceptBtn').onclick = function() {
            if (allOpened()) {
                for (const doc of docs) {
                    localStorage.setItem(`doc_${doc.key}_v`, doc.version);
                }
                modal.remove();
                document.body.style.overflow = '';
            }
        };
        
        updateButton();
    }
    
    console.log('update-docs.js загружен');
    
})();
