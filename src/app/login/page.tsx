'use client';

import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, enableIndexedDbPersistence } from 'firebase/firestore';
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

// Enable offline persistence
try {
  enableIndexedDbPersistence(db);
} catch (error) {
  if (error.code === 'failed-precondition') {
    console.warn('Firestore persistence failed: Multiple tabs open?');
  } else if (error.code === 'unimplemented') {
    console.warn('Firestore persistence not available in this browser.');
  }
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (Cookies.get('admin-session')) {
      router.push('/admin');
    }
  }, [router]);

  const verifyAdminAndLogin = async (user) => {
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        if (userDoc.data().isAdmin) {
          Cookies.set('admin-session', 'true', { expires: 1 });
          router.push('/admin');
        } else {
          await signOut(auth);
          setError('Access Denied: You do not have administrator permissions.');
        }
      } else {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || user.email,
          createdAt: serverTimestamp(),
          isAdmin: false
        });
        await signOut(auth);
        setError('Your account has been created and is pending approval from an administrator.');
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}`);
      if (auth.currentUser) {
        await signOut(auth);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => verifyAdminAndLogin(userCredential.user))
      .catch((error) => {
        setLoading(false);
        setError(error.message);
      });
  };

  const handleGoogleSignIn = () => {
    setError('');
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => verifyAdminAndLogin(result.user))
      .catch((error) => {
        setLoading(false);
        setError(error.message);
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
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <span 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </span>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '24px' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '16px 0' }}>
            <hr style={{flex: 1, borderColor: 'rgba(255,255,255,0.1)'}} />
            <span style={{color: 'var(--text-muted)'}}>OR</span>
            <hr style={{flex: 1, borderColor: 'rgba(255,255,255,0.1)'}} />
        </div>
        <button onClick={handleGoogleSignIn} className="btn-outline google-login" style={{width: '100%'}} disabled={loading}>
            <i className="fa-brands fa-google"></i> &nbsp; Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
