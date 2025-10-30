"use client";
import React, { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "../Icons";
import Link from "next/link";
import siteMetadata from "@/lib/siteMetaData";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const Footer = () => {

  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('/api/newsletterSubscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (response.ok) {
        toast.success("Subscribed successfully!");
      } else {
        toast.error("Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="mt-8 bg-dark/95 text-slate-200 dark:text-slate-100
      relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px
      before:bg-gradient-to-r before:from-transparent before:via-slate-700 before:to-transparent
      dark:shadow-[0_-1px_10px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Newsletter Section */}
        <div className="max-w-3xl mx-auto text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-white dark:text-white">
            Stay Updated with Dev Trends
          </h3>
          <p className="text-sm sm:text-base text-slate-300 dark:text-slate-300 mb-4">
            Join our community to receive the latest tech updates and guides
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              {...register("email", { required: true, maxLength: 80 })}
              className="flex-1 bg-slate-800/50 dark:bg-slate-800 text-white dark:text-white border-slate-700 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-400"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? <ClipLoader size={20} color={"#fff"} /> : "Subscribe"}
            </Button>
          </form>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-6">
          <Link href={siteMetadata.linkedin}
            className="transform hover:scale-110 transition-transform text-slate-300 hover:text-white"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedinIcon className="w-5 h-5" />
          </Link>
          <Link href={siteMetadata.twitter}
            className="transform hover:scale-110 transition-transform text-slate-300 hover:text-white"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TwitterIcon className="w-5 h-5" />
          </Link>
          <Link href={siteMetadata.github}
            className="transform hover:scale-110 transition-transform text-slate-300 hover:text-white"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-slate-800 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400 dark:text-slate-400">
            <span>&copy; 2024 Dev Trend. All rights reserved.</span>
            <div>
              Made with ❤️ by{" "}
              <Link href="https://abdallah-saber.vercel.app/"
                className="underline hover:text-primary transition-colors"
                target="_blank"
              >
                Abdallah Saber
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;