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
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag as TagIcon,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
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
  const router = useRouter();

  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Initialize filters from URL query parameters on mount
  useEffect(() => {
    if (router.isReady) {
      const { category, tag, search } = router.query;

      if (category && typeof category === 'string') {
        setSelectedCategories([category]);
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
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Folder className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Categories
          </h3>
          {selectedCategories.length > 0 && (
            <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-0">
              {selectedCategories.length}
            </Badge>
          )}
        </div>
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {categories.map((category) => (
            <div 
              key={category.slug} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
            >
              <Checkbox
                id={`cat-${category.slug}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label
                htmlFor={`cat-${category.slug}`}
                className="text-sm cursor-pointer flex-1 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors font-medium"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <TagIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Tags
          </h3>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-0">
              {selectedTags.length}
            </Badge>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search tags..."
            value={tagSearchTerm}
            onChange={(e) => setTagSearchTerm(e.target.value)}
            className="pl-9 h-10 text-sm border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {filteredTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.slug) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedTags.includes(tag.slug)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
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
          className="w-full h-10 border-slate-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-all duration-200"
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
      <section className="relative px-5 sm:px-10 md:px-24 sxl:px-32 py-16 md:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-start gap-5 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent mb-3">
                Discover Content
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium">
                Explore <span className="font-bold text-blue-600 dark:text-blue-400">{posts.length}</span> articles across all topics
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-3xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-20"></div>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
              <Input
                type="text"
                placeholder="Search articles by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-5 h-16 text-base bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-lg hover:shadow-xl focus:shadow-xl focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 font-medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 px-5 sm:px-10 md:px-24 sxl:px-32 py-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-6">
            <Card className="shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-1"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <SlidersHorizontal className="w-4 h-4 text-white" />
                    </div>
                    Filters
                  </h2>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-md px-3 py-1 font-semibold">
                      {selectedCategories.length + selectedTags.length}
                    </Badge>
                  )}
                </div>
                <FilterPanel />
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button
                size="lg"
                className="rounded-full h-16 w-16 shadow-2xl bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
              >
                <Filter className="w-6 h-6" />
                {hasActiveFilters && (
                  <Badge className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse font-bold">
                    {selectedCategories.length + selectedTags.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5 text-xl">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <SlidersHorizontal className="w-5 h-5 text-white" />
                  </div>
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
          <div className="mb-8 space-y-5">
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2.5 items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Active filters:
                </span>
                {selectedCategories.map((catSlug) => {
                  const cat = categories.find((c) => c.slug === catSlug);
                  return cat ? (
                    <Badge
                      key={catSlug}
                      variant="secondary"
                      className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-800 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 hover:shadow-md transition-all duration-200"
                    >
                      <Folder className="w-3.5 h-3.5" />
                      {cat.name}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer hover:text-purple-900 dark:hover:text-purple-100 hover:scale-110 transition-transform"
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
                      className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-200"
                    >
                      <TagIcon className="w-3.5 h-3.5" />
                      {tag.name}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer hover:text-blue-900 dark:hover:text-blue-100 hover:scale-110 transition-transform"
                        onClick={() => removeFilter('tag', tagSlug)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            {/* View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-4 py-2 text-sm font-semibold border-2 border-slate-300 dark:border-slate-700">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mr-1">{filteredAndSortedPosts.length}</span>
                  {filteredAndSortedPosts.length === 1 ? 'article' : 'articles'} found
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="gap-2.5 h-10 px-4 border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 font-semibold"
                    >
                      {getSortIcon()}
                      <span className="hidden sm:inline">{getSortLabel()}</span>
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
          {filteredAndSortedPosts.length > 0 ? (
            <div className="flex flex-col gap-6">
              {filteredAndSortedPosts.map((post, index) => (
                <article
                  key={post.slug}
                  className="animate-in fade-in duration-500 hover:scale-[1.01] transition-transform"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  <BlogListCard post={post} />
                </article>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/50 overflow-hidden relative">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10"></div>
              
              <CardContent className="flex flex-col items-center justify-center py-20 md:py-28 relative z-10">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20"></div>
                  <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 shadow-xl">
                    <Search className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  No articles found
                </h3>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 text-center max-w-md mb-8 leading-relaxed">
                  {searchTerm
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for'
                    : 'No articles match your current filters. Try selecting different categories or tags'}
                </p>
                {hasActiveFilters && (
                  <Button 
                    onClick={clearAllFilters} 
                    variant="outline"
                    className="h-12 px-6 border-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-all duration-200 font-semibold"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DiscoverPage;
