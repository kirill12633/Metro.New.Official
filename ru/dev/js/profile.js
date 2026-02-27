// Управление профилем пользователя
import { auth, db, storage } from './firebase.js';
import { store } from './store.js';
import { showToast, $ } from './ui.js';
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// Инициализация загрузки аватара
export function initAvatarUpload() {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
        showToast('Недоступно для гостевого режима', 'warning');
        return;
    }
    
    // Сброс состояния
    $.id('avatarPreviewImg').style.display = 'none';
    $.id('avatarPreviewIcon').style.display = 'block';
    $.id('removeAvatarBtn').style.display = user.photoURL ? 'inline-flex' : 'none';
    $.id('uploadAvatarBtn').disabled = true;
    $.id('avatarMessage').style.display = 'none';
    
    if (user.photoURL) {
        $.id('avatarPreviewImg').src = user.photoURL;
        $.id('avatarPreviewImg').style.display = 'block';
        $.id('avatarPreviewIcon').style.display = 'none';
    }
}

// Предпросмотр аватара
export function previewAvatar(file) {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) {
        showToast('Только JPG, PNG, GIF или WebP', 'error');
        return;
    }
    
    if (file.size > maxSize) {
        showToast('Максимальный размер: 2MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        $.id('avatarPreviewImg').src = e.target.result;
        $.id('avatarPreviewImg').style.display = 'block';
        $.id('avatarPreviewIcon').style.display = 'none';
        $.id('uploadAvatarBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

// Загрузка аватара
export async function uploadAvatar() {
    const file = $.id('avatarFileInput').files[0];
    const user = auth.currentUser;
    
    if (!file || !user || user.isAnonymous) return;
    
    const uploadBtn = $.id('uploadAvatarBtn');
    
    try {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
        
        // Загрузка в Storage
        const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Обновление профиля
        await updateProfile(user, { photoURL: downloadURL });
        
        // Сохранение в Firestore
        await setDoc(doc(db, 'users', user.uid), { avatarUrl: downloadURL }, { merge: true });
        
        showToast('Аватар обновлён!', 'success');
        
        setTimeout(() => {
            hideModal('avatarModal');
            store.setUser(auth.currentUser); // обновляем состояние
        }, 1500);
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showToast('Ошибка загрузки аватара', 'error');
        
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Загрузить аватар';
    }
}

// Удаление аватара
export async function removeAvatar() {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) return;
    
    try {
        // Удаление из Storage
        if (user.photoURL && user.photoURL.includes('firebasestorage')) {
            try {
                const photoRef = ref(storage, user.photoURL);
                await deleteObject(photoRef);
            } catch (storageError) {
                console.warn('Не удалось удалить из Storage:', storageError);
            }
        }
        
        // Обновление профиля
        await updateProfile(user, { photoURL: null });
        
        // Обновление Firestore
        await setDoc(doc(db, 'users', user.uid), { avatarUrl: null }, { merge: true });
        
        showToast('Аватар удалён', 'info');
        hideModal('avatarModal');
        store.setUser(auth.currentUser);
        
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showToast('Ошибка удаления аватара', 'error');
    }
}
