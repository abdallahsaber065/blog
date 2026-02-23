"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileNavDrawer from './MobileNavDrawer';
import Logo from './Logo';
import SearchBar from './SearchBar';
import { MenuIcon } from '@/components/Icons';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, LogOut, User, LayoutDashboard, PenSquare, Folder, Users, Bookmark } from 'lucide-react';

const RoleList = ['admin', 'moderator', 'editor'];

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/explore', label: 'Explore' },
];

const adminLinks = [
  { href: '/admin/posts', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/posts/create', label: 'Create Post', icon: PenSquare },
  { href: '/admin/categories', label: 'Manage Categories', icon: Folder },
];

const Header: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const userName = session?.user.name || '';
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, userName.includes(' ') ? 2 : 1);

  useEffect(() => {
    setIsMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!isMounted) return null;

  const isAdmin = pathname?.startsWith('/admin');

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-[49] w-full transition-all duration-300 ${scrolled
        ? 'bg-dark/85 backdrop-blur-xl shadow-elevated border-b border-darkBorder'
        : 'bg-dark/60 backdrop-blur-md border-b border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* ── Left: mobile menu + logo ── */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gold/10 text-foreground transition-colors duration-200"
            aria-label="Open Menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            {!isDrawerOpen && <MenuIcon className="w-5 h-5" />}
          </button>
          <MobileNavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
          <Logo />
        </div>

        {/* ── Center: desktop nav ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.15, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${isActive
                    ? 'text-gold'
                    : 'text-foreground/70 hover:text-foreground hover:bg-gold/8'
                    }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-lg bg-gold/12 border border-gold/25"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}

          {/* Admin dropdown */}
          {session && RoleList.includes(session.user.role) && (
            <div
              className="relative"
              onMouseEnter={() => setAdminOpen(true)}
              onMouseLeave={() => setAdminOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${isAdmin ? 'text-gold' : 'text-foreground/70 hover:text-foreground hover:bg-gold/8'
                  }`}
              >
                Admin
                <motion.span
                  animate={{ rotate: adminOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
                {isAdmin && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-lg bg-gold/12 border border-gold/25"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}
              </button>

              <AnimatePresence>
                {adminOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-52 rounded-2xl border border-darkBorder bg-darkSurface/95 backdrop-blur-xl shadow-elevated p-1.5"
                  >
                    {adminLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${pathname === item.href
                            ? 'text-gold bg-gold/10'
                            : 'text-foreground/70 hover:text-foreground hover:bg-gold/8'
                            }`}
                        >
                          <Icon className="w-4 h-4 opacity-70" />
                          {item.label}
                        </Link>
                      );
                    })}
                    {session && session.user.role === 'admin' && (
                      <Link
                        href="/admin/users"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 mt-0.5 border-t border-lightBorder dark:border-darkBorder ${pathname === '/admin/users'
                          ? 'text-gold bg-gold/10'
                          : 'text-foreground/70 hover:text-foreground hover:bg-gold/8'
                          }`}
                      >
                        <Users className="w-4 h-4 opacity-70" />
                        Manage Users
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* ── Right: search + avatar ── */}
        <div className="flex items-center gap-2">
          <SearchBar />

          <div className="relative group flex items-center h-full">
            <button
              className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-gold/50 transition-all duration-200"
              aria-label="User Menu"
            >
              {!imageError && session?.user?.profile_image_url ? (
                <img
                  src={session.user.profile_image_url}
                  alt={userName.split(' ')[0] || 'User'}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-dark dark:bg-darkElevated text-gold text-sm font-bold border border-darkBorder">
                  {initials || '?'}
                </div>
              )}
            </button>

            {/* Dropdown */}
            <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
              <div className="w-56 rounded-2xl border border-lightBorder dark:border-darkBorder bg-light/95 dark:bg-darkSurface/95 backdrop-blur-xl shadow-elevated p-1.5 scale-95 group-hover:scale-100 transition-transform origin-top-right">
                {status === 'authenticated' ? (
                  <>
                    <div className="px-3 py-2.5 border-b border-lightBorder dark:border-darkBorder mb-1">
                      <p className="text-sm font-semibold text-foreground truncate">{session?.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session?.user.email}</p>
                      {session?.user?.role && RoleList.includes(session.user.role) && (
                        <Badge variant="outline" className="mt-1.5 text-[10px] px-2 py-0.5">{session.user.role.toUpperCase()}</Badge>
                      )}
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-gold/8 transition-colors duration-150">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link href="/profile/library" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-gold/8 transition-colors duration-150">
                      <Bookmark className="w-4 h-4" />
                      Library
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-danger hover:bg-red-500/10 transition-colors duration-150 mt-0.5"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-gold/8 transition-colors duration-150">
                      Sign In
                    </Link>
                    <Link href="/signup" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gold hover:bg-gold/10 transition-colors duration-150">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;