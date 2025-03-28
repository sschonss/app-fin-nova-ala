import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore without persistence for React Native
export const db = getFirestore(app);

export { firebaseConfig };