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
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

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
        headers: { 'Content-Type': 'application/json' },
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
    <footer className="bg-dark text-slate-300 relative overflow-hidden">
      {/* Gold top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      {/* Subtle background glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 mb-10">

          {/* Brand / About */}
          <div className="space-y-4">
            <h3 className="text-white font-display font-bold text-lg tracking-tight">
              Dev<span className="text-gold">Trend</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              A modern blog for developers - exploring the bleeding edge of web dev, AI, and engineering craft.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { href: siteMetadata.linkedin, icon: LinkedinIcon, label: "LinkedIn" },
                { href: siteMetadata.twitter, icon: TwitterIcon, label: "Twitter" },
                { href: siteMetadata.github, icon: GithubIcon, label: "GitHub" },
              ].map(({ href, icon: Icon, label }) => (
                <motion.div key={label} whileHover={{ scale: 1.15, rotate: 5 }} whileTap={{ scale: 0.92 }}>
                  <Link
                    href={href}
                    className="social-icon-glow w-9 h-9 rounded-xl border border-darkBorder flex items-center justify-center text-slate-400 hover:text-gold hover:border-gold/40 hover:bg-gold/8 transition-colors duration-200"
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Home' },
                { href: '/explore', label: 'Explore' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-400 hover:text-gold transition-colors duration-150 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors duration-150" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest">Stay Updated</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Get the latest articles and dev insights, straight to your inbox.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...register("email", { required: true, maxLength: 80 })}
                  className="pl-9 bg-darkSurface border-darkBorder text-white placeholder:text-slate-500 focus-visible:border-gold focus-visible:ring-gold/20"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <ClipLoader size={18} color="#161618" /> : "Subscribe →"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-darkBorder flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Dev Trend. All rights reserved.</span>
          <span>
            Made with{" "}
            <span className="text-gold">♥</span>
            {" "}by{" "}
            <Link
              href="https://abdallah-saber.vercel.app/"
              className="text-slate-400 hover:text-gold transition-colors duration-150"
              target="_blank"
            >
              Abdallah Saber
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
