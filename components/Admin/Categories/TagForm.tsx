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
            const res = await fetch('/api/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, slug: newSlug }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.dismiss();
                toast.error(data.error || 'Failed to add tag.');
                return;
            }
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
                className="border p-2 mb-2 w-full dark:bg-dark dark:text-white dark:border-slate-700 dark:placeholder-slate-400 dark:hover:bg-slate-800 dark:focus:bg-slate-900 dark:active:bg-slate-900 hover:bg-slate-100 focus:bg-slate-200 active:bg-slate-200"
            />
            <button type="submit" className="bg-gold hover:bg-goldDark text-slate-900 p-2 w-full active:opacity-75 dark:bg-gold dark:hover:bg-goldDark dark:active:opacity-75 transition-all duration-200 font-semibold shadow-sm">
                {loading ? <ClipLoader size={20} color="#fff" /> : 'Add Tag'}
            </button>
        </form>
    );
}