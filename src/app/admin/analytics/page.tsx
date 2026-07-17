'use client';

import { useState, useEffect } from 'react';

interface Metric {
  name: string;
  value: string;
}

interface AnalyticsData {
  rows: { metricValues: Metric[] }[];
}

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeUsers = data?.rows?.[0]?.metricValues?.[0]?.value || '0';
  const pageViews = data?.rows?.[0]?.metricValues?.[1]?.value || '0';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Website Analytics (Last 7 Days)</h1>
      
      {loading && <p className="text-gray-500">Loading analytics data...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-600">Active Users</h2>
            <p className="text-4xl font-bold text-gray-800 mt-2">{activeUsers}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-600">Page Views</h2>
            <p className="text-4xl font-bold text-gray-800 mt-2">{pageViews}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
