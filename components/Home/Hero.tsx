import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ChevronDown } from 'lucide-react';

export interface HeroPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    published_at: Date | null;
    featured_image_url: string | null;
    category: { name: string; slug: string } | null;
}

interface HeroProps {
    posts: HeroPost[];
}

const FALLBACK = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop';

const fmt = (d: Date | null) =>
    d
        ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
        : '';

/* ─── Framer Motion variants ──────────────────────────────────────────── */
const wrapVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.06 } },
};
const cardVariant = {
    hidden: { opacity: 0, y: 30, scale: 0.975 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
};
const scrollHint = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { delay: 1.2, duration: 0.7 } },
};

/* ─── Shared micro-components ─────────────────────────────────────────── */
const Tag: React.FC<{ name: string; small?: boolean }> = ({ name, small }) => (
    <span
        className={`inline-flex shrink-0 items-center rounded-full bg-gold/15 border border-gold/30
                    text-gold font-semibold tracking-wide backdrop-blur-sm
                    ${small ? 'py-0.5 px-2 text-[10px]' : 'py-1 px-3 text-[11px]'}`}
    >
        {name}
    </span>
);

const When: React.FC<{ date: Date | null; tiny?: boolean }> = ({ date, tiny }) => (
    <span className={`flex shrink-0 items-center gap-1 text-light/40 font-medium ${tiny ? 'text-[10px]' : 'text-xs'}`}>
        <Calendar className={tiny ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        {fmt(date)}
    </span>
);

/* ─── Hero component ──────────────────────────────────────────────────── */
const Hero: React.FC<HeroProps> = ({ posts }) => {
    if (!posts || posts.length === 0) return null;

    const [main, b, c] = posts;
    const side = [b, c].filter(Boolean) as HeroPost[];

    return (
        /* Header is h-16 (4 rem). Section fills the remaining viewport exactly. */
        <section
            className="relative w-full bg-dark overflow-hidden"
            style={{ height: 'calc(100vh - 4rem)' }}
        >
            <motion.div
                variants={wrapVariants}
                initial="hidden"
                animate="show"
                className="h-full flex flex-col md:flex-row gap-2 p-2"
            >
                {/* ══════════════════════════════════
                    MAIN post — left on desktop, top on mobile
                ══════════════════════════════════ */}
                <motion.article
                    variants={cardVariant}
                    /* Mobile: flex proportion (2.4x the side area); Desktop: fixed ratio column */
                    className="relative group cursor-pointer rounded-2xl overflow-hidden
                               flex-[1] min-h-0
                               md:flex-[1.45]"
                >
                    <Link href={`/blog/${main.slug}`} className="absolute inset-0 z-20" aria-label={main.title} />

                    {/* BG image */}
                    <div className="absolute inset-0">
                        <img
                            src={main.featured_image_url || FALLBACK}
                            alt={main.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out
                                       group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-dark/10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-dark/30 to-transparent" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                                        bg-[radial-gradient(ellipse_at_30%_80%,rgba(248,204,77,0.09)_0%,transparent_55%)]" />
                    </div>

                    {/* Hover ring */}
                    <div className="absolute inset-0 z-10 rounded-2xl ring-1 ring-white/5
                                    group-hover:ring-gold/25 transition-all duration-500 pointer-events-none" />

                    {/* Overlay content */}
                    <div className="absolute inset-0 z-10 flex flex-col justify-between p-5 md:p-6 lg:p-8">
                        {/* Top meta row */}
                        <div className="flex items-center justify-between gap-3">
                            {main.category && <Tag name={main.category.name} />}
                            <When date={main.published_at} />
                        </div>

                        {/* Bottom editorial block */}
                        <div className="space-y-2 md:space-y-3">
                            <div className="w-8 h-[2px] rounded-full bg-gold/70" />
                            <h2
                                className="font-bold font-display text-light leading-[1.18] line-clamp-3
                                           group-hover:text-gold/90 transition-colors duration-300
                                           text-xl sm:text-2xl md:text-3xl lg:text-[2rem]
                                           max-w-[560px]"
                            >
                                {main.title}
                            </h2>
                            {main.excerpt && main.excerpt !== main.title && (
                                <p className="text-light/58 text-sm font-inter line-clamp-2 max-w-lg leading-relaxed">
                                    {main.excerpt}
                                </p>
                            )}
                            <span className="inline-flex items-center gap-1.5 text-gold font-semibold text-sm
                                             transition-all duration-300 group-hover:gap-2.5">
                                Read Article
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                        </div>
                    </div>
                </motion.article>

                {/* ══════════════════════════════════
                    SIDE posts — right column on desktop
                             stacked horizontal cards on mobile
                ══════════════════════════════════ */}
                {side.length > 0 && (
                    <div className="flex flex-col gap-2 flex-[1] md:flex-[1]">
                        {side.map((post) => (
                            <motion.article
                                key={post.id}
                                variants={cardVariant}
                                className="relative group cursor-pointer rounded-2xl overflow-hidden flex-1 min-h-0"
                            >
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="absolute inset-0 z-20"
                                    aria-label={post.title}
                                />

                                {/* ── MOBILE: horizontal card (thumbnail left / content right) ── */}
                                <div className="md:hidden h-full flex flex-row">
                                    {/* Thumbnail strip */}
                                    <div className="relative w-[38%] shrink-0 overflow-hidden rounded-l-2xl">
                                        <img
                                            src={post.featured_image_url || FALLBACK}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500
                                                       group-hover:scale-[1.05]"
                                        />
                                        {/* Fade toward content panel */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dark/20 to-darkElevated/95" />
                                    </div>

                                    {/* Content panel */}
                                    <div className="flex flex-col justify-between bg-darkElevated flex-1 px-3.5 py-3
                                                    border border-l-0 border-darkBorder group-hover:border-gold/20
                                                    rounded-r-2xl transition-colors duration-300">
                                        {/* Meta */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {post.category && <Tag name={post.category.name} small />}
                                            <When date={post.published_at} tiny />
                                        </div>

                                        {/* Title + CTA */}
                                        <div className="space-y-1">
                                            <div className="w-5 h-[2px] rounded-full bg-gold/55" />
                                            <h3 className="font-bold font-display text-light leading-snug line-clamp-2
                                                          text-sm group-hover:text-gold/90 transition-colors duration-300">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-light/40 text-[11px] font-inter line-clamp-1 leading-relaxed">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                        </div>

                                        <span className="inline-flex items-center gap-1 text-gold/75 text-[11px] font-semibold
                                                         transition-all duration-300 group-hover:gap-1.5">
                                            Read more
                                            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                                        </span>
                                    </div>
                                </div>

                                {/* ── DESKTOP: full-bleed image with overlay ── */}
                                <div className="hidden md:block absolute inset-0">
                                    <img
                                        src={post.featured_image_url || FALLBACK}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out
                                                   group-hover:scale-[1.05]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/58 to-dark/12" />
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                                                    bg-[radial-gradient(ellipse_at_30%_80%,rgba(248,204,77,0.07)_0%,transparent_50%)]" />
                                </div>

                                {/* Desktop hover ring */}
                                <div className="hidden md:block absolute inset-0 z-10 rounded-2xl ring-1 ring-white/5
                                                group-hover:ring-gold/25 transition-all duration-500 pointer-events-none" />

                                {/* Desktop overlay content */}
                                <div className="hidden md:flex absolute inset-0 z-10 flex-col justify-between p-4 lg:p-5">
                                    <div className="flex items-center justify-between gap-2">
                                        {post.category && <Tag name={post.category.name} small />}
                                        <When date={post.published_at} tiny />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="w-5 h-[2px] rounded-full bg-gold/55" />
                                        <h3
                                            className="font-bold font-display text-light leading-snug line-clamp-2
                                                       group-hover:text-gold/90 transition-colors duration-300
                                                       text-base lg:text-[1.05rem]"
                                        >
                                            {post.title}
                                        </h3>
                                        <span className="inline-flex items-center gap-1 text-gold/75 text-[11px] font-medium
                                                         transition-all duration-300 group-hover:gap-1.5">
                                            Read more
                                            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                                        </span>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* ── Scroll hint ── */}
            <motion.div
                variants={scrollHint}
                initial="hidden"
                animate="show"
                className="absolute bottom-2.5 left-3/4 md:left-1/2 -translate-x-1/2 z-30
                           flex flex-col items-center gap-0.5 pointer-events-none"
            >
                <span className="text-light/25 text-[9px] uppercase tracking-[0.22em] font-medium">More</span>
                <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <ChevronDown className="w-3.5 h-3.5 text-light/20" />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
