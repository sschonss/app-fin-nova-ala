import React, { createContext, useState, useContext, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';

interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: userDoc.data().fullName || '',
              phone: userDoc.data().phone || '',
            });
          } else {
            // If user exists in Auth but not in Firestore, sign them out
            await signOut(auth);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Don't sign out on permission errors, just set basic user data
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: '',
            phone: '',
          });
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', uid), {
        fullName,
        phone,
        email,
        createdAt: new Date().toISOString(),
      });

      // Update local state
      setUser({
        id: uid,
        email,
        fullName,
        phone,
      });
    } catch (error: any) {
      console.error('Error in signUp:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User data will be set by the onAuthStateChanged listener
    } catch (error: any) {
      console.error('Error in signIn:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Error in logOut:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};