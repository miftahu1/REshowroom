'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, FieldValue, where, writeBatch } from "firebase/firestore";
import { ImageUploader, CLImage } from '@/components/ImageUploader';

type Spec = { value: string; label: string };
interface ProductData {
    id?: string;
    name: string;
    engine: string;
    price: number;
    financeEnabled: boolean;
    imageUrl: string; // Now stores Cloudinary Public ID
    badge: string;
    specs: Spec[];
    category: string; 
    createdAt?: FieldValue;
}

// ... (initialBikeModels and categories remain the same)

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

const ProductModal = ({ isOpen, onClose, product, onSave }: { isOpen: boolean, onClose: () => void, product: ProductData | null, onSave: () => void }) => {
    const getInitialFormState = (): Omit<ProductData, 'id' | 'createdAt'> => ({ name: '', engine: '', price: 0, financeEnabled: false, imageUrl: '', badge: '', specs: [], category: 'classic' });
    const [formState, setFormState] = useState<ProductData>(getInitialFormState());
    const isEditing = product?.id;

    useEffect(() => {
        if (isOpen) {
            setFormState(product ? { ...getInitialFormState(), ...product } : getInitialFormState());
        }
    }, [isOpen, product]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormState(prevState => ({ ...prevState, [name]: checked }));
        } else {
            setFormState(prevState => ({ ...prevState, [name]: name === 'price' ? (parseInt(value, 10) || 0) : value }));
        }
    };

    const handleImageUpload = (info: any) => {
        setFormState(prevState => ({ ...prevState, imageUrl: info.public_id }));
    };
    
    const handleSpecChange = (index: number, field: 'value' | 'label', value: string) => {
        const newSpecs = [...formState.specs];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormState(prevState => ({ ...prevState, specs: newSpecs }));
    };

    const addSpecField = () => setFormState(prevState => ({ ...prevState, specs: [...prevState.specs, { value: '', label: '' }] }));

    const removeSpecField = (index: number) => {
        const newSpecs = [...formState.specs];
        newSpecs.splice(index, 1);
        setFormState(prevState => ({ ...prevState, specs: newSpecs }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { createdAt, id, ...productData } = formState;
            if (isEditing) {
                await updateDoc(doc(db, "products", product!.id!), productData);
            } else {
                await addDoc(collection(db, "products"), { ...productData, createdAt: serverTimestamp() });
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
                <div className="modal-header"><h3>{isEditing ? 'Edit Model' : 'Add New Model'}</h3><button onClick={onClose} className="modal-close-btn">&times;</button></div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {/* ... other inputs ... */}
                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>Model Image</label>
                                <ImageUploader 
                                    onUploadSuccess={handleImageUpload} 
                                    initialValue={formState.imageUrl} 
                                />
                            </div>
                            {/* ... other inputs ... */}
                        </div>
                        {/* ... (specifications and buttons) ... */}
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
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchData = async () => { /* ... */ };

    useEffect(() => { fetchData(); }, [activeFilter]);

    const handleAddClick = () => { setEditingProduct(null); setModalOpen(true); };
    const handleEditClick = (product: ProductData) => { setEditingProduct(product); setModalOpen(true); };
    const handleCloseModal = () => { setModalOpen(false); setEditingProduct(null); }

    const handleDeleteProduct = async (product: ProductData) => {
        if (window.confirm("Are you sure you want to delete this model?")) {
            try {
                // Delete from Firebase
                await deleteDoc(doc(db, "products", product.id!));

                // Delete image from Cloudinary
                if (product.imageUrl) {
                    await fetch('/api/cloudinary', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ publicId: product.imageUrl })
                    });
                }

                fetchData();
            } catch (error) {
                console.error("Error deleting product: ", error);
            }
        }
    };
    
    // ... (seedModels remains the same, though it will need updating to upload to Cloudinary)

    return (
        <div>
            {/* ... (header and filter) ... */}
            {loading ? <p>Loading...</p> : (
                <div className="admin-table-container mt-6">
                    <table className="admin-table">
                        <thead><tr><th>Image</th><th>Model</th><th>Category</th><th>Price</th><th>Finance</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                        <tbody>
                            {products.length > 0 ? products.map((p: ProductData) => (
                                <tr key={p.id}>
                                    <td><CLImage publicId={p.imageUrl} alt={p.name} className="w-24 h-16 object-cover rounded-md" /></td>
                                    <td>{p.name}</td>
                                    <td><span className="event-type-badge">{p.category}</span></td>
                                    <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(p.price)}</td>
                                    <td><span className={`status-badge ${p.financeEnabled ? 'status-active' : 'status-inactive'}`}>{p.financeEnabled ? 'Enabled' : 'Disabled'}</span></td>
                                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={() => handleEditClick(p)} className="btn-outline"><i className="fa-solid fa-pencil"></i> Edit</button><button onClick={() => handleDeleteProduct(p)} className="btn-delete"><i className="fa-solid fa-trash"></i> Delete</button></td>
                                </tr>
                            )) : ( <tr><td colSpan={6} style={{textAlign: 'center', padding: '40px'}}><p>No models found for '{activeFilter}'.</p></td></tr> )}
                        </tbody>
                    </table>
                </div>
            )}
            <ProductModal isOpen={isModalOpen} onClose={handleCloseModal} product={editingProduct} onSave={fetchData} />
        </div>
    );
};

export default ProductManagement;
