import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, LayoutDashboard, PenSquare, Folder, Users, LogOut, User } from 'lucide-react';

interface MobileNavDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const RoleList = ['admin', 'moderator', 'editor'];

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [isDiscoverMenuOpen, setIsDiscoverMenuOpen] = useState(false);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="left" className="w-64 p-4">
                <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <ul className="menu menu-vertical mt-4 space-y-2">
                    <li>
                        <Link href="/" className={`hover:text-primary font-semibold dark:hover:text-accent
                            ${pathname === '/' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-slate-300'}`} onClick={onClose}>
                            Home
                        </Link>
                    </li>

                    <li>
                        <Link href="/about" className={
                            `hover:text-primary font-semibold dark:hover:text-accent
                            ${pathname === '/about' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-slate-300'}`} onClick={onClose}>
                            About
                        </Link>
                    </li>

                    <li>
                        <Link href="/contact" className={`hover:text-primary font-semibold dark:hover:text-accent
                            ${pathname === '/contact' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-slate-300'}`} onClick={onClose}>
                            Contact
                        </Link>
                    </li>

                    <div className="mt-2">
                        <button
                            className={`flex justify-between items-center w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                isDiscoverMenuOpen || pathname?.startsWith('/explore')
                                    ? 'bg-gold/10 text-gold'
                                    : 'text-foreground/70 hover:text-foreground hover:bg-lightElevated dark:hover:bg-darkElevated'
                            }`}
                            onClick={() => setIsDiscoverMenuOpen(!isDiscoverMenuOpen)}
                        >
                            Discover
                            {isDiscoverMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isDiscoverMenuOpen && (
                            <div className="mt-1 ml-3 border-l border-gold/20 pl-3 space-y-1">
                                <Link href="/explore" onClick={onClose} className={`block px-3 py-2 rounded-xl text-sm font-medium transition-colors ${pathname?.startsWith('/explore') ? 'bg-gold/10 text-gold font-semibold' : 'text-foreground/70 hover:text-foreground hover:bg-lightElevated dark:hover:bg-darkElevated'}`}>All Posts</Link>
                            </div>
                        )}
                    </div>
                    {session && RoleList.includes(session.user.role) && (
                        <div className="mt-2">
                            <button
                                className={`flex justify-between items-center w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    isAdminMenuOpen || pathname?.startsWith('/admin')
                                        ? 'bg-gold/10 text-gold'
                                        : 'text-foreground/70 hover:text-foreground hover:bg-lightElevated dark:hover:bg-darkElevated'
                                }`}
                                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                            >
                                Admin
                                {isAdminMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {isAdminMenuOpen && (
                                <div className="mt-1 ml-3 border-l border-gold/20 pl-3 space-y-1">
                                    <Link href="/admin/posts" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-foreground/70 hover:text-foreground hover:bg-lightElevated dark:hover:bg-darkElevated transition-colors">
                                        <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                                    </Link>
                                    <Link href="/admin/categories" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-foreground/70 hover:text-foreground hover:bg-lightElevated dark:hover:bg-darkElevated transition-colors">
                                        <Folder className="w-3.5 h-3.5" /> Categories
                                    </Link>
                                    <Link href="/admin/posts/create" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-foreground/70 hover:text-foreground hover:bg-lightElevated dark:hover:bg-darkElevated transition-colors">
                                        <PenSquare className="w-3.5 h-3.5" /> Create Post
                                    </Link>
                                    {session && 'admin' === session.user.role && (
                                        <Link href="/admin/users" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-foreground/70 hover:text-foreground hover:bg-lightElevated dark:hover:bg-darkElevated transition-colors">
                                            <Users className="w-3.5 h-3.5" /> Manage Users
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-lightBorder dark:border-darkBorder space-y-1">
                        {session ? (
                            <>
                                <Link href="/profile" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-lightElevated dark:hover:bg-darkElevated transition-colors">
                                    <User className="w-4 h-4" />
                                    Profile
                                    {session.user.role === 'admin' && (
                                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded-full">Admin</span>
                                    )}
                                </Link>
                                <button
                                    onClick={() => { signOut(); onClose(); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={onClose} className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-lightElevated dark:hover:bg-darkElevated transition-colors">Login</Link>
                                <Link href="/signup" onClick={onClose} className="block px-4 py-2 rounded-xl text-sm font-semibold bg-gold text-dark hover:bg-goldDark transition-colors text-center">Sign Up</Link>
                            </>
                        )}
                    </div>
                </ul>
            </SheetContent>
        </Sheet>
    );
};

export default MobileNavDrawer;
