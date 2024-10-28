import { useState } from "react";
import Link from "next/link";

const AdminDropdown = ({ session, status }: { session: any, status: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const adminRoles = ["admin", "moderator", "editor"];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (status !== "authenticated" || !adminRoles.includes(session?.user?.role)) {
    return null;
  }

  return (
    <div className="relative">
      <button
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdown"
        onClick={toggleDropdown}
        className="text-dark dark:text-light bg-light dark:bg-dark hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 font-medium rounded-lg text-sm px-2  text-center inline-flex items-center"
        type="button"
      >
        Admin
        <svg
          className="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id="dropdown"
          className="z-10 absolute mt-2 w-48 bg-light dark:bg-dark divide-y divide-gray-200 dark:divide-gray-700 rounded-lg shadow"
        >
          <ul className="text-sm text-dark dark:text-light" aria-labelledby="dropdownDefaultButton">
            <li>
              <Link href="/admin/" className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-white">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/posts/create" className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-white">
                Create Post
              </Link>
            </li>
            <li>
              <Link href="/admin/edit-categories" className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-white">
                Edit Categories
              </Link>
            </li>
            <li>
              <Link href="/admin/subscriptions" className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-white">
                Newsletter Subscriptions
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDropdown;