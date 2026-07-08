
'use client';

import { useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import emailjs from '@emailjs/browser';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// --- IMPORTANT: ADD YOUR EMAILJS DETAILS HERE ---
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string;
const EMAILJS_TEMPLATE_ID_MANAGER = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_MANAGER as string;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string;

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const getRandomNum = () => Math.floor(Math.random() * 10) + 1;

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [captchaNum1, setCaptchaNum1] = useState(getRandomNum());
  const [captchaNum2, setCaptchaNum2] = useState(getRandomNum());
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const generateCaptcha = () => {
    setCaptchaNum1(getRandomNum());
    setCaptchaNum2(getRandomNum());
    setCaptchaAnswer('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getManagerEmailBody = (title: string, data: any) => {
    const currentYear = new Date().getFullYear();
    const details = Object.entries(data)
        .map(([key, value]) => {
            if (!value) return '';
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            return `
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; text-transform: capitalize; font-weight: bold; color: #555; width: 30%;">${formattedKey}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; color: #333;">${value as string}</td>
                </tr>
            `;
        })
        .join('');

    return `
        <!DOCTYPE html><html><head><link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet"></head><body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Roboto', sans-serif;"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding: 20px 0;"><table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);"><tr><td align="center" style="padding: 30px 20px; background-color: #121212;"><h1 style="color: #c9a84c; font-family: 'Teko', sans-serif; font-size: 32px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">${title}</h1></td></tr><tr><td style="padding: 40px 30px;"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #e0e0e0; border-radius: 8px;">${details}</table></td></tr><tr><td style="padding: 20px 30px; background-color: #121212;"><p style="margin: 0; color: #888888; text-align: center; font-size: 12px;">&copy; ${currentYear} Royal Enfield Amguri. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (parseInt(captchaAnswer) !== captchaNum1 + captchaNum2) {
        setFormError('Incorrect CAPTCHA answer. Please try again.');
        generateCaptcha();
        return;
    }

    try {
      const settingDoc = await getDoc(doc(db, 'settings', 'managerDetails'));
      const managerEmailAddress = settingDoc.exists() ? settingDoc.data().email : '';

      await addDoc(collection(db, "messages"), { ...formData, timestamp: serverTimestamp() });

      if (managerEmailAddress) {
        const emailBody = getManagerEmailBody('New Contact Message', formData);
        const templateParams = { manager_email: managerEmailAddress, from_name: formData.name, reply_to: formData.email, subject: 'New Message from Website Contact Form', email_body: emailBody };
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID_MANAGER, templateParams, EMAILJS_PUBLIC_KEY);
      }

      setFormSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      generateCaptcha();

    } catch (error) {
      console.error("Error submitting message: ", error);
      setFormError("Sorry, something went wrong. Please try again later.");
      generateCaptcha();
    }
  }

  return (
    <div className="page-shell">
        <section id="contact" aria-labelledby="contact-title">
        <div className="section-header">
          <span className="section-tag">Contact Us</span>
          <h2 className="section-title" id="contact-title">Get in Touch</h2>
          <p className="section-subtitle">We're here to help. Send us a message and we'll get back to you.</p>
        </div>
        <div className="contact-layout">
          <div className="contact-info">
             <div className="test-ride-form glass-card" style={{padding: '30px'}}>
                <h3 className="form-title">Send us a Message</h3>
                <form id="contact-form" noValidate onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group full">
                    <label htmlFor="c-name">Full Name</label>
                    <input type="text" id="c-name" name="name" placeholder="Your Name" required value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group full">
                    <label htmlFor="c-email">Email Address</label>
                    <input type="email" id="c-email" name="email" placeholder="your.email@example.com" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="form-group full">
                    <label htmlFor="c-msg">Your Message</label>
                    <textarea id="c-msg" name="message" placeholder="How can we help?" value={formData.message} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-group full">
                        <label htmlFor="f-captcha">Human Verification: What is {captchaNum1} + {captchaNum2}?</label>
                        <input type="number" id="f-captcha" name="captcha" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} required />
                    </div>
                </div>
                <button type="submit" className="form-submit">
                    <i className="fa-solid fa-paper-plane"></i> &nbsp; Send Message
                </button>
                </form>
                {formError && <p style={{ color: 'var(--red)', marginTop: '15px', textAlign: 'center' }}>{formError}</p>}
                <div className="form-success" aria-live="polite" style={{ display: formSuccess ? 'block' : 'none' }}>
                <i className="fa-solid fa-circle-check"></i>
                <h3>Message Sent!</h3>
                <p>Thanks for reaching out. We'll get back to you as soon as possible.</p>
                </div>
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
    </div>
  )
}

export default ContactPage
