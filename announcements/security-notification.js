// ============================================
// ОФИЦИАЛЬНОЕ УВЕДОМЛЕНИЕ О БЕЗОПАСНОСТИ
// Проект "Метро New"
// Версия: 2.0
// Дата: 2026
// ============================================

(function() {
    'use strict';
    
    // Проверяем, не было ли уже показано уведомление
    if (document.getElementById('metro-security-notification')) {
        return;
    }
    
    // Создаем стили
    const styles = `
        .metro-security-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Montserrat', sans-serif;
        }
        
        .metro-security-notification {
            background: white;
            border-radius: 20px;
            width: 90%;
            max-width: 1000px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: metroFadeIn 0.5s ease-out;
        }
        
        @keyframes metroFadeIn {
            from {
                opacity: 0;
                transform: translateY(-30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        .metro-header {
            background: linear-gradient(135deg, #0066CC, #0052a3);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .metro-header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            right: -50%;
            bottom: -50%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.05)"/></svg>');
            opacity: 0.3;
        }
        
        .metro-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .metro-logo-icon {
            width: 50px;
            height: 50px;
            background: #FFD700;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #1A1A1A;
            font-weight: bold;
            font-size: 24px;
        }
        
        .metro-logo-text {
            font-size: 28px;
            font-weight: 700;
        }
        
        .metro-header h1 {
            font-size: 2.5rem;
            margin-bottom: 15px;
            position: relative;
            z-index: 2;
        }
        
        .metro-content {
            padding: 40px;
        }
        
        .metro-section {
            margin-bottom: 30px;
            padding: 25px;
            border-radius: 15px;
            background: #f8f9fa;
            border-left: 5px solid #0066CC;
        }
        
        .metro-section.warning {
            background: #fff3cd;
            border-left-color: #FFC107;
        }
        
        .metro-section.success {
            background: #d4edda;
            border-left-color: #28A745;
        }
        
        .metro-section h2 {
            color: #0066CC;
            margin-bottom: 20px;
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .metro-section.warning h2 {
            color: #856404;
        }
        
        .metro-section.success h2 {
            color: #155724;
        }
        
        .metro-code-block {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            overflow-x: auto;
            border-left: 4px solid #FFC107;
            position: relative;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        .metro-code-block::before {
            content: 'Обнаруженный код (зашифрован)';
            position: absolute;
            top: -10px;
            left: 10px;
            background: #FFC107;
            color: #000;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .metro-encrypted-text {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            letter-spacing: 1px;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: bold;
        }
        
        .metro-status-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .metro-status-card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border-top: 4px solid;
        }
        
        .metro-status-card.success {
            border-top-color: #28A745;
        }
        
        .metro-status-card.warning {
            border-top-color: #FFC107;
        }
        
        .metro-status-card.info {
            border-top-color: #0066CC;
        }
        
        .metro-footer {
            background: #1A1A1A;
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .metro-close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s;
            z-index: 10;
        }
        
        .metro-close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: rotate(90deg);
        }
        
        .metro-agree-btn {
            display: block;
            margin: 30px auto;
            background: #0066CC;
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .metro-agree-btn:hover {
            background: #0052a3;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,102,204,0.3);
        }
        
        @media (max-width: 768px) {
            .metro-security-notification {
                width: 95%;
                max-height: 95vh;
            }
            
            .metro-header {
                padding: 30px 20px;
            }
            
            .metro-header h1 {
                font-size: 2rem;
            }
            
            .metro-content {
                padding: 20px;
            }
            
            .metro-status-cards {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    // Добавляем стили
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // Добавляем шрифт
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    // Создаем HTML уведомления
    const notificationHTML = `
        <div class="metro-security-notification" id="metro-security-notification">
            <button class="metro-close-btn" onclick="window.metroCloseNotification()">×</button>
            
            <div class="metro-header">
                <div class="metro-logo">
                    <div class="metro-logo-icon">M</div>
                    <div class="metro-logo-text">Метро New</div>
                </div>
                <h1>ОФИЦИАЛЬНОЕ УВЕДОМЛЕНИЕ О БЕЗОПАСНОСТИ</h1>
                <p>Публичное заявление в соответствии с требованиями законодательства</p>
            </div>
            
            <div class="metro-content">
                <div class="metro-section">
                    <h2><i class="fas fa-bullhorn"></i> ОБЩАЯ ИНФОРМАЦИЯ</h2>
                    <p>Настоящим уведомляем, что система автоматического мониторинга безопасности GitHub обнаружила в кодовой базе проекта строку, содержащую данные для подключения к базе данных MongoDB.</p>
                    <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0; border: 2px solid #0066CC;">
                        <h3 style="color: #0066CC; margin-bottom: 15px;"><i class="fas fa-info-circle"></i> ВАЖНАЯ ИНФОРМАЦИЯ</h3>
                        <p><strong>Согласно проведённой проверке, указанная база данных либо не существовала в момент обнаружения, либо была создана в тестовых/учебных целях.</strong></p>
                    </div>
                </div>
                
                <div class="metro-status-cards">
                    <div class="metro-status-card success">
                        <div style="font-size: 2.5rem; margin-bottom: 15px; color: #28A745;">
                            <i class="fas fa-user-shield"></i>
                        </div>
                        <h3>Данные пользователей</h3>
                        <p>В безопасности. Не были скомпрометированы.</p>
                    </div>
                    
                    <div class="metro-status-card warning">
                        <div style="font-size: 2.5rem; margin-bottom: 15px; color: #FFC107;">
                            <i class="fas fa-database"></i>
                        </div>
                        <h3>База данных</h3>
                        <p>Не существовала или была тестовой</p>
                    </div>
                    
                    <div class="metro-status-card info">
                        <div style="font-size: 2.5rem; margin-bottom: 15px; color: #0066CC;">
                            <i class="fas fa-server"></i>
                        </div>
                        <h3>Серверы проекта</h3>
                        <p>Работают в штатном режиме</p>
                    </div>
                </div>
                
                <div class="metro-section warning">
                    <h2><i class="fas fa-exclamation-triangle"></i> ЧТО БЫЛО ОБНАРУЖЕНО</h2>
                    <p>В коде проекта была обнаружена строка подключения к MongoDB. <strong>В целях безопасности данные зашифрованы:</strong></p>
                    
                    <div class="metro-code-block">
                        <span class="metro-encrypted-text">mongodb+srv://██████████:████████████████████@█████████.██████████.███████████.███/████████</span>
                    </div>
                    
                    <p><strong>Важно:</strong> После тщательной проверки установлено, что данная база данных либо не существовала, либо была создана в учебных целях и не содержала реальных данных проекта.</p>
                </div>
                
                <div class="metro-section">
                    <h2><i class="fas fa-check-circle"></i> ПРИНЯТЫЕ МЕРЫ</h2>
                    <ul style="margin-left: 25px;">
                        <li><strong>Немедленное удаление</strong> – скомпрометированная строка была полностью удалена из кодовой базы проекта</li>
                        <li><strong>Полная проверка</strong> – проведён аудит всего кода на наличие других потенциальных уязвимостей</li>
                        <li><strong>Усиление безопасности</strong> – реализованы дополнительные меры защиты репозитория</li>
                        <li><strong>Мониторинг</strong> – установлены системы автоматического обнаружения подобных инцидентов</li>
                    </ul>
                </div>
                
                <div class="metro-section success">
                    <h2><i class="fas fa-shield-alt"></i> ТЕКУЩИЙ СТАТУС БЕЗОПАСНОСТИ</h2>
                    <p>Проект «Метро New» продолжает работать в штатном режиме. Все системы безопасности функционируют нормально.</p>
                    <p>Мы подтверждаем, что:</p>
                    <ul style="margin-left: 25px;">
                        <li>Никакие персональные данные пользователей не были скомпрометированы</li>
                        <li>Все серверы проекта находятся под полным контролем</li>
                        <li>Системы безопасности работают в штатном режиме</li>
                        <li>Проект продолжает развиваться и улучшать защиту данных</li>
                    </ul>
                </div>
                
                <button class="metro-agree-btn" onclick="window.metroCloseNotification()">
                    <i class="fas fa-check"></i> Я ПРОЧЕЛ И ПОНЯЛ УВЕДОМЛЕНИЕ
                </button>
            </div>
            
            <div class="metro-footer">
                <p style="font-size: 14px; color: rgba(255, 255, 255, 0.6);">
                    <strong>Дата публикации:</strong> 6 января 2026 года<br>
                    © 2026 Проект «Метро New». Все права защищены.
                </p>
            </div>
        </div>
    `;
    
    // Создаем оверлей и уведомление
    const overlay = document.createElement('div');
    overlay.className = 'metro-security-overlay';
    overlay.innerHTML = notificationHTML;
    
    // Добавляем на страницу
    document.body.appendChild(overlay);
    
    // Блокируем прокрутку страницы
    document.body.style.overflow = 'hidden';
    
    // Добавляем Font Awesome
    const faLink = document.createElement('link');
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    faLink.rel = 'stylesheet';
    document.head.appendChild(faLink);
    
    // Функция закрытия уведомления
    window.metroCloseNotification = function() {
        const overlay = document.querySelector('.metro-security-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transform = 'scale(0.95)';
            setTimeout(() => {
                document.body.removeChild(overlay);
                document.body.style.overflow = '';
                
                // Сохраняем в localStorage, что уведомление было показано
                try {
                    localStorage.setItem('metro_security_notification_shown', 'true');
                    localStorage.setItem('metro_notification_shown_date', new Date().toISOString());
                } catch (e) {
                    // LocalStorage недоступен
                }
            }, 300);
        }
    };
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.metroCloseNotification();
        }
    });
    
    // Закрытие по клику на оверлей (но не на само уведомление)
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            window.metroCloseNotification();
        }
    });
    
})();
