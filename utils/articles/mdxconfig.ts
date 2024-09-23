// mdxOptions.js
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { SerializeOptions } from "next-mdx-remote/dist/types";

const codeOptions = {
    theme: 'github-dark',
    grid: false,
}

export const options = {
    // made available to the arguments of any custom MDX component
    scope: {},
    // MDX's available options, see the MDX docs for more info.
    // https://mdxjs.com/packages/mdx/#compilefile-options
    mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "append" }],
            [rehypePrettyCode, codeOptions]
        ],
        format: 'mdx',
    },
    // Indicates whether or not to parse the frontmatter from the MDX source
    parseFrontmatter: false,
}