'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query } from "firebase/firestore";
import '../../globals.css';
import NotFoundPage from '../../not-found';
import { buildUrl } from '../../../utils/cloudinary';
import { getEffectivePrice } from '../../../lib/pricing';
import { ProductData, CampaignData } from '../../../types';

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

interface TimeLeft {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

const ModelDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<ProductData | null>(null);
    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                setLoading(true);
                const docRef = doc(db, "products", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() } as ProductData);
                } else {
                    setNotFound(true);
                }

                const campaignsQuery = query(collection(db, "campaigns"));
                const campaignsSnapshot = await getDocs(campaignsQuery);
                const campaigns = campaignsSnapshot.docs.map(doc => Object.assign({ id: doc.id }, doc.data()) as CampaignData);
                setCampaigns(campaigns);

                setLoading(false);
            };
            fetchData();
        }
    }, [id]);

    if (loading) {
        return <div className="loading-container"><div></div><div></div><div></div></div>;
    }

    if (notFound) {
        return <NotFoundPage />;
    }

    if (!product) {
        return null; // Or some other placeholder
    }

    const pricing = getEffectivePrice(product, campaigns);

      return (
        <div id="about" className="page-shell">
           <div className="section-header">
                <h1 className="section-title">{product.name}</h1>
           </div>

            {pricing.offerTitle && (
                <div className="offer-banner" style={{ backgroundColor: pricing.badge?.color || 'var(--gold)' }}>
                    <div className="offer-banner-content">
                        <h3>{pricing.offerTitle}</h3>
                        <p>Save up to {pricing.discountPercentage}%</p>
                    </div>
                    {pricing.countdown && <CountdownTimer endDate={pricing.countdown} />}
                </div>
            )}

          <div className="about-grid" style={{alignItems: 'center'}}>
               <div className="about-image">
                  <img src={buildUrl(product.imageUrl)} alt={product.name} style={{width: '100%', borderRadius: '12px'}} />
              </div>
              <div className="about-content">
                  <span className="section-tag">Model Details</span>
                  <h2 className="section-title" id="about-title">{product.name}</h2>
                  <p>{product.engine}</p>
                    <div className="model-card-specs" style={{borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', padding: '24px 0', marginBottom: '32px'}}>
                        {product.specs?.map((spec: any, index: number) => spec.value && spec.label && (
                            <div key={index} className="model-spec">
                                <span className="model-spec-val">{spec.value}</span>
                                <span className="model-spec-label">{spec.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="model-price" style={{fontSize: '1.8rem', marginBottom: '32px'}}>
                         {pricing.finalPrice !== pricing.originalPrice ? (
                            <>
                                <span className="original-price" style={{textDecoration: 'line-through', marginRight: '1rem', opacity: 0.7}}>
                                    ₹{pricing.originalPrice}
                                </span>
                                <span className="final-price">₹{pricing.finalPrice} onwards</span>
                            </>
                        ) : (
                            <span className="final-price">₹{pricing.originalPrice} onwards</span>
                        )}
                    </div>
                  <a href="/#test-ride" className="btn-primary">
                      <i className="fa-regular fa-calendar-check"></i> Book a Test Ride
                  </a>
              </div>
          </div>
        </div>
      );
    };

const CountdownTimer = ({ endDate }: { endDate: string }) => {
    const calculateTimeLeft = (): TimeLeft => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft: TimeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    return (
        <div className="countdown-timer-detail">
            <h4>Offer Ends In</h4>
            <div className="timer-boxes">
                <div className="timer-box"><span>{timeLeft.days || 0}</span><span>Days</span></div>
                <div className="timer-box"><span>{timeLeft.hours || 0}</span><span>Hours</span></div>
                <div className="timer-box"><span>{timeLeft.minutes || 0}</span><span>Minutes</span></div>
                 <div className="timer-box"><span>{timeLeft.seconds || 0}</span><span>Seconds</span></div>
            </div>
        </div>
    );
};

export default ModelDetailPage;
