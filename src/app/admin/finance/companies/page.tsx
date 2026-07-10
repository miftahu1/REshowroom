'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, FieldValue, writeBatch } from "firebase/firestore";

interface FinanceCompany {
    id?: string;
    name: string;
    logo: string;
    description: string;
    interestRate: number;
    processingFee: number;
    minLoanAmount: number;
    maxLoanAmount: number;
    allowedTenures: number[];
    displayOrder: number;
    isActive: boolean;
    createdAt?: FieldValue;
}

const tenureOptions = [12, 24, 36, 48, 60, 72];

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

const FinanceCompanyModal = ({ isOpen, onClose, company, onSave }: { isOpen: boolean, onClose: () => void, company: FinanceCompany | null, onSave: () => void }) => {
    const getInitialFormState = (): Omit<FinanceCompany, 'id' | 'createdAt'> => ({
        name: '', logo: '', description: '', interestRate: 0, processingFee: 0,
        minLoanAmount: 0, maxLoanAmount: 0, allowedTenures: [], displayOrder: 0, isActive: false
    });
    const [formState, setFormState] = useState(getInitialFormState());
    const isEditing = company?.id;

    useEffect(() => {
        if (isOpen) {
            setFormState(company ? { ...getInitialFormState(), ...company } : getInitialFormState());
        }
    }, [isOpen, company]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormState(prevState => ({ ...prevState, [name]: checked }));
        } else {
            setFormState(prevState => ({ ...prevState, [name]: (type === 'number') ? (parseFloat(value) || 0) : value }));
        }
    };

    const handleTenureChange = (tenure: number) => {
        const { allowedTenures } = formState;
        const newTenures = allowedTenures.includes(tenure)
            ? allowedTenures.filter(t => t !== tenure)
            : [...allowedTenures, tenure];
        setFormState(prevState => ({ ...prevState, allowedTenures: newTenures.sort((a, b) => a - b) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { createdAt, id, ...companyData } = formState;
            if (isEditing) {
                await updateDoc(doc(db, "finance_companies", company!.id!), companyData);
            } else {
                await addDoc(collection(db, "finance_companies"), { ...companyData, createdAt: serverTimestamp() });
            }
            onClose();
            onSave();
        } catch (error) {
            console.error("Error saving company: ", error);
        }
    };

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                <div className="modal-header"><h3>{isEditing ? 'Edit' : 'Add New'} Finance Company</h3><button onClick={onClose} className="modal-close-btn">&times;</button></div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Company Name</label><input name="name" type="text" value={formState.name} onChange={handleInputChange} required /></div>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Logo URL</label><input name="logo" type="text" value={formState.logo} onChange={handleInputChange} /></div>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Description</label><textarea name="description" value={formState.description} onChange={handleInputChange}></textarea></div>
                            <div className="form-group"><label>Interest Rate (%)</label><input name="interestRate" type="number" step="0.01" value={formState.interestRate} onChange={handleInputChange} /></div>
                            <div className="form-group"><label>Processing Fee (₹)</label><input name="processingFee" type="number" value={formState.processingFee} onChange={handleInputChange} /></div>
                            <div className="form-group"><label>Min Loan (₹)</label><input name="minLoanAmount" type="number" value={formState.minLoanAmount} onChange={handleInputChange} /></div>
                            <div className="form-group"><label>Max Loan (₹)</label><input name="maxLoanAmount" type="number" value={formState.maxLoanAmount} onChange={handleInputChange} /></div>
                            <div className="form-group" style={{gridColumn: '1 / -1'}}><label>Allowed Tenures</label>
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                                    {tenureOptions.map(t => <label key={t} className="checkbox-label"><input type="checkbox" checked={formState.allowedTenures.includes(t)} onChange={() => handleTenureChange(t)} /> {t} Months</label>)}
                                </div>
                            </div>
                            <div className="form-group"><label>Display Order</label><input name="displayOrder" type="number" value={formState.displayOrder} onChange={handleInputChange} /></div>
                            <div className="form-group form-group-checkbox"><input type="checkbox" id="isActive" name="isActive" checked={formState.isActive} onChange={handleInputChange} /><label htmlFor="isActive">Active</label></div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}><button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Save'}</button><button type="button" onClick={onClose} className="btn-outline">Cancel</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const FinanceCompaniesPage = () => {
    const [companies, setCompanies] = useState<FinanceCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<FinanceCompany | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "finance_companies"), orderBy("displayOrder"));
            const snapshot = await getDocs(q);
            setCompanies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinanceCompany)));
        } catch (error) {
            console.error("Error fetching companies: ", error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAddClick = () => { setEditingCompany(null); setModalOpen(true); };
    const handleEditClick = (company: FinanceCompany) => { setEditingCompany(company); setModalOpen(true); };
    const handleCloseModal = () => { setModalOpen(false); setEditingCompany(null); }

    const handleDeleteCompany = async (id: string) => {
        if (window.confirm("Delete this company?")) {
            try { await deleteDoc(doc(db, "finance_companies", id)); fetchData(); } catch (error) { console.error("Error deleting: ", error); }
        }
    };

    return (
        <div>
            <div className="product-management-header"><button onClick={handleAddClick} className="btn-primary"><i className="fa-solid fa-plus"></i> Add Company</button></div>
            {loading ? <p>Loading...</p> : (
                <div className="admin-table-container mt-6">
                    <table className="admin-table">
                        <thead><tr><th>Logo</th><th>Name</th><th>Interest Rate</th><th>Tenures</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                        <tbody>
                            {companies.map(c => (
                                <tr key={c.id}>
                                    <td><img src={c.logo} alt={c.name} style={{width: '100px', height: 'auto'}} /></td>
                                    <td>{c.name}</td>
                                    <td>{c.interestRate}%</td>
                                    <td>{c.allowedTenures.join(', ')}</td>
                                    <td><span className={`status-badge ${c.isActive ? 'status-active' : 'status-inactive'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={() => handleEditClick(c)} className="btn-outline"><i className="fa-solid fa-pencil"></i></button><button onClick={() => handleDeleteCompany(c.id!)} className="btn-delete"><i className="fa-solid fa-trash"></i></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <FinanceCompanyModal isOpen={isModalOpen} onClose={handleCloseModal} company={editingCompany} onSave={fetchData} />
        </div>
    );
};

export default FinanceCompaniesPage;
