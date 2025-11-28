import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Получаем pageName из URL параметров
const urlParams = new URLSearchParams(window.location.search);
const pageId = urlParams.get('page');

const articleTitle = document.getElementById('article-title');
const articleContent = document.getElementById('article-content');
const articleMeta = document.getElementById('article-meta');
const editLink = document.getElementById('edit-link');

async function loadArticle() {
    if (!pageId) {
        showError("Статья не найдена", "Не указан идентификатор страницы.");
        return;
    }

    try {
        const docRef = doc(db, "pages", pageId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const pageData = docSnap.data();
            
            // Заполняем содержимое
            articleTitle.textContent = pageData.pageName || 'Без названия';
            articleContent.innerHTML = pageData.content || '<p>Содержимое отсутствует.</p>';
            
            // Форматируем дату
            const timestamp = pageData.timestamp?.toDate 
                ? new Date(pageData.timestamp.toDate()).toLocaleString('ru-RU')
                : 'Дата неизвестна';
            
            // Заполняем мета-информацию
            articleMeta.innerHTML = `
                <hr>
                <p><strong>Создано:</strong> ${pageData.createdBy || 'Неизвестно'}</p>
                <p><strong>Редактировал:</strong> ${pageData.editedBy || pageData.createdBy || 'Неизвестно'}</p>
                <p><strong>Обновлено:</strong> ${timestamp}</p>
            `;
            
            // Настраиваем ссылку редактирования
            if (editLink) {
                editLink.href = `edit.html?page=${pageId}`;
            }
            
        } else {
            showError("Статья не найдена", `Статья с ID "${pageId}" не существует.`);
        }
    } catch (error) {
        console.error("Ошибка загрузки статьи:", error);
        showError("Ошибка", "Произошла ошибка при загрузке статьи.");
    }
}

function showError(title, message) {
    if (articleTitle) articleTitle.textContent = title;
    if (articleContent) articleContent.innerHTML = `<p>${message}</p>`;
}

// Загружаем статью при загрузке страницы
document.addEventListener('DOMContentLoaded', loadArticle);
