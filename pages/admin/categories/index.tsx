import { useState, useEffect } from 'react';
import TagList from '@/components/Admin/Categories/TagList';
import CategoryList from '@/components/Admin/Categories/CategoryList';
import TagForm from '@/components/Admin/Categories/TagForm';
import CategoryForm from '@/components/Admin/Categories/CategoryForm';
import { Tag, Category } from '@prisma/client';
import dotenv from 'dotenv';
import withAuth from '@/components/Admin/withAuth';
import { getSession } from 'next-auth/react';

dotenv.config();

const Dashboard: React.FC = () => {
    const [tagList, setTagList] = useState<(Tag & { postCount: number })[]>([]);
    const [categoryList, setCategoryList] = useState<(Category & { postCount: number })[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmType, setConfirmType] = useState<'tags' | 'categories' | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tags = await getTags();
                const categories = await getCategories();
                setTagList(tags);
                setCategoryList(categories);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, []);

    const refreshTags = async () => {
        try {
            const Tags = await getTags();
            setTagList(Tags);
        } catch (error) {
            console.error('Failed to refresh tags:', error);
        }
    };

    const refreshCategories = async () => {
        try {
            const Categories = await getCategories();
            setCategoryList(Categories);
        } catch (error) {
            console.error('Failed to refresh categories:', error);
        }
    };

    const handleDeleteZeroCount = async (type: 'tags' | 'categories') => {
        setShowConfirm(false);
        try {
            if (type === 'tags') {
                await fetch('/api/tags/delete-zero', { method: 'DELETE' });
                refreshTags();
            } else {
                await fetch('/api/categories/delete-zero', { method: 'DELETE' });
                refreshCategories();
            }
        } catch (error) {
            console.error(`Failed to delete ${type} with 0 posts:`, error);
        }
    };

    return (
        <div className="container mx-auto p-4 dark:bg-dark dark:text-white">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold">Tags</h2>
                        <button
                            onClick={() => { setShowConfirm(true); setConfirmType('tags'); }}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 active:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:active:bg-red-900"
                        >
                            Delete Tags with 0 Posts
                        </button>
                    </div>
                    <TagForm refreshTags={refreshTags} />
                    <TagList tags={tagList} refreshTags={refreshTags} />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold">Categories</h2>
                        <button
                            onClick={() => { setShowConfirm(true); setConfirmType('categories'); }}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 active:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:active:bg-red-900"
                        >
                            Delete Categories with 0 Posts
                        </button>
                    </div>
                    <CategoryForm refreshCategories={refreshCategories} />
                    <CategoryList categories={categoryList} refreshCategories={refreshCategories} />
                </div>
            </div>
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-dark p-4 rounded shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete all {confirmType} with 0 posts?</h3>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="bg-slate-500 text-white p-2 rounded mr-2 hover:bg-slate-600 active:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-800 dark:active:bg-slate-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteZeroCount(confirmType!)}
                                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 active:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:active:bg-red-900"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Get tags with post count
const getTags = async () => {
    try {
        console.log(process.env.NEXT_PUBLIC_BASE_URL);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tags?include={"_count":{"select":{"posts":true}}}`);
        if (!response.ok) {
            throw new Error('Failed to fetch tags');
        }
        let data = await response.json();
        data = (data.map((tag: any) => ({ ...tag, postCount: tag._count.posts })));
        return data;
    } catch (error) {
        console.error('Failed to get tags:', error);
        return [];
    }
}

// Get categories with post count
const getCategories = async () => {
    try {
        console.log(process.env.NEXT_PUBLIC_BASE_URL);
        const response = await fetch(`/api/categories?include={"_count":{"select":{"posts":true}}}`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        let data = await response.json();
        data = (data.map((category: any) => ({ ...category, postCount: category._count.posts })));
        return data;
    } catch (error) {
        console.error('Failed to get categories:', error);
        return [];
    }
};

export default withAuth(Dashboard, ['admin', 'moderator']);