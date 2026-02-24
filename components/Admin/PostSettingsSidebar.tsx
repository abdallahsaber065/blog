import React, { useState } from 'react';
import { Settings2, X, FileText, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import readingTime from 'reading-time';
import ImageSelector from '@/components/Admin/ImageSelector';
import { resolvePublicUrl } from '@/lib/storage';

export interface PostSettingsSidebarProps {
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
    title: string;
    onTitleChange: (title: string) => void;
    excerpt: string;
    onExcerptChange: (excerpt: string) => void;
    featuredImage: string;
    onFeaturedImageChange: (url: string) => void;
    markdownText: string;
    renderTags: React.ReactNode;
    renderCategory: React.ReactNode;
}

const PostSettingsSidebar: React.FC<PostSettingsSidebarProps> = ({
    showSettings,
    setShowSettings,
    title,
    onTitleChange,
    excerpt,
    onExcerptChange,
    featuredImage,
    onFeaturedImageChange,
    markdownText,
    renderTags,
    renderCategory
}) => {
    const [showImageSelector, setShowImageSelector] = useState(false);

    return (
        <AnimatePresence>
            {showSettings && (
                <>
                    {/* Mobile Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSettings(false)}
                        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    />

                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: typeof window !== 'undefined' && window.innerWidth < 1024 ? 320 : 380, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-0 right-0 z-50 h-full lg:h-[calc(100vh-64px)] lg:z-auto flex-shrink-0 lg:ml-4 border-l lg:border border-lightBorder dark:border-darkBorder bg-card overflow-hidden shadow-2xl lg:shadow-none sm:rounded-l-2xl lg:rounded-xl lg:sticky lg:top-16"
                    >
                        {/* Inner fixed-width container prevents text squishing during width animation */}
                        <div className="w-[320px] lg:w-[380px] h-full overflow-y-auto bg-card">
                            <div className="p-5 space-y-6">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                                        <Settings2 className="w-4 h-4 text-gold" />
                                        Post Settings
                                    </h3>
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Title (Mobile Only) */}
                                <div className="space-y-2 lg:hidden">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-muted/30 border border-lightBorder dark:border-darkBorder rounded-xl p-3 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                                        placeholder="Post title…"
                                        value={title}
                                        onChange={(e) => onTitleChange(e.target.value)}
                                    />
                                </div>

                                {/* Excerpt */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="w-3 h-3 text-gold/70" />
                                        Excerpt
                                    </label>
                                    <textarea
                                        className="w-full bg-muted/30 border border-lightBorder dark:border-darkBorder rounded-xl p-3 text-foreground placeholder:text-muted-foreground/30 text-sm resize-none focus:outline-none focus:border-gold/50 transition-colors"
                                        placeholder="Write a brief excerpt or summary…"
                                        rows={3}
                                        value={excerpt}
                                        onChange={(e) => onExcerptChange(e.target.value)}
                                    />
                                </div>

                                {/* Tags */}
                                {renderTags}

                                {/* Category */}
                                {renderCategory}

                                {/* Featured Image */}
                                <div className="featured-image space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <ImageIcon className="w-3 h-3 text-gold/70" />
                                        Featured Image
                                    </label>
                                    {featuredImage ? (
                                        <div className="relative group rounded-xl overflow-hidden border border-lightBorder dark:border-darkBorder">
                                            <img
                                                src={resolvePublicUrl(featuredImage)}
                                                alt="Featured"
                                                className="featured-image-preview w-full h-40 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setShowImageSelector(true)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur text-white text-xs font-medium hover:bg-white/20 transition-colors"
                                                >
                                                    Change
                                                </button>
                                                <button
                                                    onClick={() => onFeaturedImageChange('')}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 backdrop-blur text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowImageSelector(true)}
                                            className="w-full h-32 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-lightBorder dark:border-darkBorder bg-muted/30 hover:border-gold/50 hover:bg-gold/5 transition-all duration-200 group"
                                        >
                                            <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-gold transition-colors" />
                                            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Click to browse</span>
                                        </button>
                                    )}
                                </div>

                                {/* Word Count */}
                                {markdownText && (
                                    <div className="p-3 rounded-xl bg-muted/30 border border-lightBorder dark:border-darkBorder">
                                        <div className="grid grid-cols-2 gap-3 text-center">
                                            <div>
                                                <div className="text-lg font-bold text-foreground">{markdownText.split(/\s+/).filter(Boolean).length}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Words</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-foreground">{Math.max(1, Math.round(readingTime(markdownText).minutes))}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Min Read</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.aside>

                    {/* Image Selector renders out of flow as a modal covering screen */}
                    <ImageSelector
                        isOpen={showImageSelector}
                        onClose={() => setShowImageSelector(false)}
                        onSelect={(image) => {
                            onFeaturedImageChange(image.file_url);
                            setShowImageSelector(false);
                        }}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

export default PostSettingsSidebar;
