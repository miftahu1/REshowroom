'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LoginPage from './login/page';

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

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                await createUserDocument(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().isAdmin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
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

    const handleSignOut = () => {
        signOut(auth).then(() => {
            router.push('/admin/login');
        }).catch(error => console.error('Sign out error', error));
    };

    if (loading) {
        return <div className="login-container"><h1>Loading...</h1></div>;
    }

    if (!user) {
        return <LoginPage />;
    }

    if (!isAdmin) {
        return (
            <div className="login-container">
                <div className="login-form glass-card" style={{ textAlign: 'center' }}>
                    <h1 className="form-title">Access Denied</h1>
                    <p style={{ marginBottom: '20px' }}>You do not have permission to view this page.</p>
                    <button onClick={handleSignOut} className="btn-outline" style={{width: '100%'}}>Sign Out</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <h2>RE Showroom</h2>
                <nav>
                    <ul>
                        <li><Link href="/admin" className={pathname === '/admin' ? 'active' : ''}><i className="fas fa-tachometer-alt"></i> Dashboard</Link></li>
                        <li><Link href="/admin/bookings" className={pathname.startsWith('/admin/bookings') ? 'active' : ''}><i className="fas fa-calendar-check"></i> Bookings</Link></li>
                        <li><Link href="/admin/messages" className={pathname.startsWith('/admin/messages') ? 'active' : ''}><i className="fas fa-envelope"></i> Messages</Link></li>
                        <li><Link href="/admin/reviews" className={pathname.startsWith('/admin/reviews') ? 'active' : ''}><i className="fas fa-star"></i> Reviews</Link></li>
                        <li><Link href="/admin/products" className={pathname.startsWith('/admin/products') ? 'active' : ''}><i className="fas fa-motorcycle"></i> Products</Link></li>
                        <li><Link href="/admin/settings" className={pathname.startsWith('/admin/settings') ? 'active' : ''}><i className="fas fa-cog"></i> Settings</Link></li>
                        <li><Link href="/admin/receipt" className={pathname.startsWith('/admin/receipt') ? 'active' : ''}><i className="fas fa-receipt"></i> Create Receipt</Link></li>
                    </ul>
                </nav>
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={handleSignOut} className="btn-outline" style={{ width: '100%' }}>
                        <i className="fa-solid fa-right-from-bracket"></i> Sign Out
                    </button>
                </div>
            </aside>
            <main className="admin-content">
                <AdminHeader />
                {children}
            </main>
        </div>
    );
};

const AdminHeader = () => {
  const pathname = usePathname();
  const titles: { [key: string]: { title: string, subtitle: string } } = {
    '/admin': { title: "Dashboard", subtitle: "Overview of your dealership's performance." },
    '/admin/products': { title: "Product Management", subtitle: "Add, edit, or remove motorcycle models." },
    '/admin/bookings': { title: "Test Ride Bookings", subtitle: "View and manage all test ride requests." },
    '/admin/messages': { title: "Contact Messages", subtitle: "Read and archive incoming messages." },
    '/admin/reviews': { title: "Customer Reviews", subtitle: "Approve, delete, or feature customer reviews." },
    '/admin/settings': { title: "Settings", subtitle: "Configure dealership settings." },
    '/admin/receipt': { title: "Create Receipt", subtitle: "Generate a new sales receipt." },
  }
  const { title, subtitle } = titles[pathname] || { title: "Admin", subtitle: "Welcome to the admin panel." };

  return (
    <header className="admin-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

export default AdminLayout;
