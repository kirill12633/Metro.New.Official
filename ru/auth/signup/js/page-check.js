// ============================================
// ПРОВЕРКА ДОМЕНА И ЗАЩИТА ОТ КОПИРОВАНИЯ
// ============================================

(function() {
    var allowedDomains = [
        'kirill12633.github.io',
        'localhost',
        '127.0.0.1'
    ];
    
    var currentHost = window.location.hostname;
    var isAllowed = false;
    
    for (var i = 0; i < allowedDomains.length; i++) {
        if (currentHost === allowedDomains[i]) {
            isAllowed = true;
            break;
        }
    }
    
    if (!isAllowed) {
        // Очищаем всю страницу
        document.documentElement.innerHTML = '';
        // Останавливаем загрузку
        window.stop();
        // Блокируем дальнейшее выполнение
        throw new Error('Доступ запрещён');
    }
    
    console.log('✅ Домен проверен: ' + currentHost);
})();
