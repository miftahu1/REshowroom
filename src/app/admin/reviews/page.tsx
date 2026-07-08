'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp, getApp, getApps } from "firebase/app";

// Correct Firebase Initialization
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

interface Review {
  id: string;
  name: string;
  review: string;
  rating: number;
  createdAt: any;
  approved: boolean;
}

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const reviewsQuery = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviewsList = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
    setReviews(reviewsList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproval = async (id: string, approved: boolean) => {
    const reviewRef = doc(db, 'reviews', id);
    await updateDoc(reviewRef, { approved });
    fetchData(); // Refresh data
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteDoc(doc(db, 'reviews', id));
      fetchData(); // Refresh data
    }
  };

  if (loading) {
    return <p>Loading reviews...</p>;
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Rating</th>
            <th style={{ minWidth: '300px' }}>Review</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.name}</td>
              <td>{"⭐".repeat(review.rating)}</td>
              <td>{review.review}</td>
              <td>{new Date(review.createdAt?.toDate()).toLocaleString()}</td>
              <td>
                <span className={`status-badge ${review.approved ? 'status-approved' : 'status-pending'}`}>
                  {review.approved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td className='space-x-2'>
                <button onClick={() => handleApproval(review.id, !review.approved)} className={review.approved ? 'btn-disapprove' : 'btn-approve'}>
                  {review.approved ? 'Disapprove' : 'Approve'}
                </button>
                <button onClick={() => handleDelete(review.id)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewsManagement;
