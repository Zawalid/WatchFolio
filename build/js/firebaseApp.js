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
  updateEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";
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

//* ------------------------------ Error Handling ------------------------------ *//
// Get error message based on error code of sign in
function getSignInErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Invalid email format. Please enter a valid email address.";
    case "auth/user-not-found":
      return "User not found. Please check your email or sign up to create an account.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support for assistance.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in or use a different email to create a new account.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/provider-already-linked":
      return "This provider is already linked to another account.";
    case "auth/account-exists-with-different-credential":
      return "Uh-oh! It seems there's already an account with this email using a different method. Please sign in with the correct method. You can link this method to your account later in the settings.";
    default:
      return "An error occurred during sign-in. Please try again later.";
  }
}
// Get error message based on error code of sign up
function getSignUpErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in or use a different email to create a new account.";
    case "auth/invalid-email":
      return "Invalid email format. Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    default:
      return "An error occurred during sign-up. Please try again later.";
  }
}

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
  updateEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  sendPasswordResetEmail,
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  reauthenticateWithCredential,
  EmailAuthProvider,
  getSignInErrorMessage,
  getSignUpErrorMessage,
};
