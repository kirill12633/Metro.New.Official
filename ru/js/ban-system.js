// ban-system.js - Система наказаний с защитой от ложных банов
// https://kirill12633.github.io/Metro.New.Official/ru/js/ban-system.js

(function() {
    'use strict';
    
    console.log('ban-system.js загружен');
    
    // ========== НАСТРОЙКИ ==========
    const CONFIG = {
        discordWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC',
        storageKey: 'metro_bans',
        autoBan: true,
        
        // Защита от случайных банов
        requireConfirmations: 2,        // Нужно 2 подтверждения от разных систем
        gracePeriod: 30 * 1000,         // 30 секунд на отмену бана
        appealEmail: 'metro.new.help@gmail.com',
        
        limits: {
            rateLimitExceeded: 5,       // Увеличил с 3 до 5
            failedAttempts: 10,         // Увеличил с 5 до 10
            errorSpam: 20               // Увеличил с 10 до 20
        }
    };
    
    // ========== ТИПЫ НАКАЗАНИЙ ==========
    const PUNISHMENT_TYPES = {
        WARNING: { name: '⚠️ Предупреждение', duration: 0, color: 0xffc107, level: 1 },
        MUTE: { name: '🔇 Мут', duration: 60 * 60 * 1000, color: 0xff9800, level: 2 },
        TEMP_BAN: { name: '⏰ Временный бан', duration: 24 * 60 * 60 * 1000, color: 0xfd7e14, level: 3 },
        BAN: { name: '🔒 Перманентный бан', duration: 0, color: 0xdc3545, level: 4 }
    };
    
    // ========== ПРИЧИНЫ ==========
    const REASONS = {
        RATE_LIMIT: { name: 'Превышение лимита запросов', type: 'TEMP_BAN', duration: 60 * 60 * 1000, autoUnban: true },
        BOT_DETECTED: { name: 'Обнаружен бот/скрипт', type: 'TEMP_BAN', duration: 24 * 60 * 60 * 1000, autoUnban: true },
        XSS_ATTEMPT: { name: 'Попытка XSS-атаки', type: 'BAN', duration: 0, autoUnban: false },
        SPAM: { name: 'Спам в формах', type: 'MUTE', duration: 60 * 60 * 1000, autoUnban: true },
        UNDERAGE: { name: 'Нарушение возрастного ограничения', type: 'TEMP_BAN', duration: 30 * 24 * 60 * 60 * 1000, autoUnban: true },
        DOCUMENT_VIOLATION: { name: 'Игнорирование документов', type: 'WARNING', duration: 0, autoUnban: true },
        // Новая причина - техническая ошибка
        FALSE_POSITIVE: { name: 'Ложное срабатывание (отменён)', type: 'WARNING', duration: 0, autoUnban: true, isFalsePositive: true }
    };
    
    // ========== ХРАНИЛИЩЕ ==========
    let bans = [];
    let pendingBans = [];      // Баны на подтверждении
    let appealRequests = [];   // Запросы на апелляцию
    
    // ========== ОТПЕЧАТОК БРАУЗЕРА ==========
    let visitorId = null;
    let fingerprintReady = false;
    
    async function initFingerprint() {
        try {
            // Загружаем FingerprintJS
            await loadFingerprintScript();
            
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            visitorId = result.visitorId;
            fingerprintReady = true;
            console.log('Отпечаток браузера:', visitorId.substring(0, 16) + '...');
            
            // Сохраняем в localStorage как резерв
            localStorage.setItem('metro_fingerprint', visitorId);
            return visitorId;
        } catch(e) {
            console.warn('Fingerprint не загрузился, использую резервный ID');
            visitorId = localStorage.getItem('metro_fingerprint') || generateFallbackId();
            fingerprintReady = false;
            return visitorId;
        }
    }
    
    function loadFingerprintScript() {
        return new Promise((resolve, reject) => {
            if (window.FingerprintJS) {
                resolve();
                return;
            }
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
    
    // ========== ПОЛУЧЕНИЕ ID ПОЛЬЗОВАТЕЛЯ ==========
    function getUserId() {
        return visitorId || localStorage.getItem('metro_user_id') || generateFallbackId();
    }
    
    // ========== ПРОВЕРКА БАНА ==========
    function getActiveBan() {
        const userId = getUserId();
        const now = Date.now();
        
        for (const ban of bans) {
            if (ban.userId === userId && (!ban.expires || ban.expires > now)) {
                return ban;
            }
        }
        return null;
    }
    
    // ========== СОЗДАНИЕ НАКАЗАНИЯ (С ПОДТВЕРЖДЕНИЕМ) ==========
    async function addPunishment(reason, evidence = null, source = 'auto') {
        const userId = getUserId();
        
        // Проверяем, не забанен ли уже
        const existingBan = getActiveBan();
        if (existingBan && existingBan.level >= 3) {
            console.log('Пользователь уже забанен');
            return null;
        }
        
        const reasonConfig = REASONS[reason] || REASONS.RATE_LIMIT;
        const punishmentType = PUNISHMENT_TYPES[reasonConfig.type];
        
        const punishment = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            userId: userId,
            fingerprint: visitorId,
            reason: reason,
            reasonText: reasonConfig.name,
            type: reasonConfig.type,
            typeName: punishmentType.name,
            level: punishmentType.level,
            source: source,
            timestamp: Date.now(),
            timestampStr: new Date().toLocaleString('ru-RU'),
            expires: reasonConfig.duration ? Date.now() + reasonConfig.duration : null,
            evidence: evidence,
            autoUnban: reasonConfig.autoUnban,
            confirmed: source !== 'auto',  // Ручные баны сразу подтверждены
            confirmations: source !== 'auto' ? 1 : 0
        };
        
        // Автоматические баны требуют подтверждения
        if (source === 'auto') {
            pendingBans.push(punishment);
            
            // Отправляем уведомление модераторам
            await sendModeratorNotification(punishment);
            
            // Если через 30 секунд не подтвердили - отменяем
            setTimeout(() => {
                const index = pendingBans.findIndex(b => b.id === punishment.id);
                if (index !== -1) {
                    pendingBans.splice(index, 1);
                    console.log('Авто-бан отменён (таймаут):', punishment.id);
                    sendDiscordLog(`🟡 **АВТО-БАН ОТМЕНЁН**\nID: ${punishment.id}\nПричина: ${punishment.reasonText}\nНе подтверждён вовремя`);
                }
            }, CONFIG.gracePeriod);
            
            return { ...punishment, pending: true };
        } else {
            // Ручные баны сразу применяются
            punishment.confirmed = true;
            bans.push(punishment);
            saveBans();
            await sendToDiscord(punishment);
            showBanNotification(punishment);
            return punishment;
        }
    }
    
    // ========== ПОДТВЕРЖДЕНИЕ БАНА МОДЕРАТОРОМ ==========
    function confirmBan(banId, moderator) {
        const index = pendingBans.findIndex(b => b.id === banId);
        if (index === -1) return false;
        
        const ban = pendingBans[index];
        ban.confirmed = true;
        ban.confirmedBy = moderator;
        ban.confirmedAt = Date.now();
        ban.confirmedAtStr = new Date().toLocaleString('ru-RU');
        
        bans.push(ban);
        pendingBans.splice(index, 1);
        saveBans();
        
        sendToDiscord(ban);
        showBanNotification(ban);
        
        return true;
    }
    
    // ========== ОТМЕНА БАНА ==========
    function cancelBan(banId, moderator, reason) {
        // Ищем в ожидающих
        let index = pendingBans.findIndex(b => b.id === banId);
        if (index !== -1) {
            pendingBans.splice(index, 1);
            sendDiscordLog(`🟢 **БАН ОТМЕНЁН**\nID: ${banId}\nМодератор: ${moderator}\nПричина: ${reason}`);
            return true;
        }
        
        // Ищем в активных
        index = bans.findIndex(b => b.id === banId);
        if (index !== -1) {
            const ban = bans[index];
            bans.splice(index, 1);
            saveBans();
            sendDiscordLog(`🟢 **БАН СНЯТ**\nID: ${banId}\nПользователь: ${ban.userId}\nМодератор: ${moderator}\nПричина: ${reason}`);
            return true;
        }
        
        return false;
    }
    
    // ========== АПЕЛЛЯЦИЯ ОТ ПОЛЬЗОВАТЕЛЯ ==========
    function submitAppeal(reason, message) {
        const userId = getUserId();
        const activeBan = getActiveBan();
        
        if (!activeBan) {
            return { success: false, error: 'У вас нет активного бана' };
        }
        
        const appeal = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            userId: userId,
            banId: activeBan.id,
            reason: reason,
            message: message,
            timestamp: Date.now(),
            timestampStr: new Date().toLocaleString('ru-RU'),
            status: 'pending'  // pending, approved, rejected
        };
        
        appealRequests.push(appeal);
        saveAppeals();
        
        // Отправляем уведомление модераторам
        sendDiscordLog(`📨 **НОВАЯ АПЕЛЛЯЦИЯ**\nID: ${appeal.id}\nПричина бана: ${activeBan.reasonText}\nСообщение: ${message.substring(0, 200)}`);
        
        return { success: true, appealId: appeal.id };
    }
    
    // ========== ОТВЕТ НА АПЕЛЛЯЦИЮ ==========
    function respondToAppeal(appealId, approved, moderator, comment) {
        const index = appealRequests.findIndex(a => a.id === appealId);
        if (index === -1) return false;
        
        const appeal = appealRequests[index];
        appeal.status = approved ? 'approved' : 'rejected';
        appeal.moderator = moderator;
        appeal.moderatorComment = comment;
        appeal.respondedAt = Date.now();
        
        if (approved) {
            // Снимаем бан
            cancelBan(appeal.banId, moderator, 'Апелляция одобрена');
        }
        
        saveAppeals();
        return true;
    }
    
    // ========== ОТПРАВКА В DISCORD ==========
    async function sendToDiscord(punishment) {
        if (!CONFIG.discordWebhook) return;
        
        const embed = {
            title: `🔨 ${punishment.typeName}`,
            color: PUNISHMENT_TYPES[punishment.type]?.color || 0xff0000,
            timestamp: new Date().toISOString(),
            fields: [
                { name: '👤 ID', value: `\`${punishment.userId?.substring(0, 20)}...\``, inline: false },
                { name: '📋 Причина', value: punishment.reasonText, inline: true },
                { name: '👮 Источник', value: punishment.source, inline: true },
                { name: '🕐 Время', value: punishment.timestampStr, inline: true }
            ]
        };
        
        if (punishment.expires) {
            embed.fields.push({ name: '⏰ Снятие', value: new Date(punishment.expires).toLocaleString('ru-RU'), inline: true });
        }
        
        if (punishment.evidence) {
            embed.fields.push({ name: '📸 Доказательства', value: punishment.evidence, inline: false });
        }
        
        if (punishment.confirmedBy) {
            embed.fields.push({ name: '✅ Подтвердил', value: punishment.confirmedBy, inline: true });
        }
        
        try {
            await fetch(CONFIG.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch(e) {}
    }
    
    async function sendModeratorNotification(punishment) {
        if (!CONFIG.discordWebhook) return;
        
        const embed = {
            title: `⚠️ ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ`,
            color: 0xffc107,
            timestamp: new Date().toISOString(),
            fields: [
                { name: 'ID', value: `\`${punishment.id}\``, inline: false },
                { name: 'Причина', value: punishment.reasonText, inline: true },
                { name: 'Доказательства', value: punishment.evidence || 'нет', inline: true }
            ],
            footer: { text: `Подтвердите или отмените бан в течение ${CONFIG.gracePeriod / 1000} секунд` }
        };
        
        try {
            await fetch(CONFIG.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed], content: '@here' })
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
    
    // ========== ПОКАЗ УВЕДОМЛЕНИЯ ==========
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
                <h2>🔨 ${punishment.typeName}</h2>
                <p><strong>Причина:</strong> ${punishment.reasonText}</p>
                <p><strong>Снятие:</strong> ${expireDate}</p>
                <button onclick="showAppealForm()">📨 Обжаловать</button>
                <p style="font-size: 12px; margin-top: 20px;">ID: ${punishment.id}</p>
            `;
        } else {
            content = `
                <h2>🔒 ${punishment.typeName}</h2>
                <p><strong>Причина:</strong> ${punishment.reasonText}</p>
                <button onclick="showAppealForm()">📨 Подать апелляцию</button>
                <p>Email: ${CONFIG.appealEmail}</p>
                <p style="font-size: 12px;">ID: ${punishment.id}</p>
            `;
        }
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; max-width: 400px; width: 90%; padding: 30px; text-align: center;">
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
                <p>Бан ID: ${punishment.id}</p>
                <p>Причина: ${punishment.reasonText}</p>
                <textarea id="appealMessage" rows="5" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #ccc; margin: 15px 0;" placeholder="Опишите ситуацию..."></textarea>
                <div style="display: flex; gap: 10px;">
                    <button id="submitAppealBtn" style="background: #0066CC; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer;">📤 Отправить</button>
                    <button id="closeAppealBtn" style="background: #ccc; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer;">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        document.getElementById('submitAppealBtn').onclick = () => {
            const message = document.getElementById('appealMessage').value;
            if (!message.trim()) {
                alert('Напишите сообщение');
                return;
            }
            const result = submitAppeal(punishment.reason, message);
            if (result.success) {
                alert(`✅ Апелляция отправлена!\nID: ${result.appealId}\nОжидайте ответа на email`);
                modal.remove();
                document.body.style.overflow = '';
            } else {
                alert(`❌ Ошибка: ${result.error}`);
            }
        };
        
        document.getElementById('closeAppealBtn').onclick = () => {
            modal.remove();
            document.body.style.overflow = '';
            showBanNotification(punishment);
        };
    }
    
    // ========== СОХРАНЕНИЕ ==========
    function saveBans() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(bans));
        } catch(e) {}
    }
    
    function saveAppeals() {
        try {
            localStorage.setItem('metro_appeals', JSON.stringify(appealRequests));
        } catch(e) {}
    }
    
    function loadData() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) bans = JSON.parse(saved);
            const savedAppeals = localStorage.getItem('metro_appeals');
            if (savedAppeals) appealRequests = JSON.parse(savedAppeals);
        } catch(e) {}
    }
    
    // ========== API ДЛЯ МОДЕРАТОРОВ ==========
    window.MetroBanSystem = {
        init: async () => {
            await initFingerprint();
            loadData();
            const activeBan = getActiveBan();
            if (activeBan) showBanNotification(activeBan);
            return activeBan;
        },
        
        // Для модераторов
        confirmBan: (banId, moderator) => confirmBan(banId, moderator),
        cancelBan: (banId, moderator, reason) => cancelBan(banId, moderator, reason),
        respondToAppeal: (appealId, approved, moderator, comment) => respondToAppeal(appealId, approved, moderator, comment),
        
        // Просмотр
        getPendingBans: () => [...pendingBans],
        getActiveBans: () => [...bans],
        getAppeals: () => [...appealRequests],
        
        // Ручной бан
        ban: (reason, evidence) => addPunishment(reason, evidence, 'moderator'),
        
        // Тест
        test: async () => {
            await initFingerprint();
            console.log('Отпечаток:', visitorId);
            addPunishment('RATE_LIMIT', 'Тест', 'auto');
        },
        
        getVisitorId: () => visitorId
    };
    
    // ========== АВТОМАТИЧЕСКАЯ ФИКСАЦИЯ НАРУШЕНИЙ ==========
    let violations = { rateLimit: 0, failedAttempts: 0, errorSpam: [] };
    
    window.recordViolation = function(type) {
        if (!CONFIG.autoBan) return;
        
        switch(type) {
            case 'rate_limit':
                violations.rateLimit++;
                if (violations.rateLimit >= CONFIG.limits.rateLimitExceeded) {
                    addPunishment('RATE_LIMIT', `${violations.rateLimit} превышений`, 'auto');
                    violations.rateLimit = 0;
                }
                break;
            case 'failed_attempt':
                violations.failedAttempts++;
                if (violations.failedAttempts >= CONFIG.limits.failedAttempts) {
                    addPunishment('BOT_DETECTED', `${violations.failedAttempts} неудачных попыток`, 'auto');
                    violations.failedAttempts = 0;
                }
                break;
            case 'error_spam':
                const now = Date.now();
                violations.errorSpam = violations.errorSpam.filter(t => now - t < 60000);
                violations.errorSpam.push(now);
                if (violations.errorSpam.length >= CONFIG.limits.errorSpam) {
                    addPunishment('BOT_DETECTED', `${violations.errorSpam.length} ошибок за минуту`, 'auto');
                    violations.errorSpam = [];
                }
                break;
        }
    };
    
    // ========== ЗАПУСК ==========
    MetroBanSystem.init();
    
    console.log('ban-system.js готов (с защитой от ложных банов)');
    
})();
