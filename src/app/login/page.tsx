
      'use client';
      
      import { useState } from 'react';
      import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
      import { initializeApp, getApps, getApp } from 'firebase/app';
      import '../globals.css';
      
      const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      };
      
      // Initialize Firebase
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      
      const LoginPage = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
      
        const handleLogin = (e: React.FormEvent) => {
          e.preventDefault();
          setError('');
          signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
              setError(error.message);
            });
        };
      
        const handleGoogleSignIn = () => {
          const provider = new GoogleAuthProvider();
          signInWithPopup(auth, provider)
            .catch((error) => {
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
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '16px' }}>
                  Sign In
                </button>
              </form>
              <button onClick={handleGoogleSignIn} className="btn-outline google-login" style={{width: '100%'}}>
                  <i className="fa-brands fa-google"></i> &nbsp; Sign in with Google
              </button>
            </div>
          </div>
        );
      };
      
      export default LoginPage;
      