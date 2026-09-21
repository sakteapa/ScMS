// Firebase Web SDK v10.8.0 configuration & offline persistence
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  disableNetwork,
  enableNetwork,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

// Standard Firebase configuration with fallback to environment variables or demo configuration
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoMizoramSchoolKey2026Secure01",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zoxs-sms-mizoram.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zoxs-sms-mizoram",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zoxs-sms-mizoram.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "928374910283",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:928374910283:web:a9f82d1c7e4b901a"
};

// Check if a configuration object represents an active live backend rather than a demo placeholder
export function checkIsLiveConfig(config) {
  if (!config || !config.apiKey || !config.projectId) return false;
  if (
    config.apiKey.includes('Demo') ||
    config.apiKey.includes('demo') ||
    config.apiKey.startsWith('demo-') ||
    config.apiKey === 'AIzaSyDemoMizoramSchoolKey2026Secure01' ||
    config.projectId === 'zoxs-sms-demo' ||
    config.projectId === 'zoxs-sms-mizoram'
  ) {
    return false;
  }
  return true;
}

// Check if user has provided custom config in localStorage
export function getStoredFirebaseConfig() {
  try {
    const custom = localStorage.getItem('zoxs_custom_firebase_config');
    if (custom) {
      return JSON.parse(custom);
    }
  } catch (e) {
    console.warn('Failed to parse custom firebase config', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveStoredFirebaseConfig(config) {
  try {
    localStorage.setItem('zoxs_custom_firebase_config', JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    console.error('Failed to save firebase config', e);
  }
}

// Check whether live Firebase is genuinely configured
const currentConfig = getStoredFirebaseConfig();
export const isLiveFirebaseConfigured = checkIsLiveConfig(currentConfig);

// Initialize Firebase App
let app;
let db;
let auth;
let isOfflinePersistenceActive = false;

try {
  app = !getApps().length ? initializeApp(currentConfig) : getApp();

  // Initialize Firestore with robust multi-tab offline persistence
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    isOfflinePersistenceActive = true;
    console.log('Firebase v10.8.0 initialized with multi-tab offline persistence');
  } catch (persistenceError) {
    console.warn('Persistence fallback to standard getFirestore:', persistenceError);
    db = getFirestore(app);
  }

  // If live backend credentials are not configured, keep Firestore strictly in offline mode
  // so the SDK does not attempt remote connections that fail with permission errors
  if (!isLiveFirebaseConfigured && db) {
    disableNetwork(db).catch(() => {});
  }

  auth = getAuth(app);
} catch (err) {
  console.error('Firebase initialization notice:', err);
}

export { 
  app, 
  db, 
  auth, 
  isOfflinePersistenceActive,
  disableNetwork,
  enableNetwork,
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
};
