import { useState } from 'react';
import TagList from '@/components/Admin/Categories/TagList';
import CategoryList from '@/components/Admin/Categories/CategoryList';
import TagForm from '@/components/Admin/Categories/TagForm';
import CategoryForm from '@/components/Admin/Categories/CategoryForm';
import { Tag, Category } from '@prisma/client';

interface DashboardProps {
    tags: Tag[];
    categories: Category[];
}

export default function Dashboard({ tags, categories }: DashboardProps) {
    const [tagList, setTagList] = useState(tags);
    const [categoryList, setCategoryList] = useState(categories);

    const refreshTags = async () => {
        const response = await fetch('/api/tags');
        const data = await response.json();
        setTagList(data);
    };

    const refreshCategories = async () => {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategoryList(data);
    };

    return (
        <div className="container mx-auto p-4 dark:bg-dark dark:text-white">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Tags</h2>
                    <TagForm refreshTags={refreshTags} />
                    <TagList tags={tagList} refreshTags={refreshTags} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">Categories</h2>
                    <CategoryForm refreshCategories={refreshCategories} />
                    <CategoryList categories={categoryList} refreshCategories={refreshCategories} />
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const tagResponse = await fetch(`${baseUrl}/api/tags`);
    const tags = await tagResponse.json();
    const categoryResponse = await fetch(`${baseUrl}/api/categories`);
    const categories = await categoryResponse.json();

    return {
        props: {
            tags,
            categories,
        },
    };
}