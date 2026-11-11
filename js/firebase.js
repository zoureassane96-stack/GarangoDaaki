// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuration Firebase GarangoDaaki
const firebaseConfig = {
  apiKey: "AIzaSyClNrETTY05Qy87ACnIAISXV7G3GyOjmrM",
  authDomain: "garangodaaki.firebaseapp.com",
  projectId: "garangodaaki",
  storageBucket: "garangodaaki.firebasestorage.app",
  messagingSenderId: "1093611193994",
  appId: "1:1093611193994:web:8a310acb4599447c478f73",
  measurementId: "G-6C0QD9B9M2"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export pour l'application
export { app, analytics, auth, db };
