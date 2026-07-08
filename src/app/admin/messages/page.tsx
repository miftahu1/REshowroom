'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { app } from '../../firebase-config';

const db = getFirestore(app);

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

const MessagesManagement = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const messagesSnapshot = await getDocs(messagesQuery);
    const messagesList = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
    setMessages(messagesList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteDoc(doc(db, 'messages', id));
      fetchData(); // Refresh data
    }
  };

  if (loading) {
    return <p>Loading messages...</p>;
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id}>
              <td>{message.name}</td>
              <td>{message.email}</td>
              <td style={{ whiteSpace: 'pre-wrap', minWidth: '300px' }}>{message.message}</td>
              <td>{new Date(message.createdAt?.toDate()).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDelete(message.id)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessagesManagement;
