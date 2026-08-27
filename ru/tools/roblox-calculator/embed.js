/**
 * Metro New — Roblox Developer Earnings Calculator (Embed)
 * Встраиваемый калькулятор дохода разработчика Roblox
 * Поддерживает 10 языков: Русский, English, Español, Français, Deutsch, 中文, 日本語, 한국어, العربية, हिन्दी
 * 
 * Как использовать:
 * 1. Добавьте на страницу: <div id="roblox-calculator"></div>
 * 2. Подключите этот скрипт: <script src="embed.js"></script>
 * 
 * @version 2.0.0
 * @author Metro New Team
 */

(function() {
    'use strict';

    // ============================================================
    // ===== ПЕРЕВОДЫ НА 10 ЯЗЫКОВ =====
    // ============================================================
    const LANGUAGES = {
        ru: {
            name: 'Русский',
            flag: '🇷🇺',
            title: '💰 Калькулятор дохода разработчика Roblox',
            subtitle: 'от проекта Метро New',
            notice: '⚠️ Внимание: Расчёты приблизительные. Реальный доход может отличаться.',
            tabs: {
                premium: 'Premium',
                gamepass: 'Game Pass',
                players: 'Игроки'
            },
            premium: {
                title: '📊 Результат (Premium выплаты)',
                visits: 'Визитов (X)',
                visitsHint: 'за месяц',
                time: 'Среднее время (Y)',
                timeHint: 'в минутах',
                btn: 'Рассчитать',
                robux: 'Доход в Robux',
                usd: 'Доход в USD',
                subMonth: 'за месяц',
                subWithdraw: 'после вывода',
                formula: 'Формула: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 Результат (Game Pass)',
                ratings: 'Оценок (X)',
                ratingsHint: 'под пассом',
                price: 'Цена пасса (Y)',
                priceHint: 'в Robux',
                btn: 'Рассчитать',
                robux: 'Доход в Robux',
                usd: 'Доход в USD',
                subTotal: 'за всё время',
                subWithdraw: 'после вывода',
                formula: 'Формула: X × 50 × Y × 0.7'
            },
            players: {
                title: '👥 Нужно игроков:',
                target: 'Желаемый доход',
                targetHint: 'в Robux за месяц',
                time: 'Среднее время',
                timeHint: 'в минутах',
                btn: 'Рассчитать',
                visitsPerMonth: 'визитов в месяц',
                perDay: 'в день',
                perHour: 'в час',
                formula: 'X = доход / (0.05 × время × 0.001)'
            },
            footer: {
                link: 'Метро New Калькулятор',
                privacy: 'Конфиденциальность'
            },
            badge: 'v2.0'
        },
        en: {
            name: 'English',
            flag: '🇬🇧',
            title: '💰 Roblox Developer Earnings Calculator',
            subtitle: 'from Metro New project',
            notice: '⚠️ Note: Calculations are approximate. Actual income may vary.',
            tabs: {
                premium: 'Premium',
                gamepass: 'Game Pass',
                players: 'Players'
            },
            premium: {
                title: '📊 Result (Premium Payouts)',
                visits: 'Visits (X)',
                visitsHint: 'per month',
                time: 'Average time (Y)',
                timeHint: 'in minutes',
                btn: 'Calculate',
                robux: 'Income in Robux',
                usd: 'Income in USD',
                subMonth: 'per month',
                subWithdraw: 'after withdrawal',
                formula: 'Formula: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 Result (Game Pass)',
                ratings: 'Ratings (X)',
                ratingsHint: 'per pass',
                price: 'Pass price (Y)',
                priceHint: 'in Robux',
                btn: 'Calculate',
                robux: 'Income in Robux',
                usd: 'Income in USD',
                subTotal: 'total',
                subWithdraw: 'after withdrawal',
                formula: 'Formula: X × 50 × Y × 0.7'
            },
            players: {
                title: '👥 Players needed:',
                target: 'Target income',
                targetHint: 'in Robux per month',
                time: 'Average time',
                timeHint: 'in minutes',
                btn: 'Calculate',
                visitsPerMonth: 'visits per month',
                perDay: 'per day',
                perHour: 'per hour',
                formula: 'X = income / (0.05 × time × 0.001)'
            },
            footer: {
                link: 'Metro New Calculator',
                privacy: 'Privacy Policy'
            },
            badge: 'v2.0'
        },
        es: {
            name: 'Español',
            flag: '🇪🇸',
            title: '💰 Calculadora de Ingresos para Desarrolladores de Roblox',
            subtitle: 'del proyecto Metro New',
            notice: '⚠️ Nota: Los cálculos son aproximados. Los ingresos reales pueden variar.',
            tabs: {
                premium: 'Premium',
                gamepass: 'Game Pass',
                players: 'Jugadores'
            },
            premium: {
                title: '📊 Resultado (Pagos Premium)',
                visits: 'Visitas (X)',
                visitsHint: 'por mes',
                time: 'Tiempo promedio (Y)',
                timeHint: 'en minutos',
                btn: 'Calcular',
                robux: 'Ingresos en Robux',
                usd: 'Ingresos en USD',
                subMonth: 'por mes',
                subWithdraw: 'después del retiro',
                formula: 'Fórmula: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 Resultado (Game Pass)',
                ratings: 'Calificaciones (X)',
                ratingsHint: 'por pase',
                price: 'Precio del pase (Y)',
                priceHint: 'en Robux',
                btn: 'Calcular',
                robux: 'Ingresos en Robux',
                usd: 'Ingresos en USD',
                subTotal: 'total',
                subWithdraw: 'después del retiro',
                formula: 'Fórmula: X × 50 × Y × 0.7'
            },
            players: {
                title: '👥 Jugadores necesarios:',
                target: 'Ingreso deseado',
                targetHint: 'en Robux por mes',
                time: 'Tiempo promedio',
                timeHint: 'en minutos',
                btn: 'Calcular',
                visitsPerMonth: 'visitas por mes',
                perDay: 'por día',
                perHour: 'por hora',
                formula: 'X = ingreso / (0.05 × tiempo × 0.001)'
            },
            footer: {
                link: 'Metro New Calculadora',
                privacy: 'Política de Privacidad'
            },
            badge: 'v2.0'
        },
        fr: {
            name: 'Français',
            flag: '🇫🇷',
            title: '💰 Calculateur de Revenus pour Développeurs Roblox',
            subtitle: 'du projet Metro New',
            notice: '⚠️ Remarque: Les calculs sont approximatifs. Les revenus réels peuvent varier.',
            tabs: {
                premium: 'Premium',
                gamepass: 'Game Pass',
                players: 'Joueurs'
            },
            premium: {
                title: '📊 Résultat (Paiements Premium)',
                visits: 'Visites (X)',
                visitsHint: 'par mois',
                time: 'Temps moyen (Y)',
                timeHint: 'en minutes',
                btn: 'Calculer',
                robux: 'Revenus en Robux',
                usd: 'Revenus en USD',
                subMonth: 'par mois',
                subWithdraw: 'après retrait',
                formula: 'Formule: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 Résultat (Game Pass)',
                ratings: 'Évaluations (X)',
                ratingsHint: 'par pass',
                price: 'Prix du pass (Y)',
                priceHint: 'en Robux',
                btn: 'Calculer',
                robux: 'Revenus en Robux',
                usd: 'Revenus en USD',
                subTotal: 'total',
                subWithdraw: 'après retrait',
                formula: 'Formule: X × 50 × Y × 0.7'
            },
            players: {
                title: '👥 Joueurs nécessaires:',
                target: 'Revenu souhaité',
                targetHint: 'en Robux par mois',
                time: 'Temps moyen',
                timeHint: 'en minutes',
                btn: 'Calculer',
                visitsPerMonth: 'visites par mois',
                perDay: 'par jour',
                perHour: 'par heure',
                formula: 'X = revenu / (0.05 × temps × 0.001)'
            },
            footer: {
                link: 'Metro New Calculateur',
                privacy: 'Politique de Confidentialité'
            },
            badge: 'v2.0'
        },
        de: {
            name: 'Deutsch',
            flag: '🇩🇪',
            title: '💰 Roblox-Entwickler-Einkommensrechner',
            subtitle: 'vom Metro New Projekt',
            notice: '⚠️ Hinweis: Die Berechnungen sind Näherungswerte. Die tatsächlichen Einnahmen können abweichen.',
            tabs: {
                premium: 'Premium',
                gamepass: 'Game Pass',
                players: 'Spieler'
            },
            premium: {
                title: '📊 Ergebnis (Premium-Auszahlungen)',
                visits: 'Besuche (X)',
                visitsHint: 'pro Monat',
                time: 'Durchschnittszeit (Y)',
                timeHint: 'in Minuten',
                btn: 'Berechnen',
                robux: 'Einkommen in Robux',
                usd: 'Einkommen in USD',
                subMonth: 'pro Monat',
                subWithdraw: 'nach Auszahlung',
                formula: 'Formel: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 Ergebnis (Game Pass)',
                ratings: 'Bewertungen (X)',
                ratingsHint: 'pro Pass',
                price: 'Pass-Preis (Y)',
                priceHint: 'in Robux',
                btn: 'Berechnen',
                robux: 'Einkommen in Robux',
                usd: 'Einkommen in USD',
                subTotal: 'insgesamt',
                subWithdraw: 'nach Auszahlung',
                formula: 'Formel: X × 50 × Y × 0.7'
            },
            players: {
                title: '👥 Benötigte Spieler:',
                target: 'Ziel-Einkommen',
                targetHint: 'in Robux pro Monat',
                time: 'Durchschnittszeit',
                timeHint: 'in Minuten',
                btn: 'Berechnen',
                visitsPerMonth: 'Besuche pro Monat',
                perDay: 'pro Tag',
                perHour: 'pro Stunde',
                formula: 'X = Einkommen / (0.05 × Zeit × 0.001)'
            },
            footer: {
                link: 'Metro New Rechner',
                privacy: 'Datenschutz'
            },
            badge: 'v2.0'
        },
        zh: {
            name: '中文',
            flag: '🇨🇳',
            title: '💰 Roblox开发者收入计算器',
            subtitle: '来自 Metro New 项目',
            notice: '⚠️ 注意: 计算结果为近似值。实际收入可能有所不同。',
            tabs: {
                premium: 'Premium',
                gamepass: 'Game Pass',
                players: '玩家'
            },
            premium: {
                title: '📊 结果 (Premium 支付)',
                visits: '访问量 (X)',
                visitsHint: '每月',
                time: '平均时间 (Y)',
                timeHint: '分钟',
                btn: '计算',
                robux: 'Robux 收入',
                usd: '美元收入',
                subMonth: '每月',
                subWithdraw: '提现后',
                formula: '公式: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 结果 (Game Pass)',
                ratings: '评分 (X)',
                ratingsHint: '每通行证',
                price: '通行证价格 (Y)',
                priceHint: 'Robux',
                btn: '计算',
                robux: 'Robux 收入',
                usd: '美元收入',
                subTotal: '总计',
                subWithdraw: '提现后',
                formula: '公式: X × 50 × Y × 0.7'
            },
            players: {
                title: '👥 所需玩家:',
                target: '目标收入',
                targetHint: '每月 Robux',
                time: '平均时间',
                timeHint: '分钟',
                btn: '计算',
                visitsPerMonth: '每月访问量',
                perDay: '每天',
                perHour: '每小时',
                formula: 'X = 收入 / (0.05 × 时间 × 0.001)'
            },
            footer: {
                link: 'Metro New 计算器',
                privacy: '隐私政策'
            },
            badge: 'v2.0'
        },
        ja: {
            name: '日本語',
            flag: '🇯🇵',
            title: '💰 Roblox開発者収入計算機',
            subtitle: 'Metro New プロジェクトより',
            notice: '⚠️ 注意: 計算は概算です。実際の収入は異なる場合があります。',
            tabs: {
                premium: 'Premium',
                gamepass: 'Game Pass',
                players: 'プレイヤー'
            },
            premium: {
                title: '📊 結果 (Premium 支払い)',
                visits: '訪問数 (X)',
                visitsHint: '月間',
                time: '平均時間 (Y)',
                timeHint: '分',
                btn: '計算',
                robux: 'Robux 収入',
                usd: 'USD 収入',
                subMonth: '月間',
                subWithdraw: '引き出し後',
                formula: '計算式: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 結果 (Game Pass)',
                ratings: '評価 (X)',
                ratingsHint: 'パスごと',
                price: 'パス価格 (Y)',
                priceHint: 'Robux',
                btn: '計算',
                robux: 'Robux 収入',
                usd: 'USD 収入',
                subTotal: '合計',
                subWithdraw: '引き出し後',
                formula: '計算式: X × 50 × Y × 0.7'
            },
            players: {
                title: '👥 必要なプレイヤー:',
                target: '目標収入',
                targetHint: '月間 Robux',
                time: '平均時間',
                timeHint: '分',
                btn: '計算',
                visitsPerMonth: '月間訪問数',
                perDay: '1日あたり',
                perHour: '1時間あたり',
                formula: 'X = 収入 / (0.05 × 時間 × 0.001)'
            },
            footer: {
                link: 'Metro New 計算機',
                privacy: 'プライバシーポリシー'
            },
            badge: 'v2.0'
        },
        ko: {
            name: '한국어',
            flag: '🇰🇷',
            title: '💰 Roblox 개발자 수익 계산기',
            subtitle: 'Metro New 프로젝트 제공',
            notice: '⚠️ 참고: 계산은 근사치입니다. 실제 수익은 다를 수 있습니다.',
            tabs: {
                premium: 'Premium',
                gamepass: 'Game Pass',
                players: '플레이어'
            },
            premium: {
                title: '📊 결과 (Premium 지급)',
                visits: '방문 수 (X)',
                visitsHint: '월간',
                time: '평균 시간 (Y)',
                timeHint: '분',
                btn: '계산',
                robux: 'Robux 수익',
                usd: 'USD 수익',
                subMonth: '월간',
                subWithdraw: '출금 후',
                formula: '공식: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 결과 (Game Pass)',
                ratings: '평가 (X)',
                ratingsHint: '패스당',
                price: '패스 가격 (Y)',
                priceHint: 'Robux',
                btn: '계산',
                robux: 'Robux 수익',
                usd: 'USD 수익',
                subTotal: '총계',
                subWithdraw: '출금 후',
                formula: '공식: X × 50 × Y × 0.7'
            },
            players: {
                title: '👥 필요한 플레이어:',
                target: '목표 수익',
                targetHint: '월간 Robux',
                time: '평균 시간',
                timeHint: '분',
                btn: '계산',
                visitsPerMonth: '월간 방문 수',
                perDay: '하루당',
                perHour: '시간당',
                formula: 'X = 수익 / (0.05 × 시간 × 0.001)'
            },
            footer: {
                link: 'Metro New 계산기',
                privacy: '개인정보 처리방침'
            },
            badge: 'v2.0'
        },
        ar: {
            name: 'العربية',
            flag: '🇸🇦',
            title: '💰 حاسبة أرباح مطوري Roblox',
            subtitle: 'من مشروع Metro New',
            notice: '⚠️ ملاحظة: الحسابات تقريبية. قد يختلف الدخل الفعلي.',
            tabs: {
                premium: 'Premium',
                gamepass: 'Game Pass',
                players: 'اللاعبين'
            },
            premium: {
                title: '📊 النتيجة (مدفوعات Premium)',
                visits: 'الزيارات (X)',
                visitsHint: 'شهرياً',
                time: 'الوقت المتوسط (Y)',
                timeHint: 'بالدقائق',
                btn: 'احسب',
                robux: 'الدخل بـ Robux',
                usd: 'الدخل بـ USD',
                subMonth: 'شهرياً',
                subWithdraw: 'بعد السحب',
                formula: 'الصيغة: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 النتيجة (Game Pass)',
                ratings: 'التقييمات (X)',
                ratingsHint: 'لكل باس',
                price: 'سعر الباس (Y)',
                priceHint: 'بـ Robux',
                btn: 'احسب',
                robux: 'الدخل بـ Robux',
                usd: 'الدخل بـ USD',
                subTotal: 'الإجمالي',
                subWithdraw: 'بعد السحب',
                formula: 'الصيغة: X × 50 × Y × 0.7'
            },
            players: {
                title: '👥 اللاعبين المطلوبين:',
                target: 'الدخل المطلوب',
                targetHint: 'بـ Robux شهرياً',
                time: 'الوقت المتوسط',
                timeHint: 'بالدقائق',
                btn: 'احسب',
                visitsPerMonth: 'زيارة شهرياً',
                perDay: 'يومياً',
                perHour: 'ساعياً',
                formula: 'X = الدخل / (0.05 × الوقت × 0.001)'
            },
            footer: {
                link: 'حاسبة Metro New',
                privacy: 'سياسة الخصوصية'
            },
            badge: 'v2.0'
        },
        hi: {
            name: 'हिन्दी',
            flag: '🇮🇳',
            title: '💰 Roblox डेवलपर आय कैलकुलेटर',
            subtitle: 'Metro New प्रोजेक्ट से',
            notice: '⚠️ नोट: गणनाएँ अनुमानित हैं। वास्तविक आय भिन्न हो सकती है।',
            tabs: {
                premium: 'Premium',
                gamepass: 'Game Pass',
                players: 'खिलाड़ी'
            },
            premium: {
                title: '📊 परिणाम (Premium भुगतान)',
                visits: 'विज़िट (X)',
                visitsHint: 'प्रति माह',
                time: 'औसत समय (Y)',
                timeHint: 'मिनटों में',
                btn: 'गणना करें',
                robux: 'Robux में आय',
                usd: 'USD में आय',
                subMonth: 'प्रति माह',
                subWithdraw: 'निकासी के बाद',
                formula: 'सूत्र: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 परिणाम (Game Pass)',
                ratings: 'रेटिंग (X)',
                ratingsHint: 'प्रति पास',
                price: 'पास की कीमत (Y)',
                priceHint: 'Robux में',
                btn: 'गणना करें',
                robux: 'Robux में आय',
                usd: 'USD में आय',
                subTotal: 'कुल',
                subWithdraw: 'निकासी के बाद',
                formula: 'सूत्र: X × 50 × Y × 0.7'
            },
            players: {
                title: '👥 खिलाड़ियों की आवश्यकता:',
                target: 'लक्षित आय',
                targetHint: 'Robux में प्रति माह',
                time: 'औसत समय',
                timeHint: 'मिनटों में',
                btn: 'गणना करें',
                visitsPerMonth: 'प्रति माह विज़िट',
                perDay: 'प्रति दिन',
                perHour: 'प्रति घंटा',
                formula: 'X = आय / (0.05 × समय × 0.001)'
            },
            footer: {
                link: 'Metro New कैलकुलेटर',
                privacy: 'गोपनीयता नीति'
            },
            badge: 'v2.0'
        }
    };

    // ============================================================
    // ===== ДЕТЕКТИМ ЯЗЫК БРАУЗЕРА =====
    // ============================================================
    function detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        const langMap = {
            'ru': 'ru', 'uk': 'ru', 'be': 'ru',
            'en': 'en', 'en-US': 'en', 'en-GB': 'en',
            'es': 'es', 'es-ES': 'es',
            'fr': 'fr', 'fr-FR': 'fr',
            'de': 'de', 'de-DE': 'de',
            'zh': 'zh', 'zh-CN': 'zh', 'zh-TW': 'zh',
            'ja': 'ja', 'ja-JP': 'ja',
            'ko': 'ko', 'ko-KR': 'ko',
            'ar': 'ar', 'ar-SA': 'ar',
            'hi': 'hi', 'hi-IN': 'hi'
        };
        const lang = browserLang.slice(0, 2).toLowerCase();
        return langMap[lang] || 'en';
    }

    // ============================================================
    // ===== КОНФИГ =====
    // ============================================================
    const CONFIG = {
        containerId: 'roblox-calculator',
        version: '2.0.0',
        language: detectLanguage()
    };

    // ============================================================
    // ===== НОВЫЙ ДИЗАЙН (В СТИЛЕ МЕТРО NEW) =====
    // ============================================================
    const styles = `
        <style>
            .mn-calculator {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 750px;
                margin: 20px auto;
                padding: 30px;
                background: #0d1526;
                border-radius: 20px;
                box-shadow: 0 8px 40px rgba(0,0,0,0.6);
                border: 1px solid #253460;
                color: #f2f4fa;
            }

            .mn-calculator * {
                box-sizing: border-box;
            }

            /* ===== HEADER ===== */
            .mn-calculator .mn-header {
                display: flex;
                align-items: center;
                gap: 14px;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 2px solid #FFD700;
            }

            .mn-calculator .mn-header .mn-logo {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #FFD700, #e6c200);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #0d1526;
                font-weight: 800;
                font-size: 22px;
                flex-shrink: 0;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
            }

            .mn-calculator .mn-header .mn-title {
                flex: 1;
            }

            .mn-calculator .mn-header .mn-title h3 {
                margin: 0;
                color: #f2f4fa;
                font-size: 20px;
                font-weight: 700;
            }

            .mn-calculator .mn-header .mn-title p {
                margin: 2px 0 0 0;
                color: #a6b0cc;
                font-size: 13px;
            }

            .mn-calculator .mn-header .mn-lang-select {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 10px;
                background: #131c33;
                border: 1px solid #253460;
                color: #a6b0cc;
                font-size: 13px;
                cursor: pointer;
                font-family: inherit;
                transition: all 0.3s;
            }

            .mn-calculator .mn-header .mn-lang-select:hover {
                border-color: #FFD700;
                color: #f2f4fa;
            }

            .mn-calculator .mn-header .mn-lang-select option {
                background: #0d1526;
                color: #f2f4fa;
            }

            .mn-calculator .mn-badge {
                background: rgba(255, 215, 0, 0.15);
                color: #FFD700;
                padding: 4px 12px;
                border-radius: 50px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid rgba(255, 215, 0, 0.2);
                white-space: nowrap;
            }

            /* ===== УВЕДОМЛЕНИЕ ===== */
            .mn-calculator .mn-notice {
                background: rgba(255, 215, 0, 0.08);
                border-left: 4px solid #FFD700;
                border-radius: 10px;
                padding: 12px 16px;
                margin-bottom: 20px;
                font-size: 13px;
                color: #a6b0cc;
                display: flex;
                align-items: flex-start;
                gap: 10px;
                border: 1px solid rgba(255, 215, 0, 0.1);
            }

            .mn-calculator .mn-notice i {
                color: #FFD700;
                font-size: 18px;
                margin-top: 2px;
            }

            .mn-calculator .mn-notice strong {
                color: #FFD700;
            }

            /* ===== ВКЛАДКИ ===== */
            .mn-calculator .mn-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .mn-calculator .mn-tab {
                padding: 10px 22px;
                border-radius: 50px;
                border: 1px solid #253460;
                background: transparent;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.3s;
                color: #a6b0cc;
                font-family: inherit;
            }

            .mn-calculator .mn-tab:hover {
                border-color: #FFD700;
                color: #f2f4fa;
                background: rgba(255, 215, 0, 0.05);
            }

            .mn-calculator .mn-tab.active {
                background: rgba(255, 215, 0, 0.12);
                color: #FFD700;
                border-color: #FFD700;
                box-shadow: 0 0 25px rgba(255, 215, 0, 0.1);
            }

            .mn-calculator .mn-tab i {
                margin-right: 8px;
            }

            /* ===== ПАНЕЛИ ===== */
            .mn-calculator .mn-panel {
                display: none;
                animation: mnFadeIn 0.35s ease;
            }

            .mn-calculator .mn-panel.active {
                display: block;
            }

            @keyframes mnFadeIn {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* ===== ФОРМА ===== */
            .mn-calculator .mn-form {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            .mn-calculator .mn-form .mn-full {
                grid-column: 1 / -1;
            }

            .mn-calculator .mn-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .mn-calculator .mn-group label {
                font-weight: 600;
                font-size: 14px;
                color: #a6b0cc;
            }

            .mn-calculator .mn-group label .mn-hint {
                font-weight: 400;
                color: #4a5473;
                font-size: 12px;
            }

            .mn-calculator .mn-group input {
                padding: 12px 16px;
                border-radius: 12px;
                border: 1px solid #253460;
                background: #131c33;
                color: #f2f4fa;
                font-size: 15px;
                transition: all 0.3s;
                font-family: inherit;
            }

            .mn-calculator .mn-group input:focus {
                outline: none;
                border-color: #FFD700;
                box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
                background: #182444;
            }

            .mn-calculator .mn-group input::placeholder {
                color: #4a5473;
            }

            /* ===== КНОПКА ===== */
            .mn-calculator .mn-btn {
                padding: 14px 28px;
                border-radius: 12px;
                border: none;
                background: linear-gradient(135deg, #FFD700, #e6c200);
                color: #0d1526;
                font-weight: 700;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
                font-family: inherit;
                width: 100%;
                margin-top: 4px;
                box-shadow: 0 4px 25px rgba(255, 215, 0, 0.15);
            }

            .mn-calculator .mn-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 40px rgba(255, 215, 0, 0.25);
            }

            .mn-calculator .mn-btn:active {
                transform: translateY(0);
            }

            .mn-calculator .mn-btn i {
                margin-right: 10px;
            }

            /* ===== РЕЗУЛЬТАТ ===== */
            .mn-calculator .mn-result {
                margin-top: 22px;
                padding: 22px 24px;
                border-radius: 14px;
                background: rgba(255, 215, 0, 0.04);
                border: 1px solid rgba(255, 215, 0, 0.12);
                display: none;
            }

            .mn-calculator .mn-result.show {
                display: block;
                animation: mnFadeIn 0.4s ease;
            }

            .mn-calculator .mn-result .mn-result-title {
                font-size: 16px;
                font-weight: 700;
                color: #FFD700;
                margin-bottom: 12px;
            }

            .mn-calculator .mn-result .mn-values {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 14px;
            }

            .mn-calculator .mn-result .mn-item {
                background: #131c33;
                border-radius: 12px;
                padding: 14px 18px;
                text-align: center;
                border: 1px solid #253460;
            }

            .mn-calculator .mn-result .mn-item .mn-label {
                color: #4a5473;
                font-size: 12px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .mn-calculator .mn-result .mn-item .mn-value {
                font-size: 26px;
                font-weight: 800;
                color: #f2f4fa;
                margin-top: 2px;
            }

            .mn-calculator .mn-result .mn-item .mn-value.mn-robux {
                color: #FFD700;
            }

            .mn-calculator .mn-result .mn-item .mn-value.mn-usd {
                color: #34a853;
            }

            .mn-calculator .mn-result .mn-item .mn-sub {
                font-size: 11px;
                color: #4a5473;
            }

            .mn-calculator .mn-result .mn-formula {
                font-size: 13px;
                color: #4a5473;
                margin-top: 12px;
                text-align: center;
            }

            .mn-calculator .mn-result .mn-formula strong {
                color: #a6b0cc;
            }

            /* ===== ФУТЕР ===== */
            .mn-calculator .mn-footer {
                margin-top: 18px;
                padding-top: 16px;
                border-top: 1px solid #253460;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
                font-size: 12px;
                color: #4a5473;
            }

            .mn-calculator .mn-footer a {
                color: #a6b0cc;
                text-decoration: none;
                font-weight: 500;
                transition: color 0.3s;
            }

            .mn-calculator .mn-footer a:hover {
                color: #FFD700;
                text-decoration: none;
            }

            /* ===== АДАПТИВ ===== */
            @media (max-width: 600px) {
                .mn-calculator {
                    padding: 18px 16px;
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
                .mn-calculator .mn-header {
                    flex-wrap: wrap;
                }
                .mn-calculator .mn-header .mn-lang-select {
                    margin-left: auto;
                }
            }

            @media (max-width: 400px) {
                .mn-calculator .mn-result .mn-values {
                    grid-template-columns: 1fr;
                }
                .mn-calculator .mn-header .mn-title h3 {
                    font-size: 16px;
                }
            }
        </style>
    `;

    // ============================================================
    // ===== ШАБЛОН =====
    // ============================================================
    function getTemplate(lang) {
        const t = LANGUAGES[lang] || LANGUAGES.en;
        const langOptions = Object.keys(LANGUAGES).map(key => 
            `<option value="${key}" ${key === lang ? 'selected' : ''}>${LANGUAGES[key].flag} ${LANGUAGES[key].name}</option>`
        ).join('');

        return `
            <div class="mn-calculator" id="mnCalculator" data-lang="${lang}">
                ${styles}

                <div class="mn-header">
                    <div class="mn-logo">M</div>
                    <div class="mn-title">
                        <h3>${t.title}</h3>
                        <p>${t.subtitle}</p>
                    </div>
                    <select class="mn-lang-select" id="mnLangSelect">
                        ${langOptions}
                    </select>
                    <span class="mn-badge">${t.badge}</span>
                </div>

                <div class="mn-notice">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>${t.notice}</div>
                </div>

                <div class="mn-tabs">
                    <button class="mn-tab active" data-tab="premium">
                        <i class="fas fa-crown"></i> ${t.tabs.premium}
                    </button>
                    <button class="mn-tab" data-tab="gamepass">
                        <i class="fas fa-ticket"></i> ${t.tabs.gamepass}
                    </button>
                    <button class="mn-tab" data-tab="players">
                        <i class="fas fa-users"></i> ${t.tabs.players}
                    </button>
                </div>

                <!-- Premium -->
                <div class="mn-panel active" id="mnPremium">
                    <form class="mn-form" id="mnPremiumForm">
                        <div class="mn-group">
                            <label>${t.premium.visits} <span class="mn-hint">${t.premium.visitsHint}</span></label>
                            <input type="number" id="mnPremiumVisits" placeholder="100000" min="0" step="1" value="100000">
                        </div>
                        <div class="mn-group">
                            <label>${t.premium.time} <span class="mn-hint">${t.premium.timeHint}</span></label>
                            <input type="number" id="mnPremiumTime" placeholder="20" min="0" step="0.1" value="20">
                        </div>
                        <div class="mn-full">
                            <button type="submit" class="mn-btn">
                                <i class="fas fa-calculator"></i> ${t.premium.btn}
                            </button>
                        </div>
                    </form>

                    <div class="mn-result" id="mnPremiumResult">
                        <div class="mn-result-title">${t.premium.title}</div>
                        <div class="mn-values">
                            <div class="mn-item">
                                <div class="mn-label">${t.premium.robux}</div>
                                <div class="mn-value mn-robux" id="mnPremiumRobux">0</div>
                                <div class="mn-sub">${t.premium.subMonth}</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.premium.usd}</div>
                                <div class="mn-value mn-usd" id="mnPremiumUsd">$0</div>
                                <div class="mn-sub">${t.premium.subWithdraw}</div>
                            </div>
                        </div>
                        <div class="mn-formula">
                            <i class="fas fa-info-circle"></i> ${t.premium.formula}
                        </div>
                    </div>
                </div>

                <!-- Game Pass -->
                <div class="mn-panel" id="mnGamepass">
                    <form class="mn-form" id="mnGamepassForm">
                        <div class="mn-group">
                            <label>${t.gamepass.ratings} <span class="mn-hint">${t.gamepass.ratingsHint}</span></label>
                            <input type="number" id="mnGamepassRatings" placeholder="200" min="0" step="1" value="200">
                        </div>
                        <div class="mn-group">
                            <label>${t.gamepass.price} <span class="mn-hint">${t.gamepass.priceHint}</span></label>
                            <input type="number" id="mnGamepassPrice" placeholder="100" min="0" step="1" value="100">
                        </div>
                        <div class="mn-full">
                            <button type="submit" class="mn-btn">
                                <i class="fas fa-calculator"></i> ${t.gamepass.btn}
                            </button>
                        </div>
                    </form>

                    <div class="mn-result" id="mnGamepassResult">
                        <div class="mn-result-title">${t.gamepass.title}</div>
                        <div class="mn-values">
                            <div class="mn-item">
                                <div class="mn-label">${t.gamepass.robux}</div>
                                <div class="mn-value mn-robux" id="mnGamepassRobux">0</div>
                                <div class="mn-sub">${t.gamepass.subTotal}</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.gamepass.usd}</div>
                                <div class="mn-value mn-usd" id="mnGamepassUsd">$0</div>
                                <div class="mn-sub">${t.gamepass.subWithdraw}</div>
                            </div>
                        </div>
                        <div class="mn-formula">
                            <i class="fas fa-info-circle"></i> ${t.gamepass.formula}
                        </div>
                    </div>
                </div>

                <!-- Players -->
                <div class="mn-panel" id="mnPlayers">
                    <form class="mn-form" id="mnPlayersForm">
                        <div class="mn-group">
                            <label>${t.players.target} <span class="mn-hint">${t.players.targetHint}</span></label>
                            <input type="number" id="mnPlayersTarget" placeholder="10000" min="0" step="1" value="10000">
                        </div>
                        <div class="mn-group">
                            <label>${t.players.time} <span class="mn-hint">${t.players.timeHint}</span></label>
                            <input type="number" id="mnPlayersTime" placeholder="20" min="0" step="0.1" value="20">
                        </div>
                        <div class="mn-full">
                            <button type="submit" class="mn-btn">
                                <i class="fas fa-calculator"></i> ${t.players.btn}
                            </button>
                        </div>
                    </form>

                    <div class="mn-result" id="mnPlayersResult">
                        <div class="mn-result-title">${t.players.title}</div>
                        <div class="mn-values">
                            <div class="mn-item" style="grid-column: 1 / -1;">
                                <div class="mn-label">${t.players.visitsPerMonth}</div>
                                <div class="mn-value mn-robux" id="mnPlayersNeeded" style="font-size: 32px;">0</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.players.perDay}</div>
                                <div class="mn-value" id="mnPlayersDay" style="color: #34a853;">0</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.players.perHour}</div>
                                <div class="mn-value" id="mnPlayersHour" style="color: #FFD700;">0</div>
                            </div>
                        </div>
                        <div class="mn-formula">
                            <i class="fas fa-info-circle"></i> ${t.players.formula}
                        </div>
                    </div>
                </div>

                <div class="mn-footer">
                    <span>
                        <i class="fas fa-code"></i>
                        <a href="https://kirill12633.github.io/Metro.New.Official/ru/tools/roblox-calculator/" target="_blank">
                            ${t.footer.link}
                        </a>
                    </span>
                    <span>
                        <i class="fas fa-info-circle"></i>
                        <a href="https://kirill12633.github.io/Metro.New.Official/ru/help/privacy-policy/" target="_blank">
                            ${t.footer.privacy}
                        </a>
                    </span>
                </div>
            </div>
        `;
    }

    // ============================================================
    // ===== ОБНОВЛЕНИЕ ЯЗЫКА =====
    // ============================================================
    function updateLanguage(container, lang) {
        const t = LANGUAGES[lang] || LANGUAGES.en;
        container.dataset.lang = lang;

        // Обновляем выбранный язык в селекте
        const select = container.querySelector('#mnLangSelect');
        if (select) select.value = lang;

        // Обновляем badge
        const badge = container.querySelector('.mn-badge');
        if (badge) badge.textContent = t.badge;

        // Обновляем заголовки
        const title = container.querySelector('.mn-header .mn-title h3');
        const subtitle = container.querySelector('.mn-header .mn-title p');
        if (title) title.textContent = t.title;
        if (subtitle) subtitle.textContent = t.subtitle;

        // Обновляем уведомление
        const notice = container.querySelector('.mn-notice div');
        if (notice) notice.innerHTML = t.notice;

        // Обновляем вкладки
        const tabs = container.querySelectorAll('.mn-tab');
        if (tabs.length >= 3) {
            tabs[0].innerHTML = `<i class="fas fa-crown"></i> ${t.tabs.premium}`;
            tabs[1].innerHTML = `<i class="fas fa-ticket"></i> ${t.tabs.gamepass}`;
            tabs[2].innerHTML = `<i class="fas fa-users"></i> ${t.tabs.players}`;
        }

        // Обновляем Premium
        const premiumFields = container.querySelectorAll('#mnPremium .mn-group label');
        if (premiumFields.length >= 2) {
            premiumFields[0].innerHTML = `${t.premium.visits} <span class="mn-hint">${t.premium.visitsHint}</span>`;
            premiumFields[1].innerHTML = `${t.premium.time} <span class="mn-hint">${t.premium.timeHint}</span>`;
        }
        const premiumBtn = container.querySelector('#mnPremium .mn-btn');
        if (premiumBtn) premiumBtn.innerHTML = `<i class="fas fa-calculator"></i> ${t.premium.btn}`;
        const premiumTitle = container.querySelector('#mnPremiumResult .mn-result-title');
        if (premiumTitle) premiumTitle.textContent = t.premium.title;
        const premiumLabels = container.querySelectorAll('#mnPremiumResult .mn-item .mn-label');
        if (premiumLabels.length >= 2) {
            premiumLabels[0].textContent = t.premium.robux;
            premiumLabels[1].textContent = t.premium.usd;
        }
        const premiumSubs = container.querySelectorAll('#mnPremiumResult .mn-item .mn-sub');
        if (premiumSubs.length >= 2) {
            premiumSubs[0].textContent = t.premium.subMonth;
            premiumSubs[1].textContent = t.premium.subWithdraw;
        }
        const premiumFormula = container.querySelector('#mnPremiumResult .mn-formula');
        if (premiumFormula) premiumFormula.innerHTML = `<i class="fas fa-info-circle"></i> ${t.premium.formula}`;

        // Обновляем Game Pass
        const gpFields = container.querySelectorAll('#mnGamepass .mn-group label');
        if (gpFields.length >= 2) {
            gpFields[0].innerHTML = `${t.gamepass.ratings} <span class="mn-hint">${t.gamepass.ratingsHint}</span>`;
            gpFields[1].innerHTML = `${t.gamepass.price} <span class="mn-hint">${t.gamepass.priceHint}</span>`;
        }
        const gpBtn = container.querySelector('#mnGamepass .mn-btn');
        if (gpBtn) gpBtn.innerHTML = `<i class="fas fa-calculator"></i> ${t.gamepass.btn}`;
        const gpTitle = container.querySelector('#mnGamepassResult .mn-result-title');
        if (gpTitle) gpTitle.textContent = t.gamepass.title;
        const gpLabels = container.querySelectorAll('#mnGamepassResult .mn-item .mn-label');
        if (gpLabels.length >= 2) {
            gpLabels[0].textContent = t.gamepass.robux;
            gpLabels[1].textContent = t.gamepass.usd;
        }
        const gpSubs = container.querySelectorAll('#mnGamepassResult .mn-item .mn-sub');
        if (gpSubs.length >= 2) {
            gpSubs[0].textContent = t.gamepass.subTotal;
            gpSubs[1].textContent = t.gamepass.subWithdraw;
        }
        const gpFormula = container.querySelector('#mnGamepassResult .mn-formula');
        if (gpFormula) gpFormula.innerHTML = `<i class="fas fa-info-circle"></i> ${t.gamepass.formula}`;

        // Обновляем Players
        const plFields = container.querySelectorAll('#mnPlayers .mn-group label');
        if (plFields.length >= 2) {
            plFields[0].innerHTML = `${t.players.target} <span class="mn-hint">${t.players.targetHint}</span>`;
            plFields[1].innerHTML = `${t.players.time} <span class="mn-hint">${t.players.timeHint}</span>`;
        }
        const plBtn = container.querySelector('#mnPlayers .mn-btn');
        if (plBtn) plBtn.innerHTML = `<i class="fas fa-calculator"></i> ${t.players.btn}`;
        const plTitle = container.querySelector('#mnPlayersResult .mn-result-title');
        if (plTitle) plTitle.textContent = t.players.title;
        const plLabels = container.querySelectorAll('#mnPlayersResult .mn-item .mn-label');
        if (plLabels.length >= 3) {
            plLabels[0].textContent = t.players.visitsPerMonth;
            plLabels[1].textContent = t.players.perDay;
            plLabels[2].textContent = t.players.perHour;
        }
        const plFormula = container.querySelector('#mnPlayersResult .mn-formula');
        if (plFormula) plFormula.innerHTML = `<i class="fas fa-info-circle"></i> ${t.players.formula}`;

        // Обновляем футер
        const footerLinks = container.querySelectorAll('.mn-footer a');
        if (footerLinks.length >= 2) {
            footerLinks[0].textContent = t.footer.link;
            footerLinks[1].textContent = t.footer.privacy;
        }
    }

    // ============================================================
    // ===== ИНИЦИАЛИЗАЦИЯ =====
    // ============================================================
    function initCalculator() {
        const container = document.getElementById(CONFIG.containerId);
        if (!container) {
            console.warn('[Metro New Calculator] Контейнер #' + CONFIG.containerId + ' не найден');
            return;
        }

        const lang = CONFIG.language;
        container.innerHTML = getTemplate(lang);

        // ===== ОБРАБОТЧИК СМЕНЫ ЯЗЫКА =====
        const langSelect = container.querySelector('#mnLangSelect');
        if (langSelect) {
            langSelect.addEventListener('change', function() {
                const newLang = this.value;
                CONFIG.language = newLang;
                updateLanguage(container, newLang);
            });
        }

        // ===== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК =====
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
                    if (panels[key]) {
                        panels[key].classList.toggle('active', key === target);
                    }
                });
            });
        });

        // ===== PREMIUM =====
        const premiumForm = container.querySelector('#mnPremiumForm');
        if (premiumForm) {
            premiumForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const visits = parseFloat(container.querySelector('#mnPremiumVisits').value) || 0;
                const time = parseFloat(container.querySelector('#mnPremiumTime').value) || 0;

                const robux = visits * 0.05 * time * 0.001;
                const usd = (robux * 0.0035) - 5;

                const robuxEl = container.querySelector('#mnPremiumRobux');
                const usdEl = container.querySelector('#mnPremiumUsd');
                const resultEl = container.querySelector('#mnPremiumResult');

                if (robuxEl) robuxEl.textContent = Math.round(robux).toLocaleString();
                if (usdEl) usdEl.textContent = '$' + Math.max(0, usd).toFixed(2);
                if (resultEl) resultEl.classList.add('show');
            });
        }

        // ===== GAME PASS =====
        const gamepassForm = container.querySelector('#mnGamepassForm');
        if (gamepassForm) {
            gamepassForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const ratings = parseFloat(container.querySelector('#mnGamepassRatings').value) || 0;
                const price = parseFloat(container.querySelector('#mnGamepassPrice').value) || 0;

                const robux = ratings * 50 * price * 0.7;
                const usd = (robux * 0.0035) - 5;

                const robuxEl = container.querySelector('#mnGamepassRobux');
                const usdEl = container.querySelector('#mnGamepassUsd');
                const resultEl = container.querySelector('#mnGamepassResult');

                if (robuxEl) robuxEl.textContent = Math.round(robux).toLocaleString();
                if (usdEl) usdEl.textContent = '$' + Math.max(0, usd).toFixed(2);
                if (resultEl) resultEl.classList.add('show');
            });
        }

        // ===== PLAYERS =====
        const playersForm = container.querySelector('#mnPlayersForm');
        if (playersForm) {
            playersForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const target = parseFloat(container.querySelector('#mnPlayersTarget').value) || 0;
                const time = parseFloat(container.querySelector('#mnPlayersTime').value) || 1;

                const needed = target / (0.05 * time * 0.001);
                const perDay = needed / 30;
                const perHour = perDay / 24;

                const neededEl = container.querySelector('#mnPlayersNeeded');
                const dayEl = container.querySelector('#mnPlayersDay');
                const hourEl = container.querySelector('#mnPlayersHour');
                const resultEl = container.querySelector('#mnPlayersResult');

                if (neededEl) neededEl.textContent = Math.round(needed).toLocaleString();
                if (dayEl) dayEl.textContent = Math.round(perDay).toLocaleString();
                if (hourEl) hourEl.textContent = Math.round(perHour).toLocaleString();
                if (resultEl) resultEl.classList.add('show');
            });
        }

        console.log('[Metro New Calculator] ✅ Калькулятор успешно загружен! Язык: ' + lang);
    }

    // ===== ЗАПУСК =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalculator);
    } else {
        initCalculator();
    }

})();/**
 * Metro New — Roblox Developer Earnings Calculator (Embed)
 * Встраиваемый калькулятор дохода разработчика Roblox
 * 
 * Как использовать:
 * 1. Добавьте на страницу: <div id="roblox-calculator"></div>
 * 2. Подключите этот скрипт: <script src="embed.js"></script>
 * 
 * @version 1.0.0
 * @author Metro New Team
 */

