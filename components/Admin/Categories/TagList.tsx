import { useState } from 'react';
import toast from 'react-hot-toast';
import { Tag } from '@prisma/client';
import { ClipLoader } from 'react-spinners';

interface TagListProps {
    tags: Tag[];
    refreshTags: () => void;
}

export default function TagList({ tags, refreshTags }: TagListProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        setLoadingId(id);
        toast.dismiss();
        try {
            await fetch(`/api/tags?id=${id}`, {
                method: 'DELETE',
            });
            refreshTags();
            toast.success('Tag deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete tag.');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <ul>
            {tags.map(tag => (
                <li key={tag.id} className="flex justify-between items-center mb-2 text-dark dark:text-white">
                    <span>{tag.name}</span>
                    <button
                        onClick={() => handleDelete(tag.id)}
                        className="text-red-500"
                        disabled={loadingId === tag.id}
                    >
                        {loadingId === tag.id ? <ClipLoader size={20} color="#f00" /> : 'Delete'}
                    </button>
                </li>
            ))}
        </ul>
    );
}