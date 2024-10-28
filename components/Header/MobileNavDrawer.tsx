import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { CloseIcon } from '@/components/Icons';

interface MobileNavDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const RoleList = ['admin', 'moderator', 'editor'];

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
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
            <div className="fixed inset-y-0 left-0 w-64 bg-base-100 shadow-lg p-4">
                <button className="btn btn-ghost btn-circle mb-4" onClick={onClose} aria-label="Close Menu">
                    <CloseIcon className="h-6 w-6" />
                </button>
                <ul className="menu menu-vertical">
                    <li>
                        <Link href="/about" className="hover:text-primary" onClick={onClose}>
                            About
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="hover:text-primary" onClick={onClose}>
                            Contact
                        </Link>
                    </li>
                    <li>
                        <Link href="/categories/all" className="hover:text-primary" onClick={onClose}>
                            Categories
                        </Link>
                    </li>
                    {session && RoleList.includes(session.user.role) && (
                        <li className="mt-4">
                            <button
                                className="text-lg font-semibold flex justify-between items-center w-full"
                                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                            >
                                Admin
                                <span>{isAdminMenuOpen ? '-' : '+'}</span>
                            </button>
                            {isAdminMenuOpen && (
                                <ul className="mt-2 space-y-2">
                                    <li>
                                        <Link href="/admin" className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={onClose}>
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/admin/categories" className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={onClose}>
                                            Edit Categories
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/admin/posts/create" className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={onClose}>
                                            Create Post
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    )}
                    {session ? (
                        <>
                            <li>
                                <Link href="/profile" onClick={onClose} className='text-lg font-semibold'>
                                    Profile
                                    {session.user.role === 'admin' && (
                                        <span className="badge badge-primary ml-2">Admin</span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <button onClick={() => { signOut(); onClose(); }} className="text-red-600 text-lg font-semibold">
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link href="/login" onClick={onClose}>Login</Link>
                            </li>
                            <li>
                                <Link href="/signup" onClick={onClose}>Sign Up</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default MobileNavDrawer;