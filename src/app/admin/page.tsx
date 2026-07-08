'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
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
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const createUserDocument = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        try {
            await setDoc(userDocRef, {
                email: user.email,
                displayName: user.displayName || user.email,
                createdAt: serverTimestamp(),
                isAdmin: false 
            });
        } catch (error) {
            console.error("Error creating user document: ", error);
        }
    }
};

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            await createUserDocument(currentUser);
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().isAdmin) {
                setIsAdmin(true);
                setUser(currentUser);
            } else {
                setIsAdmin(false);
                setUser(currentUser);
            }
        } else {
            setUser(null);
            setIsAdmin(false);
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch(error => console.error(error));
  };

  if (loading) {
    return <div className="login-container"><h1>Loading...</h1></div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!isAdmin) {
      return (
          <div className="login-container">
              <div className="login-form glass-card" style={{textAlign: 'center'}}>
                  <h1 className="form-title">Access Denied</h1>
                  <p style={{marginBottom: '20px'}}>You do not have permission to access the admin panel.</p>
                  <button onClick={handleSignOut} className="btn-outline" style={{width: '100%'}}>Sign Out</button>
              </div>
          </div>
      );
  }

  return (
    <Dashboard />
  );
};

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = () => {
        signInWithPopup(auth, googleProvider).catch(err => setError(err.message));
    };

    return (
        <div className="login-container">
            <div className="login-form glass-card">
                <h1 className="form-title">Admin Login</h1>
                <form onSubmit={handleAuthAction}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary" style={{width: '100%', marginBottom: '16px'}}>Sign In</button>
                </form>
                <button onClick={handleGoogleSignIn} className="btn-outline google-login" style={{width: '100%'}}>
                    <i className="fa-brands fa-google"></i> &nbsp; Sign in with Google
                </button>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

const Dashboard = () => {
  const [stats, setStats] = useState({ bookings: 0, messages: 0, products: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        const messagesSnapshot = await getDocs(collection(db, "messages"));
        const productsSnapshot = await getDocs(collection(db, "products"));
        const reviewsSnapshot = await getDocs(collection(db, "reviews"));
        setStats({
            bookings: bookingsSnapshot.size,
            messages: messagesSnapshot.size,
            products: productsSnapshot.size,
            reviews: reviewsSnapshot.docs.filter(r => r.data().featured).length,
        });
    } catch (error) {
        console.error("Error fetching stats: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>
  }

  return (
    <div className="dashboard-grid">
      <div className="dashboard-card glass-card">
        <h3>Total Bookings</h3>
        <p className="dashboard-stat">{stats.bookings}</p>
      </div>
      <div className="dashboard-card glass-card">
        <h3>New Messages</h3>
        <p className="dashboard-stat">{stats.messages}</p>
      </div>
      <div className="dashboard-card glass-card">
        <h3>Listed Products</h3>
        <p className="dashboard-stat">{stats.products}</p>
      </div>
      <div className="dashboard-card glass-card">
        <h3>Featured Reviews</h3>
        <p className="dashboard-stat">{stats.reviews}</p>
      </div>
    </div>
  );
}

export default AdminPage;
