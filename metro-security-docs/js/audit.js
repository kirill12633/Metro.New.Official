class AuditSystem {
    constructor() {
        this.auditLogs = [];
        this.realtimeListener = null;
        this.init();
    }

    async init() {
        await this.loadRecentLogs();
        this.setupRealtimeUpdates();
    }

    async loadRecentLogs(limit = 50) {
        try {
            const snapshot = await firebaseConfig.db
                .collection(firebaseConfig.collections.AUDIT_LOGS)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            this.auditLogs = [];
            snapshot.forEach(doc => {
                this.auditLogs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.updateAuditUI();
        } catch (error) {
            console.error('Error loading audit logs:', error);
        }
    }

    setupRealtimeUpdates() {
        // Clean up previous listener
        if (this.realtimeListener) {
            this.realtimeListener();
        }

        // Set up new realtime listener
        this.realtimeListener = firebaseConfig.db
            .collection(firebaseConfig.collections.AUDIT_LOGS)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const log = {
                            id: change.doc.id,
                            ...change.doc.data()
                        };
                        
                        this.auditLogs.unshift(log);
                        if (this.auditLogs.length > 100) {
                            this.auditLogs.pop();
                        }
                        
                        this.updateAuditUI();
                        this.showNewLogNotification(log);
                    }
                });
            });
    }

    updateAuditUI() {
        const activityList = document.getElementById('recentActivity');
        const auditTable = document.getElementById('auditTable');
        
        if (activityList) {
            this.renderActivityList(activityList);
        }
        
        if (auditTable) {
            this.renderAuditTable(auditTable);
        }
    }

    renderActivityList(container) {
        container.innerHTML = '';
        
        const recentLogs = this.auditLogs.slice(0, 10);
        
        recentLogs.forEach(log => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            const icon = this.getActionIcon(log.action);
            const time = log.timestamp?.toDate().toLocaleTimeString('ru-RU') || 'Неизвестно';
            
            item.innerHTML = `
                <div class="activity-icon ${log.action}">${icon}</div>
                <div class="activity-details">
                    <strong>${this.getActionText(log.action)}</strong>
                    <p>${log.details}</p>
                    <small class="activity-time">${time} • ${log.userEmail}</small>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    renderAuditTable(container) {
        // Implement full audit table rendering
        console.log('Render audit table');
    }

    getActionIcon(action) {
        const icons = {
            'login': '🔐',
            'logout': '🚪',
            'document_view': '👁️',
            'document_download': '⬇️',
            'document_upload': '⬆️',
            'print_attempt': '🖨️',
            'access_denied': '⛔',
            'settings_change': '⚙️',
            'user_created': '👤',
            'user_modified': '✏️'
        };
        return icons[action] || '📝';
    }

    getActionText(action) {
        const texts = {
            'login': 'Вход в систему',
            'logout': 'Выход из системы',
            'document_view': 'Просмотр документа',
            'document_download': 'Скачивание документа',
            'document_upload': 'Загрузка документа',
            'print_attempt': 'Попытка печати',
            'access_denied': 'Доступ запрещен',
            'settings_change': 'Изменение настроек',
            'user_created': 'Создание пользователя',
            'user_modified': 'Изменение пользователя'
        };
        return texts[action] || action;
    }

    showNewLogNotification(log) {
        // Show notification for important events
        const importantActions = ['access_denied', 'document_download', 'user_created'];
        
        if (importantActions.includes(log.action) && Notification.permission === 'granted') {
            new Notification('📝 Новое событие аудита', {
                body: `${this.getActionText(log.action)}: ${log.details}`,
                icon: 'assets/logo.png'
            });
        }
    }

    async generateAuditReport(startDate, endDate, filters = {}) {
        try {
            let query = firebaseConfig.db
                .collection(firebaseConfig.collections.AUDIT_LOGS)
                .where('timestamp', '>=', firebaseConfig.formatFirestoreDate(startDate))
                .where('timestamp', '<=', firebaseConfig.formatFirestoreDate(endDate));

            // Apply filters
            if (filters.userId) {
                query = query.where('userId', '==', filters.userId);
            }
            
            if (filters.action) {
                query = query.where('action', '==', filters.action);
            }

            const snapshot = await query.orderBy('timestamp', 'desc').get();
            
            const report = {
                generatedAt: new Date(),
                period: { startDate, endDate },
                filters,
                totalRecords: snapshot.size,
                logs: [],
                statistics: {}
            };

            snapshot.forEach(doc => {
                report.logs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Calculate statistics
            report.statistics = this.calculateStatistics(report.logs);
            
            return report;

        } catch (error) {
            console.error('Error generating audit report:', error);
            throw error;
        }
    }

    calculateStatistics(logs) {
        const stats = {
            byAction: {},
            byUser: {},
            byHour: {},
            total: logs.length
        };

        logs.forEach(log => {
            // By action
            stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
            
            // By user
            stats.byUser[log.userEmail] = (stats.byUser[log.userEmail] || 0) + 1;
            
            // By hour
            const hour = log.timestamp?.toDate().getHours() || 0;
            stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
        });

        return stats;
    }

    async exportAuditLogs(format = 'csv') {
        const report = await this.generateAuditReport(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            new Date()
        );

        switch (format) {
            case 'csv':
                return this.convertToCSV(report.logs);
            case 'json':
                return JSON.stringify(report, null, 2);
            case 'pdf':
                return await this.generatePDF(report);
            default:
                throw new Error('Unsupported format');
        }
    }

    convertToCSV(logs) {
        const headers = ['Timestamp', 'User', 'Action', 'Details', 'IP Address'];
        const rows = logs.map(log => [
            log.timestamp?.toDate().toISOString() || '',
            log.userEmail || '',
            log.action || '',
            log.details || '',
            log.ipAddress || ''
        ]);

        return [headers, ...rows].map(row => 
            row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    async generatePDF(report) {
        // PDF generation implementation
        console.log('Generate PDF report');
        return null;
    }

    async searchAuditLogs(searchTerm, field = 'all') {
        try {
            let query = firebaseConfig.db
                .collection(firebaseConfig.collections.AUDIT_LOGS)
                .orderBy('timestamp', 'desc')
                .limit(100);

            const snapshot = await query.get();
            
            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(log => this.matchesSearch(log, searchTerm, field));

        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    matchesSearch(log, searchTerm, field) {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        
        if (field === 'all') {
            return (
                (log.userEmail && log.userEmail.toLowerCase().includes(term)) ||
                (log.action && log.action.toLowerCase().includes(term)) ||
                (log.details && log.details.toLowerCase().includes(term)) ||
                (log.ipAddress && log.ipAddress.includes(term))
            );
        }
        
        return log[field] && log[field].toString().toLowerCase().includes(term);
    }

    async cleanupOldLogs(daysToKeep = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const snapshot = await firebaseConfig.db
                .collection(firebaseConfig.collections.AUDIT_LOGS)
                .where('timestamp', '<', firebaseConfig.formatFirestoreDate(cutoffDate))
                .get();

            const batch = firebaseConfig.db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            
            console.log(`Cleaned up ${snapshot.size} old audit logs`);
            
            return snapshot.size;
            
        } catch (error) {
            console.error('Cleanup error:', error);
            return 0;
        }
    }
}

// Initialize audit system
const auditSystem = new AuditSystem();

// Schedule automatic cleanup (once per day)
setInterval(() => {
    auditSystem.cleanupOldLogs(90);
}, 24 * 60 * 60 * 1000);

// Export
window.auditSystem = auditSystem;
