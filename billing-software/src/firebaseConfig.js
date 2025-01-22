// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBF2kJl-Q4o-27I_pLUhvMx_gK77jcg5Hw",
    authDomain: "billing-system-cca96.firebaseapp.com",
    databaseURL: "https://billing-system-cca96-default-rtdb.firebaseio.com",
    projectId: "billing-system-cca96",
    storageBucket: "billing-system-cca96.firebasestorage.app",
    messagingSenderId: "945975700539",
    appId: "1:945975700539:web:eac33f59dfa828b46d001e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
