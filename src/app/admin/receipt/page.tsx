
'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../../globals.css';

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
const auth = getAuth(app);

const generateReceiptId = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const random = Date.now().toString().slice(-6);
    return `REA-Y${year}M${month}-${random}`;
};

const getInitialReceiptState = () => ({
    receiptId: generateReceiptId(),
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    bikeModel: '',
    exShowroomPrice: 0,
    rtoPrice: 0,
    insurancePrice: 0,
    totalPrice: 0,
    paymentMode: 'Cash',
    transactionId: '',
    additionalDetails: [] as { key: string, value: string }[],
});

const ReceiptPage = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    const [receiptData, setReceiptData] = useState(getInitialReceiptState());

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().isAdmin) {
                    setIsAdmin(true);
                    setUser(currentUser);
                    fetchProducts();
                } else {
                    setIsAdmin(false);
                    setUser(currentUser);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchProducts = async () => {
        const productsQuery = query(collection(db, "products"), orderBy("createdAt"));
        const productsSnapshot = await getDocs(productsQuery);
        setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    
    const resetForm = () => {
        setReceiptData(getInitialReceiptState());
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setReceiptData(prev => ({ ...prev, [name]: value }));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const price = Number(value);
        setReceiptData(prev => {
            const newPrices = { ...prev, [name]: price };
            const totalPrice = newPrices.exShowroomPrice + newPrices.rtoPrice + newPrices.insurancePrice;
            return { ...newPrices, totalPrice };
        });
    };

    const handleAdditionalDetailChange = (index: number, field: 'key' | 'value', value: string) => {
        const newDetails = [...receiptData.additionalDetails];
        newDetails[index][field] = value;
        setReceiptData(prev => ({ ...prev, additionalDetails: newDetails }));
    };

    const addAdditionalDetail = () => {
        setReceiptData(prev => ({ ...prev, additionalDetails: [...prev.additionalDetails, { key: '', value: '' }] }));
    };

    const downloadPdf = () => {
        const receiptElement = document.getElementById('receipt-preview');
        if (receiptElement) {
            html2canvas(receiptElement, { scale: 2 }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const width = pdfWidth - 20;
                const height = width / ratio;
                pdf.addImage(imgData, 'PNG', 10, 10, width, height);
                pdf.save(`receipt-${receiptData.receiptId}.pdf`);
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSubmit = async () => {
        if (!receiptData.buyerName || !receiptData.bikeModel || receiptData.totalPrice <= 0) {
            alert('Please fill in all required fields.');
            return;
        }
        try {
            await addDoc(collection(db, 'receipts'), {
                ...receiptData,
                createdAt: serverTimestamp(),
            });
            alert(`Receipt saved successfully!\nReceipt ID: ${receiptData.receiptId}`);
            downloadPdf();
        } catch (error) {
            console.error("Error saving receipt: ", error);
            alert('Failed to save receipt.');
        }
    };

    if (loading) {
        return <div className="login-container"><h1>Loading...</h1></div>;
    }

    if (!user || !isAdmin) {
        return (
            <div className="login-container">
                <div className="login-form glass-card" style={{ textAlign: 'center' }}>
                    <h1 className="form-title">Access Denied</h1>
                    <p style={{ marginBottom: '20px' }}>You do not have permission to view this page.</p>
                    <a href="/admin" className="btn-primary">Back to Admin Home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page printable-area p-8">
            <div className="non-printable">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h1 className="text-2xl font-bold">Create Receipt</h1>
                  <a href="/admin" className="btn-outline"><i className="fa-solid fa-arrow-left"></i> Back to Dashboard</a>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="form-container non-printable glass-card p-6">
                    <h2 className="text-xl font-semibold mb-4">Buyer & Bike Details</h2>
                    <div className="form-group">
                        <label>Buyer Name</label>
                        <input type="text" name="buyerName" value={receiptData.buyerName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Buyer Address</label>
                        <input type="text" name="buyerAddress" value={receiptData.buyerAddress} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Buyer Phone</label>
                        <input type="text" name="buyerPhone" value={receiptData.buyerPhone} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Bike Model</label>
                        <select name="bikeModel" value={receiptData.bikeModel} onChange={handleInputChange}>
                            <option value="" disabled>Select a model</option>
                            {products.map(p => <option key={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <h2 className="text-xl font-semibold mt-6 mb-4">Price Breakdown</h2>
                    <div className="form-group">
                        <label>Ex-Showroom Price</label>
                        <input type="number" name="exShowroomPrice" value={receiptData.exShowroomPrice} onChange={handlePriceChange} />
                    </div>
                    <div className="form-group">
                        <label>RTO</label>
                        <input type="number" name="rtoPrice" value={receiptData.rtoPrice} onChange={handlePriceChange} />
                    </div>
                    <div className="form-group">
                        <label>Insurance</label>
                        <input type="number" name="insurancePrice" value={receiptData.insurancePrice} onChange={handlePriceChange} />
                    </div>
                    <h2 className="text-xl font-semibold mt-6 mb-4">Payment</h2>
                     <div className="form-group">
                        <label>Payment Mode</label>
                        <select name="paymentMode" value={receiptData.paymentMode} onChange={handleInputChange}>
                            <option>Cash</option>
                            <option>Card</option>
                            <option>Online</option>
                            <option>Finance</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Transaction ID / Cheque No.</label>
                        <input type="text" name="transactionId" value={receiptData.transactionId} onChange={handleInputChange} />
                    </div>
                    <h2 className="text-xl font-semibold mt-6 mb-4">Additional Details</h2>
                    {receiptData.additionalDetails.map((detail, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                            <input type="text" placeholder="Field Name" value={detail.key} onChange={e => handleAdditionalDetailChange(index, 'key', e.target.value)} />
                            <input type="text" placeholder="Value" value={detail.value} onChange={e => handleAdditionalDetailChange(index, 'value', e.target.value)} />
                        </div>
                    ))}
                    <button onClick={addAdditionalDetail} className="btn-secondary mt-2">Add Detail</button>
                </div>
                <div id="receipt-preview" className="p-6 bg-white text-black rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-4">INVOICE</h2>
                    <div className="flex justify-between mb-4">
                        <div>
                            <p><strong>Royal Enfield Amguri</strong></p>
                            <p>123, ABC Road, Amguri</p>
                            <p>Phone: 123-456-7890</p>
                        </div>
                        <div>
                            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                            <p><strong>Receipt No:</strong> {receiptData.receiptId}</p>
                        </div>
                    </div>
                    <hr className="my-4 border-gray-300" />
                    <div className="mb-4">
                         <h3 className="font-semibold">Billed To:</h3>
                         <p>{receiptData.buyerName}</p>
                         <p>{receiptData.buyerAddress}</p>
                         <p>{receiptData.buyerPhone}</p>
                    </div>
                    <table className="w-full mb-4 text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left p-2">Description</th>
                                <th className="text-right p-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                             <tr className="border-b"><td className="p-2">Ex-Showroom Price ({receiptData.bikeModel})</td><td className="text-right p-2">&#8377; {receiptData.exShowroomPrice.toLocaleString()}</td></tr>
                             <tr className="border-b"><td className="p-2">RTO Registration</td><td className="text-right p-2">&#8377; {receiptData.rtoPrice.toLocaleString()}</td></tr>
                             <tr className="border-b"><td className="p-2">Insurance</td><td className="text-right p-2">&#8377; {receiptData.insurancePrice.toLocaleString()}</td></tr>
                             {receiptData.additionalDetails.map((detail, index) => (
                                <tr key={index} className="border-b"><td className="p-2">{detail.key}</td><td className="text-right p-2">{detail.value}</td></tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-gray-100"><td className="text-left p-2">Total Amount</td><td className="text-right p-2">&#8377; {receiptData.totalPrice.toLocaleString()}</td></tr>
                        </tfoot>
                    </table>
                     <div className="mt-6">
                        <p><strong>Payment Mode:</strong> {receiptData.paymentMode}</p>
                        {receiptData.transactionId && <p><strong>Transaction ID:</strong> {receiptData.transactionId}</p>}
                    </div>
                    <div className="mt-8 text-center text-xs text-gray-500">
                        <p>This is a computer-generated receipt and does not require a signature.</p>
                        <p>&copy; {new Date().getFullYear()} Royal Enfield Amguri. All rights reserved.</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-8 gap-4 non-printable">
                 <button onClick={resetForm} className="btn-outline text-lg px-8 py-3"><i className="fa-solid fa-plus"></i> New Receipt</button>
                <button onClick={handlePrint} className="btn-secondary text-lg px-8 py-3"><i className="fa-solid fa-print"></i> Print</button>
                <button onClick={handleSubmit} className="btn-primary text-lg px-8 py-3">Save & Download</button>
            </div>
        </div>
    );
};

export default ReceiptPage;
