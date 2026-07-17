
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

    if (!clientEmail || !privateKey || !propertyId) {
      throw new Error(
        `One or more environment variables are missing. client_email: ${!!clientEmail}, private_key: ${!!privateKey}, property_id: ${!!propertyId}`
      );
    }

    // The key must have the \n characters replaced with actual newlines.
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    // --- BEGIN DEBUGGING BLOCK ---
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const keyInfo = {
      wasLoaded: !!privateKey,
      length: privateKey?.length || 0,
      // Does the key string contain the literal characters \ and n?
      includesLiteralBackslashN: privateKey?.includes('\\n') || false,
      // Does the key string contain an actual newline character?
      includesNewline: privateKey?.includes('\n') || false,
      startsWith: privateKey?.substring(0, 30),
      endsWith: privateKey?.substring((privateKey?.length || 0) - 30),
    };

    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new NextResponse(
      JSON.stringify({
        error: 'API Error',
        details: errorMessage,
        debug_keyInfo: keyInfo, // Key debug info is now in the response
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    // --- END DEBUGGING BLOCK ---
  }
}
