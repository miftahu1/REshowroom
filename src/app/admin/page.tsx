
'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, FieldValue, getDoc, setDoc } from "firebase/firestore";
import emailjs from '@emailjs/browser';
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

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string;
const EMAILJS_TEMPLATE_ID_USER_UPDATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_USER_UPDATE as string;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string;

// This function handles creating a user document in Firestore after sign-in.
const createUserDocument = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        // If the user document doesn't exist, create it.
        try {
            await setDoc(userDocRef, {
                email: user.email,
                displayName: user.displayName || user.email,
                createdAt: serverTimestamp(),
                // By default, a new user is NOT an admin.
                isAdmin: false 
            });
        } catch (error) {
            console.error("Error creating user document: ", error);
        }
    }
};

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            await createUserDocument(currentUser);
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().isAdmin) {
                setIsAdmin(true);
                setUser(currentUser);
                fetchData();
            } else {
                setIsAdmin(false);
                setUser(currentUser); // User is logged in, but not an admin
            }
        } else {
            setUser(null);
            setIsAdmin(false);
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const bookingsQuery = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        setBookings(bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const messagesQuery = query(collection(db, "messages"), orderBy("timestamp", "desc"));
        const messagesSnapshot = await getDocs(messagesQuery);
        setMessages(messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const productsSnapshot = await getDocs(productsQuery);
        setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const reviewsQuery = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        setReviews(reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
        console.error("Error fetching data: ", error);
        // This is where you would see the permission error if not an admin
    }
    setLoading(false);
  };

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
    <div className="admin-container">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut} />
      <div className="admin-content">
        <AdminHeader tab={activeTab} />
        <main>
          {loading ? <p>Loading data...</p> : (
            <>
              {activeTab === 'dashboard' && <Dashboard bookings={bookings} messages={messages} products={products} reviews={reviews} />}
              {activeTab === 'bookings' && <BookingsManagement bookings={bookings} onDataChange={fetchData} />}
              {activeTab === 'messages' && <MessagesInbox messages={messages} />}
              {activeTab === 'products' && <ProductManagement products={products} onDataChange={fetchData} />}
              {activeTab === 'reviews' && <ReviewsManagement reviews={reviews} onDataChange={fetchData} />}
              {activeTab === 'settings' && <Settings />}
            </>
          )}
        </main>
      </div>
    </div>
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

// ... The rest of your components (AdminSidebar, AdminHeader, etc.) remain unchanged ...

const AdminSidebar = ({ activeTab, setActiveTab, onSignOut }: { activeTab: string, setActiveTab: (tab: string) => void, onSignOut: () => void }) => (
  <div className="admin-sidebar">
    <h2>RE Showroom</h2>
    <ul>
      <li><a href="#" onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}><i className="fa-solid fa-tachometer-alt"></i> Dashboard</a></li>
      <li><a href="#" onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}><i className="fa-solid fa-motorcycle"></i> Products</a></li>
      <li><a href="#" onClick={() => setActiveTab('bookings')} className={activeTab === 'bookings' ? 'active' : ''}><i className="fa-solid fa-calendar-check"></i> Bookings</a></li>
      <li><a href="#" onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'active' : ''}><i className="fa-solid fa-envelope"></i> Messages</a></li>
      <li><a href="#" onClick={() => setActiveTab('reviews')} className={activeTab === 'reviews' ? 'active' : ''}><i className="fa-solid fa-star"></i> Reviews</a></li>
      <li><a href="#" onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}><i className="fa-solid fa-cog"></i> Settings</a></li>
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
    reviews: { title: "Customer Reviews", subtitle: "Approve, delete, or feature customer reviews." },
    settings: { title: "Settings", subtitle: "Configure dealership settings." },
  }
  const { title, subtitle } = titles[tab] || { title: "Admin", subtitle: "" };

  return (
    <header className="admin-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

const EmailUpdateModal = ({ isOpen, onClose, currentEmail, onSave }: { isOpen: boolean, onClose: () => void, currentEmail: string, onSave: (newEmail: string) => Promise<void> }) => {
    const [formState, setFormState] = useState({ current: '', new: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (formState.current !== currentEmail) {
            setError('The current email address does not match.');
            return;
        }
        if (!formState.new) {
            setError('Please enter a new email address.');
            return;
        }
        try {
            await onSave(formState.new);
            setSuccess('Manager email updated successfully! You can now close this window.');
            setFormState({ current: '', new: '' });
        } catch (err) {
            setError('Failed to update the email. Please try again.');
        }
    };

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Update Manager Email</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="current-email">Current Email</label>
                            <input type="email" id="current-email" name="current" value={formState.current} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="new-email">New Email</label>
                            <input type="email" id="new-email" name="new" value={formState.new} onChange={handleInputChange} required />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Changes</button>
                            <button type="button" onClick={onClose} className="btn-outline" style={{ width: '100%' }}>Cancel</button>
                        </div>
                        {error && <p className="error-message" style={{marginTop: '15px'}}>{error}</p>}
                        {success && <p className="success-message" style={{marginTop: '15px'}}>{success}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

const Settings = () => {
    const [managerEmail, setManagerEmail] = useState('');
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [promoBanner, setPromoBanner] = useState({ enabled: false, text: '', link: '' });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const managerDoc = await getDoc(doc(db, 'settings', 'managerDetails'));
        if (managerDoc.exists()) {
            setManagerEmail(managerDoc.data().email);
        }
        const promoDoc = await getDoc(doc(db, 'settings', 'promoBanner'));
        if (promoDoc.exists()) {
            setPromoBanner(promoDoc.data() as { enabled: boolean; text: string; link: string; });
        }
        setLoading(false);
    };

    const handleUpdateEmail = async (newEmail: string) => {
        setMessage('');
        try {
            await setDoc(doc(db, 'settings', 'managerDetails'), { email: newEmail });
            setManagerEmail(newEmail);
            fetchSettings(); // Re-fetch to confirm
        } catch (error) {
            console.error(error);
            throw error; // Re-throw to be caught in the modal
        }
    };

    const handleUpdateBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            await setDoc(doc(db, 'settings', 'promoBanner'), promoBanner);
            setMessage('Promotional banner updated successfully!');
        } catch (error) {
            setMessage('Failed to update promotional banner. Please try again.');
            console.error(error);
        }
    };

    if (loading) {
        return <p>Loading settings...</p>
    }

    return (
        <div>
            <div className="glass-card" style={{padding: '30px', marginBottom: '30px'}}>
                <h3>Manager Notification Email</h3>
                <p>This is the email address that receives notifications for new test ride bookings and contact messages.</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}><strong>{managerEmail || "Not Set"}</strong></p>
                    <button onClick={() => setEmailModalOpen(true)} className="btn-outline" style={{padding: '8px 12px'}}><i className="fa-solid fa-pencil"></i></button>
                </div>
            </div>

            <div className="glass-card" style={{padding: '30px'}}>
                <h3>Promotional Banner</h3>
                <p>Display a notification banner at the top of the homepage.</p>
                <form onSubmit={handleUpdateBanner}>
                    <div className="form-group">
                        <label style={{display: 'flex', alignItems: 'center'}}>
                            <input type="checkbox" checked={promoBanner.enabled} onChange={(e) => setPromoBanner({...promoBanner, enabled: e.target.checked})} style={{width: 'auto', marginRight: '10px'}} />
                            Enable Promotional Banner
                        </label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="promoText">Banner Text</label>
                        <input type="text" id="promoText" value={promoBanner.text} onChange={(e) => setPromoBanner({...promoBanner, text: e.target.value})} placeholder="e.g., Limited Time: Monsoon Service Camp!" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="promoLink">Banner Link (Optional)</label>
                        <input type="text" id="promoLink" value={promoBanner.link} onChange={(e) => setPromoBanner({...promoBanner, link: e.target.value})} placeholder="e.g., /services" />
                    </div>
                    <button type="submit" className="btn-primary">Save Banner Settings</button>
                </form>
            </div>
            {message && <p className="success-message" style={{marginTop: '15px'}}>{message}</p>}
            <EmailUpdateModal isOpen={isEmailModalOpen} onClose={() => setEmailModalOpen(false)} currentEmail={managerEmail} onSave={handleUpdateEmail} />
        </div>
    );
};

