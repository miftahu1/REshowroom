
'use client';

import { useState, useEffect } from 'react';
import './analytics.css';

// Types for Google Analytics Data
interface GaMetric {
  name: string;
  value: string;
}

interface GaReportRow {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

interface GaData {
  mainReport?: { totals: { metricValues: GaMetric[] }[] };
  pagesReport?: { rows: GaReportRow[] };
}

// Types for Firebase Booking Data
interface BookingData {
  total: number;
  approved: number;
  cancelled: number;
  pending: number;
}

// Combined data structure
interface AnalyticsData {
  googleAnalytics: GaData | null;
  firebase: BookingData | null;
}

// --- Reusable Components ---
const MetricCard = ({ title, metric, helpText }: { title: string; metric: string; helpText?: string }) => (
  <div className="analytics-card">
    <p className="card-title">{title}</p>
    <p className="card-metric">{metric}</p>
    {helpText && <p className="text-xs text-gray-500 mt-2">{helpText}</p>}
  </div>
);

const DataTable = ({ title, headers, data }: { title: string; headers: string[]; data: (string | number)[][] }) => (
    <div className="analytics-card table-card full-width-card">
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

// --- Main Page Component ---
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch from both APIs in parallel
        const [gaResponse, fbResponse] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/bookings')
        ]);

        if (!gaResponse.ok || !fbResponse.ok) {
          throw new Error('Failed to fetch all analytics data');
        }

        const googleAnalytics = await gaResponse.json();
        const firebase = await fbResponse.json();

        setData({ googleAnalytics, firebase });

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- Helper functions for formatting ---
  const formatRate = (rate: number | undefined) => rate ? `${(rate * 100).toFixed(1)}%` : '0%';

  // --- Render Logic ---
  if (loading) {
    return <div>Loading comprehensive analytics data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div>No analytics data available.</div>;
  }

  // --- Data Processing ---
  const ga = data.googleAnalytics;
  const fb = data.firebase;

  const [activeUsers, pageViews, newUsers, sessions, avgSessionDuration, engagementRate] = ga?.mainReport?.totals?.[0]?.metricValues.map(m => m.value) || Array(6).fill('0');
  const pagesData = ga?.pagesReport?.rows?.map(row => [row.dimensionValues[0].value, parseInt(row.metricValues[0].value, 10)]) || [];

  // Calculate Business KPIs
  const totalVisitors = parseInt(sessions, 10);
  const totalBookings = fb?.total || 0;
  const visitorToBookingRatio = totalVisitors > 0 ? (totalBookings / totalVisitors) : 0;
  const approvalRate = totalBookings > 0 ? ((fb?.approved || 0) / totalBookings) : 0;

  return (
    <div>
      {/* --- Section 1: Business Operations --- */}
      <h1 className="text-2xl font-bold mb-4">Business Operations (All Time)</h1>
      <div className="analytics-grid mb-8">
        <MetricCard title="Total Test Ride Bookings" metric={totalBookings.toString()} />
        <MetricCard title="Approved Bookings" metric={fb?.approved.toString() || '0'} />
        <MetricCard title="Cancelled Bookings" metric={fb?.cancelled.toString() || '0'} />
        <MetricCard title="Pending Review" metric={fb?.pending.toString() || '0'} helpText="Action required by your team" />
        <MetricCard title="Visitor-to-Booking Ratio" metric={formatRate(visitorToBookingRatio)} helpText="How many visitors become leads"/>
        <MetricCard title="Booking Approval Rate" metric={formatRate(approvalRate)} helpText="Percentage of leads approved" />
      </div>

      {/* --- Section 2: Website Performance --- */}
      <h1 className="text-2xl font-bold mb-4">Website Performance (Last 7 Days)</h1>
      <div className="analytics-grid">
        <MetricCard title="Active Users" metric={activeUsers} />
        <MetricCard title="Page Views" metric={pageViews} />
        <MetricCard title="Engagement Rate" metric={formatRate(parseFloat(engagementRate))} />
        <DataTable 
          title="Top Pages by Views" 
          headers={['Page Title', 'Views']}
          data={pagesData} 
        />
      </div>
    </div>
  );
}
