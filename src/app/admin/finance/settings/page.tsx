'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface FinanceSettings {
    defaultDisclaimer: string;
    currencySymbol: string;
    enableProcessingFee: boolean;
    enableDownPaymentSlider: boolean;
    minDownPaymentPercentage: number;
    maxDownPaymentPercentage: number;
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

const FinanceSettingsPage = () => {
    const getInitialFormState = (): FinanceSettings => ({
        defaultDisclaimer: 'Estimated only. Actual EMI may vary depending on bank approval and final loan terms.',
        currencySymbol: '₹',
        enableProcessingFee: true,
        enableDownPaymentSlider: true,
        minDownPaymentPercentage: 10,
        maxDownPaymentPercentage: 50,
    });
    const [settings, setSettings] = useState<FinanceSettings>(getInitialFormState());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, "settings", "finance");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings({ ...getInitialFormState(), ...docSnap.data() });
                } else {
                    await setDoc(docRef, getInitialFormState());
                }
            } catch (error) {
                console.error("Error fetching settings: ", error);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setSettings(prevState => ({ ...prevState, [name]: checked }));
        } else {
            setSettings(prevState => ({ ...prevState, [name]: (type === 'number') ? (parseFloat(value) || 0) : value }));
        }
    };

    const handleSaveSettings = async () => {
        try {
            // Create a plain JS object from state to satisfy Firestore's type requirements
            const settingsData = { ...settings };
            await updateDoc(doc(db, "settings", "finance"), settingsData);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Error saving settings: ", error);
            alert('Error saving settings.');
        }
    };

    if (loading) {
        return <p>Loading settings...</p>;
    }

    return (
        <div className="finance-settings-form">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                    <label>Default Disclaimer</label>
                    <textarea name="defaultDisclaimer" value={settings.defaultDisclaimer} onChange={handleInputChange} rows={3}></textarea>
                </div>
                <div className="form-group">
                    <label>Currency Symbol</label>
                    <input name="currencySymbol" type="text" value={settings.currencySymbol} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Minimum Down Payment (%)</label>
                    <input name="minDownPaymentPercentage" type="number" value={settings.minDownPaymentPercentage} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Maximum Down Payment (%)</label>
                    <input name="maxDownPaymentPercentage" type="number" value={settings.maxDownPaymentPercentage} onChange={handleInputChange} />
                </div>
                <div className="form-group form-group-checkbox">
                    <input type="checkbox" id="enableProcessingFee" name="enableProcessingFee" checked={settings.enableProcessingFee} onChange={handleInputChange} />
                    <label htmlFor="enableProcessingFee">Enable Processing Fee Display</label>
                </div>
                <div className="form-group form-group-checkbox">
                    <input type="checkbox" id="enableDownPaymentSlider" name="enableDownPaymentSlider" checked={settings.enableDownPaymentSlider} onChange={handleInputChange} />
                    <label htmlFor="enableDownPaymentSlider">Enable Down Payment Slider</label>
                </div>
            </div>

            <div style={{ marginTop: '32px' }}>
                <button onClick={handleSaveSettings} className="btn-primary">Save Settings</button>
            </div>
        </div>
    );
};

export default FinanceSettingsPage;
