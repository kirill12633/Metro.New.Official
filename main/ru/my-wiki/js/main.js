import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const articlesListElement = document.getElementById('articles-list');

async function loadArticles() {
    articlesListElement.innerHTML = "<p>Загрузка статей...</p>";

    try {
        // Создаем запрос с сортировкой по времени создания (новые сначала)
        const q = query(collection(db, "pages"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        articlesListElement.innerHTML = "";

        if (querySnapshot.empty) {
            articlesListElement.innerHTML = "<p>Статьи пока не созданы.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const pageData = doc.data();
            const articleDiv = document.createElement('div');
            articleDiv.className = 'article-preview';
            
            articleDiv.innerHTML = `
                <h3><a href="article.html?page=${doc.id}">${pageData.pageName || 'Без названия'}</a></h3>
                <p>Создано: ${pageData.createdBy || 'Неизвестно'}</p>
                <p>Обновлено: ${new Date(pageData.timestamp?.toDate()).toLocaleDateString('ru-RU')}</p>
                <hr>
            `;
            
            articlesListElement.appendChild(articleDiv);
        });

    } catch (error) {
        console.error("Ошибка загрузки статей:", error);
        articlesListElement.innerHTML = "<p>Ошибка загрузки статей.</p>";
    }
}

// Загружаем статьи при загрузке страницы
loadArticles();
