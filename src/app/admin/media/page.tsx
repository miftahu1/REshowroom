'use client';
import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import { FaCheckCircle, FaRegCircle, FaCloud, FaDatabase, FaTrash, FaSync, FaSpinner, FaImages, FaExclamationTriangle } from 'react-icons/fa';

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

const StatCard = ({ icon, title, value, detail, progress }: { icon: React.ReactNode, title: string, value: string, detail?: string, progress?: number }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center">
            <div className="mr-4 text-gray-400">{icon}</div>
            <div>
                <h3 className="font-semibold text-gray-500">{title}</h3>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {detail && <p className="text-sm text-gray-500">{detail}</p>}
            </div>
        </div>
        {progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        )}
    </div>
);


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
        // You might want a more subtle notification system than alert
        // For now, we'll keep it simple.
        console.log('Selected images deleted successfully!');

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
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Media Library</h1>
            <p className="text-gray-500 mt-1">Manage your cloud-stored images and monitor usage.</p>
        </div>
        <button onClick={fetchMediaData} className="btn-secondary" disabled={loading}>
          {loading ? <><FaSpinner className="animate-spin mr-2" /> Refreshing...</> : <><FaSync className="mr-2" /> Refresh</>}
        </button>
      </div>
      
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard 
                icon={<FaDatabase size={24}/>} 
                title="Storage Usage" 
                value={`${formatBytes(usage.storage.used)} / ${formatBytes(usage.storage.limit)}`} 
                progress={usage.storage.used_percent}
            />
            <StatCard 
                icon={<FaCloud size={24}/>} 
                title="Media Count"
                value={images.length.toString()}
                detail={`Displaying the latest ${images.length} assets`}
            />
            <StatCard 
                icon={<FaImages size={24}/>} 
                title="Transformations"
                value={`${usage.transformations.used} / ${usage.transformations.limit}`}
                progress={usage.transformations.used_percent}
            />
            <StatCard 
                icon={<FaDatabase size={24}/>} 
                title="Bandwidth Usage"
                value={`${formatBytes(usage.bandwidth.used)} / ${formatBytes(usage.bandwidth.limit)}`}
                progress={usage.bandwidth.used_percent}
            />
        </div>
      )}

      {selectedImages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center mb-6 sticky top-4 z-20 shadow-lg">
          <span className="font-semibold text-indigo-600">{selectedImages.length} image(s) selected</span>
          <div className="flex items-center">
            <button onClick={() => setSelectedImages([])} className="btn-secondary">Deselect All</button>
            <button onClick={handleBulkDelete} className="btn-delete ml-3">
                <FaTrash className="mr-2"/> Delete Selected
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md my-6">
            <div className="flex items-center">
                <FaExclamationTriangle className="mr-3"/>
                <div>
                    <p className="font-bold">An error occurred</p>
                    <p>{error}</p>
                </div>
            </div>
        </div>
      )}

      {loading && !images.length ? (
         <div className="text-center py-20">
            <FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto" />
            <p className="mt-4 text-gray-500">Loading your media library...</p>
        </div>
      ) : !loading && images.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <FaImages className="text-5xl text-gray-400 mx-auto"/>
            <h3 className="mt-6 text-xl font-semibold text-gray-800">Your Media Library is Empty</h3>
            <p className="mt-2 text-gray-500">Upload images via the product or event management pages.</p>
             <button onClick={fetchMediaData} className="btn-primary mt-6">Refresh Library</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
          {images.map(image => {
            const isSelected = selectedImages.includes(image.public_id);
            return (
              <div 
                key={image.public_id} 
                className={`group relative rounded-xl overflow-hidden shadow-sm cursor-pointer border-4 ${isSelected ? 'border-indigo-500' : 'border-transparent hover:border-indigo-300'}`}
                onClick={() => handleToggleSelect(image.public_id)}
              >
                <CldImage
                  src={image.public_id}
                  width={300}
                  height={300}
                  crop="fill"
                  gravity="auto"
                  alt={image.public_id}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                  {isSelected ? 
                    <FaCheckCircle className="text-indigo-500 bg-white rounded-full text-2xl shadow-md" /> :
                    <FaRegCircle className="text-gray-400 bg-white bg-opacity-70 rounded-full text-2xl" />
                  }
                </div>
                {isSelected && (
                     <div className="absolute top-2 right-2">
                        <FaCheckCircle className="text-indigo-500 bg-white rounded-full text-2xl shadow-md" />
                    </div>
                )}
                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-3 truncate">
                    <p className="font-mono text-xs truncate">{image.public_id.split('/').pop()}</p>
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
