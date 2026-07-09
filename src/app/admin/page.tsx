'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import '../globals.css';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

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

const AdminPage = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [testRides, setTestRides] = useState<any[]>([]);
  const [activeView, setActiveView] = useState('dashboard');
  const router = useRouter();

  useEffect(() => {
    if (!Cookies.get('admin-session')) {
      router.push('/admin/login');
      return;
    }
    fetchReviews();
    fetchTestRides();
  }, []);

  const fetchReviews = async () => {
    const reviewsCollection = await getDocs(collection(db, "reviews"));
    const reviewsData = reviewsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReviews(reviewsData);
  };

  const fetchTestRides = async () => {
    const testRidesCollection = await getDocs(collection(db, "test-rides"));
    const testRidesData = testRidesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTestRides(testRidesData);
  };

  const handleApprove = async (id: string) => {
    const reviewDoc = doc(db, "reviews", id);
    await updateDoc(reviewDoc, { approved: true });
    fetchReviews();
  };

  const handleDeleteReview = async (id: string) => {
    await deleteDoc(doc(db, "reviews", id));
    fetchReviews();
  };

  const handleDeleteTestRide = async (id: string) => {
    await deleteDoc(doc(db, "test-rides", id));
    fetchTestRides();
  };
  
  const handleLogout = () => {
    Cookies.remove('admin-session');
    router.push('/admin/login');
  }

  const pendingReviewsCount = reviews.filter(r => !r.approved).length;

  return (
    <div className="admin-container">
        <div className="admin-sidebar">
            <h2>RE-Admin</h2>
            <ul>
                <li><a href="#" className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}><i className="fa-solid fa-tachograph-digital"></i> Dashboard</a></li>
                <li><a href="#" className={activeView === 'reviews' ? 'active' : ''} onClick={() => setActiveView('reviews')}><i className="fa-solid fa-comments"></i> Reviews</a></li>
                <li><a href="#" className={activeView === 'test-rides' ? 'active' : ''} onClick={() => setActiveView('test-rides' )}><i className="fa-solid fa-motorcycle"></i> Test Rides</a></li>
            </ul>
            <div style={{marginTop: 'auto'}}>
                <a href="#" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i> Logout</a>
            </div>
        </div>
        <div className="admin-content">
            {activeView === 'dashboard' && (
                <div>
                    <div className="admin-header">
                        <h1>Dashboard</h1>
                        <p>Welcome back, Admin!</p>
                    </div>
                    <div className="dashboard-grid">
                        <div className="dashboard-card glass-card">
                            <h3>Pending Reviews</h3>
                            <p className="dashboard-stat">{pendingReviewsCount}</p>
                        </div>
                        <div className="dashboard-card glass-card">
                            <h3>Test Ride Bookings</h3>
                            <p className="dashboard-stat">{testRides.length}</p>
                        </div>
                    </div>
                </div>
            )}
            {activeView === 'reviews' && (
                <div>
                    <div className="admin-header">
                        <h1>Review Management</h1>
                        <p>Approve or delete user-submitted reviews.</p>
                    </div>
                    <div className="admin-table-container">
                        {reviews.map(review => (
                            <div key={review.id} className="glass-card" style={{ marginBottom: '20px', padding: '20px'}}>
                                <p><strong>{review.name}</strong></p>
                                <p>{review.review}</p>
                                <p>Status: {review.approved ? <span style={{color: 'var(--success)'}}>Approved</span> : <span style={{color: 'var(--warning)'}}>Pending</span>}</p>
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                    {!review.approved && (
                                    <button onClick={() => handleApprove(review.id)} className="btn-primary" style={{background: 'var(--success)'}}>Approve</button>
                                    )}
                                    <button onClick={() => handleDeleteReview(review.id)} className="btn-primary" style={{background: 'var(--danger)'}}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeView === 'test-rides' && (
                <div>
                    <div className="admin-header">
                        <h1>Test Ride Management</h1>
                        <p>Manage and view scheduled test rides.</p>
                    </div>
                    <div className="admin-table-container">
                        {testRides.map(ride => (
                            <div key={ride.id} className="glass-card" style={{ marginBottom: '20px', padding: '20px'}}>
                                <p><strong>{ride.name}</strong></p>
                                <p>Email: {ride.email}</p>
                                <p>Phone: {ride.phone}</p>
                                <p>Preferred Date: {ride.date}</p>
                                <p>Model: {ride.model}</p>
                                <div style={{ marginTop: '10px' }}>
                                    <button onClick={() => handleDeleteTestRide(ride.id)} className="btn-primary" style={{background: 'var(--danger)'}}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default AdminPage;
