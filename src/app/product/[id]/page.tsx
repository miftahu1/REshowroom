
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from "firebase/firestore";
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

const ProductDetailPage = () => {
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        const productDoc = await getDoc(doc(db, "products", id as string));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
        } else {
          console.error("No such document!");
        }
        setLoading(false);
      };
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return <p style={{textAlign: 'center', padding: '40px'}}>Loading product details...</p>;
  }

  if (!product) {
    return <p style={{textAlign: 'center', padding: '40px'}}>Product not found.</p>;
  }

  return (
    <div style={{ background: 'var(--black)' }}>
      <div style={{padding: '20px', background: 'var(--black)', borderBottom: '1px solid var(--border)'}}>
          <Link href="/" className="nav-logo" aria-label="Royal Enfield Home">
              <span className="logo-brand">Royal Enfield</span>
              <span className="logo-sub">Authorized Dealership</span>
          </Link>
      </div>
      <div className="about-grid" style={{padding: '80px 40px', alignItems: 'start'}}>
          <div className="about-image-wrap">
              <img className="about-image-main" src={product.imageUrl} alt={product.name} style={{height: 'auto'}} />
              <div className="about-image-accent" style={{bottom: 'auto', top:'-30px', right: '-30px', width: 'auto', padding: '16px 24px'}}>
                  <span className="accent-label" style={{textAlign: 'center'}}>{product.badge}</span>
              </div>
          </div>
          <div className="about-content">
              <span className="section-tag">Model Details</span>
              <h2 className="section-title" id="about-title">{product.name}</h2>
              <p>{product.engine}</p>
                <div className="model-card-specs" style={{borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', padding: '24px 0', marginBottom: '32px'}}>
                    {product.specs.map((spec: any, index: number) => spec.value && spec.label && (
                        <div key={index} className="model-spec">
                            <span className="model-spec-val">{spec.value}</span>
                            <span className="model-spec-label">{spec.label}</span>
                        </div>
                    ))}
                </div>
              <div className="model-price" style={{fontSize: '1.8rem', marginBottom: '32px'}}>{product.price} <span>onwards</span></div>
              <a href="/#test-ride" className="btn-primary">
                  <i className="fa-regular fa-calendar-check"></i> Book a Test Ride
              </a>
          </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
