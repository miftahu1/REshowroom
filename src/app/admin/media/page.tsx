'use client';
import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import { FaCheckCircle, FaRegCircle, FaCloud, FaDatabase } from 'react-icons/fa';

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

        // Refetch data to get updated usage and image list
        fetchMediaData(); 
        setSelectedImages([]); // Clear selection
        alert('Selected images deleted successfully!');

      } catch (err: any) {
        alert(`Error: ${err.message}`);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <button onClick={fetchMediaData} className="btn-outline" disabled={loading}>
          {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Refreshing...</> : <><i className="fa-solid fa-sync" /> Refresh</>}
        </button>
      </div>
      
      {/* Usage Stats */}
       {usage && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg text-gray-700 flex items-center"><FaDatabase className="mr-2 text-gray-500"/> Storage Usage</h3>
                <p className="text-2xl font-bold text-gray-900">{formatBytes(usage.storage.used)} / {formatBytes(usage.storage.limit)}</g>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${usage.storage.used_percent}%` }}></div>
                </div>
            </div>
             <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg text-gray-700 flex items-center"><FaCloud className="mr-2 text-gray-500"/> Media Count</h3>
                <p className="text-2xl font-bold text-gray-900">{images.length} <span className="text-base font-normal text-gray-500">items</span></g>
                 <p className="text-sm text-gray-500">Displaying the latest {images.length} images.</p>
            </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedImages.length > 0 && (
        <div className="bg-gray-800 text-white rounded-lg p-4 flex justify-between items-center mb-6 sticky top-4 z-10 shadow-lg">
          <span className="font-semibold">{selectedImages.length} image(s) selected</span>
          <div>
            <button onClick={() => setSelectedImages([])} className="btn-secondary mr-2">Deselect All</button>
            <button onClick={handleBulkDelete} className="btn-delete"><i className="fa-solid fa-trash"></i> Delete Selected</button>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>}

      {loading && !images.length ? (
        <p className="text-center py-10">Loading media...</p>
      ) : !loading && images.length === 0 ? (
        <div className="text-center py-20 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold">No media found</h3>
            <p className="text-gray-500 mb-4">Your media library is empty. Upload images via the product or event pages.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {images.map(image => {
            const isSelected = selectedImages.includes(image.public_id);
            return (
              <div 
                key={image.public_id} 
                className={`relative rounded-lg overflow-hidden shadow-md cursor-pointer border-4 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => handleToggleSelect(image.public_id)}
              >
                <CldImage
                  src={image.public_id}
                  width={300}
                  height={300}
                  crop="fill"
                  gravity="auto"
                  alt="Cloudinary Image"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  {isSelected ? 
                    <FaCheckCircle className="text-blue-500 bg-white rounded-full text-2xl" /> :
                    <FaRegCircle className="text-gray-300 bg-gray-800 bg-opacity-50 rounded-full text-2xl" />
                  }
                </div>
                 <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                    {image.public_id.split('/').pop()}
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
