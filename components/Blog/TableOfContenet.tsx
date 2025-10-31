import React, { useState, useEffect, useRef } from 'react';
import GithubSlugger from 'github-slugger';
import Link from 'next/link';
import { FiChevronRight, FiChevronDown, FiBookOpen, FiCheckCircle } from 'react-icons/fi';

interface Heading {
    level: 'one' | 'two' | 'three';
    text: string;
    slug: string;
    children?: Heading[];
}

interface TableOfContentProps {
    mdxContent: string;
}

export function generateTOC(content: string): Heading[] {
    const regex = /(?:^|\n)(#{1,6})\s+(.+)/g;
    // remove code blocks from content before generating TOC
    content = content.replace(/```[\s\S]*?```/g, '');
    const slugger = new GithubSlugger();
    const headings = Array.from(content.matchAll(regex)).map((match) => {
        const [, flag, text] = match;

        return {
            level: (flag.length === 1 ? 'one' : flag.length === 2 ? 'two' : 'three') as 'one' | 'two' | 'three',
            text: text || '',
            slug: text ? slugger.slug(text) : '',
            children: [],
        };
    });

    // Create a nested structure
    const nestedHeadings: Heading[] = [];
    const stack: Heading[] = [];

    headings.forEach((heading) => {
        while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
            stack.pop();
        }

        if (stack.length === 0) {
            nestedHeadings.push(heading);
        } else {
            stack[stack.length - 1].children!.push(heading);
        }

        stack.push(heading);
    });

    return nestedHeadings;
}

// Flatten headings to get all slugs in order
function flattenHeadings(headings: Heading[]): string[] {
    const result: string[] = [];
    
    function traverse(items: Heading[]) {
        items.forEach(item => {
            result.push(item.slug);
            if (item.children && item.children.length > 0) {
                traverse(item.children);
            }
        });
    }
    
    traverse(headings);
    return result;
}

interface RenderTOCProps {
    headings: Heading[];
    collapsedState: { [key: string]: boolean };
    toggleCollapse: (slug: string) => void;
    activeId: string | null;
    readSections: Set<string>;
    onHeadingClick: (slug: string) => void;
}

const renderTOC = ({
    headings,
    collapsedState,
    toggleCollapse,
    activeId,
    readSections,
    onHeadingClick
}: RenderTOCProps) => {
    return (
        <ul className="space-y-1" dir="auto">
            {headings.map((heading) => {
                const isActive = activeId === heading.slug;
                const isRead = readSections.has(heading.slug);
                const hasChildren = heading.children && heading.children.length > 0;
                const isCollapsed = collapsedState[heading.slug];

                return (
                    <li key={`#${heading.slug}`} className="group">
                        <div className="flex items-start gap-2">
                            {/* Collapse toggle for headings with children */}
                            {hasChildren && heading.level === 'one' && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleCollapse(heading.slug);
                                    }}
                                    className="mt-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
                                >
                                    {isCollapsed ? (
                                        <FiChevronRight className="w-4 h-4" />
                                    ) : (
                                        <FiChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                            )}

                            <Link
                                href={`#${heading.slug}`}
                                data-level={heading.level}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onHeadingClick(heading.slug);
                                }}
                                className={`
                                    flex-1 py-1.5 px-3 rounded-lg transition-all duration-200 flex items-start gap-2
                                    ${heading.level === 'one' ? 'font-semibold text-base' : ''}
                                    ${heading.level === 'two' ? 'font-medium text-sm ml-4' : ''}
                                    ${heading.level === 'three' ? 'text-sm ml-8' : ''}
                                    ${isActive 
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500 -ml-1 pl-4' 
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                    }
                                    ${isRead && !isActive ? 'opacity-60' : ''}
                                `}
                            >
                                {/* Level indicator */}
                                {heading.level === 'three' && !isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 mt-2 flex-shrink-0" />
                                )}
                                
                                {/* Heading text */}
                                <span className="flex-1 leading-snug break-words">
                                    {heading.text}
                                </span>

                                {/* Read indicator */}
                                {isRead && !isActive && (
                                    <FiCheckCircle className="w-3.5 h-3.5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                )}
                            </Link>
                        </div>

                        {/* Render children */}
                        {hasChildren && !isCollapsed && (
                            <div className="mt-1">
                                {renderTOC({
                                    headings: heading.children!,
                                    collapsedState,
                                    toggleCollapse,
                                    activeId,
                                    readSections,
                                    onHeadingClick
                                })}
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

const TableOfContent: React.FC<TableOfContentProps> = ({ mdxContent: content }) => {
    const toc = generateTOC(content);
    const [collapsedState, setCollapsedState] = useState<{ [key: string]: boolean }>({});
    const [activeId, setActiveId] = useState<string | null>(null);
    const [readSections, setReadSections] = useState<Set<string>>(new Set());
    const [isOpen, setIsOpen] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const allSlugs = flattenHeadings(toc);

    // Track scroll progress
    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const totalScroll = documentHeight - windowHeight;
            const progress = (scrollTop / totalScroll) * 100;
            setScrollProgress(Math.min(progress, 100));
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Track active section and read sections using Intersection Observer
    useEffect(() => {
        const headingElements = allSlugs
            .map(slug => document.getElementById(slug))
            .filter((el): el is HTMLElement => el !== null);

        if (headingElements.length === 0) return;

        // Clean up previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const observerOptions = {
            rootMargin: '-80px 0px -80% 0px',
            threshold: 0,
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    setActiveId(id);
                    
                    // Mark as read when it becomes active
                    setReadSections(prev => new Set(prev).add(id));
                }
            });
        };

        observerRef.current = new IntersectionObserver(observerCallback, observerOptions);

        headingElements.forEach(element => {
            observerRef.current?.observe(element);
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [allSlugs]);

    const toggleCollapse = (slug: string) => {
        setCollapsedState(prevState => ({
            ...prevState,
            [slug]: !prevState[slug],
        }));
    };

    const handleHeadingClick = (slug: string) => {
        const target = document.getElementById(slug);
        if (target) {
            const offset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            setActiveId(slug);
            setReadSections(prev => new Set(prev).add(slug));
        }
    };

    const readCount = readSections.size;
    const totalCount = allSlugs.length;
    const readPercentage = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

    if (toc.length === 0) {
        return null;
    }

    return (
        <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-[88px] max-h-[calc(100vh-120px)] overflow-hidden">
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg bg-white dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FiBookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    Table of Contents
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 hidden sm:block">
                                    {readCount}/{totalCount}
                                </span>
                                {isOpen ? (
                                    <FiChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                ) : (
                                    <FiChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                )}
                            </div>
                        </button>

                        {/* Progress Bar */}
                        <div className="h-1 bg-slate-200 dark:bg-slate-700">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                                style={{ width: `${scrollProgress}%` }}
                            />
                        </div>

                        {/* Reading Progress */}
                        {isOpen && (
                            <div className="px-5 py-2 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-700">
                                <span className="text-slate-600 dark:text-slate-400">
                                    Reading Progress
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-300"
                                            style={{ width: `${readPercentage}%` }}
                                        />
                                    </div>
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                        {readPercentage}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    {isOpen && (
                        <div className="overflow-y-auto max-h-[calc(100vh-280px)] px-3 py-4 custom-scrollbar">
                            {renderTOC({
                                headings: toc,
                                collapsedState,
                                toggleCollapse,
                                activeId,
                                readSections,
                                onHeadingClick: handleHeadingClick
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TableOfContent;