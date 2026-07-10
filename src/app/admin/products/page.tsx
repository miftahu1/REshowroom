'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, FieldValue, where, writeBatch } from "firebase/firestore";

type Spec = { value: string; label: string };
interface ProductData {
    id?: string;
    name: string;
    engine: string;
    price: number;
    financeEnabled: boolean;
    imageUrl: string;
    badge: string;
    specs: Spec[];
    category: string; 
    createdAt?: FieldValue;
}

const initialBikeModels: Omit<ProductData, 'id' | 'createdAt'>[] = [
    { name: 'Classic 350', engine: '349cc Single-Cylinder', price: 193000, financeEnabled: true, imageUrl: '/assets/images/classic350.png', badge: 'Bestseller', category: 'classic', specs: [{ value: '20.2', label: 'BHP' }, { value: '27', label: 'Nm Torque' }, { value: '195', label: 'Kerb Weight' }] },
    { name: 'Himalayan 450', engine: '452cc Single-Cylinder', price: 285000, financeEnabled: true, imageUrl: '/assets/images/himalayan.png', badge: 'Adventure', category: 'adventure', specs: [{ value: '40.02', label: 'PS @ 8000 rpm' }, { value: '40', label: 'Nm @ 5500 rpm' }, { value: '196', label: 'Kerb Weight' }] },
    { name: 'Bullet 350', engine: '349cc Single-Cylinder', price: 174000, financeEnabled: true, imageUrl: '/assets/images/bullet350.png', badge: 'Timeless', category: 'classic', specs: [{ value: '20.2', label: 'BHP' }, { value: '27', label: 'Nm Torque' }, { value: '195', label: 'Kerb Weight' }] },
    { name: 'Hunter 350', engine: '349cc Single-Cylinder', price: 150000, financeEnabled: true, imageUrl: '/assets/images/hunter350.png', badge: 'Urban', category: 'roadster', specs: [{ value: '20.2', label: 'BHP' }, { value: '27', label: 'Nm Torque' }, { value: '181', label: 'Kerb Weight' }] },
    { name: 'Meteor 350', engine: '349cc Single-Cylinder', price: 206000, financeEnabled: false, imageUrl: '/assets/images/meteor350.png', badge: 'Cruiser', category: 'cruiser', specs: [{ value: '20.2', label: 'BHP' }, { value: '27', label: 'Nm Torque' }, { value: '191', label: 'Kerb Weight' }] },
    { name: 'Super Meteor 650', engine: '648cc Parallel-Twin', price: 364000, financeEnabled: true, imageUrl: '/assets/images/meteor650.png', badge: 'Super Cruiser', category: 'cruiser', specs: [{ value: '47', label: 'PS @ 7250 rpm' }, { value: '52.3', label: 'Nm @ 5650 rpm' }, { value: '241', label: 'Kerb Weight' }] },
];

