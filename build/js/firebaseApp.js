import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendEmailVerification,
  updateProfile,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6En24MyhaNsRCU_bV8PRdI6hn3lon-Wc",
  authDomain: "watchfolio-93175.firebaseapp.com",
  databaseURL: "https://watchfolio-93175-default-rtdb.firebaseio.com",
  projectId: "watchfolio-93175",
  storageBucket: "watchfolio-93175.appspot.com",
  messagingSenderId: "338374125620",
  appId: "1:338374125620:web:ff6262fa8eb4d26ae14261",
  measurementId: "G-LEKBTCG8J3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();

export {
  firebaseConfig,
  auth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendEmailVerification,
  updateProfile,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  sendPasswordResetEmail,
};
