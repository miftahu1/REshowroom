'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, FieldValue, writeBatch } from "firebase/firestore";

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

// --- PREDEFINED SEED DATA ---
const seedData: Omit<ProductData, 'id' | 'createdAt'>[] = [
    {
        name: 'Classic 350',
        engine: '349cc Single-Cylinder, 4 Stroke',
        price: '₹1.93 Lakh',
        imageUrl: '/assets/images/classic-350.png',
        badge: 'Bestseller',
        specs: [
            { value: '20.2', label: 'BHP' },
            { value: '27', label: 'Nm Torque' },
            { value: '195', label: 'kg Kerb Weight' },
        ],
    },
    {
        name: 'Meteor 350',
        engine: '349cc SOHC Engine',
        price: '₹2.01 Lakh',
        imageUrl: '/assets/images/meteor-350.png',
        badge: 'Cruiser',
        specs: [
            { value: '20.2', label: 'BHP' },
            { value: '27', label: 'Nm Torque' },
            { value: '191', label: 'kg Kerb Weight' },
        ],
    },
    {
        name: 'Interceptor 650',
        engine: '648cc Parallel Twin, 4-stroke',
        price: '₹3.03 Lakh',
        imageUrl: '/assets/images/interceptor-650.png',
        badge: 'Twin Power',
        specs: [
            { value: '47', label: 'BHP' },
            { value: '52', label: 'Nm Torque' },
            { value: '202', label: 'kg Kerb Weight' },
        ],
    },
    {
        name: 'Himalayan',
        engine: '411cc Single-Cylinder, 4-stroke',
        price: '₹2.16 Lakh',
        imageUrl: '/assets/images/himalayan.png',
        badge: 'Adventure',
        specs: [
            { value: '24.3', label: 'BHP' },
            { value: '32', label: 'Nm Torque' },
            { value: '199', label: 'kg Kerb Weight' },
        ],
    },
];


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

const ProductManagement = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
        const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const productsSnapshot = await getDocs(productsQuery);
        setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductData)));
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

    const handleSeedDatabase = async () => {
        if (!window.confirm("Are you sure you want to seed the database? This will add predefined products. It is recommended to use this on an empty products collection.")) {
            return;
        }

        setLoading(true);
        console.log("Seeding database...");
        try {
            const batch = writeBatch(db);
            const productsCollection = collection(db, "products");

            for (const product of seedData) {
                const docRef = doc(productsCollection);
                batch.set(docRef, { ...product, createdAt: serverTimestamp() });
            }

            await batch.commit();
            console.log("Database seeded successfully!");
            alert("Database seeded successfully with " + seedData.length + " products.");
            fetchData(); // Refresh the product list
        } catch (error) {
            console.error("Error seeding database: ", error);
            alert("An error occurred while seeding the database. Check the console for details.");
            setLoading(false);
        }
    };

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
        fetchData();
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    }
  };

  const handleCloseModal = () => {
      setModalOpen(false);
      setEditingProduct(null);
  }

  if (loading) {
    return <p>Loading products...</p>
  }

  return (
    <div>
        <div className="product-management-header" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button onClick={handleAddClick} className="btn-primary"><i className="fa-solid fa-plus"></i> Add New Model</button>
            <button onClick={handleSeedDatabase} className="btn-outline"><i className="fa-solid fa-seedling"></i> Seed Products (Temp)</button>
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
      <ProductModal isOpen={isModalOpen} onClose={handleCloseModal} product={editingProduct} onSave={fetchData} />
    </div>
  );
};

export default ProductManagement;
