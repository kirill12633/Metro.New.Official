// Утилиты для работы с датами и строками
export function formatDate(timestamp) {
    if (!timestamp || !timestamp.toDate) return 'Дата неизвестна';
    return new Date(timestamp.toDate()).toLocaleString('ru-RU');
}

export function sanitizeInput(text) {
    return text.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function showLoading(element) {
    if (element) {
        element.innerHTML = '<p>Загрузка...</p>';
    }
}

export function showError(element, message) {
    if (element) {
        element.innerHTML = `<p style="color: red;">${message}</p>`;
    }
}
