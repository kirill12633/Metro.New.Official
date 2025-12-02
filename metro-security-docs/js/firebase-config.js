// Firebase configuration for GitHub deployment
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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Initialize App Check
const appCheck = firebase.appCheck();
appCheck.activate('6Ld9uw0sAAAAAMTSxQ9Vxd0LhEcwweHGF-DWdZIo', true);

// Firestore collections with proper paths
const collections = {
    USERS: db.collection('metro-security-docs').doc('system').collection('users'),
    DOCUMENTS: db.collection('metro-security-docs').doc('system').collection('documents'),
    SESSIONS: db.collection('metro-security-docs').doc('system').collection('sessions'),
    AUDIT_LOGS: db.collection('metro-security-docs').doc('system').collection('audit_logs'),
    SECURITY_EVENTS: db.collection('metro-security-docs').doc('system').collection('security_events'),
    SETTINGS: db.collection('metro-security-docs').doc('system').collection('settings')
};

// Helper functions for Firestore operations
class FirebaseHelper {
    // Get user document
    static async getUserDoc(userId) {
        const userDoc = await collections.USERS.doc(userId).get();
        return userDoc.exists ? userDoc.data() : null;
    }

    // Get user with full data
    static async getUserWithData(userId) {
        const user = auth.currentUser;
        if (!user || user.uid !== userId) return null;
        
        const userData = await this.getUserDoc(userId);
        return userData ? { ...user, ...userData } : null;
    }

    // Get all users (admin only)
    static async getAllUsers() {
        const snapshot = await collections.USERS.get();
        const users = [];
        snapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return users;
    }

    // Get documents with access control
    static async getDocumentsForUser(userId, userRole) {
        const allowedLevels = this.getAllowedAccessLevels(userRole);
        
        const snapshot = await collections.DOCUMENTS
            .where('accessLevel', 'in', allowedLevels)
            .orderBy('uploadDate', 'desc')
            .get();
        
        const documents = [];
        snapshot.forEach(doc => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return documents;
    }

    // Get allowed access levels based on role
    static getAllowedAccessLevels(userRole) {
        const levels = ['public'];
        
        if (['viewer', 'manager', 'admin', 'auditor'].includes(userRole)) {
            levels.push('internal');
        }
        
        if (['manager', 'admin', 'auditor'].includes(userRole)) {
            levels.push('confidential');
        }
        
        if (['admin', 'auditor'].includes(userRole)) {
            levels.push('secret', 'top_secret');
        }
        
        return levels;
    }

    // Check document access
    static async checkDocumentAccess(documentId, userId) {
        const userDoc = await this.getUserDoc(userId);
        if (!userDoc) return false;
        
        const docSnapshot = await collections.DOCUMENTS.doc(documentId).get();
        if (!docSnapshot.exists) return false;
        
        const docData = docSnapshot.data();
        const allowedLevels = this.getAllowedAccessLevels(userDoc.role);
        
        return allowedLevels.includes(docData.accessLevel);
    }

    // Create audit log
    static async createAuditLog(data) {
        return await collections.AUDIT_LOGS.add({
            ...data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // Create security event
    static async createSecurityEvent(eventType, userId, details, severity = 'medium') {
        return await collections.SECURITY_EVENTS.add({
            eventType,
            userId,
            details,
            severity,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ipAddress: await this.getIPAddress()
        });
    }

    // Get IP address
    static async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    // Update document view count
    static async incrementDocumentView(documentId) {
        const docRef = collections.DOCUMENTS.doc(documentId);
        await docRef.update({
            viewCount: firebase.firestore.FieldValue.increment(1),
            lastViewed: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // Create session
    static async createSession(userId, sessionData) {
        const sessionId = this.generateId();
        await collections.SESSIONS.doc(sessionId).set({
            sessionId,
            userId,
            ...sessionData,
            startTime: firebase.firestore.FieldValue.serverTimestamp(),
            active: true
        });
        return sessionId;
    }

    // End session
    static async endSession(sessionId) {
        await collections.SESSIONS.doc(sessionId).update({
            active: false,
            endTime: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get settings
    static async getSettings(docId) {
        const snapshot = await collections.SETTINGS.doc(docId).get();
        return snapshot.exists ? snapshot.data() : {};
    }

    // Update settings
    static async updateSettings(docId, data) {
        await collections.SETTINGS.doc(docId).set(data, { merge: true });
    }
}

// Security configuration
const SECURITY_CONFIG = {
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 минут
    MAX_LOGIN_ATTEMPTS: 5,
    ALLOWED_FILE_TYPES: ['pdf', 'docx', 'doc', 'xlsx', 'pptx', 'jpg', 'png', 'jpeg'],
    MAX_FILE_SIZE: 50 * 1024 * 1024 // 50MB
};

// User roles constants
const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    VIEWER: 'viewer',
    AUDITOR: 'auditor',
    GUEST: 'guest'
};

// Access levels constants
const ACCESS_LEVELS = {
    PUBLIC: 'public',
    INTERNAL: 'internal',
    CONFIDENTIAL: 'confidential',
    SECRET: 'secret',
    TOP_SECRET: 'top_secret'
};

// Initialize Firestore settings
async function initializeFirestore() {
    try {
        // Enable offline persistence
        await db.enablePersistence();
        
        // Initialize default settings if not exists
        const securitySettings = await FirebaseHelper.getSettings('security');
        if (!securitySettings.sessionTimeout) {
            await FirebaseHelper.updateSettings('security', {
                sessionTimeout: SECURITY_CONFIG.SESSION_TIMEOUT,
                maxLoginAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
                strictGeolocation: false,
                watermarkEnabled: true,
                geolocationEnabled: true
            });
        }

    } catch (error) {
        console.error('Firestore initialization error:', error);
    }
}

// Export everything
window.firebaseApp = {
    app,
    db,
    auth,
    storage,
    collections,
    FirebaseHelper,
    SECURITY_CONFIG,
    USER_ROLES,
    ACCESS_LEVELS,
    initializeFirestore
};

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeFirestore);
