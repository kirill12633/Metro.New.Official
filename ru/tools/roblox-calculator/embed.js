/**
 * Metro New — Roblox Developer Earnings Calculator (Embed)
 * Встраиваемый калькулятор дохода разработчика Roblox
 * Поддерживает 10 языков + Дополнительные инструменты
 * 
 * Как использовать:
 * 1. Добавьте на страницу: <div id="roblox-calculator"></div>
 * 2. Подключите этот скрипт: <script src="embed.js"></script>
 * 
 * @version 2.1.0
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
                players: 'Игроки',
                payback: 'Окупаемость',
                gpExtra: 'Game Pass\'ы',
                ads: 'Реклама',
                time: 'Конвертер'
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
            payback: {
                title: '⏱️ Результат окупаемости',
                cost: 'Стоимость разработки',
                costHint: 'в Robux',
                income: 'Ежемесячный доход',
                incomeHint: 'в Robux',
                btn: 'Рассчитать окупаемость',
                months: 'Месяцев',
                days: 'Дней',
                subMonths: '~ месяцев',
                subDays: '~ дней'
            },
            gpExtra: {
                title: '🎟️ Результат',
                target: 'Целевой доход',
                targetHint: 'в Robux',
                price: 'Средняя цена пасса',
                priceHint: 'в Robux',
                ratings: 'Среднее число оценок',
                ratingsHint: 'на пасс',
                btn: 'Рассчитать',
                count: 'Нужно Game Pass\'ов',
                perPass: 'Доход с одного пасса',
                subCount: '~ штук',
                subPerPass: 'в USD'
            },
            ads: {
                title: '📢 Результат рекламной кампании',
                budget: 'Бюджет на рекламу',
                budgetHint: 'в Robux',
                cpv: 'Цена за визит (CPV)',
                cpvHint: 'в Robux',
                btn: 'Рассчитать',
                visits: 'Ожидаемое число визитов',
                costPerVisit: 'Стоимость одного визита',
                subVisits: '~ игроков',
                subCost: 'в USD'
            },
            time: {
                title: '⏳ Результат конвертации',
                minutes: 'Количество минут',
                btn: 'Конвертировать',
                hours: 'Часы',
                days: 'Дни',
                months: 'Месяцы'
            },
            footer: {
                link: 'Метро New Калькулятор',
                privacy: 'Конфиденциальность'
            },
            badge: 'v2.1'
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
                players: 'Players',
                payback: 'Payback',
                gpExtra: 'Game Passes',
                ads: 'Ads',
                time: 'Time'
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
            payback: {
                title: '⏱️ Payback result',
                cost: 'Development cost',
                costHint: 'in Robux',
                income: 'Monthly income',
                incomeHint: 'in Robux',
                btn: 'Calculate payback',
                months: 'Months',
                days: 'Days',
                subMonths: '~ months',
                subDays: '~ days'
            },
            gpExtra: {
                title: '🎟️ Result',
                target: 'Target income',
                targetHint: 'in Robux',
                price: 'Average pass price',
                priceHint: 'in Robux',
                ratings: 'Average ratings',
                ratingsHint: 'per pass',
                btn: 'Calculate',
                count: 'Game Passes needed',
                perPass: 'Income per pass',
                subCount: '~ pieces',
                subPerPass: 'in USD'
            },
            ads: {
                title: '📢 Ad campaign result',
                budget: 'Ad budget',
                budgetHint: 'in Robux',
                cpv: 'Cost per visit (CPV)',
                cpvHint: 'in Robux',
                btn: 'Calculate',
                visits: 'Expected visits',
                costPerVisit: 'Cost per visit',
                subVisits: '~ players',
                subCost: 'in USD'
            },
            time: {
                title: '⏳ Conversion result',
                minutes: 'Minutes',
                btn: 'Convert',
                hours: 'Hours',
                days: 'Days',
                months: 'Months'
            },
            footer: {
                link: 'Metro New Calculator',
                privacy: 'Privacy Policy'
            },
            badge: 'v2.1'
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
                players: 'Jugadores',
                payback: 'Retorno',
                gpExtra: 'Game Pass',
                ads: 'Anuncios',
                time: 'Tiempo'
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
            payback: {
                title: '⏱️ Resultado de retorno',
                cost: 'Costo de desarrollo',
                costHint: 'en Robux',
                income: 'Ingreso mensual',
                incomeHint: 'en Robux',
                btn: 'Calcular retorno',
                months: 'Meses',
                days: 'Días',
                subMonths: '~ meses',
                subDays: '~ días'
            },
            gpExtra: {
                title: '🎟️ Resultado',
                target: 'Ingreso objetivo',
                targetHint: 'en Robux',
                price: 'Precio promedio del pase',
                priceHint: 'en Robux',
                ratings: 'Calificaciones promedio',
                ratingsHint: 'por pase',
                btn: 'Calcular',
                count: 'Game Pass necesarios',
                perPass: 'Ingreso por pase',
                subCount: '~ unidades',
                subPerPass: 'en USD'
            },
            ads: {
                title: '📢 Resultado de campaña publicitaria',
                budget: 'Presupuesto publicitario',
                budgetHint: 'en Robux',
                cpv: 'Costo por visita (CPV)',
                cpvHint: 'en Robux',
                btn: 'Calcular',
                visits: 'Visitas esperadas',
                costPerVisit: 'Costo por visita',
                subVisits: '~ jugadores',
                subCost: 'en USD'
            },
            time: {
                title: '⏳ Resultado de conversión',
                minutes: 'Minutos',
                btn: 'Convertir',
                hours: 'Horas',
                days: 'Días',
                months: 'Meses'
            },
            footer: {
                link: 'Metro New Calculadora',
                privacy: 'Política de Privacidad'
            },
            badge: 'v2.1'
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
                players: 'Joueurs',
                payback: 'Retour',
                gpExtra: 'Game Pass',
                ads: 'Annonces',
                time: 'Temps'
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
            payback: {
                title: '⏱️ Résultat de retour',
                cost: 'Coût de développement',
                costHint: 'en Robux',
                income: 'Revenu mensuel',
                incomeHint: 'en Robux',
                btn: 'Calculer le retour',
                months: 'Mois',
                days: 'Jours',
                subMonths: '~ mois',
                subDays: '~ jours'
            },
            gpExtra: {
                title: '🎟️ Résultat',
                target: 'Revenu cible',
                targetHint: 'en Robux',
                price: 'Prix moyen du pass',
                priceHint: 'en Robux',
                ratings: 'Évaluations moyennes',
                ratingsHint: 'par pass',
                btn: 'Calculer',
                count: 'Game Pass nécessaires',
                perPass: 'Revenu par pass',
                subCount: '~ unités',
                subPerPass: 'en USD'
            },
            ads: {
                title: '📢 Résultat de campagne publicitaire',
                budget: 'Budget publicitaire',
                budgetHint: 'en Robux',
                cpv: 'Coût par visite (CPV)',
                cpvHint: 'en Robux',
                btn: 'Calculer',
                visits: 'Visites attendues',
                costPerVisit: 'Coût par visite',
                subVisits: '~ joueurs',
                subCost: 'en USD'
            },
            time: {
                title: '⏳ Résultat de conversion',
                minutes: 'Minutes',
                btn: 'Convertir',
                hours: 'Heures',
                days: 'Jours',
                months: 'Mois'
            },
            footer: {
                link: 'Metro New Calculateur',
                privacy: 'Politique de Confidentialité'
            },
            badge: 'v2.1'
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
                players: 'Spieler',
                payback: 'Amortisation',
                gpExtra: 'Game Passes',
                ads: 'Werbung',
                time: 'Zeit'
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
            payback: {
                title: '⏱️ Amortisationsergebnis',
                cost: 'Entwicklungskosten',
                costHint: 'in Robux',
                income: 'Monatliches Einkommen',
                incomeHint: 'in Robux',
                btn: 'Amortisation berechnen',
                months: 'Monate',
                days: 'Tage',
                subMonths: '~ Monate',
                subDays: '~ Tage'
            },
            gpExtra: {
                title: '🎟️ Ergebnis',
                target: 'Zieleinkommen',
                targetHint: 'in Robux',
                price: 'Durchschnittlicher Pass-Preis',
                priceHint: 'in Robux',
                ratings: 'Durchschnittliche Bewertungen',
                ratingsHint: 'pro Pass',
                btn: 'Berechnen',
                count: 'Game Passes benötigt',
                perPass: 'Einkommen pro Pass',
                subCount: '~ Stück',
                subPerPass: 'in USD'
            },
            ads: {
                title: '📢 Werbekampagnen-Ergebnis',
                budget: 'Werbe-Budget',
                budgetHint: 'in Robux',
                cpv: 'Kosten pro Besuch (CPV)',
                cpvHint: 'in Robux',
                btn: 'Berechnen',
                visits: 'Erwartete Besuche',
                costPerVisit: 'Kosten pro Besuch',
                subVisits: '~ Spieler',
                subCost: 'in USD'
            },
            time: {
                title: '⏳ Konvertierungsergebnis',
                minutes: 'Minuten',
                btn: 'Konvertieren',
                hours: 'Stunden',
                days: 'Tage',
                months: 'Monate'
            },
            footer: {
                link: 'Metro New Rechner',
                privacy: 'Datenschutz'
            },
            badge: 'v2.1'
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
                players: '玩家',
                payback: '回报',
                gpExtra: 'Game Pass',
                ads: '广告',
                time: '时间'
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
            payback: {
                title: '⏱️ 回报结果',
                cost: '开发成本',
                costHint: 'Robux',
                income: '月收入',
                incomeHint: 'Robux',
                btn: '计算回报',
                months: '月数',
                days: '天数',
                subMonths: '~ 月',
                subDays: '~ 天'
            },
            gpExtra: {
                title: '🎟️ 结果',
                target: '目标收入',
                targetHint: 'Robux',
                price: '平均通行证价格',
                priceHint: 'Robux',
                ratings: '平均评分',
                ratingsHint: '每通行证',
                btn: '计算',
                count: '需要 Game Pass',
                perPass: '每个通行证收入',
                subCount: '~ 个',
                subPerPass: '美元'
            },
            ads: {
                title: '📢 广告活动结果',
                budget: '广告预算',
                budgetHint: 'Robux',
                cpv: '每次访问成本 (CPV)',
                cpvHint: 'Robux',
                btn: '计算',
                visits: '预期访问量',
                costPerVisit: '每次访问成本',
                subVisits: '~ 玩家',
                subCost: '美元'
            },
            time: {
                title: '⏳ 转换结果',
                minutes: '分钟数',
                btn: '转换',
                hours: '小时',
                days: '天',
                months: '月'
            },
            footer: {
                link: 'Metro New 计算器',
                privacy: '隐私政策'
            },
            badge: 'v2.1'
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
                players: 'プレイヤー',
                payback: '回収',
                gpExtra: 'Game Pass',
                ads: '広告',
                time: '時間'
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
            payback: {
                title: '⏱️ 回収結果',
                cost: '開発コスト',
                costHint: 'Robux',
                income: '月収',
                incomeHint: 'Robux',
                btn: '回収を計算',
                months: 'ヶ月',
                days: '日',
                subMonths: '~ ヶ月',
                subDays: '~ 日'
            },
            gpExtra: {
                title: '🎟️ 結果',
                target: '目標収入',
                targetHint: 'Robux',
                price: '平均パス価格',
                priceHint: 'Robux',
                ratings: '平均評価',
                ratingsHint: 'パスごと',
                btn: '計算',
                count: '必要な Game Pass',
                perPass: 'パスあたりの収入',
                subCount: '~ 個',
                subPerPass: 'USD'
            },
            ads: {
                title: '📢 広告キャンペーン結果',
                budget: '広告予算',
                budgetHint: 'Robux',
                cpv: '訪問単価 (CPV)',
                cpvHint: 'Robux',
                btn: '計算',
                visits: '期待される訪問数',
                costPerVisit: '訪問単価',
                subVisits: '~ プレイヤー',
                subCost: 'USD'
            },
            time: {
                title: '⏳ 変換結果',
                minutes: '分数',
                btn: '変換',
                hours: '時間',
                days: '日',
                months: '月'
            },
            footer: {
                link: 'Metro New 計算機',
                privacy: 'プライバシーポリシー'
            },
            badge: 'v2.1'
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
                players: '플레이어',
                payback: '회수',
                gpExtra: 'Game Pass',
                ads: '광고',
                time: '시간'
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
            payback: {
                title: '⏱️ 회수 결과',
                cost: '개발 비용',
                costHint: 'Robux',
                income: '월 수익',
                incomeHint: 'Robux',
                btn: '회수 계산',
                months: '개월',
                days: '일',
                subMonths: '~ 개월',
                subDays: '~ 일'
            },
            gpExtra: {
                title: '🎟️ 결과',
                target: '목표 수익',
                targetHint: 'Robux',
                price: '평균 패스 가격',
                priceHint: 'Robux',
                ratings: '평균 평가',
                ratingsHint: '패스당',
                btn: '계산',
                count: '필요한 Game Pass',
                perPass: '패스당 수익',
                subCount: '~ 개',
                subPerPass: 'USD'
            },
            ads: {
                title: '📢 광고 캠페인 결과',
                budget: '광고 예산',
                budgetHint: 'Robux',
                cpv: '방문당 비용 (CPV)',
                cpvHint: 'Robux',
                btn: '계산',
                visits: '예상 방문 수',
                costPerVisit: '방문당 비용',
                subVisits: '~ 플레이어',
                subCost: 'USD'
            },
            time: {
                title: '⏳ 변환 결과',
                minutes: '분',
                btn: '변환',
                hours: '시간',
                days: '일',
                months: '개월'
            },
            footer: {
                link: 'Metro New 계산기',
                privacy: '개인정보 처리방침'
            },
            badge: 'v2.1'
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
                players: 'اللاعبين',
                payback: 'الاسترداد',
                gpExtra: 'Game Pass',
                ads: 'الإعلانات',
                time: 'الوقت'
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
            payback: {
                title: '⏱️ نتيجة الاسترداد',
                cost: 'تكلفة التطوير',
                costHint: 'بـ Robux',
                income: 'الدخل الشهري',
                incomeHint: 'بـ Robux',
                btn: 'احسب الاسترداد',
                months: 'أشهر',
                days: 'أيام',
                subMonths: '~ أشهر',
                subDays: '~ أيام'
            },
            gpExtra: {
                title: '🎟️ النتيجة',
                target: 'الدخل المستهدف',
                targetHint: 'بـ Robux',
                price: 'متوسط سعر الباس',
                priceHint: 'بـ Robux',
                ratings: 'متوسط التقييمات',
                ratingsHint: 'لكل باس',
                btn: 'احسب',
                count: 'Game Pass المطلوبة',
                perPass: 'الدخل لكل باس',
                subCount: '~ قطعة',
                subPerPass: 'بـ USD'
            },
            ads: {
                title: '📢 نتيجة الحملة الإعلانية',
                budget: 'ميزانية الإعلان',
                budgetHint: 'بـ Robux',
                cpv: 'التكلفة لكل زيارة (CPV)',
                cpvHint: 'بـ Robux',
                btn: 'احسب',
                visits: 'الزيارات المتوقعة',
                costPerVisit: 'التكلفة لكل زيارة',
                subVisits: '~ لاعب',
                subCost: 'بـ USD'
            },
            time: {
                title: '⏳ نتيجة التحويل',
                minutes: 'الدقائق',
                btn: 'تحويل',
                hours: 'ساعات',
                days: 'أيام',
                months: 'أشهر'
            },
            footer: {
                link: 'حاسبة Metro New',
                privacy: 'سياسة الخصوصية'
            },
            badge: 'v2.1'
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
                players: 'खिलाड़ी',
                payback: 'वापसी',
                gpExtra: 'Game Pass',
                ads: 'विज्ञापन',
                time: 'समय'
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
            payback: {
                title: '⏱️ वापसी परिणाम',
                cost: 'विकास लागत',
                costHint: 'Robux में',
                income: 'मासिक आय',
                incomeHint: 'Robux में',
                btn: 'वापसी गणना करें',
                months: 'महीने',
                days: 'दिन',
                subMonths: '~ महीने',
                subDays: '~ दिन'
            },
            gpExtra: {
                title: '🎟️ परिणाम',
                target: 'लक्ष्य आय',
                targetHint: 'Robux में',
                price: 'औसत पास मूल्य',
                priceHint: 'Robux में',
                ratings: 'औसत रेटिंग',
                ratingsHint: 'प्रति पास',
                btn: 'गणना करें',
                count: 'आवश्यक Game Pass',
                perPass: 'प्रति पास आय',
                subCount: '~ टुकड़े',
                subPerPass: 'USD में'
            },
            ads: {
                title: '📢 विज्ञापन अभियान परिणाम',
                budget: 'विज्ञापन बजट',
                budgetHint: 'Robux में',
                cpv: 'प्रति विज़िट लागत (CPV)',
                cpvHint: 'Robux में',
                btn: 'गणना करें',
                visits: 'अपेक्षित विज़िट',
                costPerVisit: 'प्रति विज़िट लागत',
                subVisits: '~ खिलाड़ी',
                subCost: 'USD में'
            },
            time: {
                title: '⏳ रूपांतरण परिणाम',
                minutes: 'मिनट',
                btn: 'रूपांतरित करें',
                hours: 'घंटे',
                days: 'दिन',
                months: 'महीने'
            },
            footer: {
                link: 'Metro New कैलकुलेटर',
                privacy: 'गोपनीयता नीति'
            },
            badge: 'v2.1'
        }
    };

    // ===== ДЕТЕКТИМ ЯЗЫК =====
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

    // ===== КОНФИГ =====
    const CONFIG = {
        containerId: 'roblox-calculator',
        version: '2.1.0',
        language: detectLanguage()
    };

    // ===== НОВЫЙ ДИЗАЙН (СТИЛЬ МЕТРО NEW) =====
    const styles = `
        <style>
            .mn-calculator {
                font-family: 'Montserrat', 'Segoe UI', Tahoma, sans-serif;
                max-width: 800px;
                margin: 20px auto;
                padding: 30px;
                background: #0d1526;
                border-radius: 20px;
                box-shadow: 0 8px 40px rgba(0,0,0,0.6);
                border: 1px solid #253460;
                color: #f2f4fa;
                background-image: radial-gradient(ellipse at 10% 20%, rgba(255,215,0,0.06) 0%, transparent 60%),
                    radial-gradient(ellipse at 90% 80%, rgba(77,148,255,0.08) 0%, transparent 60%);
            }

            .mn-calculator * {
                box-sizing: border-box;
            }

            .mn-calculator .mn-header {
                display: flex;
                align-items: center;
                gap: 14px;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 2px solid #FFD700;
                flex-wrap: wrap;
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
                box-shadow: 0 0 30px rgba(255,215,0,0.15);
            }

            .mn-calculator .mn-header .mn-title {
                flex: 1;
                min-width: 140px;
            }

            .mn-calculator .mn-header .mn-title h3 {
                margin: 0;
                color: #f2f4fa;
                font-size: 18px;
                font-weight: 700;
                background: linear-gradient(135deg, #f2f4fa 40%, #FFD700);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .mn-calculator .mn-header .mn-title p {
                margin: 2px 0 0 0;
                color: #a6b0cc;
                font-size: 12px;
            }

            .mn-calculator .mn-header .mn-lang-select {
                padding: 6px 12px;
                border-radius: 10px;
                background: #131c33;
                border: 1px solid #253460;
                color: #a6b0cc;
                font-size: 13px;
                cursor: pointer;
                font-family: 'Montserrat', sans-serif;
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
                background: rgba(255,215,0,0.12);
                color: #FFD700;
                padding: 4px 14px;
                border-radius: 50px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid rgba(255,215,0,0.15);
                white-space: nowrap;
            }

            .mn-calculator .mn-notice {
                background: rgba(255,215,0,0.06);
                border-left: 4px solid #FFD700;
                border-radius: 10px;
                padding: 12px 16px;
                margin-bottom: 20px;
                font-size: 13px;
                color: #a6b0cc;
                display: flex;
                align-items: flex-start;
                gap: 10px;
                border: 1px solid rgba(255,215,0,0.08);
            }

            .mn-calculator .mn-notice i {
                color: #FFD700;
                font-size: 18px;
                margin-top: 2px;
            }

            .mn-calculator .mn-notice strong {
                color: #FFD700;
            }

            .mn-calculator .mn-tabs {
                display: flex;
                gap: 6px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .mn-calculator .mn-tab {
                padding: 8px 16px;
                border-radius: 50px;
                border: 1px solid #253460;
                background: transparent;
                cursor: pointer;
                font-weight: 600;
                font-size: 13px;
                transition: all 0.3s;
                color: #a6b0cc;
                font-family: 'Montserrat', 'Segoe UI', sans-serif;
            }

            .mn-calculator .mn-tab:hover {
                border-color: #FFD700;
                color: #f2f4fa;
                background: rgba(255,215,0,0.05);
            }

            .mn-calculator .mn-tab.active {
                background: rgba(255,215,0,0.12);
                color: #FFD700;
                border-color: #FFD700;
                box-shadow: 0 0 25px rgba(255,215,0,0.08);
            }

            .mn-calculator .mn-tab i {
                margin-right: 6px;
            }

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
                font-size: 13px;
                color: #a6b0cc;
            }

            .mn-calculator .mn-group label .mn-hint {
                font-weight: 400;
                color: #4a5473;
                font-size: 11px;
            }

            .mn-calculator .mn-group input {
                padding: 10px 14px;
                border-radius: 10px;
                border: 1px solid #253460;
                background: #131c33;
                color: #f2f4fa;
                font-size: 14px;
                transition: all 0.3s;
                font-family: 'Montserrat', sans-serif;
            }

            .mn-calculator .mn-group input:focus {
                outline: none;
                border-color: #FFD700;
                box-shadow: 0 0 0 3px rgba(255,215,0,0.08);
                background: #182444;
            }

            .mn-calculator .mn-group input::placeholder {
                color: #4a5473;
            }

            .mn-calculator .mn-btn {
                padding: 12px 24px;
                border-radius: 12px;
                border: none;
                background: linear-gradient(135deg, #FFD700, #e6c200);
                color: #0d1526;
                font-weight: 700;
                font-size: 15px;
                cursor: pointer;
                transition: all 0.3s;
                font-family: 'Montserrat', sans-serif;
                width: 100%;
                margin-top: 4px;
                box-shadow: 0 4px 25px rgba(255,215,0,0.12);
            }

            .mn-calculator .mn-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 40px rgba(255,215,0,0.2);
            }

            .mn-calculator .mn-btn:active {
                transform: translateY(0);
            }

            .mn-calculator .mn-btn i {
                margin-right: 8px;
            }

            .mn-calculator .mn-result {
                margin-top: 18px;
                padding: 18px 20px;
                border-radius: 12px;
                background: rgba(255,215,0,0.04);
                border: 1px solid rgba(255,215,0,0.10);
                display: none;
            }

            .mn-calculator .mn-result.show {
                display: block;
                animation: mnFadeIn 0.4s ease;
            }

            .mn-calculator .mn-result .mn-result-title {
                font-size: 15px;
                font-weight: 700;
                color: #FFD700;
                margin-bottom: 10px;
            }

            .mn-calculator .mn-result .mn-values {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 12px;
            }

            .mn-calculator .mn-result .mn-item {
                background: #131c33;
                border-radius: 10px;
                padding: 12px 16px;
                text-align: center;
                border: 1px solid #253460;
            }

            .mn-calculator .mn-result .mn-item .mn-label {
                color: #4a5473;
                font-size: 11px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .mn-calculator .mn-result .mn-item .mn-value {
                font-size: 22px;
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

            .mn-calculator .mn-result .mn-item .mn-value.mn-green {
                color: #34a853;
            }

            .mn-calculator .mn-result .mn-item .mn-value.mn-orange {
                color: #f39c12;
            }

            .mn-calculator .mn-result .mn-item .mn-sub {
                font-size: 11px;
                color: #4a5473;
            }

            .mn-calculator .mn-result .mn-formula {
                font-size: 12px;
                color: #4a5473;
                margin-top: 10px;
                text-align: center;
            }

            .mn-calculator .mn-result .mn-formula strong {
                color: #a6b0cc;
            }

            .mn-calculator .mn-footer {
                margin-top: 18px;
                padding-top: 14px;
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
            }

            @media (max-width: 600px) {
                .mn-calculator {
                    padding: 16px;
                    margin: 10px;
                }
                .mn-calculator .mn-form {
                    grid-template-columns: 1fr;
                }
                .mn-calculator .mn-tab {
                    font-size: 12px;
                    padding: 6px 12px;
                }
                .mn-calculator .mn-result .mn-values {
                    grid-template-columns: 1fr 1fr;
                }
                .mn-calculator .mn-header .mn-title h3 {
                    font-size: 15px;
                }
            }

            @media (max-width: 400px) {
                .mn-calculator .mn-result .mn-values {
                    grid-template-columns: 1fr;
                }
                .mn-calculator .mn-header .mn-lang-select {
                    font-size: 11px;
                    padding: 4px 8px;
                }
                .mn-calculator .mn-badge {
                    font-size: 9px;
                    padding: 2px 10px;
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

                <!-- ===== ВКЛАДКИ ===== -->
                <div class="mn-tabs" id="mnTabs">
                    <button class="mn-tab active" data-tab="premium">
                        <i class="fas fa-crown"></i> ${t.tabs.premium}
                    </button>
                    <button class="mn-tab" data-tab="gamepass">
                        <i class="fas fa-ticket"></i> ${t.tabs.gamepass}
                    </button>
                    <button class="mn-tab" data-tab="players">
                        <i class="fas fa-users"></i> ${t.tabs.players}
                    </button>
                    <button class="mn-tab" data-tab="payback">
                        <i class="fas fa-clock"></i> ${t.tabs.payback}
                    </button>
                    <button class="mn-tab" data-tab="gpExtra">
                        <i class="fas fa-ticket"></i> ${t.tabs.gpExtra}
                    </button>
                    <button class="mn-tab" data-tab="ads">
                        <i class="fas fa-ad"></i> ${t.tabs.ads}
                    </button>
                    <button class="mn-tab" data-tab="time">
                        <i class="fas fa-hourglass-half"></i> ${t.tabs.time}
                    </button>
                </div>

                <!-- ===== PREMIUM ===== -->
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

                <!-- ===== GAME PASS ===== -->
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

                <!-- ===== ИГРОКИ ===== -->
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
                                <div class="mn-value mn-robux" id="mnPlayersNeeded" style="font-size: 30px;">0</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.players.perDay}</div>
                                <div class="mn-value mn-green" id="mnPlayersDay">0</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.players.perHour}</div>
                                <div class="mn-value mn-orange" id="mnPlayersHour">0</div>
                            </div>
                        </div>
                        <div class="mn-formula">
                            <i class="fas fa-info-circle"></i> ${t.players.formula}
                        </div>
                    </div>
                </div>

                <!-- ===== ОКУПАЕМОСТЬ ===== -->
                <div class="mn-panel" id="mnPayback">
                    <form class="mn-form" id="mnPaybackForm">
                        <div class="mn-group">
                            <label>${t.payback.cost} <span class="mn-hint">${t.payback.costHint}</span></label>
                            <input type="number" id="mnPaybackCost" placeholder="50000" min="0" step="1" value="50000">
                        </div>
                        <div class="mn-group">
                            <label>${t.payback.income} <span class="mn-hint">${t.payback.incomeHint}</span></label>
                            <input type="number" id="mnPaybackIncome" placeholder="10000" min="0" step="1" value="10000">
                        </div>
                        <div class="mn-full">
                            <button type="submit" class="mn-btn">
                                <i class="fas fa-calculator"></i> ${t.payback.btn}
                            </button>
                        </div>
                    </form>

                    <div class="mn-result" id="mnPaybackResult">
                        <div class="mn-result-title">${t.payback.title}</div>
                        <div class="mn-values">
                            <div class="mn-item">
                                <div class="mn-label">${t.payback.months}</div>
                                <div class="mn-value mn-orange" id="mnPaybackMonths">0</div>
                                <div class="mn-sub">${t.payback.subMonths}</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.payback.days}</div>
                                <div class="mn-value mn-green" id="mnPaybackDays">0</div>
                                <div class="mn-sub">${t.payback.subDays}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== GAME PASS'Ы (ДОП) ===== -->
                <div class="mn-panel" id="mnGpExtra">
                    <form class="mn-form" id="mnGpExtraForm">
                        <div class="mn-group">
                            <label>${t.gpExtra.target} <span class="mn-hint">${t.gpExtra.targetHint}</span></label>
                            <input type="number" id="mnGpExtraTarget" placeholder="100000" min="0" step="1" value="100000">
                        </div>
                        <div class="mn-group">
                            <label>${t.gpExtra.price} <span class="mn-hint">${t.gpExtra.priceHint}</span></label>
                            <input type="number" id="mnGpExtraPrice" placeholder="100" min="0" step="1" value="100">
                        </div>
                        <div class="mn-group">
                            <label>${t.gpExtra.ratings} <span class="mn-hint">${t.gpExtra.ratingsHint}</span></label>
                            <input type="number" id="mnGpExtraRatings" placeholder="50" min="0" step="1" value="50">
                        </div>
                        <div class="mn-full">
                            <button type="submit" class="mn-btn">
                                <i class="fas fa-calculator"></i> ${t.gpExtra.btn}
                            </button>
                        </div>
                    </form>

                    <div class="mn-result" id="mnGpExtraResult">
                        <div class="mn-result-title">${t.gpExtra.title}</div>
                        <div class="mn-values">
                            <div class="mn-item">
                                <div class="mn-label">${t.gpExtra.count}</div>
                                <div class="mn-value mn-robux" id="mnGpExtraCount">0</div>
                                <div class="mn-sub">${t.gpExtra.subCount}</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.gpExtra.perPass}</div>
                                <div class="mn-value mn-usd" id="mnGpExtraPerPass">$0</div>
                                <div class="mn-sub">${t.gpExtra.subPerPass}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== РЕКЛАМА ===== -->
                <div class="mn-panel" id="mnAds">
                    <form class="mn-form" id="mnAdsForm">
                        <div class="mn-group">
                            <label>${t.ads.budget} <span class="mn-hint">${t.ads.budgetHint}</span></label>
                            <input type="number" id="mnAdsBudget" placeholder="10000" min="0" step="1" value="10000">
                        </div>
                        <div class="mn-group">
                            <label>${t.ads.cpv} <span class="mn-hint">${t.ads.cpvHint}</span></label>
                            <input type="number" id="mnAdsCpv" placeholder="0.5" min="0" step="0.01" value="0.5">
                        </div>
                        <div class="mn-full">
                            <button type="submit" class="mn-btn">
                                <i class="fas fa-calculator"></i> ${t.ads.btn}
                            </button>
                        </div>
                    </form>

                    <div class="mn-result" id="mnAdsResult">
                        <div class="mn-result-title">${t.ads.title}</div>
                        <div class="mn-values">
                            <div class="mn-item">
                                <div class="mn-label">${t.ads.visits}</div>
                                <div class="mn-value mn-green" id="mnAdsVisits">0</div>
                                <div class="mn-sub">${t.ads.subVisits}</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.ads.costPerVisit}</div>
                                <div class="mn-value mn-orange" id="mnAdsCostPerVisit">$0</div>
                                <div class="mn-sub">${t.ads.subCost}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== КОНВЕРТЕР ВРЕМЕНИ ===== -->
                <div class="mn-panel" id="mnTime">
                    <form class="mn-form" id="mnTimeForm">
                        <div class="mn-group">
                            <label>${t.time.minutes}</label>
                            <input type="number" id="mnTimeMinutes" placeholder="10000" min="0" step="1" value="10000">
                        </div>
                        <div class="mn-full">
                            <button type="submit" class="mn-btn">
                                <i class="fas fa-calculator"></i> ${t.time.btn}
                            </button>
                        </div>
                    </form>

                    <div class="mn-result" id="mnTimeResult">
                        <div class="mn-result-title">${t.time.title}</div>
                        <div class="mn-values">
                            <div class="mn-item">
                                <div class="mn-label">${t.time.hours}</div>
                                <div class="mn-value" id="mnTimeHours" style="color: #FFD700;">0</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.time.days}</div>
                                <div class="mn-value mn-green" id="mnTimeDays">0</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.time.months}</div>
                                <div class="mn-value mn-orange" id="mnTimeMonths">0</div>
                            </div>
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

        const select = container.querySelector('#mnLangSelect');
        if (select) select.value = lang;

        const badge = container.querySelector('.mn-badge');
        if (badge) badge.textContent = t.badge;

        const title = container.querySelector('.mn-header .mn-title h3');
        const subtitle = container.querySelector('.mn-header .mn-title p');
        if (title) title.textContent = t.title;
        if (subtitle) subtitle.textContent = t.subtitle;

        const notice = container.querySelector('.mn-notice div');
        if (notice) notice.innerHTML = t.notice;

        const tabs = container.querySelectorAll('.mn-tab');
        const tabKeys = ['premium', 'gamepass', 'players', 'payback', 'gpExtra', 'ads', 'time'];
        if (tabs.length >= 7) {
            tabs.forEach((tab, i) => {
                const key = tabKeys[i];
                const iconMap = {
                    'premium': 'fa-crown',
                    'gamepass': 'fa-ticket',
                    'players': 'fa-users',
                    'payback': 'fa-clock',
                    'gpExtra': 'fa-ticket',
                    'ads': 'fa-ad',
                    'time': 'fa-hourglass-half'
                };
                tab.innerHTML = `<i class="fas ${iconMap[key]}"></i> ${t.tabs[key]}`;
            });
        }

        // Обновляем все панели
        updatePanel(container, 'mnPremium', 'premium');
        updatePanel(container, 'mnGamepass', 'gamepass');
        updatePanel(container, 'mnPlayers', 'players');
        updatePanel(container, 'mnPayback', 'payback');
        updatePanel(container, 'mnGpExtra', 'gpExtra');
        updatePanel(container, 'mnAds', 'ads');
        updatePanel(container, 'mnTime', 'time');

        // Футер
        const footerLinks = container.querySelectorAll('.mn-footer a');
        if (footerLinks.length >= 2) {
            footerLinks[0].textContent = t.footer.link;
            footerLinks[1].textContent = t.footer.privacy;
        }
    }

    function updatePanel(container, panelId, type) {
        const t = LANGUAGES[container.dataset.lang] || LANGUAGES.en;
        const panel = container.querySelector(`#${panelId}`);
        if (!panel) return;

        const labels = panel.querySelectorAll('.mn-group label');
        const hints = panel.querySelectorAll('.mn-group .mn-hint');
        const btn = panel.querySelector('.mn-btn');
        const resultTitle = panel.querySelector('.mn-result .mn-result-title');
        const items = panel.querySelectorAll('.mn-result .mn-item .mn-label');
        const subs = panel.querySelectorAll('.mn-result .mn-item .mn-sub');
        const formula = panel.querySelector('.mn-result .mn-formula');

        const data = t[type];
        if (!data) return;

        // Обновляем лейблы
        if (type === 'premium' && labels.length >= 2) {
            labels[0].innerHTML = `${data.visits} <span class="mn-hint">${data.visitsHint}</span>`;
            labels[1].innerHTML = `${data.time} <span class="mn-hint">${data.timeHint}</span>`;
        } else if (type === 'gamepass' && labels.length >= 2) {
            labels[0].innerHTML = `${data.ratings} <span class="mn-hint">${data.ratingsHint}</span>`;
            labels[1].innerHTML = `${data.price} <span class="mn-hint">${data.priceHint}</span>`;
        } else if (type === 'players' && labels.length >= 2) {
            labels[0].innerHTML = `${data.target} <span class="mn-hint">${data.targetHint}</span>`;
            labels[1].innerHTML = `${data.time} <span class="mn-hint">${data.timeHint}</span>`;
        } else if (type === 'payback' && labels.length >= 2) {
            labels[0].innerHTML = `${data.cost} <span class="mn-hint">${data.costHint}</span>`;
            labels[1].innerHTML = `${data.income} <span class="mn-hint">${data.incomeHint}</span>`;
        } else if (type === 'gpExtra' && labels.length >= 3) {
            labels[0].innerHTML = `${data.target} <span class="mn-hint">${data.targetHint}</span>`;
            labels[1].innerHTML = `${data.price} <span class="mn-hint">${data.priceHint}</span>`;
            labels[2].innerHTML = `${data.ratings} <span class="mn-hint">${data.ratingsHint}</span>`;
        } else if (type === 'ads' && labels.length >= 2) {
            labels[0].innerHTML = `${data.budget} <span class="mn-hint">${data.budgetHint}</span>`;
            labels[1].innerHTML = `${data.cpv} <span class="mn-hint">${data.cpvHint}</span>`;
        } else if (type === 'time' && labels.length >= 1) {
            labels[0].innerHTML = data.minutes;
        }

        if (btn) btn.innerHTML = `<i class="fas fa-calculator"></i> ${data.btn}`;
        if (resultTitle) resultTitle.textContent = data.title;
        
        if (formula && data.formula) {
            formula.innerHTML = `<i class="fas fa-info-circle"></i> ${data.formula}`;
        }

        // Обновляем лейблы результатов
        if (items.length > 0) {
            const keys = Object.keys(data);
            const labelKeys = ['robux', 'usd', 'months', 'days', 'count', 'perPass', 'visits', 'costPerVisit', 'hours', 'days', 'months'];
            items.forEach((item, i) => {
                if (i < labelKeys.length) {
                    const key = labelKeys[i];
                    if (data[key] !== undefined) {
                        item.textContent = data[key];
                    }
                }
            });
        }

        // Обновляем подписи
        if (subs.length > 0) {
            const subKeys = ['subMonth', 'subWithdraw', 'subTotal', 'subMonths', 'subDays', 'subCount', 'subPerPass', 'subVisits', 'subCost'];
            subs.forEach((sub, i) => {
                if (i < subKeys.length) {
                    const key = subKeys[i];
                    if (data[key] !== undefined) {
                        sub.textContent = data[key];
                    }
                }
            });
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

        // ===== СМЕНА ЯЗЫКА =====
        const langSelect = container.querySelector('#mnLangSelect');
        if (langSelect) {
            langSelect.addEventListener('change', function() {
                const newLang = this.value;
                CONFIG.language = newLang;
                updateLanguage(container, newLang);
            });
        }

        // ===== ВКЛАДКИ =====
        const tabs = container.querySelectorAll('.mn-tab');
        const panels = {
            premium: container.querySelector('#mnPremium'),
            gamepass: container.querySelector('#mnGamepass'),
            players: container.querySelector('#mnPlayers'),
            payback: container.querySelector('#mnPayback'),
            gpExtra: container.querySelector('#mnGpExtra'),
            ads: container.querySelector('#mnAds'),
            time: container.querySelector('#mnTime')
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

        // ============================================================
        // ===== ВСЯ ЛОГИКА (СТАРАЯ РАБОЧАЯ) =====
        // ============================================================

        // ---- 1. PREMIUM ----
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

        // ---- 2. GAME PASS ----
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

        // ---- 3. ИГРОКИ ----
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

        // ---- 4. ОКУПАЕМОСТЬ ----
        const paybackForm = container.querySelector('#mnPaybackForm');
        if (paybackForm) {
            paybackForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const cost = parseFloat(container.querySelector('#mnPaybackCost').value) || 0;
                const income = parseFloat(container.querySelector('#mnPaybackIncome').value) || 1;
                const months = cost / income;
                const days = months * 30;
                const monthsEl = container.querySelector('#mnPaybackMonths');
                const daysEl = container.querySelector('#mnPaybackDays');
                const resultEl = container.querySelector('#mnPaybackResult');
                if (monthsEl) monthsEl.textContent = months.toFixed(1);
                if (daysEl) daysEl.textContent = Math.round(days);
                if (resultEl) resultEl.classList.add('show');
            });
        }

        // ---- 5. GAME PASS'Ы (ДОП) ----
        const gpExtraForm = container.querySelector('#mnGpExtraForm');
        if (gpExtraForm) {
            gpExtraForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const target = parseFloat(container.querySelector('#mnGpExtraTarget').value) || 0;
                const price = parseFloat(container.querySelector('#mnGpExtraPrice').value) || 1;
                const ratings = parseFloat(container.querySelector('#mnGpExtraRatings').value) || 1;
                const perPass = ratings * 50 * price * 0.7;
                const count = target / perPass;
                const countEl = container.querySelector('#mnGpExtraCount');
                const perPassEl = container.querySelector('#mnGpExtraPerPass');
                const resultEl = container.querySelector('#mnGpExtraResult');
                if (countEl) countEl.textContent = Math.ceil(count).toLocaleString();
                if (perPassEl) perPassEl.textContent = '$' + ((perPass * 0.0035) - 5).toFixed(2);
                if (resultEl) resultEl.classList.add('show');
            });
        }

        // ---- 6. РЕКЛАМА ----
        const adsForm = container.querySelector('#mnAdsForm');
        if (adsForm) {
            adsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const budget = parseFloat(container.querySelector('#mnAdsBudget').value) || 0;
                const cpv = parseFloat(container.querySelector('#mnAdsCpv').value) || 0.01;
                const visits = budget / cpv;
                const costPerVisit = (budget * 0.0035) / visits;
                const visitsEl = container.querySelector('#mnAdsVisits');
                const costEl = container.querySelector('#mnAdsCostPerVisit');
                const resultEl = container.querySelector('#mnAdsResult');
                if (visitsEl) visitsEl.textContent = Math.round(visits).toLocaleString();
                if (costEl) costEl.textContent = '$' + (costPerVisit || 0).toFixed(4);
                if (resultEl) resultEl.classList.add('show');
            });
        }

        // ---- 7. КОНВЕРТЕР ВРЕМЕНИ ----
        const timeForm = container.querySelector('#mnTimeForm');
        if (timeForm) {
            timeForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const minutes = parseFloat(container.querySelector('#mnTimeMinutes').value) || 0;
                const hours = minutes / 60;
                const days = hours / 24;
                const months = days / 30;
                const hoursEl = container.querySelector('#mnTimeHours');
                const daysEl = container.querySelector('#mnTimeDays');
                const monthsEl = container.querySelector('#mnTimeMonths');
                const resultEl = container.querySelector('#mnTimeResult');
                if (hoursEl) hoursEl.textContent = hours.toFixed(1);
                if (daysEl) daysEl.textContent = days.toFixed(1);
                if (monthsEl) monthsEl.textContent = months.toFixed(1);
                if (resultEl) resultEl.classList.add('show');
            });
        }

        console.log('[Metro New Calculator] ✅ Калькулятор загружен! Язык: ' + lang);
    }

    // ===== ЗАПУСК =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalculator);
    } else {
        initCalculator();
    }

})();
