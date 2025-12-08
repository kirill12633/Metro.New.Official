document.addEventListener('DOMContentLoaded', function() {
    const MODAL_VERSION = '3.0';
    const REDIRECT_LOGO_URL = 'https://kirill12633.github.io/Metro.New.Official/main/ru/main/profile/metro-new-official-1.html'; // куда будет переходить при клике на логотип

    // Проверка локальной версии согласия
    let acceptedVersion = localStorage.getItem('privacy_modal_version');
    if (acceptedVersion === MODAL_VERSION) return;

    // Определяем язык
    let lang = navigator.language.startsWith('en') ? 'en' : 'ru';

    const texts = {
        ru: {
            message: `
                Для использования нашего приложения вы должны принять условия 
                <a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank" style="color:#FFD700;text-decoration:underline;">Пользовательского соглашения</a> 
                и <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank" style="color:#FFD700;text-decoration:underline;">Политики конфиденциальности</a>. 
                Мы собираем минимальные данные: IP и никнейм. Рекомендуемый возраст — от 13 лет.
            `,
            button: 'Согласен и продолжаю использовать'
        },
        en: {
            message: `
                To use our app, you must accept the 
                <a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" target="_blank" style="color:#FFD700;text-decoration:underline;">Terms of Service</a> 
                and <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank" style="color:#FFD700;text-decoration:underline;">Privacy Policy</a>. 
                We collect minimal data: IP and username. Recommended age — 13+.
            `,
            button: 'Agree and continue'
        }
    };

    // Создаем overlay
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
    modal.style.backgroundColor = '#fff';
    modal.style.borderRadius = '15px';
    modal.style.padding = '30px 25px';
    modal.style.maxWidth = '500px';
    modal.style.width = '90%';
    modal.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
    modal.style.textAlign = 'center';
    modal.style.position = 'relative';
    modal.style.fontFamily = "'Montserrat', sans-serif";
    modal.style.color = '#1A1A1A';
    modal.style.transform = 'scale(0.8)';
    modal.style.transition = 'transform 0.3s ease';

    // Селектор языка
    const langSelector = document.createElement('div');
    langSelector.style.position = 'absolute';
    langSelector.style.top = '10px';
    langSelector.style.right = '15px';
    langSelector.style.display = 'flex';
    langSelector.style.gap = '5px';

    ['ru','en'].forEach(l => {
        const btn = document.createElement('button');
        btn.textContent = l.toUpperCase();
        btn.style.padding = '3px 6px';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.backgroundColor = l===lang?'#0066CC':'#DDD';
        btn.style.color = l===lang?'#fff':'#333';
        btn.addEventListener('click', () => {
            lang = l;
            text.innerHTML = texts[lang].message;
            button.textContent = texts[lang].button;
            Array.from(langSelector.children).forEach(b => {
                b.style.backgroundColor = b.textContent.toLowerCase()===lang?'#0066CC':'#DDD';
                b.style.color = b.textContent.toLowerCase()===lang?'#fff':'#333';
            });
        });
        langSelector.appendChild(btn);
    });

    // Логотип + галочка
    const logoDiv = document.createElement('div');
    logoDiv.style.display = 'flex';
    logoDiv.style.alignItems = 'center';
    logoDiv.style.justifyContent = 'center';
    logoDiv.style.gap = '10px';
    logoDiv.style.marginBottom = '20px';
    logoDiv.style.cursor = 'pointer';
    logoDiv.addEventListener('click', () => {
        window.location.href = REDIRECT_LOGO_URL;
    });

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
    official.style.transition = 'transform 0.3s';
    official.addEventListener('mouseenter', () => official.style.transform = 'scale(1.2)');
    official.addEventListener('mouseleave', () => official.style.transform = 'scale(1)');

    logoDiv.appendChild(logo);
    logoDiv.appendChild(official);

    // Текст уведомления
    const text = document.createElement('p');
    text.style.fontSize = '14px';
    text.style.lineHeight = '1.5';
    text.style.color = '#333';
    text.style.marginBottom = '20px';
    text.innerHTML = texts[lang].message;

    // Кнопка согласия
    const button = document.createElement('button');
    button.textContent = texts[lang].button;
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

    button.addEventListener('click', () => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.8)';
        setTimeout(() => overlay.remove(), 300);
        localStorage.setItem('privacy_modal_version', MODAL_VERSION);
    });

    // Добавляем элементы в модальное окно
    modal.appendChild(langSelector);
    modal.appendChild(logoDiv);
    modal.appendChild(text);
    modal.appendChild(button);
    overlay.appendChild(modal);

    // Плавное появление
    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 50);
});
