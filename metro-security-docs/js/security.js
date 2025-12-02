// Security system with Firestore integration
class SecuritySystem {
    constructor() {
        this.suspiciousActivities = [];
        this.init();
    }

    async init() {
        // Monitor security events in real-time
        this.setupSecurityMonitoring();
    }

    async setupSecurityMonitoring() {
        // Real-time listener for security events
        firebaseConfig.db
            .collection(firebaseConfig.collections.SECURITY_EVENTS)
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const event = change.doc.data();
                        this.handleSecurityEvent(event);
                    }
                });
            });
    }

    async handleSecurityEvent(event) {
        console.log('Security Event:', event);
        
        // Add to local array for dashboard
        this.suspiciousActivities.unshift(event);
        if (this.suspiciousActivities.length > 100) {
            this.suspiciousActivities.pop();
        }

        // Update dashboard if open
        this.updateSecurityDashboard();

        // Take action based on severity
        switch (event.severity) {
            case 'high':
                await this.handleHighSeverityEvent(event);
                break;
            case 'medium':
                await this.handleMediumSeverityEvent(event);
                break;
        }
    }

    async handleHighSeverityEvent(event) {
        // Block user session if multiple failed logins
        if (event.eventType === 'blocked_login' || event.eventType === 'access_denied') {
            await this.blockUser(event.userId);
        }

        // Send immediate notification
        await this.sendEmergencyAlert(event);
    }

    async handleMediumSeverityEvent(event) {
        // Log and monitor
        console.warn('Medium security event:', event);
    }

    async blockUser(userId) {
        try {
            // Update user status in Firestore
            await firebaseConfig.db
                .collection(firebaseConfig.collections.USERS)
                .doc(userId)
                .update({
                    blocked: true,
                    blockedAt: firebaseConfig.getCurrentTimestamp(),
                    blockedReason: 'Подозрительная активность'
                });

            // Terminate all active sessions
            const sessionsSnapshot = await firebaseConfig.db
                .collection(firebaseConfig.collections.SESSIONS)
                .where('userId', '==', userId)
                .where('active', '==', true)
                .get();

            const batch = firebaseConfig.db.batch();
            sessionsSnapshot.forEach((doc) => {
                batch.update(doc.ref, {
                    active: false,
                    terminatedBy: 'security_system',
                    terminatedAt: firebaseConfig.getCurrentTimestamp()
                });
            });
            await batch.commit();

        } catch (error) {
            console.error('Error blocking user:', error);
        }
    }

    async sendEmergencyAlert(event) {
        // Here you would integrate with email/SMS/telegram notifications
        console.log('EMERGENCY ALERT:', event);
        
        // For demo, just show browser notification
        if (Notification.permission === 'granted') {
            new Notification('⚠️ Событие безопасности', {
                body: `${event.eventType}: ${event.details}`,
                icon: 'assets/logo.png'
            });
        }
    }

    updateSecurityDashboard() {
        const alertCount = document.getElementById('alertCount');
        const activeAlerts = document.getElementById('activeAlerts');
        const accessAttempts = document.getElementById('accessAttempts');

        if (alertCount) {
            const highSeverityCount = this.suspiciousActivities
                .filter(e => e.severity === 'high').length;
            alertCount.textContent = highSeverityCount;
        }

        if (activeAlerts) {
            const recentAlerts = this.suspiciousActivities
                .filter(e => new Date() - e.timestamp.toDate() < 3600000).length;
            activeAlerts.textContent = recentAlerts;
        }

        if (accessAttempts) {
            const failedLogins = this.suspiciousActivities
                .filter(e => e.eventType === 'failed_login').length;
            accessAttempts.textContent = failedLogins;
        }
    }

    // Document access control
    async checkDocumentAccess(documentId, userId) {
        return await firebaseConfig.verifyDocumentAccess(documentId, userId);
    }

    // IP whitelisting/blacklisting
    async checkIPAccess(ipAddress) {
        const settingsDoc = await firebaseConfig.db
            .collection(firebaseConfig.collections.SETTINGS)
            .doc('ip_filters')
            .get();

        if (!settingsDoc.exists) return true;

        const settings = settingsDoc.data();
        
        // Check blacklist
        if (settings.blacklist && settings.blacklist.includes(ipAddress)) {
            await authSystem.logSecurityEvent('blocked_ip', 'system', `IP заблокирован: ${ipAddress}`);
            return false;
        }

        // Check whitelist if enabled
        if (settings.whitelistEnabled && settings.whitelist && !settings.whitelist.includes(ipAddress)) {
            await authSystem.logSecurityEvent('unauthorized_ip', 'system', `IP не в whitelist: ${ipAddress}`);
            return false;
        }

        return true;
    }

    // Time-based access control
    async checkTimeAccess() {
        const settingsDoc = await firebaseConfig.db
            .collection(firebaseConfig.collections.SETTINGS)
            .doc('access_hours')
            .get();

        if (!settingsDoc.exists) return true;

        const settings = settingsDoc.data();
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 - Sunday, 6 - Saturday

        if (settings.enabled) {
            // Check day restrictions
            if (settings.allowedDays && !settings.allowedDays.includes(currentDay)) {
                return false;
            }

            // Check time restrictions
            if (currentHour < settings.startHour || currentHour >= settings.endHour) {
                return false;
            }
        }

        return true;
    }

    // Device fingerprinting
    generateDeviceFingerprint() {
        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            platform: navigator.platform,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack
        };

        return btoa(JSON.stringify(fingerprint));
    }

    // Validate file upload
    validateFileUpload(file) {
        const maxSize = firebaseConfig.SECURITY_SETTINGS.MAX_FILE_SIZE;
        const allowedTypes = firebaseConfig.SECURITY_SETTINGS.ALLOWED_FILE_TYPES;
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            return {
                valid: false,
                error: `Тип файла .${fileExtension} не поддерживается`
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                error: `Размер файла превышает ${maxSize / 1024 / 1024}MB`
            };
        }

        // Check for malicious file names
        const maliciousPatterns = /\.\.\/|\.\.\\|<\/|javascript:|vbscript:/i;
        if (maliciousPatterns.test(file.name)) {
            return {
                valid: false,
                error: 'Недопустимое имя файла'
            };
        }

        return { valid: true };
    }

    // Encrypt sensitive data (client-side demo)
    async encryptData(data, password) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        // Generate key from password
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('metro-security-salt'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            dataBuffer
        );

        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encrypted))
        };
    }

    // Generate security report
    async generateSecurityReport(startDate, endDate) {
        const report = {
            generatedAt: firebaseConfig.getCurrentTimestamp(),
            period: { startDate, endDate },
            summary: {},
            events: []
        };

        // Get security events
        const eventsSnapshot = await firebaseConfig.db
            .collection(firebaseConfig.collections.SECURITY_EVENTS)
            .where('timestamp', '>=', firebaseConfig.formatFirestoreDate(startDate))
            .where('timestamp', '<=', firebaseConfig.formatFirestoreDate(endDate))
            .get();

        eventsSnapshot.forEach(doc => {
            report.events.push(doc.data());
        });

        // Calculate statistics
        report.summary.totalEvents = report.events.length;
        report.summary.highSeverity = report.events.filter(e => e.severity === 'high').length;
        report.summary.failedLogins = report.events.filter(e => e.eventType === 'failed_login').length;
        report.summary.blockedAccess = report.events.filter(e => e.eventType === 'access_denied').length;

        return report;
    }
}

// Initialize security system
const securitySystem = new SecuritySystem();

// Export
window.securitySystem = securitySystem;
