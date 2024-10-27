import { useState } from 'react';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { Category } from '@prisma/client';

interface CategoryListProps {
    categories: (Category & { postCount: number })[];
    refreshCategories: () => void;
}

export default function CategoryList({ categories, refreshCategories }: CategoryListProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        setLoadingId(id);
        toast.dismiss();
        try {
            await fetch(`/api/categories?id=${id}`, {
                method: 'DELETE',
            });
            refreshCategories();
            toast.success('Category deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete category.');
        } finally {
            setLoadingId(null);
        }
    };

    // Sort categories by postCount in descending order
    const sortedCategories = [...categories].sort((a, b) => b.postCount - a.postCount);

    return (
        <ul>
            {sortedCategories.map(category => (
                <li key={category.id} className="flex justify-between items-center mb-2 text-dark dark:text-white">
                    <span>{category.name} <span className="text-blue-500">({category.postCount})</span></span>
                    <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-500"
                        disabled={loadingId === category.id}
                    >
                        {loadingId === category.id ? <ClipLoader size={20} color="#f00" /> : 'Delete'}
                    </button>
                </li>
            ))}
        </ul>
    );
}