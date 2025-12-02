// main.js - Основные функции приложения
"use strict";

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', function() {
    initHomePage();
});

// Инициализация главной страницы
function initHomePage() {
    updateStatistics();
    loadRecentDocuments();
    loadSystems();
    setupEventListeners();
}

// Обновление статистики
function updateStatistics() {
    const stats = METRO_DOCUMENTS.getStatistics();
    
    document.getElementById('totalDocs').textContent = stats.total;
    document.getElementById('systemsCount').textContent = stats.systemsCount;
    document.getElementById('activeDocs').textContent = stats.active;
    
    // Обновляем счетчики в быстром доступе
    updateQuickAccessCounts();
}

// Обновить счетчики в быстром доступе
function updateQuickAccessCounts() {
    const projectCount = METRO_DOCUMENTS.documents.filter(d => d.type === 'project').length;
    const safetyCount = METRO_DOCUMENTS.documents.filter(d => d.type === 'safety').length;
    const ideaCount = METRO_DOCUMENTS.documents.filter(d => d.type === 'idea').length;
    
    document.querySelectorAll('.quick-count')[0].textContent = `${projectCount} документов`;
    document.querySelectorAll('.quick-count')[1].textContent = `${safetyCount} документов`;
    document.querySelectorAll('.quick-count')[2].textContent = `${ideaCount} документов`;
}

// Загрузка последних документов
function loadRecentDocuments() {
    const recentDocs = [...METRO_DOCUMENTS.documents]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);
    
    const container = document.getElementById('recentDocuments');
    
    if (!container) return;
    
    container.innerHTML = recentDocs.map(doc => `
        <div class="document-card" onclick="viewDocument(${doc.id})">
            <div class="doc-code">${doc.code}</div>
            <h4 class="doc-title">${doc.docTitle || doc.title}</h4>
            <p class="doc-desc">${doc.shortDesc}</p>
            <div class="doc-meta">
                <span>📅 ${METRO_DOCUMENTS.formatDate(doc.date)}</span>
                <span>👤 ${doc.author}</span>
            </div>
        </div>
    `).join('');
}

// Загрузка систем метро
function loadSystems() {
    const container = document.getElementById('systemsGrid');
    
    if (!container) return;
    
    container.innerHTML = METRO_DOCUMENTS.systems.map(system => `
        <div class="system-card" onclick="filterBySystem('${system.id}')">
            <div class="system-icon">🚇</div>
            <h4>${system.name}</h4>
            <p>${system.city}, ${system.country}</p>
            <div style="margin-top: 10px; font-size: 0.8em; color: #0c2461;">
                ${METRO_DOCUMENTS.documents.filter(d => d.system === system.id).length} документов
            </div>
        </div>
    `).join('');
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск по нажатию Enter на главной
    const mainSearch = document.getElementById('mainSearch');
    if (mainSearch) {
        mainSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                goToSearch();
            }
        });
    }
}

// Перейти на страницу поиска
function goToSearch() {
    const searchInput = document.getElementById('mainSearch');
    const query = searchInput ? searchInput.value.trim() : '';
    
    // Сохраняем поисковый запрос в sessionStorage
    sessionStorage.setItem('searchQuery', query);
    sessionStorage.setItem('searchFilter', 'all');
    
    // Переходим на страницу поиска
    window.location.href = 'search.html';
}

// Фильтр по типу документа
function filterByType(type) {
    sessionStorage.setItem('searchQuery', '');
    sessionStorage.setItem('searchFilter', type);
    window.location.href = 'search.html';
}

// Фильтр по системе метро
function filterBySystem(system) {
    sessionStorage.setItem('searchQuery', '');
    sessionStorage.setItem('systemFilter', system);
    window.location.href = 'search.html';
}

// Просмотр документа (переход на страницу документа)
function viewDocument(id) {
    sessionStorage.setItem('viewDocumentId', id);
    window.location.href = 'document.html';
}

// Функции для страницы поиска
function initSearchPage() {
    loadSearchResults();
    setupSearchFilters();
}

function loadSearchResults() {
    const query = sessionStorage.getItem('searchQuery') || '';
    const filter = sessionStorage.getItem('searchFilter') || 'all';
    const systemFilter = sessionStorage.getItem('systemFilter') || 'all';
    
    // Очищаем sessionStorage
    sessionStorage.removeItem('searchQuery');
    sessionStorage.removeItem('searchFilter');
    sessionStorage.removeItem('systemFilter');
    
    // Устанавливаем значения в форму
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const systemSelect = document.getElementById('systemFilter');
    
    if (searchInput) searchInput.value = query;
    if (typeFilter) typeFilter.value = filter;
    if (systemSelect) systemSelect.value = systemFilter;
    
    // Выполняем поиск
    performSearch();
}

function setupSearchFilters() {
    // Заполняем фильтры типами документов
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.innerHTML = `
            <option value="all">Все типы</option>
            ${METRO_DOCUMENTS.types.map(type => 
                `<option value="${type.id}">${type.icon} ${type.name}</option>`
            ).join('')}
        `;
    }
    
    // Заполняем фильтры системами
    const systemFilter = document.getElementById('systemFilter');
    if (systemFilter) {
        systemFilter.innerHTML = `
            <option value="all">Все системы</option>
            ${METRO_DOCUMENTS.systems.map(system => 
                `<option value="${system.id}">${system.name}</option>`
            ).join('')}
        `;
    }
    
    // Обработчики для фильтров
    const filters = ['typeFilter', 'systemFilter', 'statusFilter'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', performSearch);
        }
    });
    
    // Обработчик для поисковой строки
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
    }
    
    // Обработчик для кнопки поиска
    const searchBtn = document.getElementById('searchButton');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
}

