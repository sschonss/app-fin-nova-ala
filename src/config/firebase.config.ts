import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCmcgef_A8OAcUbN_AAkRICcgRdagkKzTo",
  authDomain: "nova-ala-fut.firebaseapp.com",
  projectId: "nova-ala-fut",
  storageBucket: "nova-ala-fut.appspot.com",
  messagingSenderId: "549880987958",
  appId: "1:549880987958:web:364ecfbf1989c7ea47b397",
  measurementId: "G-G7S35F711N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, firebaseConfig };