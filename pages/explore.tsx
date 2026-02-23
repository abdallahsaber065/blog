import BlogListCard from '@/components/Blog/BlogListCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { prisma } from '@/lib/prisma';
import {
  ArrowUpDown,
  ChevronDown,
  Clock,
  Filter,
  Folder,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag as TagIcon,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Post {
  slug: string;
  title: string;
  excerpt?: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  featured_image_url: string;
  reading_time?: number;
  views?: number;
  category?: { slug: string; name: string };
  author?: { first_name: string | null; last_name: string | null; username: string };
  tags: { slug: string; name: string }[];
}

interface Category {
  slug: string;
  name: string;
}

interface Tag {
  id: number;
  slug: string;
  name: string;
}

interface DiscoverPageProps {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
}

export const getStaticProps: GetStaticProps = async () => {
  const [posts, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published' },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        created_at: true,
        updated_at: true,
        published_at: true,
        featured_image_url: true,
        reading_time: true,
        views: true,
        category: {
          select: {
            slug: true,
            name: true,
          },
        },
        author: {
          select: {
            username: true,
            first_name: true,
            last_name: true,
          },
        },
        tags: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      orderBy: { published_at: 'desc' },
    }),
    prisma.category.findMany({
      where: { posts: { some: { status: 'published' } } },
      select: {
        slug: true,
        name: true,
      },
    }),
    prisma.tag.findMany({
      where: { posts: { some: { status: 'published' } } },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    }),
  ]);

  const serializedPosts = posts.map((post: any) => ({
    ...post,
    created_at: post.created_at.toISOString(),
    updated_at: post.updated_at.toISOString(),
    published_at: post.published_at ? post.published_at.toISOString() : null,
  }));

  return {
    props: {
      posts: serializedPosts,
      categories,
      tags,
    },
    revalidate: 3600, // Revalidate every hour
  };
};

type SortOption = 'newest' | 'oldest' | 'most-viewed' | 'trending';

