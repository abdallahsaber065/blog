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
import { LayoutDashboard, PenSquare, Folder, Users, LogOut, User, Home, Info, Mail, Compass, ShieldAlert } from 'lucide-react';

interface MobileNavDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const RoleList = ['admin', 'moderator', 'editor'];

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Discover', href: '/explore', icon: Compass },
        { name: 'About', href: '/about', icon: Info },
        { name: 'Contact', href: '/contact', icon: Mail },
    ];

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 border-r-0 bg-background/95 backdrop-blur-xl">
                <div className="flex flex-col h-full overflow-y-auto">
                    <div className="p-6 border-b border-border/50">
                        <SheetTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold to-gold/70">
                            Menu
                        </SheetTitle>
                    </div>

                    <div className="flex-1 py-4 px-3 space-y-6">
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-gold/10 text-gold shadow-sm shadow-gold/5'
                                            : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {session && RoleList.includes(session.user.role) && (
                            <div className="space-y-2 px-1">
                                <p className="px-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    Admin View
                                </p>
                                <div className="space-y-1">
                                    <Link href="/admin/posts" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors">
                                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                                    </Link>
                                    <Link href="/admin/categories" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors">
                                        <Folder className="w-4 h-4" /> Categories
                                    </Link>
                                    <Link href="/admin/posts/create" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors">
                                        <PenSquare className="w-4 h-4" /> Create Post
                                    </Link>
                                    {session && 'admin' === session.user.role && (
                                        <Link href="/admin/users" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors">
                                            <Users className="w-4 h-4" /> Manage Users
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-border/50 bg-foreground/5 mt-auto">
                        <div className="space-y-2">
                            {session ? (
                                <>
                                    <Link href="/profile" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-foreground/10 transition-colors">
                                        <div className="bg-gold/20 p-1.5 rounded-full text-gold">
                                            <User className="w-4 h-4" />
                                        </div>
                                        Profile
                                        {session.user.role === 'admin' && (
                                            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded-full ring-1 ring-gold/20">Admin</span>
                                        )}
                                    </Link>
                                    <button
                                        onClick={() => { signOut(); onClose(); }}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" /> Logout
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href="/login" onClick={onClose} className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-foreground/10 transition-colors">Login</Link>
                                    <Link href="/signup" onClick={onClose} className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-gold text-dark hover:bg-gold/90 transition-colors shadow-sm shadow-gold/20">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default MobileNavDrawer;

