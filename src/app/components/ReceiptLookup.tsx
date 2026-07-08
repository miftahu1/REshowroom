
'use client';

import { useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

const ReceiptLookup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [receiptId, setReceiptId] = useState('');
    const [buyerName, setBuyerName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!receiptId || !buyerName) {
            setError('Please enter both your name and receipt ID.');
            setLoading(false);
            return;
        }

        try {
            const receiptsRef = collection(db, 'receipts');
            const q = query(receiptsRef, where("receiptId", "==", receiptId.trim()), where("buyerName", "==", buyerName.trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('No matching receipt found. Please check the details and try again.');
                setLoading(false);
                return;
            }

            const receiptData = querySnapshot.docs[0].data();
            generateAndDownloadPdf(receiptData);
            onClose(); 

        } catch (err) {
            console.error(err);
            setError('An error occurred while fetching your receipt. Please try again later.');
        }

        setLoading(false);
    };
    
    const generateAndDownloadPdf = (data: any) => {
        const receiptElement = document.createElement('div');
        receiptElement.innerHTML = getReceiptHtml(data);
        document.body.appendChild(receiptElement);

        html2canvas(receiptElement.querySelector('#receipt-preview')!).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
            pdf.save(`receipt-${data.receiptId}.pdf`);
            document.body.removeChild(receiptElement);
        });
    };

    const getReceiptHtml = (receiptData: any) => {
        return `
            <div id="receipt-preview" class="p-6 bg-white text-black rounded-lg shadow-lg" style="width: 210mm; min-height: 297mm; margin: auto;">
                <h2 class="text-2xl font-bold text-center mb-4">INVOICE</h2>
                <div class="flex justify-between mb-4">
                    <div>
                        <p><strong>Royal Enfield Amguri</strong></p>
                        <p>123, ABC Road, Amguri</p>
                        <p>Phone: 123-456-7890</p>
                    </div>
                    <div>
                        <p><strong>Date:</strong> ${new Date(receiptData.createdAt.seconds * 1000).toLocaleDateString()}</p>
                        <p><strong>Receipt No:</strong> ${receiptData.receiptId}</p>
                    </div>
                </div>
                <hr class="my-4 border-gray-300" />
                <div class="mb-4">
                     <h3 class="font-semibold">Billed To:</h3>
                     <p>${receiptData.buyerName}</p>
                     <p>${receiptData.buyerAddress}</p>
                     <p>${receiptData.buyerPhone}</p>
                </div>
                <table class="w-full mb-4 text-sm">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="text-left p-2">Description</th>
                            <th class="text-right p-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                         <tr class="border-b"><td>Ex-Showroom Price (${receiptData.bikeModel})</td><td class="text-right p-2">&#8377; ${receiptData.exShowroomPrice.toLocaleString()}</td></tr>
                         <tr class="border-b"><td>RTO Registration</td><td class="text-right p-2">&#8377; ${receiptData.rtoPrice.toLocaleString()}</td></tr>
                         <tr class="border-b"><td>Insurance</td><td class="text-right p-2">&#8377; ${receiptData.insurancePrice.toLocaleString()}</td></tr>
                         ${(receiptData.additionalDetails || []).map((detail: any) => 
                            `<tr class="border-b"><td class="p-2">${detail.key}</td><td class="text-right p-2">${detail.value}</td></tr>`
                        ).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="font-bold bg-gray-100"><td class="text-left p-2">Total Amount</td><td class="text-right p-2">&#8377; ${receiptData.totalPrice.toLocaleString()}</td></tr>
                    </tfoot>
                </table>
                 <div class="mt-6">
                    <p><strong>Payment Mode:</strong> ${receiptData.paymentMode}</p>
                    ${receiptData.transactionId ? `<p><strong>Transaction ID:</strong> ${receiptData.transactionId}</p>` : ''}
                </div>
                <div class="mt-8 text-center text-xs text-gray-500">
                    <p>This is a computer-generated receipt and does not require a signature.</p>
                    <p>&copy; ${new Date().getFullYear()} Royal Enfield Amguri. All rights reserved.</p>
                </div>
            </div>
        `;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay open">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Download Your Receipt</h3>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSearch}>
                        <p className="mb-4 text-sm text-gray-600">Enter the details provided at the time of purchase to download your invoice.</p>
                        <div className="form-group">
                            <label htmlFor="buyerName">Your Full Name</label>
                            <input type="text" id="buyerName" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="receiptId">Receipt ID</label>
                            <input type="text" id="receiptId" value={receiptId} onChange={(e) => setReceiptId(e.target.value)} placeholder="e.g., REA-Y2023M12-123456" required />
                        </div>
                        <div className="flex items-center justify-end gap-4 mt-6">
                            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Searching...' : 'Download Receipt'}
                            </button>
                        </div>
                        {error && <p className="error-message mt-4">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReceiptLookup;
