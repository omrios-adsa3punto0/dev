// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWwVy2I4vnc7MmsPvjZe9DXrYpPoSB1sM",
  authDomain: "adsa3punto0.firebaseapp.com",
  projectId: "adsa3punto0",
  storageBucket: "adsa3punto0.firebasestorage.app",
  messagingSenderId: "90243942423",
  appId: "1:90243942423:web:aa1b400258175f034cf452",
  measurementId: "G-EN8FK4SQDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);