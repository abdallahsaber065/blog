import { useState } from 'react';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { Tag } from '@prisma/client';

interface TagListProps {
    tags: (Tag & { postCount: number })[];
    refreshTags: () => void;
}

export default function TagList({ tags, refreshTags }: TagListProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [expandedTagId, setExpandedTagId] = useState<number | null>(null);
    const [tagPosts, setTagPosts] = useState<{ [key: number]: any[] }>({});

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

    const fetchTagPosts = async (tagId: number) => {
        if (tagPosts[tagId]) {
            setExpandedTagId(expandedTagId === tagId ? null : tagId);
            return;
        }

        try {
            const response = await fetch(`/api/posts?where=${JSON.stringify({ tags: { some: { id: tagId } } })}&select=${JSON.stringify({ id: true, title: true, slug: true })}`);
            const posts = await response.json();
            setTagPosts(prev => ({ ...prev, [tagId]: posts }));
            setExpandedTagId(tagId);
        } catch (error) {
            toast.error('Failed to fetch posts.');
        }
    };

    // Sort tags by postCount in descending order
    const sortedTags = [...tags].sort((a, b) => b.postCount - a.postCount);

    return (
        <ul>
            {sortedTags.map(tag => (
                <li key={tag.id} className="mb-2 text-dark dark:text-white">
                    <div className="flex justify-between items-center">
                        <span onClick={() => fetchTagPosts(tag.id)} className="cursor-pointer">
                            {tag.name} <span className="text-blue-500">({tag.postCount})</span>
                        </span>
                        <button
                            onClick={() => handleDelete(tag.id)}
                            className="text-red-500"
                            disabled={loadingId === tag.id}
                        >
                            {loadingId === tag.id ? <ClipLoader size={20} color="#f00" /> : 'Delete'}
                        </button>
                    </div>
                    {expandedTagId === tag.id && (
                        <ul className="mt-2 ml-4">
                            {tagPosts[tag.id]?.map(post => (
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