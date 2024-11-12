import { useState } from 'react';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { slug as slugger } from 'github-slugger';

interface CategoryFormProps {
    refreshCategories: () => void;
}

export default function CategoryForm({ refreshCategories }: CategoryFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.dismiss();
            toast.error('Name is required for category.');
            return;
        }

        setLoading(true);
        const newSlug = slugger(name);
        try {
            await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, slug: newSlug, description }),
            });
            setName('');
            setDescription('');
            refreshCategories();
            toast.dismiss();
            toast.success('Category added successfully!');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to add category.');
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
                className="border p-2 mb-2 w-full dark:bg-dark dark:text-white dark:border-slate-700 dark:placeholder-slate-400 dark:hover:bg-slate-800 dark:focus:bg-slate-900 dark:active:bg-slate-900 hover:bg-slate-100 focus:bg-slate-200 active:bg-slate-200"
            />
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 mb-2 w-full dark:bg-dark dark:text-white dark:border-slate-700 dark:placeholder-slate-400 dark:hover:bg-slate-800 dark:focus:bg-slate-900 dark:active:bg-slate-900 hover:bg-slate-100 focus:bg-slate-200 active:bg-slate-200"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 w-full hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:active:bg-blue-900">
                {loading ? <ClipLoader size={20} color="#fff" /> : 'Add Category'}
            </button>
        </form>
    );
}