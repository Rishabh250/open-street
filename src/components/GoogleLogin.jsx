// components/GoogleLogin.js
import React from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseConfig } from '../../firebaseConfig'; // Make sure this path is correct
import { useRouter } from 'next/router';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const GoogleLogin = () => {

    const router = useRouter();
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        window.localStorage.setItem('user', JSON.stringify(result.user));
        router.push('/map');
      }

    } catch (error) {
      console.error("Error signing in with Google:", error);
      // Handle errors here
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleGoogleLogin}
        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
      >
        Login with Google
      </button>
    </div>
  );
};

export default GoogleLogin;
