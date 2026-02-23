import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi Firebase CINEMAXII milik Daffa
const firebaseConfig = {
  apiKey: "AIzaSyDYk5uwEgAeu7YVWozIB5qzx6CXoDp9IBw",
  authDomain: "cinemaxii-db.firebaseapp.com",
  projectId: "cinemaxii-db",
  storageBucket: "cinemaxii-db.firebasestorage.app",
  messagingSenderId: "124222392193",
  appId: "1:124222392193:web:c254fa264f0c0b32e50a80",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan yang akan kita pakai di komponen lain
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
