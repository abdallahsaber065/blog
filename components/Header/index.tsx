"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Logo from "./Logo";
import { LinkedinIcon, TwitterIcon, GithubIcon } from "../Icons";
import siteMetadata from "@/lib/siteMetaData";
import ThemeSwitcher from "./ThemeSwitcher";
import AdminDropdown from "./AdminDropdown";
import NavLinks from "./NavLinks";
import MobileHeader from "./MobileHeader";

const Header = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <MobileHeader />
      <header className="w-full p-4 px-5 sm:px-10 items-center justify-between hidden sm:flex">
        <Logo />

        <nav className="w-max py-3 px-8 border border-solid border-dark rounded-full font-medium capitalize items-center flex fixed top-1 right-1/2 translate-x-1/2 bg-light/80 backdrop-blur-sm z-50 bg-light dark:bg-dark text-dark dark:text-light">
          <NavLinks />
          <span className="mx-2">|</span>
          <AdminDropdown session={session} status={status} />
          {isMounted && <ThemeSwitcher />}
        </nav>

        <div className="flex items-center">
          <a
            href={siteMetadata.linkedin}
            rel="noopener noreferrer"
            className="inline-block w-6 h-6 mr-4"
            aria-label="Reach out to me via LinkedIn"
            target="_blank"
          >
            <LinkedinIcon className="hover:scale-125 transition-all ease duration-200" />
          </a>
          <a
            href={siteMetadata.twitter}
            rel="noopener noreferrer"
            className="inline-block w-6 h-6 mr-4"
            aria-label="Reach out to me via Twitter"
            target="_blank"
          >
            <TwitterIcon className="hover:scale-125 transition-all ease duration-200" />
          </a>
          <a
            href={siteMetadata.github}
            rel="noopener noreferrer"
            className="inline-block w-6 h-6 mr-4"
            aria-label="Check my profile on Github"
            target="_blank"
          >
            <GithubIcon className="hover:scale-125 transition-all ease duration-200 dark:fill-light" />
          </a>
        </div>
      </header>
    </>
  );
};

export default Header;