function performSearch() {
    const query = document.getElementById('searchInput')?.value || '';
    const type = document.getElementById('typeFilter')?.value || 'all';
    const system = document.getElementById('systemFilter')?.value || 'all';
    const status = document.getElementById('statusFilter')?.value || 'all';
    
    const filters = { type, system, status };
    const results = METRO_DOCUMENTS.searchDocuments(query, filters);
    
    displaySearchResults(results);
}

function displaySearchResults(documents) {
    const container = document.getElementById('searchResults');
    const countElement = document.getElementById('resultsCount');
    
    if (!container) return;
    
    countElement.textContent = `Найдено документов: ${documents.length}`;
    
    if (documents.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; grid-column: 1 / -1;">
                <div style="font-size: 4em; margin-bottom: 20px;">🔍</div>
                <h3 style="color: #666; margin-bottom: 10px;">Документы не найдены</h3>
                <p style="color: #999;">Попробуйте изменить параметры поиска</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = documents.map(doc => `
        <div class="document-card" onclick="viewDocument(${doc.id})">
            <div class="doc-code">${doc.code}</div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 1.5em;">${METRO_DOCUMENTS.getTypeById(doc.type)?.icon || '📄'}</span>
                <h4 class="doc-title">${doc.title}</h4>
            </div>
            <p class="doc-desc">${doc.shortDesc}</p>
            <div class="doc-meta">
                <span>📅 ${METRO_DOCUMENTS.formatDate(doc.date)}</span>
                <span>👤 ${doc.author}</span>
                <span>👁️ ${doc.views}</span>
            </div>
            <div style="margin-top: 10px;">
                <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 15px; font-size: 0.8em;">
                    ${METRO_DOCUMENTS.getSystemById(doc.system)?.name || 'Неизвестно'}
                </span>
            </div>
        </div>
    `).join('');
}

// Функции для страницы документа
function initDocumentPage() {
    const docId = parseInt(sessionStorage.getItem('viewDocumentId'));
    
    if (!docId || isNaN(docId)) {
        document.body.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h2>Документ не найден</h2>
                <a href="search.html" class="back-button">← Вернуться к поиску</a>
            </div>
        `;
        return;
    }
    
    sessionStorage.removeItem('viewDocumentId');
    loadDocument(docId);
}

function loadDocument(id) {
    const doc = METRO_DOCUMENTS.getDocumentById(id);
    
    if (!doc) {
        document.body.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h2>Документ не найден</h2>
                <a href="search.html" class="back-button">← Вернуться к поиску</a>
            </div>
        `;
        return;
    }
    
    // Увеличиваем счетчик просмотров
    doc.views++;
    
    // Заполняем страницу
    document.title = `${doc.code} | Метро New`;
    
    const system = METRO_DOCUMENTS.getSystemById(doc.system);
    const type = METRO_DOCUMENTS.getTypeById(doc.type);
    
    document.getElementById('docTitle').textContent = doc.title;
    document.getElementById('docCode').textContent = doc.code;
    document.getElementById('docSystem').textContent = system?.name || 'Неизвестно';
    document.getElementById('docType').textContent = type?.name || 'Неизвестно';
    document.getElementById('docAuthor').textContent = doc.author;
    document.getElementById('docDate').textContent = METRO_DOCUMENTS.formatDate(doc.date);
    document.getElementById('docDepartment').textContent = doc.department;
    document.getElementById('docViews').textContent = doc.views;
    document.getElementById('docStatus').textContent = getStatusText(doc.status);
    document.getElementById('docPriority').textContent = getPriorityText(doc.priority);
    
    document.getElementById('docFullDesc').innerHTML = doc.fullDesc;
    
    // Заполняем теги
    const tagsContainer = document.getElementById('docTags');
    tagsContainer.innerHTML = doc.tags.map(tag => 
        `<span class="document-tag">${tag}</span>`
    ).join('');
    
    // Настраиваем кнопки действий
    document.getElementById('downloadBtn').onclick = () => downloadDocument(doc.code);
    document.getElementById('shareBtn').onclick = () => shareDocument(doc);
    document.getElementById('printBtn').onclick = () => window.print();
}

// Вспомогательные функции
function getStatusText(status) {
    const statuses = {
        'active': 'Активный',
        'review': 'На рассмотрении',
        'archive': 'Архивный',
        'draft': 'Черновик'
    };
    return statuses[status] || status;
}

function getPriorityText(priority) {
    const priorities = {
        'critical': 'Критический',
        'high': 'Высокий',
        'medium': 'Средний',
        'low': 'Низкий'
    };
    return priorities[priority] || priority;
}

function downloadDocument(code) {
    alert(`Загрузка документа ${code}...\nВ реальном приложении здесь был бы запрос на сервер`);
    // В реальном приложении: window.location.href = `/api/documents/${code}/download`;
}

function shareDocument(doc) {
    if (navigator.share) {
        navigator.share({
            title: `${doc.code} - ${doc.title}`,
            text: doc.shortDesc,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Ссылка на документ скопирована в буфер обмена');
        });
    }
}

// Дебаунс для поиска
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Инициализация страницы "О проекте"
function initAboutPage() {
    // Простая страница, ничего особенного не нужно
}

// Экспортируем функции для использования в HTML
window.goToSearch = goToSearch;
window.filterByType = filterByType;
window.filterBySystem = filterBySystem;
window.viewDocument = viewDocument;
window.performSearch = performSearch;
