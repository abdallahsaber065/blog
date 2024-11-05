import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ImageUploadPopupProps {
    onUpload: (file: File) => Promise<void>;
    onClose: () => void;
}

const ImageUploadPopup = ({ onUpload, onClose }: ImageUploadPopupProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setPreviewImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error('Please select a file to upload.');
            return;
        }

        await onUpload(selectedFile);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-light">Upload New Profile Image</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    {previewImage && <Image src={previewImage} alt="Preview" className="w-24 h-24 rounded-full mx-auto" width={96} height={96} />}
                    {previewImage && <Image src={previewImage} alt="Preview" className="w-24 h-24 rounded-full mx-auto" width={96} height={96} />}
                    <button type="submit" className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-primary">
                        Upload
                    </button>
                    <button type="button" onClick={onClose} className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-secondary">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ImageUploadPopup;