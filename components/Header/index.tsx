"use client"; // Add this line to mark the component as a client component

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import MobileNavDrawer from './MobileNavDrawer';
import Logo from './Logo';
import SearchBar from './SearchBar';
import ThemeSwitcher from './ThemeSwitcher'; // Import ThemeSwitcher
import { MenuIcon } from '@/components/Icons';

const RoleList = ['admin', 'moderator', 'editor'];

interface HeaderProps {
  user?: {
    first_name: string;
    last_name: string;
    role: string;
    name: string;
  } | null;
}

const Header: React.FC<HeaderProps> = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const userName = session?.user.name || '';
  const initials = userName.split(' ').map(name => name[0]).join('').substring(0, userName.includes(' ') ? 2 : 1);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading spinner, or any other placeholder
  }

  return (
    <header className="navbar bg-light dark:bg-dark shadow-md sticky top-0 z-50">
      {/* Navbar Start */}
      <div className="navbar-start">
        {/* Mobile Navigation Drawer */}
        <button className="btn btn-ghost lg:hidden" aria-label="Open Menu" onClick={() => setIsDrawerOpen(true)}>
          {!isDrawerOpen && <MenuIcon className='w-6 h-6 text-slate-800 dark:text-light font-bold' />}
        </button>
        <MobileNavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        {/* Logo */}
        <div className="hidden lg:block">
          <Logo />
        </div>
      </div>

      {/* Navbar Center */}
      <div className="navbar-center hidden lg:flex text-slate-800 font-bold dark:text-light">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/" className={`hover:text-primary dark:hover:text-accent ${pathname === '/' ? 'font-bold text-primary dark:text-accent' : ''}`}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className={`hover:text-primary dark:hover:text-accent ${pathname === '/about' ? 'font-bold text-primary dark:text-accent' : ''}`}>
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className={`hover:text-primary dark:hover:text-accent ${pathname === '/contact' ? 'font-bold text-primary dark:text-accent' : ''}`}>
              Contact
            </Link>
          </li>
          <li>
            <Link href="/categories/all" className={`hover:text-primary dark:hover:text-accent ${pathname === '/categories/all' ? 'font-bold text-primary dark:text-accent' : ''}`}>
              Categories
            </Link>
          </li>
          {session && RoleList.includes(session.user.role) && (
            <li className="dropdown dropdown-hover">
              <Link href="#" className={`${pathname?.startsWith("/admin/posts") ? "text-primary dark:text-accent" : "hover:text-primary dark:hover:text-accent"}`}>
                Admin
              </Link>
              <ul className="dropdown-content bg-light dark:bg-dark rounded-t-none p-2 left-1/2 transform -translate-x-1/2">
                <li>
                  <Link href="/admin/posts" className={`${pathname === "/admin/posts" ? "dark:text-primary text-accent" : "hover:text-primary dark:hover:text-accent"}`}>
                    Dashboard
                  </Link>
                </li>

                <li>
                  <Link href="/admin/posts/create" className={`${pathname === "/admin/posts/create" ? "dark:text-primary text-accent" : "hover:text-primary dark:hover:text-accent"}`}>
                    Create Post
                  </Link>
                </li>

                <li>
                  <Link href="/admin/categories" className={`${pathname === "/admin/categories" ? "dark:text-primary text-accent" : "hover:text-primary dark:hover:text-accent"}`}>
                    Edit Categories
                  </Link>
                </li>

                {session && "admin" === session.user.role && (
                  <li>
                    <Link href="/admin/users" className={`${pathname === "/admin/users" ? "dark:text-primary text-accent" : "hover:text-primary dark:hover:text-accent"}`}>
                      Manage Users
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end flex items-center space-x-2">
        <SearchBar />

        {/* Notification Icon */}

        {/* Dark Mode Toggle */}
        <ThemeSwitcher />

        {/* User Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar" aria-label="User Menu">
            <div className="w-10 rounded-full">
              {!imageError ? (
                <img
                  src={session?.user.profile_image_url ? `/${session?.user.profile_image_url}` : '/static/images/profile-holder.jpg'}
                  alt={userName.split(" ")[0]}
                  className="rounded-full w-full h-full object-cover p-1"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center justify-center bg-slate-950 rounded-full w-full h-full text-white text-xl font-bold ">
                  {initials}
                </div>
              )}
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 p-2 shadow-lg bg-light dark:bg-dark rounded-box w-52"
          >
            {status === 'authenticated' ? (
              <>
                <li className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                  <Link href="/profile" className="flex items-center space-x-2 p-2">
                    <span className="text-slate-800 dark:text-light font-bold">{session?.user.name.split(' ')[0]}</span>
                    {RoleList.includes(session?.user.role) && (
                      <span className="badge badge-primary dark:badge-accent ml-2">{session?.user.role.toUpperCase()}</span>
                    )}
                  </Link>
                </li>
                <li className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                  <button onClick={() => signOut()} className="flex items-center space-x-2 p-2 text-danger dark:text-warning">
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                  <Link href="/login" className="flex items-center space-x-2 p-2">
                    <span className="text-slate-800 dark:text-light font-bold">Login</span>
                  </Link>
                </li>
                <li className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md">
                  <Link href="/signup" className="flex items-center space-x-2 p-2">
                    <span className="text-slate-800 dark:text-light font-bold">Sign Up</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;