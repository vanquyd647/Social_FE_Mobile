// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDF-_GnYs8IBi1lkLdcSuH4Qdrdz4CVnNw",
    authDomain: "red89-f8933.firebaseapp.com",
    projectId: "red89-f8933",
    storageBucket: "red89-f8933.appspot.com",
    messagingSenderId: "148816240907",
    appId: "1:148816240907:web:9aba16f39bce554467820e",
    measurementId: "G-L2NV721VLZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
