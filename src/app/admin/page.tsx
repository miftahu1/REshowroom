
'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
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
              {activeTab === 'products' && <ProductManagement products={products} onDataChange={fetchData} />}
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

const ProductManagement = ({ products, onDataChange }: { products: any[], onDataChange: () => void }) => {
  const getInitialFormState = () => ({ name: '', engine: '', price: '', imageUrl: '', badge: '', specs: [] });
  const [formState, setFormState] = useState(getInitialFormState());
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSpecChange = (index: number, field: 'value' | 'label', value: string) => {
    const newSpecs = [...formState.specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setFormState(prevState => ({ ...prevState, specs: newSpecs }));
  };

  const addSpecField = () => {
    setFormState(prevState => ({ ...prevState, specs: [...prevState.specs, { value: '', label: '' }] }));
  };

  const removeSpecField = (index: number) => {
    const newSpecs = [...formState.specs];
    newSpecs.splice(index, 1);
    setFormState(prevState => ({ ...prevState, specs: newSpecs }));
  };

  const handleEditClick = (product: any) => {
    setIsEditing(product.id);
    // Use initial state as a base to ensure all fields are present, especially `specs`
    setFormState({ ...getInitialFormState(), ...product });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setFormState(getInitialFormState());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const productRef = doc(db, "products", isEditing);
        // Don't update createdAt timestamp on edit
        const { createdAt, ...productData } = formState;
        await updateDoc(productRef, productData);
      } else {
        const productData = { ...formState, createdAt: serverTimestamp() };
        await addDoc(collection(db, "products"), productData);
      }
      handleCancelEdit();
      onDataChange();
    } catch (error) {
      console.error("Error saving product: ", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        onDataChange();
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
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditClick(p)} className="btn-outline" style={{padding: '8px 12px'}}><i className="fa-solid fa-pencil"></i></button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="btn-delete"><i className="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="product-form-card">
        <h3>{isEditing ? 'Edit Model' : 'Add New Model'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="form-group"><label>Model Name</label><input name="name" type="text" value={formState.name} onChange={handleInputChange} placeholder="e.g., Classic 350" required /></div>
            <div className="form-group"><label>Engine Spec</label><input name="engine" type="text" value={formState.engine} onChange={handleInputChange} placeholder="e.g., 349cc Single-Cylinder" required /></div>
            <div className="form-group"><label>Starting Price</label><input name="price" type="text" value={formState.price} onChange={handleInputChange} placeholder="e.g., ₹1.93 L" required /></div>
            <div className="form-group"><label>Image URL</label><input name="imageUrl" type="text" value={formState.imageUrl} onChange={handleInputChange} placeholder="e.g., /assets/images/classic_350.png" required /></div>
            <div className="form-group"><label>Badge</label><input name="badge" type="text" value={formState.badge} onChange={handleInputChange} placeholder="e.g., Bestseller" /></div>
            
            <div style={{borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop:'10px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0}}>Specifications</p>
                    <button type="button" onClick={addSpecField} className="btn-outline" style={{fontSize: '0.7rem', padding: '6px 10px'}}><i className="fa-solid fa-plus"></i> Add Spec</button>
                </div>
                {formState.specs.map((spec, index) => (
                    <div key={index} style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '12px'}}>
                        <div className="form-group" style={{margin:0}}><input type="text" value={spec.value} placeholder="Value (e.g. 20.2)" onChange={(e) => handleSpecChange(index, 'value', e.target.value)} /></div>
                        <div className="form-group" style={{margin:0}}><input type="text" value={spec.label} placeholder="Label (e.g. BHP)" onChange={(e) => handleSpecChange(index, 'label', e.target.value)} /></div>
                        <button type="button" onClick={() => removeSpecField(index)} className="btn-delete" style={{padding: '10px 12px'}}><i className="fa-solid fa-trash"></i></button>
                    </div>
                ))}
            </div>

          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
             <button type="submit" className="btn-primary" style={{ width: '100%' }}>{isEditing ? 'Update Product' : 'Add Product'}</button>
             {isEditing && <button type="button" onClick={handleCancelEdit} className="btn-outline" style={{ width: '100%' }}>Cancel</button>}
          </div>
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
