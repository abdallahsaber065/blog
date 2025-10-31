# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added - October 31, 2025

#### UI/UX Modernization

- **Discover Page**: Brand new unified content discovery page with advanced filtering system
  - Created comprehensive content discovery hub replacing separate category/tag pages
  - Implemented multi-select filtering for both categories AND tags simultaneously
  - Added collapsible filter sidebar with glassmorphism effects (desktop) and bottom sheet (mobile)
  - Integrated real-time search across title and excerpt with debouncing
  - Added multiple sort options: Newest, Oldest, Most Viewed, and Trending
  - Implemented dual view modes (grid/list) with responsive layouts
  - Created new `BlogListCard` component for list view with excerpt display
  - Added active filter chips with individual remove functionality
  - Implemented floating action button (FAB) for mobile filter access
  - Added searchable tag pills and category checkboxes
  - Integrated results counter and "Clear All Filters" functionality
  - Enhanced empty states with contextual messaging
  - Applied smooth animations and hover effects throughout
  - Ensured full dark mode support with gradient backgrounds
  
- **Tags Page**: Complete redesign with modern hero section, sticky navigation bar, and improved search functionality
  - Added gradient background with icon badges
  - Implemented grid/list view toggle for flexible content display
  - Added real-time post count display
  - Integrated search functionality with empty state handling
  - Replaced old scrolling navigation with modern button-based tag selector
  
- **Categories Page**: Comprehensive redesign with enhanced sidebar and search capabilities
  - Added gradient hero section with category information
  - Implemented modern sidebar with searchable category list
  - Added sticky sidebar with improved navigation
  - Integrated grid/list view toggle
  - Added empty state cards with helpful messaging
  - Improved responsive design for mobile and tablet views
  
- **Admin Posts Dashboard**: Modernized table layout with improved action buttons
  - Replaced list-based layout with proper data table
  - Added responsive table with hidden columns on smaller screens
  - Improved status badge styling with better color contrast
  - Enhanced action buttons with hover states and tooltips
  - Optimized button sizing for better mobile experience
  - Added category column with badge display
  - Improved overall table spacing and readability

#### Component Enhancements

- Integrated Lucide React icons (Search, Tag, Folder, Grid3x3, LayoutList, ChevronRight)
- Added Shadcn UI components for consistent design system
- Improved dark mode support across all modernized pages
- Enhanced accessibility with proper ARIA labels and semantic HTML

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
