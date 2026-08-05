// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "dora-ai-705ad.firebaseapp.com",
  projectId: "dora-ai-705ad",
  storageBucket: "dora-ai-705ad.firebasestorage.app",
  messagingSenderId: "552211888295",
  appId: "1:552211888295:web:a6069217b1a0eca6bbc382"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth, provider}