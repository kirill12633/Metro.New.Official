// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVSAXTU1VqF36GJA1pQOfxRxo3_ixW7F4",
    authDomain: "metro-new-admin.firebaseapp.com",
    projectId: "metro-new-admin",
    storageBucket: "metro-new-admin.firebasestorage.app",
    messagingSenderId: "769002010414",
    appId: "1:769002010414:web:bdeb93a7eddc4cab63ecbf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===== АВТОРИЗАЦИЯ ДЛЯ СПЕЦ АДМИНОВ =====
const AdminAuth = {
    // Вход
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Проверяем, есть ли пользователь в коллекции users_parental
            const q = query(collection(db, 'users_parental'), where('email', '==', email));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                await signOut(auth);
                throw new Error('У вас нет прав доступа');
            }
            
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    },
    
    // Выход
    async logout() {
        return await signOut(auth);
    },
    
    // Проверка авторизации
    onAuth(callback) {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Проверяем права
                const q = query(collection(db, 'users_parental'), where('email', '==', user.email));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
                    callback({ ...user, role: userData.role, name: userData.name });
                } else {
                    callback(null);
                }
            } else {
                callback(null);
            }
        });
    }
};

// ===== ФУНКЦИИ ДЛЯ СТАТЕЙ =====
const Articles = {
    // Добавить статью
    async add(article, author) {
        return await addDoc(collection(db, 'articles'), {
            ...article,
            author: author,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            views: 0,
            status: article.status || 'published'
        });
    },
    
    // Получить все статьи
    async getAll() {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    // Получить опубликованные статьи
    async getPublished() {
        const q = query(
            collection(db, 'articles'), 
            where('status', '==', 'published'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    // Получить одну статью
    async get(id) {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },
    
    // Обновить статью
    async update(id, data) {
        const docRef = doc(db, 'articles', id);
        return await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    },
    
    // Удалить статью
    async delete(id) {
        return await deleteDoc(doc(db, 'articles', id));
    },
    
    // Поиск по тегам
    async getByTag(tag) {
        const q = query(
            collection(db, 'articles'),
            where('tags', 'array-contains', tag),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

// ===== ФУНКЦИИ ДЛЯ НОВОСТЕЙ =====
const News = {
    async add(news, author) {
        return await addDoc(collection(db, 'news'), {
            ...news,
            author: author,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            views: 0
        });
    },
    
    async getAll() {
        const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async get(id) {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },
    
    async update(id, data) {
        const docRef = doc(db, 'news', id);
        return await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    },
    
    async delete(id) {
        return await deleteDoc(doc(db, 'news', id));
    }
};

// ===== ФУНКЦИИ ДЛЯ ВИДЕО =====
const Videos = {
    async add(video, author) {
        return await addDoc(collection(db, 'videos'), {
            ...video,
            author: author,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            views: 0
        });
    },
    
    async getAll() {
        const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

// ===== ФУНКЦИИ ДЛЯ ЮРИДИЧЕСКИХ ДОКУМЕНТОВ =====
const Legal = {
    async add(doc, author) {
        return await addDoc(collection(db, 'legal'), {
            ...doc,
            author: author,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            downloads: 0
        });
    },
    
    async getAll() {
        const q = query(collection(db, 'legal'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

// ===== КАТЕГОРИИ (ФИКСИРОВАННЫЕ) =====
const Categories = {
    async init() {
        const categories = [
            { id: 'articles', name: 'Статьи', icon: 'fa-newspaper', color: '#0066CC', order: 1 },
            { id: 'news', name: 'Новости', icon: 'fa-bullhorn', color: '#ffc107', order: 2 },
            { id: 'videos', name: 'Видео', icon: 'fa-youtube', color: '#ff0000', order: 3 },
            { id: 'legal', name: 'Юридическое', icon: 'fa-gavel', color: '#6c757d', order: 4 }
        ];
        
        for (const cat of categories) {
            const docRef = doc(db, 'categories', cat.id);
            await setDoc(docRef, cat);
        }
    },
    
    async getAll() {
        const snapshot = await getDocs(collection(db, 'categories'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

// ===== ТЕГИ =====
const Tags = {
    async add(tag) {
        const docRef = doc(db, 'tags', tag.id);
        return await setDoc(docRef, tag);
    },
    
    async getAll() {
        const snapshot = await getDocs(collection(db, 'tags'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async increment(tagId) {
        const docRef = doc(db, 'tags', tagId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const count = docSnap.data().count || 0;
            await updateDoc(docRef, { count: count + 1 });
        }
    }
};

// ===== СПЕЦ АДМИНЫ (users_parental) =====
const ParentalAdmins = {
    // Добавить админа
    async add(admin) {
        return await addDoc(collection(db, 'users_parental'), {
            ...admin,
            createdAt: serverTimestamp(),
            lastLogin: null
        });
    },
    
    // Получить всех админов
    async getAll() {
        const snapshot = await getDocs(collection(db, 'users_parental'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    // Получить админа по email
    async getByEmail(email) {
        const q = query(collection(db, 'users_parental'), where('email', '==', email));
        const snapshot = await getDocs(q);
        return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },
    
    // Обновить данные админа
    async update(id, data) {
        const docRef = doc(db, 'users_parental', id);
        return await updateDoc(docRef, data);
    },
    
    // Удалить админа
    async delete(id) {
        return await deleteDoc(doc(db, 'users_parental', id));
    },
    
    // Обновить время последнего входа
    async updateLastLogin(email) {
        const admin = await this.getByEmail(email);
        if (admin) {
            await this.update(admin.id, { lastLogin: serverTimestamp() });
        }
    }
};

export { 
    db, 
    auth,
    AdminAuth,
    Articles, 
    News, 
    Videos, 
    Legal, 
    Categories, 
    Tags,
    ParentalAdmins 
};
