// ============================================
// ИНИЦИАЛИЗАЦИЯ FIREBASE
// ============================================

// Конфигурация Firebase (публичные ключи)
const firebaseConfig = {
    apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
    authDomain: "metro-new-85226.firebaseapp.com",
    projectId: "metro-new-85226",
    storageBucket: "metro-new-85226.firebasestorage.app",
    messagingSenderId: "905640751733",
    appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

// Глобальные переменные Firebase
let app, auth, db, googleProvider;

// Инициализация Firebase
async function initFirebase() {
    try {
        // Импорт Firebase модулей
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js");
        const { 
            getAuth, 
            createUserWithEmailAndPassword,
            updateProfile,
            sendEmailVerification,
            signInWithPopup,
            GoogleAuthProvider,
            signInWithEmailAndPassword,
            sendPasswordResetEmail,
            signOut
        } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js");
const { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs,
    runTransaction,
    addDoc,
    arrayUnion
} = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js");
        
        // Инициализация
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();
        
        // Настройка Google провайдера
        googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
        
        // Инициализация App Check
        try {
            const { initializeAppCheck, ReCaptchaV3Provider } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-check.js");
            
            initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider('6LfgAZkrAAAAAOOU9svqDc-yVa23p4BRbEfElYJ-'),
                isTokenAutoRefreshEnabled: true
            });
            
            console.log('🛡️ App Check инициализирован');
        } catch (appCheckError) {
            console.warn('⚠️ App Check не инициализирован:', appCheckError);
        }
        
        console.log('✅ Firebase инициализирован');
        
        // Экспорт функций
        window.firebaseAuth = {
            auth,
            createUserWithEmailAndPassword,
            updateProfile,
            sendEmailVerification,
            signInWithPopup,
            GoogleAuthProvider,
            googleProvider,
            signInWithEmailAndPassword,
            sendPasswordResetEmail,
            signOut
        };
        
window.firebaseDB = {
    db,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs,
    runTransaction,
    addDoc,
    arrayUnion
};
        
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка инициализации Firebase:', error);
        security.logError(error, { module: 'firebase-init' });
        return false;
    }
}

console.log('🔥 Модуль Firebase готов к инициализации');
