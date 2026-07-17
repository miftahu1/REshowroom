
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("The GOOGLE_PRIVATE_KEY environment variable is not set.");
    }

    // This is the definitive fix. Vercel stores the key as a single line, 
    // so we must replace the literal '\n' characters with actual newlines.
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

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

    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [
          {
            startDate: '7daysAgo',
            endDate: 'today',
          },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
        ],
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch analytics data', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
