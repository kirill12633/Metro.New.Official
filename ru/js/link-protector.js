// link-protector.js - Защита от перехода по внешним ссылкам (с управлением)
// https://kirill12633.github.io/Metro.New.Official/ru/js/link-protector.js

(function() {
    'use strict';
    
    console.log('link-protector.js загружен');
    
    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        // Какие ссылки считать внешними (regex)
        externalPattern: /^(https?:\/\/)?(?!kirill12633\.github\.io)(?!localhost)(?!127\.0\.0\.1)[a-z0-9.-]+\.[a-z]{2,}/i,
        
        // Домены, которые считаются своими (без предупреждения)
        whitelist: [
            'kirill12633.github.io',
            'localhost',
            '127.0.0.1',
            'metro_new.betteruptime.com'
        ],
        
        // Задержка перед переходом (мс)
        delay: 500,
        
        // Ключ в localStorage
        storageKey: 'metro_link_protector_enabled'
    };
    
    // ========== СОСТОЯНИЕ ==========
    let isEnabled = true;
    let pendingUrl = null;
    let timeoutId = null;
    let modalOverlay = null;
    
    // ========== ЗАГРУЗКА СОСТОЯНИЯ ==========
    function loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved !== null) {
                isEnabled = saved === 'true';
            } else {
                // По умолчанию включено
                isEnabled = true;
                localStorage.setItem(CONFIG.storageKey, 'true');
            }
        } catch(e) {
            isEnabled = true;
        }
        console.log(`Link protector: ${isEnabled ? 'ВКЛЮЧЁН' : 'ВЫКЛЮЧЁН'}`);
    }
    
    function saveState() {
        try {
            localStorage.setItem(CONFIG.storageKey, isEnabled.toString());
        } catch(e) {}
    }
    
    // ========== ВКЛЮЧЕНИЕ/ВЫКЛЮЧЕНИЕ ==========
    function enable() {
        isEnabled = true;
        saveState();
        updateToggleButton();
        console.log('Link protector включён');
    }
    
    function disable() {
        isEnabled = false;
        saveState();
        updateToggleButton();
        console.log('Link protector выключён');
    }
    
    function toggle() {
        if (isEnabled) {
            disable();
        } else {
            enable();
        }
    }
    
    // ========== ПАНЕЛЬ УПРАВЛЕНИЯ В ФУТЕРЕ ==========
    function addControlPanel() {
        // Ждём загрузки футера
        setTimeout(() => {
            const footer = document.querySelector('footer');
            if (!footer) {
                console.log('Футер не найден, панель не добавлена');
                return;
            }
            
            // Проверяем, не добавлена ли уже
            if (document.getElementById('linkProtectorPanel')) return;
            
            const panelHTML = `
                <div id="linkProtectorPanel" style="
                    margin-top: 20px;
                    padding: 15px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                    text-align: center;
                ">
                    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 15px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-shield-alt" style="color: #FFD700;"></i>
                            <span style="font-size: 13px;">Защита от внешних ссылок</span>
                        </div>
                        <label id="linkProtectorToggle" style="
                            display: inline-flex;
                            align-items: center;
                            gap: 12px;
                            cursor: pointer;
                        ">
                            <span style="font-size: 13px;" id="linkProtectorStatus">Включена</span>
                            <div class="toggle-switch" style="
                                position: relative;
                                display: inline-block;
                                width: 50px;
                                height: 24px;
                            ">
                                <input type="checkbox" id="linkProtectorCheckbox" style="
                                    opacity: 0;
                                    width: 0;
                                    height: 0;
                                " ${isEnabled ? 'checked' : ''}>
                                <span class="toggle-slider" style="
                                    position: absolute;
                                    cursor: pointer;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background-color: ${isEnabled ? '#FFD700' : '#ccc'};
                                    transition: 0.3s;
                                    border-radius: 24px;
                                ">
                                    <span class="toggle-knob" style="
                                        position: absolute;
                                        content: '';
                                        height: 18px;
                                        width: 18px;
                                        left: 3px;
                                        bottom: 3px;
                                        background-color: white;
                                        transition: 0.3s;
                                        border-radius: 50%;
                                        transform: ${isEnabled ? 'translateX(26px)' : 'translateX(0)'};
                                    "></span>
                                </span>
                            </div>
                        </label>
                    </div>
                    <p style="font-size: 11px; margin-top: 10px; opacity: 0.6;">
                        Включите, чтобы при переходе на внешние сайты показывалось предупреждение
                    </p>
                </div>
            `;
            
            footer.insertAdjacentHTML('beforeend', panelHTML);
            
            // Добавляем обработчик
            const checkbox = document.getElementById('linkProtectorCheckbox');
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        enable();
                    } else {
                        disable();
                    }
                });
            }
            
        }, 1000);
    }
    
    function updateToggleButton() {
        const checkbox = document.getElementById('linkProtectorCheckbox');
        const statusSpan = document.getElementById('linkProtectorStatus');
        const slider = document.querySelector('#linkProtectorToggle .toggle-slider');
        const knob = document.querySelector('#linkProtectorToggle .toggle-knob');
        
        if (checkbox) {
            checkbox.checked = isEnabled;
        }
        
        if (statusSpan) {
            statusSpan.textContent = isEnabled ? 'Включена' : 'Выключена';
        }
        
        if (slider) {
            slider.style.backgroundColor = isEnabled ? '#FFD700' : '#ccc';
        }
        
        if (knob) {
            knob.style.transform = isEnabled ? 'translateX(26px)' : 'translateX(0)';
        }
    }
    
    // ========== ПРОВЕРКА, ВНЕШНЯЯ ЛИ ССЫЛКА ==========
    function isExternalLink(url) {
        if (!url) return false;
        if (url.startsWith('#')) return false;
        if (url.toLowerCase().startsWith('javascript:')) return true;
        if (url.startsWith('mailto:') || url.startsWith('tel:')) return false;
        
        try {
            const linkUrl = new URL(url, window.location.href);
            const currentHost = window.location.hostname;
            const linkHost = linkUrl.hostname;
            
            if (linkHost === '') return false;
            
            for (const allowed of CONFIG.whitelist) {
                if (linkHost === allowed || linkHost.endsWith('.' + allowed)) {
                    return false;
                }
                if (allowed.includes('/') && url.includes(allowed)) {
                    return false;
                }
            }
            
            if (linkHost === currentHost) return false;
            return true;
        } catch(e) {
            return false;
        }
    }
    
    // ========== МОДАЛЬНОЕ ОКНО ==========
    function createModal(url, target) {
        if (modalOverlay) {
            modalOverlay.remove();
            if (timeoutId) clearTimeout(timeoutId);
        }
        
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'link-protector-modal';
        modalOverlay.setAttribute('role', 'dialog');
        modalOverlay.setAttribute('aria-modal', 'true');
        
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999999;
            font-family: 'Montserrat', Arial, sans-serif;
            animation: fadeIn 0.2s ease;
        `;
        
        let displayDomain = url;
        try {
            const urlObj = new URL(url);
            displayDomain = urlObj.hostname;
        } catch(e) {}
        
        modalOverlay.innerHTML = `
            <div class="link-protector-modal-content" style="
                background: white;
                border-radius: 32px;
                max-width: 400px;
                width: 90%;
                padding: 35px 30px;
                text-align: center;
                animation: slideUp 0.3s ease;
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
            ">
                <div style="
                    width: 70px;
                    height: 70px;
                    background: #FFD700;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                ">
                    <i class="fas fa-external-link-alt" style="font-size: 32px; color: #1a1a2e;"></i>
                </div>
                
                <h2 style="font-size: 24px; color: #1a1a2e; margin-bottom: 10px;">
                    Вы покидаете наш сайт
                </h2>
                
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
                    Вы переходите на внешний сайт:
                </p>
                
                <div style="
                    background: #f8f9fa;
                    border-radius: 16px;
                    padding: 12px;
                    margin-bottom: 20px;
                    word-break: break-all;
                ">
                    <span style="font-size: 13px; color: #0066CC; font-family: monospace;">
                        ${escapeHtml(displayDomain)}
                    </span>
                </div>
                
                <div style="
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 12px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                    text-align: left;
                    font-size: 12px;
                    color: #856404;
                ">
                    <i class="fas fa-shield-alt"></i>
                    <strong>Мы не отвечаем за содержимое внешних сайтов.</strong>
                    <span style="display: block; margin-top: 5px;">Пожалуйста, будьте осторожны!</span>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="linkProtectorCancel" style="
                        background: transparent;
                        border: 2px solid #ddd;
                        color: #666;
                        padding: 12px 25px;
                        border-radius: 40px;
                        font-weight: 600;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        Отмена
                    </button>
                    <button id="linkProtectorConfirm" style="
                        background: linear-gradient(135deg, #FFD700, #e6c200);
                        color: #1a1a2e;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 40px;
                        font-weight: 600;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        Перейти на сайт
                    </button>
                </div>
                
                <div style="margin-top: 15px; font-size: 11px; color: #999;">
                    <span id="timerSeconds">${Math.ceil(CONFIG.delay / 1000)}</span> секунд до автоматического перехода
                </div>
            </div>
        `;
        
        document.body.appendChild(modalOverlay);
        document.body.style.overflow = 'hidden';
        
        if (!document.querySelector('#linkProtectorStyles')) {
            const style = document.createElement('style');
            style.id = 'linkProtectorStyles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
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
            `;
            document.head.appendChild(style);
        }
        
        const cancelBtn = document.getElementById('linkProtectorCancel');
        const confirmBtn = document.getElementById('linkProtectorConfirm');
        
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                if (timeoutId) clearTimeout(timeoutId);
                removeModal();
                pendingUrl = null;
            };
        }
        
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                if (timeoutId) clearTimeout(timeoutId);
                removeModal();
                executeRedirect(url, target);
            };
        }
        
        let secondsLeft = Math.ceil(CONFIG.delay / 1000);
        const timerSpan = document.getElementById('timerSeconds');
        
        timeoutId = setTimeout(() => {
            removeModal();
            executeRedirect(url, target);
        }, CONFIG.delay);
        
        const timerInterval = setInterval(() => {
            secondsLeft--;
            if (timerSpan) timerSpan.textContent = secondsLeft;
            if (secondsLeft <= 0) clearInterval(timerInterval);
        }, 1000);
        
        modalOverlay._timerInterval = timerInterval;
    }
    
    function removeModal() {
        if (modalOverlay) {
            if (modalOverlay._timerInterval) clearInterval(modalOverlay._timerInterval);
            modalOverlay.remove();
            modalOverlay = null;
        }
        document.body.style.overflow = '';
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }
    
    function executeRedirect(url, target) {
        pendingUrl = null;
        if (target === '_blank') {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    }
    
    // ========== ОБРАБОТЧИК КЛИКОВ ==========
    function handleLinkClick(event) {
        if (!isEnabled) return;
        
        let target = event.currentTarget;
        while (target && target.tagName !== 'A') {
            target = target.parentElement;
        }
        
        if (!target || target.tagName !== 'A') return;
        
        const url = target.getAttribute('href');
        if (!url) return;
        
        if (!isExternalLink(url)) return;
        if (target.hasAttribute('data-protected')) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const linkTarget = target.getAttribute('target') || '_self';
        createModal(url, linkTarget);
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function init() {
        loadState();
        
        const allLinks = document.querySelectorAll('a[href]');
        allLinks.forEach(link => {
            if (link.hasAttribute('data-protected')) return;
            link.setAttribute('data-protected', 'true');
            link.addEventListener('click', handleLinkClick);
            
            if (isExternalLink(link.getAttribute('href'))) {
                const icon = document.createElement('span');
                icon.className = 'external-link-icon';
                icon.textContent = ' ↗';
                icon.style.fontSize = '10px';
                icon.style.opacity = '0.6';
                link.appendChild(icon);
            }
        });
        
        addControlPanel();
        console.log(`link-protector: обработано ${allLinks.length} ссылок, режим: ${isEnabled ? 'ВКЛ' : 'ВЫКЛ'}`);
    }
    
    // ========== API ==========
    window.MetroLinkProtector = {
        enable: enable,
        disable: disable,
        toggle: toggle,
        isEnabled: () => isEnabled,
        checkUrl: (url) => isExternalLink(url)
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
