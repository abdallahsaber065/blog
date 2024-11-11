// components/CustomImageUpload.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageSelector from '../Admin/ImageSelector';

interface ImageProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    width: number;
    height: number;
}

interface CustomImageUploadProps {
    src: string;
    alt: string;
    id: string;
    onImageChange: (image: ImageProps) => void;
    width?: number;
    height?: number;
}

const CustomImageUpload: React.FC<CustomImageUploadProps> = ({ src, alt, onImageChange, width = 800, height = 600 }) => {
    const [showSelector, setShowSelector] = useState(false);

    useEffect(() => {
        if (showSelector) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showSelector]);

    const handleImageSelect = (image: ImageProps) => {
        onImageChange(image);
        setShowSelector(false);
    };

    return (
        <div className="relative group touch-none">
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="object-cover"
            />
            <div
                onClick={() => setShowSelector(true)}
                className="absolute inset-0 bg-black bg-opacity-20 lg:bg-opacity-0 lg:group-hover:bg-opacity-50 flex items-center justify-center cursor-pointer transition-opacity"
            >
                <span className="text-white text-center lg:hidden">
                    Click to change
                </span>
                <button
                    className="btn btn-primary z-10 px-4 py-2 text-sm md:text-base hidden lg:group-hover:block"
                >
                    Change Image
                </button>
            </div>
            {showSelector && (
                <ImageSelector
                    isOpen={showSelector}
                    onClose={() => setShowSelector(false)}
                    onSelect={handleImageSelect}
                    currentImage={src}
                />
            )}
        </div>
    );
};

export default CustomImageUpload;