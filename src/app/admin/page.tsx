
'use client';

import { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth,
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
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

const ADMIN_EMAIL = 'miftahulhussain43@gmail.com';

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Initialize Firebase and Auth within the component and memoize it
  const auth = useMemo(() => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return getAuth(app);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]); // Dependency array ensures this runs once when auth is memoized

  useEffect(() => {
    if (user) {
      setIsAdmin(user.email === ADMIN_EMAIL);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
            <h1>Loading...</h1>
            <p>If this message persists, please check the browser console for errors.</p>
        </div>
    );
  }

  if (user) {
    if (isAdmin) {
      // Logged in as Admin
      return (
        <div className="admin-container">
          <div className="admin-sidebar">
            <h2>Admin Panel</h2>
            <ul>
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#users">Users</a></li>
              <li><a href="#settings">Settings</a></li>
              <li><button onClick={handleLogout} className="btn-outline" style={{width: '100%', marginTop: '20px'}}>Logout</button></li>
            </ul>
          </div>
          <div className="admin-content">
            <header className="admin-header">
              <h1>Welcome, Admin</h1>
              <p>Logged in as {user.email}</p>
            </header>
            <main>
              <h2>Dashboard</h2>
              <p>This is the main admin dashboard area. You can add your components here.</p>
            </main>
          </div>
        </div>
      );
    } else {
      // Logged in but not admin
      return (
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
          <h1>Access Denied</h1>
          <p>You are logged in as {user.email}, which does not have admin privileges.</p>
          <button onClick={handleLogout} className="btn-primary" style={{marginTop: '20px'}}>Logout</button>
        </div>
      );
    }
  }

  // Not logged in, show login form
  return (
    <div className="admin-container" style={{ justifyContent: 'center' }}>
      <main>
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
      </main>
    </div>
  );
};

export default AdminPage;
