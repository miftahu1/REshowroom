
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all images and usage data from Cloudinary
export async function GET() {
  try {
    // Fetch image resources and usage data in parallel for efficiency
    const [resourcesResult, usageResult] = await Promise.all([
      cloudinary.search
        .expression('resource_type:image')
        .sort_by('created_at', 'desc')
        .max_results(500)
        .execute(),
      cloudinary.api.usage()
    ]);
    
    return NextResponse.json({ 
      resources: resourcesResult.resources,
      usage: usageResult 
    });

  } catch (error) {
    console.error("Error fetching data from Cloudinary", error);
    return NextResponse.json({ message: "Failed to fetch data from Cloudinary" }, { status: 500 });
  }
}

// Delete one or more images by their public IDs
export async function DELETE(request: Request) {
  try {
    const { publicId, publicIds } = await request.json();

    if (!publicId && !publicIds) {
      return NextResponse.json({ message: "At least one Public ID is required" }, { status: 400 });
    }

    if (publicIds && Array.isArray(publicIds) && publicIds.length > 0) {
      // Bulk delete
      const result = await cloudinary.api.delete_resources(publicIds);
      return NextResponse.json({ message: `${publicIds.length} images deleted successfully`, details: result });

    } else if (publicId) {
      // Single delete
      const result = await cloudinary.uploader.destroy(publicId);
       if (result.result === 'ok') {
        return NextResponse.json({ message: `Image ${publicId} deleted successfully` });
      } else {
        return NextResponse.json({ message: "Failed to delete image", details: result }, { status: 500 });
      }
    }
    
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });

  } catch (error) {
    console.error("Error deleting image(s) from Cloudinary", error);
    return NextResponse.json({ message: "An unexpected error occurred during deletion." }, { status: 500 });
  }
}
