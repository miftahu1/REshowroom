'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, FieldValue } from "firebase/firestore";

// Type definitions
interface CampaignData {
    id?: string;
    campaignName: string;
    enabled: boolean;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate: string;
    endDate: string;
    applyTo: 'all' | 'selected';
    selectedProducts: string[];
    createdAt?: FieldValue;
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

// Modal Component
const CampaignModal = ({ isOpen, onClose, campaign, onSave, products }: { isOpen: boolean, onClose: () => void, campaign: CampaignData | null, onSave: () => void, products: any[] }) => {
    const getInitialFormState = (): Omit<CampaignData, 'id' | 'createdAt'> => ({
        campaignName: '', enabled: false, discountType: 'percentage', discountValue: 0, startDate: '', endDate: '', applyTo: 'all', selectedProducts: []
    });

    const [formState, setFormState] = useState<Omit<CampaignData, 'id' | 'createdAt'>>(getInitialFormState());
    const isEditing = !!campaign;

    useEffect(() => {
        if (isOpen) {
            setFormState(campaign ? { ...getInitialFormState(), ...campaign } : getInitialFormState());
        }
    }, [isOpen, campaign]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormState(prevState => ({ ...prevState, [name]: checked }));
        } else {
            setFormState(prevState => ({ ...prevState, [name]: value }));
        }
    };
    
    const handleProductSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormState(prevState => ({ ...prevState, selectedProducts: selectedOptions }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const campaignData = { ...formState };
            if (isEditing && campaign?.id) {
                await updateDoc(doc(db, "campaigns", campaign.id), campaignData);
            } else {
                await addDoc(collection(db, "campaigns"), { ...campaignData, createdAt: serverTimestamp() });
            }
            onClose();
            onSave();
        } catch (error) {
            console.error("Error saving campaign: ", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{isEditing ? 'Edit Campaign' : 'Add New Campaign'}</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label>Campaign Name</label>
                                <input type="text" name="campaignName" value={formState.campaignName} onChange={handleInputChange} placeholder="e.g., Diwali Mega Sale" required />
                            </div>
                           <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ marginBottom: 0 }}>Enabled</label>
                                <input type="checkbox" name="enabled" checked={formState.enabled} onChange={handleInputChange} style={{width: '1.2rem', height: '1.2rem'}}/>
                            </div>
                             <div className="form-group">
                                <label>Discount Type</label>
                                <select name="discountType" value={formState.discountType} onChange={handleInputChange}>
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Discount Value</label>
                                <input type="number" name="discountValue" value={formState.discountValue} onChange={handleInputChange} placeholder="e.g., 10 or 15000" />
                            </div>
                             <div className="form-group">
                                <label>Start Date</label>
                                <input type="date" name="startDate" value={formState.startDate} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input type="date" name="endDate" value={formState.endDate} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Apply To</label>
                                <select name="applyTo" value={formState.applyTo} onChange={handleInputChange}>
                                    <option value="all">All Models</option>
                                    <option value="selected">Selected Models</option>
                                </select>
                            </div>
                            {formState.applyTo === 'selected' && (
                                <div className="form-group">
                                    <label>Select Models</label>
                                    <select multiple name="selectedProducts" value={formState.selectedProducts} onChange={handleProductSelection} style={{ height: '200px' }}>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer" style={{paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)'}}>
                            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
                            <button type="submit" className="btn-primary">{isEditing ? 'Save Changes' : 'Create Campaign'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


// Main Page Component
const CampaignManagement = () => {
    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<CampaignData | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const campaignsCollection = collection(db, "campaigns");
            const q = query(campaignsCollection, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const campaignsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CampaignData[];
            setCampaigns(campaignsData);

            const productsCollection = collection(db, "products");
            const productsSnapshot = await getDocs(productsCollection);
            const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddClick = () => {
        setEditingCampaign(null);
        setModalOpen(true);
    };

    const handleEditClick = (campaign: CampaignData) => {
        setEditingCampaign(campaign);
        setModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingCampaign(null);
    }

    const handleDeleteCampaign = async (campaign: CampaignData) => {
        if (window.confirm(`Are you sure you want to delete the campaign "${campaign.campaignName}"?`)) {
            try {
                if (!campaign.id) return;
                await deleteDoc(doc(db, "campaigns", campaign.id));
                fetchData(); // Refresh data
            } catch (error) {
                console.error("Error deleting campaign: ", error);
            }
        }
    };

    return (
        <div className="admin-content">
            <div className="admin-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <h1>Discount Campaigns</h1>
                    <p>Create and manage sitewide discount campaigns.</p>
                </div>
                <button onClick={handleAddClick} className="btn-primary">
                    <i className="fas fa-plus"></i> Add New Campaign
                </button>
            </div>

            {loading ? <div className="loading-container" style={{minHeight: '300px', display:'grid', placeContent:'center'}}><div className='loading-spinner'></div></div> : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Campaign Name</th>
                                <th>Discount</th>
                                <th>Type</th>
                                <th>Applied To</th>
                                <th>Status</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length > 0 ? campaigns.map((c) => (
                                <tr key={c.id}>
                                    <td style={{fontWeight: 'bold'}}>{c.campaignName}</td>
                                    <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                                    <td><span className="event-admin-type-badge event-type-offer">{c.discountType}</span></td>
                                    <td>{c.applyTo === 'all' ? 'All Models' : `${c.selectedProducts.length} Models`}</td>
                                    <td><span className={`status-badge ${c.enabled ? 'status-approved' : 'status-pending'}`}>{c.enabled ? 'Active' : 'Inactive'}</span></td>
                                    <td>{c.startDate}</td>
                                    <td>{c.endDate}</td>
                                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleEditClick(c)} className="btn-outline"><i className="fas fa-pencil-alt"></i> Edit</button>
                                        <button onClick={() => handleDeleteCampaign(c)} className="btn-delete"><i className="fas fa-trash"></i> Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} style={{textAlign: 'center', padding: '4rem'}}>
                                        <p>No campaigns found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <CampaignModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                campaign={editingCampaign} 
                onSave={fetchData} 
                products={products}
            />
        </div>
    );
};

export default CampaignManagement;
