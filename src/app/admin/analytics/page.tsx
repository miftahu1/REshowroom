
'use client';

import { useState, useEffect } from 'react';
import './analytics.css';

// Define types for the analytics data for better type-checking
interface Metric {
  name: string;
  value: string;
}

interface ReportRow {
  dimensionValues: { value: string; one_value?: string }[];
  metricValues: { value: string; one_value?: string }[];
}

interface AnalyticsData {
  mainReport?: { totals: { metricValues: Metric[] }[] };
  pagesReport?: { rows: ReportRow[] };
  devicesReport?: { rows: ReportRow[] };
  countriesReport?: { rows: ReportRow[] };
}

// Reusable component for displaying a metric card
const MetricCard = ({ title, metric }: { title: string; metric: string }) => (
  <div className="card">
    <p className="card-title">{title}</p>
    <p className="card-metric">{metric}</p>
  </div>
);

// Reusable component for displaying a data table
const DataTable = ({ title, headers, data }: { title: string; headers: string[]; data: (string | number)[][] }) => (
  <div className="card table-card full-width-card">
    <h3 className="font-semibold text-lg mb-4">{title}</h3>
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={j === row.length - 1 ? 'value-cell' : ''}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('/api/analytics');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.details || 'Failed to fetch analytics data');
        }
        const jsonData = await res.json();
        setData(jsonData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading analytics data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div>No analytics data available.</div>;
  }

  // Extracting metrics safely with fallbacks
  const [activeUsers, pageViews, newUsers, sessions] = data.mainReport?.totals?.[0]?.metricValues.map(m => m.value) || ['0', '0', '0', '0'];
  const pagesData = data.pagesReport?.rows?.map(row => [row.dimensionValues[0].value, parseInt(row.metricValues[0].value, 10)]) || [];
  const devicesData = data.devicesReport?.rows?.map(row => [row.dimensionValues[0].value, parseInt(row.metricValues[0].value, 10)]) || [];
  const countriesData = data.countriesReport?.rows?.map(row => [row.dimensionValues[0].value, parseInt(row.metricValues[0].value, 10)]) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Website Analytics (Last 7 Days)</h1>
      <div className="analytics-grid">
        <MetricCard title="Active Users" metric={activeUsers} />
        <MetricCard title="Page Views" metric={pageViews} />
        <MetricCard title="New Users" metric={newUsers} />
        <MetricCard title="Total Sessions" metric={sessions} />

        <DataTable 
          title="Top Pages by Views" 
          headers={['Page Title', 'Views']}
          data={pagesData} 
        />

        <div className="analytics-grid full-width-card" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <DataTable 
              title="Audience by Device"
              headers={['Device Type', 'Users']}
              data={devicesData} 
            />
            <DataTable 
              title="Audience by Country"
              headers={['Country', 'Users']}
              data={countriesData} 
            />
        </div>
      </div>
    </div>
  );
}
