import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Firebase configuration
const firebaseConfig = {
  apiKey: "import.meta.env.VITE_API_KEY",
  authDomain: "licencjat-1d82c.firebaseapp.com",
  projectId: "licencjat-1d82c",
  storageBucket: "licencjat-1d82c.appspot.com",
  messagingSenderId: "571678890636",
  appId: "1:571678890636:web:76ab021d1aa64b08a1f9a9",
  measurementId: "G-N00K2DFKB9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore();
export const storage = getStorage();
