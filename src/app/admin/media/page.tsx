'use client';
import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import ImageUploader from '@/components/ImageUploader';

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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const fetchMediaData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cloudinary');
      if (!res.ok) throw new Error('Failed to fetch media data from Cloudinary');
      const data = await res.json();
      setImages(data.resources || []);
      // Usage data is still fetched but not displayed to prevent NaN errors
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaData();
  }, []);

  const handleUploadSuccess = () => {
    fetchMediaData(); // Refresh the media library after a new upload
  };

  const handleToggleSelect = (publicId: string) => {
    setSelectedImages(prev =>
      prev.includes(publicId)
        ? prev.filter(id => id !== publicId)
        : [...prev, publicId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;
    if (window.confirm(`Are you sure you want to permanently delete ${selectedImages.length} selected image(s)? This action cannot be undone.`)) {
      try {
        const res = await fetch('/api/cloudinary', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicIds: selectedImages }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to delete images');
        }

        fetchMediaData(); 
        setSelectedImages([]);

      } catch (err: any) {
          setError(err.message);
      }
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Media Library</h1>
        <p>Manage your cloud-stored images and monitor usage.</p>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, fontFamily: 'var(--font-heading)', color: 'var(--gold)' }}>Upload New Image</h3>
        <p className="text-muted" style={{marginTop: '-0.5rem', marginBottom: '1rem'}}>Upload a new image directly to the media library. Images will be placed in the 're_media' folder.</p>
        <ImageUploader onUploadSuccess={handleUploadSuccess} folder="re_media" />
      </div>
      
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
            <div className="dashboard-card">
                <h3><i className="fas fa-images" style={{ color: 'var(--gold)' }}></i> Media Count</h3>
                <p className="dashboard-stat">{images.length}</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total images in library</p>
            </div>
      </div>

      {selectedImages.length > 0 && (
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'sticky', top: '20px', zIndex: '10' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--gold)' }}>{selectedImages.length} image(s) selected</span>
          <div>
            <button onClick={() => setSelectedImages([])} className="btn-outline" style={{ marginRight: '1rem' }}>Deselect All</button>
            <button onClick={handleBulkDelete} className="btn-delete"><i className="fas fa-trash"></i> Delete Selected</button>
          </div>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {loading && !images.length ? (
        <div className="loading-container" style={{minHeight: '300px', display:'grid', placeContent:'center'}}><div className='loading-spinner'></div></div>
      ) : !loading && images.length === 0 ? (
        <div className="glass-card text-center" style={{padding: '4rem'}}>
            <h3>No Media Found</h3>
            <p className="text-muted mb-4">Your media library is empty. Use the uploader above to add images.</p>
             <button onClick={fetchMediaData} className="btn-primary"><i className="fas fa-sync"></i> Refresh</button>
        </div>
      ) : (
        <div className="models-grid">
          {images.map(image => {
            const isSelected = selectedImages.includes(image.public_id);
            return (
              <div 
                key={image.public_id} 
                className={`model-card ${isSelected ? 'selected' : ''}`} 
                style={{ border: isSelected ? '2px solid var(--gold)' : '' }}
                onClick={() => handleToggleSelect(image.public_id)}
              >
                 <div className="model-card-img" style={{height: '180px'}}>
                    <CldImage
                        src={image.public_id}
                        width={300}
                        height={300}
                        crop="fill"
                        gravity="auto"
                        alt={image.public_id}
                    />
                 </div>
                 <div className="model-card-body" style={{padding: '1rem', textAlign:'center'}}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{image.public_id.split('/').pop()}</p>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaLibraryPage;