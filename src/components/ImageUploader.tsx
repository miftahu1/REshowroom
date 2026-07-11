'use client';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import { useState, useEffect } from 'react';
import { FaImage } from 'react-icons/fa';

interface ImageUploaderProps {
  onUploadSuccess: (result: any) => void;
  initialValue?: string; // The public ID of the image
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadSuccess, initialValue }) => {
  const [publicId, setPublicId] = useState(initialValue || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [eta, setEta] = useState(0);

  useEffect(() => {
    if (initialValue) {
      setPublicId(initialValue);
    }
  }, [initialValue]);

  const handleUpload = (result: any, widget: any) => {
    if (result.event === 'success') {
      setPublicId(result.info.public_id);
      onUploadSuccess(result.info);
      setIsUploading(false);
      setUploadProgress(0);
    } else if (result.event === 'upload-progress') {
        const progress = Math.round((result.info.bytes_uploaded / result.info.bytes_total) * 100);
        setUploadProgress(progress);

        if (isUploading) {
            const currentTime = Date.now();
            const timeElapsed = (currentTime - startTime) / 1000; // in seconds
            const uploadSpeed = result.info.bytes_uploaded / timeElapsed; // bytes per second
            const bytesRemaining = result.info.bytes_total - result.info.bytes_uploaded;
            const estimatedTimeRemaining = bytesRemaining / uploadSpeed; // in seconds
            setEta(estimatedTimeRemaining);
        }
    }
  };

  return (
    <CldUploadWidget
      signatureEndpoint="/api/sign-cloudinary-params"
      options={{
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'ml_default', 
        sources: ['local', 'url', 'camera', 'image_search'],
        cropping: true,
        croppingAspectRatio: 1.5,
        showAdvancedOptions: true,
        multiple: false,
      }}
      onSuccess={handleUpload}
      onUploadAdded={() => {
          setIsUploading(true);
          setStartTime(Date.now());
      }}
    >
      {({ open }) => (
        <div className="image-uploader-container">
          {publicId ? (
            <div className="image-preview-container">
                <CldImage
                    width="400"
                    height="266"
                    src={publicId}
                    alt="Uploaded Image"
                    className="rounded-lg shadow-md"
                />
                <button onClick={() => open()} className="btn-outline mt-2">Change Image</button>
            </div>
          ) : (
            <div 
              className="upload-placeholder"
              onClick={() => open()}
            >
              <FaImage className="text-4xl text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Drag & drop or click to upload</span>
            </div>
          )}
          {isUploading && (
            <div className="upload-progress-container mt-2">
              <div className="progress-bar-background">
                <div className="progress-bar-foreground" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <div className="progress-text">
                  <span>Uploading: {uploadProgress}%</span>
                  {eta > 5 && <span>ETA: {Math.round(eta)}s</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};


export const CLImage: React.FC<{ publicId: string, className?: string, alt: string }> = ({ publicId, className, alt }) => {
    return (
        <CldImage
            width="400"
            height="266"
            src={publicId}
            alt={alt}
            className={className}
        />
    )
}
