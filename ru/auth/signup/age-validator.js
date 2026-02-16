// ============================================
// ПРОВЕРКА ВОЗРАСТА
// ============================================

const AgeValidator = {
    // ========== НАСТРОЙКИ ==========
    minAge: 13,
    maxAge: 120,

    // ========== ОСНОВНАЯ ПРОВЕРКА ==========
    check(day, month, year) {
        const result = {
            isValid: false,
            age: null,
            message: '',
            canRegister: false,
            nextBirthday: null
        };

        // Проверка на пустые значения
        if (!day || !month || !year) {
            result.message = '❌ Выберите дату рождения';
            return result;
        }

        // Проверка на корректность даты
        if (!this.isValidDate(day, month, year)) {
            result.message = '❌ Некорректная дата';
            return result;
        }

        // Вычисляем возраст
        const age = this.calculateAge(day, month, year);
        result.age = age;

        // Проверка на слишком старый возраст
        if (age > this.maxAge) {
            result.message = '❌ Проверьте правильность даты';
            return result;
        }

        // ОСНОВНАЯ ПРОВЕРКА ВОЗРАСТА
        if (age >= this.minAge) {
            result.isValid = true;
            result.canRegister = true;
            result.message = `✅ Возраст: ${age} лет - можно регистрироваться`;
        } else {
            result.isValid = false;
            result.canRegister = false;
            
            // ПОНЯТНЫЕ СООБЩЕНИЯ ДЛЯ ДЕТЕЙ
            const yearsUntil = this.minAge - age;
            
            if (age <= 0) {
                result.message = '❌ Вы еще не родились? 😊';
            } else if (age < 7) {
                result.message = `❌ Тебе ${age} лет. Подрасти немного! Вернись через ${yearsUntil} годиков`;
            } else if (age < 13) {
                result.message = `❌ Тебе ${age} лет. Регистрация с 13 лет. Осталось подождать ${yearsUntil} ${this.getYearWord(yearsUntil)}`;
            }
            
            // Вычисляем следующее день рождения
            result.nextBirthday = this.getNextBirthday(day, month, year);
        }

        return result;
    },

    // ========== ВЫЧИСЛЕНИЕ ВОЗРАСТА ==========
    calculateAge(day, month, year) {
        const today = new Date();
        const birthDate = new Date(year, month - 1, day);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    },

    // ========== ПРОВЕРКА КОРРЕКТНОСТИ ДАТЫ ==========
    isValidDate(day, month, year) {
        const date = new Date(year, month - 1, day);
        return date.getFullYear() == year && 
               date.getMonth() == month - 1 && 
               date.getDate() == day;
    },

    // ========== СЛЕДУЮЩИЙ ДЕНЬ РОЖДЕНИЯ ==========
    getNextBirthday(day, month, year) {
        const today = new Date();
        const nextBirthday = new Date(today.getFullYear(), month - 1, day);
        
        if (nextBirthday < today) {
            nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }
        
        const diffTime = nextBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
            date: nextBirthday,
            daysUntil: diffDays,
            yearsUntil: nextBirthday.getFullYear() - year - this.calculateAge(day, month, year)
        };
    },

    // ========== СКЛОНЕНИЕ СЛОВА "ГОД" ==========
    getYearWord(years) {
        if (years % 10 === 1 && years % 100 !== 11) return 'год';
        if ([2,3,4].includes(years % 10) && ![12,13,14].includes(years % 100)) return 'года';
        return 'лет';
    },

    // ========== ФОРМАТИРОВАТЬ ДАТУ ==========
    formatDate(day, month, year) {
        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        return `${day} ${months[month-1]} ${year} года`;
    }
};

// ========== ЭКСПОРТ ==========
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgeValidator;
} else {
    window.AgeValidator = AgeValidator;
}

// ========== ТЕСТ ==========
/*
console.log('=== ТЕСТ ПРОВЕРКИ ВОЗРАСТА ===');
console.log(AgeValidator.check(15, 5, 2015)); // 9 лет
console.log(AgeValidator.check(15, 5, 2010)); // 14 лет
console.log(AgeValidator.check(29, 2, 2020)); // високосный
console.log(AgeValidator.formatDate(15, 5, 2020));
*/
