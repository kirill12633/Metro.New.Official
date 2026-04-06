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
    let opened = {};
    
    // Находим обновлённые документы
    function getUpdated() {
        const result = [];
        for (const [key, doc] of Object.entries(DOCS)) {
            const saved = localStorage.getItem(`doc_${key}_v`);
            if (saved !== doc.version) {
                result.push({...doc, key});
                opened[key] = false;
            }
        }
        return result;
    }
    
    // Проверяем, все ли документы открыты
    function allOpened() {
        for (const key in opened) {
            if (!opened[key]) return false;
        }
        return true;
    }
    
    // Обновляем кнопку
    function updateButton() {
        const btn = document.getElementById('acceptBtn');
        const text = document.getElementById('btnText');
        if (!btn) return;
        
        if (allOpened()) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            if (text) text.innerHTML = '✅ Принять и продолжить';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            if (text) text.innerHTML = '🔒 Откройте все документы выше';
        }
    }
    
    // Отметить документ как открытый
    function markOpened(docKey) {
        if (opened[docKey] === false) {
            opened[docKey] = true;
            // Меняем стиль строки
            const row = document.getElementById(`doc_${docKey}`);
            if (row) {
                row.style.background = '#e8f5e9';
                row.style.borderLeftColor = '#4CAF50';
                const badge = row.querySelector('.badge');
                if (badge) {
                    badge.innerHTML = '✓ прочитан';
                    badge.style.background = '#4CAF50';
                }
            }
            updateButton();
        }
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
        
        // Список документов с кнопками "Открыть"
        const docsList = docs.map(doc => `
            <tr id="doc_${doc.key}" style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; text-align: center; width: 50px;">${doc.icon}</td>
                <td style="padding: 12px;">
                    <strong>${doc.name}</strong><br>
                    <small style="color: #999;">от ${doc.lastUpdate}</small>
                </td>
                <td style="padding: 12px; text-align: center; width: 110px;">
                    <button class="openDocBtn" data-key="${doc.key}" data-url="${doc.url}" style="
                        background: #0066CC;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 20px;
                        cursor: pointer;
                        font-size: 12px;
                    ">
                        📖 Открыть
                    </button>
                </td>
                <td style="padding: 12px; text-align: center; width: 100px;">
                    <span class="badge" style="
                        font-size: 11px;
                        background: #dc3545;
                        color: white;
                        padding: 3px 8px;
                        border-radius: 20px;
                    ">не прочитан</span>
                </td>
            </tr>
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
                    border-radius: 20px;
                    max-width: 550px;
                    width: 90%;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                ">
                    <div style="
                        background: linear-gradient(135deg, #0066CC, #0052a3);
                        padding: 20px;
                        color: white;
                        text-align: center;
                    ">
                        <h2 style="margin: 0; font-size: 20px;">📢 Обновление документов</h2>
                        <p style="margin: 5px 0 0; font-size: 13px;">Чтобы продолжить, откройте каждый документ</p>
                    </div>
                    
                    <div style="overflow-y: auto; flex: 1;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f5f5f5;">
                                    <th style="padding: 10px;"></th>
                                    <th style="padding: 10px; text-align: left;">Документ</th>
                                    <th style="padding: 10px;"></th>
                                    <th style="padding: 10px;">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${docsList}
                            </tbody>
                        </table>
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
                            transition: all 0.3s;
                        ">
                            <span id="btnText">🔒 Откройте все документы выше</span>
                        </button>
                        <p style="font-size: 11px; color: #999; text-align: center; margin-top: 10px;">
                            <i class="fas fa-lock"></i> Нужно открыть каждый документ
                        </p>
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
        
        // Обработчики для кнопок "Открыть"
        document.querySelectorAll('.openDocBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.getAttribute('data-key');
                const url = this.getAttribute('data-url');
                
                // Открываем в новой вкладке
                const newWindow = window.open(url, '_blank');
                
                // Ждём, когда пользователь вернётся на вкладку
                const checkInterval = setInterval(() => {
                    if (document.hasFocus()) {
                        clearInterval(checkInterval);
                        markOpened(key);
                    }
                }, 500);
                
                // Таймаут на случай если пользователь не вернулся
                setTimeout(() => {
                    clearInterval(checkInterval);
                    if (!opened[key]) {
                        // Можно спросить "Вы прочитали?"
                        if (confirm(`Вы ознакомились с документом "${DOCS[key]?.name}"?`)) {
                            markOpened(key);
                        }
                    }
                }, 10000);
            });
        });
        
        // Кнопка принятия
        document.getElementById('acceptBtn').onclick = function() {
            if (allOpened()) {
                acceptUpdates(docs);
                modal.remove();
                document.body.style.overflow = '';
            }
        };
    }
    
    function acceptUpdates(docs) {
        for (const doc of docs) {
            const key = Object.keys(DOCS).find(k => DOCS[k].name === doc.name);
            if (key) {
                localStorage.setItem(`doc_${key}_v`, doc.version);
            }
        }
    }
    
    console.log('update-docs.js загружен');
    
})();
