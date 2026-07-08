'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";

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

const ReviewsManagement = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const reviewsQuery = query(collection(db, "reviews"), orderBy("timestamp", "desc"));
            const reviewsSnapshot = await getDocs(reviewsQuery);
            setReviews(reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproval = async (id: string, isApproved: boolean) => {
        const reviewRef = doc(db, "reviews", id);
        try {
            await updateDoc(reviewRef, { approved: isApproved });
            fetchData();
        } catch (error) {
            console.error("Error updating review approval: ", error);
        }
    };

    const handleFeatured = async (id: string, isFeatured: boolean) => {
        const reviewRef = doc(db, "reviews", id);
        try {
            await updateDoc(reviewRef, { featured: isFeatured });
            fetchData();
        } catch (error) {
            console.error("Error updating review feature status: ", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to permanently delete this review?")) {
            const reviewRef = doc(db, "reviews", id);
            try {
                await deleteDoc(reviewRef);
                fetchData();
            } catch (error) {
                console.error("Error deleting review: ", error);
            }
        }
    };

    if (loading) {
        return <p>Loading reviews...</p>
    }

    return (
        <div className="admin-table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Review</th>
                        <th>Status</th>
                        <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map(review => (
                        <tr key={review.id}>
                            <td>
                                <strong>{review.name}</strong><br />
                                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Rating: {review.rating}/5</span>
                            </td>
                            <td style={{maxWidth: '400px', whiteSpace: 'pre-wrap'}}>{review.text}</td>
                            <td>
                                <span className={`status-badge ${review.approved ? 'status-approved' : 'status-pending'}`}>
                                    {review.approved ? 'Approved' : 'Pending'}
                                </span>
                                {review.featured && 
                                    <span className={`status-badge status-featured`} style={{marginLeft: '8px', background: 'var(--gold)', color: 'var(--dark-blue)'}}>
                                        Featured
                                    </span>
                                }
                            </td>
                            <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {review.approved ? (
                                    <button onClick={() => handleFeatured(review.id, !review.featured)} className="btn-outline" style={{padding: '8px 12px', fontSize: '0.8rem'}}>
                                        <i className={`fa-solid ${review.featured ? 'fa-times' : 'fa-star'}`}></i> {review.featured ? 'Un-feature' : 'Feature'}
                                    </button>
                                ) : (
                                    <button onClick={() => handleApproval(review.id, true)} className="btn-primary" style={{padding: '8px 12px', fontSize: '0.8rem', background: 'var(--green)', borderColor: 'var(--green)'}}>
                                        <i className="fa-solid fa-check"></i> Approve
                                    </button>
                                )}
                                <button onClick={() => handleDelete(review.id)} className="btn-delete"><i className="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReviewsManagement;
