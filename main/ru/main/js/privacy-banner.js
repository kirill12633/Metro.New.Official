(function() {
    'use strict';
    
    // ============ ПРОСТАЯ И ЧИСТАЯ РЕАЛИЗАЦИЯ ============
    
    // Проверяем базовые условия
    if (typeof document === 'undefined' || !document.body) {
        return; // Документ не готов
    }
    
    // Проверяем, не принял ли уже пользователь
    if (localStorage.getItem('metro_privacy_accepted')) {
        return; // Уже принял, не показываем
    }
    
    // Ждем полной загрузки страницы
    if (document.readyState !== 'loading') {
        initBanner();
    } else {
        document.addEventListener('DOMContentLoaded', initBanner);
    }
    
    function initBanner() {
        // Создаем баннер
        const banner = document.createElement('div');
        banner.id = 'metro-simple-privacy-banner';
        
        // Основные стили
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #0066CC, #0052a3);
            color: white;
            padding: 20px;
            z-index: 10000;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
            border-top: 3px solid #FFD700;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            transform: translateY(100%);
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        // Содержимое баннера
        banner.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;">
                    <div style="flex: 1; min-width: 250px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                            <div style="width: 32px; height: 32px; background: #FFD700; color: #0066CC; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">M</div>
                            <div style="font-weight: 600; font-size: 18px;">Метро New</div>
                        </div>
                        <p style="margin: 0; font-size: 14px; line-height: 1.5; opacity: 0.9;">
                            Используя сайт «Метро New», вы подтверждаете ознакомление и согласие с 
                            <a href="https://kirill12633.github.io/Metro.New.Official/Rules/privacy-policy.html" 
                               target="_blank"
                               style="color: #FFD700; text-decoration: underline; font-weight: 500;">
                                Политикой конфиденциальности
                            </a>
                            ${window.innerWidth > 768 ? 'и' : '<br>и'}
                            <a href="https://kirill12633.github.io/Metro.New.Official/Rules/terms-of-service.html" 
                               target="_blank"
                               style="color: #FFD700; text-decoration: underline; font-weight: 500;">
                                Пользовательским соглашением
                            </a>.
                        </p>
                    </div>
                    
                    <div style="display: flex; gap: 12px; flex-shrink: 0;">
                        <button id="metro-privacy-more" 
                                style="background: transparent; 
                                       border: 1px solid #FFD700; 
                                       color: #FFD700; 
                                       padding: 12px 20px; 
                                       border-radius: 6px; 
                                       cursor: pointer; 
                                       font-weight: 500;
                                       font-size: 14px;
                                       transition: all 0.2s;
                                       white-space: nowrap;">
                            Подробнее
                        </button>
                        <button id="metro-privacy-accept" 
                                style="background: #FFD700; 
                                       border: none; 
                                       color: #1A1A1A; 
                                       padding: 12px 30px; 
                                       border-radius: 6px; 
                                       cursor: pointer; 
                                       font-weight: 600;
                                       font-size: 14px;
                                       transition: all 0.2s;
                                       white-space: nowrap;">
                            Принимаю
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем на страницу
        document.body.appendChild(banner);
        
        // Анимация появления
        setTimeout(() => {
            banner.style.transform = 'translateY(0)';
        }, 500);
        
        // Обработчики событий
        setupEventListeners(banner);
        
        // Адаптивность для мобильных
        setupMobileAdaptive(banner);
        
        // Автоскрытие через 15 секунд
        const autoHideTimer = setTimeout(() => {
            hideBanner(banner, 'auto_hide');
        }, 15000);
        
        // Остановить автоскрытие при взаимодействии
        banner.addEventListener('mouseenter', () => clearTimeout(autoHideTimer));
        banner.addEventListener('touchstart', () => clearTimeout(autoHideTimer));
    }
    
    function setupEventListeners(banner) {
        // Кнопка "Принимаю"
        const acceptBtn = banner.querySelector('#metro-privacy-accept');
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('metro_privacy_accepted', 'true');
            hideBanner(banner, 'accepted');
            showConfirmation();
        });
        
        // Кнопка "Подробнее"
        const moreBtn = banner.querySelector('#metro-privacy-more');
        moreBtn.addEventListener('click', () => {
            window.open('https://kirill12633.github.io/Metro.New.Official/Rules/legal.html', '_blank');
        });
        
        // Эффекты при наведении на кнопки
        [acceptBtn, moreBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                btn.style.boxShadow = '';
            });
            
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
        
        // Закрытие при клике вне баннера
        document.addEventListener('click', (e) => {
            if (!banner.contains(e.target) && !e.target.closest('.privacy-modal')) {
                hideBanner(banner, 'outside_click');
            }
        }, { once: false });
    }
    
    function setupMobileAdaptive(banner) {
        function checkMobile() {
            if (window.innerWidth <= 768) {
                banner.style.padding = '15px';
                banner.style.textAlign = 'center';
                
                const content = banner.querySelector('div > div');
                content.style.flexDirection = 'column';
                content.style.gap = '15px';
                
                const buttons = banner.querySelector('div > div > div:last-child');
                buttons.style.width = '100%';
                buttons.style.justifyContent = 'center';
                
                banner.querySelectorAll('button').forEach(btn => {
                    btn.style.minWidth = '140px';
                });
            } else {
                banner.style.padding = '20px';
                banner.style.textAlign = '';
                
                const content = banner.querySelector('div > div');
                content.style.flexDirection = 'row';
                content.style.gap = '20px';
                
                const buttons = banner.querySelector('div > div > div:last-child');
                buttons.style.width = '';
                buttons.style.justifyContent = '';
            }
        }
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
    }
    
    function hideBanner(banner, reason) {
        banner.style.transform = 'translateY(100%)';
        
        setTimeout(() => {
            if (banner.parentNode) {
                banner.remove();
            }
        }, 500);
    }
    
    function showConfirmation() {
        const confirmation = document.createElement('div');
        confirmation.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FFD700;
            color: #1A1A1A;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        
        confirmation.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 24px; height: 24px; background: #1A1A1A; color: #FFD700; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">✓</div>
                <div>
                    <div style="font-weight: 600; font-size: 14px;">Принято!</div>
                    <div style="font-size: 12px; opacity: 0.8;">Спасибо за ваше согласие</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        // Добавляем анимации
        if (!document.querySelector('#metro-animations')) {
            const style = document.createElement('style');
            style.id = 'metro-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            confirmation.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (confirmation.parentNode) {
                    confirmation.remove();
                }
            }, 300);
        }, 3000);
    }
    
    // ============ АЛЬТЕРНАТИВА: МИНИМАЛЬНЫЙ БАННЕР ============
    // Если основной не работает, пробуем эту версию
    setTimeout(() => {
        if (!document.getElementById('metro-simple-privacy-banner') && 
            !localStorage.getItem('metro_privacy_accepted')) {
            createFallbackBanner();
        }
    }, 2000);
    
    function createFallbackBanner() {
        const fallback = document.createElement('div');
        fallback.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: #0066CC;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border-left: 4px solid #FFD700;
            max-width: 280px;
            animation: slideInRight 0.5s ease;
            font-family: sans-serif;
        `;
        
        fallback.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">Конфиденциальность</div>
            <div style="font-size: 12px; margin-bottom: 12px; opacity: 0.9;">
                Используя сайт, вы соглашаетесь с политиками.
            </div>
            <button onclick="this.parentElement.remove(); localStorage.setItem('metro_privacy_accepted', 'true');" 
                    style="background: #FFD700; border: none; color: #1A1A1A; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; width: 100%;">
                Понятно
            </button>
        `;
        
        document.body.appendChild(fallback);
        
        // Автоскрытие через 10 секунд
        setTimeout(() => {
            if (fallback.parentNode && !localStorage.getItem('metro_privacy_accepted')) {
                fallback.remove();
            }
        }, 10000);
    }
    
    // ============ ПРОСТАЯ ПРОВЕРКА БЛОКИРОВКИ ============
    // Проверяем, не заблокированы ли cookie/localStorage
    function checkStorage() {
        try {
            const testKey = 'metro_test_' + Date.now();
            localStorage.setItem(testKey, 'test');
            const value = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            return value === 'test';
        } catch (e) {
            console.warn('LocalStorage недоступен:', e.message);
            return false;
        }
    }
    
    // Если хранилище недоступно, используем sessionStorage
    if (!checkStorage()) {
        window.metroPrivacyStorage = {
            setItem: (key, value) => {
                try {
                    sessionStorage.setItem(key, value);
                } catch (e) {
                    // Используем временное хранилище в памяти
                    window._metroTempStorage = window._metroTempStorage || {};
                    window._metroTempStorage[key] = value;
                }
            },
            getItem: (key) => {
                try {
                    return sessionStorage.getItem(key);
                } catch (e) {
                    return window._metroTempStorage ? window._metroTempStorage[key] : null;
                }
            }
        };
    }
    
})();