const Dashboard = ({ bookings, messages, products, reviews }: { bookings: any[], messages: any[], products: any[], reviews: any[] }) => (
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
    <div className="dashboard-card glass-card">
      <h3>Featured Reviews</h3>
      <p className="dashboard-stat">{reviews.filter(r => r.featured).length}</p>
    </div>
  </div>
);

const ReviewsManagement = ({ reviews, onDataChange }: { reviews: any[], onDataChange: () => void }) => {

    const handleApproval = async (id: string, isApproved: boolean) => {
        const reviewRef = doc(db, "reviews", id);
        try {
            await updateDoc(reviewRef, { approved: isApproved });
            onDataChange();
        } catch (error) {
            console.error("Error updating review approval: ", error);
        }
    };

    const handleFeatured = async (id: string, isFeatured: boolean) => {
        const reviewRef = doc(db, "reviews", id);
        try {
            await updateDoc(reviewRef, { featured: isFeatured });
            onDataChange();
        } catch (error) {
            console.error("Error updating review feature status: ", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to permanently delete this review?")) {
            const reviewRef = doc(db, "reviews", id);
            try {
                await deleteDoc(reviewRef);
                onDataChange();
            } catch (error) {
                console.error("Error deleting review: ", error);
            }
        }
    };

    return (
        <div className="admin-table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Review</th>
                        <th>Status</th>
                        <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map(review => (
                        <tr key={review.id}>
                            <td>
                                <strong>{review.name}</strong><br />
                                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Rating: {review.rating}/5</span>
                            </td>
                            <td style={{maxWidth: '400px', whiteSpace: 'pre-wrap'}}>{review.text}</td>
                            <td>
                                <span className={`status-badge ${review.approved ? 'status-approved' : 'status-pending'}`}>
                                    {review.approved ? 'Approved' : 'Pending'}
                                </span>
                                {review.featured && 
                                    <span className={`status-badge status-featured`} style={{marginLeft: '8px', background: 'var(--gold)', color: 'var(--dark-blue)'}}>
                                        Featured
                                    </span>
                                }
                            </td>
                            <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {review.approved ? (
                                    <button onClick={() => handleFeatured(review.id, !review.featured)} className="btn-outline" style={{padding: '8px 12px', fontSize: '0.8rem'}}>
                                        <i className={`fa-solid ${review.featured ? 'fa-times' : 'fa-star'}`}></i> {review.featured ? 'Un-feature' : 'Feature'}
                                    </button>
                                ) : (
                                    <button onClick={() => handleApproval(review.id, true)} className="btn-primary" style={{padding: '8px 12px', fontSize: '0.8rem', background: 'var(--green)', borderColor: 'var(--green)'}}>
                                        <i className="fa-solid fa-check"></i> Approve
                                    </button>
                                )}
                                <button onClick={() => handleDelete(review.id)} className="btn-delete"><i className="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


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

const BookingEditModal = ({ isOpen, onClose, booking, onSave }: { isOpen: boolean, onClose: () => void, booking: any | null, onSave: (updatedBooking: any) => void }) => {
    const [formState, setFormState] = useState<any>({});

    useEffect(() => {
        if (isOpen && booking) {
            setFormState({ ...booking });
        } 
    }, [isOpen, booking]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prevState: any) => ({ ...prevState, [name]: value }));
    };

    const handleSave = () => {
        onSave(formState);
        onClose();
    };

    if (!booking) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Edit Booking Details</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
                        <div className="form-group"><label>Name</label><input name="name" type="text" value={formState.name || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Phone</label><input name="phone" type="text" value={formState.phone || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Email</label><input name="email" type="email" value={formState.email || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Model</label><input name="model" type="text" value={formState.model || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Preferred Date</label><input name="date" type="date" value={formState.date || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Manager's Note</label><textarea name="managerNote" value={formState.managerNote || ''} onChange={handleInputChange} placeholder="Add a note for the user (e.g., reason for date change)"></textarea></div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button onClick={handleSave} className="btn-primary" style={{ width: '100%' }}>Save Changes</button>
                        <button type="button" onClick={onClose} className="btn-outline" style={{ width: '100%' }}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const BookingsManagement = ({ bookings, onDataChange }: { bookings: any[], onDataChange: () => void }) => {
    const [editingBooking, setEditingBooking] = useState<any | null>(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const handleEditClick = (booking: any) => {
        setEditingBooking(booking);
        setEditModalOpen(true);
    };

    const handleSaveEditedBooking = async (updatedBooking: any) => {
        const bookingRef = doc(db, "bookings", updatedBooking.id);
        try {
            const { id, ...bookingData } = updatedBooking;
            await updateDoc(bookingRef, bookingData);
            onDataChange(); 
        } catch (error) {
            console.error("Error updating booking: ", error);
        }
    };

    const getStyledEmailBody = (status: 'Approved' | 'Disapproved', booking: any, managerNote?: string) => {
        const currentYear = new Date().getFullYear();
        const approvedStyles = {
            headingColor: '#32d74b',
            badgeBg: 'rgba(50, 215, 75, 0.15)',
            borderColor: 'rgba(50, 215, 75, 0.5)'
        };
        const disapprovedStyles = {
            headingColor: '#ff453a',
            badgeBg: 'rgba(255, 69, 58, 0.15)',
            borderColor: 'rgba(255, 69, 58, 0.5)'
        };

        const styles = status === 'Approved' ? approvedStyles : disapprovedStyles;
        const headingText = status === 'Approved' ? 'Test Ride Approved!' : 'Update on Your Request';
        
        let noteContent = '';
        if (booking.managerNote) {
            noteContent = `
                <tr>
                    <td style="padding: 20px 0;">
                        <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6; margin-top: 0; margin-bottom: 10px; font-weight: bold;">A Note from Our Team:</p>
                        <p style="font-size: 16px; color: #c0c0c0; line-height: 1.6; margin: 0; padding: 15px; background-color: rgba(255,255,255,0.05); border-radius: 6px;">${booking.managerNote}</p>
                    </td>
                </tr>
            `;
        }
        
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
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #2c2c2e; border-radius: 12px; overflow: hidden; border: 1px solid #444;">
                                <tr>
                                    <td align="center" style="padding: 30px 20px; background-color: #121212;">
                                        <h1 style="color: #c9a84c; font-family: 'Teko', sans-serif; font-size: 32px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">Royal Enfield Amguri</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <p style="font-size: 18px; color: #f0f0f0; margin: 0 0 25px 0;">Hello ${booking.name},</p>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 25px; background-color: ${styles.badgeBg}; border-radius: 8px; border-left: 5px solid ${styles.borderColor};">
                                                    <h2 style="color: ${styles.headingColor}; font-family: 'Teko', sans-serif; font-size: 26px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 15px 0;">${headingText}</h2>
                                                    ${mainContent}
                                                </td>
                                            </tr>
                                            ${noteContent}
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 30px; background-color: #121212;">
                                        <p style="margin: 0; color: #888888; text-align: center; font-size: 12px;">&copy; ${new Date().getFullYear()} Royal Enfield Amguri. All rights reserved.<br>Amguri, Assam, India</p>
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
        <>
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
                             <button onClick={() => handleEditClick(booking)} className="btn-outline" style={{padding: '8px 12px', fontSize: '0.8rem'}}><i className="fa-solid fa-pencil"></i> Edit</button>
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
            <BookingEditModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} booking={editingBooking} onSave={handleSaveEditedBooking} />
        </>
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
