import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { FiUpload } from 'react-icons/fi';

interface ImageProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    width: number;
    height: number;
}

interface ImageSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (image: ImageProps) => void;
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
    const [selectedImageDetails, setSelectedImageDetails] = useState<ImageProps | null>(null);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-0 sm:px-2 ">
            <div className="bg-white dark:bg-dark w-full h-full sm:h-auto sm:rounded-lg sm:max-w-4xl sm:max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 px-2 pb-2 sm:px-4 sm:pb-4 overflow-y-auto">
                    <div className="sticky top-0 bg-white dark:bg-dark z-10 px-2 pb-2 pt-1 sm:px-4 sm:pb-4">
                        <h2 className="text-lg sm:text-xl font-bold mb-2 mt-2">Select Image</h2>

                        {/* Upload Controls */}
                        <div className="flex flex-col gap-2 mb-3">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm cursor-pointer flex-shrink-0"
                                >
                                    Upload Image
                                </label>

                                <div className="flex flex-1 gap-1">
                                    <input
                                        type="url"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        placeholder="Enter image URL"
                                        className="flex-1 border rounded px-2 py-1.5 text-sm"
                                    />
                                    <button
                                        onClick={handleUrlUpload}
                                        className="bg-green-500 text-white p-1.5 rounded flex items-center gap-1 text-sm"
                                        title="Upload from URL"
                                    >
                                        <FiUpload className="w-4 h-4" />
                                        <span className="hidden sm:inline">URL</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Image Grid */}
                    {loading ? (
                        <div className="flex justify-center p-2">
                            <ClipLoader size={24} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                            {images.map((image) => (
                                <div
                                    key={image.id}
                                    className={`cursor-pointer border rounded p-1 sm:p-2 ${
                                        selectedImage === image.file_url ? 'border-blue-500 ring-2 ring-blue-500' : ''
                                    }`}
                                    onClick={() => handleImageSelect(image)}
                                >
                                    <div className="relative flex items-center justify-center h-32 mb-2 sm:mb-4 overflow-hidden">
                                        <Image
                                            src={image.file_url}
                                            alt={image.file_name}
                                            layout="fill"
                                            objectFit="contain"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l p-2 sm:p-4 flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Selected Image</h3>
                    <div className="flex-1 overflow-y-auto">
                        {selectedImage ? (
                            <div>
                                <div className="relative aspect-square mb-2 sm:mb-4 overflow-hidden items-center justify-center hidden md:flex">
                                    <Image
                                        src={selectedImage}
                                        alt="Selected"
                                        layout="fill"
                                        objectFit="contain"
                                        className="h-full w-auto"
                                    />
                                </div>
                                <p className="text-xs sm:text-sm mb-2 sm:mb-4 break-all">{selectedImage.split("/").pop()}</p>
                                {selectedImageDetails && (
                                    <div className="text-xs sm:text-sm">
                                        <p>File Size: {(selectedImageDetails.file_size / 1024).toFixed(2)} KB</p>
                                        <p>Dim: {selectedImageDetails.width} x {selectedImageDetails.height}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm">No image selected</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2 sm:mt-4">
                        <button
                            onClick={() => {
                                if (selectedImageDetails) {
                                    onSelect(selectedImageDetails);
                                }
                                onClose();
                            }}
                            className="bg-green-500 text-white px-3 py-1.5 rounded flex-1 text-sm"
                            disabled={!selectedImage}
                        >
                            Select
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-500 text-white px-3 py-1.5 rounded flex-1 text-sm"
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