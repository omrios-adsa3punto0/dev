// src/firebaseConfig.ts
import { initializeApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app";

import { getAnalytics, isSupported } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

const analyticsPromise: Promise<Analytics | null> = (async () => {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
})();

export { app, auth, db, analyticsPromise };
export const storage = getStorage(app);
