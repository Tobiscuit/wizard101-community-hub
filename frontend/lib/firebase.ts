import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

let firebaseConfig;

try {
  firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
    ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
    : null;
} catch (error) {
  console.error("Failed to parse NEXT_PUBLIC_FIREBASE_CONFIG:", error);
  firebaseConfig = null;
}

export function getFirebaseApp() {
  if (getApps().length === 0) {
    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
        if (process.env.NODE_ENV !== 'production') {
             console.warn("NEXT_PUBLIC_FIREBASE_CONFIG not found or invalid. Using mock for build/dev.");
        }
        return initializeApp({
            apiKey: "mock-api-key",
            authDomain: "mock-project.firebaseapp.com",
            projectId: "mock-project",
            storageBucket: "mock-project.appspot.com",
            messagingSenderId: "1234567890",
            appId: "1:1234567890:web:123456"
        });
    }
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export const db = getFirestore(getFirebaseApp());
export const auth = getAuth(getFirebaseApp());
