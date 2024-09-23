import remarkGfm from 'remark-gfm';

import { serialize } from 'next-mdx-remote/serialize';

export const getArticle = async ({ content }) => {

    const source = await serialize(content, {
        parseFrontmatter: false,
        mdxOptions: {
            remarkPlugins: [[remarkGfm]],
            rehypePlugins: []
        }
    });

    const { compiledSource } = source;

    return {
        source: {
            compiledSource
        }
    };
};