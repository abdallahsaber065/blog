import React, { useState, useEffect, useRef, useCallback } from 'react';
import GithubSlugger from 'github-slugger';
import Link from 'next/link';
import { FiChevronRight, FiChevronDown, FiBookOpen, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface Heading {
    level: 'two' | 'three';
    text: string;
    slug: string;
    children?: Heading[];
}

interface TableOfContentProps {
    mdxContent: string;
}

export function generateTOC(content: string): Heading[] {
    const regex = /(?:^|\n)(#{1,6})\s+(.+)/g;
    content = content.replace(/```[\s\S]*?```/g, '');
    const slugger = new GithubSlugger();

    // Parse all headings, skip H1
    const allHeadings = Array.from(content.matchAll(regex))
        .map((match) => {
            const [, flag, text] = match;
            const level = flag.length;
            return { level, text: text || '', slug: text ? slugger.slug(text.trim()) : '' };
        })
        .filter(h => h.level >= 2 && h.level <= 3); // Only H2 and H3

    // Build nested: H2 are parents, H3 are children
    const result: Heading[] = [];
    let currentH2: Heading | null = null;

    allHeadings.forEach((h) => {
        if (h.level === 2) {
            currentH2 = {
                level: 'two',
                text: h.text,
                slug: h.slug,
                children: [],
            };
            result.push(currentH2);
        } else if (h.level === 3) {
            const child: Heading = {
                level: 'three',
                text: h.text,
                slug: h.slug,
            };
            if (currentH2) {
                currentH2.children!.push(child);
            } else {
                // Orphan H3 before any H2 — treat as top-level
                result.push(child);
            }
        }
    });

    return result;
}

// Flatten to ordered list of all slugs
function flattenSlugs(headings: Heading[]): string[] {
    const result: string[] = [];
    headings.forEach(h => {
        result.push(h.slug);
        if (h.children) h.children.forEach(c => result.push(c.slug));
    });
    return result;
}

// Find which H2 slug is the parent of a given slug (or the slug itself if it's H2)
function findParentH2(toc: Heading[], slug: string): string | null {
    for (const h of toc) {
        if (h.slug === slug) return h.slug;
        if (h.children) {
            for (const c of h.children) {
                if (c.slug === slug) return h.slug;
            }
        }
    }
    return null;
}

const TableOfContent: React.FC<TableOfContentProps> = ({ mdxContent: content }) => {
    const toc = generateTOC(content);
    const allSlugs = flattenSlugs(toc);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [readSections, setReadSections] = useState<Set<string>>(new Set());
    const [isOpen, setIsOpen] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [expandedH2, setExpandedH2] = useState<string | null>(null);

    const tocListRef = useRef<HTMLDivElement>(null);
    const isClickScrolling = useRef(false);

    const totalCount = allSlugs.length;
    const readCount = readSections.size;

    // ── Scroll progress (synced to page position) ────────────────────────────
    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Active heading detection (upper-half of viewport) ────────────────────
    useEffect(() => {
        if (allSlugs.length === 0) return;

        const getActiveHeading = (): string | null => {
            const scrollY = window.scrollY;
            // The "active line" is at the top 40% of viewport
            const activeLine = scrollY + window.innerHeight * 0.4;

            let active: string | null = null;
            for (const slug of allSlugs) {
                const el = document.getElementById(slug);
                if (!el) continue;
                const elTop = el.getBoundingClientRect().top + scrollY;
                if (elTop <= activeLine) {
                    active = slug;
                } else {
                    break;
                }
            }
            return active;
        };

        const onScroll = () => {
            if (isClickScrolling.current) return;
            const id = getActiveHeading();
            if (id !== null && id !== activeId) {
                setActiveId(id);
                setReadSections(prev => new Set(prev).add(id));
                // Auto-expand the parent H2 of the active heading
                const parentH2 = findParentH2(toc, id);
                if (parentH2) setExpandedH2(parentH2);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        // Run once on mount to set initial active
        const initialTimeout = setTimeout(onScroll, 100);
        return () => {
            window.removeEventListener('scroll', onScroll);
            clearTimeout(initialTimeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, activeId, toc]);

    // ── Auto-scroll TOC to keep active item visible ──────────────────────────
    useEffect(() => {
        if (!activeId || !tocListRef.current) return;

        // Small delay to let AnimatePresence finish expanding
        const timeout = setTimeout(() => {
            if (!tocListRef.current) return;
            const activeEl = tocListRef.current.querySelector(
                `[data-toc-slug="${activeId}"]`
            ) as HTMLElement | null;
            if (!activeEl) return;

            const container = tocListRef.current;
            const containerRect = container.getBoundingClientRect();
            const activeRect = activeEl.getBoundingClientRect();

            // Check if the element is outside the visible area of the container
            const isAbove = activeRect.top < containerRect.top;
            const isBelow = activeRect.bottom > containerRect.bottom;

            if (isAbove || isBelow) {
                // Scroll so the active element is roughly centered
                const scrollTarget =
                    activeEl.offsetTop -
                    container.clientHeight / 2 +
                    activeEl.offsetHeight / 2;
                container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
            }
        }, 80);

        return () => clearTimeout(timeout);
    }, [activeId, expandedH2]);

    // ── Manual collapse toggle ───────────────────────────────────────────────
    const toggleCollapse = useCallback((slug: string) => {
        setExpandedH2(prev => (prev === slug ? null : slug));
    }, []);

    // ── Click to scroll ──────────────────────────────────────────────────────
    const handleHeadingClick = useCallback((slug: string) => {
        const target = document.getElementById(slug);
        if (!target) return;
        isClickScrolling.current = true;
        const offset = 90;
        window.scrollTo({
            top: target.getBoundingClientRect().top + window.pageYOffset - offset,
            behavior: 'smooth',
        });
        setActiveId(slug);
        setReadSections(prev => new Set(prev).add(slug));
        const parentH2 = findParentH2(toc, slug);
        if (parentH2) setExpandedH2(parentH2);
        setTimeout(() => { isClickScrolling.current = false; }, 700);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toc]);

    if (toc.length === 0) return null;

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-[88px] max-h-[calc(100vh-100px)] flex flex-col">
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg bg-white dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col min-h-0">

                    {/* ── Header ─────────────────────────────────────────── */}
                    <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-gold/10 to-goldLight/10 dark:from-slate-800 dark:to-slate-900 flex-shrink-0">
                        <button
                            onClick={() => setIsOpen(o => !o)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        >
                            <div className="flex items-center gap-3">
                                <FiBookOpen className="w-5 h-5 text-gold dark:text-goldLight" />
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    Table of Contents
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                                    {readCount}/{totalCount}
                                </span>
                                <motion.span
                                    animate={{ rotate: isOpen ? 0 : -90 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ display: 'inline-flex' }}
                                >
                                    <FiChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                </motion.span>
                            </div>
                        </button>

                        {/* Scroll position progress bar */}
                        <div className="h-1 bg-slate-200 dark:bg-slate-700">
                            <motion.div
                                className="h-full bg-gradient-to-r from-gold to-goldLight"
                                animate={{ width: `${scrollProgress}%` }}
                                transition={{ ease: 'easeOut', duration: 0.1 }}
                            />
                        </div>
                    </div>

                    {/* ── Content list ───────────────────────────────────── */}
                    <AnimatePresence initial={false}>
                        {isOpen && (
                            <motion.div
                                key="toc-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden flex-1 min-h-0"
                            >
                                <div
                                    ref={tocListRef}
                                    className="overflow-y-auto px-3 py-4 custom-scrollbar max-h-[calc(100vh-220px)]"
                                >
                                    <ul className="space-y-1" dir="auto">
                                        {toc.map((heading) => {
                                            const isActive = activeId === heading.slug;
                                            const isRead = readSections.has(heading.slug);
                                            const hasChildren = !!(heading.children && heading.children.length > 0);
                                            const isExpanded = expandedH2 === heading.slug;

                                            // Check if any child is active (for parent highlight)
                                            const hasActiveChild = hasChildren && heading.children!.some(c => activeId === c.slug);

                                            return (
                                                <li key={heading.slug} data-toc-slug={heading.slug}>
                                                    <div className="flex items-start gap-2">
                                                        {/* Collapse toggle for H2s with children */}
                                                        {hasChildren && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleCollapse(heading.slug);
                                                                }}
                                                                className="mt-1.5 text-slate-400 hover:text-gold dark:hover:text-goldLight transition-colors flex-shrink-0"
                                                            >
                                                                <motion.span
                                                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                                    style={{ display: 'inline-flex' }}
                                                                >
                                                                    <FiChevronRight className="w-4 h-4" />
                                                                </motion.span>
                                                            </button>
                                                        )}

                                                        <Link
                                                            href={`#${heading.slug}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleHeadingClick(heading.slug);
                                                            }}
                                                            className={`
                                                                flex-1 py-1.5 px-3 rounded-lg transition-all duration-200 flex items-start gap-2
                                                                font-medium text-sm
                                                                ${(isActive || hasActiveChild)
                                                                    ? 'bg-gold/10 dark:bg-gold/10 text-gold dark:text-goldLight border-l-4 border-gold -ml-1 pl-4'
                                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                                                }
                                                                ${isRead && !isActive && !hasActiveChild ? 'opacity-60' : ''}
                                                            `}
                                                        >
                                                            <span className="flex-1 leading-snug break-words">
                                                                {heading.text}
                                                            </span>
                                                            {isRead && !isActive && (
                                                                <FiCheckCircle className="w-3.5 h-3.5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                            )}
                                                        </Link>
                                                    </div>

                                                    {/* H3 children — animated collapse */}
                                                    <AnimatePresence initial={false}>
                                                        {hasChildren && isExpanded && (
                                                            <motion.div
                                                                key="h3-children"
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.22, ease: 'easeInOut' }}
                                                                className="overflow-hidden mt-1"
                                                            >
                                                                <ul className="space-y-0.5 ml-6">
                                                                    {heading.children!.map((child) => {
                                                                        const childActive = activeId === child.slug;
                                                                        const childRead = readSections.has(child.slug);

                                                                        return (
                                                                            <li key={child.slug} data-toc-slug={child.slug}>
                                                                                <Link
                                                                                    href={`#${child.slug}`}
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        handleHeadingClick(child.slug);
                                                                                    }}
                                                                                    className={`
                                                                                        py-1.5 px-3 rounded-lg transition-all duration-200 flex items-start gap-2
                                                                                        text-sm
                                                                                        ${childActive
                                                                                            ? 'bg-gold/10 dark:bg-gold/10 text-gold dark:text-goldLight border-l-4 border-gold -ml-1 pl-4'
                                                                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                                                                        }
                                                                                        ${childRead && !childActive ? 'opacity-60' : ''}
                                                                                    `}
                                                                                >
                                                                                    {!childActive && (
                                                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 mt-2 flex-shrink-0" />
                                                                                    )}
                                                                                    <span className="flex-1 leading-snug break-words">
                                                                                        {child.text}
                                                                                    </span>
                                                                                    {childRead && !childActive && (
                                                                                        <FiCheckCircle className="w-3.5 h-3.5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                                                    )}
                                                                                </Link>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TableOfContent;