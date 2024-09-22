import React from "react";
import Category from "./Category";
import { Tag as PrismaCategory } from "@prisma/client";

interface CategoriesProps {
  categories: PrismaCategory[];
  currentSlug: string;
}

const Categories = ({ categories, currentSlug }: CategoriesProps) => {
  return (
    <div className="px-0 md:px-10 sxl:px-20 mt-10 border-t-2 text-dark dark:text-light border-b-2 border-solid border-dark dark:border-light py-4 flex items-start flex-wrap font-medium mx-5 md:mx-10">
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
  );
};

export default Categories;