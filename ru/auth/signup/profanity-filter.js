// ============================================
// ФИЛЬТР МАТОВ И НЕЦЕНЗУРНОЙ ЛЕКСИКИ
// ============================================

const ProfanityFilter = {
    // ========== ЧЕРНЫЙ СПИСОК ==========
    // Добавляй сюда слова (фильтр сам найдет все варианты)
    blacklist: [
        // РУССКИЕ МАТЫ (основные)
        'хуй', 'пизда', 'еблан', 'мудак', 'гандон', 'шлюха',
        'блядь', 'сука', 'пидор', 'лох', 'чмо', 'мразь',
        'тварь', 'уебок', 'залупа', 'пиздец', 'хуйня',
        'долбоеб', 'ебать', 'ебанутый', 'распиздяй',
        'очкошник', 'гомик', 'петух', 'педик', 'хитровыебанный',
        
        // АНГЛИЙСКИЕ
        'fuck', 'shit', 'bitch', 'asshole', 'dick',
        'pussy', 'cunt', 'nigger', 'faggot', 'motherfucker',
        
        // ОСКОРБЛЕНИЯ
        'дебил', 'идиот', 'кретин', 'даун', 'имбецил',
        'тупой', 'глупый', 'ничтожество', 'урод',
        'выродок', 'недоумок', 'придурок', 'дурак',
        
        // ДОБАВЬ СВОИ СЛОВА СЮДА
        // 'слово1', 'слово2', 'слово3'
    ],

    // ========== НАСТРОЙКИ ==========
    options: {
        // Проверять в середине слов (хуй найдет в "полухуй")
        checkSubstrings: true,
        
        // Игнорировать регистр (ХуЙ = хуй)
        ignoreCase: true,
        
        // Проверять транслит (fuck = фак)
        checkTranslit: true,
        
        // Проверять цифры вместо букв (0=о, 4=ч)
        checkLeet: true,
        
        // Минимальная длина слова
        minWordLength: 3,
        
        // Режим: 'strict' - блокировать, 'warn' - предупреждать
        mode: 'strict'
    },

    // ========== ОСНОВНАЯ ПРОВЕРКА ==========
    check(text) {
        if (!text || text.length < this.options.minWordLength) {
            return { 
                hasProfanity: false, 
                foundWords: [],
                cleanText: text 
            };
        }

        const foundWords = [];
        let testText = text;

        // Приводим к нижнему регистру
        if (this.options.ignoreCase) {
            testText = testText.toLowerCase();
        }

        // Разбиваем на слова
        const words = testText.split(/[\s\.\,\!\?\-\_]+/);

        for (let word of words) {
            if (word.length < this.options.minWordLength) continue;

            // Проверяем слово
            const checkResult = this.checkWord(word);
            if (checkResult.found) {
                foundWords.push(word);
                
                if (this.options.mode === 'strict') {
                    return {
                        hasProfanity: true,
                        foundWords: foundWords,
                        cleanText: this.censor(text, foundWords),
                        message: '❌ Обнаружены запрещенные слова'
                    };
                }
            }
        }

        return {
            hasProfanity: foundWords.length > 0,
            foundWords: foundWords,
            cleanText: foundWords.length > 0 ? this.censor(text, foundWords) : text,
            message: foundWords.length > 0 ? '⚠️ Есть подозрительные слова' : '✅ Текст чист'
        };
    },

    // ========== ПРОВЕРКА ОДНОГО СЛОВА ==========
    checkWord(word) {
        // Прямая проверка
        for (let badWord of this.blacklist) {
            if (this.options.checkSubstrings) {
                if (word.includes(badWord.toLowerCase())) {
                    return { found: true, word: badWord };
                }
            } else {
                if (word === badWord.toLowerCase()) {
                    return { found: true, word: badWord };
                }
            }
        }

        // Проверка транслита
        if (this.options.checkTranslit) {
            const translitWord = this.convertTranslit(word);
            for (let badWord of this.blacklist) {
                if (translitWord.includes(badWord.toLowerCase())) {
                    return { found: true, word: badWord };
                }
            }
        }

        // Проверка leet (цифры)
        if (this.options.checkLeet) {
            const leetWord = this.convertLeet(word);
            for (let badWord of this.blacklist) {
                if (leetWord.includes(badWord.toLowerCase())) {
                    return { found: true, word: badWord };
                }
            }
        }

        return { found: false };
    },

    // ========== КОНВЕРТАЦИЯ ТРАНСЛИТА ==========
    convertTranslit(word) {
        const map = {
            'a': 'а', 'b': 'б', 'c': 'с', 'd': 'д', 'e': 'е',
            'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и', 'j': 'й',
            'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о',
            'p': 'п', 'q': 'к', 'r': 'р', 's': 'с', 't': 'т',
            'u': 'у', 'v': 'в', 'w': 'в', 'x': 'кс', 'y': 'ы',
            'z': 'з'
        };
        
        let result = word;
        for (let [lat, cyr] of Object.entries(map)) {
            result = result.replace(new RegExp(lat, 'g'), cyr);
        }
        return result;
    },

    // ========== КОНВЕРТАЦИЯ LEET (ЦИФРЫ) ==========
    convertLeet(word) {
        const map = {
            '0': 'о', '1': 'л', '2': 'з', '3': 'з',
            '4': 'ч', '5': 'с', '6': 'б', '7': 'т',
            '8': 'в', '9': 'д'
        };
        
        let result = word;
        for (let [leet, letter] of Object.entries(map)) {
            result = result.replace(new RegExp(leet, 'g'), letter);
        }
        return result;
    },

    // ========== ЦЕНЗУРА (ЗАМЕНА ЗВЕЗДОЧКАМИ) ==========
    censor(text, foundWords) {
        let censored = text;
        for (let word of foundWords) {
            const regex = new RegExp(word, 'gi');
            censored = censored.replace(regex, '*'.repeat(Math.min(word.length, 5)));
        }
        return censored;
    },

    // ========== ДОБАВЛЕНИЕ СЛОВ ==========
    addWords(...words) {
        this.blacklist.push(...words);
        console.log(`✅ Добавлено слов: ${words.length}. Всего: ${this.blacklist.length}`);
        return this.blacklist.length;
    },

    // ========== УДАЛЕНИЕ СЛОВ ==========
    removeWords(...words) {
        this.blacklist = this.blacklist.filter(w => !words.includes(w));
        console.log(`✅ Удалено слов: ${words.length}. Осталось: ${this.blacklist.length}`);
        return this.blacklist.length;
    },

    // ========== ПОЛУЧИТЬ СПИСОК ==========
    getList() {
        return [...this.blacklist];
    },

    // ========== ПОИСК ПОХОЖИХ ==========
    findSimilar(text) {
        const result = this.check(text);
        return {
            original: text,
            hasProfanity: result.hasProfanity,
            foundWords: result.foundWords,
            cleanVersion: result.cleanText,
            suggestion: result.cleanText !== text ? result.cleanText : null
        };
    }
};

// ========== ЭКСПОРТ ==========
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfanityFilter;
} else {
    window.ProfanityFilter = ProfanityFilter;
}

// ========== ТЕСТ (РАСКОММЕНТИРУЙ ДЛЯ ПРОВЕРКИ) ==========
/*
console.log('=== ТЕСТ ФИЛЬТРА МАТОВ ===');
console.log(ProfanityFilter.check('привет хуй')); // найдет
console.log(ProfanityFilter.check('нормальное слово')); // чисто
console.log(ProfanityFilter.check('fuck you')); // найдет
console.log(ProfanityFilter.findSimilar('пи3да')); // найдет через цифры
*/
