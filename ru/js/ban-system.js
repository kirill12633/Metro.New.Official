// ban-system.js - Система банов по отпечатку браузера
// Добавьте этот код в ваш soft-limiter.js или подключите отдельно

(function() {
    'use strict';
    
    console.log('🛡️ Система банов по отпечатку загружена');
    
    // ========== НАСТРОЙКИ ==========
    const BAN_CONFIG = {
        // Хранилище банов
        storageKey: 'metro_banned_fingerprints',
        
        // Автоматически банить при достижении лимита подозрений
        autoBanOnSuspectLimit: true,
        
        // Длительность бана (в миллисекундах)
        // 0 = перманентный бан
        banDuration: 30 * 24 * 60 * 60 * 1000, // 30 дней
        
        // Причина бана по умолчанию
        defaultBanReason: 'Нарушение правил использования',
        
        // Webhook для уведомлений о бане
        banWebhook: 'https://discord.com/api/webhooks/1491839009020969083/6wS52vIVDWzPr1YhyaC4zNP_ggfEc-wdQR9-JgmiSSYsd50hTTIv0S-zkKVV77xZ0bmC', // Свой webhook для банов
        
        // Разрешить снятие бана через админ-панель
        allowUnban: true
    };
    
    // ========== УПРАВЛЕНИЕ БАНАМИ ==========
    
    // Получить список забаненных отпечатков
    function getBannedList() {
        try {
            const data = localStorage.getItem(BAN_CONFIG.storageKey);
            return data ? JSON.parse(data) : {};
        } catch(e) {
            return {};
        }
    }
    
    // Сохранить список банов
    function saveBannedList(banned) {
        try {
            localStorage.setItem(BAN_CONFIG.storageKey, JSON.stringify(banned));
        } catch(e) {
            console.error('❌ Не удалось сохранить список банов:', e);
        }
    }
    
    // Проверить, забанен ли отпечаток
    function isFingerprintBanned(fingerprint) {
        if (!fingerprint) return false;
        
        const banned = getBannedList();
        const banData = banned[fingerprint];
        
        if (!banData) return false;
        
        // Проверяем, не истек ли бан
        if (banData.expiresAt && banData.expiresAt > 0) {
            if (Date.now() > banData.expiresAt) {
                // Бан истек - удаляем
                delete banned[fingerprint];
                saveBannedList(banned);
                return false;
            }
        }
        
        return true;
    }
    
    // Добавить отпечаток в бан-лист
    function banFingerprint(fingerprint, reason = BAN_CONFIG.defaultBanReason, duration = BAN_CONFIG.banDuration) {
        if (!fingerprint) {
            console.error('❌ Не указан отпечаток для бана');
            return false;
        }
        
        const banned = getBannedList();
        
        // Проверяем, не забанен ли уже
        if (banned[fingerprint]) {
            console.log(`⚠️ Отпечаток ${fingerprint.substring(0, 16)}... уже в бане`);
            return false;
        }
        
        // Создаем запись о бане
        const banData = {
            fingerprint: fingerprint,
            reason: reason,
            bannedAt: Date.now(),
            expiresAt: duration > 0 ? Date.now() + duration : 0, // 0 = перманентный
            duration: duration,
            userAgent: navigator.userAgent,
            ip: 'скрыто', // Для приватности
            page: window.location.href
        };
        
        banned[fingerprint] = banData;
        saveBannedList(banned);
        
        // Отправляем уведомление о бане
        sendBanNotification(banData);
        
        console.log(`🔨 Выдан бан для отпечатка: ${fingerprint.substring(0, 16)}...`);
        console.log(`📝 Причина: ${reason}`);
        console.log(`⏱️ Длительность: ${duration > 0 ? Math.floor(duration / 86400000) + ' дней' : 'Перманентный'}`);
        
        return true;
    }
    
    // Снять бан с отпечатка
    function unbanFingerprint(fingerprint) {
        if (!fingerprint) return false;
        
        const banned = getBannedList();
        
        if (!banned[fingerprint]) {
            console.log(`⚠️ Отпечаток ${fingerprint.substring(0, 16)}... не в бане`);
            return false;
        }
        
        delete banned[fingerprint];
        saveBannedList(banned);
        
        console.log(`✅ Бан снят с отпечатка: ${fingerprint.substring(0, 16)}...`);
        return true;
    }
    
    // Получить информацию о бане
    function getBanInfo(fingerprint) {
        if (!fingerprint) return null;
        
        const banned = getBannedList();
        return banned[fingerprint] || null;
    }
    
    // Получить оставшееся время бана
    function getRemainingBanTime(fingerprint) {
        const banInfo = getBanInfo(fingerprint);
        if (!banInfo) return 0;
        
        if (banInfo.expiresAt === 0) return -1; // Перманентный
        
        const remaining = banInfo.expiresAt - Date.now();
        return remaining > 0 ? remaining : 0;
    }
    
    // ========== ОТПРАВКА УВЕДОМЛЕНИЙ ==========
    
    async function sendBanNotification(banData) {
        if (!BAN_CONFIG.banWebhook) {
            console.log('ℹ️ Webhook для банов не настроен');
            return;
        }
        
        const isPermanent = banData.expiresAt === 0;
        const durationStr = isPermanent ? '🔒 ПЕРМАНЕНТНЫЙ' : `${Math.floor(banData.duration / 86400000)} дней`;
        const expiresStr = isPermanent ? 'Никогда' : new Date(banData.expiresAt).toLocaleString('ru-RU');
        
        const embed = {
            title: '🔨 НОВЫЙ БАН',
            color: 0xff0000,
            timestamp: new Date(banData.bannedAt).toISOString(),
            fields: [
                { name: '🆔 Отпечаток', value: `\`${banData.fingerprint}\``, inline: false },
                { name: '📝 Причина', value: banData.reason, inline: false },
                { name: '⏱️ Длительность', value: durationStr, inline: true },
                { name: '📅 Истекает', value: expiresStr, inline: true },
                { name: '💻 User-Agent', value: banData.userAgent?.substring(0, 100) || 'неизвестно', inline: false },
                { name: '📄 Страница', value: banData.page || 'неизвестно', inline: false }
            ],
            footer: {
                text: 'Metro Ban System • Действие необратимо',
                icon_url: 'https://cdn.discordapp.com/emojis/123456789.png'
            }
        };
        
        try {
            await fetch(BAN_CONFIG.banWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
            console.log('✅ Уведомление о бане отправлено в Discord');
        } catch(e) {
            console.warn('❌ Не удалось отправить уведомление:', e);
        }
    }
    
    // ========== ИНТЕГРАЦИЯ С SOFT-LIMITER ==========
    
    // Автоматический бан при достижении лимита подозрений
    function checkAndBanOnSuspectLimit() {
        if (!BAN_CONFIG.autoBanOnSuspectLimit) return false;
        
        const state = JSON.parse(localStorage.getItem('metro_soft_limiter') || '{}');
        const suspectCount = state.suspectCount || 0;
        const limit = 3; // Лимит из CONFIG.SUSPECT_LIMIT
        
        if (suspectCount >= limit) {
            const fingerprint = getFingerprint();
            
            // Проверяем, не забанен ли уже
            if (!isFingerprintBanned(fingerprint)) {
                const reason = `Автоматический бан: ${suspectCount} подозрений за час`;
                banFingerprint(fingerprint, reason);
                return true;
            }
        }
        
        return false;
    }
    
    // Проверка при загрузке страницы
    function checkBanOnLoad() {
        const fingerprint = getFingerprint();
        
        if (isFingerprintBanned(fingerprint)) {
            const banInfo = getBanInfo(fingerprint);
            showBanScreen(banInfo);
            return true;
        }
        
        return false;
    }
    
    // ========== ЭКРАН БАНА ==========
    
    function showBanScreen(banInfo) {
        // Удаляем старый overlay если есть
        const oldOverlay = document.getElementById('banOverlay');
        if (oldOverlay) oldOverlay.remove();
        
        const isPermanent = banInfo.expiresAt === 0;
        const remaining = isPermanent ? -1 : getRemainingBanTime(banInfo.fingerprint);
        
        let timeStr = '🔒 ПЕРМАНЕНТНО';
        if (!isPermanent && remaining > 0) {
            const days = Math.floor(remaining / 86400000);
            const hours = Math.floor((remaining % 86400000) / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            timeStr = `${days}д ${hours}ч ${minutes}м`;
        } else if (!isPermanent && remaining <= 0) {
            // Бан истек - разбаниваем автоматически
            unbanFingerprint(banInfo.fingerprint);
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.id = 'banOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.97);
            z-index: 999999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Montserrat', Arial, sans-serif;
            animation: fadeIn 0.5s ease;
        `;
        
        overlay.innerHTML = `
            <div style="background: linear-gradient(145deg, #1a0a0a, #2a0a0a); border-radius: 30px; max-width: 450px; width: 90%; padding: 50px 35px; text-align: center; border: 2px solid #ff2222; box-shadow: 0 0 80px rgba(255,0,0,0.1);">
                <div style="font-size: 80px; margin-bottom: 20px;">🚫</div>
                <h1 style="color: #ff2222; font-size: 32px; margin-bottom: 10px;">ДОСТУП ЗАПРЕЩЁН</h1>
                <div style="width: 60px; height: 3px; background: #ff2222; margin: 15px auto;"></div>
                <p style="color: #ff6666; font-size: 16px; margin-bottom: 25px; line-height: 1.6;">
                    ${banInfo.reason || 'Нарушение правил использования'}
                </p>
                
                <div style="background: rgba(255,0,0,0.05); border-radius: 15px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(255,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: rgba(255,255,255,0.5); font-size: 13px;">⏱️ Длительность</span>
                        <span style="color: #ff6666; font-size: 14px; font-weight: 600;">${timeStr}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: rgba(255,255,255,0.5); font-size: 13px;">🆔 Ваш ID</span>
                        <span style="color: rgba(255,255,255,0.3); font-size: 11px; font-family: monospace;">${banInfo.fingerprint.substring(0, 20)}...</span>
                    </div>
                    ${!isPermanent ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="color: rgba(255,255,255,0.3); font-size: 12px;">Осталось до разблокировки</div>
                        <div style="font-size: 24px; font-weight: 700; color: #ff4444; font-family: monospace;" id="banCountdown">${timeStr}</div>
                    </div>
                    ` : ''}
                </div>
                
                <div style="color: rgba(255,255,255,0.2); font-size: 12px; line-height: 1.6;">
                    <p>⚠️ Обновление страницы или смена IP не помогут</p>
                    <p>📧 Для вопросов: support@example.com</p>
                    <p style="margin-top: 10px; font-size: 11px;">Бан выдан автоматически системой защиты</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        
        // Добавляем стили
        addBanStyles();
        
        // Запускаем таймер для не-перманентных банов
        if (!isPermanent && remaining > 0) {
            startBanCountdown(banInfo.fingerprint);
        }
    }
    
    function startBanCountdown(fingerprint) {
        const countdownEl = document.getElementById('banCountdown');
        if (!countdownEl) return;
        
        setInterval(() => {
            const remaining = getRemainingBanTime(fingerprint);
            
            if (remaining <= 0) {
                // Бан истек
                unbanFingerprint(fingerprint);
                const overlay = document.getElementById('banOverlay');
                if (overlay) overlay.remove();
                document.body.style.overflow = '';
                location.reload();
                return;
            }
            
            const days = Math.floor(remaining / 86400000);
            const hours = Math.floor((remaining % 86400000) / 3600000);
            const minutes = Math.floor((remaining % 3600000) / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            countdownEl.textContent = `${days}д ${hours}ч ${minutes}м ${seconds}с`;
        }, 1000);
    }
    
    function addBanStyles() {
        if (!document.querySelector('#banStyles')) {
            const style = document.createElement('style');
            style.id = 'banStyles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ========== ПОЛУЧЕНИЕ ОТПЕЧАТКА ==========
    
    function getFingerprint() {
        let fingerprint = localStorage.getItem('metro_fingerprint');
        
        if (!fingerprint) {
            // Создаем новый отпечаток, если его нет
            const components = [
                navigator.userAgent,
                navigator.language,
                navigator.platform,
                screen.width + 'x' + screen.height,
                screen.colorDepth,
                navigator.hardwareConcurrency || 'unknown',
                navigator.deviceMemory || 'unknown',
                new Date().getTimezoneOffset()
            ];
            
            fingerprint = btoa(components.join('|||')).substring(0, 64);
            localStorage.setItem('metro_fingerprint', fingerprint);
        }
        
        return fingerprint;
    }
    
    // ========== АДМИН-ФУНКЦИИ ==========
    
    // Получить список всех банов
    function getAllBans() {
        return getBannedList();
    }
    
    // Экспорт банов в JSON
    function exportBans() {
        const bans = getAllBans();
        const data = {
            exportedAt: new Date().toISOString(),
            totalBans: Object.keys(bans).length,
            bans: bans
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bans_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Импорт банов из JSON
    function importBans(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            const bans = data.bans || data;
            
            if (typeof bans !== 'object') {
                throw new Error('Неверный формат данных');
            }
            
            saveBannedList(bans);
            console.log(`✅ Импортировано ${Object.keys(bans).length} банов`);
            return true;
        } catch(e) {
            console.error('❌ Ошибка импорта банов:', e);
            return false;
        }
    }
    
    // Очистка истекших банов
    function cleanExpiredBans() {
        const banned = getBannedList();
        let cleaned = 0;
        
        for (const [fingerprint, data] of Object.entries(banned)) {
            if (data.expiresAt > 0 && Date.now() > data.expiresAt) {
                delete banned[fingerprint];
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            saveBannedList(banned);
            console.log(`🧹 Очищено ${cleaned} истекших банов`);
        }
        
        return cleaned;
    }
    
    // ========== API ==========
    window.MetroBanSystem = {
        // Основные функции
        isBanned: isFingerprintBanned,
        ban: banFingerprint,
        unban: unbanFingerprint,
        getBanInfo: getBanInfo,
        getRemainingTime: getRemainingBanTime,
        
        // Управление
        getAllBans: getAllBans,
        cleanExpired: cleanExpiredBans,
        exportBans: exportBans,
        importBans: importBans,
        
        // Настройки
        config: BAN_CONFIG,
        
        // Проверка при загрузке
        checkOnLoad: checkBanOnLoad
    };
    
    // ========== АВТОМАТИЧЕСКИЙ ЗАПУСК ==========
    
    // Проверяем бан при загрузке
    const isBanned = checkBanOnLoad();
    
    if (!isBanned) {
        // Проверяем, не пора ли забанить по лимиту подозрений
        checkAndBanOnSuspectLimit();
    }
    
    // Периодическая очистка истекших банов (раз в час)
    setInterval(cleanExpiredBans, 60 * 60 * 1000);
    
    console.log('✅ Система банов по отпечатку готова');
    console.log(`📊 Всего банов: ${Object.keys(getAllBans()).length}`);
    
})();
