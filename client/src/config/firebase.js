import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase Config Placeholder (User can replace with their actual Firebase project keys if desired)
const firebaseConfig = {
  apiKey: "AIzaSyDemoConfigKeyForNECAlumniPortalAuth",
  authDomain: "nec-alumni-portal.firebaseapp.com",
  projectId: "nec-alumni-portal",
  storageBucket: "nec-alumni-portal.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demoappid12345678"
};

// Initialize Firebase
let app = null;
let auth = null;
let googleProvider = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (e) {
  console.warn('Firebase initialization notice:', e.message);
}

export { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword };
