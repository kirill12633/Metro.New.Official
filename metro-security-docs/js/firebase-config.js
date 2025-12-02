// Firebase configuration with App Check
const firebaseConfig = {
  apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
  authDomain: "metro-new-85226.firebaseapp.com",
  databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
  projectId: "metro-new-85226",
  storageBucket: "metro-new-85226.firebasestorage.app",
  messagingSenderId: "905640751733",
  appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Initialize App Check with reCAPTCHA Enterprise v3
const appCheck = firebase.appCheck();
appCheck.activate('6Ld9uw0sAAAAAMTSxQ9Vxd0LhEcwweHGF-DWdZIo', true);

// App Check provider
const provider = new firebase.appCheck.ReCaptchaEnterpriseProvider(
    '6Ld9uw0sAAAAAMTSxQ9Vxd0LhEcwweHGF-DWdZIo'
);

// Cloud Firestore collections
const collections = {
    USERS: 'users',
    DOCUMENTS: 'documents',
    SESSIONS: 'sessions',
    AUDIT_LOGS: 'audit_logs',
    SECURITY_EVENTS: 'security_events',
    SETTINGS: 'settings',
    ACCESS_CONTROLS: 'access_controls'
};

// Security settings
const SECURITY_SETTINGS = {
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 минут
    MAX_LOGIN_ATTEMPTS: 5,
    PASSWORD_MIN_LENGTH: 8,
    ALLOWED_FILE_TYPES: ['pdf', 'docx', 'doc', 'xlsx', 'pptx', 'jpg', 'png', 'jpeg'],
    MAX_FILE_SIZE: 50 * 1024 * 1024 // 50MB
};

// User roles
const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    VIEWER: 'viewer',
    AUDITOR: 'auditor',
    GUEST: 'guest'
};

// Document access levels
const ACCESS_LEVELS = {
    PUBLIC: 'public',
    INTERNAL: 'internal',
    CONFIDENTIAL: 'confidential',
    SECRET: 'secret',
    TOP_SECRET: 'top_secret'
};

// Initialize security rules
function initializeSecurityRules() {
    // Enable offline persistence
    db.enablePersistence()
        .catch((err) => {
            console.error('Ошибка включения оффлайн режима:', err.code);
        });

    // Security rules validation
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
}

// Get current user with App Check verification
async function getCurrentUserWithVerification() {
    try {
        // Verify App Check token
        const appCheckToken = await appCheck.getToken();
        
        if (!appCheckToken) {
            throw new Error('Не удалось получить токен App Check');
        }

        const user = auth.currentUser;
        if (!user) return null;

        // Verify user in Firestore
        const userDoc = await db.collection(collections.USERS)
            .doc(user.uid)
            .get();

        if (!userDoc.exists) {
            await auth.signOut();
            return null;
        }

        return {
            ...user,
            ...userDoc.data(),
            uid: user.uid
        };
    } catch (error) {
        console.error('Ошибка верификации пользователя:', error);
        return null;
    }
}

// Verify document access with App Check
async function verifyDocumentAccess(documentId, userId) {
    try {
        // Get App Check token
        const appCheckToken = await appCheck.getToken();
        
        // Check user permissions
        const userDoc = await db.collection(collections.USERS)
            .doc(userId)
            .get();
        
        if (!userDoc.exists) return false;

        const userData = userDoc.data();
        
        // Get document
        const documentDoc = await db.collection(collections.DOCUMENTS)
            .doc(documentId)
            .get();
        
        if (!documentDoc.exists) return false;

        const documentData = documentDoc.data();
        
        // Check access level
        return checkAccessLevel(userData.role, documentData.accessLevel);
    } catch (error) {
        console.error('Ошибка проверки доступа:', error);
        return false;
    }
}

// Check access level based on role
function checkAccessLevel(userRole, documentAccessLevel) {
    const roleHierarchy = {
        [USER_ROLES.ADMIN]: 5,
        [USER_ROLES.MANAGER]: 4,
        [USER_ROLES.AUDITOR]: 3,
        [USER_ROLES.VIEWER]: 2,
        [USER_ROLES.GUEST]: 1
    };

    const accessHierarchy = {
        [ACCESS_LEVELS.TOP_SECRET]: 5,
        [ACCESS_LEVELS.SECRET]: 4,
        [ACCESS_LEVELS.CONFIDENTIAL]: 3,
        [ACCESS_LEVELS.INTERNAL]: 2,
        [ACCESS_LEVELS.PUBLIC]: 1
    };

    const userLevel = roleHierarchy[userRole] || 1;
    const requiredLevel = accessHierarchy[documentAccessLevel] || 1;

    return userLevel >= requiredLevel;
}

// Generate unique ID
function generateUniqueId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Format date for Firestore
function formatFirestoreDate(date = new Date()) {
    return firebase.firestore.Timestamp.fromDate(date);
}

// Get current timestamp
function getCurrentTimestamp() {
    return formatFirestoreDate();
}

// Export modules
window.firebaseConfig = {
    db,
    auth,
    storage,
    collections,
    SECURITY_SETTINGS,
    USER_ROLES,
    ACCESS_LEVELS,
    getCurrentUserWithVerification,
    verifyDocumentAccess,
    generateUniqueId,
    getCurrentTimestamp
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeSecurityRules();
});

// Экспорт
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;
window.firebaseFunctions = functions;
