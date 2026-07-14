'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getFirestore, collection, getDocs, addDoc, deleteDoc,
    doc, updateDoc, query, orderBy, serverTimestamp, FieldValue
} from 'firebase/firestore';
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

type EventType = 'event' | 'update' | 'offer';

interface EventData {
    id?: string;
    title: string;
    type: EventType;
    date: string; // Stored as YYYY-MM-DD string
    description: string;
    imageUrl: string; // Cloudinary Public ID
    link: string;
    featured: boolean;
    published: boolean;
    createdAt?: FieldValue;
}

const TYPE_CONFIG: Record<EventType, { label: string; className: string; icon: string }> = {
    event: { label: 'Event', className: 'event-type-event', icon: 'fa-calendar-days' },
    update: { label: 'Update', className: 'event-type-update', icon: 'fa-bullhorn' },
    offer: { label: 'Offer', className: 'event-type-offer', icon: 'fa-tag' },
};

const getInitialFormState = (): Omit<EventData, 'id' | 'createdAt'> => ({
    title: '',
    type: 'event',
    date: '',
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
    const [formState, setFormState] = useState<Omit<EventData, 'id' | 'createdAt'>>(getInitialFormState());
    const isEditing = !!event;

    useEffect(() => {
        if (isOpen) {
            // Format date for input field
            if (event?.date) {
                event.date = new Date(event.date).toISOString().split('T')[0];
            }
            setFormState(event ? { ...event } : getInitialFormState());
        }
    }, [isOpen, event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageUpload = (url: string, publicId: string) => {
        setFormState(prevState => ({ ...prevState, imageUrl: publicId }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSave = { ...formState };
            if (isEditing && event?.id) {
                await updateDoc(doc(db, 'events', event.id), dataToSave);
            } else {
                await addDoc(collection(db, 'events'), { ...dataToSave, createdAt: serverTimestamp() });
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
                    <h3>{isEditing ? 'Edit Event/Update' : 'Add New Event/Update'}</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                       <div className="form-group mb-4">
                            <label>Poster Image</label>
                             {formState.imageUrl && (
                                <div style={{ marginBottom: '1rem' }}>
                                  <CldImage src={formState.imageUrl} width="400" height="300" alt="Current Poster" />
                                </div>
                             )}
                            <ImageUploader onUploadSuccess={handleImageUpload} aspectRatio={4/3} folder="re_events" publicId={isEditing ? formState.imageUrl : undefined} />
                        </div>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" name="title" value={formState.title} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select name="type" value={formState.type} onChange={handleChange}>
                                    {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                             <div className="form-group">
                                <label>Date</label>
                                <input type="date" name="date" value={formState.date} onChange={handleChange} />
                            </div>
                             <div className="form-group">
                                <label>Link URL (optional)</label>
                                <input type="url" name="link" value={formState.link} onChange={handleChange} placeholder="https://example.com" />
                            </div>
                        </div>
                        <div className="form-group mt-4">
                            <label>Description</label>
                            <textarea name="description" value={formState.description} onChange={handleChange} rows={4}></textarea>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem'}}>
                             <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <input type="checkbox" id="published" name="published" checked={formState.published} onChange={handleChange} style={{width: '1.2rem', height: '1.2rem'}}/>
                                <label htmlFor="published" style={{marginBottom: 0}}>Published</label>
                            </div>
                            <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <input type="checkbox" id="featured" name="featured" checked={formState.featured} onChange={handleChange} style={{width: '1.2rem', height: '1.2rem'}} />
                                <label htmlFor="featured" style={{marginBottom: 0}}>Featured</label>
                            </div>
                        </div>
                        <div className="modal-footer" style={{paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)'}}>
                            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
                            <button type="submit" className="btn-primary">{isEditing ? 'Save Changes' : 'Create Event'}</button>
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'events'), orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EventData[];
            setEvents(eventsData);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddClick = () => {
        setEditingEvent(null);
        setModalOpen(true);
    };

    const handleEditClick = (event: EventData) => {
        setEditingEvent(event);
        setModalOpen(true);
    };

    const handleDelete = async (event: EventData) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${event.title}"?`)) return;
        try {
            if (!event.id) return;
            await deleteDoc(doc(db, 'events', event.id));
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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="admin-content">
            <div className="admin-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <h1>Events & Updates</h1>
                    <p>Create, manage, and publish company news, events, and special offers.</p>
                </div>
                <button onClick={handleAddClick} className="btn-primary"><i className="fas fa-plus"></i> Add New</button>
            </div>

            {loading ? <div className="loading-container" style={{minHeight: '300px', display:'grid', placeContent:'center'}}><div className='loading-spinner'></div></div> : events.length === 0 ? (
                <div className="glass-card text-center" style={{padding: '4rem'}}>
                    <h3>No Events Yet</h3>
                    <p className="text-muted mb-4">Get started by creating your first event, update, or offer.</p>
                    <button onClick={handleAddClick} className="btn-primary">Add First Event</button>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Poster</th>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(ev => {
                                const typeCfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.update;
                                return (
                                    <tr key={ev.id}>
                                        <td>
                                            {ev.imageUrl ? 
                                                <CldImage src={ev.imageUrl} alt={ev.title} width="120" height="90" style={{objectFit: 'cover', borderRadius: '8px'}}/> :
                                                <div style={{width: '120px', height: '90px', background: 'var(--glass-border)', borderRadius: '8px', display:'grid', placeContent:'center', fontSize:'0.8rem', color:'var(--text-muted)'}}>No Image</div>
                                            }
                                        </td>
                                        <td style={{fontWeight: 'bold'}}>{ev.title}</td>
                                        <td>
                                            <span className={`event-admin-type-badge ${typeCfg.className}`}>
                                                <i className={`fas ${typeCfg.icon}`}/>&nbsp;{typeCfg.label}
                                            </span>
                                        </td>
                                        <td>{formatDate(ev.date)}</td>
                                        <td>
                                             <div style={{display:'flex', flexDirection:'column', gap: '4px'}}>
                                                <span className={`status-badge ${ev.published ? 'status-approved' : 'status-pending'}`}>{ev.published ? 'Published' : 'Draft'}</span>
                                                {ev.featured && <span className={`status-badge event-type-event`}>Featured</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleEditClick(ev)} className="btn-outline"><i className="fas fa-pencil-alt" /></button>
                                                <button onClick={() => handleDelete(ev)} className="btn-delete"><i className="fas fa-trash" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <EventModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} event={editingEvent} onSave={fetchData} />
        </div>
    );
};

export default EventsManagement;
