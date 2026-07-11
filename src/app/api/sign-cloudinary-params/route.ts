import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { paramsToSign } = body;

  try {
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);
    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Error signing Cloudinary params', error);
    return NextResponse.json({ message: "Failed to sign upload" }, { status: 500 });
  }
}
