'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import { initializeApp, getApps, getApp } from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiG0SkbQ0X2HfbqW7W8ItZTvg4lBkWk9A",
  authDomain: "reshowroom-28210251-f6ef0.firebaseapp.com",
  projectId: "reshowroom-28210251-f6ef0",
  storageBucket: "reshowroom-28210251-f6ef0.appspot.com",
  messagingSenderId: "405365661255",
  appId: "1:405365661255:web:7d0dddf1caf5dcb0a9db62"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);


export default function ModelsPage() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
        const productsQuery = query(collection(db, "products"), orderBy("createdAt"));
        const productsSnapshot = await getDocs(productsQuery);
        setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchProducts();
    }, []);

  return (
    <section id="models" aria-labelledby="models-title" style={{paddingTop: '120px', paddingBottom: '120px'}}>
        <div className="section-header">
          <span className="section-tag">Our Fleet</span>
          <h2 className="section-title" id="models-title">Featured Models</h2>
          <p className="section-subtitle">Each machine handcrafted to inspire — discover the motorcycle that speaks your language.</p>
        </div>
        <div className="models-grid">
            {products.map(product => (
                 <Link key={product.id} href={`/product/${product.id}`} passHref>
                    <article className="model-card" role="article" id={product.name === 'Hunter 350' ? 'hunter-card' : undefined}>
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
        </div>
      </section>
  );
}
