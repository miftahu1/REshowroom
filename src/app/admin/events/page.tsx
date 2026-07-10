'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getFirestore, collection, getDocs, addDoc, deleteDoc,
    doc, updateDoc, query, orderBy, serverTimestamp, FieldValue
} from 'firebase/firestore';

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
    imageUrl: string;
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

/* -------- Modal -------- */
const EventModal = ({
    isOpen,
    onClose,
    event,
    onSave,
}: {
    isOpen: boolean;
    onClose: () => void;
    event: EventData | null;
    onSave: () => void;
}) => {
    const [formState, setFormState] = useState<EventData>(getInitialFormState());
    const isEditing = !!event?.id;

    useEffect(() => {
        if (isOpen) {
            setFormState(event ? { ...getInitialFormState(), ...event } : getInitialFormState());
        }
    }, [isOpen, event]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
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
                <div className="modal-header">
                    <h3>{isEditing ? 'Edit Event' : 'Add New Event'}</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>

                            <div className="form-group">
                                <label>Title</label>
                                <input name="title" type="text" value={formState.title}
                                    onChange={handleChange} placeholder="e.g. Himalayan Odyssey Launch" required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select name="type" value={formState.type} onChange={handleChange}>
                                        <option value="event">Event</option>
                                        <option value="update">Update</option>
                                        <option value="offer">Offer</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input name="date" type="date" value={formState.date}
                                        onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Time (optional)</label>
                                <input name="time" type="text" value={formState.time}
                                    onChange={handleChange} placeholder="e.g. 10:00 AM – 5:00 PM" />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={formState.description}
                                    onChange={handleChange} rows={4}
                                    placeholder="Short description of the event or update..." required />
                            </div>

                            <div className="form-group">
                                <label>Image URL (optional)</label>
                                <input name="imageUrl" type="text" value={formState.imageUrl}
                                    onChange={handleChange} placeholder="/assets/images/event.jpg or https://..." />
                            </div>

                            <div className="form-group">
                                <label>CTA Link (optional)</label>
                                <input name="link" type="text" value={formState.link}
                                    onChange={handleChange} placeholder="https://register.example.com" />
                            </div>

                            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', padding: '12px 0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input type="checkbox" name="published" checked={formState.published}
                                        onChange={handleChange}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--gold)', cursor: 'pointer' }} />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Published (visible to public)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input type="checkbox" name="featured" checked={formState.featured}
                                        onChange={handleChange}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--gold)', cursor: 'pointer' }} />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Featured on Homepage</span>
                                </label>
                            </div>

                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                                {isEditing ? 'Update Event' : 'Add Event'}
                            </button>
                            <button type="button" onClick={onClose} className="btn-outline" style={{ width: '100%' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

/* -------- Main Page -------- */
const EventsManagement = () => {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventData | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as EventData)));
        } catch (err) {
            console.error('Error fetching events:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleToggle = async (id: string, field: 'published' | 'featured', current: boolean) => {
        try {
            await updateDoc(doc(db, 'events', id), { [field]: !current });
            fetchData();
        } catch (err) {
            console.error(`Error toggling ${field}:`, err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this event?')) return;
        try {
            await deleteDoc(doc(db, 'events', id));
            fetchData();
        } catch (err) {
            console.error('Error deleting event:', err);
        }
    };

    const handleEdit = (ev: EventData) => { setEditingEvent(ev); setModalOpen(true); };
    const handleAdd = () => { setEditingEvent(null); setModalOpen(true); };
    const handleCloseModal = () => { setModalOpen(false); setEditingEvent(null); };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        } catch { return dateStr; }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', padding: '40px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" />
            <span>Loading events...</span>
        </div>
    );

    return (
        <div>
            {/* Header row */}
            <div className="product-management-header" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                            {events.length} total · {events.filter(e => e.published).length} published · {events.filter(e => e.featured).length} featured
                        </p>
                    </div>
                    <button onClick={handleAdd} className="btn-primary">
                        <i className="fa-solid fa-plus" /> &nbsp;Add New Event
                    </button>
                </div>
            </div>

            {events.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                    <i className="fa-solid fa-calendar-days" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'block' }} />
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '8px' }}>No Events Yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add your first event or update to get started.</p>
                    <button onClick={handleAdd} className="btn-primary">
                        <i className="fa-solid fa-plus" /> Add Event
                    </button>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
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
                                        <strong style={{ display: 'block', marginBottom: '2px' }}>{ev.title}</strong>
                                        {ev.description && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {ev.description}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`event-admin-type-badge event-type-${ev.type}`}>
                                            {TYPE_LABELS[ev.type] || ev.type}
                                        </span>
                                    </td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <span>{formatDate(ev.date)}</span>
                                        {ev.time && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.time}</span>}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                            <span className={`status-badge ${ev.published ? 'status-approved' : 'status-pending'}`}>
                                                {ev.published ? 'Published' : 'Draft'}
                                            </span>
                                            {ev.featured && (
                                                <span className="status-badge" style={{ background: 'rgba(201, 168, 76, 0.2)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.4)' }}>
                                                    <i className="fa-solid fa-star" style={{ fontSize: '0.6rem' }} /> Featured
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleToggle(ev.id!, 'published', ev.published)}
                                                className="btn-outline"
                                                style={{ padding: '7px 11px', fontSize: '0.78rem' }}
                                                title={ev.published ? 'Unpublish' : 'Publish'}
                                            >
                                                <i className={`fa-solid ${ev.published ? 'fa-eye-slash' : 'fa-eye'}`} />
                                                &nbsp;{ev.published ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={() => handleToggle(ev.id!, 'featured', ev.featured)}
                                                className="btn-outline"
                                                style={{
                                                    padding: '7px 11px', fontSize: '0.78rem',
                                                    borderColor: ev.featured ? 'rgba(201,168,76,0.5)' : undefined,
                                                    color: ev.featured ? 'var(--gold)' : undefined,
                                                }}
                                                title={ev.featured ? 'Un-feature' : 'Feature on homepage'}
                                            >
                                                <i className={`fa-solid ${ev.featured ? 'fa-star' : 'fa-star'}`} />
                                                &nbsp;{ev.featured ? 'Un-feature' : 'Feature'}
                                            </button>
                                            <button onClick={() => handleEdit(ev)} className="btn-outline"
                                                style={{ padding: '7px 11px', fontSize: '0.78rem' }}>
                                                <i className="fa-solid fa-pencil" />
                                            </button>
                                            <button onClick={() => handleDelete(ev.id!)} className="btn-delete"
                                                style={{ padding: '7px 11px' }}>
                                                <i className="fa-solid fa-trash" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <EventModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                event={editingEvent}
                onSave={fetchData}
            />
        </div>
    );
};

export default EventsManagement;
