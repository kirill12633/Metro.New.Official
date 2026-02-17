// firebase-config.js
// ===== DEBUG РЕЖИМ ДЛЯ APP CHECK =====
window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

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
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    initializeAppCheck, 
    ReCaptchaV3Provider,
    getToken
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-check.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVSAXTU1VqF36GJA1pQOfxRxo3_ixW7F4",
    authDomain: "metro-new-admin.firebaseapp.com",
    projectId: "metro-new-admin",
    storageBucket: "metro-new-admin.firebasestorage.app",
    messagingSenderId: "769002010414",
    appId: "1:769002010414:web:bdeb93a7eddc4cab63ecbf"
};

const app = initializeApp(firebaseConfig);

// ===== APP CHECK С DEBUG РЕЖИМОМ =====
let appCheck;
try {
    appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LfgAZkrAAAAAOOU9svqDc-yVa23p4BRbEfElYJ-'),
        isTokenAutoRefreshEnabled: true
    });
    
    // Проверяем токен
    getToken(appCheck, true).then(token => {
        console.log('✅ App Check token:', token);
    }).catch(error => {
        console.warn('⚠️ App Check error:', error);
    });
} catch (error) {
    console.warn('⚠️ App Check init error:', error);
}

const db = getFirestore(app);
const auth = getAuth(app);

// ===== АВТОРИЗАЦИЯ ДЛЯ СПЕЦ АДМИНОВ =====
const AdminAuth = {
    async login(email, password) {
        try {
            console.log('🔐 Пытаемся войти:', email);
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ Успешный вход в Authentication');
            
            // Проверяем права в базе
            const q = query(collection(db, 'users_parental'), where('email', '==', email));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                console.warn('⚠️ Пользователь не найден в users_parental');
                await signOut(auth);
                throw new Error('У вас нет прав доступа');
            }
            
            console.log('✅ Права подтверждены');
            return userCredential.user;
        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            throw error;
        }
    },
    
    async logout() {
        return await signOut(auth);
    },
    
    onAuth(callback) {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
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
    
    async getAll() {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async getPublished() {
        const q = query(
            collection(db, 'articles'), 
            where('status', '==', 'published'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async get(id) {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },
    
    async update(id, data) {
        const docRef = doc(db, 'articles', id);
        return await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    },
    
    async delete(id) {
        return await deleteDoc(doc(db, 'articles', id));
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
    async add(legalDoc, author) {
        return await addDoc(collection(db, 'legal'), {
            ...legalDoc,
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

// ===== СПЕЦ АДМИНЫ (users_parental) =====
const ParentalAdmins = {
    async add(admin) {
        return await addDoc(collection(db, 'users_parental'), {
            ...admin,
            createdAt: serverTimestamp(),
            lastLogin: null
        });
    },
    
    async getAll() {
        const snapshot = await getDocs(collection(db, 'users_parental'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async getByEmail(email) {
        const q = query(collection(db, 'users_parental'), where('email', '==', email));
        const snapshot = await getDocs(q);
        return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },
    
    async update(id, data) {
        const docRef = doc(db, 'users_parental', id);
        return await updateDoc(docRef, data);
    },
    
    async delete(id) {
        return await deleteDoc(doc(db, 'users_parental', id));
    },
    
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
    appCheck,
    AdminAuth,
    Articles, 
    News, 
    Videos, 
    Legal, 
    ParentalAdmins 
};
