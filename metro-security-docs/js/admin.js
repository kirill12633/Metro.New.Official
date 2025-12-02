// Админ-панель

class AdminPanel {
    constructor() {
        this.db = firebaseDB;
        this.auth = firebaseAuth;
        this.currentTab = 'dashboard';
    }
    
    // Инициализация
    async initialize() {
        await this.checkAdminAccess();
        await this.loadDashboardData();
        await this.setupRealtimeUpdates();
        this.setupEventListeners();
    }
    
    // Проверка прав администратора
    async checkAdminAccess() {
        const user = this.auth.currentUser;
        if (!user) {
            window.location.href = 'index.html';
            return false;
        }
        
        const userDoc = await this.db.collection('users').doc(user.uid).get();
        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    }
    
    // Загрузка данных дашборда
    async loadDashboardData() {
        await this.loadUserStats();
        await this.loadDocumentStats();
        await this.loadSecurityStats();
        await this.loadActivityChart();
        await this.loadDocumentsChart();
    }
    
    // Статистика пользователей
    async loadUserStats() {
        // Всего пользователей
        const usersSnapshot = await this.db.collection('users').get();
        document.getElementById('totalUsers').textContent = usersSnapshot.size;
        
        // Активных сегодня
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activeUsers = await this.db.collection('audit_logs')
            .where('action', '==', 'login_success')
            .where('timestamp', '>=', today)
            .get();
        
        const uniqueUsers = new Set();
        activeUsers.forEach(doc => {
            uniqueUsers.add(doc.data().userId);
        });
        
        document.getElementById('activeToday').textContent = uniqueUsers.size;
    }
    
    // Статистика документов
    async loadDocumentStats() {
        const docsSnapshot = await this.db.collection('documents').get();
        document.getElementById('totalDocuments').textContent = docsSnapshot.size;
    }
    
    // Статистика безопасности
    async loadSecurityStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const securityAttempts = await this.db.collection('audit_logs')
            .where('action', 'in', ['login_failed', 'unauthorized_access'])
            .where('timestamp', '>=', today)
            .get();
        
