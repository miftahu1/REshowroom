
'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import '../globals.css';

const firebaseConfig = {
  apiKey: "AIzaSyDiG0SkbQ0X2HfbqW7W8ItZTvg4lBkWk9A",
  authDomain: "reshowroom-28210251-f6ef0.firebaseapp.com",
  projectId: "reshowroom-28210251-f6ef0",
  storageBucket: "reshowroom-28210251-f6ef0.appspot.com",
  messagingSenderId: "405365661255",
  appId: "1:405365661255:web:7d0dddf1caf5dcb0a9db62"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

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
    setLoading(true);
    const bookingsQuery = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    setBookings(bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const messagesQuery = query(collection(db, "messages"), orderBy("timestamp", "desc"));
    const messagesSnapshot = await getDocs(messagesQuery);
    setMessages(messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const productsSnapshot = await getDocs(productsQuery);
    setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleSignIn = () => {
    signInWithPopup(auth, provider).catch(error => console.error(error));
  };

  const handleSignOut = () => {
    signOut(auth).catch(error => console.error(error));
  };

  if (loading && !user) {
    return (
      <div className="login-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onSignIn={handleSignIn} />;
  }

  return (
    <div className="admin-container">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut} />
      <div className="admin-content">
        <AdminHeader tab={activeTab} />
        <main>
          {loading ? <p>Loading data...</p> : (
            <>
              {activeTab === 'dashboard' && <Dashboard bookings={bookings} messages={messages} products={products} />}
              {activeTab === 'bookings' && <BookingsManagement bookings={bookings} />}
              {activeTab === 'messages' && <MessagesInbox messages={messages} />}
              {activeTab === 'products' && <ProductManagement products={products} onProductAdded={fetchData} onProductDeleted={fetchData} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const LoginScreen = ({ onSignIn }: { onSignIn: () => void }) => (
  <div className="login-container">
    <div className="login-form glass-card">
      <h1 className="form-title">Admin Login</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px' }}>Please sign in to access the dashboard.</p>
      <button onClick={onSignIn} className="btn-primary google-login">
        <i className="fa-brands fa-google"></i> &nbsp; Sign in with Google
      </button>
    </div>
  </div>
);

const AdminSidebar = ({ activeTab, setActiveTab, onSignOut }: { activeTab: string, setActiveTab: (tab: string) => void, onSignOut: () => void }) => (
  <div className="admin-sidebar">
    <h2>RE Showroom</h2>
    <ul>
      <li><a href="#" onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}><i className="fa-solid fa-tachometer-alt"></i> Dashboard</a></li>
      <li><a href="#" onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}><i className="fa-solid fa-motorcycle"></i> Products</a></li>
      <li><a href="#" onClick={() => setActiveTab('bookings')} className={activeTab === 'bookings' ? 'active' : ''}><i className="fa-solid fa-calendar-check"></i> Bookings</a></li>
      <li><a href="#" onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'active' : ''}><i className="fa-solid fa-envelope"></i> Messages</a></li>
    </ul>
    <div style={{ marginTop: 'auto' }}>
      <button onClick={onSignOut} className="btn-outline" style={{ width: '100%' }}><i className="fa-solid fa-right-from-bracket"></i> Sign Out</button>
    </div>
  </div>
);

const AdminHeader = ({ tab }: { tab: string }) => {
  const titles: { [key: string]: { title: string, subtitle: string } } = {
    dashboard: { title: "Dashboard", subtitle: "Overview of your dealership's performance." },
    products: { title: "Product Management", subtitle: "Add, edit, or remove motorcycle models." },
    bookings: { title: "Test Ride Bookings", subtitle: "View and manage all test ride requests." },
    messages: { title: "Contact Messages", subtitle: "Read and archive incoming messages." },
  }
  const { title, subtitle } = titles[tab] || { title: "Admin", subtitle: "" };

  return (
    <header className="admin-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

const Dashboard = ({ bookings, messages, products }: { bookings: any[], messages: any[], products: any[] }) => (
  <div className="dashboard-grid">
    <div className="dashboard-card glass-card">
      <h3>Total Bookings</h3>
      <p className="dashboard-stat">{bookings.length}</p>
    </div>
    <div className="dashboard-card glass-card">
      <h3>New Messages</h3>
      <p className="dashboard-stat">{messages.length}</p>
    </div>
    <div className="dashboard-card glass-card">
      <h3>Listed Products</h3>
      <p className="dashboard-stat">{products.length}</p>
    </div>
  </div>
);

const ProductManagement = ({ products, onProductAdded, onProductDeleted }: { products: any[], onProductAdded: () => void, onProductDeleted: () => void }) => {
  const [newProduct, setNewProduct] = useState({ name: '', engine: '', price: '', imageUrl: '' });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        createdAt: serverTimestamp(),
      });
      setNewProduct({ name: '', engine: '', price: '', imageUrl: '' });
      onProductAdded();
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        onProductDeleted();
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    }
  };

  return (
    <div className="product-management-grid">
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Engine</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.engine}</td>
                <td>{p.price}</td>
                <td><button onClick={() => handleDeleteProduct(p.id)} className="btn-delete"><i className="fa-solid fa-trash"></i></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="product-form-card">
        <h3>Add New Model</h3>
        <form onSubmit={handleAddProduct}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="form-group"><label>Model Name</label><input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g., Classic 350" required /></div>
            <div className="form-group"><label>Engine Spec</label><input type="text" value={newProduct.engine} onChange={e => setNewProduct({ ...newProduct, engine: e.target.value })} placeholder="e.g., 349cc Single-Cylinder" required /></div>
            <div className="form-group"><label>Starting Price</label><input type="text" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="e.g., ₹1.93 L" required /></div>
            <div className="form-group"><label>Image URL</label><input type="text" value={newProduct.imageUrl} onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })} placeholder="e.g., /assets/images/classic_350.png" required /></div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>Add Product</button>
        </form>
      </div>
    </div>
  );
};

const BookingsManagement = ({ bookings }: { bookings: any[] }) => (
  <div className="admin-table-container">
    <table className="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Model</th>
          <th>Date</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map(booking => (
          <tr key={booking.id}>
            <td>{booking.name}</td>
            <td>{booking.phone}</td>
            <td>{booking.model}</td>
            <td>{booking.date}</td>
            <td>{booking.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MessagesInbox = ({ messages }: { messages: any[] }) => (
  <div className="messages-list">
    {messages.map(message => (
      <div key={message.id} className="message-item">
        <div className="message-header">
          <strong>{message.name} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({message.email})</span></strong>
          <span style={{ fontSize: '0.8rem' }}>{new Date(message.timestamp?.toDate()).toLocaleString()}</span>
        </div>
        <p>{message.message}</p>
      </div>
    ))}
  </div>
);

export default AdminPage;
