import React from 'react';
import GithubSlugger from 'github-slugger';

interface Heading {
    level: 'one' | 'two' | 'three';
    text: string;
    slug: string;
}

interface TableOfContentProps {
    content: string;
}

export function generateTOC(content: string): Heading[] {
    const regex = /\n(#{1,6})\s+(.+)/g;
    const slugger = new GithubSlugger();
    const headings = Array.from(content.matchAll(regex)).map((match) => {
        const [, flag, text] = match;

        return {
            level: (flag.length === 1 ? 'one' : flag.length === 2 ? 'two' : 'three') as 'one' | 'two' | 'three',
            text: text || '',
            slug: text ? slugger.slug(text) : '',
        };
    });

    return headings;
}

const TableOfContent: React.FC<TableOfContentProps> = ({ content }) => {
    const toc = generateTOC(content);

    return (
        <div className="col-span-12 lg:col-span-4">
            <details
                className="border-[1px] border-solid border-dark dark:border-light text-dark dark:text-light rounded-lg sticky top-6 max-h-[80vh] overflow-hidden overflow-y-auto"
                open
            >
                <summary
                    className="text-lg font-semibold capitalize pt-4 pb-1 px-4 cursor-pointer sticky top-0 bg-white dark:bg-dark z-10"
                >
                    Table Of Content
                </summary>
                <ul className="mt-4 font-in text-base mx-4">
                    {toc.map((heading: Heading) => (
                        <li key={`#${heading.slug}`} className="py-1">
                            <a
                                href={`#${heading.slug}`}
                                data-level={heading.level}
                                className="
                                    data-[level=one]:font-bold
                                    data-[level=one]:pl-0
                                    data-[level=one]:pt-2
                                    data-[level=one]:border-t border-solid
                                    data-[level=two]:list-disc list-inside
                                    data-[level=two]:pl-2
                                    data-[level=three]:pl-4
                                    sm:data-[level=three]:pl-6
                                    flex items-center justify-start
                                    "
                            >
                                {heading.level === 'three' && (
                                    <span className="flex w-1 h-1 rounded-full mr-2">&nbsp;</span>
                                )}
                                <span className="hover:underline">{heading.text}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </details>
        </div>
    );
};

export default TableOfContent;