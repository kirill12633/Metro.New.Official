// js/audit-logger.js
class AuditLogger {
    constructor() {
        this.db = firebase.firestore();
        this.userCache = new Map();
    }

    async logAction(action, details = {}, documentId = null) {
        try {
            const user = firebase.auth().currentUser;
            if (!user) return null;

            const ip = await this.getIPAddress();
            const userAgent = navigator.userAgent;
            const location = await this.getLocationInfo(ip);

            const auditData = {
                userId: user.uid,
                userEmail: user.email,
                userRole: await this.getUserRole(user.uid),
                action: action,
                details: typeof details === 'string' ? details : JSON.stringify(details),
                documentId: documentId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ipAddress: ip,
                userAgent: userAgent,
                location: location,
                severity: this.getActionSeverity(action),
                sessionId: localStorage.getItem('session_id') || this.generateSessionId()
            };

            // Записываем в основную коллекцию аудита
            const logRef = await this.db.collection('audit_logs').add(auditData);
            
            // Также записываем в security_events если это событие безопасности
            if (this.isSecurityEvent(action)) {
                await this.db.collection('security_events').add({
                    ...auditData,
                    eventType: action,
                    handled: false
                });
            }

            console.log(`📝 Аудит: ${action}`, auditData);
            return logRef.id;

        } catch (error) {
            console.error('Ошибка записи аудита:', error);
            return null;
        }
    }

