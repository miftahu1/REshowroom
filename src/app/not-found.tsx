'use client';

import Link from 'next/link';
import '../styles/404.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <img src="/assets/images/hunter350.png" alt="Crashing bike" className="error-bike-animation" />
        <h1 className="error-title">404 - Page Not Found</h1>
        <p className="error-message">Oops! Looks like you've taken a wrong turn. The page you are looking for does not exist.</p>
        <Link href="/" className="btn-primary">Return to Homepage</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
