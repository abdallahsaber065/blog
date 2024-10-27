import { useState } from 'react';
import toast from 'react-hot-toast';
import { Category } from '@prisma/client';
import { ClipLoader } from 'react-spinners';

interface CategoryListProps {
    categories: Category[];
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

    return (
        <ul>
            {categories.map(category => (
                <li key={category.id} className="flex justify-between items-center mb-2 text-dark dark:text-white">
                    <span>{category.name}</span>
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