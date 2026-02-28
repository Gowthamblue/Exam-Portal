import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBl8sMf-IgpnQNrdEHtcYK41QB9jgm3-Gs",
  authDomain: "exam-portal-168ff.firebaseapp.com",
  projectId: "exam-portal-168ff",
  storageBucket: "exam-portal-168ff.firebasestorage.app",
  messagingSenderId: "58572659518",
  appId: "1:58572659518:web:7199993e5f3f43ad68ea6f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);