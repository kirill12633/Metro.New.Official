/**
 * Metro New — Roblox Developer Earnings Calculator
 * Встраиваемый калькулятор дохода разработчика Roblox
 * 
 * Как использовать:
 * 1. Добавьте на страницу: <div id="roblox-calculator"></div>
 * 2. Подключите этот скрипт: <script src="https://kirill12633.github.io/Metro.New.Official/ru/tools/roblox-calculator/embed.js"></script>
 * 
 * @version 1.0.0
 * @author Metro New Team
 */

(function() {
    'use strict';

    // Конфигурация
    const CONFIG = {
        apiBase: 'https://kirill12633.github.io/Metro.New.Official/api/earnings',
        containerId: 'roblox-calculator',
        version: '1.0.0'
    };

    // Стили для встраиваемого калькулятора
    const styles = `
        <style>
            .mn-calculator {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 800px;
                margin: 20px auto;
                padding: 25px;
                background: #ffffff;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.12);
                border: 1px solid #e8e8e8;
            }
            
            .mn-calculator * {
                box-sizing: border-box;
            }
            
            .mn-calculator .mn-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #0066CC;
            }
            
            .mn-calculator .mn-header .mn-logo {
                width: 42px;
                height: 42px;
                background: linear-gradient(135deg, #0066CC, #0052a3);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #FFD700;
                font-weight: 800;
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .mn-calculator .mn-header .mn-title {
                flex: 1;
            }
            
            .mn-calculator .mn-header .mn-title h3 {
                margin: 0;
                color: #1A1A1A;
                font-size: 18px;
                font-weight: 700;
            }
            
            .mn-calculator .mn-header .mn-title p {
                margin: 2px 0 0 0;
                color: #6C757D;
                font-size: 13px;
            }
            
            .mn-calculator .mn-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 18px;
                flex-wrap: wrap;
            }
            
            .mn-calculator .mn-tab {
                padding: 8px 18px;
                border-radius: 50px;
                border: 2px solid #ddd;
                background: #f8f9fa;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.3s;
                color: #6C757D;
                font-family: inherit;
            }
            
            .mn-calculator .mn-tab:hover {
                border-color: #4d94ff;
                color: #1A1A1A;
            }
            
            .mn-calculator .mn-tab.active {
                background: #0066CC;
                color: white;
                border-color: #0066CC;
            }
            
            .mn-calculator .mn-tab i {
                margin-right: 6px;
            }
            
            .mn-calculator .mn-panel {
                display: none;
                animation: mnFadeIn 0.3s ease;
            }
            
            .mn-calculator .mn-panel.active {
                display: block;
            }
            
            @keyframes mnFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .mn-calculator .mn-form {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 14px;
            }
            
            .mn-calculator .mn-form .mn-full {
                grid-column: 1 / -1;
            }
            
            .mn-calculator .mn-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .mn-calculator .mn-group label {
                font-weight: 600;
                font-size: 14px;
                color: #1A1A1A;
            }
            
            .mn-calculator .mn-group label .mn-hint {
                font-weight: 400;
                color: #6C757D;
                font-size: 12px;
            }
            
            .mn-calculator .mn-group input {
                padding: 10px 14px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 15px;
                transition: border-color 0.3s;
                background: #f8f9fa;
                font-family: inherit;
            }
            
            .mn-calculator .mn-group input:focus {
                outline: none;
                border-color: #0066CC;
                box-shadow: 0 0 0 3px rgba(0,102,204,0.1);
            }
            
            .mn-calculator .mn-btn {
                padding: 12px 24px;
                background: linear-gradient(135deg, #FFD700, #e6c200);
                color: #1A1A1A;
                border: none;
                border-radius: 12px;
                font-weight: 700;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
                font-family: inherit;
                width: 100%;
                margin-top: 4px;
            }
            
            .mn-calculator .mn-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255,215,0,0.4);
            }
            
            .mn-calculator .mn-btn:active {
                transform: translateY(0);
            }
            
            .mn-calculator .mn-result {
                margin-top: 20px;
                padding: 20px;
                border-radius: 12px;
                background: linear-gradient(135deg, #f0f7ff, #e8f0fe);
                border: 2px solid #4d94ff;
                display: none;
            }
            
            .mn-calculator .mn-result.show {
                display: block;
                animation: mnFadeIn 0.5s ease;
            }
            
            .mn-calculator .mn-result .mn-result-title {
                font-size: 16px;
                font-weight: 600;
                color: #0052a3;
                margin-bottom: 10px;
            }
            
            .mn-calculator .mn-result .mn-values {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 12px;
            }
            
            .mn-calculator .mn-result .mn-item {
                background: white;
                border-radius: 8px;
                padding: 12px 16px;
                text-align: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            
            .mn-calculator .mn-result .mn-item .mn-label {
                color: #6C757D;
                font-size: 12px;
                font-weight: 500;
            }
            
            .mn-calculator .mn-result .mn-item .mn-value {
                font-size: 24px;
                font-weight: 700;
                color: #1A1A1A;
            }
            
            .mn-calculator .mn-result .mn-item .mn-value.mn-robux {
                color: #0066CC;
            }
            
            .mn-calculator .mn-result .mn-item .mn-value.mn-usd {
                color: #2ecc71;
            }
            
            .mn-calculator .mn-result .mn-item .mn-sub {
                font-size: 11px;
                color: #6C757D;
            }
            
            .mn-calculator .mn-result .mn-formula {
                font-size: 13px;
                color: #6C757D;
                margin-top: 10px;
                text-align: center;
            }
            
            .mn-calculator .mn-result .mn-formula strong {
                color: #0052a3;
            }
            
            .mn-calculator .mn-footer {
                margin-top: 16px;
                padding-top: 14px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
                font-size: 12px;
                color: #6C757D;
            }
            
            .mn-calculator .mn-footer a {
                color: #0066CC;
                text-decoration: none;
                font-weight: 500;
            }
            
            .mn-calculator .mn-footer a:hover {
                text-decoration: underline;
            }
            
            .mn-calculator .mn-badge {
                background: #fff3cd;
                color: #856404;
                padding: 4px 12px;
                border-radius: 50px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .mn-calculator .mn-notice {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 10px 14px;
                border-radius: 6px;
                margin-bottom: 16px;
                font-size: 13px;
                color: #856404;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }
            
            .mn-calculator .mn-notice i {
                font-size: 18px;
                margin-top: 2px;
            }
            
            .mn-calculator .mn-notice strong {
                color: #856404;
            }
            
            /* Адаптация */
            @media (max-width: 600px) {
                .mn-calculator {
                    padding: 16px;
                    margin: 10px;
                }
                
                .mn-calculator .mn-form {
                    grid-template-columns: 1fr;
                }
                
                .mn-calculator .mn-tabs {
                    flex-direction: column;
                }
                
                .mn-calculator .mn-tab {
                    text-align: center;
                }
                
                .mn-calculator .mn-result .mn-values {
                    grid-template-columns: 1fr 1fr;
                }
                
                .mn-calculator .mn-header .mn-title h3 {
                    font-size: 16px;
                }
            }
            
            @media (max-width: 400px) {
                .mn-calculator .mn-result .mn-values {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;

    // HTML шаблон калькулятора
    const template = `
        <div class="mn-calculator" id="mnCalculator">
            ${styles}
            
            <div class="mn-header">
                <div class="mn-logo">M</div>
                <div class="mn-title">
                    <h3>💰 Калькулятор дохода разработчика Roblox</h3>
                    <p>от проекта <strong>Метро New</strong></p>
                </div>
                <span class="mn-badge">v1.0</span>
            </div>
            
            <div class="mn-notice">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Внимание:</strong> Расчёты приблизительные. 
                    Реальный доход может отличаться. Используйте в ознакомительных целях.
                </div>
            </div>
            
            <div class="mn-tabs">
                <button class="mn-tab active" data-tab="premium">
                    <i class="fas fa-crown"></i> Premium
                </button>
                <button class="mn-tab" data-tab="gamepass">
                    <i class="fas fa-ticket"></i> Game Pass
                </button>
                <button class="mn-tab" data-tab="players">
                    <i class="fas fa-users"></i> Игроки
                </button>
            </div>
            
            <!-- Premium -->
            <div class="mn-panel active" id="mnPremium">
                <form class="mn-form" id="mnPremiumForm">
                    <div class="mn-group">
                        <label>Визитов (X) <span class="mn-hint">за месяц</span></label>
                        <input type="number" id="mnPremiumVisits" placeholder="100000" min="0" step="1" value="100000">
                    </div>
                    <div class="mn-group">
                        <label>Среднее время (Y) <span class="mn-hint">в минутах</span></label>
                        <input type="number" id="mnPremiumTime" placeholder="20" min="0" step="0.1" value="20">
                    </div>
                    <div class="mn-full">
                        <button type="submit" class="mn-btn">
                            <i class="fas fa-calculator"></i> Рассчитать
                        </button>
                    </div>
                </form>
                
                <div class="mn-result" id="mnPremiumResult">
                    <div class="mn-result-title">📊 Результат (Premium выплаты)</div>
                    <div class="mn-values">
                        <div class="mn-item">
                            <div class="mn-label">Доход в Robux</div>
                            <div class="mn-value mn-robux" id="mnPremiumRobux">0</div>
                            <div class="mn-sub">за месяц</div>
                        </div>
                        <div class="mn-item">
                            <div class="mn-label">Доход в USD</div>
                            <div class="mn-value mn-usd" id="mnPremiumUsd">$0</div>
                            <div class="mn-sub">после вывода</div>
                        </div>
                    </div>
                    <div class="mn-formula">
                        <i class="fas fa-info-circle"></i> Формула: <strong>X × 0.05 × Y × 0.001</strong>
                    </div>
                </div>
            </div>
            
            <!-- Game Pass -->
            <div class="mn-panel" id="mnGamepass">
                <form class="mn-form" id="mnGamepassForm">
                    <div class="mn-group">
                        <label>Оценок (X) <span class="mn-hint">под пассом</span></label>
                        <input type="number" id="mnGamepassRatings" placeholder="200" min="0" step="1" value="200">
                    </div>
                    <div class="mn-group">
                        <label>Цена пасса (Y) <span class="mn-hint">в Robux</span></label>
                        <input type="number" id="mnGamepassPrice" placeholder="100" min="0" step="1" value="100">
                    </div>
                    <div class="mn-full">
                        <button type="submit" class="mn-btn">
                            <i class="fas fa-calculator"></i> Рассчитать
                        </button>
                    </div>
                </form>
                
                <div class="mn-result" id="mnGamepassResult">
                    <div class="mn-result-title">📊 Результат (Game Pass)</div>
                    <div class="mn-values">
                        <div class="mn-item">
                            <div class="mn-label">Доход в Robux</div>
                            <div class="mn-value mn-robux" id="mnGamepassRobux">0</div>
                            <div class="mn-sub">за всё время</div>
                        </div>
                        <div class="mn-item">
                            <div class="mn-label">Доход в USD</div>
                            <div class="mn-value mn-usd" id="mnGamepassUsd">$0</div>
                            <div class="mn-sub">после вывода</div>
                        </div>
                    </div>
                    <div class="mn-formula">
                        <i class="fas fa-info-circle"></i> Формула: <strong>X × 50 × Y × 0.7</strong>
                    </div>
                </div>
            </div>
            
            <!-- Сколько нужно игроков -->
            <div class="mn-panel" id="mnPlayers">
                <form class="mn-form" id="mnPlayersForm">
                    <div class="mn-group">
                        <label>Желаемый доход <span class="mn-hint">в Robux за месяц</span></label>
                        <input type="number" id="mnPlayersTarget" placeholder="10000" min="0" step="1" value="10000">
                    </div>
                    <div class="mn-group">
                        <label>Среднее время <span class="mn-hint">в минутах</span></label>
                        <input type="number" id="mnPlayersTime" placeholder="20" min="0" step="0.1" value="20">
                    </div>
                    <div class="mn-full">
                        <button type="submit" class="mn-btn">
                            <i class="fas fa-calculator"></i> Рассчитать
                        </button>
                    </div>
                </form>
                
                <div class="mn-result" id="mnPlayersResult">
                    <div class="mn-result-title">👥 Нужно игроков:</div>
                    <div class="mn-values">
                        <div class="mn-item" style="grid-column: 1 / -1;">
                            <div class="mn-label">Визитов в месяц</div>
                            <div class="mn-value mn-robux" id="mnPlayersNeeded" style="font-size: 32px;">0</div>
                        </div>
                        <div class="mn-item">
                            <div class="mn-label">В день</div>
                            <div class="mn-value" id="mnPlayersDay" style="color: #2ecc71;">0</div>
                        </div>
                        <div class="mn-item">
                            <div class="mn-label">В час</div>
                            <div class="mn-value" id="mnPlayersHour" style="color: #f39c12;">0</div>
                        </div>
                    </div>
                    <div class="mn-formula">
                        <i class="fas fa-info-circle"></i> Формула: <strong>X = доход / (0.05 × время × 0.001)</strong>
                    </div>
                </div>
            </div>
            
            <div class="mn-footer">
                <span>
                    <i class="fas fa-code"></i>
                    <a href="https://kirill12633.github.io/Metro.New.Official/ru/tools/roblox-calculator/" target="_blank">
                        Metro New Calculator
                    </a>
                </span>
                <span>
                    <i class="fas fa-info-circle"></i>
                    <a href="https://kirill12633.github.io/Metro.New.Official/ru/help/privacy-policy/" target="_blank">
                        Конфиденциальность
                    </a>
                </span>
            </div>
        </div>
    `;

    // Инициализация калькулятора
    function initCalculator() {
        const container = document.getElementById(CONFIG.containerId);
        if (!container) {
            console.warn('[Metro New Calculator] Контейнер #' + CONFIG.containerId + ' не найден');
            return;
        }

        // Вставляем HTML
        container.innerHTML = template;

        // --- Логика калькулятора ---
        
        // Переключение вкладок
        const tabs = container.querySelectorAll('.mn-tab');
        const panels = {
            premium: container.querySelector('#mnPremium'),
            gamepass: container.querySelector('#mnGamepass'),
            players: container.querySelector('#mnPlayers')
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const target = this.dataset.tab;
                Object.keys(panels).forEach(key => {
                    panels[key].classList.toggle('active', key === target);
                });
            });
        });

        // Формула Premium
        const premiumForm = container.querySelector('#mnPremiumForm');
        premiumForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const visits = parseFloat(container.querySelector('#mnPremiumVisits').value) || 0;
            const time = parseFloat(container.querySelector('#mnPremiumTime').value) || 0;
            
            const robux = visits * 0.05 * time * 0.001;
            const usd = (robux * 0.0035) - 5;
            
            container.querySelector('#mnPremiumRobux').textContent = Math.round(robux).toLocaleString();
            container.querySelector('#mnPremiumUsd').textContent = '$' + Math.max(0, usd).toFixed(2);
            container.querySelector('#mnPremiumResult').classList.add('show');
        });

        // Формула Game Pass
        const gamepassForm = container.querySelector('#mnGamepassForm');
        gamepassForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const ratings = parseFloat(container.querySelector('#mnGamepassRatings').value) || 0;
            const price = parseFloat(container.querySelector('#mnGamepassPrice').value) || 0;
            
            const robux = ratings * 50 * price * 0.7;
            const usd = (robux * 0.0035) - 5;
            
            container.querySelector('#mnGamepassRobux').textContent = Math.round(robux).toLocaleString();
            container.querySelector('#mnGamepassUsd').textContent = '$' + Math.max(0, usd).toFixed(2);
            container.querySelector('#mnGamepassResult').classList.add('show');
        });

        // Калькулятор "Сколько нужно игроков"
        const playersForm = container.querySelector('#mnPlayersForm');
        playersForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const target = parseFloat(container.querySelector('#mnPlayersTarget').value) || 0;
            const time = parseFloat(container.querySelector('#mnPlayersTime').value) || 1;
            
            const needed = target / (0.05 * time * 0.001);
            const perDay = needed / 30;
            const perHour = perDay / 24;
            
            container.querySelector('#mnPlayersNeeded').textContent = Math.round(needed).toLocaleString();
            container.querySelector('#mnPlayersDay').textContent = Math.round(perDay).toLocaleString();
            container.querySelector('#mnPlayersHour').textContent = Math.round(perHour).toLocaleString();
            container.querySelector('#mnPlayersResult').classList.add('show');
        });

        console.log('[Metro New Calculator] ✅ Калькулятор успешно загружен!');
    }

    // Запускаем при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalculator);
    } else {
        initCalculator();
    }

})();
