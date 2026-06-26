
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './globals.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import emailjs from '@emailjs/browser';

gsap.registerPlugin(ScrollTrigger);

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiG0SkbQ0X2HfbqW7W8ItZTvg4lBkWk9A",
  authDomain: "reshowroom-28210251-f6ef0.firebaseapp.com",
  projectId: "reshowroom-28210251-f6ef0",
  storageBucket: "reshowroom-28210251-f6ef0.appspot.com",
  messagingSenderId: "405365661255",
  appId: "1:405365661255:web:7d0dddf1caf5dcb0a9db62"
};

// --- IMPORTANT: ADD YOUR EMAILJS DETAILS HERE ---
const EMAILJS_SERVICE_ID = 'service_t3duf0c';
const EMAILJS_TEMPLATE_ID_MANAGER = 'template_o4ytkz8'; // For new bookings
const EMAILJS_PUBLIC_KEY = 'M3_6Bw_vnhrbf900W';
const MANAGER_EMAIL = 'miftahulhussain0@gmail.com'; // The email you want to send notifications to

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const getRandomNum = () => Math.floor(Math.random() * 10) + 1;

export default function Home() {
  const main = useRef(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    model: '',
    date: '',
    city: '',
    message: ''
  });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [captchaNum1, setCaptchaNum1] = useState(getRandomNum());
  const [captchaNum2, setCaptchaNum2] = useState(getRandomNum());
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const [loanAmount, setLoanAmount] = useState(150000);
  const [loanTenure, setLoanTenure] = useState(36);
  const [interestRate, setInterestRate] = useState(9.0);
  const [emi, setEmi] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsQuery = query(collection(db, "products"), orderBy("createdAt"));
      const productsSnapshot = await getDocs(productsQuery);
      setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);

  const generateCaptcha = () => {
    setCaptchaNum1(getRandomNum());
    setCaptchaNum2(getRandomNum());
    setCaptchaAnswer('');
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

 const getManagerEmailBody = (data: any) => {
    const currentYear = new Date().getFullYear();
    // Format data into a styled HTML table
    const bookingDetails = Object.entries(data)
        .map(([key, value]) => {
            if (!value) return ''; // Don't show empty fields
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize key
            return `
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; text-transform: capitalize; font-weight: bold; color: #555; width: 30%;">${formattedKey}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; color: #333;">${value as string}</td>
                </tr>
            `;
        })
        .join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Roboto', sans-serif;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding: 20px 0;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                            <tr>
                                <td align="center" style="padding: 30px 20px; background-color: #121212;">
                                    <h1 style="color: #c9a84c; font-family: 'Teko', sans-serif; font-size: 32px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">New Test Ride Request</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <p style="font-size: 18px; color: #333; margin: 0 0 25px 0;">A new test ride has been requested. Details are below:</p>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #e0e0e0; border-radius: 8px;">
                                        ${bookingDetails}
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px; text-align: center; background-color: #f9f9f9;">
                                    <a href="https://reshowroom-28210251.web.app/admin" target="_blank" style="background-color: #c9a84c; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: 'Roboto', sans-serif; font-size: 16px;">Go to Admin Dashboard</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px 30px; background-color: #121212;">
                                    <p style="margin: 0; color: #888888; text-align: center; font-size: 12px;">&copy; ${currentYear} Royal Enfield Amguri. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (parseInt(captchaAnswer) !== captchaNum1 + captchaNum2) {
        setFormError('Incorrect CAPTCHA answer. Please try again.');
        generateCaptcha();
        return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        ...formData,
        timestamp: serverTimestamp()
      });
      
      const emailBody = getManagerEmailBody(formData);
      const templateParams = {
          manager_email: MANAGER_EMAIL,
          subject: `New Test Ride Request: ${formData.model}`,
          email_body: emailBody
      };

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_MANAGER, templateParams, EMAILJS_PUBLIC_KEY)
        .then((response) => {
            console.log('Manager notification SUCCESS!', response.status, response.text);
        }, (err) => {
            console.log('Manager notification FAILED...', err);
        });

      setFormSuccess(true);
      setFormData({ name: '', phone: '', email: '', model: '', date: '', city: '', message: '' });
      generateCaptcha();

    } catch (error) {
      console.error("Error submitting booking: ", error);
      setFormError("There's something wrong booking the test drive, try again after some time");
      generateCaptcha();
    }
  };


  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const calculateEmi = () => {
      const p = loanAmount;
      const r = interestRate / 12 / 100;
      const n = loanTenure;
      if (p > 0 && r > 0 && n > 0) {
        const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalAmountValue = emiValue * n;
        const totalInterestValue = totalAmountValue - p;
        setEmi(Math.round(emiValue));
        setTotalAmount(Math.round(totalAmountValue));
        setTotalInterest(Math.round(totalInterestValue));
      }
    };
    calculateEmi();
  }, [loanAmount, loanTenure, interestRate]);


  useEffect(() => {
    const ctx = gsap.context(() => {
      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) {
        gsap.to(progressBar, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0,
            onUpdate: self => {
              progressBar.style.transform = `scaleX(${self.progress})`;
            }
          }
        });
      }

      const heroBike = document.getElementById('hero-bike');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReduced) {
        const heroLoadTL = gsap.timeline({ delay: 0.3 });
        heroLoadTL
          .fromTo('.hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
          .fromTo('.hero-headline', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, '-=0.4')
          .fromTo('.hero-sub', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
          .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
          .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.35')
          .fromTo('.hero-stat', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' }, '-=0.3')
          .fromTo('.hero-scroll-indicator', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2');
        if (heroBike) {
          heroLoadTL.fromTo(heroBike,
            { opacity: 0, x: 80, scale: 0.88 },
            { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: 'power3.out' }, '-=1.1'
          );
        }
        heroLoadTL.play();
      } else {
        gsap.set(['.hero-badge', '.hero-headline', '.hero-sub', '.hero-desc', '.hero-cta', '.hero-stat', '.hero-scroll-indicator', heroBike], { opacity: 1, y: 0 });
      }

      if (heroBike && !prefersReduced) {
        gsap.to(heroBike, {
          y: -16,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.5
        });
      }

    }, main);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={main}>
      <div id="scroll-progress" aria-hidden="true"></div>
      <nav id="navbar">
        <a href="#hero" className="nav-logo" aria-label="Royal Enfield Home">
          <span className="logo-brand">Royal Enfield</span>
          <span className="logo-sub">Authorized Dealership</span>
        </a>
        <ul className="nav-links">
          <li><a href="#models">Models</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#emi">Finance</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#test-ride" className="nav-cta">Book Test Ride</a>
        <button className={`nav-hamburger ${isMenuOpen ? 'open' : ''}`} aria-label="Toggle menu" id="hamburger" onClick={toggleMenu}>
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`} id="mobile-menu">
        <a href="#models" onClick={toggleMenu}>Models</a>
        <a href="#about" onClick={toggleMenu}>About</a>
        <a href="#services" onClick={toggleMenu}>Services</a>
        <a href="#test-ride" onClick={toggleMenu}>Test Ride</a>
        <a href="#emi" onClick={toggleMenu}>Finance</a>
        <a href="#contact" onClick={toggleMenu}>Contact</a>
      </div>
      <section id="hero" aria-label="Hero">
        <canvas id="hero-canvas" aria-hidden="true"></canvas>
        <div className="hero-bg-grad" aria-hidden="true"></div>
        <div className="hero-spotlight" aria-hidden="true"></div>
        <div className="hero-bike-wrap" aria-hidden="true">
          <img id="hero-bike" src="/assets/images/hunter350.png" alt="Royal Enfield Hunter 350 — hero showcase" loading="eager" />
          <div className="hero-bike-shadow"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Authorized Dealership &nbsp;|&nbsp; Est. 2005
          </div>
          <h1 className="hero-headline">
            Pure <span className="gold-text">Motorcycling.</span><br />
            Timeless Legacy.
          </h1>
          <p className="hero-sub">Feel the thunder &nbsp;·&nbsp; Own the road</p>
          <p className="hero-desc">
            Step into a world where machines are more than metal — they are a statement of character. Explore our
            full range of Royal Enfield motorcycles at your trusted authorized dealership.
          </p>
          <div className="hero-cta">
            <a href="#models" className="btn-primary">
              <i className="fa-solid fa-motorcycle"></i> Explore Models
            </a>
            <a href="#test-ride" className="btn-outline">
              <i className="fa-regular fa-calendar-check"></i> Book a Test Ride
            </a>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">15+</div>
            <div className="hero-stat-label">Models<br />Available</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">5K+</div>
            <div className="hero-stat-label">Happy<br />Riders</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">18yr</div>
            <div className="hero-stat-label">Authorized<br />Partner</div>
          </div>
        </div>
        <div className="hero-scroll-indicator" aria-hidden="true">
          <span className="scroll-label">Scroll</span>
          <span className="scroll-line"></span>
        </div>
      </section>
      <section id="models" aria-labelledby="models-title">
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
      <section id="about" aria-labelledby="about-title">
        <div className="about-grid">
          <div className="about-image-wrap">
            <span className="about-frame" aria-hidden="true"></span>
            <img className="about-image-main" src="/assets/images/showroom.png" alt="Royal Enfield showroom interior" loading="lazy" />
            <div className="about-image-accent">
              <span className="accent-num">18</span>
              <span className="accent-label">Years of Pure Legacy</span>
            </div>
          </div>
          <div className="about-content">
            <span className="section-tag">Our Story</span>
            <h2 className="section-title" id="about-title">Where Passion<br />Meets Purpose</h2>
            <p>We are more than a dealership — we are custodians of a century-old legacy. Established in 2005, we
              have grown to become one of the most trusted Royal Enfield authorized dealerships, serving thousands
              of riders across the region.</p>
            <p>Our state-of-the-art showroom spans over 10,000 sq. ft., featuring the complete Royal Enfield lineup
              alongside expert consultation, authentic accessories, and a world-className service centre.</p>
            <p>Every person who walks through our doors is welcomed into the Royal Enfield brotherhood — a community
              bound not by horsepower alone, but by the spirit of adventure.</p>
            <div className="about-stats">
              <div className="about-stat">
                <div className="about-stat-num" data-count="5000" data-suffix="+">0</div>
                <div className="about-stat-label">Happy Riders</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-num" data-count="18" data-suffix=" Yrs">0</div>
                <div className="about-stat-label">In Business</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-num" data-count="30" data-suffix="+">0</div>
                <div className="about-stat-label">Expert Staff</div>
              </div>
            </div>
            <a href="#test-ride" className="btn-primary">
              <i className="fa-solid fa-route"></i> Book Your Ride
            </a>
          </div>
        </div>
      </section>
      <section id="services" aria-labelledby="services-title">
        <div className="services-layout">
          <div className="services-image">
            <img src="/assets/images/workshop.png" alt="Royal Enfield authorized service workshop" loading="lazy" />
            <div className="services-image-overlay">
              <h4><i className="fa-solid fa-shield-halved"></i> &nbsp;100% Genuine Parts</h4>
              <p>Only authentic Royal Enfield spare parts and accessories — sourced directly from the factory,
                with full warranty.</p>
            </div>
          </div>
          <div>
            <span className="section-tag">Expert Care</span>
            <h2 className="section-title" id="services-title">Services &amp;<br />Genuine Parts</h2>
            <p className="section-subtitle" style={{textAlign: 'left',maxWidth:'100%',margin:'16px 0 36px'}}>Your Royal
              Enfield deserves nothing but the best. Our certified technicians and authorised service centre keep
              your machine in peak condition.</p>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-wrench"></i></div>
                <h4>Expert Servicing</h4>
                <p>Scheduled maintenance by RE-certified technicians using precision tools and diagnostics.</p>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-gear"></i></div>
                <h4>Genuine Parts</h4>
                <p>OEM spare parts with factory warranty. No counterfeits, no compromises.</p>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-road"></i></div>
                <h4>Roadside Assistance</h4>
                <p>24×7 emergency support wherever the road takes you. One call away.</p>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-file-contract"></i></div>
                <h4>AMC Plans</h4>
                <p>Annual Maintenance Contracts that give you peace of mind and predictable costs.</p>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-shield"></i></div>
                <h4>Insurance Renewal</h4>
                <p>Hassle-free insurance renewal and claim assistance through our in-house desk.</p>
              </div>
              <div className="service-card">
                <div className="service-icon"><i className="fa-solid fa-spray-can-sparkles"></i></div>
                <h4>Custom Accessories</h4>
                <p>Personalise your ride with official Royal Enfield accessories and custom fitment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="test-ride" aria-labelledby="test-ride-title">
        <div className="test-ride-layout">
          <div className="test-ride-info">
            <span className="section-tag">Experience It</span>
            <h2 className="section-title" id="test-ride-title">Book a<br />Test Ride</h2>
            <p>Words can't describe the thrum of a Royal Enfield engine beneath you. Fill in the form and one of our
              brand specialists will reach out to schedule your personal test ride experience.</p>
            <div className="test-ride-perks">
              <div className="perk-item"><i className="fa-solid fa-check"></i> No commitment required</div>
              <div className="perk-item"><i className="fa-solid fa-check"></i> Personal riding expert assigned</div>
              <div className="perk-item"><i className="fa-solid fa-check"></i> Rides available 7 days a week</div>
              <div className="perk-item"><i className="fa-solid fa-check"></i> Full model range available</div>
            </div>
          </div>
          <div className="test-ride-form glass-card">
            <h3 className="form-title">Reserve Your Slot</h3>
            <form id="booking-form" noValidate onSubmit={handleBookingSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="f-name">Full Name</label>
                  <input type="text" id="f-name" name="name" placeholder="Rajiv Mehta" required value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="f-phone">Phone Number</label>
                  <input type="tel" id="f-phone" name="phone" placeholder="+91 98765 43210" required value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="f-email">Email Address</label>
                  <input type="email" id="f-email" name="email" placeholder="rajiv@mail.com" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="f-model">Preferred Model</label>
                  <select id="f-model" name="model" required value={formData.model} onChange={handleInputChange}>
                    <option value="" disabled>Select a model</option>
                    {products.map(p => <option key={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="f-date">Preferred Date</label>
                  <input type="date" id="f-date" name="date" value={formData.date} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="f-city">Your City</label>
                  <input type="text" id="f-city" name="city" placeholder="Mumbai" value={formData.city} onChange={handleInputChange} />
                </div>
                <div className="form-group full">
                  <label htmlFor="f-msg">Message (Optional)</label>
                  <textarea id="f-msg" name="message" placeholder="Any specific queries or requirements..." value={formData.message} onChange={handleInputChange}></textarea>
                </div>
                 <div className="form-group full">
                    <label htmlFor="f-captcha">Human Verification: What is {captchaNum1} + {captchaNum2}?</label>
                    <input type="number" id="f-captcha" name="captcha" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="form-submit">
                <i className="fa-solid fa-paper-plane"></i> &nbsp; Submit Request
              </button>
            </form>
            {formError && <p style={{ color: 'var(--red)', marginTop: '15px', textAlign: 'center' }}>{formError}</p>}
            <div className="form-success" aria-live="polite" style={{ display: formSuccess ? 'block' : 'none' }}>
              <i className="fa-solid fa-circle-check"></i>
              <h3>Request Received!</h3>
              <p>Our team will contact you within 24 hours to confirm your test ride slot. Thank you for choosing
                Royal Enfield.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="emi" aria-labelledby="emi-title">
        <div className="emi-layout">
          <div className="section-header">
            <span className="section-tag">Easy Finance</span>
            <h2 className="section-title" id="emi-title">Calculate Your EMI</h2>
            <p className="section-subtitle">Custom financing options starting at 8.5% p.a. with flexible tenure up to 60
              months. Low down payment, fast approval.</p>
          </div>
          <div className="emi-calculator glass-card">
            <div className="emi-sliders">
              <div className="emi-slider-group">
                <div className="emi-slider-header">
                  <span className="emi-slider-label">Loan Amount</span>
                  <span className="emi-slider-value" id="loan-display">₹{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(loanAmount)}</span>
                </div>
                <input type="range" id="loan-amount" min="50000" max="700000" step="5000" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} aria-label="Loan Amount" />
              </div>
              <div className="emi-slider-group">
                <div className="emi-slider-header">
                  <span className="emi-slider-label">Loan Tenure</span>
                  <span className="emi-slider-value" id="tenure-display">{loanTenure} mo</span>
                </div>
                <input type="range" id="loan-tenure" min="12" max="60" step="6" value={loanTenure} onChange={e => setLoanTenure(Number(e.target.value))} aria-label="Loan Tenure" />
              </div>
              <div className="emi-slider-group">
                <div className="emi-slider-header">
                  <span className="emi-slider-label">Interest Rate (p.a.)</span>
                  <span className="emi-slider-value" id="rate-display">{interestRate.toFixed(1)}%</span>
                </div>
                <input type="range" id="loan-rate" min="8.5" max="16" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} aria-label="Interest Rate" />
              </div>
            </div>
            <div className="emi-result">
              <div className="emi-result-label">Monthly EMI</div>
              <div className="emi-result-amount" id="emi-display">₹{new Intl.NumberFormat('en-IN').format(emi)}</div>
              <div className="emi-result-sub">Estimated — subject to credit approval</div>
              <div className="emi-breakdown">
                <div className="emi-break-item">
                  <div className="emi-break-val" id="total-display">₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(totalAmount / 1000)}K</div>
                  <div className="emi-break-label">Total Amount</div>
                </div>
                <div className="emi-break-item">
                  <div className="emi-break-val" id="interest-display">₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(totalInterest / 1000)}K</div>
                  <div className="emi-break-label">Interest Payable</div>
                </div>
                <div className="emi-break-item">
                  <div className="emi-break-val">Instant</div>
                  <div className="emi-break-label">Approval</div>
                </div>
              </div>
            </div>
            <div style={{textAlign: 'center',marginTop:'36px'}}>
              <a href="#test-ride" className="btn-primary">
                <i className="fa-solid fa-indian-rupee-sign"></i> Apply for Finance
              </a>
            </div>
          </div>
        </div>
      </section>
      <section id="testimonials" aria-labelledby="testimonials-title">
        <div className="section-header">
          <span className="section-tag">Voices of the Road</span>
          <h2 className="section-title" id="testimonials-title">What Our Riders Say</h2>
          <p className="section-subtitle">Over 5,000 motorcycles delivered. Here's what the brotherhood has to say.</p>
        </div>
        <div className="testimonials-track-wrap">
          <div className="testimonials-track" id="testimonials-track">
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">Walked in looking for a Himalayan and walked out with a smile that
                hasn't left since. The team here truly understands riders. The test ride experience was
                absolutely phenomenal — no pressure, pure passion.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">AM</div>
                <div>
                  <div className="testimonial-name">Arjun Mehta</div>
                  <div className="testimonial-city">Mumbai, MH · Himalayan Owner</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">My Classic 350 is the best purchase I've ever made. The dealership team
                was knowledgeable, honest, and made the whole process seamless. Delivery was on time and the
                bike was spotless.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">PK</div>
                <div>
                  <div className="testimonial-name">Priya Krishanan</div>
                  <div className="testimonial-city">Bangalore, KA · Classic 350 Owner</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">The service center here is outstanding. Transparent pricing, quick
                turnaround, and the bike always comes back feeling brand new. I won't trust any other workshop
                with my Meteor 350.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">RV</div>
                <div>
                  <div className="testimonial-name">Rohit Varma</div>
                  <div className="testimonial-city">Hyderabad, TS · Meteor 350 Owner</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">Finance was sorted in under 2 hours and I was riding my new Hunter 350
                the same week. The staff guided me through every option patiently. This is how luxury bike
                buying should feel.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SK</div>
                <div>
                  <div className="testimonial-name">Sameer Khanna</div>
                  <div className="testimonial-city">Delhi, DL · Hunter 350 Owner</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">Bought my Super Meteor 650 six months ago — it's a beast. The
                dealership's showroom experience is as premium as the bike itself. Highly recommend to every
                Royal Enfield enthusiast.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">NC</div>
                <div>
                  <div className="testimonial-name">Nishant Chawla</div>
                  <div className="testimonial-city">Pune, MH · Super Meteor 650 Owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="testimonials-dots">
          <button className="dot active" aria-label="Testimonial 1"></button>
          <button className="dot" aria-label="Testimonial 2"></button>
          <button className="dot" aria-label="Testimonial 3"></button>
          <button className="dot" aria-label="Testimonial 4"></button>
          <button className="dot" aria-label="Testimonial 5"></button>
        </div>
      </section>
      <section id="contact" aria-labelledby="contact-title">
        <div className="section-header">
          <span className="section-tag">Find Us</span>
          <h2 className="section-title" id="contact-title">Visit the Showroom</h2>
          <p className="section-subtitle">Open 7 days a week. Come breathe in the machines.</p>
        </div>
        <div className="contact-layout">
          <div className="contact-info">
            <p>Our showroom is located in the heart of the city, easily accessible and equipped with the complete
              Royal Enfield experience — from models and accessories to finance and servicing.</p>
            <div className="contact-item">
              <div className="contact-icon"><i className="fa-solid fa-location-dot"></i></div>
              <div className="contact-item-body">
                <h4>Showroom Address</h4>
                <p>42, Rajpur Road, Sector 14<br />Gurugram, Haryana - 122001</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><i className="fa-solid fa-phone"></i></div>
              <div className="contact-item-body">
                <h4>Sales &amp; Enquiries</h4>
                <a href="tel:+911244567890">+91 124 456 7890</a><br />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><i className="fa-solid fa-clock"></i></div>
              <div className="contact-item-body">
                <h4>Showroom Hours</h4>
                <p>Mon – Sat: 9:00 AM – 8:00 PM<br />Sunday: 10:00 AM – 6:00 PM</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><i className="fa-solid fa-envelope"></i></div>
              <div className="contact-item-body">
                <h4>Email Us</h4>
                <a href="mailto:hello@re-gurugram.in">hello@re-gurugram.in</a>
              </div>
            </div>
            <div className="contact-socials">
              <a href="#" className="social-btn" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="social-btn" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-btn" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
              <a href="#" className="social-btn" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
            </div>
          </div>
          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.2!2d77.043!3d28.451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDI3JzAzLjYiTiA3N8KwMDInMzQuOCJF!5e0!3m2!1sen!2sin!4v1"
              allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Royal Enfield Dealership Location"></iframe>
            <div className="map-overlay-badge">
              <i className="fa-solid fa-location-dot"></i> Royal Enfield Gurugram
            </div>
          </div>
        </div>
      </section>
      <footer>
        <div className="footer-main">
          <div className="footer-brand footer-col">
            <span className="logo-brand">Royal Enfield</span>
            <span className="logo-sub">Authorized Dealership · Est. 2005</span>
            <p>Your trusted home for Royal Enfield motorcycles, genuine parts, expert service, and easy finance —
              all under one roof.</p>
            <div className="contact-socials">
              <a href="#" className="social-btn" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="social-btn" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-btn" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
              <a href="#" className="social-btn" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Models</h4>
            <ul>
              <li><a href="/products">All Models</a></li>
              {products.slice(0, 5).map(p => <li key={p.id}><Link href={`/product/${p.id}`}>{p.name}</Link></li>)}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Dealership</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#services">Genuine Parts</a></li>
              <li><a href="#emi">Finance</a></li>
              <li><a href="#test-ride">Book Test Ride</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="tel:+911244567890">+91 124 456 7890</a></li>
              <li><a href="mailto:hello@re-gurugram.in">hello@re-gurugram.in</a></li>
              <li><a href="#contact">42, Rajpur Road, Gurugram</a></li>
            </ul>
            <div style={{marginTop:'20px'}}>
              <a href="#test-ride" className="btn-primary" style={{padding:'10px 20px',fontSize:'0.78rem'}}>Book Test
                Ride</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2024 Royal Enfield Gurugram. All rights reserved. An Authorized Royal Enfield
            Dealership.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
