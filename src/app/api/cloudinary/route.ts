
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all images from cloudinary
export async function GET() {
  try {
    const { resources } = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();
    
    return NextResponse.json({ resources });

  } catch (error) {
    console.error("Error fetching images from Cloudinary", error)
    return NextResponse.json({ message: "Failed to fetch images" }, { status: 500 });
  }
}

// Delete an image by its public ID
export async function DELETE(request: Request) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json({ message: "Public ID is required" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    // The result object from Cloudinary contains details about the deletion.
    // A successful deletion returns { result: 'ok' }.
    if (result.result === 'ok') {
      return NextResponse.json({ message: `Image ${publicId} deleted successfully` });
    } else {
      // This will catch cases where the public_id doesn't exist or other API errors.
      return NextResponse.json({ message: "Failed to delete image", details: result }, { status: 500 });
    }

  } catch (error) {
    console.error("Error deleting image from Cloudinary", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
