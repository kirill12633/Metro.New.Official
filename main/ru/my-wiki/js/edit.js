import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const pageId = urlParams.get('page');
const isEditMode = !!pageId;

const form = document.getElementById('edit-form');
const pageNameInput = document.getElementById('pageName');
const contentInput = document.getElementById('content');
const editedByInput = document.getElementById('editedBy');
const messageDiv = document.getElementById('message');
const cancelBtn = document.getElementById('cancel-btn');

// Функция для генерации ID из названия
function generatePageId(pageName) {
    return pageName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9а-яё-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Загружаем статью для редактирования
async function loadArticleForEdit() {
    try {
        const docRef = doc(db, "pages", pageId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const pageData = docSnap.data();
            pageNameInput.value = pageData.pageName || '';
            contentInput.value = pageData.content || '';
            editedByInput.value = pageData.editedBy || pageData.createdBy || '';
        }
    } catch (error) {
        console.error("Ошибка загрузки статьи:", error);
        showMessage("Ошибка загрузки статьи.", 'error');
    }
}

// Обработчик отправки формы
async function handleSubmit(e) {
    e.preventDefault();
    
    const pageName = pageNameInput.value.trim();
    const content = contentInput.value.trim();
    const editedBy = editedByInput.value.trim();
    
    if (!pageName || !content || !editedBy) {
        showMessage("Заполните все поля.", 'error');
        return;
    }

    try {
        const finalPageId = isEditMode ? pageId : generatePageId(pageName);
        
        const pageData = {
            pageName: pageName,
            content: content,
            editedBy: editedBy,
            timestamp: serverTimestamp()
        };

        // Если это создание новой статьи, добавляем createdBy
        if (!isEditMode) {
            pageData.createdBy = editedBy;
        }

        await setDoc(doc(db, "pages", finalPageId), pageData, { merge: true });
        
        showMessage("Страница успешно сохранена!", 'success');
        setTimeout(() => {
            window.location.href = `article.html?page=${finalPageId}`;
        }, 1500);
        
    } catch (error) {
        console.error("Ошибка сохранения:", error);
        showMessage("Ошибка сохранения страницы.", 'error');
    }
}

// Показать сообщение
function showMessage(text, type) {
    if (!messageDiv) return;
    
    const color = type === 'success' ? 'green' : 'red';
    messageDiv.innerHTML = `<p style="color: ${color};">${text}</p>`;
}

// Обработчик отмены
function handleCancel() {
    if (isEditMode) {
        window.location.href = `article.html?page=${pageId}`;
    } else {
        window.location.href = 'index.html';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (isEditMode) {
        document.querySelector('h1').textContent = '✏️ Редактирование статьи';
        loadArticleForEdit();
    }

    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancel);
    }
});
