// components/SearchBar.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SearchIcon, CloseIcon } from '@/components/Icons';

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
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleOverlayOpen = () => {
        setIsOverlayVisible(true);
    };

    const handleOverlayClose = () => {
        setIsOverlayVisible(false);
        setQuery("");
        setResults([]);
    };

    useEffect(() => {
        if (isOverlayVisible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOverlayVisible]);

    const handleResultClick = () => {
        handleOverlayClose();
    };

    return (
        <>
            <div className={"relative flex items-center " + className}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={handleChange}
                    className="input input-bordered w-full max-w-xs hidden lg:block text-slate-800 dark:text-light bg-light dark:bg-dark h-8 lg:h-10"
                />
                <button className="lg:hidden btn btn-ghost btn-circle p-0 m-0" aria-label="Search" onClick={handleOverlayOpen}>
                    <SearchIcon className="w-6 h-6 text-slate-800 dark:text-light" />
                </button>
                {!isOverlayVisible && results.length > 0 && (
                    <ul className="absolute top-full mt-2 w-full bg-white dark:bg-dark shadow-lg rounded-lg z-10 shadow-slate-300 dark:shadow-slate-800">
                        {results.map((result) => (
                            <li key={result.id} className="flex items-center p-2 border-b border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-emerald-900">
                                <Link href={`/blogs/${result.slug}`} className="flex items-center w-full" onClick={handleResultClick}>
                                    <Image src={result.featured_image_url} alt={result.title} width={40} height={40} className="object-cover rounded-full mr-2" />
                                    <span className="text-slate-800 dark:text-light">{result.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {isOverlayVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16">
                    <div className="bg-white dark:bg-dark p-4 rounded-lg w-full max-w-md mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={query}
                                onChange={handleChange}
                                ref={inputRef}
                                className="input input-bordered w-full text-slate-800 dark:text-light bg-light dark:bg-dark h-10"
                            />
                            <button className="btn btn-ghost btn-circle p-0 m-0 ml-2" aria-label="Close" onClick={handleOverlayClose}>
                                <CloseIcon className="w-6 h-6 text-slate-800 dark:text-light" />
                            </button>
                        </div>
                        {results.length > 0 && (
                            <ul className="bg-white dark:bg-dark shadow-lg rounded-lg z-10 shadow-slate-300 dark:shadow-slate-800">
                                {results.map((result) => (
                                    <li key={result.id} className="flex items-center p-2 border-b border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-emerald-900">
                                        <Link href={`/blogs/${result.slug}`} className="flex items-center w-full" onClick={handleResultClick}>
                                            <Image src={result.featured_image_url} alt={result.title} width={40} height={40} className="object-cover rounded-full mr-2" />
                                            <span className="text-slate-800 dark:text-light">{result.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default SearchBar;