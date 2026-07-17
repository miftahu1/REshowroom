
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("The GOOGLE_PRIVATE_KEY environment variable is not set.");
    }

    const formattedPrivateKey = privateKey.replace(/\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: formattedPrivateKey,
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

    if (!propertyId) {
      throw new Error('Missing GOOGLE_ANALYTICS_PROPERTY_ID');
    }

    const dateRanges = [
      {
        startDate: '7daysAgo',
        endDate: 'today',
      },
    ];

    // Parallel requests to the Google Analytics Data API
    const [mainReport, pagesReport, devicesReport, countriesReport] = await Promise.all([
      // Main metrics report
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges,
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'newUsers' },
            { name: 'sessions' },
          ],
        },
      }),
      // Top pages report
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges,
          dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 7,
        },
      }),
      // Devices report
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges,
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        },
      }),
      // Countries report
      analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges,
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 7,
        },
      }),
    ]);

    return NextResponse.json({
      mainReport: mainReport.data,
      pagesReport: pagesReport.data,
      devicesReport: devicesReport.data,
      countriesReport: countriesReport.data,
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch analytics data', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