(function() {
    'use strict';

    // ===== КОНФИГ =====
    const CONFIG = {
        containerId: 'roblox-calculator',
        version: '1.0.0'
    };

    // ===== СТИЛИ =====
    const styles = `
        <style>
            .mn-calculator {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 700px;
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
            }

            @media (max-width: 400px) {
                .mn-calculator .mn-result .mn-values {
                    grid-template-columns: 1fr;
                }
            }

            @media (prefers-color-scheme: dark) {
                .mn-calculator {
                    background: #1a1a2e;
                    border-color: #2d2d44;
                }
                .mn-calculator .mn-header .mn-title h3 {
                    color: #f2f4fa;
                }
                .mn-calculator .mn-header .mn-title p {
                    color: #a6b0cc;
                }
                .mn-calculator .mn-tab {
                    background: #2d2d44;
                    border-color: #3d3d5a;
                    color: #a6b0cc;
                }
                .mn-calculator .mn-tab:hover {
                    border-color: #4d94ff;
                    color: #f2f4fa;
                }
                .mn-calculator .mn-tab.active {
                    background: #0066CC;
                    color: white;
                    border-color: #0066CC;
                }
                .mn-calculator .mn-group label {
                    color: #f2f4fa;
                }
                .mn-calculator .mn-group label .mn-hint {
                    color: #77819e;
                }
                .mn-calculator .mn-group input {
                    background: #2d2d44;
                    border-color: #3d3d5a;
                    color: #f2f4fa;
                }
                .mn-calculator .mn-group input:focus {
                    border-color: #4d94ff;
                    box-shadow: 0 0 0 3px rgba(77, 148, 255, 0.2);
                }
                .mn-calculator .mn-group input::placeholder {
                    color: #4a5473;
                }
                .mn-calculator .mn-result {
                    background: linear-gradient(135deg, #1a2a4a, #0d1a33);
                    border-color: #4d94ff;
                }
                .mn-calculator .mn-result .mn-result-title {
                    color: #4d94ff;
                }
                .mn-calculator .mn-result .mn-item {
                    background: #2d2d44;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                .mn-calculator .mn-result .mn-item .mn-label {
                    color: #77819e;
                }
                .mn-calculator .mn-result .mn-item .mn-value {
                    color: #f2f4fa;
                }
                .mn-calculator .mn-result .mn-item .mn-value.mn-robux {
                    color: #4d94ff;
                }
                .mn-calculator .mn-result .mn-item .mn-value.mn-usd {
                    color: #34a853;
                }
                .mn-calculator .mn-result .mn-item .mn-sub {
                    color: #4a5473;
                }
                .mn-calculator .mn-result .mn-formula {
                    color: #77819e;
                }
                .mn-calculator .mn-result .mn-formula strong {
                    color: #4d94ff;
                }
                .mn-calculator .mn-footer {
                    border-top-color: #2d2d44;
                    color: #4a5473;
                }
                .mn-calculator .mn-footer a {
                    color: #4d94ff;
                }
                .mn-calculator .mn-notice {
                    background: #2d1f00;
                    border-left-color: #f59e0b;
                    color: #fbbf24;
                }
                .mn-calculator .mn-notice strong {
                    color: #fbbf24;
                }
                .mn-calculator .mn-badge {
                    background: #2d1f00;
                    color: #fbbf24;
                }
            }
        </style>
    `;

    // ===== ШАБЛОН =====
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

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    function initCalculator() {
        const container = document.getElementById(CONFIG.containerId);
        if (!container) {
            console.warn('[Metro New Calculator] Контейнер #' + CONFIG.containerId + ' не найден');
            return;
        }

        // Вставляем HTML
        container.innerHTML = template;

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

        // ---- Premium ----
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

        // ---- Game Pass ----
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

        // ---- Игроки ----
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
