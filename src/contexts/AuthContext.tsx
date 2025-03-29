import React, { createContext, useState, useContext, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';

interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role?: 'admin' | 'user';
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  logOut: () => Promise<void>;
  setUserAsAdmin: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: userData.fullName || '',
              phone: userData.phone || '',
              role: userData.role || 'user'
            });
            setIsAdmin(userData.role === 'admin');
            
            // Set initial admin if email matches
            if (firebaseUser.email === 'schonsluuiz@gmail.com' && userData.role !== 'admin') {
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                role: 'admin'
              });
              setIsAdmin(true);
            }
          } else {
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: '',
            phone: ''
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        fullName,
        phone,
        role: 'user', // default role
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const setUserAsAdmin = async (userId: string) => {
    if (!isAdmin) {
      throw new Error('Only admins can set other users as admin');
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        role: 'admin'
      });
    } catch (error) {
      console.error('Error setting user as admin:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      signIn,
      signUp,
      logOut,
      setUserAsAdmin
    }}>
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