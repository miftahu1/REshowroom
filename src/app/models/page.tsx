'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import '../../globals.css';

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

const ModelsPage = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchModels = async () => {
      const modelsQuery = query(collection(db, "products"), orderBy("createdAt"));
      const modelsSnapshot = await getDocs(modelsQuery);
      const allModels = modelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Model));
      setModels(allModels);
      setFilteredModels(allModels);
    };
    fetchModels();
  }, []);

  const handleFilter = (category: string) => {
    setActiveFilter(category);
    if (category === 'All') {
      setFilteredModels(models);
    } else {
      const filtered = models.filter(model => model.category === category);
      setFilteredModels(filtered);
    }
  };

  const filterOptions = ['All', 'Cruiser', 'Adventure', 'Roadster', 'Cafe Racer', 'Scrambler'];

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
              key={option} 
              onClick={() => handleFilter(option)} 
              className={`filter-btn ${activeFilter === option ? 'active' : ''}`}>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="models-grid">
        {filteredModels.map(model => (
            <Link href={`/model/${model.id}`} key={model.id} className="model-card-link">
                <div className="model-card">
                    <div className="model-card-img">
                        <img src={model.imageUrl} alt={model.name} />
                        {model.category && <div className="model-card-badge">{model.category}</div>}
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
    </div>
  );
};

export default ModelsPage;
