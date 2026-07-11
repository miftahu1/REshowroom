'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, FieldValue } from "firebase/firestore";
import { ImageUploader, CLImage } from '@/components/ImageUploader';

interface FinanceCompany {
    id?: string;
    name: string;
    logo: string; // Now stores Cloudinary Public ID
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

// ... (tenureOptions and firebaseConfig remain the same)

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const FinanceCompanyModal = ({ isOpen, onClose, company, onSave }: { isOpen: boolean, onClose: () => void, company: FinanceCompany | null, onSave: () => void }) => {
    const getInitialFormState = (): Omit<FinanceCompany, 'id' | 'createdAt'> => ({ name: '', logo: '', description: '', interestRate: 0, processingFee: 0, minLoanAmount: 0, maxLoanAmount: 0, allowedTenures: [], displayOrder: 0, isActive: false });
    const [formState, setFormState] = useState<FinanceCompany>(getInitialFormState());
    const isEditing = company?.id;

    useEffect(() => {
        if (isOpen) {
            setFormState(company ? { ...getInitialFormState(), ...company } : getInitialFormState());
        }
    }, [isOpen, company]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { /* ... */ };
    const handleTenureChange = (tenure: number) => { /* ... */ };

    const handleImageUpload = (info: any) => {
        setFormState(prevState => ({ ...prevState, logo: info.public_id }));
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
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label>Company Logo</label>
                            <ImageUploader onUploadSuccess={handleImageUpload} initialValue={formState.logo} />
                        </div>
                        {/* ... other form fields ... */}
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

    const fetchData = async () => { /* ... */ };
    useEffect(() => { fetchData(); }, []);

    const handleAddClick = () => { setEditingCompany(null); setModalOpen(true); };
    const handleEditClick = (company: FinanceCompany) => { setEditingCompany(company); setModalOpen(true); };
    const handleCloseModal = () => { setModalOpen(false); setEditingCompany(null); }

    const handleDeleteCompany = async (company: FinanceCompany) => {
        if (window.confirm("Delete this company?")) {
            try {
                await deleteDoc(doc(db, "finance_companies", company.id!));
                if (company.logo) {
                    await fetch('/api/cloudinary', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ publicId: company.logo })
                    });
                }
                fetchData();
            } catch (error) {
                console.error("Error deleting: ", error);
            }
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
                                    <td>{c.logo && <CLImage publicId={c.logo} alt={c.name} className="w-24 h-16 object-contain" />}</td>
                                    {/* ... other table cells ... */}
                                    <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><button onClick={() => handleEditClick(c)} className="btn-outline"><i className="fa-solid fa-pencil"></i></button><button onClick={() => handleDeleteCompany(c)} className="btn-delete"><i className="fa-solid fa-trash"></i></button></td>
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
