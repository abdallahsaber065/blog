import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { CloseIcon } from '@/components/Icons';
import { usePathname } from 'next/navigation';

interface MobileNavDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const RoleList = ['admin', 'moderator', 'editor'];

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className={`fixed inset-0 z-50 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark shadow-lg p-4 text-slate-800">
                <button className="btn btn-ghost btn-circle mb-4" onClick={onClose} aria-label="Close Menu">
                    <CloseIcon className="h-6 w-6 text-slate-800 dark:text-white" />
                </button>
                <ul className="menu menu-vertical">
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
                    <li>
                        <Link href="/categories/all" className={`hover:text-primary font-semibold dark:hover:text-accent ${pathname === '/categories/all' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-slate-300'}`} onClick={onClose}>
                            Categories
                        </Link>
                    </li>
                    {session && RoleList.includes(session.user.role) && (
                        <li className="mt-4">
                            <button
                                className={`text-lg font-semibold flex justify-between items-center w-full focus:ring-2 
                                    
                                ${isAdminMenuOpen || pathname?.startsWith("/admin") ? 'text-white bg-primary dark:bg-accent dark:text-white focus:bg-primary focus:dark:bg-accent focus:text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white focus:ring-primary dark:focus:ring-accent focus:text-slate-800 focus:dark:text-white'}`}
                                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                            >
                                Admin
                                <span>{isAdminMenuOpen ? '-' : '+'}</span>
                            </button>
                            {isAdminMenuOpen && (
                                <ul className="mt-2 space-y-2">
                                    <li>
                                        <Link href="/admin" className={`hover:text-primary font-semibold dark:hover:text-accent ${pathname === '/admin' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-slate-300'}`} onClick={onClose}>
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/admin/categories" className={`hover:text-primary font-semibold dark:hover:text-accent ${pathname === '/admin/categories' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-slate-300'}`} onClick={onClose}>
                                            Edit Categories
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/admin/posts/create" className={`hover:text-primary font-semibold dark:hover:text-accent ${pathname === '/admin/posts/create' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-slate-300'}`} onClick={onClose}>
                                            Create Post
                                        </Link>
                                    </li>

                                    {session && "admin" === session.user.role && (
                                        <li>
                                            <Link href="/admin/users" className={`hover:text-primary font-semibold dark:hover:text-accent ${pathname === '/admin/users' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-slate-300'}`} onClick={onClose}>
                                                Manage Users
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </li>
                    )}
                    {session ? (
                        <>
                            <li>
                                <Link href="/profile" onClick={onClose} className={`hover:text-primary text-lg font-semibold dark:hover:text-accent 
                                    ${pathname === '/profile' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-white'}`}>

                                    Profile
                                    {session.user.role === 'admin' && (
                                        <span className="badge badge-primary ml-2">Admin</span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <button onClick={() => { signOut(); onClose(); }} className="text-danger text-lg font-semibold">
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link href="/login" onClick={onClose} className={`hover:text-primary font-semibold dark:hover:text-accent text-lg ${pathname === '/login' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-white'}`}>Login</Link>
                            </li>
                            <li>
                                <Link href="/signup" onClick={onClose} className={`hover:text-primary font-semibold dark:hover:text-accent text-lg ${pathname === '/signup' ? 'font-bold text-primary dark:text-accent' : 'text-slate-800 dark:text-white'}`}>Sign Up</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default MobileNavDrawer;