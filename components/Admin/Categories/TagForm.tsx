import { useState } from 'react';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { slug as slugger } from 'github-slugger';

interface TagFormProps {
    refreshTags: () => void;
}

export default function TagForm({ refreshTags }: TagFormProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.dismiss();
            toast.error('Name is required for tag.');
            return;
        }

        setLoading(true);
        const newSlug = slugger(name);
        try {
            await fetch('/api/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, slug: newSlug }),
            });
            setName('');
            refreshTags();
            toast.dismiss();
            toast.success('Tag added successfully!');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to add tag.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-2 mb-2 w-full dark:bg-dark dark:text-white dark:border-gray-700 dark:placeholder-gray-400 dark:hover:bg-gray-800 dark:focus:bg-gray-900 dark:active:bg-gray-900 hover:bg-gray-100 focus:bg-gray-200 active:bg-gray-200"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 w-full hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:active:bg-blue-900">
                {loading ? <ClipLoader size={20} color="#fff" /> : 'Add Tag'}
            </button>
        </form>
    );
}