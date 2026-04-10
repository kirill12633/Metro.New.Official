// ban-system.js - Полная система наказаний
// https://kirill12633.github.io/Metro.New.Official/ru/js/ban-system.js

(function() {
    'use strict';
    
    console.log('ban-system.js загружен');
    
    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        discordWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC',
        storageKey: 'metro_bans',
        autoBan: true,
        appealEmail: 'metro.new.help@gmail.com',
        
        // Уровни банов
        banLevels: {
            1: { name: '⚠️ Предупреждение', duration: 7 * 24 * 60 * 60 * 1000, color: 0xffc107 },
            2: { name: '🔇 Мут', duration: 1 * 24 * 60 * 60 * 1000, color: 0xff9800 },
            3: { name: '⏰ Бан на 7 дней', duration: 7 * 24 * 60 * 60 * 1000, color: 0xfd7e14 },
            4: { name: '🔒 Перманентный бан', duration: 0, color: 0xdc3545 }
        },
        
        // Репутация
        reputation: {
            start: 100,
            penalty: {
                rate_limit: -10,
                spam: -20,
                bot: -30,
                xss: -50,
                ban_evade: -40
            },
            reward: {
                day_without_violations: 1,
                appeal_accepted: 20
            },
            min: 0,
            max: 100
        },
        
        // Стоп-слова
        stopWords: [
            'как взломать', 'взлом метро', 'ddos', 'xss', 'инъекция',
            'admin password', 'sql injection', 'exploit', 'hack',
            'cheat', 'botnet', 'флуд', 'спам бот'
        ],
        
        limits: {
            rateLimitExceeded: 5,
            failedAttempts: 10,
            errorSpam: 20
        }
    };
    
    // ========== ХРАНИЛИЩЕ ==========
    let bans = [];
    let userLogs = [];      // Журнал действий
    let userReputation = {}; // Репутация
    let pendingBans = [];
    let appealRequests = [];
    
    // ========== ОТПЕЧАТОК БРАУЗЕРА ==========
    let visitorId = null;
    
    async function initFingerprint() {
        try {
            await loadFingerprintScript();
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            visitorId = result.visitorId;
            localStorage.setItem('metro_fingerprint', visitorId);
            return visitorId;
        } catch(e) {
            visitorId = localStorage.getItem('metro_fingerprint') || generateFallbackId();
            return visitorId;
        }
    }
    
    function loadFingerprintScript() {
        return new Promise((resolve, reject) => {
            if (window.FingerprintJS) { resolve(); return; }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    function generateFallbackId() {
        return 'fp_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
    }
    
    function getUserId() {
        return visitorId || localStorage.getItem('metro_user_id') || generateFallbackId();
    }
    
    // ========== ЖУРНАЛ ДЕЙСТВИЙ ==========
    function addLog(action, details = {}) {
        const log = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            userId: getUserId(),
            fingerprint: visitorId,
            action: action,
            details: details,
            timestamp: Date.now(),
            timestampStr: new Date().toLocaleString('ru-RU'),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        userLogs.unshift(log);
        if (userLogs.length > 500) userLogs.pop();
        saveLogs();
        
        // Проверка на стоп-слова
        if (action === 'message' || action === 'form_submit') {
            checkStopWords(details.text || '');
        }
        
        return log;
    }
    
    function checkStopWords(text) {
        if (!text) return;
        const lowerText = text.toLowerCase();
        
        for (const word of CONFIG.stopWords) {
            if (lowerText.includes(word)) {
                addPunishment('STOP_WORD', `Использование запрещённого слова: "${word}"`, 'auto');
                break;
            }
        }
    }
    
    function saveLogs() {
        try {
            localStorage.setItem('metro_user_logs', JSON.stringify(userLogs.slice(0, 500)));
        } catch(e) {}
    }
    
    function loadLogs() {
        try {
            const saved = localStorage.getItem('metro_user_logs');
            if (saved) userLogs = JSON.parse(saved);
        } catch(e) {}
    }
    
    // ========== СИСТЕМА РЕПУТАЦИИ ==========
    function getReputation(userId = null) {
        const id = userId || getUserId();
        if (userReputation[id] === undefined) {
            userReputation[id] = CONFIG.reputation.start;
        }
        return userReputation[id];
    }
    
    function changeReputation(delta, reason) {
        const userId = getUserId();
        let current = getReputation(userId);
        let newValue = current + delta;
        
        if (newValue > CONFIG.reputation.max) newValue = CONFIG.reputation.max;
        if (newValue < CONFIG.reputation.min) newValue = CONFIG.reputation.min;
        
        userReputation[userId] = newValue;
        saveReputation();
        
        addLog('reputation_change', { delta: delta, newValue: newValue, reason: reason });
        
        // Если репутация упала до 0 — автоматический бан
        if (newValue <= 0) {
            addPunishment('REPUTATION_ZERO', `Репутация упала до 0 (было: ${current}, стало: ${newValue})`, 'auto');
        }
        
        // Отправка в Discord при сильном падении
        if (delta <= -20) {
            sendDiscordLog(`📉 **Падение репутации**\nПользователь: ${userId}\nИзменение: ${delta}\nТекущая: ${newValue}\nПричина: ${reason}`);
        }
        
        return newValue;
    }
    
    function saveReputation() {
        try {
            localStorage.setItem('metro_reputation', JSON.stringify(userReputation));
        } catch(e) {}
    }
    
    function loadReputation() {
        try {
            const saved = localStorage.getItem('metro_reputation');
            if (saved) userReputation = JSON.parse(saved);
        } catch(e) {}
    }
    
    // ========== УРОВНИ БАНОВ ==========
    function getUserViolationCount() {
        const userId = getUserId();
        return bans.filter(b => b.userId === userId && b.type !== 'WARNING').length;
    }
    
    function getBanLevel() {
        const count = getUserViolationCount();
        if (count === 0) return null;
        if (count === 1) return 1;
        if (count === 2) return 2;
        if (count === 3) return 3;
        return 4;
    }
    
    function getNextBanLevel() {
        const count = getUserViolationCount();
        if (count >= 3) return 4;
        return count + 1;
    }
    
    // ========== ПРОВЕРКА АЛЬТЕРНАТИВНЫХ АККАУНТОВ ==========
    function findAlternativeAccounts() {
        const currentFingerprint = visitorId;
        const accounts = new Map();
        
        // Собираем все аккаунты с одинаковым fingerprint
        for (const ban of bans) {
            if (ban.fingerprint && ban.fingerprint === currentFingerprint) {
                accounts.set(ban.userId, (accounts.get(ban.userId) || 0) + 1);
            }
        }
        
        // Если больше 3 аккаунтов на одном fingerprint
        if (accounts.size >= 3) {
            sendDiscordLog(`⚠️ **Обнаружены альтернативные аккаунты**\nFingerprint: ${currentFingerprint}\nАккаунтов: ${accounts.size}\nID: ${Array.from(accounts.keys()).join(', ')}`);
            return Array.from(accounts.keys());
        }
        return [];
    }
    
    // ========== БАН ПО IP ПОДСЕТИ ==========
    function getNetworkPrefix(ip) {
        if (!ip || ip === 'unknown') return null;
        // Для IPv4: 192.168.1.xxx → 192.168.1.0/24
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
        }
        return null;
    }
    
    function banSubnet(ip, reason) {
        const subnet = getNetworkPrefix(ip);
        if (!subnet) return false;
        
        const ban = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            type: 'SUBNET_BAN',
            typeName: '🔒 Бан подсети',
            subnet: subnet,
            reason: reason,
            timestamp: Date.now(),
            timestampStr: new Date().toLocaleString('ru-RU'),
            expires: Date.now() + 24 * 60 * 60 * 1000  // 24 часа
        };
        
        bans.push(ban);
        saveBans();
        sendDiscordLog(`🌐 **БАН ПОДСЕТИ**\nПодсеть: ${subnet}\nПричина: ${reason}`);
        return true;
    }
    
    // ========== СОЗДАНИЕ НАКАЗАНИЯ ==========
    async function addPunishment(reason, evidence = null, source = 'auto') {
        const userId = getUserId();
        const violationCount = getUserViolationCount();
        const nextLevel = getNextBanLevel();
        const banConfig = CONFIG.banLevels[nextLevel];
        
        // Проверка на уже существующий бан
        const activeBan = getActiveBan();
        if (activeBan && activeBan.level >= 3) {
            return null;
        }
        
        // Определяем причину и тип
        const reasonMap = {
            'RATE_LIMIT': { name: 'Превышение лимита запросов', type: nextLevel },
            'STOP_WORD': { name: 'Использование запрещённых слов', type: nextLevel },
            'SPAM': { name: 'Спам', type: nextLevel },
            'BOT_DETECTED': { name: 'Обнаружен бот', type: nextLevel },
            'XSS_ATTEMPT': { name: 'Попытка XSS-атаки', type: 4 },
            'REPUTATION_ZERO': { name: 'Репутация упала до 0', type: 3 },
            'BAN_EVADE': { name: 'Попытка обхода бана', type: 4 }
        };
        
        const info = reasonMap[reason] || { name: reason, type: nextLevel };
        const banType = info.type;
        const banConfigType = CONFIG.banLevels[banType];
        
        const punishment = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            userId: userId,
            fingerprint: visitorId,
            reason: reason,
            reasonText: info.name,
            reasonDetail: evidence,
            level: banType,
            levelName: banConfigType.name,
            violationCount: violationCount + 1,
            source: source,
            timestamp: Date.now(),
            timestampStr: new Date().toLocaleString('ru-RU'),
            expires: banConfigType.duration ? Date.now() + banConfigType.duration : null,
            confirmed: source !== 'auto',
            confirmations: source !== 'auto' ? 1 : 0
        };
        
        // Меняем репутацию
        const penalty = CONFIG.reputation.penalty[reason.toLowerCase()] || -5;
        changeReputation(penalty, `Нарушение: ${info.name}`);
        
        // Логируем
        addLog('punishment', { reason: info.name, level: banType, evidence: evidence });
        
        // Отправляем в Discord
        await sendToDiscord(punishment);
        
        // Если это автоматический бан — ждём подтверждения
        if (source === 'auto' && banType < 4) {
            pendingBans.push(punishment);
            
            setTimeout(() => {
                const index = pendingBans.findIndex(b => b.id === punishment.id);
                if (index !== -1) {
                    pendingBans.splice(index, 1);
                    sendDiscordLog(`🟡 **АВТО-БАН ОТМЕНЁН**\nID: ${punishment.id}\nНе подтверждён вовремя`);
                }
            }, 30000);
            
            return { ...punishment, pending: true };
        } else {
            bans.push(punishment);
            saveBans();
            showBanNotification(punishment);
            return punishment;
        }
    }
    
    // ========== ПРОВЕРКА БАНА ==========
    function getActiveBan() {
        const userId = getUserId();
        const now = Date.now();
        
        // Проверка на бан подсети
        for (const ban of bans) {
            if (ban.type === 'SUBNET_BAN' && ban.expires > now) {
                return ban;
            }
        }
        
        // Проверка обычных банов
        for (const ban of bans) {
            if (ban.userId === userId && (!ban.expires || ban.expires > now)) {
                return ban;
            }
        }
        return null;
    }
    
    // ========== ПОКАЗ БАНА С ПРИЧИНОЙ ==========
    function showBanNotification(punishment) {
        const modal = document.createElement('div');
        modal.id = 'banNotification';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 99999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Montserrat', Arial, sans-serif;
        `;
        
        let content = '';
        if (punishment.expires) {
            const expireDate = new Date(punishment.expires).toLocaleString('ru-RU');
            content = `
                <h2>${punishment.levelName}</h2>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 10px; margin: 15px 0; text-align: left;">
                    <p><strong>📋 Причина:</strong> ${punishment.reasonText}</p>
                    ${punishment.reasonDetail ? `<p><strong>📝 Детали:</strong> ${punishment.reasonDetail}</p>` : ''}
                    <p><strong>⚠️ Нарушение №${punishment.violationCount}</strong></p>
                    <p><strong>⭐ Репутация:</strong> ${getReputation()}/100</p>
                    <p><strong>⏰ Снятие:</strong> ${expireDate}</p>
                </div>
                <button onclick="showAppealForm()" style="background: #0066CC; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer;">📨 Обжаловать</button>
                <p style="font-size: 11px; margin-top: 20px;">ID: ${punishment.id}</p>
            `;
        } else {
            content = `
                <h2>${punishment.levelName}</h2>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 10px; margin: 15px 0; text-align: left;">
                    <p><strong>📋 Причина:</strong> ${punishment.reasonText}</p>
                    ${punishment.reasonDetail ? `<p><strong>📝 Детали:</strong> ${punishment.reasonDetail}</p>` : ''}
                    <p><strong>⚠️ Нарушение №${punishment.violationCount}</strong></p>
                    <p><strong>⭐ Репутация:</strong> ${getReputation()}/100</p>
                </div>
                <button onclick="showAppealForm()" style="background: #0066CC; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer;">📨 Подать апелляцию</button>
                <p>Email: ${CONFIG.appealEmail}</p>
                <p style="font-size: 11px;">ID: ${punishment.id}</p>
            `;
        }
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; max-width: 450px; width: 90%; padding: 30px; text-align: center;">
                ${content}
                <hr>
                <p style="font-size: 11px; color: #999;">Метро New — Правила для всех</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        window.showAppealForm = () => {
            modal.remove();
            showAppealFormModal(punishment);
        };
    }
    
    function showAppealFormModal(punishment) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 99999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Montserrat', Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; max-width: 400px; width: 90%; padding: 30px;">
                <h2>📨 Апелляция</h2>
                <p><strong>Бан:</strong> ${punishment.levelName}</p>
                <p><strong>Причина:</strong> ${punishment.reasonText}</p>
                <textarea id="appealMessage" rows="5" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ccc; margin: 15px 0;" placeholder="Опишите ситуацию..."></textarea>
                <div style="display: flex; gap: 10px;">
                    <button id="submitAppealBtn" style="background: #0066CC; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer;">📤 Отправить</button>
                    <button id="closeAppealBtn" style="background: #ccc; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer;">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('submitAppealBtn').onclick = () => {
            const message = document.getElementById('appealMessage').value;
            if (!message.trim()) {
                alert('Напишите сообщение');
                return;
            }
            
            const appeal = {
                id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                userId: getUserId(),
                banId: punishment.id,
                message: message,
                timestamp: Date.now(),
                timestampStr: new Date().toLocaleString('ru-RU')
            };
            
            appealRequests.push(appeal);
            saveAppeals();
            
            sendDiscordLog(`📨 **НОВАЯ АПЕЛЛЯЦИЯ**\nID: ${appeal.id}\nПричина: ${punishment.reasonText}\nСообщение: ${message.substring(0, 200)}`);
            
            alert(`✅ Апелляция отправлена!\nID: ${appeal.id}\nОжидайте ответа на email`);
            modal.remove();
            document.body.style.overflow = '';
        };
        
        document.getElementById('closeAppealBtn').onclick = () => {
            modal.remove();
            document.body.style.overflow = '';
            showBanNotification(punishment);
        };
    }
    
    // ========== ОТПРАВКА В DISCORD ==========
    async function sendToDiscord(punishment) {
        if (!CONFIG.discordWebhook) return;
        
        const embed = {
            title: `🔨 ${punishment.levelName} (Уровень ${punishment.level})`,
            color: CONFIG.banLevels[punishment.level]?.color || 0xff0000,
            timestamp: new Date().toISOString(),
            fields: [
                { name: '👤 ID', value: `\`${punishment.userId?.substring(0, 20)}...\``, inline: false },
                { name: '📋 Причина', value: punishment.reasonText, inline: true },
                { name: '⚠️ Нарушение №', value: punishment.violationCount, inline: true },
                { name: '⭐ Репутация', value: getReputation(), inline: true },
                { name: '👮 Источник', value: punishment.source, inline: true }
            ]
        };
        
        if (punishment.reasonDetail) {
            embed.fields.push({ name: '📝 Детали', value: punishment.reasonDetail, inline: false });
        }
        
        try {
            await fetch(CONFIG.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch(e) {}
    }
    
    async function sendDiscordLog(message) {
        if (!CONFIG.discordWebhook) return;
        try {
            await fetch(CONFIG.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message })
            });
        } catch(e) {}
    }
    
    // ========== СОХРАНЕНИЕ ==========
    function saveBans() {
        try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(bans)); } catch(e) {}
    }
    
    function saveAppeals() {
        try { localStorage.setItem('metro_appeals', JSON.stringify(appealRequests)); } catch(e) {}
    }
    
    function loadData() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) bans = JSON.parse(saved);
            const savedAppeals = localStorage.getItem('metro_appeals');
            if (savedAppeals) appealRequests = JSON.parse(savedAppeals);
        } catch(e) {}
    }
    
    // ========== API ==========
    window.MetroBanSystem = {
        init: async () => {
            await initFingerprint();
            loadData();
            loadLogs();
            loadReputation();
            
            // Проверка на альтернативные аккаунты
            findAlternativeAccounts();
            
            const activeBan = getActiveBan();
            if (activeBan) showBanNotification(activeBan);
            return activeBan;
        },
        
        // Для модераторов
        getLogs: () => [...userLogs],
        getReputation: () => getReputation(),
        getViolationCount: () => getUserViolationCount(),
        getBanLevel: () => getBanLevel(),
        getNextBanLevel: () => getNextBanLevel(),
        
        // Ручной бан
        ban: (reason, evidence) => addPunishment(reason, evidence, 'moderator'),
        
        // Альтернативные аккаунты
        findAltAccounts: findAlternativeAccounts,
        
        // Бан подсети
        banSubnet: (ip, reason) => banSubnet(ip, reason),
        
        // Получение ID
        getUserId: () => getUserId(),
        
        // Тест
        test: async () => {
            await initFingerprint();
            console.log('Отпечаток:', visitorId);
            console.log('Репутация:', getReputation());
            console.log('Нарушений:', getUserViolationCount());
            console.log('Уровень бана:', getBanLevel());
            addPunishment('RATE_LIMIT', 'Тест', 'auto');
        }
    };
    
    // ========== ЗАПУСК ==========
    MetroBanSystem.init();
    
    console.log('ban-system.js готов (полная версия)');
    
})();
