import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyBCWDyWWoSmkB0eZTJqVQr48uJvCRah9A4',
  authDomain: 'open-street-1b7ff.firebaseapp.com',
  projectId: 'open-street-1b7ff',
  storageBucket: 'open-street-1b7ff.appspot.com',
  messagingSenderId: '777799235995',
  appId: '1:777799235995:web:4cfc098775fcc9adbe493e',
  measurementId: 'G-HWX8W74NF9'
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

