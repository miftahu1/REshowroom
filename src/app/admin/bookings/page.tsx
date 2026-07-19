'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import emailjs from '@emailjs/browser';

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

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string;
const EMAILJS_TEMPLATE_ID_USER_UPDATE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_USER_UPDATE as string;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string;

const BookingEditModal = ({ isOpen, onClose, booking, onSave }: { isOpen: boolean, onClose: () => void, booking: any | null, onSave: (updatedBooking: any) => void }) => {
    const [formState, setFormState] = useState<any>({});

    useEffect(() => {
        if (isOpen && booking) {
            setFormState({ ...booking });
        } 
    }, [isOpen, booking]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prevState: any) => ({ ...prevState, [name]: value }));
    };

    const handleSave = () => {
        onSave(formState);
        onClose();
    };

    if (!booking) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Edit Booking Details</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
                        <div className="form-group"><label>Name</label><input name="name" type="text" value={formState.name || ''} onChange={handleInputChange} readOnly /></div>
                        <div className="form-group"><label>Phone</label><input name="phone" type="text" value={formState.phone || ''} onChange={handleInputChange} readOnly /></div>
                        <div className="form-group"><label>Email</label><input name="email" type="email" value={formState.email || ''} onChange={handleInputChange} readOnly /></div>
                        <div className="form-group"><label>Model</label><input name="model" type="text" value={formState.model || ''} onChange={handleInputChange} readOnly /></div>
                        <div className="form-group"><label>Preferred Date</label><input name="date" type="date" value={formState.date || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Manager's Note</label><textarea name="managerNote" value={formState.managerNote || ''} onChange={handleInputChange} placeholder="Add a note for the user (e.g., reason for date change)"></textarea></div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button onClick={handleSave} className="btn-primary" style={{ width: '100%' }}>Save Changes</button>
                        <button type="button" onClick={onClose} className="btn-outline" style={{ width: '100%' }}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const BookingsManagement = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBooking, setEditingBooking] = useState<any | null>(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const bookingsQuery = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
            const bookingsSnapshot = await getDocs(bookingsQuery);
            setBookings(bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEditClick = (booking: any) => {
        setEditingBooking(booking);
        setEditModalOpen(true);
    };

    const handleSaveEditedBooking = async (updatedBooking: any) => {
        const bookingRef = doc(db, "bookings", updatedBooking.id);
        try {
            const { id, ...bookingData } = updatedBooking;
            const originalBooking = bookings.find(b => b.id === id);

            if (originalBooking && !originalBooking.userPreferredDate && originalBooking.date !== bookingData.date) {
                bookingData.userPreferredDate = originalBooking.date;
            }

            await updateDoc(bookingRef, bookingData);
            fetchData(); 
        } catch (error) {
            console.error("Error updating booking: ", error);
        }
    };

    const getStyledEmailBody = (status: 'Approved' | 'Disapproved', booking: any) => {
        const approvedStyles = {
            headingColor: '#32d74b',
            badgeBg: 'rgba(50, 215, 75, 0.15)',
            borderColor: 'rgba(50, 215, 75, 0.5)'
        };
        const disapprovedStyles = {
            headingColor: '#ff453a',
            badgeBg: 'rgba(255, 69, 58, 0.15)',
            borderColor: 'rgba(255, 69, 58, 0.5)'
        };

        const styles = status === 'Approved' ? approvedStyles : disapprovedStyles;
        const headingText = status === 'Approved' ? 'Test Ride Approved!' : 'Update on Your Request';
        
        let noteContent = '';
        if (booking.managerNote) {
            noteContent = `
                <tr>
                    <td style="padding: 20px 0;">
                        <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6; margin-top: 0; margin-bottom: 10px; font-weight: bold;">A Note from Our Team:</p>
                        <p style="font-size: 16px; color: #c0c0c0; line-height: 1.6; margin: 0; padding: 15px; background-color: rgba(255,255,255,0.05); border-radius: 6px;">${booking.managerNote}</p>
                    </td>
                </tr>
            `;
        }
        
        const isRescheduled = booking.userPreferredDate && booking.userPreferredDate !== booking.date;
        const reschedulingText = isRescheduled ? `
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Please note, your preferred date of <strong>${booking.userPreferredDate}</strong> has been rescheduled to <strong>${booking.date}</strong> due to scheduling constraints. We apologize for any inconvenience.</p>
        ` : '';

        const mainContent = status === 'Approved' ? `
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Great news! Your test ride for the <strong>Royal Enfield ${booking.model}</strong> has been confirmed.</p>
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Our team will contact you shortly to finalize the details for your ride on or around <strong>${booking.date || 'your selected date'}</strong>.</p>
            ${reschedulingText}
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Get ready to feel the thunder!</p>
        ` : `
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Thank you for your interest in the <strong>Royal Enfield ${booking.model}</strong>.</p>
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Unfortunately, we are unable to fulfill your test ride request for the selected date. This could be due to high demand or temporary unavailability of the model.</p>
            <p style="font-size: 16px; color: #e0e0e0; line-height: 1.6;">Our team will reach out to see if we can schedule a ride for a different date or model. We appreciate your understanding.</p>
        `;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
            </head>
            <body style="margin: 0; padding: 0; background-color: #1c1c1e; font-family: 'Roboto', sans-serif;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="padding: 20px 0;">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #2c2c2e; border-radius: 12px; overflow: hidden; border: 1px solid #444;">
                                <tr>
                                    <td align="center" style="padding: 30px 20px; background-color: #121212;">
                                        <h1 style="color: #c9a84c; font-family: 'Teko', sans-serif; font-size: 32px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">Funshine Getaways</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <p style="font-size: 18px; color: #f0f0f0; margin: 0 0 25px 0;">Hello ${booking.name},</p>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 25px; background-color: ${styles.badgeBg}; border-radius: 8px; border-left: 5px solid ${styles.borderColor};">
                                                    <h2 style="color: ${styles.headingColor}; font-family: 'Teko', sans-serif; font-size: 26px; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 15px 0;">${headingText}</h2>
                                                    ${mainContent}
                                                </td>
                                            </tr>
                                            ${noteContent}
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 30px; background-color: #121212;">
                                        <p style="margin: 0; color: #888888; text-align: center; font-size: 12px;">&copy; ${new Date().getFullYear()} Funshine Getaways. All rights reserved.<br>Amguri, Assam, India</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
    };

    const handleStatusChange = async (id: string, status: 'Approved' | 'Disapproved', booking: any) => {
        const bookingRef = doc(db, "bookings", id);
        try {
            await updateDoc(bookingRef, { status: status });
            
            const subject = status === 'Approved' ? 'Your Test Ride is Confirmed!' : 'Update on Your Test Ride Request';
            const email_body = getStyledEmailBody(status, booking);

            const templateParams = {
                to_email: booking.email,
                subject: subject,
                email_body: email_body,
            };

            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_USER_UPDATE, templateParams, EMAILJS_PUBLIC_KEY)
                .then((response) => {
                   console.log('User notification SUCCESS!', response.status, response.text);
                }, (err) => {
                   console.log('User notification FAILED...', err);
                });

            fetchData();
        } catch (error) {
            console.error("Error updating booking status: ", error);
        }
    };

    if (loading) {
        return <p>Loading bookings...</p>
    }

    return (
        <>
            <div className="admin-table-container">
                <table className="admin-table">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Model</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                    <tr key={booking.id}>
                        <td>{booking.name}</td>
                        <td>{booking.phone}</td>
                        <td>{booking.model}</td>
                        <td>{booking.date}</td>
                        <td>
                            <span className={`status-badge status-${(booking.status || 'Pending').toLowerCase()}`}>
                                {booking.status || 'Pending'}
                            </span>
                        </td>
                        <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                             <button onClick={() => handleEditClick(booking)} className="btn-outline" style={{padding: '8px 12px', fontSize: '0.8rem'}} disabled={booking.status && booking.status !== 'Pending'}><i className="fa-solid fa-pencil"></i> Edit</button>
                            {(!booking.status || booking.status === 'Pending') && (
                                <>
                                    <button onClick={() => handleStatusChange(booking.id, 'Approved', booking)} className="btn-primary" style={{padding: '8px 12px', fontSize: '0.8rem', background: 'var(--green)', borderColor: 'var(--green)'}}><i className="fa-solid fa-check"></i> Approve</button>
                                    <button onClick={() => handleStatusChange(booking.id, 'Disapproved', booking)} className="btn-delete" style={{padding: '8px 12px', fontSize: '0.8rem'}}><i className="fa-solid fa-times"></i> Disapprove</button>
                                </>
                            )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            <BookingEditModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} booking={editingBooking} onSave={handleSaveEditedBooking} />
        </>
    );
};

export default BookingsManagement;
