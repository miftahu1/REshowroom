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

interface CloudinaryUsage {
    plan: string;
    last_updated: string;
    transformations: { used: number, limit: number, used_percent: number };
    objects: { used: number, limit: number, used_percent: number };
    bandwidth: { used: number, limit: number, used_percent: number };
    storage: { used: number, limit: number, used_percent: number };
    requests: number;
    resources: number;
    derived_resources: number;
}

// A simple progress bar component
const ProgressBar = ({ value, max }: { value: number, max: number }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div style={{ width: '100%', background: 'var(--glass-border)', borderRadius: '4px', height: '8px' }}>
            <div style={{ width: `${percentage}%`, background: 'var(--gold)', height: '100%', borderRadius: '4px' }}></div>
        </div>
    );
};

const MediaLibraryPage = () => {
  const [images, setImages] = useState<CloudinaryResource[]>([]);
  const [usage, setUsage] = useState<CloudinaryUsage | null>(null);
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
      setUsage(data.usage || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaData();
  }, []);

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

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Media Library</h1>
        <p>Manage your cloud-stored images and monitor usage.</p>
      </div>
      
       {usage && (
        <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
            <div className="dashboard-card">
                <h3><i className="fas fa-database" style={{ color: 'var(--gold)' }}></i> Storage</h3>
                <p className="dashboard-stat">{formatBytes(usage.storage.used)}</p>
                <ProgressBar value={usage.storage.used} max={usage.storage.limit} />
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total: {formatBytes(usage.storage.limit)}</p>
            </div>
             <div className="dashboard-card">
                <h3><i className="fas fa-images" style={{ color: 'var(--gold)' }}></i> Media Count</h3>
                <p className="dashboard-stat">{images.length}</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total images in library</p>
            </div>
            <div className="dashboard-card">
                <h3><i className="fas fa-wifi" style={{ color: 'var(--gold)' }}></i> Bandwidth</h3>
                <p className="dashboard-stat">{formatBytes(usage.bandwidth.used)}</p>
                <ProgressBar value={usage.bandwidth.used} max={usage.bandwidth.limit} />
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Limit: {formatBytes(usage.bandwidth.limit)}</p>
            </div>
        </div>
      )}

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
            <p className="text-muted mb-4">Your media library is empty. Upload images via the product or event pages.</p>
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