    async getUserRole(userId) {
        try {
            // Проверяем кэш
            if (this.userCache.has(userId)) {
                return this.userCache.get(userId);
            }

            const userDoc = await this.db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const role = userDoc.data().role || 'viewer';
                this.userCache.set(userId, role);
                return role;
            }
            return 'viewer';
        } catch {
            return 'unknown';
        }
    }

    async getIPAddress() {
        try {
            // Пробуем несколько сервисов
            const services = [
                'https://api.ipify.org?format=json',
                'https://api.my-ip.io/ip.json',
                'https://ipapi.co/json/'
            ];

            for (const service of services) {
                try {
                    const response = await fetch(service, { timeout: 3000 });
                    if (response.ok) {
                        const data = await response.json();
                        return data.ip || (typeof data === 'string' ? data : 'unknown');
                    }
                } catch (e) {
                    continue;
                }
            }
            return 'unknown';
        } catch {
            return 'unknown';
        }
    }

    async getLocationInfo(ip) {
        if (ip === 'unknown' || ip === '127.0.0.1') {
            return { country: 'Local', city: 'Local', isp: 'Local Network' };
        }

        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            if (response.ok) {
                const data = await response.json();
                return {
                    country: data.country_name || 'Unknown',
                    city: data.city || 'Unknown',
                    region: data.region || 'Unknown',
                    isp: data.org || 'Unknown',
                    latitude: data.latitude,
                    longitude: data.longitude
                };
            }
        } catch (error) {
            console.warn('Не удалось получить геолокацию:', error);
        }

        return { country: 'Unknown', city: 'Unknown', isp: 'Unknown' };
    }

    getActionSeverity(action) {
        const severityMap = {
            // Критические
            'failed_login': 'critical',
            'brute_force_attempt': 'critical',
            'access_denied': 'critical',
            'security_breach': 'critical',
            
            // Высокие
            'document_download': 'high',
            'document_print': 'high',
            'user_created': 'high',
            'user_modified': 'high',
            'settings_changed': 'high',
            
            // Средние
            'document_view': 'medium',
            'user_login': 'medium',
            'user_logout': 'medium',
            'search_performed': 'medium',
            
            // Низкие
            'page_view': 'low',
            'session_start': 'low',
            'session_end': 'low'
        };

        return severityMap[action] || 'low';
    }

    isSecurityEvent(action) {
        const securityEvents = [
            'failed_login', 'brute_force_attempt', 'access_denied',
            'security_breach', 'ip_blocked', 'suspicious_activity'
        ];
        return securityEvents.includes(action);
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Методы для админ-панели
    async getAuditLogs(filters = {}, limit = 100) {
        try {
            let query = this.db.collection('audit_logs')
                .orderBy('timestamp', 'desc')
                .limit(limit);

            // Применяем фильтры
            if (filters.userId) {
                query = query.where('userId', '==', filters.userId);
            }
            if (filters.action) {
                query = query.where('action', '==', filters.action);
            }
            if (filters.startDate) {
                query = query.where('timestamp', '>=', filters.startDate);
            }
            if (filters.endDate) {
                query = query.where('timestamp', '<=', filters.endDate);
            }
            if (filters.ip) {
                query = query.where('ipAddress', '==', filters.ip);
            }

            const snapshot = await query.get();
            const logs = [];
            
            snapshot.forEach(doc => {
                logs.push({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || new Date()
                });
            });

            return logs;

        } catch (error) {
            console.error('Ошибка получения логов:', error);
            return [];
        }
    }

    async getStatistics(startDate, endDate) {
        try {
            const logs = await this.getAuditLogs({ startDate, endDate }, 10000);
            
            const stats = {
                totalActions: logs.length,
                byAction: {},
                byUser: {},
                byHour: {},
                byIP: {},
                bySeverity: {
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0
                }
            };

            logs.forEach(log => {
                // По действиям
                stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
                
                // По пользователям
                stats.byUser[log.userEmail] = (stats.byUser[log.userEmail] || 0) + 1;
                
                // По часам
                const hour = log.timestamp.getHours();
                stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
                
                // По IP
                stats.byIP[log.ipAddress] = (stats.byIP[log.ipAddress] || 0) + 1;
                
                // По серьезности
                if (stats.bySeverity[log.severity] !== undefined) {
                    stats.bySeverity[log.severity]++;
                }
            });

            return stats;

        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            return null;
        }
    }

    async exportToCSV(filters = {}) {
        try {
            const logs = await this.getAuditLogs(filters, 5000);
            
            const headers = [
                'Timestamp', 'User Email', 'User Role', 'Action',
                'Details', 'IP Address', 'Country', 'City', 'User Agent', 'Severity'
            ];

            const rows = logs.map(log => [
                log.timestamp.toISOString(),
                log.userEmail,
                log.userRole,
                log.action,
                log.details,
                log.ipAddress,
                log.location?.country || 'Unknown',
                log.location?.city || 'Unknown',
                log.userAgent,
                log.severity
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            return csvContent;

        } catch (error) {
            console.error('Ошибка экспорта:', error);
            return '';
        }
    }

    async cleanupOldLogs(daysToKeep = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const snapshot = await this.db.collection('audit_logs')
                .where('timestamp', '<', cutoffDate)
                .get();

            const batch = this.db.batch();
            let deletedCount = 0;

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                deletedCount++;
            });

            await batch.commit();
            console.log(`🗑️ Удалено старых логов: ${deletedCount}`);
            
            return deletedCount;

        } catch (error) {
            console.error('Ошибка очистки логов:', error);
            return 0;
        }
    }

    // Мониторинг в реальном времени
    startRealtimeMonitoring(callback) {
        return this.db.collection('audit_logs')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const log = {
                            id: change.doc.id,
                            ...change.doc.data(),
                            timestamp: change.doc.data().timestamp?.toDate()
                        };
                        
                        // Оповещаем о критических событиях
                        if (log.severity === 'critical' && callback) {
                            callback('critical', log);
                        }
                    }
                });
            });
    }
}

// Глобальный экземпляр логгера
let auditLogger = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (firebase.apps.length) {
        auditLogger = new AuditLogger();
        window.auditLogger = auditLogger;
    }
});

// Вспомогательные функции для быстрого использования
async function logUserAction(action, details, documentId) {
    if (auditLogger) {
        return await auditLogger.logAction(action, details, documentId);
    }
    return null;
}

// Экспорт
window.AuditLogger = AuditLogger;
window.logUserAction = logUserAction;
