'use client';

import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import '../globals.css';

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
const auth = getAuth(app);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (Cookies.get('admin-session')) {
      router.push('/admin');
    }
  }, [router]);

  const verifyAdminAndLogin = async (user: any) => {
    try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New user: create their document and then sign them out with a message.
            await setDoc(userDocRef, {
                email: user.email,
                displayName: user.displayName || user.email,
                createdAt: serverTimestamp(),
                isAdmin: false
            });

            await signOut(auth);
            setError('Your account has been created and is pending approval from an administrator.');

        } else {
            // Existing user: check if they are an admin.
            if (userDoc.data().isAdmin) {
                Cookies.set('admin-session', 'true', { expires: 1 });
                router.push('/admin');
            } else {
                await signOut(auth);
                setError('Access Denied: You do not have administrator permissions.');
            }
        }
    } catch (err: any) {
        setError(err.message || 'An error occurred during verification.');
        if (auth.currentUser) {
            await signOut(auth);
        }
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        verifyAdminAndLogin(userCredential.user);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  const handleGoogleSignIn = () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        verifyAdminAndLogin(result.user);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  return (
    <div className="login-container">
      <div className="login-form glass-card">
        <h1 className="form-title">Admin Login</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '16px' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <button onClick={handleGoogleSignIn} className="btn-outline google-login" style={{width: '100%'}} disabled={loading}>
            <i className="fa-brands fa-google"></i> &nbsp; Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;