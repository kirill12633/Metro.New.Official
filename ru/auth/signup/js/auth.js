// ============================================
// АУТЕНТИФИКАЦИЯ
// ============================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isProcessing = false;
    }
    
    // ============================================
    // ПОЛУЧЕНИЕ IP И ГЕОЛОКАЦИИ
    // ============================================
    async getUserGeoData() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            return {
                ip: data.ip || '0.0.0.0',
                country: data.country_code || 'UNKNOWN',
                countryName: data.country_name || 'Unknown',
                region: data.region || 'Unknown',
                city: data.city || 'Unknown',
                timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                languages: navigator.languages.join(',') || navigator.language || 'unknown'
            };
        } catch (error) {
            console.warn('Не удалось получить геоданные:', error);
            
            return {
                ip: '0.0.0.0',
                country: 'UNKNOWN',
                countryName: 'Unknown',
                region: 'Unknown',
                city: 'Unknown',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                languages: navigator.languages.join(',') || navigator.language || 'unknown'
            };
        }
    }
    
    // ============================================
    // РЕГИСТРАЦИЯ
    // ============================================
    async register(userData) {
        const {
            email,
            password,
            firstName,
            username,
            birthDay,
            birthMonth,
            birthYear,
            marketingConsent = false
        } = userData;
        
        // Блокировка повторной регистрации
        if (!await security.acquireRegistrationLock(email)) {
            throw new Error('Регистрация с этим email уже выполняется');
        }
        
        try {
            // Проверка rate limit
            const ipData = await this.getUserGeoData();
            const rateCheck = security.checkRateLimit(ipData.ip);
            
            if (rateCheck.limited) {
                throw new Error(`Слишком много попыток. Подождите ${rateCheck.timeLeft} секунд`);
            }
            
            // Проверка IP блокировки
            const ipBlock = security.checkIPBlock(ipData.ip);
            if (ipBlock.blocked) {
                throw new Error(`IP заблокирован. Подождите ${Math.ceil(ipBlock.timeLeft / 60)} минут`);
            }
            
            // Валидация email
            const emailValidation = security.validateEmail(email);
            if (!emailValidation.valid) {
                throw new Error(emailValidation.message);
            }
            
            // Валидация имени
            const nameValidation = security.validateName(firstName);
            if (!nameValidation.valid) {
                throw new Error(nameValidation.message);
            }
            
            // Валидация никнейма
            const usernameValidation = security.validateUsername(username);
            if (!usernameValidation.valid) {
                throw new Error(usernameValidation.message);
            }
            
            // Валидация пароля
            const passwordValidation = security.validatePassword(password);
            if (!passwordValidation.valid) {
                throw new Error(`Пароль слишком слабый. ${passwordValidation.requirements.join(', ')}`);
            }
            
            // Проверка возраста
            const ageData = security.calculateAge(birthDay, birthMonth, birthYear);
            if (!ageData.canRegister) {
                throw new Error('Регистрация доступна только с 13 лет');
            }
            
            // Проверка уникальности никнейма в Firestore
            const { db, collection, query, where, getDocs } = window.firebaseDB;
            
            if (db) {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("username", "==", username.toLowerCase()));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    throw new Error('Это имя пользователя уже занято');
                }
            }
            
            // Хеширование email для хранения
            const emailHash = await security.hashEmail(email);
            
            // Создание пользователя в Firebase Auth
            const { auth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = window.firebaseAuth;
            
            if (!auth) {
                throw new Error('Сервис временно недоступен');
            }
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Обновление профиля
            await updateProfile(user, {
                displayName: firstName
            });
            
            // Отправка письма подтверждения
            await sendEmailVerification(user);
            
            // Создание записи в Firestore
            if (db) {
                const { doc, setDoc, serverTimestamp, addDoc } = window.firebaseDB;
                
                // Данные аккаунта (НЕЛЬЗЯ изменять/удалять)
                const accountData = {
                    uid: user.uid,
                    email: security.sanitizeInput(email),
                    emailMasked: maskEmail(email),
                    emailHash: emailHash,
                    firstName: security.sanitizeInput(firstName),
                    username: security.sanitizeInput(username.toLowerCase()),
                    displayName: security.sanitizeInput(firstName),
                    birthDate: {
                        day: parseInt(birthDay),
                        month: parseInt(birthMonth),
                        year: parseInt(birthYear)
                    },
                    age: ageData.age,
                    ageGroup: ageData.group,
                    createdAt: serverTimestamp(),
                    registrationIP: ipData.ip,
                    registrationCountry: ipData.country,
                    registrationRegion: ipData.region,
                    registrationCity: ipData.city,
                    registrationLanguage: ipData.languages,
                    registrationPage: CONFIG.registrationPage,
                    registrationMethod: 'email',
                    acceptedDocuments: {
                        termsAccepted: true,
                        termsVersion: CONFIG.termsVersion,
                        termsAcceptedAt: serverTimestamp(),
                        privacyAccepted: true,
                        privacyVersion: CONFIG.privacyVersion,
                        privacyAcceptedAt: serverTimestamp()
                    },
                    marketingConsent: marketingConsent,
                    emailVerified: false,
                    emailVerifiedAt: null,
                    status: 'pending_verification',
                    deviceInfo: security.getDeviceInfo()
                };
                
                // Создание в коллекции users/{uid}/accountData
                await setDoc(doc(db, 'users', user.uid, 'accountData'), accountData);
                
                // Создание документа безопасности
                await setDoc(doc(db, 'users', user.uid, 'security'), {
                    uid: user.uid,
                    failedLoginAttempts: 0,
                    lastFailedLogin: null,
                    accountLocked: false,
                    lockReason: null,
                    twoFactorEnabled: false,
                    createdAt: serverTimestamp()
                });
                
                // Резервирование никнейма
                await setDoc(doc(db, 'usernames', username.toLowerCase()), {
                    uid: user.uid,
                    createdAt: serverTimestamp(),
                    reserved: true
                });
                
                // Логирование согласия
                await addDoc(collection(db, 'consent_logs'), {
                    uid: user.uid,
                    email: email,
                    type: 'registration_terms',
                    marketingConsent: marketingConsent,
                    acceptedAt: serverTimestamp(),
                    ip: ipData.ip,
                    userAgent: navigator.userAgent,
                    termsVersion: CONFIG.termsVersion,
                    privacyVersion: CONFIG.privacyVersion
                });
                
                // Запись первого входа
                await this.logLogin(user.uid, email, ipData, true);
            }
            
            return {
                success: true,
                user: user,
                message: 'Аккаунт создан! Проверьте email для подтверждения.'
            };
            
        } catch (error) {
            security.logError(error, { 
                module: 'auth', 
                action: 'register', 
                email: maskEmail(email) 
            });
            
            throw error;
            
        } finally {
            security.releaseRegistrationLock(email);
        }
    }
    
    // ============================================
    // ВХОД
    // ============================================
    async login(email, password, rememberMe = false) {
        try {
            // Проверка rate limit
            const ipData = await this.getUserGeoData();
            const rateCheck = security.checkRateLimit(ipData.ip);
            
            if (rateCheck.limited) {
                throw new Error(`Слишком много попыток. Подождите ${rateCheck.timeLeft} секунд`);
            }
            
            // Проверка IP блокировки
            const ipBlock = security.checkIPBlock(ipData.ip);
            if (ipBlock.blocked) {
                throw new Error(`Доступ заблокирован. Причина: ${ipBlock.reason}`);
            }
            
            const { auth, signInWithEmailAndPassword } = window.firebaseAuth;
            
            if (!auth) {
                throw new Error('Сервис временно недоступен');
            }
            
            // Вход
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Проверка подтверждения email
            if (!user.emailVerified) {
                // Выход если email не подтверждён
                const { signOut, sendEmailVerification } = window.firebaseAuth;
                await signOut(auth);
                
                throw new Error('EMAIL_NOT_VERIFIED');
            }
            
            // Обновление данных входа
            if (window.firebaseDB.db) {
                const { db, doc, setDoc, serverTimestamp } = window.firebaseDB;
                
                try {
                    await setDoc(doc(db, 'users', user.uid, 'security'), {
                        lastLoginAt: serverTimestamp(),
                        lastIP: ipData.ip,
                        lastDevice: security.getDeviceInfo()
                    }, { merge: true });
                } catch (dbError) {
                    console.warn('Не удалось обновить данные входа:', dbError);
                }
            }
            
            // Сохранение сессии если "Запомнить меня"
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Логирование входа
            await this.logLogin(user.uid, email, ipData, false);
            
            return {
                success: true,
                user: user,
                message: 'Вход выполнен!'
            };
            
        } catch (error) {
            // Логирование неудачной попытки
            const ipData = await this.getUserGeoData();
            
            if (window.firebaseDB.db) {
                await this.logFailedLogin(email, ipData, error.message);
            }
            
            security.logError(error, { 
                module: 'auth', 
                action: 'login', 
                email: maskEmail(email) 
            });
            
            throw error;
        }
    }
    
    // ============================================
    // ВХОД ЧЕРЕЗ GOOGLE
    // ============================================
    async loginWithGoogle() {
        try {
            const { auth, signInWithPopup, googleProvider } = window.firebaseAuth;
            
            if (!auth || !googleProvider) {
                throw new Error('Сервис временно недоступен');
            }
            
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Получение геоданных
            const ipData = await this.getUserGeoData();
            
            // Проверка есть ли пользователь в Firestore
            if (window.firebaseDB.db) {
                const { db, doc, getDoc, setDoc, serverTimestamp } = window.firebaseDB;
                
                const userDoc = await getDoc(doc(db, 'users', user.uid, 'accountData'));
                
                if (!userDoc.exists()) {
                    // Создание записи для нового Google пользователя
                    const ageData = security.calculateAge(1, 1, 2000); // По умолчанию 18+
                    
                    await setDoc(doc(db, 'users', user.uid, 'accountData'), {
                        uid: user.uid,
                        email: user.email,
                        emailMasked: maskEmail(user.email),
                        emailHash: await security.hashEmail(user.email),
                        firstName: user.displayName || 'Пользователь',
                        username: user.email.split('@')[0].toLowerCase(),
                        displayName: user.displayName || 'Пользователь',
                        birthDate: null,
                        age: 18,
                        ageGroup: '18+',
                        createdAt: serverTimestamp(),
                        registrationIP: ipData.ip,
                        registrationCountry: ipData.country,
                        registrationMethod: 'google',
                        emailVerified: true,
                        emailVerifiedAt: serverTimestamp(),
                        status: 'active',
                        deviceInfo: security.getDeviceInfo()
                    });
                }
            }
            
            // Логирование входа
            await this.logLogin(user.uid, user.email, ipData, false);
            
            return {
                success: true,
                user: user,
                message: 'Вход через Google выполнен!'
            };
            
        } catch (error) {
            security.logError(error, { module: 'auth', action: 'googleLogin' });
            throw error;
        }
    }
    
    // ============================================
    // СБРОС ПАРОЛЯ
    // ============================================
    async resetPassword(email) {
        try {
            const { auth, sendPasswordResetEmail } = window.firebaseAuth;
            
            if (!auth) {
                throw new Error('Сервис временно недоступен');
            }
            
            await sendPasswordResetEmail(auth, email);
            
            return {
                success: true,
                message: 'Ссылка для сброса пароля отправлена на email'
            };
            
        } catch (error) {
            security.logError(error, { 
                module: 'auth', 
                action: 'resetPassword', 
                email: maskEmail(email) 
            });
            
            throw error;
        }
    }
    
    // ============================================
    // ПОВТОРНАЯ ОТПРАВКА ПОДТВЕРЖДЕНИЯ
    // ============================================
    async resendVerification() {
        try {
            const { auth, sendEmailVerification } = window.firebaseAuth;
            
            if (!auth || !auth.currentUser) {
                throw new Error('Пользователь не найден');
            }
            
            await sendEmailVerification(auth.currentUser);
            
            return {
                success: true,
                message: 'Письмо отправлено повторно'
            };
            
        } catch (error) {
            security.logError(error, { module: 'auth', action: 'resendVerification' });
            throw error;
        }
    }
    
    // ============================================
    // ЛОГИРОВАНИЕ ВХОДА
    // ============================================
    async logLogin(uid, email, ipData, isRegistration = false) {
        if (!window.firebaseDB.db) return;
        
        try {
            const { db, collection, addDoc, serverTimestamp } = window.firebaseDB;
            
            const loginData = {
                uid: uid,
                email: maskEmail(email),
                timestamp: serverTimestamp(),
                ip: ipData.ip,
                country: ipData.country,
                region: ipData.region,
                city: ipData.city,
                device: security.getDeviceInfo(),
                loginMethod: 'email',
                success: true,
                isRegistrationLogin: isRegistration,
                userAgent: navigator.userAgent,
                timezone: ipData.timezone
            };
            
            await addDoc(collection(db, 'login_history'), loginData);
            
        } catch (error) {
            console.warn('Не удалось записать историю входа:', error);
        }
    }
    
    // ============================================
    // ЛОГИРОВАНИЕ НЕУДАЧНОГО ВХОДА
    // ============================================
    async logFailedLogin(email, ipData, reason) {
        if (!window.firebaseDB.db) return;
        
        try {
            const { db, collection, addDoc, serverTimestamp } = window.firebaseDB;
            
            const failedData = {
                email: maskEmail(email),
                timestamp: serverTimestamp(),
                ip: ipData.ip,
                country: ipData.country,
                region: ipData.region,
                city: ipData.city,
                device: security.getDeviceInfo(),
                loginMethod: 'email',
                success: false,
                failureReason: reason || 'unknown',
                userAgent: navigator.userAgent
            };
            
            await addDoc(collection(db, 'login_history'), failedData);
            
        } catch (error) {
            console.warn('Не удалось записать неудачный вход:', error);
        }
    }
    
    // ============================================
    // ВЫХОД
    // ============================================
    async logout() {
        try {
            const { auth, signOut } = window.firebaseAuth;
            
            if (auth) {
                await signOut(auth);
            }
            
            localStorage.removeItem('rememberedEmail');
            
            return {
                success: true,
                message: 'Выход выполнен'
            };
            
        } catch (error) {
            security.logError(error, { module: 'auth', action: 'logout' });
            throw error;
        }
    }
}

// Создание глобального экземпляра
const authManager = new AuthManager();

console.log('🔑 Модуль аутентификации загружен');