const categories = [
    { id: 'all', name: 'All Models' },
    { id: 'classic', name: 'Classic' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'roadster', name: 'Roadster' },
    { id: 'cruiser', name: 'Cruiser' },
];

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
                            <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Model Name</label><input name="name" type="text" value={formState.name} onChange={handleInputChange} placeholder="e.g., Classic 350" required /></div>
                            <div className="form-group"><label>Category</label><select name="category" value={formState.category} onChange={handleInputChange} required>{categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                            <div className="form-group"><label>Engine Spec</label><input name="engine" type="text" value={formState.engine} onChange={handleInputChange} placeholder="e.g., 349cc Single-Cylinder" required /></div>
                            <div className="form-group"><label>Ex-Showroom Price</label><input name="price" type="number" value={formState.price} onChange={handleInputChange} placeholder="e.g., 193000" required /></div>
                            <div className="form-group"><label>Badge</label><input name="badge" type="text" value={formState.badge} onChange={handleInputChange} placeholder="e.g., Bestseller" /></div>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Image URL</label><input name="imageUrl" type="text" value={formState.imageUrl} onChange={handleInputChange} placeholder="e.g., /assets/images/classic_350.png" required /></div>
                            <div className="form-group form-group-checkbox" style={{ gridColumn: '1 / -1', display:'flex', alignItems:'center', gap: '12px' }}>
                                <input type="checkbox" id="financeEnabled" name="financeEnabled" checked={formState.financeEnabled} onChange={handleInputChange} style={{width: 'auto'}}/>
                                <label htmlFor="financeEnabled" style={{marginBottom: 0}}>Enable Finance for this Model</label>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Specifications</p><button type="button" onClick={addSpecField} className="btn-outline" style={{ fontSize: '0.7rem', padding: '6px 10px' }}><i className="fa-solid fa-plus"></i> Add Spec</button></div>
                            {formState.specs.map((spec, index) => (
                                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '12px' }}><div className="form-group" style={{ margin: 0 }}><input type="text" value={spec.value} placeholder="Value (e.g. 20.2)" onChange={(e) => handleSpecChange(index, 'value', e.target.value)} /></div><div className="form-group" style={{ margin: 0 }}><input type="text" value={spec.label} placeholder="Label (e.g. BHP)" onChange={(e) => handleSpecChange(index, 'label', e.target.value)} /></div><button type="button" onClick={() => removeSpecField(index)} className="btn-delete" style={{ padding: '10px 12px' }}><i className="fa-solid fa-trash"></i></button></div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}><button type="submit" className="btn-primary" style={{ width: '100%' }}>{isEditing ? 'Update Product' : 'Add Product'}</button><button type="button" onClick={onClose} className="btn-outline" style={{ width: '100%' }}>Cancel</button></div>
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const productsQuery = activeFilter === 'all'
                ? query(collection(db, "products"), orderBy("createdAt", "desc"))
                : query(collection(db, "products"), where("category", "==", activeFilter), orderBy("createdAt", "desc"));
            const productsSnapshot = await getDocs(productsQuery);
            setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductData)));
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [activeFilter]);

    const handleAddClick = () => { setEditingProduct(null); setModalOpen(true); };
    const handleEditClick = (product: ProductData) => { setEditingProduct(product); setModalOpen(true); };
    const handleCloseModal = () => { setModalOpen(false); setEditingProduct(null); }

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm("Are you sure?")) {
            try { await deleteDoc(doc(db, "products", id)); fetchData(); } catch (error) { console.error("Error deleting: ", error); }
        }
    };

    const seedModels = async () => {
        setLoading(true);
        try {
            const productsRef = collection(db, "products");
            const existingNames = new Set((await getDocs(productsRef)).docs.map(d => d.data().name));
            const batch = writeBatch(db);
            let seededCount = 0;
            initialBikeModels.forEach(model => {
                if (!existingNames.has(model.name)) {
                    batch.set(doc(productsRef), { ...model, createdAt: serverTimestamp() });
                    seededCount++;
                }
            });
            if (seededCount > 0) { await batch.commit(); alert(`${seededCount} models seeded!`); fetchData(); } 
            else { alert('All models already exist.'); }
        } catch (error) { console.error("Error seeding: ", error); } 
        finally { setLoading(false); }
    };

    return (
        <div>
            <div className="product-management-header">
                <div style={{display: 'flex', gap: '1rem'}}><button onClick={handleAddClick} className="btn-primary"><i className="fa-solid fa-plus"></i> Add New Model</button><button onClick={seedModels} className="btn-outline"><i className="fa-solid fa-seedling"></i> Seed Models</button></div>
                <div className="filter-bar" style={{margin: 0}}><select onChange={(e) => setActiveFilter(e.target.value)} value={activeFilter} style={{padding: '12px 16px', borderRadius: '8px'}}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="admin-table-container mt-6">
                    <table className="admin-table">
                        <thead><tr><th>Model</th><th>Category</th><th>Price</th><th>Finance</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                        <tbody>
                            {products.length > 0 ? products.map((p: ProductData) => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td><span className="event-type-badge">{p.category}</span></td>
                                    <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(p.price)}</td>
                                    <td><span className={`status-badge ${p.financeEnabled ? 'status-active' : 'status-inactive'}`}>{p.financeEnabled ? 'Enabled' : 'Disabled'}</span></td>
                                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={() => handleEditClick(p)} className="btn-outline"><i className="fa-solid fa-pencil"></i> Edit</button><button onClick={() => handleDeleteProduct(p.id!)} className="btn-delete"><i className="fa-solid fa-trash"></i> Delete</button></td>
                                </tr>
                            )) : ( <tr><td colSpan={5} style={{textAlign: 'center', padding: '40px'}}><p>No models found for '{activeFilter}'.</p></td></tr> )}
                        </tbody>
                    </table>
                </div>
            )}
            <ProductModal isOpen={isModalOpen} onClose={handleCloseModal} product={editingProduct} onSave={fetchData} />
        </div>
    );
};

export default ProductManagement;
