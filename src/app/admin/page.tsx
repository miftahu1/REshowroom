
'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, FieldValue } from "firebase/firestore";
import emailjs from '@emailjs/browser';
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

// --- IMPORTANT: ADD YOUR EMAILJS DETAILS HERE ---
const EMAILJS_SERVICE_ID = 'service_t3duf0c';
const EMAILJS_TEMPLATE_ID_USER_UPDATE = 'template_5rlszxk'; // The new dynamic template
const EMAILJS_PUBLIC_KEY = 'M3_6Bw_vnhrbf900W';

// Define a type for the product data to prevent build errors
type Spec = { value: string; label: string };
interface ProductData {
    name: string;
    engine: string;
    price: string;
    imageUrl: string;
    badge: string;
    specs: Spec[];
    createdAt?: FieldValue;
    id?: string;
}

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
              {activeTab === 'bookings' && <BookingsManagement bookings={bookings} onDataChange={fetchData} />}
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

const ProductModal = ({ isOpen, onClose, product, onSave }: { isOpen: boolean, onClose: () => void, product: ProductData | null, onSave: () => void }) => {
  const getInitialFormState = (): ProductData => ({ name: '', engine: '', price: '', imageUrl: '', badge: '', specs: [] });
  const [formState, setFormState] = useState<ProductData>(getInitialFormState());
  const isEditing = product?.id;

  useEffect(() => {
    if(isOpen) {
        if (product) {
            setFormState({ ...getInitialFormState(), ...product });
        } else {
            setFormState(getInitialFormState());
        }
    }
  }, [isOpen, product]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const productRef = doc(db, "products", product.id!);
        const { createdAt, id, ...productData } = formState;
        await updateDoc(productRef, productData);
      } else {
        const productData = { ...formState, createdAt: serverTimestamp() };
        await addDoc(collection(db, "products"), productData);
      }
      onClose();
      onSave();
    } catch (error) {
      console.error("Error saving product: ", error);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
            <h3>{isEditing ? 'Edit Model' : 'Add New Model'}</h3>
            <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
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
                <button type="button" onClick={onClose} className="btn-outline" style={{ width: '100%' }}>Cancel</button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

const ProductManagement = ({ products, onDataChange }: { products: ProductData[], onDataChange: () => void }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  const handleAddClick = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEditClick = (product: ProductData) => {
    setEditingProduct(product);
    setModalOpen(true);
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

  const handleCloseModal = () => {
      setModalOpen(false);
      setEditingProduct(null);
  }

  return (
    <div>
        <div className="product-management-header">
            <button onClick={handleAddClick} className="btn-primary"><i className="fa-solid fa-plus"></i> Add New Model</button>
        </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Price</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: ProductData) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleEditClick(p)} className="btn-outline" style={{padding: '8px 12px'}}><i className="fa-solid fa-pencil"></i> Edit</button>
                  <button onClick={() => handleDeleteProduct(p.id!)} className="btn-delete"><i className="fa-solid fa-trash"></i> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProductModal isOpen={isModalOpen} onClose={handleCloseModal} product={editingProduct} onSave={onDataChange} />
    </div>
  );
};

const BookingsManagement = ({ bookings, onDataChange }: { bookings: any[], onDataChange: () => void }) => {

    const getStyledEmailBody = (status: 'Approved' | 'Disapproved', booking: any) => {
        const approvedStyles = {
            headingColor: '#32d74b', // var(--green)
            badgeBg: 'rgba(50, 215, 75, 0.15)'
        };
        const disapprovedStyles = {
            headingColor: '#ff453a', // var(--red)
            badgeBg: 'rgba(255, 69, 58, 0.15)'
        };

        const styles = status === 'Approved' ? approvedStyles : disapprovedStyles;
        const headingText = status === 'Approved' ? 'Test Ride Approved!' : 'Update on Your Request';
        
        const mainContent = status === 'Approved' ? `
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Great news! Your test ride for the <strong>Royal Enfield ${booking.model}</strong> has been confirmed.</p>
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Our team will contact you shortly to finalize the details for your ride on or around <strong>${booking.date || 'your selected date'}</strong>.</p>
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Get ready to feel the thunder!</p>
        ` : `
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Thank you for your interest in the <strong>Royal Enfield ${booking.model}</strong>.</p>
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Unfortunately, we are unable to fulfill your test ride request for the selected date. This could be due to high demand or temporary unavailability of the model.</p>
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Our team will reach out to see if we can schedule a ride for a different date or model. We appreciate your understanding.</p>
        `;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
            </head>
            <body style="margin: 0; padding: 0; background-color: #1c1c1e; font-family: 'Roboto', sans-serif;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="padding: 20px 0;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #2c2c2e; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td align="center" style="padding: 30px 20px; background-color: #121212;">
                                        <h1 style="color: #c9a84c; font-family: 'Teko', sans-serif; font-size: 28px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">Royal Enfield Gurugram</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <p style="font-size: 18px; color: #f0f0f0; margin: 0 0 25px 0;">Hello ${booking.name},</p>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 20px; background-color: ${styles.badgeBg}; border-radius: 6px;">
                                                    <h2 style="color: ${styles.headingColor}; font-family: 'Teko', sans-serif; font-size: 24px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 15px 0;">${headingText}</h2>
                                                    ${mainContent}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 30px; background-color: #121212;">
                                        <p style="margin: 0; color: #888888; text-align: center; font-size: 12px;">© 2024 Royal Enfield Gurugram. All rights reserved.<br>42, Rajpur Road, Sector 14, Gurugram, Haryana - 122001</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
    };

    const handleStatusChange = async (id: string, status: 'Approved' | 'Disapproved', booking: any) => {
        const bookingRef = doc(db, "bookings", id);
        try {
            await updateDoc(bookingRef, { status: status });
            
            const subject = status === 'Approved' ? 'Your Test Ride is Confirmed!' : 'Update on Your Test Ride Request';
            const email_body = getStyledEmailBody(status, booking);

            const templateParams = {
                to_email: booking.email,
                subject: subject,
                email_body: email_body,
            };

            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_USER_UPDATE, templateParams, EMAILJS_PUBLIC_KEY)
                .then((response) => {
                   console.log('User notification SUCCESS!', response.status, response.text);
                }, (err) => {
                   console.log('User notification FAILED...', err);
                });

            onDataChange();
        } catch (error) {
            console.error("Error updating booking status: ", error);
        }
    };

    return (
        <div className="admin-table-container">
            <table className="admin-table">
            <thead>
                <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Model</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {bookings.map(booking => (
                <tr key={booking.id}>
                    <td>{booking.name}</td>
                    <td>{booking.phone}</td>
                    <td>{booking.model}</td>
                    <td>{booking.date}</td>
                    <td>
                        <span className={`status-badge status-${(booking.status || 'Pending').toLowerCase()}`}>
                            {booking.status || 'Pending'}
                        </span>
                    </td>
                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {(!booking.status || booking.status === 'Pending') && (
                            <>
                                <button onClick={() => handleStatusChange(booking.id, 'Approved', booking)} className="btn-primary" style={{padding: '8px 12px', fontSize: '0.8rem', background: 'var(--green)', borderColor: 'var(--green)'}}><i className="fa-solid fa-check"></i> Approve</button>
                                <button onClick={() => handleStatusChange(booking.id, 'Disapproved', booking)} className="btn-delete" style={{padding: '8px 12px', fontSize: '0.8rem'}}><i className="fa-solid fa-times"></i> Disapprove</button>
                            </>
                        )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    );
};

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
