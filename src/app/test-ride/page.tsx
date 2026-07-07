'use client'

import { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import emailjs from '@emailjs/browser';

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

export default function TestRidePage() {

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
    const [captchaNum1, setCaptchaNum1] = useState(1);
    const [captchaNum2, setCaptchaNum2] = useState(1);
    const [captchaAnswer, setCaptchaAnswer] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
        const productsQuery = query(collection(db, "products"), orderBy("createdAt"));
        const productsSnapshot = await getDocs(productsQuery);
        setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        setCaptchaNum1(getRandomNum());
        setCaptchaNum2(getRandomNum());
    }, []);

    const generateCaptcha = () => {
        setCaptchaNum1(getRandomNum());
        setCaptchaNum2(getRandomNum());
        setCaptchaAnswer('');
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
                                        <a href="https://reshowroom.vercel.app/admin" target="_blank" style="background-color: #c9a84c; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: 'Roboto', sans-serif; font-size: 16px;">Go to Admin Dashboard</a>
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
          to_email: MANAGER_EMAIL,
          from_name: 'Royal Enfield Amguri',
          reply_to: formData.email,
          subject: `New Test Ride Request: ${formData.model || 'Test Ride'}`,
          email_body: emailBody,
          email_html: emailBody,
          html_message: emailBody,
          message_html: emailBody,
          message: `New booking request from ${formData.name || 'Unknown'} (${formData.email || 'no email provided'}). Model: ${formData.model || 'N/A'}. Date: ${formData.date || 'N/A'}. City: ${formData.city || 'N/A'}. Message: ${formData.message || 'None'}`,
          booking_name: formData.name,
          booking_phone: formData.phone,
          booking_email: formData.email,
          booking_model: formData.model,
          booking_date: formData.date,
          booking_city: formData.city,
          booking_message: formData.message,
          booking_details_html: emailBody
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

  return (
    <section id="test-ride" aria-labelledby="test-ride-title" style={{paddingTop: '120px', paddingBottom: '120px'}}>
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
  );
}
