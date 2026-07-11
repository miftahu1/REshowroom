'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getAuth, signOut } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';

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

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const hasSession = !!Cookies.get('admin-session');
        setIsAuthenticated(hasSession);
        
        // If not authenticated, redirect to /login
        if (!hasSession) {
            router.push('/login');
        }
    }, [pathname, router]);

    if (isAuthenticated === null) {
        return (
            <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
                <h1 style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)', fontSize: '2.5rem', letterSpacing: '0.1em' }}>LOADING...</h1>
            </div>
        );
    }

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Firebase sign out error', error);
        }
        Cookies.remove('admin-session');
        router.push('/login');
    };

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <span className="logo-brand">Funshine Getaways</span>
                    <span className="logo-sub">Admin Panel</span>
                </div>
                <nav>
                    <ul>
                        <li><Link href="/admin" className={pathname === '/admin' ? 'active' : ''}><i className="fas fa-tachometer-alt"></i> Dashboard</Link></li>
                        <li><Link href="/admin/bookings" className={pathname.startsWith('/admin/bookings') ? 'active' : ''}><i className="fas fa-calendar-check"></i> Bookings</Link></li>
                        <li><Link href="/admin/messages" className={pathname.startsWith('/admin/messages') ? 'active' : ''}><i className="fas fa-envelope"></i> Messages</Link></li>
                        <li><Link href="/admin/reviews" className={pathname.startsWith('/admin/reviews') ? 'active' : ''}><i className="fas fa-star"></i> Reviews</Link></li>
                        <li><Link href="/admin/products" className={pathname.startsWith('/admin/products') ? 'active' : ''}><i className="fas fa-motorcycle"></i> Products</Link></li>
                        <li className={pathname.startsWith('/admin/finance') ? 'active' : ''}>
                            <Link href="/admin/finance/companies"><i className="fas fa-hand-holding-usd"></i> Finance</Link>
                            <ul className="submenu">
                                <li><Link href="/admin/finance/companies" className={pathname === '/admin/finance/companies' ? 'sub-active' : ''}>Finance Companies</Link></li>
                                <li><Link href="/admin/finance/settings" className={pathname === '/admin/finance/settings' ? 'sub-active' : ''}>Finance Settings</Link></li>
                            </ul>
                        </li>
                        <li><Link href="/admin/events" className={pathname.startsWith('/admin/events') ? 'active' : ''}><i className="fas fa-calendar-days"></i> Events</Link></li>
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
                <div className="admin-page-body">
                    {children}
                </div>
            </main>
        </div>
    );
};

const AdminHeader = () => {
  const pathname = usePathname();
  const titles: { [key: string]: { title: string, subtitle: string } } = {
    '/admin': { title: "Dashboard", subtitle: "Overview of your dealership's performance." },
    '/admin/products': { title: "Product Management", subtitle: "Add, edit, or remove motorcycle models." },
    '/admin/finance/companies': { title: "Finance Companies", subtitle: "Manage your finance partners." },
    '/admin/finance/settings': { title: "Finance Settings", subtitle: "Configure global finance settings." },
    '/admin/bookings': { title: "Test Ride Bookings", subtitle: "View and manage all test ride requests." },
    '/admin/messages': { title: "Contact Messages", subtitle: "Read and archive incoming messages." },
    '/admin/reviews': { title: "Customer Reviews", subtitle: "Approve, delete, or feature customer reviews." },
    '/admin/events': { title: "Events & Updates", subtitle: "Manage showroom events, offers, and announcements." },
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
