import Link from "next/link";

const NavLinks = () => (
  <>
    <Link href="/" className="mr-2">
      Home
    </Link>
    <Link href="/about" className="mx-2">
      About
    </Link>
    <Link href="/contact" className="mx-2">
      Contact
    </Link>
  </>
);

export default NavLinks;