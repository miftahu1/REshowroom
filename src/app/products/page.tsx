
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import '../globals.css';

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

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsQuery = query(collection(db, "products"), orderBy("createdAt"));
      const productsSnapshot = await getDocs(productsQuery);
      setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="page-shell">
      <section id="models" aria-labelledby="models-title">
        <div className="section-header">
          <span className="section-tag">Our Fleet</span>
          <h2 className="section-title" id="models-title">All Models</h2>
          <p className="section-subtitle">The entire Royal Enfield lineup, ready for you to explore.</p>
        </div>
        {loading ? <p style={{textAlign: 'center'}}>Loading models...</p> :
        <div className="models-grid">
            {products.map(product => (
                 <Link key={product.id} href={`/product/${product.id}`} passHref>
                    <article className="model-card" role="article">
                    <div className="model-card-img">
                        <img src={product.imageUrl} alt={`Royal Enfield ${product.name}`} loading="lazy" />
                        {product.badge && <span className="model-card-badge">{product.badge}</span>}
                    </div>
                    <div className="model-card-body">
                        <h3 className="model-card-name">{product.name}</h3>
                        <p className="model-card-engine">{product.engine}</p>
                        {product.specs && (
                            <div className="model-card-specs">
                                {product.specs.map((spec: any, index: number) => spec.value && spec.label && (
                                    <div key={index} className="model-spec">
                                        <span className="model-spec-val">{spec.value}</span>
                                        <span className="model-spec-label">{spec.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="model-card-footer">
                        <div className="model-price">{product.price} <span>onwards</span></div>
                        <button className="model-explore-btn">Explore <i className="fa-solid fa-arrow-right"></i></button>
                        </div>
                    </div>
                    </article>
              </Link>
            ))}
        </div>}
      </section>
    </div>
  );
};

export default ProductsPage;
