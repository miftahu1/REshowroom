'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

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

const MessagesInbox = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  const isFinanceInquiry = (message: any) => {
    return message.message.toLowerCase().includes("finance form submission");
  };

  if (loading) {
    return <p>Loading messages...</p>
  }

  return (
    <>
      <div className="messages-list">
          {messages.map(message => (
          <div key={message.id} className="message-item">
              <div className="message-header">
                  <strong>{message.name} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({message.email})</span></strong>
                  <div>
                    {isFinanceInquiry(message) && (
                        <button className="btn-outline" style={{ padding: '5px 10px', marginRight: '10px' }} onClick={() => setSelectedMessage(message)}>
                            <i className="fas fa-eye"></i> View Application
                        </button>
                    )}
                    <span style={{ fontSize: '0.8rem' }}>{new Date(message.timestamp?.toDate()).toLocaleString()}</span>
                  </div>
              </div>
              <p>{message.message.substring(0, 150)}{message.message.length > 150 ? '...' : ''}</p>
          </div>
          ))}
      </div>

      {selectedMessage && (
        <div className="modal-overlay open" onClick={() => setSelectedMessage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Finance Application</h3>
              <button className="modal-close-btn" onClick={() => setSelectedMessage(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>Name:</strong> {selectedMessage.name}</p>
              <p><strong>Email:</strong> {selectedMessage.email}</p>
              <p><strong>Phone:</strong> {selectedMessage.phone}</p>
              <p><strong>Message:</strong> {selectedMessage.message}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MessagesInbox;
