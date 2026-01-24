import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail, 
    updateProfile, 
    sendEmailVerification, 
    signInAnonymously,
    GoogleAuthProvider,
    signInWithPopup,
    linkWithPopup,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    updateEmail
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    arrayUnion,
    arrayRemove,
    deleteDoc,
    serverTimestamp,
    runTransaction,
    writeBatch
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
    authDomain: "metro-new-85226.firebaseapp.com",
    databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
    projectId: "metro-new-85226",
    storageBucket: "metro-new-85226.firebasestorage.app",
    messagingSenderId: "905640751733",
    appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence);

googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

window.firebaseApp = app;
window.auth = auth;
window.db = db;
window.storage = storage;
window.googleProvider = googleProvider;
window.firebaseModules = {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    sendEmailVerification,
    signInAnonymously,
    signInWithPopup,
    linkWithPopup,
    GoogleAuthProvider,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updateEmail,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    arrayUnion,
    arrayRemove,
    deleteDoc,
    serverTimestamp,
    runTransaction,
    writeBatch,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    uploadBytesResumable
};

console.log('Firebase v9 успешно инициализирован');
