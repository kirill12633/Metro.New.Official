// Firebase конфигурация и инициализация
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
    authDomain: "metro-new-85226.firebaseapp.com",
    databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
    projectId: "metro-new-85226",
    storageBucket: "metro-new-85226.firebasestorage.app",
    messagingSenderId: "905640751733",
    appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Настройка Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Экспорт для использования в других модулях
export { app, auth, db, storage, googleProvider };
