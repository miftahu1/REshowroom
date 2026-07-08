'use client';

import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc, getApp, getApps, initializeApp } from 'firebase/firestore';

// Correct Firebase Initialization
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const SettingsManagement = () => {
  const [settings, setSettings] = useState({ managerEmail: '' });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const docRef = doc(db, "settings", "admin");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as { managerEmail: string });
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const docRef = doc(db, "settings", "admin");
    await updateDoc(docRef, settings);
    setIsEditing(false);
    alert('Settings saved!');
  };

  if (loading) {
    return <p>Loading settings...</p>;
  }

  return (
    <div className="glass-card p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
      <div className="form-group">
        <label htmlFor="managerEmail">Manager's Email for Notifications</label>
        <input
          type="email"
          id="managerEmail"
          value={settings.managerEmail}
          onChange={(e) => setSettings({ ...settings, managerEmail: e.target.value })}
          readOnly={!isEditing}
          className="w-full p-2 rounded-md bg-bg-tertiary"
        />
      </div>
      <div className="flex justify-end gap-4 mt-4">
        {isEditing ? (
          <>
            <button onClick={() => setIsEditing(false)} className="btn-outline">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Save</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="btn-primary">Edit</button>
        )}
      </div>
    </div>
  );
};

export default SettingsManagement;
