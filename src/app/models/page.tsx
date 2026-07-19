'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import '../globals.css';
import { buildUrl } from '../../utils/cloudinary';
import { getEffectivePrice } from '../../lib/pricing';
import { ProductData, CampaignData } from '../../types';

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

const filterOptions = [
    { id: 'all', name: 'All Models', icon: 'fa-solid fa-motorcycle' },
    { id: 'classic', name: 'Classic', icon: 'fa-solid fa-chess-knight' },
    { id: 'adventure', name: 'Adventure', icon: 'fa-solid fa-compass' },
    { id: 'roadster', name: 'Roadster', icon: 'fa-solid fa-bolt' },
    { id: 'cruiser', name: 'Cruiser', icon: 'fa-solid fa-road' },
];

const ModelsPage = () => {
  const [allModels, setAllModels] = useState<ProductData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [filteredModels, setFilteredModels] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const modelsQuery = query(collection(db, "products"), orderBy("createdAt"));
        const modelsSnapshot = await getDocs(modelsQuery);
        const models = modelsSnapshot.docs.map(doc => Object.assign({ id: doc.id }, doc.data()) as ProductData);
        setAllModels(models);
        setFilteredModels(models);

        const campaignsQuery = query(collection(db, "campaigns"));
        const campaignsSnapshot = await getDocs(campaignsQuery);
        const campaigns = campaignsSnapshot.docs.map(doc => Object.assign({ id: doc.id }, doc.data()) as CampaignData);
        setCampaigns(campaigns);

      } catch (error) {
          console.error("Error fetching data: ", error);
      } finally {
          setLoading(false);
      }
    };
    fetchData();
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
                {filteredModels.map(model => {
                    const pricing = getEffectivePrice(model, campaigns);
                    return (
                        <Link href={`/model/${model.id}`} key={model.id} className="model-card-link">
                            <div className="model-card">
                                <div className="model-card-img">
                                    <img src={buildUrl(model.imageUrl)} alt={model.name} />
                                    {pricing.offerTitle && (
                                        <div className="model-card-badge" style={{ backgroundColor: pricing.badge?.color }}>
                                            {pricing.badge?.text}
                                        </div>
                                    )}
                                </div>
                                <div className="model-card-body">
                                <h3 className="model-card-name">{model.name}</h3>
                                <p className="model-card-engine">{model.engine}</p>
                                
                                <div className="model-card-footer">
                                    <div className="model-price">
                                        {pricing.finalPrice !== pricing.originalPrice ? (
                                            <>
                                                <span className="original-price">₹{pricing.originalPrice}</span>
                                                <span className="final-price">₹{pricing.finalPrice} onwards</span>
                                            </>
                                        ) : (
                                            <span className="final-price">₹{pricing.originalPrice} onwards</span>
                                        )}
                                    </div>
                                    <div className="model-explore-btn">Explore &rarr;</div>
                                </div>
                                {pricing.countdown && <CountdownTimer endDate={pricing.countdown} />}
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        )}
    </div>
  );
};

const CountdownTimer = ({ endDate }: { endDate: string }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    return (
        <div className="countdown-timer">
            {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
            {timeLeft.hours > 0 && <span>{timeLeft.hours}h </span>}
            {timeLeft.minutes > 0 && <span>{timeLeft.minutes}m </span>}
            <span>left</span>
        </div>
    );
};

export default ModelsPage;
