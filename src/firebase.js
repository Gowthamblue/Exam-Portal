import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWp41FFsE0LVAO3US2c3awOFNJq_WKTVM",
  authDomain: "final-project-abb57.firebaseapp.com",
  projectId: "final-project-abb57",
  storageBucket: "final-project-abb57.firebasestorage.app",
  messagingSenderId: "231959831045",
  appId: "1:231959831045:web:c85807e6c3f237d7fa326c",
  measurementId: "G-DMKP3DHVDY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
