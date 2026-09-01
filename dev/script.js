```javascript
"use strict";

const state = {
    holidays: [],
    currentDate: new Date(),
    today: new Date(),
    category: "all",
    search: ""
};


const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь"
];


const weekdayNames = [
    "Пн",
    "Вт",
    "Ср",
    "Чт",
    "Пт",
    "Сб",
    "Вс"
];


const categoryNames = {
    international: "Международный",
    cultural: "Культурный",
    culture: "Культура",
    awareness: "Памятный",
    environment: "Природа",
    health: "Здоровье",
    science: "Наука",
    technology: "Технологии",
    language: "Языки",
    food: "Еда",
    children: "Дети",
    animals: "Животные",
    sport: "Спорт",
    business: "Бизнес",
    education: "Образование",
    media: "Медиа",
    religious: "Религиозный",
    commercial: "Коммерческий"
};


const calendarElement = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
const monthSubtitle = document.getElementById("monthSubtitle");

const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");

const todayBtn = document.getElementById("todayBtn");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const holidayCount = document.getElementById("holidayCount");
const yearCount = document.getElementById("yearCount");

const todayTitle = document.getElementById("todayTitle");
const todayHolidays = document.getElementById("todayHolidays");

const searchSection = document.getElementById("searchSection");
const searchResults = document.getElementById("searchResults");

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const modalBackdrop = document.getElementById("modalBackdrop");


/*
|--------------------------------------------------------------------------
| Загрузка holidays.json
|--------------------------------------------------------------------------
*/

async function loadHolidays() {

    try {

        const response = await fetch("holidays.json");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.holidays)) {
            throw new Error("Неверный формат holidays.json");
        }

        state.holidays = data.holidays;

        createCategoryFilter();
        updateStats();
        renderCalendar();
        renderToday();

    } catch (error) {

        console.error(error);

        calendarElement.innerHTML = `
            <div class="empty" style="grid-column: 1 / -1;">
                <strong>Не удалось загрузить holidays.json</strong>
                <br><br>
                Проверь, что файл находится рядом с index.html
                и содержит массив "holidays".
            </div>
        `;
    }
}


/*
|--------------------------------------------------------------------------
| Категории
|--------------------------------------------------------------------------
*/

function createCategoryFilter() {

    const categories = [
        ...new Set(
            state.holidays
                .map(holiday => holiday.type)
                .filter(Boolean)
        )
    ].sort();

    categoryFilter.innerHTML = `
        <option value="all">Все категории</option>
    `;

    categories.forEach(category => {

        const option = document.createElement("option");

        option.value = category;

        option.textContent =
            categoryNames[category] || capitalize(category);

        categoryFilter.appendChild(option);
    });
}


/*
|--------------------------------------------------------------------------
| Calendar
|--------------------------------------------------------------------------
*/

function renderCalendar() {

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();

    monthTitle.textContent = monthNames[month];
    monthSubtitle.textContent = year;

    calendarElement.innerHTML = "";

    /*
     * JS: getDay()
     * 0 = воскресенье
     * Переводим в:
     * 0 = понедельник
     */

    const firstDay = new Date(year, month, 1);

    let startDay = firstDay.getDay() - 1;

    if (startDay < 0) {
        startDay = 6;
    }

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    const daysInPreviousMonth =
        new Date(year, month, 0).getDate();


    /*
     * Предыдущий месяц
     */

    for (let i = startDay - 1; i >= 0; i--) {

        const dayNumber =
            daysInPreviousMonth - i;

        const date =
            new Date(year, month - 1, dayNumber);

        calendarElement.appendChild(
            createDayElement(
                date,
                true
            )
        );
    }


    /*
     * Текущий месяц
     */

    for (let day = 1; day <= daysInMonth; day++) {

        const date =
            new Date(year, month, day);

        calendarElement.appendChild(
            createDayElement(
                date,
                false
            )
        );
    }


    /*
     * Следующий месяц
     */

    const totalCells =
        calendarElement.children.length;

    const remaining =
        (7 - (totalCells % 7)) % 7;

    for (let day = 1; day <= remaining; day++) {

        const date =
            new Date(year, month + 1, day);

        calendarElement.appendChild(
            createDayElement(
                date,
                true
            )
        );
    }
}


/*
|--------------------------------------------------------------------------
| День календаря
|--------------------------------------------------------------------------
*/

function createDayElement(date, otherMonth) {

    const element =
        document.createElement("div");

    element.className = "day";

    if (otherMonth) {
        element.classList.add("other-month");
    }

    if (isToday(date)) {
        element.classList.add("today");
    }


    const number =
        document.createElement("div");

    number.className = "day-number";

    number.textContent =
        date.getDate();

    element.appendChild(number);


    const holidayContainer =
        document.createElement("div");

    holidayContainer.className =
        "holidays-in-day";


    const holidays =
        getHolidaysForDate(date);


    holidays.forEach(holiday => {

        const button =
            document.createElement("button");

        button.className =
            "holiday-chip";

        button.innerHTML = `
            <span class="holiday-dot"></span>
            ${escapeHtml(holiday.name)}
        `;

        button.title =
            holiday.name;

        button.addEventListener(
            "click",
            () => openHoliday(holiday, date)
        );

        holidayContainer.appendChild(button);
    });


    element.appendChild(holidayContainer);

    return element;
}


/*
|--------------------------------------------------------------------------
| Получение праздников на конкретную дату
|--------------------------------------------------------------------------
*/

function getHolidaysForDate(date) {

    return state.holidays.filter(holiday => {

        if (!passesCategoryFilter(holiday)) {
            return false;
        }

        return holidayMatchesDate(
            holiday,
            date
        );
    });
}


/*
|--------------------------------------------------------------------------
| Проверка даты
|--------------------------------------------------------------------------
*/

function holidayMatchesDate(holiday, date) {

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    const dateString =
        `${month}-${day}`;


    /*
     * Обычная дата:
     * "03-08"
     */

    if (holiday.date === dateString) {
        return true;
    }


    /*
     * Плавающие даты
     */

    if (!holiday.rule) {
        return false;
    }


    return checkRule(
        holiday.rule,
        date
    );
}


/*
|--------------------------------------------------------------------------
| Правила плавающих дат
|--------------------------------------------------------------------------
*/

function checkRule(rule, date) {

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();


    if (rule === "second_sunday_of_may") {

        return (
            month === 4 &&
            date.getDay() === 0 &&
            day >= 8 &&
            day <= 14
        );
    }


    if (rule === "third_sunday_of_june") {

        return (
            month === 5 &&
            date.getDay() === 0 &&
            day >= 15 &&
            day <= 21
        );
    }


    if (rule === "fourth_thursday_of_november") {

        return (
            month === 10 &&
            date.getDay() === 4 &&
            day >= 22 &&
            day <= 28
        );
    }


    if (rule === "third_thursday_of_november") {

        return (
            month === 10 &&
            date.getDay() === 4 &&
            day >= 15 &&
            day <= 21
        );
    }


    if (rule === "first_friday_of_august") {

        return (
            month === 7 &&
            date.getDay() === 5 &&
            day <= 7
        );
    }


    if (rule === "second_saturday_of_september") {

        return (
            month === 8 &&
            date.getDay() === 6 &&
            day >= 8 &&
            day <= 14
        );
    }


    if (rule === "last_saturday_of_march") {

        if (
            month !== 2 ||
            date.getDay() !== 6
        ) {
            return false;
        }

        const lastDay =
            new Date(year, month + 1, 0);

        return day ===
            lastDay.getDate();
    }


    if (rule === "last_sunday_of_january") {

        if (
            month !== 0 ||
            date.getDay() !== 0
        ) {
            return false;
        }

        const lastDay =
            new Date(year, 1, 0);

        return day ===
            lastDay.getDate();
    }


    /*
     * День программиста:
     * 256-й день года.
     */

    if (rule === "day_256") {

        const start =
            new Date(year, 0, 1);

        const difference =
            Math.floor(
                (date - start) /
                86400000
            ) + 1;

        return difference === 256;
    }


    /*
     * Пасха — западная.
     */

    if (rule === "easter_western") {

        const easter =
            getWesternEaster(year);

        return sameDate(date, easter);
    }


    if (rule === "easter_western_minus_2") {

        const easter =
            getWesternEaster(year);

        easter.setDate(
            easter.getDate() - 2
        );

        return sameDate(date, easter);
    }


    if (rule === "easter_western_plus_1") {

        const easter =
            getWesternEaster(year);

        easter.setDate(
            easter.getDate() + 1
        );

        return sameDate(date, easter);
    }


    /*
     * Православная Пасха.
     */

    if (rule === "easter_orthodox") {

        const easter =
            getOrthodoxEaster(year);

        return sameDate(date, easter);
    }


    return false;
}


/*
|--------------------------------------------------------------------------
| Западная Пасха
|--------------------------------------------------------------------------
*/

function getWesternEaster(year) {

    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h =
        (19 * a + b - d - g + 15) % 30;

    const i = Math.floor(c / 4);
    const k = c % 4;

    const l =
        (32 + 2 * e + 2 * i - h - k) % 7;

    const m =
        Math.floor(
            (a + 11 * h + 22 * l) / 451
        );

    const month =
        Math.floor(
            (h + l - 7 * m + 114) / 31
        );

    const day =
        ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(
        year,
        month - 1,
        day
    );
}


/*
|--------------------------------------------------------------------------
| Православная Пасха
|--------------------------------------------------------------------------
*/

function getOrthodoxEaster(year) {

    /*
     * Алгоритм для юлианской Пасхи,
     * затем переводим дату в григорианский календарь.
     */

    const a = year % 4;
    const b = year % 7;
    const c = year % 19;

    const d =
        (19 * c + 15) % 30;

    const e =
        (2 * a + 4 * b - d + 34) % 7;

    const month =
        Math.floor(
            (d + e + 114) / 31
        );

    const day =
        ((d + e + 114) % 31) + 1;


    const julian =
        new Date(
            year,
            month - 1,
            day
        );


    /*
     * Разница календарей:
     * 13 дней для современных дат.
     */

    julian.setDate(
        julian.getDate() + 13
    );

    return julian;
}


/*
|--------------------------------------------------------------------------
| Сегодня
|--------------------------------------------------------------------------
*/

function renderToday() {

    const today =
        state.today;

    todayTitle.textContent =
        formatLongDate(today);

    const holidays =
        getHolidaysForDate(today);


    if (holidays.length === 0) {

        todayHolidays.innerHTML = `
            <div class="empty">
                📅 Сегодня праздников в выбранной категории нет.
            </div>
        `;

        return;
    }


    todayHolidays.innerHTML =
        holidays
            .map(
                holiday =>
                    createHolidayCard(
                        holiday,
                        today
                    )
            )
            .join("");


    attachHolidayCardEvents(
        todayHolidays
    );
}


/*
|--------------------------------------------------------------------------
| Карточка праздника
|--------------------------------------------------------------------------
*/

function createHolidayCard(holiday, date) {

    const type =
        categoryNames[holiday.type] ||
        capitalize(holiday.type || "Праздник");

    return `
        <article
            class="holiday-card"
            data-id="${escapeHtml(holiday.id || "")}"
        >

            <div class="holiday-card-top">

                <span class="holiday-date">
                    ${formatShortDate(date)}
                </span>

                <span class="holiday-type">
                    ${escapeHtml(type)}
                </span>

            </div>

            <h3>
                ${escapeHtml(holiday.name)}
            </h3>

            <p>
                ${getHolidayDescription(holiday)}
            </p>

        </article>
    `;
}


function attachHolidayCardEvents(container) {

    container
        .querySelectorAll(".holiday-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const id =
                        card.dataset.id;

                    const holiday =
                        state.holidays.find(
                            item =>
                                item.id === id
                        );

                    if (holiday) {
                        openHoliday(
                            holiday,
                            state.today
                        );
                    }
                }
            );
        });
}


/*
|--------------------------------------------------------------------------
| Описание
|--------------------------------------------------------------------------
*/

function getHolidayDescription(holiday) {

    if (holiday.description) {
        return escapeHtml(
            holiday.description
        );
    }

    const type =
        categoryNames[holiday.type] ||
        "Особая дата";

    return `${type}. Дата отмечается каждый год.`;
}


/*
|--------------------------------------------------------------------------
| Modal
|--------------------------------------------------------------------------
*/

function openHoliday(holiday, date) {

    const type =
        categoryNames[holiday.type] ||
        capitalize(
            holiday.type || "Праздник"
        );


    modalContent.innerHTML = `

        <div class="modal-date">
            ${formatLongDate(date)}
        </div>

        <h2>
            ${escapeHtml(holiday.name)}
        </h2>

        <p>
            ${getHolidayDescription(holiday)}
        </p>

        <div class="modal-info">

            <span class="modal-tag">
                ${escapeHtml(type)}
            </span>

            ${
                holiday.countries
                    ? `
                        <span class="modal-tag">
                            🌍 ${
                                holiday.countries.includes("*")
                                    ? "Международный"
                                    : holiday.countries.join(", ")
                            }
                        </span>
                    `
                    : ""
            }

            ${
                holiday.rule
                    ? `
                        <span class="modal-tag">
                            🔄 Плавающая дата
                        </span>
                    `
                    : ""
            }

        </div>
    `;


    modal.classList.remove("hidden");

    document.body.style.overflow =
        "hidden";
}


function closeHolidayModal() {

    modal.classList.add("hidden");

    document.body.style.overflow =
        "";
}


/*
|--------------------------------------------------------------------------
| Поиск
|--------------------------------------------------------------------------
*/

function searchHolidays(query) {

    state.search =
        query.trim().toLowerCase();


    if (!state.search) {

        searchSection.classList.add(
            "hidden"
        );

        return;
    }


    const results =
        state.holidays.filter(
            holiday => {

                const name =
                    String(
                        holiday.name || ""
                    ).toLowerCase();

                const type =
                    String(
                        holiday.type || ""
                    ).toLowerCase();

                return (
                    name.includes(
                        state.search
                    ) ||
                    type.includes(
                        state.search
                    )
                );
            }
        );


    searchSection.classList.remove(
        "hidden"
    );


    if (results.length === 0) {

        searchResults.innerHTML = `
            <div class="empty">
                Ничего не найдено 😔
            </div>
        `;

        return;
    }


    searchResults.innerHTML =
        results
            .map(
                holiday => {

                    const date =
                        getNextOccurrence(
                            holiday
                        );

                    return createHolidayCard(
                        holiday,
                        date
                    );
                }
            )
            .join("");


    attachHolidayCardEvents(
        searchResults
    );


    searchSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/*
|--------------------------------------------------------------------------
| Следующее наступление праздника
|--------------------------------------------------------------------------
*/

function getNextOccurrence(holiday) {

    const year =
        state.today.getFullYear();


    if (holiday.date) {

        const [
            month,
            day
        ] = holiday.date
            .split("-")
            .map(Number);

        let date =
            new Date(
                year,
                month - 1,
                day
            );


        if (date < startOfDay(state.today)) {

            date =
                new Date(
                    year + 1,
                    month - 1,
                    day
                );
        }

        return date;
    }


    /*
     * Для плавающих правил
     * ищем ближайшую дату.
     */

    for (let offset = 0; offset < 370; offset++) {

        const date =
            new Date(
                year,
                state.today.getMonth(),
                state.today.getDate() + offset
            );

        if (holidayMatchesDate(holiday, date)) {
            return date;
        }
    }


    return state.today;
}


/*
|--------------------------------------------------------------------------
| Статистика
|--------------------------------------------------------------------------
*/

function updateStats() {

    holidayCount.textContent =
        state.holidays.length;


    const year =
        state.currentDate.getFullYear();


    let count = 0;


    for (
        let month = 0;
        month < 12;
        month++
    ) {

        const days =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        for (
            let day = 1;
            day <= days;
            day++
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day
                );


            const holidays =
                state.holidays.filter(
                    holiday =>
                        holidayMatchesDate(
                            holiday,
                            date
                        )
                );


            count += holidays.length;
        }
    }


    yearCount.textContent =
        count;
}


/*
|--------------------------------------------------------------------------
| Фильтр
|--------------------------------------------------------------------------
*/

function passesCategoryFilter(holiday) {

    if (state.category === "all") {
        return true;
    }

    return holiday.type ===
        state.category;
}


/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

prevMonthBtn.addEventListener(
    "click",
    () => {

        state.currentDate.setMonth(
            state.currentDate.getMonth() - 1
        );

        renderCalendar();
        updateStats();
    }
);


nextMonthBtn.addEventListener(
    "click",
    () => {

        state.currentDate.setMonth(
            state.currentDate.getMonth() + 1
        );

        renderCalendar();
        updateStats();
    }
);


todayBtn.addEventListener(
    "click",
    () => {

        state.currentDate =
            new Date(
                state.today
            );

        renderCalendar();
        updateStats();
    }
);


categoryFilter.addEventListener(
    "change",
    event => {

        state.category =
            event.target.value;

        renderCalendar();
        renderToday();
    }
);


searchInput.addEventListener(
    "input",
    event => {

        searchHolidays(
            event.target.value
        );
    }
);


/*
|--------------------------------------------------------------------------
| Modal events
|--------------------------------------------------------------------------
*/

closeModal.addEventListener(
    "click",
    closeHolidayModal
);

modalBackdrop.addEventListener(
    "click",
    closeHolidayModal
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {
            closeHolidayModal();
        }
    }
);


/*
|--------------------------------------------------------------------------
| Utility
|--------------------------------------------------------------------------
*/

function isToday(date) {

    return (
        date.getFullYear() ===
            state.today.getFullYear() &&

        date.getMonth() ===
            state.today.getMonth() &&

        date.getDate() ===
            state.today.getDate()
    );
}


function sameDate(a, b) {

    return (
        a.getFullYear() ===
            b.getFullYear() &&

        a.getMonth() ===
            b.getMonth() &&

        a.getDate() ===
            b.getDate()
    );
}


function startOfDay(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


function formatLongDate(date) {

    return new Intl.DateTimeFormat(
        "ru-RU",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(date);
}


function formatShortDate(date) {

    return new Intl.DateTimeFormat(
        "ru-RU",
        {
            day: "numeric",
            month: "short"
        }
    ).format(date);
}


function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}


/*
 * Защита вывода текста из JSON.
 */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/

loadHolidays();
```
