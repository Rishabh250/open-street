// pages/MapPage.js
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const DynamicMapWithNoSSR = dynamic(() => import('../components/MapPage'), {
  ssr: false
});

const MapPage = () => {
  const [ user, setUser ] = useState(null);

  const router = useRouter();

  useEffect(() => {
    try {
      const userData = JSON.parse(window.localStorage.getItem('user'));
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data: ', error);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    window.localStorage.removeItem('user');
    router.push('/');
  };

  const handleGroundClick = async ({ layers, riskScore, flightTime, coordinates }) => {

    if (user) {
      try {
        const docRef = doc(db, 'userGroundProfiles', `${user.uid}`);

        await setDoc(docRef, {
          userId: user.uid,
          layers: layers,
          riskScore: riskScore,
          flightTime: flightTime,
          coordinates: JSON.stringify(coordinates),
          timestamp: new Date()
        }, { merge: true });

        console.log('Ground profile saved successfully!');
      } catch (error) {
        console.error('Error saving ground profile: ', error);
      }
    } else {
      console.log('User is not logged in.');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4">
        {user ?
          <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">User Details</h2>
              <p>Name: {user.displayName}</p>
              <p>Email: {user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
          :
          <></>
        }
      </div>
      <div className="flex-grow">
        <DynamicMapWithNoSSR handleGroundClick={handleGroundClick}/>
      </div>
    </div>
  );
};

export default MapPage;
