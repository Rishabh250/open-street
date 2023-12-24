import React from 'react';
import DynamicGoogleLoginWithNoSSR from '../components/GoogleLogin';
import Head from 'next/head';

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Head>
        <title>Login</title>
      </Head>
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg z-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue to your application.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <DynamicGoogleLoginWithNoSSR />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
