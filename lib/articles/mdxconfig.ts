// mdxOptions.js
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import moonlightTheme from '@/assets/moon-night.json' with { type: 'json' };
import { SerializeOptions } from "next-mdx-remote/dist/types";
const codeOptions = {
    keepBackground: false,
    theme: moonlightTheme
}

export const Options: any = {
    // made available to the arguments of any custom MDX component
    scope: {},
    // MDX's available options, see the MDX docs for more info.
    // https://mdxjs.com/packages/mdx/#compilefile-options
    mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "append" }],
            [rehypePrettyCode, codeOptions],
        ],
        format: 'mdx',
    },
    // Indicates whether or not to parse the frontmatter from the MDX source
    parseFrontmatter: false,
};