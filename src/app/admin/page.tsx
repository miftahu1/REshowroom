
'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
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
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        createdAt: serverTimestamp()
      });
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      alert('Product added successfully!');
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Error adding product.');
    }
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
          <li><a href="#products">Products</a></li>
        </ul>
      </div>
      <div className="admin-content">
        <header className="admin-header">
          <h1>Welcome, Admin</h1>
        </header>
        <main>
          <h2 id="products">Manage Products</h2>
          <form onSubmit={handleAddProduct} className="product-form">
            <h3>Add New Product</h3>
            <div className="form-group">
              <label htmlFor="productName">Product Name</label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="productDescription">Product Description</label>
              <textarea
                id="productDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="productPrice">Product Price</label>
              <input
                type="number"
                id="productPrice"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Add Product</button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
