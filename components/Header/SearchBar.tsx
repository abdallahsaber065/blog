// components/SearchBar.tsx
import React from 'react';
import { SearchIcon } from '@/components/Icons';

const SearchBar: React.FC<{ className?: string }> = ({ className = "" }) => {
    return (
        <div className={"relative flex items-center " + className}>
            {/* Full Search Bar for larger screens */}
            <input
                type="text"
                placeholder="Search..."
                className="input input-bordered w-full max-w-xs hidden lg:block text-slate-800 dark:text-light bg-light dark:bg-dark h-8 lg:h-10"
            />
            {/* Search Icon for mobile */}
            <button className="lg:hidden btn btn-ghost btn-circle p-0 m-0" aria-label="Search">
                <SearchIcon className="w-6 h-6 text-slate-800 dark:text-light" />
            </button>
        </div>
    );
};

export default SearchBar;