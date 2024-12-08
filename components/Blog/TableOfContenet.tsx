import React, { useState } from 'react';
import GithubSlugger from 'github-slugger';
import Link from 'next/link';

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

const renderTOC = (
    headings: Heading[],
    collapsedState: { [key: string]: boolean },
    toggleCollapse: (slug: string) => void,
    highestLevel: 'one' | 'two' | 'three'
) => {
    return (
        <ul className="mt-4 font-in text-base mx-4 " dir="auto">
            {headings.map((heading) => (
                <li key={`#${heading.slug}`} className="py-1" >
                    <Link
                        href={`#${heading.slug}`}
                        data-level={heading.level}
                        className={`
                            ${heading.level === 'one' ? 'font-bold pl-0 pt-2 border-t border-solid' : ''}
                            ${heading.level === 'two' ? 'list-disc list-inside pl-2' : ''}
                            ${heading.level === 'three' ? 'pl-4 sm:pl-6' : ''}
                            flex items-center justify-start
                        `}
                        onClick={(e) => {
                            e.preventDefault();
                            if (heading.level === highestLevel && heading.children && heading.children.length > 0) {
                                toggleCollapse(heading.slug);
                            }
                            const target = document.getElementById(heading.slug);
                            if (target) {
                                const offset = 80; // Adjust this value based on your header height
                                const elementPosition = target.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - offset;

                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                    >
                        {heading.level === 'three' && (
                            <span className="flex w-1 h-1 rounded-full mr-2">&nbsp;</span>
                        )}
                        <span className="hover:underline">{heading.text}</span>
                        {heading.level === highestLevel && heading.children && heading.children.length > 0 && (
                            <span className="ml-2">
                                {collapsedState[heading.slug] ? '▶' : '▼'} {/* Simple arrow indicator */}
                            </span>
                        )}
                    </Link>
                    {heading.children && heading.children.length > 0 && !collapsedState[heading.slug] && renderTOC(heading.children, collapsedState, toggleCollapse, highestLevel)}
                </li>
            ))}
        </ul>
    );
};

const TableOfContent: React.FC<TableOfContentProps> = ({ mdxContent: content }) => {
    const toc = generateTOC(content);
    const [collapsedState, setCollapsedState] = useState<{ [key: string]: boolean }>({}); // Manage collapse state for each heading

    const toggleCollapse = (slug: string) => {
        setCollapsedState((prevState) => ({
            ...prevState,
            [slug]: !prevState[slug],
        }));
    };

    // Determine the highest heading level present
    const highestLevel = toc.reduce((acc, heading) => {
        if (heading.level === 'one') return 'one';
        if (heading.level === 'two' && acc !== 'one') return 'two';
        if (heading.level === 'three' && acc !== 'one' && acc !== 'two') return 'three';
        return acc;
    }, 'three' as 'one' | 'two' | 'three');

    return (
        <div className="col-span-12 lg:col-span-4">
            <details
                className="border-[1px] border-solid border-dark dark:border-light text-dark dark:text-light rounded-lg sticky top-[88px] max-h-[calc(100vh-120px)] overflow-hidden overflow-y-auto"
                open
            >
                <summary
                    className="text-lg font-semibold capitalize pt-4 pb-1 px-4 cursor-pointer sticky top-0 bg-white dark:bg-dark z-10"
                >
                    Table Of Content
                </summary>
                {renderTOC(toc, collapsedState, toggleCollapse, highestLevel)}
            </details>
        </div>
    );
};

export default TableOfContent;