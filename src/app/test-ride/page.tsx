'use client'

import { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import emailjs from '@emailjs/browser';
import '../globals.css';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// --- IMPORTANT: ADD YOUR EMAILJS DETAILS HERE ---
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string;
const EMAILJS_TEMPLATE_ID_MANAGER = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_MANAGER as string;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string;

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const TestRidePage = () => {
    const [models, setModels] = useState<any[]>([]);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', model: '', date: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

    useEffect(() => {
        const fetchModels = async () => {
            const modelsQuery = query(collection(db, "products"), orderBy("name"));
            const modelsSnapshot = await getDocs(modelsQuery);
            setModels(modelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchModels();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getManagerEmail = async () => {
        try {
            const docRef = doc(db, 'settings', 'managerDetails');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data().email;
            } else {
                console.warn("Manager email not set in settings, using fallback.");
                return "miftahulhussain0@gmail.com"; // Fallback email
            }
        } catch (error) {
            console.error("Error fetching manager email:", error);
            return "miftahulhussain0@gmail.com"; // Fallback on error
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        const managerEmail = await getManagerEmail();

        const templateParams = {
            ...formData,
            to_email: managerEmail,
            from_name: formData.name,
            message: `New test ride booking from ${formData.name}. Model: ${formData.model}, Date: ${formData.date}, Phone: ${formData.phone}, Email: ${formData.email}`
        };

        try {
            // Save to Firestore
            await addDoc(collection(db, "bookings"), {
                ...formData,
                timestamp: serverTimestamp(),
                status: 'Pending'
            });

            // Send Email Notification
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_MANAGER, templateParams, EMAILJS_PUBLIC_KEY);

            setSubmitStatus('success');
            setFormData({ name: '', phone: '', email: '', model: '', date: '' });

        } catch (error) {
            console.error("Submission failed:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
            <div className="form-container glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 className="form-title">Book a Test Ride</h1>
                <p>Fill out the form below and we'll get in touch to confirm your test ride.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="model">Select Model</label>
                        <select id="model" name="model" value={formData.model} onChange={handleInputChange} required>
                            <option value="">-- Choose a Motorcycle --</option>
                            {models.map(m => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Preferred Date</label>
                        <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
                        {isSubmitting ? 'Submitting...' : 'Request Ride'}
                    </button>
                    {submitStatus === 'success' && <p className="success-message">Your request has been sent! We will contact you shortly.</p>}
                    {submitStatus === 'error' && <p className="error-message">Something went wrong. Please try again.</p>}
                </form>
            </div>
        </div>
    );
}

export default TestRidePage;
