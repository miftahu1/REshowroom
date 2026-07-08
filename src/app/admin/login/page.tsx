'use client';

import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
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
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [showReset, setShowReset] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push('/admin');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/admin');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = () => {
        signInWithPopup(auth, googleProvider)
            .then(() => {
                router.push('/admin');
            })
            .catch(err => setError(err.message));
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetMessage('');
        setError('');
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetMessage('Password reset email sent. Please check your inbox.');
            setShowReset(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form glass-card">
                <h1 className="form-title">Funshine Getaways</h1>
                <h2 className="form-subtitle">Admin Panel</h2>
                
                {!showReset ? (
                    <>
                        <form onSubmit={handleAuthAction} className="space-y-6">
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                            </div>

                            <div className="form-group">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="password">Password</label>
                                    <a href="#" onClick={() => setShowReset(true)} className="text-sm text-gray-400 hover:text-white">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white">
                                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full">Sign In</button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        <button onClick={handleGoogleSignIn} className="btn-outline google-login w-full">
                            <i className="fa-brands fa-google"></i> &nbsp; Sign in with Google
                        </button>

                        {error && <p className="error-message mt-4">{error}</p>}
                        {resetMessage && <p className="success-message mt-4">{resetMessage}</p>}
                    </>
                ) : (
                    <form onSubmit={handlePasswordReset} className="space-y-6">
                        <h3 className="form-subtitle">Reset Password</h3>
                        <div className="form-group">
                            <label htmlFor="reset-email">Enter your email</label>
                            <input type="email" id="reset-email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-primary w-full">Send Reset Link</button>
                        <button type="button" onClick={() => setShowReset(false)} className="btn-outline w-full mt-4">Back to Login</button>
                        {error && <p className="error-message mt-4">{error}</p>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
