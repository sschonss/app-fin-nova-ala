import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, query, getDocs, addDoc, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { useAuth } from './AuthContext';

interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  month: string;
  year: number;
  description: string;
  category: string;
  receiptUrl?: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface FinanceContextData {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  getUserBalance: (userId: string) => Promise<number>;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.id)
      );
      
      const querySnapshot = await getDocs(q);
      const transactionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Transaction[];
      
      setTransactions(transactionsList);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      await addDoc(collection(db, 'transactions'), {
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      
      await loadTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      await deleteDoc(transactionRef);
      await loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const getUserBalance = async (userId: string) => {
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.reduce((total, doc) => {
        const data = doc.data();
        return total + (data.type === 'income' ? data.amount : -data.amount);
      }, 0);
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  return (
    <FinanceContext.Provider 
      value={{ 
        transactions, 
        loading, 
        addTransaction, 
        deleteTransaction,
        getUserBalance 
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);