# Editor Features and Architecture Documentation

This document provides a comprehensive overview of the blog's MDX Editor features, its current state, how it handles content generation, and its evolutionary progression.

## 1. Overview
The current iteration of the platform uses a highly customized, robust rich-text editor powered by `@mdxeditor/editor`. It seamlessly bridges standard Markdown syntax with React (MDX), allowing the insertion of complex custom UI components inline with typical text content.

## 2. Editor Components Architecture
The editor is split across a few distinct components to manage state, SSR-safety (Server-Side Rendering), and separation of concerns:

- **`PostEditor.tsx`**: The outermost container used in the `Create Post` and `Edit Post` admin pages. It manages the post's global state (title, category, tags, excerpt, status (draft/published), featured image) and handles saving logic. It provides a sticky top bar and toggles the `PostSettingsSidebar`.
- **`EditorWithPreview.tsx`**: A wrapper around the actual MDX editor instance. It manages the "Live Preview" state, parsing the markdown, and calling `/api/serializeContent` to fetch the compiled MDX. It handles complex Regex replacements to ensure standard Markdown images (`![alt](src)`) and files are transformed into their respective custom JSX counterparts before serialization, enabling them to render correctly in the preview context.
- **`Editor.tsx`**: The core `@mdxeditor/editor` configuration. It incorporates all plugins, defines the `jsxComponentDescriptors` for custom components (like `<Image>` and `<File>`), and constructs the bespoke toolbar containing custom media insertion buttons.

## 3. Key Features and Capabilities

### Rich Text & Standard Markdown
Full support for standard markdown features including:
- Headings (H1-H6)
- Blockquotes
- Ordered and Unordered Lists
- Tables
- `diffSourcePlugin` (allowing a direct Markdown source view and a Rich Text toggle)
- Code blocks with syntax highlighting (via `codeMirrorPlugin` supporting JS, TS, Python, Rust, Go, etc.)

### Custom MDX Component Interoperability
The editor is configured with `jsxPlugin` to parse, render, and validate custom React components directly within the editor interface:
- **`<Image />`**: Replaces standard images, mapping directly to Next.js `Image` for optimized rendering. Integrates tightly with the `ImageSelector` for uploading and picking images from the Media Library.
- **`<File />` & `<InlineFile />`**: Special blocks designed for downloadable file attachments (e.g., zip, pdf, docs). They spawn custom Modals/Dialogs to interface with the `FileLibrary`.
- **`<Embed />`**: Allows embedding external links (YouTube, Twitter, etc.).
- **`<FileResource />`**: Grouped resources view.
- **`<details>` / `<summary>`**: Native HTML accordion support parsed as flow blocks.

### Live 1:1 Preview Mode
Instead of assuming how the markdown will look, the `EditorWithPreview.tsx` has a `Live Preview` button.
- Triggers a full-screen React Portal overlay (`<div id="live-preview-scroll-container">`).
- Disables body scroll, focuses fully on the post.
- Pushes the current `markdownText` payload to the server-side API (`/api/serializeContent`) where `next-mdx-remote` serializes it securely.
- Renders the post identically to how users see it via the frontend `BlogTemplate` and `RenderMdxDev` components.

### Integrated Media Management
Toolbar buttons (`InsertCustomImage`, `InsertCustomFile`, etc.) bypass standard markdown prompts. They open custom drawers (`ImageSelector` and `FileSelector`) that communicate seamlessly with the `Prisma` database models (`MediaLibrary`, `FileLibrary`) to select previously uploaded content or upload new files directly to the respective S3/Local storage provider.

## 4. How Things Are Handled

### Media Tag Regex Overrides
In the pure editor mode, standard inputs like dragging an image natively produces `![alt](src)`. To ensure the Live Preview and eventual rendering on the read-side matches the custom `next/image` logic (to prevent unoptimized warnings), the `EditorWithPreview.tsx`:
1. Scans `markdownText` for standard markdown images or raw HTML `<img>` tags.
2. Uses Regex to mutate them into `<Image src="..." alt="..." />` tags dynamically before they hit the serializer (`replaceImagesInMarkdown`).
3. Appends an index-based `id="..."` attribute to allow for bi-directional binding between the Preview and the Editor content when properties of that image are modified or re-uploaded.

### State and Persistence
- State changes (typing) bubble up from `Editor.tsx` -> `EditorWithPreview.tsx` -> `PostEditor.tsx`.
- The main `markdownText` state operates completely independently of the post metadata (arrays of objects for tags/categories).
- When "Save" is clicked, metadata elements are destructured, stripped of unnecessary UI artifacts, and pushed to `/api/posts` as a standard JSON payload via `PUT`/`POST`.

## 5. How It Was (Evolution)

Previously, the blog likely depended on either a simpler WYSIWYG editor or a standard markdown `<textarea>`.
- **Limitations of the Past**: Standard Markdown editors could not inherently recognize React JSX. Embedding an interactive file download button, a specialized optimized Next.js image, or a YouTube iframe either required raw HTML injections (unsafe and hard to style) or wasn't supported. Creators couldn't visualize the exact post aesthetics without saving a draft and viewing it via the website frontend.
- **Current Paradigm Shift**: Adopting `@mdxeditor/editor` brought "Block-based" rich editing akin to modern solutions (like Notion), combined with structural JSX parsing. Authors now interact with complex React components *visually* through the toolbar and see accurate styling in Live Preview without leaving the editing context.
