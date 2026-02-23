"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Twitter, Linkedin, Link2, Check } from "lucide-react";

interface ShareButtonsProps {
    title: string;
    slug: string;
    siteUrl?: string;
}

const ShareButtons = ({ title, slug, siteUrl = "" }: ShareButtonsProps) => {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const url = `${siteUrl}/blog/${slug}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        {
            label: "Twitter",
            icon: Twitter,
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        },
        {
            label: "LinkedIn",
            icon: Linkedin,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        },
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
            const textarea = document.createElement("textarea");
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-darkBorder hover:border-gold/40 rounded-xl text-sm font-medium text-muted-foreground hover:text-gold transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Share this post"
            >
                <Share2 className="w-4 h-4" />
                Share
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 bg-card border border-darkBorder rounded-xl shadow-elevated p-2 z-50 min-w-[160px]"
                    >
                        {shareLinks.map(({ label, icon: Icon, href }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gold/10 text-sm text-muted-foreground hover:text-gold transition-colors duration-150"
                                onClick={() => setIsOpen(false)}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </a>
                        ))}
                        <button
                            onClick={() => {
                                copyToClipboard();
                                setTimeout(() => setIsOpen(false), 1200);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gold/10 text-sm text-muted-foreground hover:text-gold transition-colors duration-150"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-4 h-4" />
                                    Copy Link
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShareButtons;
