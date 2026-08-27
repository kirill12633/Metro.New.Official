/**
 * Metro New — Roblox Developer Earnings Calculator (Embed)
 * Встраиваемый калькулятор дохода разработчика Roblox
 * 
 * Исправления:
 * - DevEx rate: $0.0035 (фиксированная ставка)
 * - Убран необъяснимый -5
 * - Исправлен рекламный USD расчёт
 * - Пересмотрена модель Premium/Creator Rewards
 * - Проверка деления на ноль
 * - Исправлены ссылки href
 * - Добавлен rel="noopener noreferrer"
 * - Добавлено сохранение языка
 * - Добавлена валидация
 * - Убран глобальный mnCalculator
 * - Добавлен официальный disclaimer
 * - Добавлены aria-label
 * - Добавлены сообщения об ошибках
 * - Добавлен Enter для расчёта
 * - Показываются единицы возле результата
 * - DevEx rate как отдельная настройка
 * - Дата актуальности расчёта
 * - Разделены Robux earned и обычный баланс Robux
 * 
 * @version 3.0.0
 * @author Metro New Team
 */

(function() {
    'use strict';

    // ============================================================
    // ===== КОНФИГ =====
    // ============================================================
    const CONFIG = {
        containerId: 'roblox-calculator',
        version: '3.0.0',
        devexRate: 0.0035, // DevEx курс: 1 Robux = $0.0035
        language: detectLanguage(),
        lastUpdated: '28 августа 2026'
    };

    // ============================================================
    // ===== ДЕТЕКТИМ ЯЗЫК =====
    // ============================================================
    function detectLanguage() {
        const saved = localStorage.getItem('mn_language');
        if (saved && LANGUAGES[saved]) return saved;
        
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
    // ===== ПЕРЕВОДЫ =====
    // ============================================================
    const LANGUAGES = {
        ru: {
            name: 'Русский',
            flag: '🇷🇺',
            title: '💰 Калькулятор дохода разработчика Roblox',
            subtitle: 'от проекта Метро New',
            disclaimer: '⚠️ Все расчёты являются приблизительными и основаны на официальных формулах Roblox. Реальный доход может отличаться. Мы не гарантируем точность расчётов. Используйте информацию в ознакомительных целях.',
            lastUpdated: 'Актуально на:',
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
                robux: 'Заработано Robux',
                robuxBalance: 'Баланс Robux',
                usd: 'Доход в USD',
                subMonth: 'за месяц',
                subWithdraw: 'после DevEx',
                formula: 'Формула: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 Результат (Game Pass)',
                ratings: 'Оценок (X)',
                ratingsHint: 'под пассом',
                price: 'Цена пасса (Y)',
                priceHint: 'в Robux',
                btn: 'Рассчитать',
                robux: 'Заработано Robux',
                robuxBalance: 'Баланс Robux',
                usd: 'Доход в USD',
                subTotal: 'за всё время',
                subWithdraw: 'после DevEx',
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
                privacy: 'Конфиденциальность',
                clearData: '🗑️ Очистить сохранённые данные'
            },
            badge: 'v3.0',
            devexRate: 'Курс DevEx: 1 Robux = $0.0035',
            errors: {
                empty: '⚠️ Заполните все поля',
                zero: '⚠️ Значение не может быть равно нулю',
                negative: '⚠️ Значение не может быть отрицательным',
                invalid: '⚠️ Введите корректное число'
            }
        },
        en: {
            name: 'English',
            flag: '🇬🇧',
            title: '💰 Roblox Developer Earnings Calculator',
            subtitle: 'from Metro New project',
            disclaimer: '⚠️ All calculations are approximate and based on official Roblox formulas. Actual income may vary. We do not guarantee the accuracy of calculations. Use for informational purposes only.',
            lastUpdated: 'Last updated:',
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
                robux: 'Robux Earned',
                robuxBalance: 'Robux Balance',
                usd: 'Income in USD',
                subMonth: 'per month',
                subWithdraw: 'after DevEx',
                formula: 'Formula: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 Result (Game Pass)',
                ratings: 'Ratings (X)',
                ratingsHint: 'per pass',
                price: 'Pass price (Y)',
                priceHint: 'in Robux',
                btn: 'Calculate',
                robux: 'Robux Earned',
                robuxBalance: 'Robux Balance',
                usd: 'Income in USD',
                subTotal: 'total',
                subWithdraw: 'after DevEx',
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
                privacy: 'Privacy Policy',
                clearData: '🗑️ Clear saved data'
            },
            badge: 'v3.0',
            devexRate: 'DevEx rate: 1 Robux = $0.0035',
            errors: {
                empty: '⚠️ Please fill in all fields',
                zero: '⚠️ Value cannot be zero',
                negative: '⚠️ Value cannot be negative',
                invalid: '⚠️ Please enter a valid number'
            }
        },
        es: {
            name: 'Español',
            flag: '🇪🇸',
            title: '💰 Calculadora de Ingresos para Desarrolladores de Roblox',
            subtitle: 'del proyecto Metro New',
            disclaimer: '⚠️ Todos los cálculos son aproximados y se basan en fórmulas oficiales de Roblox. Los ingresos reales pueden variar. No garantizamos la exactitud de los cálculos. Utilice solo con fines informativos.',
            lastUpdated: 'Última actualización:',
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
                robux: 'Robux Ganados',
                robuxBalance: 'Saldo Robux',
                usd: 'Ingresos en USD',
                subMonth: 'por mes',
                subWithdraw: 'después de DevEx',
                formula: 'Fórmula: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 Resultado (Game Pass)',
                ratings: 'Calificaciones (X)',
                ratingsHint: 'por pase',
                price: 'Precio del pase (Y)',
                priceHint: 'en Robux',
                btn: 'Calcular',
                robux: 'Robux Ganados',
                robuxBalance: 'Saldo Robux',
                usd: 'Ingresos en USD',
                subTotal: 'total',
                subWithdraw: 'después de DevEx',
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
                privacy: 'Política de Privacidad',
                clearData: '🗑️ Borrar datos guardados'
            },
            badge: 'v3.0',
            devexRate: 'Tasa DevEx: 1 Robux = $0.0035',
            errors: {
                empty: '⚠️ Complete todos los campos',
                zero: '⚠️ El valor no puede ser cero',
                negative: '⚠️ El valor no puede ser negativo',
                invalid: '⚠️ Ingrese un número válido'
            }
        },
        fr: {
            name: 'Français',
            flag: '🇫🇷',
            title: '💰 Calculateur de Revenus pour Développeurs Roblox',
            subtitle: 'du projet Metro New',
            disclaimer: '⚠️ Tous les calculs sont approximatifs et basés sur les formules officielles de Roblox. Les revenus réels peuvent varier. Nous ne garantissons pas l\'exactitude des calculs. À utiliser à titre informatif uniquement.',
            lastUpdated: 'Dernière mise à jour:',
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
                robux: 'Robux Gagnés',
                robuxBalance: 'Solde Robux',
                usd: 'Revenus en USD',
                subMonth: 'par mois',
                subWithdraw: 'après DevEx',
                formula: 'Formule: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 Résultat (Game Pass)',
                ratings: 'Évaluations (X)',
                ratingsHint: 'par pass',
                price: 'Prix du pass (Y)',
                priceHint: 'en Robux',
                btn: 'Calculer',
                robux: 'Robux Gagnés',
                robuxBalance: 'Solde Robux',
                usd: 'Revenus en USD',
                subTotal: 'total',
                subWithdraw: 'après DevEx',
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
                privacy: 'Politique de Confidentialité',
                clearData: '🗑️ Effacer les données sauvegardées'
            },
            badge: 'v3.0',
            devexRate: 'Taux DevEx: 1 Robux = $0.0035',
            errors: {
                empty: '⚠️ Veuillez remplir tous les champs',
                zero: '⚠️ La valeur ne peut pas être zéro',
                negative: '⚠️ La valeur ne peut pas être négative',
                invalid: '⚠️ Veuillez entrer un nombre valide'
            }
        },
        de: {
            name: 'Deutsch',
            flag: '🇩🇪',
            title: '💰 Roblox-Entwickler-Einkommensrechner',
            subtitle: 'vom Metro New Projekt',
            disclaimer: '⚠️ Alle Berechnungen sind Näherungswerte und basieren auf offiziellen Roblox-Formeln. Die tatsächlichen Einnahmen können abweichen. Wir übernehmen keine Garantie für die Richtigkeit der Berechnungen. Nur zu Informationszwecken.',
            lastUpdated: 'Aktualisiert am:',
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
                robux: 'Robux Verdient',
                robuxBalance: 'Robux Guthaben',
                usd: 'Einkommen in USD',
                subMonth: 'pro Monat',
                subWithdraw: 'nach DevEx',
                formula: 'Formel: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 Ergebnis (Game Pass)',
                ratings: 'Bewertungen (X)',
                ratingsHint: 'pro Pass',
                price: 'Pass-Preis (Y)',
                priceHint: 'in Robux',
                btn: 'Berechnen',
                robux: 'Robux Verdient',
                robuxBalance: 'Robux Guthaben',
                usd: 'Einkommen in USD',
                subTotal: 'insgesamt',
                subWithdraw: 'nach DevEx',
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
                privacy: 'Datenschutz',
                clearData: '🗑️ Gespeicherte Daten löschen'
            },
            badge: 'v3.0',
            devexRate: 'DevEx-Kurs: 1 Robux = $0.0035',
            errors: {
                empty: '⚠️ Bitte füllen Sie alle Felder aus',
                zero: '⚠️ Der Wert darf nicht Null sein',
                negative: '⚠️ Der Wert darf nicht negativ sein',
                invalid: '⚠️ Bitte geben Sie eine gültige Zahl ein'
            }
        },
        zh: {
            name: '中文',
            flag: '🇨🇳',
            title: '💰 Roblox开发者收入计算器',
            subtitle: '来自 Metro New 项目',
            disclaimer: '⚠️ 所有计算均为近似值，基于Roblox官方公式。实际收入可能有所不同。我们不保证计算的准确性。仅供参考。',
            lastUpdated: '最后更新:',
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
                robux: '赚取Robux',
                robuxBalance: 'Robux余额',
                usd: '美元收入',
                subMonth: '每月',
                subWithdraw: 'DevEx后',
                formula: '公式: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 结果 (Game Pass)',
                ratings: '评分 (X)',
                ratingsHint: '每通行证',
                price: '通行证价格 (Y)',
                priceHint: 'Robux',
                btn: '计算',
                robux: '赚取Robux',
                robuxBalance: 'Robux余额',
                usd: '美元收入',
                subTotal: '总计',
                subWithdraw: 'DevEx后',
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
                privacy: '隐私政策',
                clearData: '🗑️ 清除保存的数据'
            },
            badge: 'v3.0',
            devexRate: 'DevEx汇率: 1 Robux = $0.0035',
            errors: {
                empty: '⚠️ 请填写所有字段',
                zero: '⚠️ 值不能为零',
                negative: '⚠️ 值不能为负数',
                invalid: '⚠️ 请输入有效数字'
            }
        },
        ja: {
            name: '日本語',
            flag: '🇯🇵',
            title: '💰 Roblox開発者収入計算機',
            subtitle: 'Metro New プロジェクトより',
            disclaimer: '⚠️ すべての計算は概算であり、Robloxの公式計算式に基づいています。実際の収入は異なる場合があります。計算の正確性は保証しません。情報提供のみを目的としています。',
            lastUpdated: '最終更新:',
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
                robux: '獲得Robux',
                robuxBalance: 'Robux残高',
                usd: 'USD収入',
                subMonth: '月間',
                subWithdraw: 'DevEx後',
                formula: '計算式: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 結果 (Game Pass)',
                ratings: '評価 (X)',
                ratingsHint: 'パスごと',
                price: 'パス価格 (Y)',
                priceHint: 'Robux',
                btn: '計算',
                robux: '獲得Robux',
                robuxBalance: 'Robux残高',
                usd: 'USD収入',
                subTotal: '合計',
                subWithdraw: 'DevEx後',
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
                privacy: 'プライバシーポリシー',
                clearData: '🗑️ 保存データを消去'
            },
            badge: 'v3.0',
            devexRate: 'DevExレート: 1 Robux = $0.0035',
            errors: {
                empty: '⚠️ すべてのフィールドを入力してください',
                zero: '⚠️ 値はゼロにできません',
                negative: '⚠️ 値は負の値にできません',
                invalid: '⚠️ 有効な数字を入力してください'
            }
        },
        ko: {
            name: '한국어',
            flag: '🇰🇷',
            title: '💰 Roblox 개발자 수익 계산기',
            subtitle: 'Metro New 프로젝트 제공',
            disclaimer: '⚠️ 모든 계산은 근사치이며 Roblox 공식 공식을 기반으로 합니다. 실제 수익은 다를 수 있습니다. 계산의 정확성을 보장하지 않습니다. 정보 제공 목적으로만 사용하십시오.',
            lastUpdated: '마지막 업데이트:',
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
                robux: '획득 Robux',
                robuxBalance: 'Robux 잔고',
                usd: 'USD 수익',
                subMonth: '월간',
                subWithdraw: 'DevEx 후',
                formula: '공식: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 결과 (Game Pass)',
                ratings: '평가 (X)',
                ratingsHint: '패스당',
                price: '패스 가격 (Y)',
                priceHint: 'Robux',
                btn: '계산',
                robux: '획득 Robux',
                robuxBalance: 'Robux 잔고',
                usd: 'USD 수익',
                subTotal: '총계',
                subWithdraw: 'DevEx 후',
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
                privacy: '개인정보 처리방침',
                clearData: '🗑️ 저장된 데이터 삭제'
            },
            badge: 'v3.0',
            devexRate: 'DevEx 환율: 1 Robux = $0.0035',
            errors: {
                empty: '⚠️ 모든 필드를 입력하세요',
                zero: '⚠️ 값은 0일 수 없습니다',
                negative: '⚠️ 값은 음수일 수 없습니다',
                invalid: '⚠️ 유효한 숫자를 입력하세요'
            }
        },
        ar: {
            name: 'العربية',
            flag: '🇸🇦',
            title: '💰 حاسبة أرباح مطوري Roblox',
            subtitle: 'من مشروع Metro New',
            disclaimer: '⚠️ جميع الحسابات تقريبية وتستند إلى الصيغ الرسمية لـ Roblox. قد يختلف الدخل الفعلي. لا نضمن دقة الحسابات. استخدم لأغراض إعلامية فقط.',
            lastUpdated: 'آخر تحديث:',
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
                robux: 'Robux المكتسبة',
                robuxBalance: 'رصيد Robux',
                usd: 'الدخل بـ USD',
                subMonth: 'شهرياً',
                subWithdraw: 'بعد DevEx',
                formula: 'الصيغة: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 النتيجة (Game Pass)',
                ratings: 'التقييمات (X)',
                ratingsHint: 'لكل باس',
                price: 'سعر الباس (Y)',
                priceHint: 'بـ Robux',
                btn: 'احسب',
                robux: 'Robux المكتسبة',
                robuxBalance: 'رصيد Robux',
                usd: 'الدخل بـ USD',
                subTotal: 'الإجمالي',
                subWithdraw: 'بعد DevEx',
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
                privacy: 'سياسة الخصوصية',
                clearData: '🗑️ مسح البيانات المحفوظة'
            },
            badge: 'v3.0',
            devexRate: 'سعر DevEx: 1 Robux = $0.0035',
            errors: {
                empty: '⚠️ الرجاء ملء جميع الحقول',
                zero: '⚠️ لا يمكن أن تكون القيمة صفراً',
                negative: '⚠️ لا يمكن أن تكون القيمة سالبة',
                invalid: '⚠️ الرجاء إدخال رقم صحيح'
            }
        },
        hi: {
            name: 'हिन्दी',
            flag: '🇮🇳',
            title: '💰 Roblox डेवलपर आय कैलकुलेटर',
            subtitle: 'Metro New प्रोजेक्ट से',
            disclaimer: '⚠️ सभी गणनाएँ अनुमानित हैं और Roblox के आधिकारिक सूत्रों पर आधारित हैं। वास्तविक आय भिन्न हो सकती है। हम गणनाओं की सटीकता की गारंटी नहीं देते हैं। केवल सूचनात्मक उद्देश्यों के लिए उपयोग करें।',
            lastUpdated: 'अंतिम अद्यतन:',
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
                robux: 'Robux अर्जित',
                robuxBalance: 'Robux शेष',
                usd: 'USD में आय',
                subMonth: 'प्रति माह',
                subWithdraw: 'DevEx के बाद',
                formula: 'सूत्र: X × 0.05 × Y × 0.001'
            },
            gamepass: {
                title: '📊 परिणाम (Game Pass)',
                ratings: 'रेटिंग (X)',
                ratingsHint: 'प्रति पास',
                price: 'पास की कीमत (Y)',
                priceHint: 'Robux में',
                btn: 'गणना करें',
                robux: 'Robux अर्जित',
                robuxBalance: 'Robux शेष',
                usd: 'USD में आय',
                subTotal: 'कुल',
                subWithdraw: 'DevEx के बाद',
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
                privacy: 'गोपनीयता नीति',
                clearData: '🗑️ सहेजे गए डेटा हटाएँ'
            },
            badge: 'v3.0',
            devexRate: 'DevEx दर: 1 Robux = $0.0035',
            errors: {
                empty: '⚠️ कृपया सभी फ़ील्ड भरें',
                zero: '⚠️ मान शून्य नहीं हो सकता',
                negative: '⚠️ मान ऋणात्मक नहीं हो सकता',
                invalid: '⚠️ कृपया एक मान्य संख्या दर्ज करें'
            }
        }
    };

    // ============================================================
    // ===== ПОЛУЧИТЬ ПЕРЕВОД =====
    // ============================================================
    function getTranslation(lang, path) {
        const parts = path.split('.');
        let current = LANGUAGES[lang] || LANGUAGES.en;
        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
            } else {
                return path;
            }
        }
        return current;
    }

    // ============================================================
    // ===== ВАЛИДАЦИЯ =====
    // ============================================================
    function validateInput(value, fieldName, lang) {
        const t = LANGUAGES[lang] || LANGUAGES.en;
        
        if (value === '' || value === null || value === undefined) {
            return { valid: false, message: t.errors.empty };
        }
        
        const num = parseFloat(value);
        if (isNaN(num)) {
            return { valid: false, message: t.errors.invalid };
        }
        
        if (num < 0) {
            return { valid: false, message: t.errors.negative };
        }
        
        if (num === 0 && fieldName !== 'cpv') {
            return { valid: false, message: t.errors.zero };
        }
        
        return { valid: true, value: num };
    }

    // ============================================================
    // ===== ФОРМАТИРОВАНИЕ ЧИСЕЛ =====
    // ============================================================
    function formatNumber(num) {
        if (num === undefined || num === null || isNaN(num)) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toFixed(1);
    }

    function formatCurrency(num) {
        if (num === undefined || num === null || isNaN(num)) return '$0.00';
        return '$' + num.toFixed(2);
    }

    // ============================================================
    // ===== СТИЛИ =====
    // ============================================================
    const styles = `
        <style>
            .mn-calculator {
                font-family: 'Montserrat', 'Segoe UI', Tahoma, sans-serif;
                max-width: 800px;
                margin: 20px auto;
                padding: 25px 30px 20px;
                background: #0d1526;
                border-radius: 20px;
                box-shadow: 0 8px 40px rgba(0,0,0,0.6);
                border: 1px solid #253460;
                color: #f2f4fa;
                background-image: radial-gradient(ellipse at 10% 20%, rgba(255,215,0,0.06) 0%, transparent 60%),
                    radial-gradient(ellipse at 90% 80%, rgba(77,148,255,0.08) 0%, transparent 60%);
            }
            .mn-calculator * { box-sizing: border-box; }
            
            /* HEADER */
            .mn-calculator .mn-header {
                display: flex;
                align-items: center;
                gap: 14px;
                margin-bottom: 16px;
                padding-bottom: 14px;
                border-bottom: 2px solid #FFD700;
                flex-wrap: wrap;
            }
            .mn-calculator .mn-header .mn-logo {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #FFD700, #e6c200);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #0d1526;
                font-weight: 800;
                font-size: 20px;
                flex-shrink: 0;
                box-shadow: 0 0 30px rgba(255,215,0,0.12);
            }
            .mn-calculator .mn-header .mn-title { flex: 1; min-width: 120px; }
            .mn-calculator .mn-header .mn-title h3 {
                margin: 0;
                font-size: 17px;
                font-weight: 700;
                background: linear-gradient(135deg, #f2f4fa 40%, #FFD700);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .mn-calculator .mn-header .mn-title p {
                margin: 2px 0 0;
                color: #a6b0cc;
                font-size: 12px;
            }
            .mn-calculator .mn-header .mn-lang-select {
                padding: 5px 10px;
                border-radius: 8px;
                background: #131c33;
                border: 1px solid #253460;
                color: #a6b0cc;
                font-size: 12px;
                cursor: pointer;
                font-family: 'Montserrat', sans-serif;
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
                background: rgba(255,215,0,0.10);
                color: #FFD700;
                padding: 3px 12px;
                border-radius: 50px;
                font-size: 10px;
                font-weight: 600;
                border: 1px solid rgba(255,215,0,0.12);
                white-space: nowrap;
            }

            /* DISCLAIMER */
            .mn-calculator .mn-disclaimer {
                background: rgba(255,215,0,0.05);
                border-left: 3px solid #FFD700;
                border-radius: 8px;
                padding: 10px 14px;
                margin-bottom: 16px;
                font-size: 12px;
                color: #a6b0cc;
                border: 1px solid rgba(255,215,0,0.06);
            }
            .mn-calculator .mn-disclaimer i { color: #FFD700; margin-right: 6px; }
            .mn-calculator .mn-disclaimer strong { color: #FFD700; }
            .mn-calculator .mn-disclaimer .mn-updated {
                display: block;
                margin-top: 4px;
                color: #4a5473;
                font-size: 11px;
            }

            /* TABS */
            .mn-calculator .mn-tabs {
                display: flex;
                gap: 5px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            .mn-calculator .mn-tab {
                padding: 7px 14px;
                border-radius: 50px;
                border: 1px solid #253460;
                background: transparent;
                cursor: pointer;
                font-weight: 600;
                font-size: 12px;
                transition: all 0.3s;
                color: #a6b0cc;
                font-family: 'Montserrat', 'Segoe UI', sans-serif;
            }
            .mn-calculator .mn-tab:hover {
                border-color: #FFD700;
                color: #f2f4fa;
                background: rgba(255,215,0,0.04);
            }
            .mn-calculator .mn-tab.active {
                background: rgba(255,215,0,0.10);
                color: #FFD700;
                border-color: #FFD700;
                box-shadow: 0 0 20px rgba(255,215,0,0.06);
            }
            .mn-calculator .mn-tab i { margin-right: 5px; }

            /* PANELS */
            .mn-calculator .mn-panel { display: none; animation: mnFadeIn 0.3s ease; }
            .mn-calculator .mn-panel.active { display: block; }
            @keyframes mnFadeIn {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* FORM */
            .mn-calculator .mn-form {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }
            .mn-calculator .mn-form .mn-full { grid-column: 1 / -1; }
            .mn-calculator .mn-group {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            .mn-calculator .mn-group label {
                font-weight: 600;
                font-size: 12px;
                color: #a6b0cc;
            }
            .mn-calculator .mn-group label .mn-hint {
                font-weight: 400;
                color: #4a5473;
                font-size: 10px;
            }
            .mn-calculator .mn-group input {
                padding: 9px 12px;
                border-radius: 8px;
                border: 1px solid #253460;
                background: #131c33;
                color: #f2f4fa;
                font-size: 13px;
                transition: all 0.3s;
                font-family: 'Montserrat', sans-serif;
                width: 100%;
            }
            .mn-calculator .mn-group input:focus {
                outline: none;
                border-color: #FFD700;
                box-shadow: 0 0 0 3px rgba(255,215,0,0.06);
                background: #182444;
            }
            .mn-calculator .mn-group input::placeholder { color: #4a5473; }
            .mn-calculator .mn-group .mn-error {
                color: #f28b82;
                font-size: 11px;
                margin-top: 2px;
                display: none;
            }
            .mn-calculator .mn-group .mn-error.show { display: block; }
            .mn-calculator .mn-group.has-error input {
                border-color: #f28b82;
            }

            /* BUTTON */
            .mn-calculator .mn-btn {
                padding: 11px 20px;
                border-radius: 10px;
                border: none;
                background: linear-gradient(135deg, #FFD700, #e6c200);
                color: #0d1526;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s;
                font-family: 'Montserrat', sans-serif;
                width: 100%;
                margin-top: 2px;
                box-shadow: 0 4px 20px rgba(255,215,0,0.10);
            }
            .mn-calculator .mn-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 30px rgba(255,215,0,0.18);
            }
            .mn-calculator .mn-btn:active { transform: translateY(0); }
            .mn-calculator .mn-btn i { margin-right: 6px; }

            /* RESULT */
            .mn-calculator .mn-result {
                margin-top: 16px;
                padding: 16px 18px;
                border-radius: 10px;
                background: rgba(255,215,0,0.03);
                border: 1px solid rgba(255,215,0,0.08);
                display: none;
            }
            .mn-calculator .mn-result.show { display: block; animation: mnFadeIn 0.4s ease; }
            .mn-calculator .mn-result .mn-result-title {
                font-size: 14px;
                font-weight: 700;
                color: #FFD700;
                margin-bottom: 8px;
            }
            .mn-calculator .mn-result .mn-values {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                gap: 10px;
            }
            .mn-calculator .mn-result .mn-item {
                background: #131c33;
                border-radius: 8px;
                padding: 10px 14px;
                text-align: center;
                border: 1px solid #253460;
            }
            .mn-calculator .mn-result .mn-item .mn-label {
                color: #4a5473;
                font-size: 10px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            .mn-calculator .mn-result .mn-item .mn-value {
                font-size: 20px;
                font-weight: 800;
                color: #f2f4fa;
                margin-top: 2px;
            }
            .mn-calculator .mn-result .mn-item .mn-value.mn-robux { color: #FFD700; }
            .mn-calculator .mn-result .mn-item .mn-value.mn-usd { color: #34a853; }
            .mn-calculator .mn-result .mn-item .mn-value.mn-green { color: #34a853; }
            .mn-calculator .mn-result .mn-item .mn-value.mn-orange { color: #f39c12; }
            .mn-calculator .mn-result .mn-item .mn-sub {
                font-size: 10px;
                color: #4a5473;
            }
            .mn-calculator .mn-result .mn-formula {
                font-size: 11px;
                color: #4a5473;
                margin-top: 8px;
                text-align: center;
            }
            .mn-calculator .mn-result .mn-formula strong { color: #a6b0cc; }
            .mn-calculator .mn-result .mn-devex-info {
                font-size: 10px;
                color: #4a5473;
                text-align: center;
                margin-top: 6px;
            }

            /* FOOTER */
            .mn-calculator .mn-footer {
                margin-top: 14px;
                padding-top: 12px;
                border-top: 1px solid #253460;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 6px;
                font-size: 11px;
                color: #4a5473;
            }
            .mn-calculator .mn-footer a {
                color: #a6b0cc;
                text-decoration: none;
                font-weight: 500;
                transition: color 0.3s;
            }
            .mn-calculator .mn-footer a:hover { color: #FFD700; }
            .mn-calculator .mn-footer .mn-clear-btn {
                background: transparent;
                border: none;
                color: #4a5473;
                cursor: pointer;
                font-size: 11px;
                font-family: 'Montserrat', sans-serif;
                transition: color 0.3s;
            }
            .mn-calculator .mn-footer .mn-clear-btn:hover { color: #f28b82; }

            /* RESPONSIVE */
            @media (max-width: 600px) {
                .mn-calculator { padding: 14px 12px; margin: 8px; }
                .mn-calculator .mn-form { grid-template-columns: 1fr; }
                .mn-calculator .mn-tab { font-size: 11px; padding: 5px 10px; }
                .mn-calculator .mn-result .mn-values { grid-template-columns: 1fr 1fr; }
                .mn-calculator .mn-header .mn-title h3 { font-size: 14px; }
                .mn-calculator .mn-header .mn-lang-select { font-size: 11px; padding: 4px 8px; }
            }
            @media (max-width: 400px) {
                .mn-calculator .mn-result .mn-values { grid-template-columns: 1fr; }
                .mn-calculator .mn-badge { font-size: 9px; padding: 2px 8px; }
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
                    <div class="mn-logo" aria-label="Metro New Logo">M</div>
                    <div class="mn-title">
                        <h3>${t.title}</h3>
                        <p>${t.subtitle}</p>
                    </div>
                    <select class="mn-lang-select" id="mnLangSelect" aria-label="Выберите язык / Select language">
                        ${langOptions}
                    </select>
                    <span class="mn-badge">${t.badge}</span>
                </div>

                <div class="mn-disclaimer">
                    <i class="fas fa-info-circle"></i>
                    ${t.disclaimer}
                    <span class="mn-updated">${t.lastUpdated} ${CONFIG.lastUpdated}</span>
                </div>

                <div class="mn-tabs" id="mnTabs" role="tablist">
                    <button class="mn-tab active" data-tab="premium" role="tab" aria-selected="true">
                        <i class="fas fa-crown"></i> ${t.tabs.premium}
                    </button>
                    <button class="mn-tab" data-tab="gamepass" role="tab" aria-selected="false">
                        <i class="fas fa-ticket"></i> ${t.tabs.gamepass}
                    </button>
                    <button class="mn-tab" data-tab="players" role="tab" aria-selected="false">
                        <i class="fas fa-users"></i> ${t.tabs.players}
                    </button>
                    <button class="mn-tab" data-tab="payback" role="tab" aria-selected="false">
                        <i class="fas fa-clock"></i> ${t.tabs.payback}
                    </button>
                    <button class="mn-tab" data-tab="gpExtra" role="tab" aria-selected="false">
                        <i class="fas fa-ticket"></i> ${t.tabs.gpExtra}
                    </button>
                    <button class="mn-tab" data-tab="ads" role="tab" aria-selected="false">
                        <i class="fas fa-ad"></i> ${t.tabs.ads}
                    </button>
                    <button class="mn-tab" data-tab="time" role="tab" aria-selected="false">
                        <i class="fas fa-hourglass-half"></i> ${t.tabs.time}
                    </button>
                </div>

                <!-- PREMIUM -->
                <div class="mn-panel active" id="mnPremium" role="tabpanel">
                    <form class="mn-form" id="mnPremiumForm" novalidate>
                        <div class="mn-group">
                            <label for="mnPremiumVisits">${t.premium.visits} <span class="mn-hint">${t.premium.visitsHint}</span></label>
                            <input type="number" id="mnPremiumVisits" placeholder="100000" min="0" step="1" value="100000" aria-required="true">
                            <span class="mn-error" id="mnPremiumVisitsError"></span>
                        </div>
                        <div class="mn-group">
                            <label for="mnPremiumTime">${t.premium.time} <span class="mn-hint">${t.premium.timeHint}</span></label>
                            <input type="number" id="mnPremiumTime" placeholder="20" min="0" step="0.1" value="20" aria-required="true">
                            <span class="mn-error" id="mnPremiumTimeError"></span>
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
                                <div class="mn-label">${t.premium.robuxBalance}</div>
                                <div class="mn-value" id="mnPremiumBalance" style="color:#a6b0cc;">0</div>
                                <div class="mn-sub">${t.premium.subMonth}</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.premium.usd}</div>
                                <div class="mn-value mn-usd" id="mnPremiumUsd">$0.00</div>
                                <div class="mn-sub">${t.premium.subWithdraw}</div>
                            </div>
                        </div>
                        <div class="mn-formula"><i class="fas fa-info-circle"></i> ${t.premium.formula}</div>
                        <div class="mn-devex-info">${t.devexRate}</div>
                    </div>
                </div>

                <!-- GAME PASS -->
                <div class="mn-panel" id="mnGamepass" role="tabpanel">
                    <form class="mn-form" id="mnGamepassForm" novalidate>
                        <div class="mn-group">
                            <label for="mnGamepassRatings">${t.gamepass.ratings} <span class="mn-hint">${t.gamepass.ratingsHint}</span></label>
                            <input type="number" id="mnGamepassRatings" placeholder="200" min="0" step="1" value="200" aria-required="true">
                            <span class="mn-error" id="mnGamepassRatingsError"></span>
                        </div>
                        <div class="mn-group">
                            <label for="mnGamepassPrice">${t.gamepass.price} <span class="mn-hint">${t.gamepass.priceHint}</span></label>
                            <input type="number" id="mnGamepassPrice" placeholder="100" min="0" step="1" value="100" aria-required="true">
                            <span class="mn-error" id="mnGamepassPriceError"></span>
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
                                <div class="mn-label">${t.gamepass.robuxBalance}</div>
                                <div class="mn-value" id="mnGamepassBalance" style="color:#a6b0cc;">0</div>
                                <div class="mn-sub">${t.gamepass.subTotal}</div>
                            </div>
                            <div class="mn-item">
                                <div class="mn-label">${t.gamepass.usd}</div>
                                <div class="mn-value mn-usd" id="mnGamepassUsd">$0.00</div>
                                <div class="mn-sub">${t.gamepass.subWithdraw}</div>
                            </div>
                        </div>
                        <div class="mn-formula"><i class="fas fa-info-circle"></i> ${t.gamepass.formula}</div>
                        <div class="mn-devex-info">${t.devexRate}</div>
                    </div>
                </div>

                <!-- PLAYERS -->
                <div class="mn-panel" id="mnPlayers" role="tabpanel">
                    <form class="mn-form" id="mnPlayersForm" novalidate>
                        <div class="mn-group">
                            <label for="mnPlayersTarget">${t.players.target} <span class="mn-hint">${t.players.targetHint}</span></label>
                            <input type="number" id="mnPlayersTarget" placeholder="10000" min="0" step="1" value="10000" aria-required="true">
                            <span class="mn-error" id="mnPlayersTargetError"></span>
                        </div>
                        <div class="mn-group">
                            <label for="mnPlayersTime">${t.players.time} <span class="mn-hint">${t.players.timeHint}</span></label>
                            <input type="number" id="mnPlayersTime" placeholder="20" min="0" step="0.1" value="20" aria-required="true">
                            <span class="mn-error" id="mnPlayersTimeError"></span>
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
                                <div class="mn-value mn-robux" id="mnPlayersNeeded" style="font-size: 28px;">0</div>
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
                        <div class="mn-formula"><i class="fas fa-info-circle"></i> ${t.players.formula}</div>
                    </div>
                </div>

                <!-- PAYBACK -->
                <div class="mn-panel" id="mnPayback" role="tabpanel">
                    <form class="mn-form" id="mnPaybackForm" novalidate>
                        <div class="mn-group">
                            <label for="mnPaybackCost">${t.payback.cost} <span class="mn-hint">${t.payback.costHint}</span></label>
                            <input type="number" id="mnPaybackCost" placeholder="50000" min="0" step="1" value="50000" aria-required="true">
                            <span class="mn-error" id="mnPaybackCostError"></span>
                        </div>
                        <div class="mn-group">
                            <label for="mnPaybackIncome">${t.payback.income} <span class="mn-hint">${t.payback.incomeHint}</span></label>
                            <input type="number" id="mnPaybackIncome" placeholder="10000" min="0" step="1" value="10000" aria-required="true">
                            <span class="mn-error" id="mnPaybackIncomeError"></span>
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

                <!-- GP EXTRA -->
                <div class="mn-panel" id="mnGpExtra" role="tabpanel">
                    <form class="mn-form" id="mnGpExtraForm" novalidate>
                        <div class="mn-group">
                            <label for="mnGpExtraTarget">${t.gpExtra.target} <span class="mn-hint">${t.gpExtra.targetHint}</span></label>
                            <input type="number" id="mnGpExtraTarget" placeholder="100000" min="0" step="1" value="100000" aria-required="true">
                            <span class="mn-error" id="mnGpExtraTargetError"></span>
                        </div>
                        <div class="mn-group">
                            <label for="mnGpExtraPrice">${t.gpExtra.price} <span class="mn-hint">${t.gpExtra.priceHint}</span></label>
                            <input type="number" id="mnGpExtraPrice" placeholder="100" min="0" step="1" value="100" aria-required="true">
                            <span class="mn-error" id="mnGpExtraPriceError"></span>
                        </div>
                        <div class="mn-group">
                            <label for="mnGpExtraRatings">${t.gpExtra.ratings} <span class="mn-hint">${t.gpExtra.ratingsHint}</span></label>
                            <input type="number" id="mnGpExtraRatings" placeholder="50" min="0" step="1" value="50" aria-required="true">
                            <span class="mn-error" id="mnGpExtraRatingsError"></span>
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
                                <div class="mn-value mn-usd" id="mnGpExtraPerPass">$0.00</div>
                                <div class="mn-sub">${t.gpExtra.subPerPass}</div>
                            </div>
                        </div>
                        <div class="mn-devex-info">${t.devexRate}</div>
                    </div>
                </div>

                <!-- ADS -->
                <div class="mn-panel" id="mnAds" role="tabpanel">
                    <form class="mn-form" id="mnAdsForm" novalidate>
                        <div class="mn-group">
                            <label for="mnAdsBudget">${t.ads.budget} <span class="mn-hint">${t.ads.budgetHint}</span></label>
                            <input type="number" id="mnAdsBudget" placeholder="10000" min="0" step="1" value="10000" aria-required="true">
                            <span class="mn-error" id="mnAdsBudgetError"></span>
                        </div>
                        <div class="mn-group">
                            <label for="mnAdsCpv">${t.ads.cpv} <span class="mn-hint">${t.ads.cpvHint}</span></label>
                            <input type="number" id="mnAdsCpv" placeholder="0.5" min="0" step="0.01" value="0.5" aria-required="true">
                            <span class="mn-error" id="mnAdsCpvError"></span>
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
                                <div class="mn-value mn-orange" id="mnAdsCostPerVisit">$0.0000</div>
                                <div class="mn-sub">${t.ads.subCost}</div>
                            </div>
                        </div>
                        <div class="mn-devex-info">${t.devexRate}</div>
                    </div>
                </div>

                <!-- TIME CONVERTER -->
                <div class="mn-panel" id="mnTime" role="tabpanel">
                    <form class="mn-form" id="mnTimeForm" novalidate>
                        <div class="mn-group">
                            <label for="mnTimeMinutes">${t.time.minutes}</label>
                            <input type="number" id="mnTimeMinutes" placeholder="10000" min="0" step="1" value="10000" aria-required="true">
                            <span class="mn-error" id="mnTimeMinutesError"></span>
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
                        <a href="https://kirill12633.github.io/Metro.New.Official/ru/tools/roblox-calculator/" target="_blank" rel="noopener noreferrer">
                            ${t.footer.link}
                        </a>
                    </span>
                    <span>
                        <i class="fas fa-info-circle"></i>
                        <a href="https://kirill12633.github.io/Metro.New.Official/ru/help/privacy-policy/" target="_blank" rel="noopener noreferrer">
                            ${t.footer.privacy}
                        </a>
                    </span>
                    <button class="mn-clear-btn" id="mnClearData" aria-label="Очистить сохранённые данные / Clear saved data">
                        ${t.footer.clearData}
                    </button>
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
        localStorage.setItem('mn_language', lang);

        const select = container.querySelector('#mnLangSelect');
        if (select) select.value = lang;

        const badge = container.querySelector('.mn-badge');
        if (badge) badge.textContent = t.badge;

        const title = container.querySelector('.mn-header .mn-title h3');
        const subtitle = container.querySelector('.mn-header .mn-title p');
        if (title) title.textContent = t.title;
        if (subtitle) subtitle.textContent = t.subtitle;

        const disclaimer = container.querySelector('.mn-disclaimer');
        if (disclaimer) {
            const text = disclaimer.querySelector('i')?.nextSibling;
            if (text) text.textContent = ' ' + t.disclaimer;
            const updated = disclaimer.querySelector('.mn-updated');
            if (updated) updated.textContent = t.lastUpdated + ' ' + CONFIG.lastUpdated;
        }

        // Обновляем вкладки
        const tabs = container.querySelectorAll('.mn-tab');
        const tabKeys = ['premium', 'gamepass', 'players', 'payback', 'gpExtra', 'ads', 'time'];
        const iconMap = {
            'premium': 'fa-crown',
            'gamepass': 'fa-ticket',
            'players': 'fa-users',
            'payback': 'fa-clock',
            'gpExtra': 'fa-ticket',
            'ads': 'fa-ad',
            'time': 'fa-hourglass-half'
        };
        tabs.forEach((tab, i) => {
            if (i < tabKeys.length) {
                const key = tabKeys[i];
                tab.innerHTML = `<i class="fas ${iconMap[key]}"></i> ${t.tabs[key]}`;
            }
        });

        // Обновляем панели
        const panelIds = ['mnPremium', 'mnGamepass', 'mnPlayers', 'mnPayback', 'mnGpExtra', 'mnAds', 'mnTime'];
        const panelTypes = ['premium', 'gamepass', 'players', 'payback', 'gpExtra', 'ads', 'time'];
        panelIds.forEach((id, i) => {
            updatePanel(container, id, panelTypes[i], lang);
        });

        // Футер
        const footerLinks = container.querySelectorAll('.mn-footer a');
        if (footerLinks.length >= 2) {
            footerLinks[0].textContent = t.footer.link;
            footerLinks[1].textContent = t.footer.privacy;
        }
        const clearBtn = container.querySelector('#mnClearData');
        if (clearBtn) clearBtn.textContent = t.footer.clearData;

        // Обновляем devex info
        container.querySelectorAll('.mn-devex-info').forEach(el => {
            el.textContent = t.devexRate;
        });
    }

    function updatePanel(container, panelId, type, lang) {
        const t = LANGUAGES[lang] || LANGUAGES.en;
        const panel = container.querySelector(`#${panelId}`);
        if (!panel) return;

        const data = t[type];
        if (!data) return;

        // Обновляем лейблы формы
        const labels = panel.querySelectorAll('.mn-group label');
        const inputs = panel.querySelectorAll('.mn-group input');
        const btn = panel.querySelector('.mn-btn');
        const resultTitle = panel.querySelector('.mn-result .mn-result-title');
        const items = panel.querySelectorAll('.mn-result .mn-item .mn-label');
        const subs = panel.querySelectorAll('.mn-result .mn-item .mn-sub');
        const formula = panel.querySelector('.mn-result .mn-formula');
        const devexInfo = panel.querySelector('.mn-devex-info');

        // Обновляем лейблы в зависимости от типа
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

        // Обновляем плейсхолдеры
        const placeholders = {
            'premium': ['100000', '20'],
            'gamepass': ['200', '100'],
            'players': ['10000', '20'],
            'payback': ['50000', '10000'],
            'gpExtra': ['100000', '100', '50'],
            'ads': ['10000', '0.5'],
            'time': ['10000']
        };
        if (placeholders[type]) {
            inputs.forEach((input, i) => {
                if (i < placeholders[type].length) {
                    input.placeholder = placeholders[type][i];
                }
            });
        }

        if (btn) btn.innerHTML = `<i class="fas fa-calculator"></i> ${data.btn}`;
        if (resultTitle) resultTitle.textContent = data.title;
        if (formula && data.formula) {
            formula.innerHTML = `<i class="fas fa-info-circle"></i> ${data.formula}`;
        }
        if (devexInfo && data.devexRate) {
            devexInfo.textContent = data.devexRate;
        }

        // Обновляем лейблы результатов
        const labelMap = {
            'premium': ['robux', 'robuxBalance', 'usd'],
            'gamepass': ['robux', 'robuxBalance', 'usd'],
            'players': ['visitsPerMonth', 'perDay', 'perHour'],
            'payback': ['months', 'days'],
            'gpExtra': ['count', 'perPass'],
            'ads': ['visits', 'costPerVisit'],
            'time': ['hours', 'days', 'months']
        };
        if (labelMap[type]) {
            items.forEach((item, i) => {
                if (i < labelMap[type].length) {
                    const key = labelMap[type][i];
                    if (data[key] !== undefined) {
                        item.textContent = data[key];
                    }
                }
            });
        }

        // Обновляем подписи
        const subMap = {
            'premium': ['subMonth', 'subMonth', 'subWithdraw'],
            'gamepass': ['subTotal', 'subTotal', 'subWithdraw'],
            'players': ['', '', ''],
            'payback': ['subMonths', 'subDays'],
            'gpExtra': ['subCount', 'subPerPass'],
            'ads': ['subVisits', 'subCost'],
            'time': ['', '', '']
        };
        if (subMap[type]) {
            subs.forEach((sub, i) => {
                if (i < subMap[type].length) {
                    const key = subMap[type][i];
                    if (key && data[key] !== undefined) {
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
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                const target = this.dataset.tab;
                Object.keys(panels).forEach(key => {
                    if (panels[key]) {
                        panels[key].classList.toggle('active', key === target);
                    }
                });
            });
        });

        // ============================================================
        // ===== ВСЯ ЛОГИКА С ВАЛИДАЦИЕЙ =====
        // ============================================================

        // ---- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----
        function showError(inputId, errorId, message) {
            const errorEl = document.getElementById(errorId);
            const inputEl = document.getElementById(inputId);
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.classList.add('show');
            }
            if (inputEl) {
                inputEl.closest('.mn-group')?.classList.add('has-error');
            }
        }

        function clearError(inputId, errorId) {
            const errorEl = document.getElementById(errorId);
            const inputEl = document.getElementById(inputId);
            if (errorEl) errorEl.classList.remove('show');
            if (inputEl) {
                inputEl.closest('.mn-group')?.classList.remove('has-error');
            }
        }

        function clearAllErrors(container) {
            container.querySelectorAll('.mn-error').forEach(el => el.classList.remove('show'));
            container.querySelectorAll('.mn-group').forEach(el => el.classList.remove('has-error'));
        }

        function getValidatedValue(inputId, errorId, lang, allowZero = false) {
            const input = document.getElementById(inputId);
            if (!input) return null;
            
            const value = input.value.trim();
            const validation = validateInput(value, inputId, lang);
            
            if (!validation.valid) {
                showError(inputId, errorId, validation.message);
                return null;
            }
            
            if (!allowZero && validation.value === 0) {
                showError(inputId, errorId, LANGUAGES[lang].errors.zero);
                return null;
            }
            
            clearError(inputId, errorId);
            return validation.value;
        }

        // ---- 1. PREMIUM ----
        const premiumForm = container.querySelector('#mnPremiumForm');
        if (premiumForm) {
            premiumForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const lang = container.dataset.lang || 'en';
                clearAllErrors(container);

                const visits = getValidatedValue('mnPremiumVisits', 'mnPremiumVisitsError', lang);
                const time = getValidatedValue('mnPremiumTime', 'mnPremiumTimeError', lang);

                if (visits === null || time === null) return;

                const robuxEarned = visits * 0.05 * time * 0.001;
                const robuxBalance = robuxEarned * 0.3; // Roblox забирает 70%
                const usd = robuxEarned * CONFIG.devexRate;

                document.getElementById('mnPremiumRobux').textContent = Math.round(robuxEarned).toLocaleString();
                document.getElementById('mnPremiumBalance').textContent = Math.round(robuxBalance).toLocaleString();
                document.getElementById('mnPremiumUsd').textContent = formatCurrency(usd);
                document.getElementById('mnPremiumResult').classList.add('show');
            });
        }

        // ---- 2. GAME PASS ----
        const gamepassForm = container.querySelector('#mnGamepassForm');
        if (gamepassForm) {
            gamepassForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const lang = container.dataset.lang || 'en';
                clearAllErrors(container);

                const ratings = getValidatedValue('mnGamepassRatings', 'mnGamepassRatingsError', lang);
                const price = getValidatedValue('mnGamepassPrice', 'mnGamepassPriceError', lang);

                if (ratings === null || price === null) return;

                const robuxEarned = ratings * 50 * price * 0.7;
                const robuxBalance = robuxEarned * 0.3;
                const usd = robuxEarned * CONFIG.devexRate;

                document.getElementById('mnGamepassRobux').textContent = Math.round(robuxEarned).toLocaleString();
                document.getElementById('mnGamepassBalance').textContent = Math.round(robuxBalance).toLocaleString();
                document.getElementById('mnGamepassUsd').textContent = formatCurrency(usd);
                document.getElementById('mnGamepassResult').classList.add('show');
            });
        }

        // ---- 3. PLAYERS ----
        const playersForm = container.querySelector('#mnPlayersForm');
        if (playersForm) {
            playersForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const lang = container.dataset.lang || 'en';
                clearAllErrors(container);

                const target = getValidatedValue('mnPlayersTarget', 'mnPlayersTargetError', lang);
                const time = getValidatedValue('mnPlayersTime', 'mnPlayersTimeError', lang);

                if (target === null || time === null) return;

                if (time === 0) {
                    showError('mnPlayersTime', 'mnPlayersTimeError', LANGUAGES[lang].errors.zero);
                    return;
                }

                const needed = target / (0.05 * time * 0.001);
                const perDay = needed / 30;
                const perHour = perDay / 24;

                document.getElementById('mnPlayersNeeded').textContent = Math.round(needed).toLocaleString();
                document.getElementById('mnPlayersDay').textContent = Math.round(perDay).toLocaleString();
                document.getElementById('mnPlayersHour').textContent = Math.round(perHour).toLocaleString();
                document.getElementById('mnPlayersResult').classList.add('show');
            });
        }

        // ---- 4. PAYBACK ----
        const paybackForm = container.querySelector('#mnPaybackForm');
        if (paybackForm) {
            paybackForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const lang = container.dataset.lang || 'en';
                clearAllErrors(container);

                const cost = getValidatedValue('mnPaybackCost', 'mnPaybackCostError', lang);
                const income = getValidatedValue('mnPaybackIncome', 'mnPaybackIncomeError', lang);

                if (cost === null || income === null) return;

                if (income === 0) {
                    showError('mnPaybackIncome', 'mnPaybackIncomeError', LANGUAGES[lang].errors.zero);
                    return;
                }

                const months = cost / income;
                const days = months * 30;

                document.getElementById('mnPaybackMonths').textContent = months.toFixed(1);
                document.getElementById('mnPaybackDays').textContent = Math.round(days);
                document.getElementById('mnPaybackResult').classList.add('show');
            });
        }

        // ---- 5. GP EXTRA ----
        const gpExtraForm = container.querySelector('#mnGpExtraForm');
        if (gpExtraForm) {
            gpExtraForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const lang = container.dataset.lang || 'en';
                clearAllErrors(container);

                const target = getValidatedValue('mnGpExtraTarget', 'mnGpExtraTargetError', lang);
                const price = getValidatedValue('mnGpExtraPrice', 'mnGpExtraPriceError', lang);
                const ratings = getValidatedValue('mnGpExtraRatings', 'mnGpExtraRatingsError', lang);

                if (target === null || price === null || ratings === null) return;

                if (price === 0) {
                    showError('mnGpExtraPrice', 'mnGpExtraPriceError', LANGUAGES[lang].errors.zero);
                    return;
                }

                const perPass = ratings * 50 * price * 0.7;
                const count = perPass > 0 ? target / perPass : 0;

                document.getElementById('mnGpExtraCount').textContent = Math.ceil(count).toLocaleString();
                document.getElementById('mnGpExtraPerPass').textContent = formatCurrency(perPass * CONFIG.devexRate);
                document.getElementById('mnGpExtraResult').classList.add('show');
            });
        }

        // ---- 6. ADS ----
        const adsForm = container.querySelector('#mnAdsForm');
        if (adsForm) {
            adsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const lang = container.dataset.lang || 'en';
                clearAllErrors(container);

                const budget = getValidatedValue('mnAdsBudget', 'mnAdsBudgetError', lang);
                const cpv = getValidatedValue('mnAdsCpv', 'mnAdsCpvError', lang, true);

                if (budget === null || cpv === null) return;

                if (cpv === 0) {
                    showError('mnAdsCpv', 'mnAdsCpvError', LANGUAGES[lang].errors.zero);
                    return;
                }

                const visits = budget / cpv;
                const costPerVisit = (budget * CONFIG.devexRate) / visits;

                document.getElementById('mnAdsVisits').textContent = Math.round(visits).toLocaleString();
                document.getElementById('mnAdsCostPerVisit').textContent = formatCurrency(costPerVisit || 0);
                document.getElementById('mnAdsResult').classList.add('show');
            });
        }

        // ---- 7. TIME CONVERTER ----
        const timeForm = container.querySelector('#mnTimeForm');
        if (timeForm) {
            timeForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const lang = container.dataset.lang || 'en';
                clearAllErrors(container);

                const minutes = getValidatedValue('mnTimeMinutes', 'mnTimeMinutesError', lang, true);

                if (minutes === null) return;

                const hours = minutes / 60;
                const days = hours / 24;
                const months = days / 30;

                document.getElementById('mnTimeHours').textContent = hours.toFixed(1);
                document.getElementById('mnTimeDays').textContent = days.toFixed(1);
                document.getElementById('mnTimeMonths').textContent = months.toFixed(1);
                document.getElementById('mnTimeResult').classList.add('show');
            });
        }

        // ---- ОЧИСТКА ДАННЫХ ----
        const clearBtn = container.querySelector('#mnClearData');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                const lang = container.dataset.lang || 'en';
                const t = LANGUAGES[lang] || LANGUAGES.en;
                if (confirm('Очистить все сохранённые данные? / Clear all saved data?')) {
                    const keys = ['mn_language', 'mn_settings', 'mn_history', 'mn_theme'];
                    keys.forEach(key => localStorage.removeItem(key));
                    // Сброс полей
                    container.querySelectorAll('.mn-group input').forEach(input => {
                        input.value = '';
                    });
                    // Скрыть результаты
                    container.querySelectorAll('.mn-result').forEach(el => el.classList.remove('show'));
                    // Очистить ошибки
                    clearAllErrors(container);
                    // Сброс языка
                    CONFIG.language = detectLanguage();
                    updateLanguage(container, CONFIG.language);
                    // Уведомление
                    const msg = document.createElement('div');
                    msg.style.cssText = `
                        background: rgba(52,168,83,0.15);
                        border: 1px solid #34a853;
                        color: #34a853;
                        padding: 10px 16px;
                        border-radius: 8px;
                        font-size: 13px;
                        margin-top: 10px;
                        text-align: center;
                    `;
                    msg.textContent = '✅ Данные очищены! / Data cleared!';
                    container.appendChild(msg);
                    setTimeout(() => msg.remove(), 3000);
                }
            });
        }

        // ---- УБИРАЕМ ГЛОБАЛЬНЫЙ mnCalculator ----
        // Всё внутри IIFE, ничего не попадает в глобальный scope

        console.log('[Metro New Calculator] ✅ Калькулятор загружен! Язык: ' + lang + ', версия: ' + CONFIG.version);
        console.log('[Metro New Calculator] 📅 Актуально на: ' + CONFIG.lastUpdated);
        console.log('[Metro New Calculator] 💰 DevEx rate: 1 Robux = $' + CONFIG.devexRate);
    }

    // ===== ЗАПУСК =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalculator);
    } else {
        initCalculator();
    }

})();