const DiscoverPage: React.FC<DiscoverPageProps> = ({ posts, categories, tags }) => {
  const router = useRouter();

  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize filters from URL query parameters on mount
  useEffect(() => {
    if (router.isReady) {
      const { category, tag, search } = router.query;

      if (category && typeof category === 'string') {
        setSelectedCategory(category);
      }

      if (tag && typeof tag === 'string') {
        setSelectedTags([tag]);
      }

      if (search && typeof search === 'string') {
        setSearchTerm(search);
      }
    }
  }, [router.isReady, router.query]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter and sort logic
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    // Apply search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(search) ||
          post.excerpt?.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (post) => post.category?.slug === selectedCategory
      );
    }

    // Apply tag filter (OR logic - post has any of the selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter((post) =>
        post.tags.some((tag) => selectedTags.includes(tag.slug))
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) =>
          new Date(b.published_at || b.created_at).getTime() -
          new Date(a.published_at || a.created_at).getTime()
        );
        break;
      case 'oldest':
        sorted.sort((a, b) =>
          new Date(a.published_at || a.created_at).getTime() -
          new Date(b.published_at || b.created_at).getTime()
        );
        break;
      case 'most-viewed':
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'trending':
        // Sort by views in the last 30 days (simplified: just by views for now)
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
    }

    return sorted;
  }, [posts, debouncedSearch, selectedCategory, selectedTags, sortBy]);

  // Filtered tags for search
  const filteredTags = useMemo(() => {
    if (!tagSearchTerm) return tags;
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
    );
  }, [tags, tagSearchTerm]);

  // Filtered categories for dropdown search
  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
  }, [categories, categorySearchTerm]);

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const INITIAL_TAG_LIMIT = 12;

  // Toggle functions
  const toggleCategory = (slug: string) => {
    setSelectedCategory((prev) => (prev === slug ? null : slug));
    setIsCategoryDropdownOpen(false);
  };

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
    setSearchTerm('');
    setSortBy('newest');
  };

  const removeFilter = (type: 'category' | 'tag', slug: string) => {
    if (type === 'category') {
      setSelectedCategory(null);
    } else {
      setSelectedTags((prev) => prev.filter((s) => s !== slug));
    }
  };

  const hasActiveFilters =
    selectedCategory !== null || selectedTags.length > 0 || searchTerm;

  // Render Filter Panel Content
  const renderFilterPanel = () => {
    const activeCategory = categories.find((c) => c.slug === selectedCategory);

    return (
      <div className="space-y-7">
        {/* Categories — Polished single-select dropdown */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-lightBorder dark:border-darkBorder/50">
            <div className="p-1.5 bg-gold/10 rounded-lg border border-gold/20">
              <Folder className="w-3.5 h-3.5 text-gold" />
            </div>
            <h3 className="text-sm font-semibold text-foreground tracking-wide">Category</h3>
            {selectedCategory && (
              <Badge className="ml-auto h-5 px-2 text-[10px] bg-gold text-dark border-0 animate-in fade-in zoom-in duration-300">
                Selected
              </Badge>
            )}
          </div>

          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className={`w-full flex items-center justify-between px-4 h-11 rounded-xl border transition-all duration-300 bg-light dark:bg-darkSurface/50 backdrop-blur-sm group
                ${isCategoryDropdownOpen
                  ? 'border-gold ring-2 ring-gold/10'
                  : 'border-lightBorder dark:border-darkBorder hover:border-gold/40'
                }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className={`p-1 rounded-md transition-colors duration-300 ${activeCategory ? 'bg-gold/10' : 'bg-muted/10 group-hover:bg-muted/20'}`}>
                  <Folder className={`w-3.5 h-3.5 ${activeCategory ? 'text-gold' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-sm font-medium truncate ${activeCategory ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {activeCategory ? activeCategory.name : 'All Categories'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180 text-gold' : 'group-hover:text-gold'}`} />
            </button>

            {/* Dropdown list */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-card border border-lightBorder dark:border-darkBorder rounded-xl shadow-elevated z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Search inside dropdown */}
                <div className="p-2 border-b border-lightBorder dark:border-darkBorder/50">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-muted/20 rounded-lg outline-none focus:ring-1 focus:ring-gold/30 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
                  <div
                    className={`flex items-center px-4 py-2.5 cursor-pointer transition-colors duration-150 hover:bg-gold/5 group
                      ${!selectedCategory ? 'bg-gold/5' : ''}`}
                    onClick={() => {
                      setSelectedCategory(null);
                      setCategorySearchTerm('');
                      setIsCategoryDropdownOpen(false);
                    }}
                  >
                    <span className={`text-sm flex-1 font-medium ${!selectedCategory ? 'text-gold' : 'text-foreground'}`}>
                      All Categories
                    </span>
                    {!selectedCategory && <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-gold-sm" />}
                  </div>

                  {filteredCategories.map((category) => {
                    const active = selectedCategory === category.slug;
                    return (
                      <div
                        key={category.slug}
                        className={`flex items-center px-4 py-2.5 cursor-pointer transition-colors duration-150 hover:bg-gold/5 group
                          ${active ? 'bg-gold/5' : ''}`}
                        onClick={() => toggleCategory(category.slug)}
                      >
                        <span className={`text-sm flex-1 font-medium ${active ? 'text-gold' : 'text-foreground group-hover:text-gold transition-colors'}`}>
                          {category.name}
                        </span>
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-gold-sm" />}
                      </div>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
                      No categories found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags — search + limited preview */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-lightBorder dark:border-darkBorder/50">
            <div className="p-1.5 bg-gold/10 rounded-lg border border-gold/20">
              <TagIcon className="w-3.5 h-3.5 text-gold" />
            </div>
            <h3 className="text-sm font-semibold text-foreground tracking-wide">Tags</h3>
            {selectedTags.length > 0 && (
              <Badge className="ml-auto h-5 px-2 text-[10px] bg-gold text-dark border-0 shadow-gold-sm">
                {selectedTags.length}
              </Badge>
            )}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder={tags.length > INITIAL_TAG_LIMIT ? `Search ${tags.length} tags…` : 'Search tags…'}
              value={tagSearchTerm}
              onChange={(e) => setTagSearchTerm(e.target.value)}
              className="pl-9 h-10 text-sm bg-light dark:bg-darkSurface border-lightBorder dark:border-darkBorder focus:border-gold transition-colors"
            />
            {tagSearchTerm && (
              <button
                onClick={() => setTagSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(tagSearchTerm ? filteredTags : filteredTags.slice(0, INITIAL_TAG_LIMIT)).map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.slug) ? 'default' : 'outline'}
                className={`cursor-pointer px-2.5 py-1 text-xs transition-all duration-200 hover:scale-105 ${selectedTags.includes(tag.slug)
                  ? 'bg-gold text-dark border-0 shadow-gold-sm ring-1 ring-gold'
                  : 'bg-light dark:bg-darkSurface text-muted-foreground border border-lightBorder dark:border-darkBorder hover:border-gold/60 hover:text-gold'
                  }`}
                onClick={() => toggleTag(tag.slug)}
              >
                #{tag.name}
              </Badge>
            ))}

            {/* "More tags" hint — only shown when not searching */}
            {!tagSearchTerm && tags.length > INITIAL_TAG_LIMIT && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-lightBorder dark:border-darkBorder/60 text-xs text-muted-foreground">
                <span className="font-medium">+{tags.length - INITIAL_TAG_LIMIT}</span>
                <span className="text-gold/80">· search above</span>
              </div>
            )}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            className="w-full h-10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all duration-200"
            onClick={clearAllFilters}
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>
    );
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'newest':
        return <Sparkles className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      case 'most-viewed':
        return <TrendingUp className="w-4 h-4" />;
      case 'oldest':
        return <Clock className="w-4 h-4" />;
      default:
        return <ArrowUpDown className="w-4 h-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'newest':
        return 'Newest First';
      case 'oldest':
        return 'Oldest First';
      case 'most-viewed':
        return 'Most Viewed';
      case 'trending':
        return 'Trending';
      default:
        return 'Sort By';
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      {/* Hero Section */}
      <section className="relative px-5 sm:px-10 md:px-24 sxl:px-32 py-16 md:py-24 bg-light dark:bg-dark border-b border-lightBorder dark:border-darkBorder overflow-hidden justify-center justify-items-center">
        {/* Decorative blooms for "Gold Bloom" effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/[0.08] rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-gold/[0.05] rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-8">

            <div className="flex flex-col h-full justify-center">
              {/* Animated badge */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold tracking-wider uppercase mb-5 self-start"
              >
                <Sparkles className="w-3 h-3" />
                Explore Articles
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-display font-bold text-foreground mb-4 drop-shadow-sm"
              >
                Discover Content
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium max-w-2xl px-4 sm:px-0"
              >
                Explore <span className="font-bold text-gold">{posts.length}</span> meticulously crafted articles across various tech fields.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 px-5 sm:px-10 md:px-24 sxl:px-32 py-10">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hidden lg:block w-80 flex-shrink-0"
        >
          <div className="sticky top-[72px]">
            <Card className="shadow-card dark:shadow-card-dark border-lightBorder dark:border-darkBorder bg-card">
              <div className="bg-gradient-to-r from-gold via-goldLight to-gold h-0.5"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5">
                    <div className="p-1.5 bg-gold/10 border border-gold/20 rounded-lg">
                      <SlidersHorizontal className="w-4 h-4 text-gold" />
                    </div>
                    Filters
                  </h2>
                  {hasActiveFilters && (
                    <Badge className="bg-gold text-dark border-0 shadow-gold-sm px-3 py-1 font-semibold">
                      {(selectedCategory ? 1 : 0) + selectedTags.length}
                    </Badge>
                  )}
                </div>
                {renderFilterPanel()}
              </CardContent>
            </Card>
          </div>
        </motion.aside>

        {/* Mobile Filter FAB */}
        <div className="lg:hidden fixed bottom-6 right-5 z-50">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.07 }}
                className={`relative flex items-center gap-2.5 h-14 rounded-2xl shadow-lg transition-all duration-300 font-semibold text-sm ${hasActiveFilters
                  ? 'px-4 bg-gradient-to-r from-gold to-goldDark text-dark shadow-gold'
                  : 'px-4 bg-card border border-lightBorder dark:border-darkBorder text-foreground hover:border-gold/40 hover:shadow-gold-sm'
                  }`}
              >
                {/* Glow ring when filters active */}
                {hasActiveFilters && (
                  <span className="absolute inset-0 rounded-2xl border-2 border-gold/60 animate-ping opacity-30 pointer-events-none" />
                )}
                <SlidersHorizontal className={`w-5 h-5 flex-shrink-0 ${hasActiveFilters ? 'text-dark' : 'text-gold'}`} />
                <span className={hasActiveFilters ? 'text-dark' : 'text-foreground'}>
                  {hasActiveFilters ? 'Filters' : 'Filter'}
                </span>
                {hasActiveFilters && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center w-5 h-5 rounded-full bg-dark/20 text-dark text-xs font-bold"
                  >
                    {(selectedCategory ? 1 : 0) + selectedTags.length}
                  </motion.span>
                )}
              </motion.button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[88vh] overflow-y-auto rounded-t-3xl border-t-0 bg-card">
              {/* Pull handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-lightBorder dark:bg-darkBorder" />
              </div>
              <SheetHeader className="px-1 pt-3 pb-2">
                <SheetTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gold/10 border border-gold/25 rounded-xl">
                    <SlidersHorizontal className="w-5 h-5 text-gold" />
                  </div>
                  <span>Filter Articles</span>
                  {hasActiveFilters && (
                    <Badge className="ml-auto bg-gold text-dark border-0 font-bold shadow-gold-sm px-3">
                      {(selectedCategory ? 1 : 0) + selectedTags.length} active
                    </Badge>
                  )}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 px-1">
                {renderFilterPanel()}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-28 lg:pb-0">
          {/* Active Filters & Controls */}
          <div className="mb-6 space-y-4">
            {/* Mobile-only search bar */}
            <div className="relative sm:hidden">
              <div className={`relative flex items-center transition-all duration-300 rounded-2xl border-2 ${searchFocused || searchTerm
                ? 'border-gold shadow-gold-sm bg-card'
                : 'border-lightBorder dark:border-darkBorder bg-card'
                }`}>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search articles…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="pl-10 pr-10 h-12 text-sm border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-muted/50 hover:bg-gold/10 text-muted-foreground hover:text-gold transition-all duration-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2.5 items-center p-4 bg-gold/[0.04] rounded-xl border border-gold/20">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gold" />
                  Active filters:
                </span>
                {selectedCategory && (() => {
                  const cat = categories.find((c) => c.slug === selectedCategory);
                  return cat ? (
                    <Badge
                      key={selectedCategory}
                      className="gap-1.5 px-3 py-1.5 bg-gold/10 text-gold border border-gold/30 hover:shadow-gold-sm transition-all duration-200"
                    >
                      <Folder className="w-3.5 h-3.5" />
                      {cat.name}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => removeFilter('category', selectedCategory)}
                      />
                    </Badge>
                  ) : null;
                })()}
                {selectedTags.map((tagSlug) => {
                  const tag = tags.find((t) => t.slug === tagSlug);
                  return tag ? (
                    <Badge
                      key={tagSlug}
                      className="gap-1.5 px-3 py-1.5 bg-gold/10 text-gold border border-gold/30 hover:shadow-gold-sm transition-all duration-200"
                    >
                      <TagIcon className="w-3.5 h-3.5" />
                      {tag.name}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => removeFilter('tag', tagSlug)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            {/* View Controls */}
            <div className="flex flex-row gap-3 items-center justify-between">
              {/* Article count - visible on all sizes */}
              <div className="flex items-center gap-2">
                <motion.div
                  key={filteredAndSortedPosts.length}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <Badge variant="outline" className="px-3 py-1.5 text-xs sm:text-sm font-semibold border border-lightBorder dark:border-darkBorder bg-card">
                    <span className="text-gold font-bold mr-1">{filteredAndSortedPosts.length}</span>
                    {filteredAndSortedPosts.length === 1 ? 'article' : 'articles'}
                  </Badge>
                </motion.div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Inline search bar - desktop only */}
                <div
                  className={`relative hidden sm:flex items-center transition-all duration-300 ease-in-out ${searchFocused || searchTerm ? 'w-60' : 'w-44'
                    }`}
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search articles…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`pl-9 pr-8 h-10 text-sm border-2 transition-all duration-300 ${searchFocused || searchTerm
                      ? 'border-gold bg-card shadow-gold-sm'
                      : 'border-lightBorder dark:border-darkBorder bg-card hover:border-gold/40'
                      }`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 h-10 px-3 sm:px-4 border-2 border-lightBorder dark:border-darkBorder hover:bg-gold/10 hover:border-gold/40 hover:text-gold transition-all duration-200 font-semibold text-sm"
                    >
                      <div className="text-gold">
                        {getSortIcon()}
                      </div>
                      <span className="hidden sm:inline font-bold">{getSortLabel()}</span>
                      <span className="sm:hidden font-medium text-xs">{getSortLabel()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setSortBy('newest')}
                      className="cursor-pointer font-medium"
                    >
                      <Sparkles className="w-4 h-4 mr-3 text-yellow-500" />
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('oldest')}
                      className="cursor-pointer font-medium"
                    >
                      <Clock className="w-4 h-4 mr-3 text-slate-500" />
                      Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('most-viewed')}
                      className="cursor-pointer font-medium"
                    >
                      <TrendingUp className="w-4 h-4 mr-3 text-green-500" />
                      Most Viewed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('trending')}
                      className="cursor-pointer font-medium"
                    >
                      <Zap className="w-4 h-4 mr-3 text-orange-500" />
                      Trending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Posts Grid/List */}
          <AnimatePresence mode="wait">
            {filteredAndSortedPosts.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                {filteredAndSortedPosts.map((post, index) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4) }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  >
                    <BlogListCard post={post} />
                  </motion.article>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Card className="border-dashed border-2 border-lightBorder dark:border-darkBorder bg-gradient-to-br from-light to-white dark:from-darkSurface/50 dark:to-dark/50 overflow-hidden relative shadow-card dark:shadow-card-dark">
                  {/* Decorative background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5 dark:from-gold/5 dark:via-transparent dark:to-gold/5"></div>

                  <CardContent className="flex flex-col items-center justify-center py-20 md:py-28 relative z-10">
                    <motion.div
                      className="relative mb-8"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <div className="absolute inset-0 bg-gold rounded-full blur-2xl opacity-20 animate-pulse"></div>
                      <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-goldDark/20 dark:from-gold/20 dark:to-goldDark/10 shadow-gold/20 border-2 border-gold/30">
                        <Search className="w-12 h-12 text-gold dark:text-goldLight" />
                      </div>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="text-3xl font-bold text-foreground mb-3"
                    >
                      No articles found
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="text-base md:text-lg text-muted-foreground text-center max-w-md mb-8 leading-relaxed font-medium"
                    >
                      {searchTerm
                        ? 'Try adjusting your search terms or filters to find what you\'re looking for'
                        : 'No articles match your current filters. Try selecting different categories or tags'}
                    </motion.p>
                    {hasActiveFilters && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        <Button
                          onClick={clearAllFilters}
                          variant="outline"
                          className="h-12 px-8 border-2 border-gold/30 hover:bg-gold/10 hover:text-gold hover:border-gold/60 transition-all duration-300 font-bold rounded-xl shadow-sm hover:shadow-gold-sm hover:-translate-y-0.5"
                        >
                          <X className="w-5 h-5 mr-3" />
                          Clear All Filters
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>


    </div>
  );
};

export default DiscoverPage;
