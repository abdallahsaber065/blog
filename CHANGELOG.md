# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed - October 31, 2025

#### Upgraded to Next.js 16.0.1
- **Next.js**: Upgraded from v14.2.33 to v16.0.1
- **React**: Upgraded from v18.3.1 to v19.0.0
- **React DOM**: Upgraded from v18.3.1 to v19.0.0
- **ESLint**: Upgraded from v8.57.1 to v9.0.0
- **ESLint Config Next**: Upgraded from v14.2.33 to v16.0.0
- **TypeScript Types**: Updated @types/react and @types/react-dom to v19.0.0

#### Configuration Updates
- **TypeScript**: Changed `moduleResolution` from "node" to "bundler" for better compatibility
- **TypeScript**: Updated `jsx` from "preserve" to "react-jsx" (Next.js 16 requirement)
- **TypeScript**: Added `.next/dev/types/**/*.ts` to include paths
- **Middleware**: Renamed `middleware.ts` to `proxy.ts` (Next.js 16 requirement)
- **Middleware**: Updated function export from `middleware()` to `proxy()`
- **Next.js Config**: Added `turbopack: {}` configuration for Turbopack bundler
- **Next.js Config**: Added `cacheComponents: true` for improved performance
- **Image Imports**: Fixed image imports to use proper Next.js public directory paths (e.g., `/static/images/logo.png` instead of import statements)

#### Performance Improvements
- Turbopack is now the default bundler in development mode
- Expect up to 10x faster Fast Refresh
- Expect 2-5x faster development builds
- Enhanced routing with layout deduplication and incremental prefetching
- Component caching enabled for better performance

#### Breaking Changes
- Middleware files must be renamed to `proxy.ts/proxy.js`
- Middleware function export must be renamed to `proxy()`
- React 19 introduces breaking changes - review React 19 migration guide if needed
- TypeScript now requires `jsx: "react-jsx"` configuration


