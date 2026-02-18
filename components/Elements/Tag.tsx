import { cx } from "@/lib";
import Link from "next/link";
import React from "react";

interface TagProps {
  link?: string;
  name: string;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ link = "#", name, ...props }) => {
  return (
    <Link
      href={link}
      className={cx(
        "inline-block py-1.5 sm:py-2 px-4 sm:px-6 bg-dark/80 dark:bg-darkSurface text-gold border border-gold/40 rounded-full capitalize font-semibold text-xs sm:text-sm hover:bg-gold hover:text-dark hover:border-gold transition-all duration-200 backdrop-blur-sm",
        String(props.className)
      )}
    >
      {name}
    </Link>
  );
};

export default Tag;