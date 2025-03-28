import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase.config';
import * as FileSystem from 'expo-file-system';

export const uploadReceipt = async (uri: string, userId: string, transactionId: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const fileRef = ref(storage, `receipts/${userId}/${transactionId}.pdf`);
    await uploadBytes(fileRef, blob);
    
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
};