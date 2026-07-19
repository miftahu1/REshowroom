'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, FieldValue, where } from "firebase/firestore";
import ImageUploader from '@/components/ImageUploader';
import { CldImage } from 'next-cloudinary';

// Type definitions
type Spec = { value: string; label: string };
interface ProductData {
    id?: string;
    name: string;
    engine: string;
    price: string;
    financeEnabled: boolean;
    imageUrl: string; // Cloudinary Public ID
    badge: string;
    specs: Spec[];
    category: string;
    createdAt?: FieldValue;
    offer?: {
        enabled: boolean;
        type: 'percentage' | 'fixed';
        value: number;
        title: string;
        startDate: string;
        endDate: string;
        countdownEnabled: boolean;
        badgeColor: string;
    };
}

const categories = [
    { id: 'classic', name: 'Classic' },
    { id: 'hunter', name: 'Hunter' },
    { id: 'bullet', name: 'Bullet' },
    { id: 'himalayan', name: 'Himalayan' },
    { id: 'scram', name: 'Scram' },
    { id: 'meteor', name: 'Meteor' },
    { id: 'super-meteor', name: 'Super Meteor' },
    { id: 'continental-gt', name: 'Continental GT' },
    { id: 'interceptor', name: 'Interceptor' },
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

// Modal Component
const ProductModal = ({ isOpen, onClose, product, onSave }: { isOpen: boolean, onClose: () => void, product: ProductData | null, onSave: () => void }) => {
    const getInitialFormState = (): Omit<ProductData, 'id' | 'createdAt'> => ({
        name: '', engine: '', price: '', financeEnabled: false, imageUrl: '', badge: '', specs: [], category: 'classic',
        offer: {
            enabled: false,
            type: 'percentage',
            value: 0,
            title: '',
            startDate: '',
            endDate: '',
            countdownEnabled: false,
            badgeColor: '#FF0000'
        }
    });

    const [formState, setFormState] = useState<Omit<ProductData, 'id' | 'createdAt'>>(getInitialFormState());
    const isEditing = !!product;

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
            setFormState(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const { checked } = e.target as HTMLInputElement;

        setFormState(prevState => ({
            ...prevState,
            offer: {
                ...prevState.offer!,
                [name]: isCheckbox ? checked : value
            }
        }));
    };

    const handleImageUpload = (url: string, publicId: string) => {
        setFormState(prevState => ({ ...prevState, imageUrl: publicId }));
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
            const productData = { ...formState };
            if (isEditing && product?.id) {
                await updateDoc(doc(db, "products", product.id), productData);
            } else {
                await addDoc(collection(db, "products"), { ...productData, createdAt: serverTimestamp() });
            }
            onClose();
            onSave();
        } catch (error) {
            console.error("Error saving product: ", error);
            // Add user-facing error message here
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{isEditing ? 'Edit Model' : 'Add New Model'}</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Model Image</label>
                                {formState.imageUrl && (
                                     <div style={{ marginBottom: '1rem' }}>
                                         <CldImage src={formState.imageUrl} width="400" height="300" alt="Current Image" />
                                     </div>
                                )}
                                <ImageUploader
                                    onUploadSuccess={handleImageUpload}
                                    aspectRatio={16/9}
                                    folder="re_models"
                                    publicId={isEditing ? formState.imageUrl : undefined}
                                />
                            </div>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label>Model Name</label>
                                <input type="text" name="name" value={formState.name} onChange={handleInputChange} placeholder="e.g., Classic 350" required />
                            </div>
                            <div className="form-group">
                                <label>Engine</label>
                                <input type="text" name="engine" value={formState.engine} onChange={handleInputChange} placeholder="e.g., 349cc J-series" />
                            </div>
                            <div className="form-group">
                                <label>Price (Starting From)</label>
                                <input type="text" name="price" value={formState.price} onChange={handleInputChange} placeholder="e.g., 150000" />
                            </div>
                             <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formState.category} onChange={handleInputChange}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                             <div className="form-group">
                                <label>Badge Text</label>
                                <input type="text" name="badge" value={formState.badge} onChange={handleInputChange} placeholder="e.g., New Arrival" />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ marginBottom: 0 }}>Finance Enabled</label>
                                <input type="checkbox" name="financeEnabled" checked={formState.financeEnabled} onChange={handleInputChange} style={{width: '1.2rem', height: '1.2rem'}}/>
                            </div>
                        </div>

                        <div style={{marginTop: '1.5rem'}}>
                            <h4 style={{fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1rem'}}>Specifications</h4>
                            {formState.specs.map((spec, index) => (
                                <div key={index} style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '10px'}}>
                                    <input type="text" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} placeholder="Value (e.g., 20.2 bhp)" />
                                    <input type="text" value={spec.label} onChange={(e) => handleSpecChange(index, 'label', e.target.value)} placeholder="Label (e.g., Max Power)" />
                                    <button type="button" onClick={() => removeSpecField(index)} className="btn-delete">Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={addSpecField} className="btn-outline mt-2">Add Spec</button>
                        </div>

                        <div style={{marginTop: '1.5rem'}}>
                            <h4 style={{fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1rem'}}>Discount Offer</h4>
                             <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ marginBottom: 0 }}>Offer Enabled</label>
                                <input type="checkbox" name="enabled" checked={formState.offer?.enabled} onChange={handleOfferChange} style={{width: '1.2rem', height: '1.2rem'}}/>
                            </div>
                            {formState.offer?.enabled && (
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '1rem' }}>
                                    <div className="form-group">
                                        <label>Offer Title</label>
                                        <input type="text" name="title" value={formState.offer.title} onChange={handleOfferChange} placeholder="e.g., Limited Time Offer" />
                                    </div>
                                    <div className="form-group">
                                        <label>Offer Type</label>
                                        <select name="type" value={formState.offer.type} onChange={handleOfferChange}>
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed Amount</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Discount Value</label>
                                        <input type="number" name="value" value={formState.offer.value} onChange={handleOfferChange} placeholder="e.g., 10 or 15000" />
                                    </div>
                                    <div className="form-group">
                                        <label>Offer Badge Color</label>
                                        <input type="color" name="badgeColor" value={formState.offer.badgeColor} onChange={handleOfferChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Offer Start Date</label>
                                        <input type="date" name="startDate" value={formState.offer.startDate} onChange={handleOfferChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Offer End Date</label>
                                        <input type="date" name="endDate" value={formState.offer.endDate} onChange={handleOfferChange} />
                                    </div>
                                     <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <label style={{ marginBottom: 0 }}>Countdown Enabled</label>
                                        <input type="checkbox" name="countdownEnabled" checked={formState.offer.countdownEnabled} onChange={handleOfferChange} style={{width: '1.2rem', height: '1.2rem'}}/>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer" style={{paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)'}}>
                            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
                            <button type="submit" className="btn-primary">{isEditing ? 'Save Changes' : 'Create Model'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


// Main Page Component
const ProductManagement = () => {
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const productsCollection = collection(db, "products");
            const q = activeFilter === 'all'
                ? query(productsCollection, orderBy("createdAt", "desc"))
                : query(productsCollection, where("category", "==", activeFilter), orderBy("createdAt", "desc"));
            
            const querySnapshot = await getDocs(q);
            const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProductData[];
            setProducts(productsData);
        } catch (error) {
            console.error("Error fetching products: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeFilter]);

    const handleAddClick = () => {
        setEditingProduct(null);
        setModalOpen(true);
    };

    const handleEditClick = (product: ProductData) => {
        setEditingProduct(product);
        setModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    }

    const handleDeleteProduct = async (product: ProductData) => {
        if (window.confirm(`Are you sure you want to delete the model "${product.name}"?`)) {
            try {
                if (!product.id) return;
                // Delete Firestore document
                await deleteDoc(doc(db, "products", product.id));

                // If there's an image, delete it from Cloudinary
                if (product.imageUrl) {
                    await fetch('/api/cloudinary', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ publicId: product.imageUrl })
                    });
                }

                fetchData(); // Refresh data
            } catch (error) {
                console.error("Error deleting product: ", error);
            }
        }
    };

    return (
        <div className="admin-content">
            <div className="admin-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <h1>Product Models</h1>
                    <p>Add, edit, and manage all motorcycle models for the catalog.</p>
                </div>
                <button onClick={handleAddClick} className="btn-primary">
                    <i className="fas fa-plus"></i> Add New Model
                </button>
            </div>
            
            <div className="filter-tabs">
                <button onClick={() => setActiveFilter('all')} className={activeFilter === 'all' ? 'active' : ''}>All Models</button>
                {categories.map(c => (
                    <button key={c.id} onClick={() => setActiveFilter(c.id)} className={activeFilter === c.id ? 'active' : ''}>{c.name}</button>
                ))}
            </div>

            {loading ? <div className="loading-container" style={{minHeight: '300px', display:'grid', placeContent:'center'}}><div className='loading-spinner'></div></div> : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Model</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Finance</th>
                                <th>Offer</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? products.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        {p.imageUrl ? (
                                            <CldImage src={p.imageUrl} alt={p.name} width="120" height="90" style={{objectFit: 'cover', borderRadius: '8px'}} />
                                        ) : (
                                            <div style={{width: '120px', height: '90px', background: 'var(--glass-border)', borderRadius: '8px', display:'grid', placeContent:'center', fontSize:'0.8rem', color:'var(--text-muted)'}}>No Image</div>
                                        )}
                                    </td>
                                    <td style={{fontWeight: 'bold'}}>{p.name}</td>
                                    <td><span className="event-admin-type-badge event-type-offer">{p.category}</span></td>
                                    <td>{p.price}</td>
                                    <td><span className={`status-badge ${p.financeEnabled ? 'status-approved' : 'status-pending'}`}>{p.financeEnabled ? 'Yes' : 'No'}</span></td>
                                    <td><span className={`status-badge ${p.offer?.enabled ? 'status-approved' : 'status-pending'}`}>{p.offer?.enabled ? 'Active' : 'Inactive'}</span></td>
                                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleEditClick(p)} className="btn-outline"><i className="fas fa-pencil-alt"></i> Edit</button>
                                        <button onClick={() => handleDeleteProduct(p)} className="btn-delete"><i className="fas fa-trash"></i> Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} style={{textAlign: 'center', padding: '4rem'}}>
                                        <p>No models found for '{activeFilter}'.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <ProductModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                product={editingProduct} 
                onSave={fetchData} 
            />
        </div>
    );
};

export default ProductManagement;
