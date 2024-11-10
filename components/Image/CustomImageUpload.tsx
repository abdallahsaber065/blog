// components/CustomImageUpload.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import ImageSelector from '../Admin/ImageSelector';

interface CustomImageUploadProps {
    src: string;
    alt: string;
    onImageChange: (newSrc: string) => void;
    width?: number;
    height?: number;
}

const CustomImageUpload: React.FC<CustomImageUploadProps> = ({ src, alt, onImageChange, width = 800, height = 600 }) => {
    const [showSelector, setShowSelector] = useState(false);

    const handleImageSelect = (newSrc: string) => {
        onImageChange(newSrc);
        setShowSelector(false);
    };

    return (
        <div className="relative group">
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setShowSelector(true)}
                    className="btn btn-primary"
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