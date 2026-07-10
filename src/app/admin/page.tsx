'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    bookingsCount: 0,
    pendingReviewsCount: 0,
    messagesCount: 0,
    productsCount: 0,
    eventsCount: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch Counts
        const bookingsSnap = await getDocs(collection(db, "bookings"));
        const reviewsSnap = await getDocs(collection(db, "reviews"));
        const messagesSnap = await getDocs(collection(db, "messages"));
        const productsSnap = await getDocs(collection(db, "products"));
        const eventsSnap = await getDocs(collection(db, "events"));

        const pendingReviews = reviewsSnap.docs.filter(doc => !doc.data().approved).length;

        setMetrics({
          bookingsCount: bookingsSnap.size,
          pendingReviewsCount: pendingReviews,
          messagesCount: messagesSnap.size,
          productsCount: productsSnap.size,
          eventsCount: eventsSnap.size,
        });

        // Fetch Recent Bookings (limit 5)
        const recentBookingsQuery = query(collection(db, "bookings"), orderBy("timestamp", "desc"), limit(5));
        const recentBookingsSnap = await getDocs(recentBookingsQuery);
        setRecentBookings(recentBookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Recent Messages (limit 5)
        const recentMessagesQuery = query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(5));
        const recentMessagesSnap = await getDocs(recentMessagesQuery);
        setRecentMessages(recentMessagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Error loading dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <p>Loading dashboard metrics...</p>;
  }

  return (
    <div>
      {/* Metrics Card Grid */}
      <div className="dashboard-grid">
        <Link href="/admin/bookings" className="dashboard-card glass-card">
          <h3>Test Rides</h3>
          <p className="dashboard-stat">{metrics.bookingsCount}</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total scheduled bookings</span>
        </Link>
        <Link href="/admin/reviews" className="dashboard-card glass-card">
          <h3>Pending Reviews</h3>
          <p className="dashboard-stat" style={{ color: metrics.pendingReviewsCount > 0 ? 'var(--gold)' : 'inherit' }}>
            {metrics.pendingReviewsCount}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting moderator approval</span>
        </Link>
        <Link href="/admin/messages" className="dashboard-card glass-card">
          <h3>Messages</h3>
          <p className="dashboard-stat">{metrics.messagesCount}</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer contact submissions</span>
        </Link>
        <Link href="/admin/products" className="dashboard-card glass-card">
          <h3>Active Models</h3>
          <p className="dashboard-stat">{metrics.productsCount}</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Motorcycles in catalog</span>
        </Link>
        <Link href="/admin/events" className="dashboard-card glass-card">
          <h3>Events & Updates</h3>
          <p className="dashboard-stat">{metrics.eventsCount}</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Published events &amp; announcements</span>
        </Link>
      </div>

      {/* Quick Action Buttons */}
      <h3 className="mt-8 mb-4" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>Quick Administrative Tasks</h3>
      <div className="admin-actions-grid">
        <Link href="/admin/products" className="admin-action-btn">
          <i className="fa-solid fa-circle-plus"></i>
          <span>Add New Model</span>
        </Link>
        <Link href="/admin/events" className="admin-action-btn">
          <i className="fa-solid fa-calendar-plus"></i>
          <span>Add Event</span>
        </Link>
        <Link href="/admin/receipt" className="admin-action-btn">
          <i className="fa-solid fa-file-invoice"></i>
          <span>Generate Receipt</span>
        </Link>
        <Link href="/admin/settings" className="admin-action-btn">
          <i className="fa-solid fa-sliders"></i>
          <span>Configure Settings</span>
        </Link>
      </div>

      {/* Double Column Activity Feed */}
      <div className="dashboard-activity-layout">
        {/* Left Column: Recent Bookings */}
        <div className="dashboard-section-box">
          <h3>
            <span>Recent Test Rides</span>
            <Link href="/admin/bookings" className="view-all-link">Manage All &rarr;</Link>
          </h3>
          <div className="admin-table-container" style={{ border: 'none' }}>
            {recentBookings.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Model</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.name}</strong><br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.phone}</span>
                      </td>
                      <td>{b.model}</td>
                      <td>{b.date}</td>
                      <td>
                        <span className={`status-badge status-${(b.status || 'Pending').toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                          {b.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No test ride bookings found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Recent Messages */}
        <div className="dashboard-section-box">
          <h3>
            <span>Recent Messages</span>
            <Link href="/admin/messages" className="view-all-link">View Inbox &rarr;</Link>
          </h3>
          <div className="messages-list">
            {recentMessages.length > 0 ? (
              recentMessages.map((m) => (
                <div key={m.id} className="message-item" style={{ padding: '16px', background: 'rgba(255,255,255,0.015)' }}>
                  <div className="message-header" style={{ marginBottom: '6px' }}>
                    <strong>{m.name}</strong>
                    <span style={{ fontSize: '0.75rem' }}>
                      {m.timestamp?.toDate ? new Date(m.timestamp.toDate()).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.message}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>No customer messages received.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
