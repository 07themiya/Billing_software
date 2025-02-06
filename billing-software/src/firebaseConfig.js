// Import necessary Firebase functions
import { initializeApp, getApps, getApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBF2kJl-Q4o-27I_pLUhvMx_gK77jcg5Hw",
    authDomain: "billing-system-cca96.firebaseapp.com",
    databaseURL: "https://billing-system-cca96-default-rtdb.firebaseio.com",
    projectId: "billing-system-cca96",
    storageBucket: "billing-system-cca96.appspot.com",
    messagingSenderId: "945975700539",
    appId: "1:945975700539:web:eac33f59dfa828b46d001e"
};

// Initialize Firebase (Prevent duplicate initialization)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export default app;