        document.getElementById('securityAttempts').textContent = securityAttempts.size;
    }
    
    // График активности
    async loadActivityChart() {
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        // Получаем данные за последние 7 дней
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const activityData = await this.getActivityData(sevenDaysAgo);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: activityData.labels,
                datasets: [{
                    label: 'Входы',
                    data: activityData.logins,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Просмотры документов',
                    data: activityData.views,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
    
    // График документов
    async loadDocumentsChart() {
        const ctx = document.getElementById('documentsChart').getContext('2d');
        
        const docsByType = await this.getDocumentsByType();
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: docsByType.labels,
                datasets: [{
                    data: docsByType.data,
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#e74c3c',
                        '#f39c12',
                        '#9b59b6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }
    
    // Получение данных активности
    async getActivityData(fromDate) {
        const days = [];
        const logins = [];
        const views = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(fromDate);
            date.setDate(date.getDate() + i);
            
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            
            // Входы за день
            const dayLogins = await this.db.collection('audit_logs')
                .where('action', '==', 'login_success')
                .where('timestamp', '>=', dayStart)
                .where('timestamp', '<=', dayEnd)
                .get();
            
            // Просмотры за день
            const dayViews = await this.db.collection('audit_logs')
                .where('action', '==', 'document_view')
                .where('timestamp', '>=', dayStart)
                .where('timestamp', '<=', dayEnd)
                .get();
            
            days.push(date.toLocaleDateString('ru-RU', { weekday: 'short' }));
            logins.push(dayLogins.size);
            views.push(dayViews.size);
        }
        
        return { labels: days, logins, views };
    }
    
    // Документы по типам
    async getDocumentsByType() {
        const docsSnapshot = await this.db.collection('documents').get();
        
        const types = {};
        docsSnapshot.forEach(doc => {
            const type = doc.data().type || 'other';
            types[type] = (types[type] || 0) + 1;
        });
        
        return {
            labels: Object.keys(types),
            data: Object.values(types)
        };
    }
    
    // Загрузка пользователей
    async loadUsers() {
        const usersSnapshot = await this.db.collection('users').get();
        const tbody = document.getElementById('usersTableBody');
        
        tbody.innerHTML = '';
        
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.displayName || '-'}</td>
                <td>
                    <span class="role-badge role-${user.role}">
                        ${this.getRoleName(user.role)}
                    </span>
                </td>
                <td>${user.department || '-'}</td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '-'}</td>
                <td>
                    <span class="status-badge status-active">
                        <i class="fas fa-circle"></i> Активен
                    </span>
                </td>
                <td>
                    <button onclick="editUser('${doc.id}')" class="btn-icon">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteUser('${doc.id}')" class="btn-icon btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    // Загрузка документов
    async loadDocuments() {
        const docsSnapshot = await this.db.collection('documents')
            .orderBy('createdAt', 'desc')
            .get();
        
        const tbody = document.getElementById('documentsTableBody');
        tbody.innerHTML = '';
        
        docsSnapshot.forEach(doc => {
            const document = doc.data();
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <span class="doc-code-small">${document.code}</span>
                </td>
                <td>${document.title}</td>
                <td>
                    <span class="type-badge type-${document.type}">
                        ${this.getTypeName(document.type)}
                    </span>
                </td>
                <td>
                    <span class="access-badge access-${document.accessLevel}">
                        ${this.getAccessLevelName(document.accessLevel)}
                    </span>
                </td>
                <td>${document.department || '-'}</td>
                <td>${document.createdAt ? new Date(document.createdAt).toLocaleDateString('ru-RU') : '-'}</td>
                <td>${document.downloads || 0}</td>
                <td>
                    <button onclick="viewDocument('${doc.id}')" class="btn-icon">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editDocument('${doc.id}')" class="btn-icon">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteDocument('${doc.id}')" class="btn-icon btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    // Загрузка логов
    async loadLogs(filters = {}) {
        let query = this.db.collection('audit_logs').orderBy('timestamp', 'desc').limit(100);
        
        if (filters.action && filters.action !== 'all') {
            query = query.where('action', '==', filters.action);
        }
        
        if (filters.dateFrom) {
            query = query.where('timestamp', '>=', new Date(filters.dateFrom));
        }
        
        if (filters.dateTo) {
            const dateTo = new Date(filters.dateTo);
            dateTo.setHours(23, 59, 59, 999);
            query = query.where('timestamp', '<=', dateTo);
        }
        
        const logsSnapshot = await query.get();
        const tbody = document.getElementById('logsTableBody');
        
        tbody.innerHTML = '';
        
        logsSnapshot.forEach(doc => {
            const log = doc.data();
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString('ru-RU') : '-'}</td>
                <td>${log.userEmail || '-'}</td>
                <td>
                    <span class="action-badge action-${log.action}">
                        ${this.getActionName(log.action)}
                    </span>
                </td>
                <td>${log.ip || '-'}</td>
                <td>
                    ${log.success !== undefined ? 
                        (log.success ? 
                            '<span class="status-success"><i class="fas fa-check"></i> Успех</span>' :
                            '<span class="status-failed"><i class="fas fa-times"></i> Ошибка</span>'
                        ) : '-'}
                </td>
                <td>
                    <button onclick="showLogDetails('${doc.id}')" class="btn-icon">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    // Real-time обновления
    async setupRealtimeUpdates() {
        // Обновление статистики при новых логах
        this.db.collection('audit_logs')
            .orderBy('timestamp', 'desc')
            .limit(1)
            .onSnapshot(() => {
                this.loadDashboardData();
            });
        
        // Обновление пользователей
        this.db.collection('users')
            .onSnapshot(() => {
                if (this.currentTab === 'users') {
                    this.loadUsers();
                }
            });
        
        // Обновление документов
        this.db.collection('documents')
            .onSnapshot(() => {
                if (this.currentTab === 'documents') {
                    this.loadDocuments();
                }
            });
    }
    
    // Вспомогательные методы
    getRoleName(role) {
        const roles = {
            'admin': 'Администратор',
            'manager': 'Руководитель',
            'employee': 'Сотрудник',
            'guest': 'Гость'
        };
        return roles[role] || role;
    }
    
    getTypeName(type) {
        const types = {
            'project': 'Проект',
            'safety': 'Безопасность',
            'technical': 'Технический',
            'operation': 'Эксплуатация'
        };
        return types[type] || type;
    }
    
    getAccessLevelName(level) {
        const levels = {
            'public': 'Публичный',
            'department': 'Отдел',
            'restricted': 'Ограниченный',
            'secret': 'Секретный'
        };
        return levels[level] || level;
    }
    
    getActionName(action) {
        const actions = {
            'login_success': 'Вход',
            'login_failed': 'Ошибка входа',
            'document_view': 'Просмотр',
            'document_download': 'Скачивание',
            'unauthorized_access': 'Несанкционированный доступ'
        };
        return actions[action] || action;
    }
    
    // Обработчики событий
    setupEventListeners() {
        // Переключение вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab || e.target.closest('.tab-btn').dataset.tab;
                this.showTab(tab);
            });
        });
        
        // Фильтры логов
        document.getElementById('logActionFilter')?.addEventListener('change', () => {
            this.applyLogFilters();
        });
    }
    
    // Показать вкладку
    showTab(tabName) {
        this.currentTab = tabName;
        
        // Обновляем активные кнопки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Показываем соответствующую панель
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabName}Tab`) {
                pane.classList.add('active');
            }
        });
        
        // Загружаем данные для вкладки
        switch(tabName) {
            case 'users':
                this.loadUsers();
                break;
            case 'documents':
                this.loadDocuments();
                break;
            case 'logs':
                this.loadLogs();
                break;
            case 'security':
                this.loadSecuritySettings();
                break;
        }
    }
    
    // Применение фильтров логов
    applyLogFilters() {
        const filters = {
            action: document.getElementById('logActionFilter').value,
            dateFrom: document.getElementById('logDateFrom').value,
            dateTo: document.getElementById('logDateTo').value
        };
        
        this.loadLogs(filters);
    }
}

// Инициализация
const adminPanel = new AdminPanel();

// Глобальные функции
function showTab(tabName) {
    adminPanel.showTab(tabName);
}

function initializeAdmin() {
    adminPanel.initialize();
}

window.adminPanel = adminPanel;
