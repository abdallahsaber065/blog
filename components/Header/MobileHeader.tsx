import { useState, useEffect } from "react";
import Logo from "./Logo";
import { LinkedinIcon, TwitterIcon, GithubIcon } from "../Icons";
import siteMetadata from "@/lib/siteMetaData";
import { useSession } from "next-auth/react";
import ThemeSwitcher from "./ThemeSwitcher";
import HamburgerMenu from "./HamburgerMenu";
import AdminDropdown from "./AdminDropdown";
import NavLinks from "./NavLinks";

const MobileHeader = () => {
  const [click, setClick] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, status } = useSession();
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggle = () => {
    setClick(!click);
  };

  const controlNavbar = () => {
    if (window.scrollY > lastScrollY) {
      setShow(false);
    } else {
      setShow(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <header className={`w-full p-4 px-5 flex items-center justify-between sm:hidden ${!show && 'hidden'}`}>
      <Logo />

      <HamburgerMenu toggle={toggle} />

      <nav
        className="w-max py-3 px-6 border border-solid border-dark rounded-full font-medium capitalize items-center flex fixed top-6 right-1/2 translate-x-1/2 bg-light/80 backdrop-blur-sm z-50 transition-all ease duration-300 bg-light dark:bg-dark text-dark dark:text-light"
        style={{
          top: click ? "1rem" : "-5rem",
        }}
      >
        <NavLinks />
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
  );
};

export default MobileHeader;