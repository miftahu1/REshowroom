'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

// Initialize Firebase
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

// Helper to format keys for display
const formatKey = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

const MessagesInbox = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const messagesQuery = query(collection(db, "messages"), orderBy("timestamp", "desc"));
            const messagesSnapshot = await getDocs(messagesQuery);
            setMessages(messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
        setLoading(false);
      };
    fetchData();
  }, []);

  if (loading) {
    return <p>Loading messages...</p>
  }

  return (
    <>
      <div className="messages-list">
          {messages.map((message, index) => {
            // Maximum safety: use optional chaining and nullish coalescing for every property.
            const id = message?.id ?? `message-${index}`;
            const name = message?.name ?? 'No Name';
            const email = message?.email ?? 'No Email';
            const timestampObject = message?.timestamp;
            const timestamp = timestampObject && typeof timestampObject.toDate === 'function' ? new Date(timestampObject.toDate()).toLocaleString() : 'No Date';
            const summary = message?.message ?? 'No message content. Click "View Details" to see all fields.';
            
            return (
                <div key={id} className="message-item">
                    <div className="message-header">
                        <strong>{name} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({email})</span></strong>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <button className="btn-outline" style={{ padding: '5px 10px', marginRight: '10px' }} onClick={() => setSelectedMessage(message)}>
                                <i className="fas fa-eye"></i> View Details
                            </button>
                            <span style={{ fontSize: '0.8rem' }}>{timestamp}</span>
                        </div>
                    </div>
                    <p>
                        {summary.substring(0, 150)}
                        {summary.length > 150 ? '...' : ''}
                    </p>
                </div>
            )
          })}
      </div>

      {selectedMessage && (
        <div className="modal-overlay open" onClick={() => setSelectedMessage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Full Message Details</h3>
              <button className="modal-close-btn" onClick={() => setSelectedMessage(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(selectedMessage).map(([key, value]) => {
                    if (key === 'id') return null; // Don't show the internal document ID
                    
                    const formattedKey = formatKey(key);
                    const timestampValue = value as any;
                    const formattedValue = key === 'timestamp' && timestampValue && typeof timestampValue.toDate === 'function'
                        ? new Date(timestampValue.toDate()).toLocaleString()
                        : String(value ?? 'Not provided');

                    return (
                        <div key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, max-content) 1fr', gap: '16px'}}>
                            <strong style={{ color: 'var(--gold)' }}>{formattedKey}:</strong> 
                            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{formattedValue}</span>
                        </div>
                    )
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MessagesInbox;
