"use client";
import { PrismaClient } from "@prisma/client";
import React, { useEffect, useState } from "react";

const prisma = new PrismaClient();

const ViewCounter = ({ slug }: { slug: string }, noCount = false, showCount = true) => {
  const [views, setViews] = useState(0);

  useEffect(() => {
    const incrementView = async () => {
      try {
        const post = await prisma.post.update({
          where: { slug },
          data: { views: { increment: 1 } },
        });

        if (!post) {
          console.error("Error incrementing view count: Post not found");
        }
      } catch (error) {
        console.error(
          "An error occurred while incrementing the view count:",
          error
        );
      }
    };

    if (!noCount) {
      incrementView();
    }
  }, [slug, noCount]);

  useEffect(() => {
    const getViews = async () => {
      try {
        const post = await prisma.post.findUnique({
          where: { slug },
          select: { views: true },
        });

        if (!post) {
          console.error("Error fetching view count: Post not found");
        } else {
          setViews(post.views);
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching the view count:",
          error
        );
      }
    };

    getViews();
  }, [slug]);

  if (showCount) {
    return <div>{views} views</div>;
  } else {
    return null;
  }
};

export default ViewCounter;