// components/CustomImageUpload.tsx
import React, { useState } from 'react';
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
    console.log(src);
    console.log(alt);
    console.log(width);
    console.log(height);
    const [showSelector, setShowSelector] = useState(false);

    const handleImageSelect = (image: ImageProps) => {
        onImageChange(image);
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