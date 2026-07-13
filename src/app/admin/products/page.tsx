'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, FieldValue, where } from "firebase/firestore";
import { ImageUploader, CLImage } from '@/components/ImageUploader';

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
        name: '', engine: '', price: '', financeEnabled: false, imageUrl: '', badge: '', specs: [], category: 'classic'
    });

    const [formState, setFormState] = useState<Omit<ProductData, 'id' | 'createdAt'>>(getInitialFormState());
    const isEditing = !!product;

    useEffect(() => {
        if (isOpen) {
            setFormState(product ? { ...product } : getInitialFormState());
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
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Model Image</label>
                                <ImageUploader
                                    onUploadSuccess={handleImageUpload}
                                    initialValue={formState.imageUrl}
                                />
                            </div>
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
                                <input type="text" name="price" value={formState.price} onChange={handleInputChange} placeholder="e.g., 1.93 L" />
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
                                <input type="checkbox" name="financeEnabled" checked={formState.financeEnabled} onChange={handleInputChange} className="w-6 h-6"/>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-lg font-semibold mb-2">Specifications</h4>
                            {formState.specs.map((spec, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                                    <input type="text" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} placeholder="Value (e.g., 20.2 bhp)" className="col-span-1" />
                                    <input type="text" value={spec.label} onChange={(e) => handleSpecChange(index, 'label', e.target.value)} placeholder="Label (e.g., Max Power)" className="col-span-1" />
                                    <button type="button" onClick={() => removeSpecField(index)} className="btn-delete col-span-1">Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={addSpecField} className="btn-outline mt-2">Add Spec</button>
                        </div>

                        <div className="modal-footer">
                            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Product Models</h1>
                <button onClick={handleAddClick} className="btn-primary">
                    <i className="fa-solid fa-plus"></i> Add New Model
                </button>
            </div>
            
            <div className="filter-tabs">
                <button onClick={() => setActiveFilter('all')} className={activeFilter === 'all' ? 'active' : ''}>All</button>
                {categories.map(c => (
                    <button key={c.id} onClick={() => setActiveFilter(c.id)} className={activeFilter === c.id ? 'active' : ''}>{c.name}</button>
                ))}
            </div>

            {loading ? <div className="text-center py-10">Loading...</div> : (
                <div className="admin-table-container mt-6">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Model</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Finance</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? products.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        {p.imageUrl ? (
                                            <CLImage publicId={p.imageUrl} alt={p.name} className="w-24 h-16 object-cover rounded-md" />
                                        ) : (
                                            <div className="w-24 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">No Image</div>
                                        )}
                                    </td>
                                    <td className="font-semibold">{p.name}</td>
                                    <td><span className="event-type-badge">{p.category}</span></td>
                                    <td>{p.price}</td>
                                    <td><span className={`status-badge ${p.financeEnabled ? 'status-active' : 'status-inactive'}`}>{p.financeEnabled ? 'Enabled' : 'Disabled'}</span></td>
                                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleEditClick(p)} className="btn-outline"><i className="fa-solid fa-pencil"></i> Edit</button>
                                        <button onClick={() => handleDeleteProduct(p)} className="btn-delete"><i className="fa-solid fa-trash"></i> Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{textAlign: 'center', padding: '40px'}}>
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
