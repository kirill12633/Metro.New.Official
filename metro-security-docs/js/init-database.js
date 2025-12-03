// js/init-database.js
async function initializeDatabase() {
    try {
        const db = firebase.firestore();
        const auth = firebase.auth();
        
        // Проверяем, инициализирована ли уже база
        const systemDoc = await db.collection('system').doc('config').get();
        
        if (!systemDoc.exists) {
            console.log('🚀 Инициализируем базу данных...');
            
            // Создаем системную конфигурацию
            await db.collection('system').doc('config').set({
                initialized: true,
                version: '1.0.0',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                securityLevel: 'high',
                watermarkEnabled: true,
                sessionTimeout: 30,
                maxLoginAttempts: 5
            });
            
            // Создаем роли
            await db.collection('system').doc('roles').set({
                admin: {
                    permissions: ['all'],
                    description: 'Полный доступ ко всем функциям'
                },
                manager: {
                    permissions: ['view_documents', 'upload_documents', 'view_users'],
                    description: 'Управление документами и пользователями'
                },
                viewer: {
                    permissions: ['view_documents'],
                    description: 'Просмотр разрешенных документов'
                }
            });
            
            // Создаем начальные документы
            const initialDocuments = [
                {
                    name: 'Руководство по безопасности.pdf',
                    type: 'pdf',
                    size: 2450000,
                    accessLevel: 'confidential',
                    uploaderId: 'system',
                    uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
                    tags: ['безопасность', 'руководство', 'обязательно'],
                    description: 'Основное руководство по информационной безопасности'
                },
                {
                    name: 'Технический регламент.docx',
                    type: 'docx',
                    size: 1800000,
                    accessLevel: 'internal',
                    uploaderId: 'system',
                    uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
                    tags: ['технический', 'регламент', 'оборудование'],
                    description: 'Технический регламент эксплуатации оборудования'
                },
                {
                    name: 'Схема эвакуации.jpg',
                    type: 'jpg',
                    size: 4200000,
                    accessLevel: 'public',
                    uploaderId: 'system',
                    uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
                    tags: ['эвакуация', 'схема', 'безопасность'],
                    description: 'Основные схемы эвакуации станций'
                }
            ];
            
            for (const doc of initialDocuments) {
                await db.collection('documents').add(doc);
            }
            
            console.log('✅ База данных успешно инициализирована');
            
            // Создаем начального админа если нужно
            const adminEmail = 'admin@metro-security.ru';
            const adminUsers = await db.collection('users')
                .where('email', '==', adminEmail)
                .get();
                
            if (adminUsers.empty) {
                const user = auth.currentUser;
                if (user) {
                    await db.collection('users').doc(user.uid).set({
                        email: adminEmail,
                        role: 'admin',
                        active: true,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                        displayName: 'Системный администратор',
                        department: 'ИТ безопасность',
                        phone: '+7 (XXX) XXX-XX-XX'
                    });
                    console.log('👑 Создан администратор системы');
                }
            }
            
        } else {
            console.log('✅ База данных уже инициализирована');
        }
        
    } catch (error) {
        console.error('❌ Ошибка инициализации базы данных:', error);
    }
}

// Запуск инициализации при загрузке админ-панели
if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', initializeDatabase);
}
