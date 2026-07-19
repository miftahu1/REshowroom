'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import ImageUploader from '@/components/ImageUploader';
import { CldImage } from 'next-cloudinary';

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

const EmailUpdateModal = ({ isOpen, onClose, currentEmail, onSave }: { isOpen: boolean, onClose: () => void, currentEmail: string, onSave: (newEmail: string) => Promise<void> }) => {
    const [formState, setFormState] = useState({ current: '', new: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (formState.current !== currentEmail) {
            setError('The current email address does not match.');
            return;
        }
        if (!formState.new) {
            setError('Please enter a new email address.');
            return;
        }
        try {
            await onSave(formState.new);
            setSuccess('Manager email updated successfully! You can now close this window.');
            setFormState({ current: '', new: '' });
        } catch (err) {
            setError('Failed to update the email. Please try again.');
        }
    };

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Update Manager Email</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="current-email">Current Email</label>
                            <input type="email" id="current-email" name="current" value={formState.current} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="new-email">New Email</label>
                            <input type="email" id="new-email" name="new" value={formState.new} onChange={handleInputChange} required />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Changes</button>
                            <button type="button" onClick={onClose} className="btn-outline" style={{ width: '100%' }}>Cancel</button>
                        </div>
                        {error && <p className="error-message" style={{marginTop: '15px'}}>{error}</p>}
                        {success && <p className="success-message" style={{marginTop: '15px'}}>{success}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

const Settings = () => {
    const [managerEmail, setManagerEmail] = useState('');
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [promoBanner, setPromoBanner] = useState({ enabled: false, text: '', link: '' });
    const [heroImage, setHeroImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const managerDoc = await getDoc(doc(db, 'settings', 'managerDetails'));
        if (managerDoc.exists()) {
            setManagerEmail(managerDoc.data().email);
        }
        const promoDoc = await getDoc(doc(db, 'settings', 'promoBanner'));
        if (promoDoc.exists()) {
            setPromoBanner(promoDoc.data() as { enabled: boolean; text: string; link: string; });
        }
        const homepageDoc = await getDoc(doc(db, 'settings', 'homepage'));
        if (homepageDoc.exists()) {
            setHeroImage(homepageDoc.data().heroImage || '');
        }
        setLoading(false);
    };

    const handleUpdateEmail = async (newEmail: string) => {
        setSuccessMessage('');
        try {
            await setDoc(doc(db, 'settings', 'managerDetails'), { email: newEmail });
            setManagerEmail(newEmail);
            fetchSettings();
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const handleUpdateBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        setMessage('');
        try {
            await setDoc(doc(db, 'settings', 'promoBanner'), promoBanner);
            setSuccessMessage('Promotional banner updated successfully!');
        } catch (error) {
            setMessage('Failed to update promotional banner. Please try again.');
            console.error(error);
        }
    };

    const handleHeroImageUpload = async (publicId: string) => {
        setSuccessMessage('');
        setMessage('');
        try {
            await setDoc(doc(db, 'settings', 'homepage'), { heroImage: publicId });
            setHeroImage(publicId);
            setSuccessMessage('Homepage hero image updated successfully!');
        } catch (error) {
            console.error('Failed to update hero image:', error);
            setMessage('Failed to update hero image. Please try again.');
        }
    };
    
    const handleDeleteHeroImage = async () => {
        if (!window.confirm('Are you sure you want to delete the hero image? This will revert to the default image.')) return;
        setSuccessMessage('');
        setMessage('');
        try {
            const docRef = doc(db, 'settings', 'homepage');
            await updateDoc(docRef, { heroImage: deleteField() });
            setHeroImage('');
            setSuccessMessage('Hero image has been deleted. The site will now display the default image.');
        } catch (error) {
            console.error('Failed to delete hero image:', error);
            setMessage('Failed to delete hero image. Please try again.');
        }
    };

    if (loading) {
        return <p>Loading settings...</p>
    }

    return (
        <div className="admin-content">
            <div className="admin-header">
                <h1>Site Settings</h1>
                <p>Manage global configurations and content for your website.</p>
            </div>

            {successMessage && <div className="success-message" style={{marginBottom: '1.5rem'}}>{successMessage}</div>}
            {message && <div className="error-message" style={{marginBottom: '1.5rem'}}>{message}</div>}

            <div className="glass-card" style={{padding: '30px', marginBottom: '30px'}}>
                <h3>Manager Notification Email</h3>
                <p>This is the email address that receives notifications for new test ride bookings and contact messages.</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}><strong>{managerEmail || "Not Set"}</strong></p>
                    <button onClick={() => setEmailModalOpen(true)} className="btn-outline" style={{padding: '8px 12px'}}><i className="fa-solid fa-pencil"></i></button>
                </div>
            </div>

            <div className="glass-card" style={{padding: '30px', marginBottom: '30px'}}>
                <h3>Homepage Content</h3>
                <p>Control the dynamic content on your main homepage.</p>
                <div className="form-group" style={{marginTop: '20px'}}>
                    <label>Hero Section Bike Image</label>
                    <p className="text-muted" style={{fontSize: '0.9rem', marginTop: '-5px', marginBottom: '15px'}}>Recommended aspect ratio: 4:3. This image replaces the default bike image in the hero section.</p>
                    {heroImage ? (
                        <div style={{marginBottom: '1rem', position: 'relative', display: 'inline-block'}}>
                             <CldImage src={heroImage} width="400" height="300" alt="Current Hero Image" style={{borderRadius: '8px'}} format="auto" quality="auto" />
                             <button 
                                onClick={handleDeleteHeroImage}
                                style={{
                                    position: 'absolute', 
                                    top: '12px', 
                                    right: '12px', 
                                    background: 'rgba(0,0,0,0.6)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '50%', 
                                    width: '32px', 
                                    height: '32px', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                aria-label="Delete hero image"
                             >
                                 <i className="fa-solid fa-trash"></i>
                             </button>
                        </div>
                    ) : (
                        <p style={{fontStyle: 'italic', color: 'var(--gray-400)'}}>No custom hero image set. Displaying default image.</p>
                    )}
                    <ImageUploader
                        onUploadSuccess={(url, publicId) => handleHeroImageUpload(publicId)}
                        aspectRatio={4/3}
                        folder="re_homepage"
                    />
                </div>
            </div>

            <div className="glass-card" style={{padding: '30px'}}>
                <h3>Promotional Banner</h3>
                <p>Display a notification banner at the top of the homepage.</p>
                <form onSubmit={handleUpdateBanner}>
                    <div className="form-group">
                        <label style={{display: 'flex', alignItems: 'center'}}>
                            <input type="checkbox" checked={promoBanner.enabled} onChange={(e) => setPromoBanner({...promoBanner, enabled: e.target.checked})} style={{width: 'auto', marginRight: '10px'}} />
                            Enable Promotional Banner
                        </label>
                    </div>
                    <div className="form-group">
                        <label htmlFor="promoText">Banner Text</label>
                        <input type="text" id="promoText" value={promoBanner.text} onChange={(e) => setPromoBanner({...promoBanner, text: e.target.value})} placeholder="e.g., Limited Time: Monsoon Service Camp!" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="promoLink">Banner Link (Optional)</label>
                        <input type="text" id="promoLink" value={promoBanner.link} onChange={(e) => setPromoBanner({...promoBanner, link: e.target.value})} placeholder="e.g., /services" />
                    </div>
                    <button type="submit" className="btn-primary">Save Banner Settings</button>
                </form>
            </div>
            <EmailUpdateModal isOpen={isEmailModalOpen} onClose={() => setEmailModalOpen(false)} currentEmail={managerEmail} onSave={handleUpdateEmail} />
        </div>
    );
};

export default Settings;