'''
'use client';

import { useState, useRef } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageUploader.css';

interface ImageUploaderProps {
    onUploadSuccess: (url: string, publicId: string) => void;
    aspectRatio?: number; // e.g., 16/9, 4/3, 1
    folder: string; // Folder to upload to in Cloudinary
    publicId?: string; // Optional public_id for overwriting
}

const ImageUploader = ({ onUploadSuccess, aspectRatio = 1, folder, publicId }: ImageUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result as string));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !imgRef.current || !crop || crop.width === 0 || crop.height === 0) return;

        setUploading(true);
        setUploadProgress(0);

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setUploading(false);
            alert('Could not get canvas context');
            return;
        }

        ctx.drawImage(
            imgRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(async (blob) => {
            if (!blob) {
                setUploading(false);
                alert('Could not create blob from canvas');
                return;
            }

            try {
                // 1. Get signature from our server
                const res = await fetch('/api/sign-cloudinary-params', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ folder, public_id: publicId }),
                });
                const { signature, timestamp, api_key } = await res.json();

                // 2. Upload to Cloudinary
                const formData = new FormData();
                formData.append('file', blob, file.name);
                formData.append('api_key', api_key);
                formData.append('folder', folder);
                formData.append('timestamp', timestamp.toString());
                formData.append('signature', signature);
                if (publicId) {
                    formData.append('public_id', publicId);
                }

                const xhr = new XMLHttpRequest();
                xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, true);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = (event.loaded / event.total) * 100;
                        setUploadProgress(percent);
                    }
                };

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        setUploading(false);
                        if (xhr.status === 200) {
                            const response = JSON.parse(xhr.responseText);
                            onUploadSuccess(response.secure_url, response.public_id);
                            resetUploader();
                        } else {
                            alert('Upload failed. Please try again.');
                            console.error(xhr.responseText);
                        }
                    }
                };

                xhr.send(formData);

            } catch (error) {
                setUploading(false);
                alert('An error occurred during upload.');
                console.error(error);
            }
        }, 'image/jpeg', 0.95);
    };

    const resetUploader = () => {
        setFile(null);
        setImgSrc('');
        setCrop(undefined);
        setUploading(false);
        setUploadProgress(0);
    };

    return (
        <div className="image-uploader-container">
            {!imgSrc && (
                <div className="uploader-start-zone">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Drag & Drop or Click to Select an Image</p>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>
            )}

            {imgSrc && (
                <div className="cropping-zone">
                    <ReactCrop 
                        crop={crop} 
                        onChange={c => setCrop(c)} 
                        aspect={aspectRatio}
                        minWidth={100}
                    >
                        <img ref={imgRef} src={imgSrc} alt="Source" />
                    </ReactCrop>
                </div>
            )}

            {uploading && (
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                        {Math.round(uploadProgress)}%
                    </div>
                </div>
            )}

            {imgSrc && !uploading && (
                <div className="action-buttons">
                    <button className="btn-outline" onClick={resetUploader}>Cancel</button>
                    <button className="btn-primary" onClick={handleUpload}>Upload Image</button>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
'''