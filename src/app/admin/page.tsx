
'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
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
const db = getFirestore(app);

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchData();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    // Fetch bookings
    const bookingsQuery = query(collection(db, "bookings"), orderBy("date", "desc"), limit(50));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    setBookings(bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Fetch messages
    const messagesQuery = query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(50));
    const messagesSnapshot = await getDocs(messagesQuery);
    setMessages(messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Access Denied</h1>
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li><a href="#" onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}><i className="fa-solid fa-tachometer-alt"></i> Dashboard</a></li>
          <li><a href="#" onClick={() => setActiveTab('bookings')} className={activeTab === 'bookings' ? 'active' : ''}><i className="fa-solid fa-calendar-check"></i> Bookings</a></li>
          <li><a href="#" onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'active' : ''}><i className="fa-solid fa-envelope"></i> Messages</a></li>
        </ul>
      </div>
      <div className="admin-content">
        <header className="admin-header">
          <h1>Welcome, Admin</h1>
          <p>Here's what's happening with your dealership.</p>
        </header>
        <main>
          {activeTab === 'dashboard' && <Dashboard bookings={bookings} messages={messages} />}
          {activeTab === 'bookings' && <BookingsManagement bookings={bookings} />}
          {activeTab === 'messages' && <MessagesInbox messages={messages} />}
        </main>
      </div>
    </div>
  );
};

const Dashboard = ({ bookings, messages }: { bookings: any[], messages: any[] }) => (
  <div className="dashboard">
    <div className="dashboard-grid">
      <div className="dashboard-card">
        <h3>Total Bookings</h3>
        <p className="dashboard-stat">{bookings.length}</p>
      </div>
      <div className="dashboard-card">
        <h3>New Messages</h3>
        <p className="dashboard-stat">{messages.length}</p>
      </div>
    </div>
  </div>
);

const BookingsManagement = ({ bookings }: { bookings: any[] }) => (
  <div className="bookings-management">
    <h2>Test Ride Bookings</h2>
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Model</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking.id}>
              <td>{booking.name}</td>
              <td>{booking.phone}</td>
              <td>{booking.email}</td>
              <td>{booking.model}</td>
              <td>{booking.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MessagesInbox = ({ messages }: { messages: any[] }) => (
  <div className="messages-inbox">
    <h2>Contact Messages</h2>
    <div className="messages-list">
      {messages.map(message => (
        <div key={message.id} className="message-item">
          <div className="message-header">
            <p><strong>{message.name}</strong> ({message.email})</p>
            <p>{new Date(message.timestamp?.toDate()).toLocaleString()}</p>
          </div>
          <p>{message.message}</p>
        </div>
      ))}
    </div>
  </div>
);


export default AdminPage;
