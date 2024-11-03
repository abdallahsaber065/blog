import React, { useRef } from "react";
import Category from "./Category";
import { Tag as PrismaCategory } from "@prisma/client";

interface CategoriesProps {
  categories: PrismaCategory[];
  currentSlug: string;
}

const Categories = ({ categories, currentSlug }: CategoriesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="relative mt-10 border-t-2 text-dark dark:text-light border-b-2 border-solid border-dark dark:border-light py-4 font-medium mx-5 md:mx-10">
      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-dark text-light dark:bg-light dark:text-dark p-2 rounded-full h-full z-100 text-2xl"
        onClick={scrollLeft}
      >
        &lt;
      </button>
      <div
        ref={scrollRef}
        className="flex items-start flex-nowrap overflow-x-auto scrollbar-hide px-0 md:px-10 sxl:px-20"
      >
        <Category link="/categories/all" name="All" active={currentSlug === "all"} />
        {categories.map((cat) => (
          <Category
            key={cat.id}
            link={`/categories/${cat.slug}`}
            name={cat.name}
            active={currentSlug === cat.slug}
          />
        ))}
      </div>
      <button
        className="absolute right-0  top-1/2 transform -translate-y-1/2 bg-dark text-light dark:bg-light dark:text-dark p-2 rounded-full h-full z-100 text-2xl"
        onClick={scrollRight}
      >
        &gt;
      </button>
    </div>
  );
};

export default Categories;