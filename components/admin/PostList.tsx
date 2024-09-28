// components/PostList.tsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';

interface Post {
    id: number;
    title: string;
}

interface PostListProps {
    posts: Post[];
    onSelectPost: (id: number) => void;
    onDeletePost: (id: number) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onSelectPost, onDeletePost }) => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-2">Posts</h2>
            <ul>
                {posts.map((post) => (
                    <li key={post.id} className="mb-2">
                        <button
                            className="text-blue-500"
                            onClick={() => onSelectPost(post.id)}
                        >
                            {post.title}
                        </button>
                        <button
                            className="text-red-500 ml-2"
                            onClick={() => onDeletePost(post.id)}
                        >
                            <FaTrash />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PostList;