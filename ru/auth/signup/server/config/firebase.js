import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Инициализация Firebase Admin SDK
let firebaseApp;

try {
  // Попытка использовать service account key из файла
  const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, 'firebase-admin-key.json'), 'utf8')
  );
  
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
} catch (error) {
  // Если нет файла, используем переменные окружения
  console.warn('Using environment variables for Firebase Admin...');
  
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;
