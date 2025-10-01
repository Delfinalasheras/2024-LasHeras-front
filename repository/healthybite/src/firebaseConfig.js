// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
/*
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  databaseURL: "https://healthybite-b2a20-default-rtdb.firebaseio.com",
};
*/
const firebaseConfig = {
  apiKey: "AIzaSyAj7bvrsWHqcMVTX8gWoUgRdBURUACd4dA",
  authDomain: "finalhealthybite.firebaseapp.com",
  projectId: "finalhealthybite",
  storageBucket: "finalhealthybite.firebasestorage.app",
  messagingSenderId: "160483540235",
  appId: "1:160483540235:web:80f4846bb0d47b67e6b60e",
  measurementId: "G-DNZ541DT4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);

// Export the services for use in other parts of the app
export { auth, firestore };
