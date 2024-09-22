import type { MDXComponents } from 'mdx/types'
// use globals.css to import the global styles
import 'public/styles/globals.css'

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...components,
    }
}