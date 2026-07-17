
import { NextResponse } from 'next/server';
import { admin, db } from '@/lib/firebase-admin'; // Assuming you have an admin setup file

export async function GET() {
  try {
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef.get();

    if (snapshot.empty) {
      return NextResponse.json({ 
        total: 0, 
        approved: 0, 
        cancelled: 0, 
        pending: 0 
      });
    }

    let approved = 0;
    let cancelled = 0;
    let pending = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      switch (data.status) {
        case 'Approved':
          approved++;
          break;
        case 'Cancelled':
          cancelled++;
          break;
        case 'Pending':
          pending++;
          break;
        default:
          // Any other status could be counted as pending or a separate category
          pending++;
          break;
      }
    });

    const total = snapshot.size;

    return NextResponse.json({ total, approved, cancelled, pending });

  } catch (error) {
    console.error('Error fetching booking data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch booking data', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
