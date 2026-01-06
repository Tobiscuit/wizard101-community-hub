import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { safeJsonParse } from "@/lib/safe-json";

const rawConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
console.log("Firebase Init - Raw Config Type:", typeof rawConfig);
console.log("Firebase Init - Raw Config Length:", rawConfig?.length);
// console.log("Firebase Init - Raw Config Value:", rawConfig); // Uncomment if safe, but risky for logs

const firebaseConfig = safeJsonParse(rawConfig);
console.log("Firebase Init - Parsed Config Keys:", Object.keys(firebaseConfig || {}));

export function getFirebaseApp() {
  if (getApps().length === 0) {
    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
        console.error("FIREBASE CONFIG MISSING OR INVALID. Falling back to Mock.");
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
    console.log("Initializing Firebase with Project:", (firebaseConfig as any).projectId);
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// ... (existing imports)

// Initialize Firestore with standard offline persistence (V9+ Modular SDK)
export const db = initializeFirestore(getFirebaseApp(), {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});
export const auth = getAuth(getFirebaseApp());
