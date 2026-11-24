import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  doc,
  setDoc,
  type Firestore,
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || "AIzaSyAFMjBXhd6x1lGPY9Ofgt4ZQ3SvKPy_UR0",
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || "boardwallah-cbse.firebaseapp.com",
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || "boardwallah-cbse",
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || "boardwallah-cbse.firebasestorage.app",
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "330123412447",
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || "1:330123412447:web:c8808b31f3d1ccbf4cba6a",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

export const app: FirebaseApp | null = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth: Auth | null = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const db: Firestore | null = app ? getFirestore(app) : null;

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  doc,
  setDoc,
};
export type { User };
