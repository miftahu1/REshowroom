'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import '../globals.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes to handle page access and loading state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (Cookies.get('admin-session')) {
        router.push('/admin');
      } else {
        setLoading(false); // Finished loading, allow user interaction
      }
    });
    return () => unsubscribe();
  }, [router]);

  const processSignIn = async (user) => {
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
      setError(err.message || 'An error occurred during verification.');
      if (auth.currentUser) await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => processSignIn(userCredential.user))
      .catch(err => {
        if (err.code === 'auth/user-not-found') {
          setError('No user found with this email. Please use the correct email or Google Sign-In.');
        } else if (err.code === 'auth/wrong-password') {
          setError('Incorrect password. Please try again.');
        } else {
          setError('Invalid credentials. Please try again.');
        }
        setLoading(false);
      });
  };

  const handleGoogleSignIn = () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(result => processSignIn(result.user))
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };
  
  if (loading && !error) {
    return <div className="login-container"><p>Loading...</p></div>;
  }

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
