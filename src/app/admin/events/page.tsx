'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getFirestore, collection, getDocs, addDoc, deleteDoc,
    doc, updateDoc, query, orderBy, serverTimestamp, FieldValue
} from 'firebase/firestore';
import { ImageUploader, CLImage } from '@/components/ImageUploader';

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

type EventType = 'event' | 'update' | 'offer';

interface EventData {
    id?: string;
    title: string;
    type: EventType;
    date: string;
    time: string;
    description: string;
    imageUrl: string; // Now stores Cloudinary Public ID
    link: string;
    featured: boolean;
    published: boolean;
    createdAt?: FieldValue;
}

const TYPE_LABELS: Record<EventType, string> = {
    event: 'Event',
    update: 'Update',
    offer: 'Offer',
};

const getInitialFormState = (): EventData => ({
    title: '',
    type: 'event',
    date: '',
    time: '',
    description: '',
    imageUrl: '',
    link: '',
    featured: false,
    published: true,
});

const EventModal = (
    { isOpen, onClose, event, onSave }: 
    { isOpen: boolean, onClose: () => void, event: EventData | null, onSave: () => void }
) => {
    const [formState, setFormState] = useState<EventData>(getInitialFormState());
    const isEditing = !!event?.id;

    useEffect(() => {
        if (isOpen) {
            setFormState(event ? { ...getInitialFormState(), ...event } : getInitialFormState());
        }
    }, [isOpen, event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    };

    const handleImageUpload = (info: any) => {
        setFormState(prevState => ({ ...prevState, imageUrl: info.public_id }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const { createdAt, id, ...data } = formState;
                await updateDoc(doc(db, 'events', event!.id!), data);
            } else {
                await addDoc(collection(db, 'events'), { ...formState, createdAt: serverTimestamp() });
            }
            onClose();
            onSave();
        } catch (err) {
            console.error('Error saving event:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open">
            <div className="modal-content" style={{ maxWidth: '640px' }}>
                <div className="modal-header"><h3>{isEditing ? 'Edit Event' : 'Add New Event'}</h3><button onClick={onClose} className="modal-close-btn">&times;</button></div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Event/Update Poster</label>
                            <ImageUploader onUploadSuccess={handleImageUpload} initialValue={formState.imageUrl} />
                        </div>
                        {/* ... other form fields ... */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>{isEditing ? 'Update Event' : 'Add Event'}</button>
                            <button type="button" onClick={onClose} className="btn-outline" style={{ width: '100%' }}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const EventsManagement = () => {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventData | null>(null);

    const fetchData = async () => { /* ... */ };
    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (event: EventData) => {
        if (!window.confirm('Are you sure you want to permanently delete this event?')) return;
        try {
            await deleteDoc(doc(db, 'events', event.id!));
            if (event.imageUrl) {
                await fetch('/api/cloudinary', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ publicId: event.imageUrl })
                });
            }
            fetchData();
        } catch (err) {
            console.error('Error deleting event:', err);
        }
    };

    // ... (other handlers)

    return (
        <div>
            {/* ... (header, empty state) ... */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Poster</th>
                            <th>Event</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(ev => (
                            <tr key={ev.id}>
                                <td>
                                    {ev.imageUrl ? 
                                        <CLImage publicId={ev.imageUrl} alt={ev.title} className="w-24 h-16 object-cover rounded-md"/> :
                                        <div className="w-24 h-16 bg-gray-200 rounded-md"></div>
                                    }
                                </td>
                                {/* ... other table cells ... */}
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        {/* ... action buttons ... */}
                                        <button onClick={() => handleDelete(ev)} className="btn-delete" style={{ padding: '7px 11px' }}><i className="fa-solid fa-trash" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <EventModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} event={editingEvent} onSave={fetchData} />
        </div>
    );
};

export default EventsManagement;
