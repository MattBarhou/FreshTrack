// firebase.js

// Import only the functions you need from the SDKs.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBE6uMiRcO4U_vabP969CikV_uH2c_n9r0",
  authDomain: "foodexpiry-5b887.firebaseapp.com",
  projectId: "foodexpiry-5b887",
  storageBucket: "foodexpiry-5b887.firebasestorage.app", // Verify this value in your Firebase Console if needed.
  messagingSenderId: "528645833888",
  appId: "1:528645833888:web:a0219d5c182e9a6493f5c5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
