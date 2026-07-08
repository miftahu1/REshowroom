'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
const auth = getAuth(app);

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().isAdmin) {
                    setIsAdmin(true);
                }
                setUser(currentUser);
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="login-container"><h1>Loading...</h1></div>;
    }

    if (!user) {
        return (
            <div className="login-container">
                <div className="login-form glass-card" style={{ textAlign: 'center' }}>
                    <h1 className="form-title">Please Log In</h1>
                    <p style={{ marginBottom: '20px' }}>You must be logged in to access this page.</p>
                    <Link href="/admin/login" className="btn-primary">Go to Login</Link>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="login-container">
                <div className="login-form glass-card" style={{ textAlign: 'center' }}>
                    <h1 className="form-title">Access Denied</h1>
                    <p style={{ marginBottom: '20px' }}>You do not have permission to view this page.</p>
                    <Link href="/" className="btn-primary">Back to Homepage</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2>RE Admin</h2>
                <nav>
                    <ul>
                        <li><Link href="/admin" className={pathname === '/admin' ? 'active' : ''}><i className="fas fa-tachometer-alt"></i> Dashboard</Link></li>
                        <li><Link href="/admin/bookings" className={pathname === '/admin/bookings' ? 'active' : ''}><i className="fas fa-calendar-check"></i> Bookings</Link></li>
                        <li><Link href="/admin/messages" className={pathname === '/admin/messages' ? 'active' : ''}><i className="fas fa-envelope"></i> Messages</Link></li>
                        <li><Link href="/admin/reviews" className={pathname === '/admin/reviews' ? 'active' : ''}><i className="fas fa-star"></i> Reviews</Link></li>
                        <li><Link href="/admin/products" className={pathname === '/admin/products' ? 'active' : ''}><i className="fas fa-motorcycle"></i> Products</Link></li>
                        <li><Link href="/admin/settings" className={pathname === '/admin/settings' ? 'active' : ''}><i className="fas fa-cog"></i> Settings</Link></li>
                        <li><Link href="/admin/receipt" className={pathname === '/admin/receipt' ? 'active' : ''}><i className="fas fa-receipt"></i> Create Receipt</Link></li>
                    </ul>
                </nav>
            </aside>
            <main className="admin-content">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
