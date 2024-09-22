/**
 * @import {MDXComponents} from 'mdx/types.js'
 */

import { MDXProvider } from '@mdx-js/react'
import Post from '@/testData/post.mdx'
import { JSX, ClassAttributes, HTMLAttributes } from 'react'
// ^-- Assumes an integration is used to compile MDX to JS, such as
// `@mdx-js/esbuild`, `@mdx-js/loader`, `@mdx-js/node-loader`, or
// `@mdx-js/rollup`, and that it is configured with
// `options.providerImportSource: '@mdx-js/react'`.

/** @type {MDXComponents} */
const components = {
    em(properties: JSX.IntrinsicAttributes & ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement>) {
        return <i {...properties} />
    }
}

console.log(
    <MDXProvider components={components}>
        <Post />
    </MDXProvider>
)
