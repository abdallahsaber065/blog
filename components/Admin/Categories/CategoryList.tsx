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
    const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
    const [categoryPosts, setCategoryPosts] = useState<{ [key: number]: any[] }>({});

    const handleDelete = async (id: number) => {
        setLoadingId(id);
        toast.dismiss();
        try {
            const response = await fetch(`/api/categories?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.status.toString().startsWith('2')) {
                const errorResponse = await response.json();
                toast.error(errorResponse.error || 'Failed to delete category.');
                return;
            }

            refreshCategories();
            toast.success('Category deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete category.');
        } finally {
            setLoadingId(null);
        }
    };

    const fetchCategoryPosts = async (categoryId: number) => {
        if (categoryPosts[categoryId]) {
            setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
            return;
        }

        try {
            const response = await fetch(`/api/posts?where=${JSON.stringify({ category_id: categoryId })}&select=${JSON.stringify({ id: true, title: true, slug: true })}`);
            const posts = await response.json();
            setCategoryPosts(prev => ({ ...prev, [categoryId]: posts }));
            setExpandedCategoryId(categoryId);
        } catch (error) {
            toast.error('Failed to fetch posts.');
        }
    };

    // Sort categories by postCount in descending order
    const sortedCategories = [...categories].sort((a, b) => b.postCount - a.postCount);

    return (
        <ul>
            {sortedCategories.map(category => (
                <li key={category.id} className="mb-2 text-dark dark:text-white">
                    <div className="flex justify-between items-center">
                        <span onClick={() => fetchCategoryPosts(category.id)} className="cursor-pointer">
                            {category.name} <span className="text-blue-500">({category.postCount})</span>
                        </span>
                        <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-500"
                            disabled={loadingId === category.id}
                        >
                            {loadingId === category.id ? <ClipLoader size={20} color="#f00" /> : 'Delete'}
                        </button>
                    </div>
                    {expandedCategoryId === category.id && (
                        <ul className="mt-2 ml-4">
                            {categoryPosts[category.id]?.map(post => (
                                <li key={post.id} className="truncate">
                                    <a href={`/blogs/${post.slug}`} className="text-blue-500 hover:underline">
                                        {post.title.length > 50 ? `${post.title.substring(0, 50)}...` : post.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    );
}