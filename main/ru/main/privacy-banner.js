document.addEventListener('DOMContentLoaded', function() {
    const MODAL_VERSION = '1.0'; // Можно менять при обновлении скрипта

    // Проверка локальной версии (необязательная)
    // let acceptedVersion = localStorage.getItem('privacy_modal_version');
    // if (acceptedVersion === MODAL_VERSION) return; // Если пользователь уже принял текущую версию

    // Создаем фон-маску
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '10000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(overlay);

    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#ffffff';
    modal.style.borderRadius = '15px';
    modal.style.padding = '30px 25px';
    modal.style.maxWidth = '500px';
    modal.style.width = '90%';
    modal.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
    modal.style.textAlign = 'center';
    modal.style.position = 'relative';
    modal.style.fontFamily = "'Montserrat', sans-serif";
    modal.style.color = '#1A1A1A';

    // Логотип и официальный значок
    const logoDiv = document.createElement('div');
    logoDiv.style.display = 'flex';
    logoDiv.style.alignItems = 'center';
    logoDiv.style.justifyContent = 'center';
    logoDiv.style.gap = '10px';
    logoDiv.style.marginBottom = '20px';

    const logo = document.createElement('span');
    logo.textContent = 'Метро New';
    logo.style.fontSize = '1.5rem';
    logo.style.fontWeight = '700';
    logo.style.color = '#0066CC';

    const official = document.createElement('span');
    official.textContent = '✔ Официально';
    official.style.fontSize = '0.9rem';
    official.style.color = '#28A745';
    official.style.fontWeight = '600';

    logoDiv.appendChild(logo);
    logoDiv.appendChild(official);

    // Текст уведомления
    const text = document.createElement('p');
    text.style.fontSize = '14px';
    text.style.lineHeight = '1.5';
    text.style.color = '#333';
    text.innerHTML = `
        Для использования нашего приложения вы должны принять условия 
        <a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank" style="color:#FFD700; text-decoration:underline;">Пользовательского соглашения</a> 
        и <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank" style="color:#FFD700; text-decoration:underline;">Политики конфиденциальности</a>. 
        Мы собираем минимальные данные: IP и никнейм.
    `;

    // Кнопка согласия
    const button = document.createElement('button');
    button.textContent = 'Согласен и продолжаю использовать';
    button.style.marginTop = '20px';
    button.style.padding = '12px 20px';
    button.style.border = 'none';
    button.style.borderRadius = '50px';
    button.style.backgroundColor = '#FFD700';
    button.style.color = '#1A1A1A';
    button.style.fontWeight = '600';
    button.style.fontSize = '14px';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.3s';
    button.addEventListener('mouseenter', () => button.style.transform = 'translateY(-2px)');
    button.addEventListener('mouseleave', () => button.style.transform = 'translateY(0)');

    button.addEventListener('click', function() {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
        // Можно сохранять версию
        // localStorage.setItem('privacy_modal_version', MODAL_VERSION);
    });

    // Добавляем элементы в модальное окно
    modal.appendChild(logoDiv);
    modal.appendChild(text);
    modal.appendChild(button);

    // Добавляем модальное окно на overlay
    overlay.appendChild(modal);

    // Плавное появление
    setTimeout(() => overlay.style.opacity = '1', 50);
});
