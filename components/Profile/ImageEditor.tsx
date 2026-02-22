import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FaTimes } from 'react-icons/fa';

type Area = { width: number; height: number; x: number; y: number };
import { getCroppedImg } from '@/lib/cropImage';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';

interface ImageEditorProps {
    imageSrc: string;
    onClose: () => void;
    onSave: (croppedImage: Blob) => void;
    isUploading?: boolean;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onClose, onSave, isUploading }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (croppedAreaPixels) {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            onSave(croppedImage);
        }
    };

    return (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 relative w-full max-w-xl shadow-elevated border border-lightBorder dark:border-darkBorder flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold font-display text-foreground">Adjust Profile Picture</h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-lightSurface dark:hover:bg-darkSurface"
                        disabled={isUploading}
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <div className="relative w-full h-[280px] bg-lightSurface dark:bg-darkSurface rounded-xl overflow-hidden border border-lightBorder dark:border-darkBorder">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground w-16">Zoom</span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-2 bg-lightBorder dark:bg-darkBorder rounded-lg appearance-none cursor-pointer accent-gold"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground w-16">Rotate</span>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="flex-1 h-2 bg-lightBorder dark:bg-darkBorder rounded-lg appearance-none cursor-pointer accent-gold"
                            disabled={isUploading}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-lightBorder dark:border-darkBorder gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isUploading}
                        className="h-11 px-6 border-lightBorder dark:border-darkBorder"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isUploading || !croppedAreaPixels}
                        className="h-11 px-6 bg-gradient-to-r from-gold to-goldDark hover:from-goldDark hover:to-gold text-dark shadow-gold transition-all duration-300 hover:shadow-gold-lg"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving & Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Save Profile Picture
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;