// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAj6GcpNo10XvJ-EgbEBYEyccp52RvLZGc",
  authDomain: "chuckyinterviewprep.firebaseapp.com",
  projectId: "chuckyinterviewprep",
  storageBucket: "chuckyinterviewprep.firebasestorage.app",
  messagingSenderId: "1014476670674",
  appId: "1:1014476670674:web:4a99130eb63c54fea38f0b",
  measurementId: "G-7BFVE9QWES"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth =getAuth(app);
export const db = getFirestore(app);