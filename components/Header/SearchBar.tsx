// components/SearchBar.tsx
import React from 'react';
import { SearchIcon } from '@/components/Icons';

const SearchBar: React.FC = () => {
    return (
        <div className="relative">
            {/* Full Search Bar for larger screens */}
            <input
                type="text"
                placeholder="Search..."
                className="input input-bordered w-full max-w-xs hidden lg:block text-slate-800 dark:text-light bg-light dark:bg-dark h-8 lg:h-10"
            />
            {/* Search Icon for mobile */}
            <button className="lg:hidden btn btn-ghost btn-circle" aria-label="Search">
                <SearchIcon className="w-6 h-6 text-slate-800 dark:text-light bg-light dark:bg-dark" />
            </button>
        </div>
    );
};

export default SearchBar;