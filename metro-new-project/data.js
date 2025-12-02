// data.js - База данных документов метро
const METRO_DOCS = {
    // Все документы
    documents: [
        {
            id: 1,
            code: "MSK-PROJ-001",
            title: "Проект станции «Деловой центр»",
            shortDesc: "Проектная документация станции",
            fullDesc: "Полный проект станции с вестибюлями и переходами",
            type: "Проектная документация",
            system: "Московский метрополитен",
            date: "2024-01-15",
            author: "Иванов И.И.",
            tags: ["станция", "проект", "москва"]
        },
        {
            id: 2,
            code: "SPB-SAFETY-001",
            title: "План эвакуации Невской линии",
            shortDesc: "Документ по безопасности",
            fullDesc: "План эвакуации пассажиров при ЧС",
            type: "Безопасность",
            system: "Петербургский метрополитен",
            date: "2024-02-10",
            author: "Петров П.П.",
            tags: ["эвакуация", "безопасность", "петербург"]
        },
        {
            id: 3,
            code: "NSK-IDEA-001",
            title: "Идея: Автономные поезда",
            shortDesc: "Предложение по автоматизации",
            fullDesc: "Внедрение системы автономного движения",
            type: "Идеи",
            system: "Новосибирский метрополитен",
            date: "2024-03-05",
            author: "Сидоров С.С.",
            tags: ["идея", "автоматизация", "ai"]
        },
        {
            id: 4,
            code: "KZN-TECH-001",
            title: "Схема вентиляции",
            shortDesc: "Техническая документация",
            fullDesc: "Схемы систем вентиляции станций",
            type: "Техническая документация",
            system: "Казанский метрополитен",
            date: "2024-02-20",
            author: "Козлов К.К.",
            tags: ["вентиляция", "техника", "казань"]
        },
        {
            id: 5,
            code: "EKB-OPER-001",
            title: "Инструкция по эскалаторам",
            shortDesc: "Эксплуатационная документация",
            fullDesc: "Руководство по обслуживанию эскалаторов",
            type: "Эксплуатационная",
            system: "Екатеринбургский метрополитен",
            date: "2024-03-12",
            author: "Новиков Н.Н.",
            tags: ["эскалаторы", "инструкция", "екатеринбург"]
        }
    ],
    
    // Поиск документов
    search: function(query) {
        if (!query) return this.documents;
        query = query.toLowerCase();
        return this.documents.filter(doc => 
            doc.code.toLowerCase().includes(query) ||
            doc.title.toLowerCase().includes(query) ||
            doc.shortDesc.toLowerCase().includes(query) ||
            doc.type.toLowerCase().includes(query) ||
            doc.system.toLowerCase().includes(query) ||
            doc.tags.some(tag => tag.toLowerCase().includes(query))
        );
    },
    
    // Получить документ по ID
    getById: function(id) {
        return this.documents.find(doc => doc.id === id);
    }
};
