document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementById('privacy-banner')) return;

    // Языки
    const languages = {
        ru: {
            text: `Мы собираем минимальные данные для работы сайта: IP и никнейм. 
                Используя сайт, вы соглашаетесь с нашей <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank" style="color: #FFD700; text-decoration: underline;">Политикой конфиденциальности</a>. 
                Рекомендуемый возраст — от 13 лет.`,
            button: 'Принять'
        },
        en: {
            text: `We collect minimal data for website functionality: IP and username. 
                By using the site, you agree to our <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" target="_blank" style="color: #FFD700; text-decoration: underline;">Privacy Policy</a>. 
                Recommended age — 13+.`,
            button: 'Accept'
        }
    };

    // Выбор языка
    let lang = navigator.language.startsWith('en') ? 'en' : 'ru';

    // Создаем баннер
    const banner = document.createElement('div');
    banner.id = 'privacy-banner';
    banner.style.position = 'fixed';
    banner.style.bottom = '-100px';
    banner.style.left = '0';
    banner.style.width = '100%';
    banner.style.background = 'linear-gradient(135deg, #0066CC, #0052a3)';
    banner.style.color = 'white';
    banner.style.padding = '15px';
    banner.style.textAlign = 'center';
    banner.style.zIndex = '9999';
    banner.style.fontFamily = "'Montserrat', sans-serif";
    banner.style.display = 'flex';
    banner.style.flexWrap = 'wrap';
    banner.style.justifyContent = 'center';
    banner.style.alignItems = 'center';
    banner.style.gap = '10px';
    banner.style.boxShadow = '0 -4px 12px rgba(0,0,0,0.15)';
    banner.style.transition = 'bottom 0.5s ease';

    const span = document.createElement('span');
    span.innerHTML = languages[lang].text;
    span.style.flex = '1 1 300px';
    span.style.textAlign = 'center';
    span.style.fontSize = '14px';

    const button = document.createElement('button');
    button.textContent = languages[lang].button;
    button.style.padding = '8px 16px';
    button.style.border = 'none';
    button.style.borderRadius = '50px';
    button.style.backgroundColor = '#FFD700';
    button.style.color = '#1A1A1A';
    button.style.fontWeight = '600';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.3s';

    button.addEventListener('click', function() {
        banner.style.bottom = '-120px';
        setTimeout(() => banner.remove(), 500);
    });

    banner.appendChild(span);
    banner.appendChild(button);
    document.body.appendChild(banner);

    // Плавное появление
    setTimeout(() => {
        banner.style.bottom = '0';
    }, 100);
});
