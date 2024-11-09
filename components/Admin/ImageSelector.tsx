// components/Admin/ImageSelector/index.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface ImageSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
    currentImage?: string;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentImage
}) => {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(currentImage);
    const [selectedImageDetails, setSelectedImageDetails] = useState<any>(null);
    const { data: session } = useSession();
    const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_REMOTE_URL;

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/media');
            const imagesWithFullUrls = await Promise.all(response.data.map(async (image: any) => {
                const imageUrl = `${NEXT_PUBLIC_BASE_URL}/${image.file_url}`;
                const exists = await checkImageExists(imageUrl);
                return exists ? { ...image, file_url: imageUrl } : null;
            }));
            setImages(imagesWithFullUrls.filter(Boolean));
        } catch (error) {
            toast.error('Failed to fetch images');
        }
        setLoading(false);
    };

    const checkImageExists = async (url: string) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', session?.user?.id as string);
        formData.append('saveDir', 'blog');

        setUploadLoading(true);
        try {
            const response = await axios.post('/api/media/upload-image', formData);
            const mediaWithFullUrl = {
                ...response.data.media,
                file_url: `${NEXT_PUBLIC_BASE_URL}/${response.data.media.file_url}`
            };
            setImages([...images, mediaWithFullUrl]);
            setSelectedImage(mediaWithFullUrl.file_url);
            setSelectedImageDetails(mediaWithFullUrl);
        } catch (error) {
            toast.error('Failed to upload image');
        }
        setUploadLoading(false);
    };

    const handleUrlUpload = async () => {
        if (!urlInput) return;

        setUploadLoading(true);
        try {
            const response = await fetch(urlInput);
            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: blob.type });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', session?.user?.id as string);
            formData.append('saveDir', 'blog');

            const uploadResponse = await axios.post('/api/media/upload-image', formData);
            const mediaWithFullUrl = {
                ...uploadResponse.data.media,
                file_url: `${NEXT_PUBLIC_BASE_URL}/${uploadResponse.data.media.file_url}`
            };
            setImages([...images, mediaWithFullUrl]);
            setSelectedImage(mediaWithFullUrl.file_url);
            setSelectedImageDetails(mediaWithFullUrl);
            setUrlInput('');
        } catch (error) {
            toast.error('Failed to upload image from URL');
        }
        setUploadLoading(false);
    };

    const handleImageSelect = (image: any) => {
        setSelectedImage(image.file_url);
        setSelectedImageDetails(image);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-dark rounded-lg w-full max-w-4xl h-4/5 flex flex-col md:flex-row">
                {/* Main Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-2">Select Image</h2>

                        {/* Upload Controls */}
                        <div className="flex flex-col md:flex-row gap-2 mb-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
                            >
                                Upload Image
                            </label>

                            <div className="flex-1 flex gap-2">
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="Enter image URL"
                                    className="flex-1 border rounded px-2"
                                />
                                <button
                                    onClick={handleUrlUpload}
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Add URL
                                </button>
                            </div>
                        </div>

                        {/* Image Grid */}
                        {loading ? (
                            <div className="flex justify-center">
                                <ClipLoader />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((image) => (
                                    <div
                                        key={image.id}
                                        className={`cursor-pointer border rounded p-2 ${selectedImage === image.file_url ? 'border-blue-500' : ''
                                            }`}
                                        onClick={() => handleImageSelect(image)}
                                    >
                                        <Image
                                            src={image.file_url}
                                            alt={image.file_name}
                                            width={200}
                                            height={200}
                                            objectFit="contain"
                                            className="mt-2 max-h-40 object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l p-4">
                    <h3 className="text-lg font-bold mb-4">Selected Image</h3>
                    {selectedImage ? (
                        <div>
                            <div className="relative w-full h-44 mb-4"> {/* Added mb-4 for margin-bottom */}
                                <Image
                                    src={selectedImage}
                                    alt="Selected"
                                    layout="fill"
                                    objectFit="contain"
                                    className="mt-2"
                                />
                            </div>
                            <p className="text-sm mb-4 break-all">{selectedImage.split("/").pop()}</p>
                            {selectedImageDetails && (
                                <div className="text-sm">
                                    <p>File Size: {(selectedImageDetails.file_size / 1024).toFixed(2)} KB</p>
                                    <p>Dimensions: {selectedImageDetails.width} x {selectedImageDetails.height}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>No image selected</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => {
                                onSelect(selectedImage || '');
                                onClose();
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded flex-1"
                            disabled={!selectedImage}
                        >
                            Select
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageSelector;