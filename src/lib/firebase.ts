// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "studio-2889300419-bf9ed",
  "appId": "1:233638204959:web:8dfa365ec89262849be72a",
  "storageBucket": "studio-2889300419-bf9ed.firebasestorage.app",
  "apiKey": "AIzaSyAjqItQvLPr5kGnVEqcKf5bFUxIk3ZOUMs",
  "authDomain": "studio-2889300419-bf9ed.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "233638204959"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
