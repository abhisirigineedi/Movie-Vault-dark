// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAb65uCm0uqOUHgouMNnhhA2LnwqCBTUxE",
  authDomain: "movie-vault-1e62f.firebaseapp.com",
  projectId: "movie-vault-1e62f",
  storageBucket: "movie-vault-1e62f.firebasestorage.app",
  messagingSenderId: "162403429560",
  appId: "1:162403429560:web:a9a011954c08af14e6984d",
  measurementId: "G-V26MQC4RK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
