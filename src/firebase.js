import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Firestore adalah bagian terbesar dari Firebase, jadi tidak dimasukkan ke bundle awal.
// Modul ini baru diunduh saat pertama kali dibutuhkan (setelah pengguna login).
// Hasilnya di-cache, jadi pemanggilan berikutnya tidak mengunduh ulang.
let firestorePromise = null;

const loadFirestore = () => {
  if (!firestorePromise) {
    // Fungsi diambil lewat destructuring langsung agar bundler bisa membuang
    // bagian Firestore yang tidak dipakai (tree-shaking). Jangan ganti dengan `(fs) => ...`.
    firestorePromise = import("firebase/firestore")
      .then(({ getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc }) => ({
        db: getFirestore(app),
        collection,
        doc,
        onSnapshot,
        setDoc,
        deleteDoc,
      }))
      .catch((error) => {
        firestorePromise = null; // izinkan coba lagi jika unduhan gagal (mis. koneksi putus)
        throw error;
      });
  }
  return firestorePromise;
};

export { auth, provider, loadFirestore };
