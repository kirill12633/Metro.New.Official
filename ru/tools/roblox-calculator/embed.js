document.addEventListener('DOMContentLoaded', function() {

    // ===== ТЕМА =====
    const THEME_KEY = 'metro_new_theme';
    const root = document.documentElement;

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
    }

    function getInitialTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    let currentTheme = getInitialTheme();
    applyTheme(currentTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(currentTheme);
            localStorage.setItem(THEME_KEY, currentTheme);
        });
    }

    if (!localStorage.getItem(THEME_KEY)) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
            if (!localStorage.getItem(THEME_KEY)) {
                currentTheme = e.matches ? 'light' : 'dark';
                applyTheme(currentTheme);
            }
        });
    }

    window.addEventListener('storage', (e) => {
        if (e.key === THEME_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
            currentTheme = e.newValue;
            applyTheme(currentTheme);
        }
    });

    // ===== БУРГЕР =====
    const burger = document.getElementById('burgerMenu');
    const navLinks = document.getElementById('navLinks');
    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        document.querySelectorAll('.nav-links a, .dropdown-content a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }

    // ===== ДРОПДАУН =====
    const dropdownOther = document.getElementById('dropdownOther');
    const dropdownBtn = document.getElementById('dropdownBtn');
    if (dropdownBtn && dropdownOther) {
        dropdownBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdownOther.classList.toggle('open');
        });

        document.addEventListener('click', function(e) {
            if (!dropdownOther.contains(e.target)) {
                dropdownOther.classList.remove('open');
            }
        });
    }

    // ===== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (ОСНОВНЫЕ) =====
    const mainTabs = document.querySelectorAll('#mainTabs .tab');
    const mainPanels = {
        premium: document.getElementById('panel-premium'),
        gamepass: document.getElementById('panel-gamepass'),
        players: document.getElementById('panel-players')
    };

    mainTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            mainTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const target = this.dataset.tab;
            Object.keys(mainPanels).forEach(key => {
                if (mainPanels[key]) {
                    mainPanels[key].classList.toggle('active', key === target);
                }
            });
        });
    });

    // ===== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (ДОПОЛНИТЕЛЬНЫЕ) =====
    const extraTabs = document.querySelectorAll('#extraTabs .tab');
    const extraPanels = {
        payback: document.getElementById('panel-payback'),
        'gamepass-extra': document.getElementById('panel-gamepass-extra'),
        ads: document.getElementById('panel-ads'),
        time: document.getElementById('panel-time')
    };

    extraTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            extraTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const target = this.dataset.tab;
            Object.keys(extraPanels).forEach(key => {
                if (extraPanels[key]) {
                    extraPanels[key].classList.toggle('active', key === target);
                }
            });
        });
    });

    // ============================================================
    // ===== ЛОГИКА КАЛЬКУЛЯТОРОВ =====
    // ============================================================

    // ---- 1. PREMIUM ----
    const premiumBtn = document.getElementById('calcPremiumBtn');
    if (premiumBtn) {
        premiumBtn.addEventListener('click', function() {
            const visits = parseFloat(document.getElementById('premiumVisits')?.value) || 0;
            const time = parseFloat(document.getElementById('premiumTime')?.value) || 0;

            const robux = visits * 0.05 * time * 0.001;
            const usd = (robux * 0.0035) - 5;

            const robuxEl = document.getElementById('premiumRobux');
            const usdEl = document.getElementById('premiumUsd');
            const resultEl = document.getElementById('premiumResult');

            if (robuxEl) robuxEl.textContent = Math.round(robux).toLocaleString();
            if (usdEl) usdEl.textContent = '$' + Math.max(0, usd).toFixed(2);
            if (resultEl) resultEl.classList.add('show');
            
            window._lastResult = { robux, usd, type: 'premium' };
        });
    }

    // ---- 2. GAME PASS ----
    const gamepassBtn = document.getElementById('calcGamepassBtn');
    if (gamepassBtn) {
        gamepassBtn.addEventListener('click', function() {
            const ratings = parseFloat(document.getElementById('gamepassRatings')?.value) || 0;
            const price = parseFloat(document.getElementById('gamepassPrice')?.value) || 0;

            const robux = ratings * 50 * price * 0.7;
            const usd = (robux * 0.0035) - 5;

            const robuxEl = document.getElementById('gamepassRobux');
            const usdEl = document.getElementById('gamepassUsd');
            const resultEl = document.getElementById('gamepassResult');

            if (robuxEl) robuxEl.textContent = Math.round(robux).toLocaleString();
            if (usdEl) usdEl.textContent = '$' + Math.max(0, usd).toFixed(2);
            if (resultEl) resultEl.classList.add('show');
            
            window._lastResult = { robux, usd, type: 'gamepass' };
        });
    }

    // ---- 3. СКОЛЬКО ИГРОКОВ ----
    const playersBtn = document.getElementById('calcPlayersBtn');
    if (playersBtn) {
        playersBtn.addEventListener('click', function() {
            const target = parseFloat(document.getElementById('playersTarget')?.value) || 0;
            const time = parseFloat(document.getElementById('playersTime')?.value) || 1;

            const needed = target / (0.05 * time * 0.001);
            const perDay = needed / 30;
            const perHour = perDay / 24;

            const neededEl = document.getElementById('playersNeeded');
            const dayEl = document.getElementById('playersDay');
            const hourEl = document.getElementById('playersHour');
            const resultEl = document.getElementById('playersResult');

            if (neededEl) neededEl.textContent = Math.round(needed).toLocaleString();
            if (dayEl) dayEl.textContent = Math.round(perDay).toLocaleString();
            if (hourEl) hourEl.textContent = Math.round(perHour).toLocaleString();
            if (resultEl) resultEl.classList.add('show');
            
            window._lastResult = { needed, perDay, perHour, type: 'players' };
        });
    }

    // ---- 4. ОКУПАЕМОСТЬ ----
    const paybackBtn = document.getElementById('calcPaybackBtn');
    if (paybackBtn) {
        paybackBtn.addEventListener('click', function() {
            const cost = parseFloat(document.getElementById('paybackCost')?.value) || 0;
            const income = parseFloat(document.getElementById('paybackIncome')?.value) || 1;

            const months = cost / income;
            const days = months * 30;

            const monthsEl = document.getElementById('paybackMonths');
            const daysEl = document.getElementById('paybackDays');
            const resultEl = document.getElementById('paybackResult');

            if (monthsEl) monthsEl.textContent = months.toFixed(1);
            if (daysEl) daysEl.textContent = Math.round(days);
            if (resultEl) resultEl.classList.add('show');
        });
    }

    // ---- 5. GAME PASS'Ы (дополнительный) ----
    const gpBtn = document.getElementById('calcGpBtn');
    if (gpBtn) {
        gpBtn.addEventListener('click', function() {
            const target = parseFloat(document.getElementById('gpTarget')?.value) || 0;
            const price = parseFloat(document.getElementById('gpPrice')?.value) || 1;
            const ratings = parseFloat(document.getElementById('gpRatings')?.value) || 1;

            const perPass = ratings * 50 * price * 0.7;
            const count = target / perPass;

            const countEl = document.getElementById('gpCount');
            const perPassEl = document.getElementById('gpPerPass');
            const resultEl = document.getElementById('gpResult');

            if (countEl) countEl.textContent = Math.ceil(count).toLocaleString();
            if (perPassEl) perPassEl.textContent = '$' + ((perPass * 0.0035) - 5).toFixed(2);
            if (resultEl) resultEl.classList.add('show');
        });
    }

    // ---- 6. РЕКЛАМА ----
    const adsBtn = document.getElementById('calcAdsBtn');
    if (adsBtn) {
        adsBtn.addEventListener('click', function() {
            const budget = parseFloat(document.getElementById('adsBudget')?.value) || 0;
            const cpv = parseFloat(document.getElementById('adsCpv')?.value) || 0.01;

            const visits = budget / cpv;
            const costPerVisit = (budget * 0.0035) / visits;

            const visitsEl = document.getElementById('adsVisits');
            const costEl = document.getElementById('adsCostPerVisit');
            const resultEl = document.getElementById('adsResult');

            if (visitsEl) visitsEl.textContent = Math.round(visits).toLocaleString();
            if (costEl) costEl.textContent = '$' + (costPerVisit || 0).toFixed(4);
            if (resultEl) resultEl.classList.add('show');
        });
    }

    // ---- 7. КОНВЕРТЕР ВРЕМЕНИ ----
    const timeBtn = document.getElementById('calcTimeBtn');
    if (timeBtn) {
        timeBtn.addEventListener('click', function() {
            const minutes = parseFloat(document.getElementById('timeMinutes')?.value) || 0;

            const hours = minutes / 60;
            const days = hours / 24;
            const months = days / 30;

            const hoursEl = document.getElementById('timeHours');
            const daysEl = document.getElementById('timeDays');
            const monthsEl = document.getElementById('timeMonths');
            const resultEl = document.getElementById('timeResult');

            if (hoursEl) hoursEl.textContent = hours.toFixed(1);
            if (daysEl) daysEl.textContent = days.toFixed(1);
            if (monthsEl) monthsEl.textContent = months.toFixed(1);
            if (resultEl) resultEl.classList.add('show');
        });
    }

    // ============================================================
    // ===== ПОДЕЛИТЬСЯ (СОЦСЕТИ) =====
    // ============================================================
    window.shareResult = function() {
        const url = encodeURIComponent(window.location.href);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: #182444; border: 1px solid #253460;
            border-radius: 20px; padding: 30px 35px;
            max-width: 440px; width: 92%; text-align: center;
            box-shadow: 0 24px 60px rgba(0,0,0,0.7);
            animation: scaleIn 0.3s ease;
        `;
        
        popup.innerHTML = `
            <div style="font-size: 2.5rem; margin-bottom: 10px;">📤</div>
            <h3 style="color: #f2f4fa; font-size: 1.3rem; margin-bottom: 6px;">Поделиться результатом</h3>
            <p style="color: #a6b0cc; font-size: 0.9rem; margin-bottom: 20px;">Выберите соцсеть для публикации</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                <button onclick="shareTo('telegram')" style="
                    padding: 16px 10px; border-radius: 14px;
                    border: 1px solid #253460; background: #131c33;
                    color: #f2f4fa; cursor: pointer; font-family: 'Montserrat', sans-serif;
                    font-weight: 600; font-size: 0.8rem;
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                    transition: all 0.25s;
                " onmouseover="this.style.borderColor='#0088cc'" onmouseout="this.style.borderColor='#253460'">
                    <i class="fab fa-telegram" style="font-size: 1.8rem; color: #0088cc;"></i>
                    Telegram
                </button>
                
                <button onclick="shareTo('vk')" style="
                    padding: 16px 10px; border-radius: 14px;
                    border: 1px solid #253460; background: #131c33;
                    color: #f2f4fa; cursor: pointer; font-family: 'Montserrat', sans-serif;
                    font-weight: 600; font-size: 0.8rem;
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                    transition: all 0.25s;
                " onmouseover="this.style.borderColor='#0077ff'" onmouseout="this.style.borderColor='#253460'">
                    <i class="fab fa-vk" style="font-size: 1.8rem; color: #0077ff;"></i>
                    ВКонтакте
                </button>
                
                <button onclick="shareTo('whatsapp')" style="
                    padding: 16px 10px; border-radius: 14px;
                    border: 1px solid #253460; background: #131c33;
                    color: #f2f4fa; cursor: pointer; font-family: 'Montserrat', sans-serif;
                    font-weight: 600; font-size: 0.8rem;
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                    transition: all 0.25s;
                " onmouseover="this.style.borderColor='#25D366'" onmouseout="this.style.borderColor='#253460'">
                    <i class="fab fa-whatsapp" style="font-size: 1.8rem; color: #25D366;"></i>
                    WhatsApp
                </button>
                
                <button onclick="shareTo('twitter')" style="
                    padding: 16px 10px; border-radius: 14px;
                    border: 1px solid #253460; background: #131c33;
                    color: #f2f4fa; cursor: pointer; font-family: 'Montserrat', sans-serif;
                    font-weight: 600; font-size: 0.8rem;
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                    transition: all 0.25s;
                " onmouseover="this.style.borderColor='#fff'" onmouseout="this.style.borderColor='#253460'">
                    <i class="fab fa-x-twitter" style="font-size: 1.8rem; color: #fff;"></i>
                    X (Twitter)
                </button>
                
                <button onclick="shareTo('copy')" style="
                    padding: 16px 10px; border-radius: 14px;
                    border: 1px solid #253460; background: #131c33;
                    color: #f2f4fa; cursor: pointer; font-family: 'Montserrat', sans-serif;
                    font-weight: 600; font-size: 0.8rem;
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                    transition: all 0.25s;
                " onmouseover="this.style.borderColor='#FFD700'" onmouseout="this.style.borderColor='#253460'">
                    <i class="fas fa-link" style="font-size: 1.8rem; color: #FFD700;"></i>
                    Копировать
                </button>
                
                <button onclick="shareTo('native')" style="
                    padding: 16px 10px; border-radius: 14px;
                    border: 1px solid #253460; background: #131c33;
                    color: #f2f4fa; cursor: pointer; font-family: 'Montserrat', sans-serif;
                    font-weight: 600; font-size: 0.8rem;
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                    transition: all 0.25s;
                " onmouseover="this.style.borderColor='#FFD700'" onmouseout="this.style.borderColor='#253460'">
                    <i class="fas fa-share-alt" style="font-size: 1.8rem; color: #FFD700;"></i>
                    Системный
                </button>
            </div>
            
            <button onclick="closeSharePopup()" style="
                padding: 10px 24px; border-radius: 50px;
                border: 1px solid #253460; background: transparent;
                color: #a6b0cc; cursor: pointer; font-family: 'Montserrat', sans-serif;
                font-weight: 600; font-size: 0.85rem; transition: all 0.25s;
            " onmouseover="this.style.borderColor='#FFD700'; this.style.color='#FFD700'" onmouseout="this.style.borderColor='#253460'; this.style.color='#a6b0cc'">
                Закрыть
            </button>
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        if (!document.getElementById('shareStyles')) {
            const style = document.createElement('style');
            style.id = 'shareStyles';
            style.textContent = `
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `;
            document.head.appendChild(style);
        }
        
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeSharePopup();
        });
    };

    window.closeSharePopup = function() {
        const overlay = document.querySelector('div[style*="backdrop-filter: blur(8px)"]');
        if (overlay) overlay.remove();
    };

    window.shareTo = function(platform) {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('💰 Посчитай свой доход в Roblox с калькулятором Метро New!');
        
        const shareUrls = {
            telegram: `https://t.me/share/url?url=${url}&text=${text}`,
            vk: `https://vk.com/share.php?url=${url}&title=${text}`,
            whatsapp: `https://wa.me/?text=${text}%20${url}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        };
        
        if (platform === 'copy') {
            navigator.clipboard.writeText(decodeURIComponent(url)).then(() => {
                showToast('✅ Ссылка скопирована!');
                closeSharePopup();
            }).catch(() => {
                prompt('Скопируйте ссылку:', decodeURIComponent(url));
                closeSharePopup();
            });
            return;
        }
        
        if (platform === 'native') {
            if (navigator.share) {
                navigator.share({
                    title: 'Калькулятор дохода разработчика Roblox',
                    text: 'Посчитай свой доход в Roblox!',
                    url: decodeURIComponent(url)
                }).catch(() => {});
            } else {
                showToast('⚠️ Системный шаринг не поддерживается');
            }
            closeSharePopup();
            return;
        }
        
        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=500');
            closeSharePopup();
        }
    };

    // ===== TOAST-УВЕДОМЛЕНИЯ =====
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: #182444; border: 1px solid #FFD700;
            color: #f2f4fa; padding: 14px 28px; border-radius: 14px;
            font-weight: 600; font-family: 'Montserrat', sans-serif;
            font-size: 0.95rem; box-shadow: 0 16px 40px rgba(0,0,0,0.6);
            z-index: 10000; animation: toastIn 0.4s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
        
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                }
                @keyframes toastOut {
                    from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                    to { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.95); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ============================================================
    // ===== ЭКСПОРТ В PDF =====
    // ============================================================
    window.exportPDF = function() {
        const resultEl = document.querySelector('.result.show, .result-players.show');
        if (!resultEl) {
            showToast('⚠️ Сначала выполните расчёт!');
            return;
        }

        const btn = document.querySelector('.btn-action[onclick*="exportPDF"]');
        const originalText = btn ? btn.innerHTML : '';
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание PDF...';
            btn.disabled = true;
        }

        const clone = resultEl.cloneNode(true);
        clone.querySelectorAll('.action-buttons').forEach(el => el.remove());
        
        const element = document.createElement('div');
        element.style.cssText = `
            padding: 40px; background: #ffffff; color: #1a1a1a;
            font-family: 'Segoe UI', Arial, sans-serif;
            max-width: 800px; margin: 0 auto;
        `;
        
        element.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; border-bottom: 3px solid #0066CC; padding-bottom: 16px;">
                <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #0066CC, #0052a3); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #FFD700; font-weight: 800; font-size: 24px;">M</div>
                <div>
                    <h1 style="font-size: 22px; margin: 0; color: #0066CC;">📊 Отчёт по доходу</h1>
                    <p style="margin: 0; color: #666; font-size: 14px;">Метро New — Калькулятор разработчика Roblox</p>
                </div>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 1px solid #e8e8e8;">
                ${clone.outerHTML}
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
                <div>
                    <p style="margin: 0; color: #999; font-size: 12px;">
                        <strong>📅 Дата:</strong> ${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p style="margin: 0; color: #999; font-size: 12px;">
                        <strong>⏰ Время:</strong> ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; color: #999; font-size: 12px;">
                        <strong>🔗 Источник:</strong>
                        <a href="https://kirill12633.github.io/Metro.New.Official/ru/tools/roblox-calculator/" style="color: #0066CC; text-decoration: none;">
                            Метро New
                        </a>
                    </p>
                    <p style="margin: 0; color: #999; font-size: 12px;">
                        <strong>📌 Версия:</strong> 1.0
                    </p>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding-top: 16px; border-top: 2px solid #0066CC; text-align: center;">
                <p style="margin: 0; color: #999; font-size: 11px;">
                    © ${new Date().getFullYear()} Метро New. Все права защищены.
                </p>
            </div>
        `;
        
        if (typeof html2pdf !== 'undefined') {
            html2pdf()
                .set({
                    margin: 10,
                    filename: `отчет-доход-${new Date().toISOString().slice(0,10)}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                })
                .from(element)
                .save()
                .then(() => {
                    if (btn) {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                    showToast('✅ PDF успешно создан!');
                })
                .catch(() => {
                    if (btn) {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                    showToast('❌ Ошибка создания PDF');
                });
        } else {
            showToast('❌ Библиотека PDF не загружена');
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    };

    // ============================================================
    // ===== КОПИРОВАНИЕ EMBED-КОДА =====
    // ============================================================
    const copyBtn = document.getElementById('copyEmbedBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            const codeEl = document.getElementById('embedCode');
            if (!codeEl) return;
            
            const code = codeEl.textContent;
            navigator.clipboard.writeText(code).then(() => {
                const btn = this;
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            }).catch(() => {
                alert('❌ Не удалось скопировать. Выделите код вручную.');
            });
        });
    }

    // ===== ТЕКУЩИЙ ГОД =====
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

});
