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
          {!isDrawerOpen && <MenuIcon className='w-6 h-6' />}
        </button>
        <MobileNavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        {/* Logo */}
        <Logo />
      </div>

      {/* Navbar Center */}
      <div className="navbar-center hidden lg:flex text-slate-800 font-bold dark:text-light">
        <ul className="menu menu-horizontal px-1">
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
            <Link href="/resources" className={`hover:text-primary dark:hover:text-accent ${pathname === '/resources' ? 'font-bold text-primary dark:text-accent' : ''}`}>
              Resources
            </Link>
          </li>
          {session?.user.role === 'admin' && (
            <li>
              <details>
                <summary className="hover:text-primary dark:hover:text-accent">Admin</summary>
                <ul className="bg-light dark:bg-dark rounded-t-none p-2">
                  <li>
                    <Link href="/admin/categories" className="hover:text-primary dark:hover:text-accent">
                      Edit Categories
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/create-post" className="hover:text-primary dark:hover:text-accent">
                      Create Post
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/edit-post" className="hover:text-primary dark:hover:text-accent">
                      Edit Post
                    </Link>
                  </li>
                </ul>
              </details>
            </li>
          )}
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end flex items-center space-x-4">
        <SearchBar />

        {/* Notification Icon */}
        {/* <NotificationIcon /> */}

        {/* Dark Mode Toggle */}
        <ThemeSwitcher /> {/* Use ThemeSwitcher component */}

        {/* Subscribe Button */}
        {/* <SubscribeButton /> */}

        {/* User Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar" aria-label="User Menu">
            <div className="w-10 rounded-full">
              <img src='/static/images/profile.jpg' alt="User Avatar" className="rounded-full" />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-light dark:bg-dark rounded-box w-52"
          >
            {status === 'authenticated' ? (
              <>
                <li>
                  <Link href="/profile">
                    Profile
                    {RoleList.includes(session?.user.role) && (
                      <span className="badge badge-primary dark:badge-accent ml-2">{session?.user.role.toUpperCase()}</span>
                    )}
                  </Link>
                </li>
                <li>
                  <button onClick={() => signOut()} className="text-danger dark:text-warning">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login">Login</Link>
                </li>
                <li>
                  <Link href="/signup">Sign Up</Link>
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