'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import '../globals.css';

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

interface Model {
  id: string;
  name: string;
  engine: string;
  price: string;
  imageUrl: string;
  category: string;
  badge?: string;
  specs?: { label: string; value: string }[];
}

const filterOptions = [
    { id: 'all', name: 'All Models', icon: 'fa-solid fa-motorcycle' },
    { id: 'classic', name: 'Classic', icon: 'fa-solid fa-chess-knight' },
    { id: 'adventure', name: 'Adventure', icon: 'fa-solid fa-compass' },
    { id: 'roadster', name: 'Roadster', icon: 'fa-solid fa-bolt' },
    { id: 'cruiser', name: 'Cruiser', icon: 'fa-solid fa-road' },
];

const ModelsPage = () => {
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const modelsQuery = query(collection(db, "products"), orderBy("createdAt"));
        const modelsSnapshot = await getDocs(modelsQuery);
        const models = modelsSnapshot.docs.map(doc => Object.assign({ id: doc.id }, doc.data()) as Model);
        setAllModels(models);
        setFilteredModels(models);
      } catch (error) {
          console.error("Error fetching models: ", error);
      } finally {
          setLoading(false);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredModels(allModels);
    } else {
      setFilteredModels(allModels.filter(model => model.category === activeFilter));
    }
  }, [activeFilter, allModels]);

  return (
    <div id="models" className="page-shell">
      <div className="section-header">
        <h2 className="section-title">Our Legendary Lineup</h2>
        <p className="section-subtitle">Explore the complete range of Royal Enfield motorcycles. Each machine is a piece of history, built to rule the road.</p>
      </div>

      <div className="filter-bar-container">
        <div className="filter-bar">
          {filterOptions.map(option => (
            <button 
              key={option.id} 
              onClick={() => setActiveFilter(option.id)} 
              className={`filter-btn ${activeFilter === option.id ? 'active' : ''}`}>
              <i className={`${option.icon} filter-btn-icon`}></i>
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      </div>

        {loading ? (
            <div style={{textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)'}}>Loading models...</div>
        ) : (
            <div className="models-grid">
                {filteredModels.map(model => (
                    <Link href={`/models/${model.id}`} key={model.id} className="model-card-link">
                        <div className="model-card">
                            <div className="model-card-img">
                                <img src={model.imageUrl} alt={model.name} />
                                {model.badge && <div className="model-card-badge">{model.badge}</div>}
                            </div>
                            <div className="model-card-body">
                            <h3 className="model-card-name">{model.name}</h3>
                            <p className="model-card-engine">{model.engine}</p>
                            {model.specs && (
                                <div className="model-card-specs">
                                    {model.specs.map((spec, index) => spec.value && spec.label && (
                                        <div key={index} className="model-spec">
                                            <span className="model-spec-val">{spec.value}</span>
                                            <span className="model-spec-label">{spec.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="model-card-footer">
                                <div className="model-price">{model.price}</div>
                                <div className="model-explore-btn">Explore &rarr;</div>
                            </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
    </div>
  );
};

export default ModelsPage;
