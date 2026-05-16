
'use client';

import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import '../globals.css';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiG0SkbQ0X2HfbqW7W8ItZTvg4lBkWk9A",
  authDomain: "reshowroom-28210251-f6ef0.firebaseapp.com",
  projectId: "reshowroom-28210251-f6ef0",
  storageBucket: "reshowroom-28210251-f6ef0.appspot.com",
  messagingSenderId: "405365661255",
  appId: "1:405365661255:web:7d0dddf1caf5dcb0a9db62"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to admin page on successful login
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirect to admin page on successful login
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form glass-card">
        <h3 className="form-title">Admin Login</h3>
        {error && <p style={{ color: 'var(--red)', marginBottom: '16px', textAlign: 'center' }}>{error.replace("Firebase: ", "")}</p>}
        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-submit">Login</button>
        </form>
        <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-muted)' }}>OR</div>
        <div className="google-login">
          <button onClick={handleGoogleLogin} className="btn-outline" style={{width: '100%', justifyContent: 'center'}}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" style={{width: '18px', marginRight: '10px'}}/>
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
