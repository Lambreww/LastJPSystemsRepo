// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1rAMqqP7aBsBsp0DeFNatPe1HPYvrWCo",
  authDomain: "jpsystems-a6bb4.firebaseapp.com",
  projectId: "jpsystems-a6bb4",
  storageBucket: "jpsystems-a6bb4.firebasestorage.app",
  messagingSenderId: "441555095152",
  appId: "1:441555095152:web:a8162d73a38ca169a3eeb5",
  measurementId: "G-VX49DFV5E7"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);