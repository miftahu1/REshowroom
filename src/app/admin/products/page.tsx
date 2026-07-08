'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getApp, getApps, initializeApp } from 'firebase/firestore';

// Correct Firebase Initialization
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

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  createdAt: any;
}

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const productsSnapshot = await getDocs(productsQuery);
    const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    setProducts(productsList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product: Partial<Product> | null = null) => {
    if (product) {
      setIsEditing(true);
      setCurrentProduct(product);
    } else {
      setIsEditing(false);
      setCurrentProduct({ name: '', price: 0, image: '', category: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSave = async () => {
    if (!currentProduct) return;

    if (isEditing && currentProduct.id) {
      const productRef = doc(db, 'products', currentProduct.id);
      await updateDoc(productRef, { ...currentProduct, createdAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'products'), { ...currentProduct, createdAt: serverTimestamp() });
    }
    fetchData();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchData();
    }
  };

  if (loading) {
    return <p>Loading products...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">Add Product</button>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td><img src={product.image} alt={product.name} width="100" className="rounded-md"/></td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.category}</td>
                <td>
                  <button onClick={() => handleOpenModal(product)} className="btn-secondary">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="btn-delete ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
            <input type="text" placeholder="Name" value={currentProduct?.name} onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full p-2 mb-2 rounded-md bg-bg-tertiary" />
            <input type="number" placeholder="Price" value={currentProduct?.price} onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })} className="w-full p-2 mb-2 rounded-md bg-bg-tertiary" />
            <input type="text" placeholder="Image URL" value={currentProduct?.image} onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })} className="w-full p-2 mb-2 rounded-md bg-bg-tertiary" />
            <input type="text" placeholder="Category" value={currentProduct?.category} onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })} className="w-full p-2 mb-2 rounded-md bg-bg-tertiary" />
            <textarea placeholder="Description" value={currentProduct?.description} onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })} className="w-full p-2 mb-2 rounded-md bg-bg-tertiary" rows={4}></textarea>
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={handleCloseModal} className="btn-outline">Cancel</button>
              <button onClick={handleSave} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
