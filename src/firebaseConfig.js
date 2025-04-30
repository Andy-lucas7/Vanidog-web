import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDJ3miRgiMJMTC7xP3dLFJEnkqJESwovfw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "vaniapp-7d6eb.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "vaniapp-7d6eb",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "vaniapp-7d6eb.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "483912374504",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:483912374504:web:AIzaSyDJ3miRgiMJMTC7xP3dLFJEnkqJESwovfw"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };