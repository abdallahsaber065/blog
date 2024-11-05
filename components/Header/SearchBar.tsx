// components/SearchBar.tsx
import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { SearchIcon } from '@/components/Icons';

export function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

const SearchBar: React.FC<{ className?: string }> = ({ className = "" }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = useCallback(
        debounce(async (searchQuery: string) => {
            if (searchQuery.trim() === "") {
                setResults([]);
                return;
            }
            try {
                const response = await fetch(`/api/search?query=${searchQuery}`);
                const data = await response.json();
                setResults(data.slice(0, 4)); // Limit to 4 results
            } catch (error) {
                console.error("Search error:", error);
            }
        }, 300),
        []
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setQuery(value);
        handleSearch(value);
    };

    return (
        <div className={"relative flex items-center " + className}>
            <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={handleChange}
                className="input input-bordered w-full max-w-xs hidden lg:block text-slate-800 dark:text-light bg-light dark:bg-dark h-8 lg:h-10"
            />
            <button className="lg:hidden btn btn-ghost btn-circle p-0 m-0" aria-label="Search">
                <SearchIcon className="w-6 h-6 text-slate-800 dark:text-light" />
            </button>
            {results.length > 0 && (
                <ul className="absolute top-full mt-2 w-full bg-white dark:bg-dark shadow-lg rounded-lg z-10  shadow-slate-300 dark:shadow-slate-800">
                    {results.map((result) => (
                        <li key={result.id} className="flex items-center p-2 border-b border-slate-200 dark:border-slate-700">
                            <Image src={result.featured_image_url} alt={result.title} width={40} height={40} className="object-cover rounded-full mr-2" />
                            <span className="text-slate-800 dark:text-light">{result.title}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;