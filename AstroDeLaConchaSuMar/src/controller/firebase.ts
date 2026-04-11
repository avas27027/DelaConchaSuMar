// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtOAtlvj01tZaGCrJiXUVXdzZ2Vcs_lRY",
  authDomain: "de-la-concha-su-mar.firebaseapp.com",
  projectId: "de-la-concha-su-mar",
  storageBucket: "de-la-concha-su-mar.firebasestorage.app",
  messagingSenderId: "889856606817",
  appId: "1:889856606817:web:78cc62f0a61e6b3625a020",
  measurementId: "G-F65884WD7F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default app;