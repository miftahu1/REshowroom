'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import '../../globals.css';
import NotFoundPage from '../../not-found';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const ModelDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (id) {
            const getProduct = async () => {
                setLoading(true);
                const docRef = doc(db, "products", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setNotFound(true);
                }
                setLoading(false);
            };
            getProduct();
        }
    }, [id]);

    if (loading) {
        return <div className="loading-container"><div></div><div></div><div></div></div>;
    }

    if (notFound) {
        return <NotFoundPage />;
    }

      return (
        <div id="about" className="page-shell">
           <div className="section-header">
                <h1 className="section-title">{product?.name}</h1>
           </div>
          <div className="about-grid" style={{alignItems: 'center'}}>
               <div className="about-image">
                  <img src={product?.imageUrl} alt={product?.name} style={{width: '100%', borderRadius: '12px'}} />
              </div>
              <div className="about-content">
                  <span className="section-tag">Model Details</span>
                  <h2 className="section-title" id="about-title">{product?.name}</h2>
                  <p>{product?.engine}</p>
                    <div className="model-card-specs" style={{borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', padding: '24px 0', marginBottom: '32px'}}>
                        {product?.specs?.map((spec: any, index: number) => spec.value && spec.label && (
                            <div key={index} className="model-spec">
                                <span className="model-spec-val">{spec.value}</span>
                                <span className="model-spec-label">{spec.label}</span>
                            </div>
                        ))}
                    </div>
                  <div className="model-price" style={{fontSize: '1.8rem', marginBottom: '32px'}}>{product?.price} <span>onwards</span></div>
                  <a href="/#test-ride" className="btn-primary">
                      <i className="fa-regular fa-calendar-check"></i> Book a Test Ride
                  </a>
              </div>
          </div>
        </div>
      );
    };

    export default ModelDetailPage;
