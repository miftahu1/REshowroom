'use client';

import { useState, useEffect } from 'react';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a future step, we will fetch data from the Google Analytics API here.
    // For now, we will just simulate a loading state.
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="admin-page-body">
      <div className="admin-header">
        <h1>Analytics Dashboard</h1>
        <p>Key metrics and insights about your website's performance.</p>
      </div>

      {isLoading ? (
        <div className="loading-overlay" style={{ display: 'flex', position: 'relative', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', minHeight: '300px' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div>
          <p>Analytics data will be displayed here soon.</p>
          {/* We will build the data visualization components here */}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;