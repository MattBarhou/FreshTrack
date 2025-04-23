import { GOOGLE_API_KEY } from "@env";

// Import only the functions you need from the SDKs.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: GOOGLE_API_KEY,
  authDomain: "foodexpiry-5b887.firebaseapp.com",
  projectId: "foodexpiry-5b887",
  storageBucket: "foodexpiry-5b887.firebasestorage.app",
  messagingSenderId: "528645833888",
  appId: "1:528645833888:web:a0219d5c182e9a6493f5c5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
