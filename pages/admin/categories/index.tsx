import CategoryForm from '@/components/Admin/Categories/CategoryForm';
import CategoryList from '@/components/Admin/Categories/CategoryList';
import TagForm from '@/components/Admin/Categories/TagForm';
import TagList from '@/components/Admin/Categories/TagList';
import withAuth from '@/components/Admin/withAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Category, Tag } from '@prisma/client';
import dotenv from 'dotenv';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        Categories & Tags Dashboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Tags Section */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Tags</h2>
                                <Button
                                    onClick={() => { setShowConfirm(true); setConfirmType('tags'); }}
                                    variant="destructive"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete <span className="font-bold ml-1">0</span> Count Tags
                                </Button>
                            </div>
                            <TagForm refreshTags={refreshTags} />
                            <TagList tags={tagList} refreshTags={refreshTags} />
                        </div>

                        {/* Categories Section */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Categories</h2>
                                <Button
                                    onClick={() => { setShowConfirm(true); setConfirmType('categories'); }}
                                    variant="destructive"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete <span className="font-bold ml-1">0</span> Count Categories
                                </Button>
                            </div>
                            <CategoryForm refreshCategories={refreshCategories} />
                            <CategoryList categories={categoryList} refreshCategories={refreshCategories} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete all {confirmType} with 0 posts? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirm(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleDeleteZeroCount(confirmType!)}
                        >
                            Confirm Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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