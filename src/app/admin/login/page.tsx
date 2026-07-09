'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import '../../globals.css';
import './login.css';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      Cookies.set('admin-session', 'true', { expires: 1 }); // Expires in 1 day
      router.push('/admin');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="login-container">
        <div className="login-box glass-card login-form">
            <h2>RE-Admin</h2>
            <p>Royal Enfield Dealership</p>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="btn-primary">Login</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    </div>
  );
};

export default AdminLoginPage;
