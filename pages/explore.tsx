import BlogLayoutThree from '@/components/Blog/BlogLayoutThree';
import BlogListCard from '@/components/Blog/BlogListCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { prisma } from '@/lib/prisma';
import {
  ArrowUpDown,
  Clock,
  Filter,
  Folder,
  Grid3x3,
  LayoutList,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag as TagIcon,
  TrendingUp,
  X
} from 'lucide-react';
import { GetStaticProps } from 'next';
import { useEffect, useMemo, useState } from 'react';

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

  const serializedPosts = posts.map((post) => ({
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
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

    // Apply category filter (OR logic)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(
        (post) => post.category && selectedCategories.includes(post.category.slug)
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
  }, [posts, debouncedSearch, selectedCategories, selectedTags, sortBy]);

  // Filtered tags for search
  const filteredTags = useMemo(() => {
    if (!tagSearchTerm) return tags;
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
    );
  }, [tags, tagSearchTerm]);

  // Toggle functions
  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSearchTerm('');
    setSortBy('newest');
  };

  const removeFilter = (type: 'category' | 'tag', slug: string) => {
    if (type === 'category') {
      setSelectedCategories((prev) => prev.filter((s) => s !== slug));
    } else {
      setSelectedTags((prev) => prev.filter((s) => s !== slug));
    }
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedTags.length > 0 || searchTerm;

  // Filter Panel Component
  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Folder className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Categories
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.slug} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category.slug}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <Label
                htmlFor={`cat-${category.slug}`}
                className="text-sm cursor-pointer flex-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Tags
        </h3>

        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search tags..."
            value={tagSearchTerm}
            onChange={(e) => setTagSearchTerm(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {filteredTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.slug) ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              onClick={() => toggleTag(tag.slug)}
            >
              #{tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearAllFilters}
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="relative px-5 sm:px-10 md:px-24 sxl:px-32 py-12 md:py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Discover Content
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                Explore {posts.length} articles across all topics
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search articles by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-base bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded-xl shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 px-5 sm:px-10 md:px-24 sxl:px-32 py-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <Card className="sticky top-4 shadow-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {selectedCategories.length + selectedTags.length}
                  </Badge>
                )}
              </div>
              <FilterPanel />
            </CardContent>
          </Card>
        </aside>

        {/* Mobile Filter Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                size="lg"
                className="rounded-full h-14 w-14 shadow-2xl bg-blue-600 hover:bg-blue-700"
              >
                <Filter className="w-6 h-6" />
                {hasActiveFilters && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-red-500">
                    {selectedCategories.length + selectedTags.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filter Articles
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* Active Filters & Controls */}
          <div className="mb-6 space-y-4">
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active filters:
                </span>
                {selectedCategories.map((catSlug) => {
                  const cat = categories.find((c) => c.slug === catSlug);
                  return cat ? (
                    <Badge
                      key={catSlug}
                      variant="secondary"
                      className="gap-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                    >
                      <Folder className="w-3 h-3" />
                      {cat.name}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-purple-900 dark:hover:text-purple-100"
                        onClick={() => removeFilter('category', catSlug)}
                      />
                    </Badge>
                  ) : null;
                })}
                {selectedTags.map((tagSlug) => {
                  const tag = tags.find((t) => t.slug === tagSlug);
                  return tag ? (
                    <Badge
                      key={tagSlug}
                      variant="secondary"
                      className="gap-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    >
                      <TagIcon className="w-3 h-3" />
                      {tag.name}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-blue-900 dark:hover:text-blue-100"
                        onClick={() => removeFilter('tag', tagSlug)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            {/* View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Badge variant="outline" className="font-normal">
                  {filteredAndSortedPosts.length} {filteredAndSortedPosts.length === 1 ? 'article' : 'articles'} found
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      {getSortIcon()}
                      <span className="hidden sm:inline">{getSortLabel()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('newest')}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                      <Clock className="w-4 h-4 mr-2" />
                      Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('most-viewed')}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Most Viewed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('trending')}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Trending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </div>
          </div>

          {/* Posts Grid/List */}
          {filteredAndSortedPosts.length > 0 ? (
            <div
              className={
                'flex flex-col gap-4 md:gap-6'
              }
            >
              {filteredAndSortedPosts.map((post) => (
                <article
                  key={post.slug}
                  className="animate-in fade-in duration-500"
                >
                  <BlogListCard post={post} />
                </article>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-16 md:py-24">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-6">
                  <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  No articles found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for'
                    : 'No articles match your current filters. Try selecting different categories or tags'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearAllFilters} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default DiscoverPage;
