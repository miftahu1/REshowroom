'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '../../firebase-config';

const db = getFirestore(app);

interface Booking {
  id: string;
  name: string;
  phone: string;
  model: string;
  createdAt: any;
  status: 'Pending' | 'Approved' | 'Disapproved';
}

const BookingsManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookingsList = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
    setBookings(bookingsList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    const bookingRef = doc(db, 'bookings', id);
    await updateDoc(bookingRef, { status });
    fetchData(); // Refresh data
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      const bookingRef = doc(db, 'bookings', id);
      await deleteDoc(bookingRef);
      fetchData(); // Refresh data
    }
  };

  if (loading) {
    return <p>Loading bookings...</p>;
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Model</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.name}</td>
              <td>{booking.phone}</td>
              <td>{booking.model}</td>
              <td>{new Date(booking.createdAt?.toDate()).toLocaleString()}</td>
              <td>
                <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </td>
              <td>
                <select onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['status'])} value={booking.status} className="p-2 rounded-md bg-bg-tertiary">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Disapproved">Disapproved</option>
                </select>
                <button onClick={() => handleDelete(booking.id)} className="btn-delete ml-2">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingsManagement;
