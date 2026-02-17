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
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// ⚠️ ВРЕМЕННО ОТКЛЮЧАЕМ APP CHECK
// import { 
//     initializeAppCheck, 
//     ReCaptchaV3Provider,
//     getToken
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-check.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVSAXTU1VqF36GJA1pQOfxRxo3_ixW7F4",
    authDomain: "metro-new-admin.firebaseapp.com",
    projectId: "metro-new-admin",
    storageBucket: "metro-new-admin.firebasestorage.app",
    messagingSenderId: "769002010414",
    appId: "1:769002010414:web:bdeb93a7eddc4cab63ecbf"
};

const app = initializeApp(firebaseConfig);

// ⚠️ ВРЕМЕННО УБИРАЕМ ВСЁ, ЧТО СВЯЗАНО С APP CHECK
// let appCheck;
// try {
//     appCheck = initializeAppCheck(app, {
//         provider: new ReCaptchaV3Provider('6LfgAZkrAAAAAOOU9svqDc-yVa23p4BRbEfElYJ-'),
//         isTokenAutoRefreshEnabled: true
//     });
//     
//     getToken(appCheck).then((token) => {
//         console.log('=================================');
//         console.log('🔑 DEBUG TOKEN:', token);
//         console.log('=================================');
//     }).catch(error => {
//         console.warn('⚠️ App Check error:', error);
//     });
// } catch (error) {
//     console.warn('⚠️ App Check init error:', error);
// }

const db = getFirestore(app);
const auth = getAuth(app);

// ... ВЕСЬ ОСТАЛЬНОЙ КОД БЕЗ ИЗМЕНЕНИЙ ...
// (Articles, News, Videos, Legal, ParentalAdmins, AdminAuth остаются как есть)

export { 
    db, 
    auth,
    // appCheck,  // ⚠️ Убираем экспорт
    AdminAuth,
    Articles, 
    News, 
    Videos, 
    Legal, 
    ParentalAdmins 
};
