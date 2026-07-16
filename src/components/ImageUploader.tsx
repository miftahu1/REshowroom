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
    const [error, setError] = useState('');
    const imgRef = useRef<HTMLImageElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result as string));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !imgRef.current || !crop || crop.width === 0 || crop.height === 0) {
            setError('Please select an image and crop a portion to upload.');
            return;
        }
        setError('');
        setUploading(true);
        setUploadProgress(0);

        // Create a canvas to draw the cropped image
        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setUploading(false);
            setError('Could not get canvas context to crop the image.');
            return;
        }

        ctx.drawImage(
            imgRef.current,
            crop.x * scaleX, crop.y * scaleY,
            crop.width * scaleX, crop.height * scaleY,
            0, 0,
            canvas.width, canvas.height
        );

        canvas.toBlob(async (blob) => {
            if (!blob) {
                setUploading(false);
                setError('Could not convert the cropped image to a file.');
                return;
            }

            try {
                // 1. Prepare parameters for getting the signature
                const timestamp = Math.round((new Date()).getTime() / 1000);
                const paramsToSign: { [key: string]: string | undefined } = {
                    timestamp: timestamp.toString(),
                    folder: folder,
                };
                if (publicId) {
                    paramsToSign.public_id = publicId;
                    paramsToSign.overwrite = "true";
                }

                // 2. Get signature from our server
                const res = await fetch('/api/cloudinary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paramsToSign }),
                });
                const { signature } = await res.json();

                if (!res.ok || !signature) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to get a valid signature from the server.');
                }

                // 3. Upload to Cloudinary using the signature
                const formData = new FormData();
                formData.append('file', blob, file.name);
                formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string);
                
                // Append the exact same params that were sent to be signed
                Object.entries(paramsToSign).forEach(([key, value]) => {
                    formData.append(key, value as string);
                });
                
                formData.append('signature', signature);
                
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, true);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        setUploadProgress((event.loaded / event.total) * 100);
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
                            try {
                                const errorResponse = JSON.parse(xhr.responseText);
                                setError(`Upload failed: ${errorResponse.error.message}`)
                            } catch (e) {
                                setError('Upload failed. Please check the console for details.')
                            }
                            console.error('Cloudinary upload failed:', xhr.responseText);
                        }
                    }
                };

                xhr.send(formData);

            } catch (error) {
                setUploading(false);
                setError(error instanceof Error ? error.message : 'An unexpected error occurred during upload.');
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
        setError('');
        // Clear the file input
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if(input) input.value = '';
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
                    <p className="crop-instructions">Click and drag on the image to select the area you want to keep.</p>
                    <ReactCrop 
                        crop={crop} 
                        onChange={c => setCrop(c)} 
                        aspect={aspectRatio}
                        minWidth={100}
                    >
                        <img ref={imgRef} src={imgSrc} alt="Source" onLoad={(e) => {
                            // Set a default crop area
                            const { naturalWidth, naturalHeight } = e.currentTarget;
                            const newCrop: Crop = {
                                unit: '%',
                                width: 80,
                                height: (80 * (aspectRatio || 1) * naturalHeight) / naturalWidth,
                                x: 10,
                                y: 10
                            };
                            // Ensure calculated height is not > 100%
                            if(newCrop.height > 100) {
                                newCrop.height = 100;
                                newCrop.width = (100 * naturalWidth) / (naturalHeight * (aspectRatio || 1));
                            }
                            setCrop(newCrop);
                        }} />
                    </ReactCrop>
                </div>
            )}
            
            {error && <p className="error-message" style={{marginTop: '15px'}}>{error}</p>}

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