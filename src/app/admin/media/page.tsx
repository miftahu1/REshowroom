'use client';
import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  created_at: string;
}

const MediaLibraryPage = () => {
  const [images, setImages] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cloudinary');
      if (!res.ok) {
        throw new Error('Failed to fetch images from Cloudinary');
      }
      const data = await res.json();
      setImages(data.resources);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (publicId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this image? This action cannot be undone.')) {
      try {
        const res = await fetch('/api/cloudinary', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to delete image');
        }

        // Refresh the image list
        setImages(prevImages => prevImages.filter(image => image.public_id !== publicId));
        alert('Image deleted successfully!');

      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div>
      <div className="product-management-header">
        <h1>Media Library</h1>
        <button onClick={fetchImages} className="btn-outline" disabled={loading}>
          {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Refreshing...</> : <><i className="fa-solid fa-sync" /> Refresh</>}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading && !error ? (
        <p>Loading media...</p>
      ) : (
        <div className="media-gallery-grid mt-6">
          {images.map(image => (
            <div key={image.public_id} className="media-card">
              <CldImage
                src={image.public_id}
                width={400}
                height={300}
                crop="fill"
                alt="Cloudinary Image"
                className="rounded-t-lg"
              />
              <div className="media-card-footer">
                <p className="text-xs text-gray-500 truncate">{image.public_id}</p>
                <button onClick={() => handleDelete(image.public_id)} className="btn-delete">
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibraryPage;
