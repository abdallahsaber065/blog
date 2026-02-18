"use client";
import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import SignupForm from '@/components/signup/SignupForm';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Zap } from 'lucide-react';

const SignupPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
      <div className="w-6 h-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  if (session) return (
    <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-card border border-lightBorder dark:border-darkBorder rounded-3xl p-8 shadow-elevated text-center space-y-5"
      >
        <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto">
          <span className="text-2xl font-bold text-gold">{session.user?.name?.[0] ?? '?'}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground">Already signed in</p>
          <p className="text-sm text-muted-foreground mt-1 break-all">{session.user?.email}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={() => signOut({ callbackUrl: '/login' })} variant="outline" className="w-full">Sign out</Button>
          <Button onClick={() => router.push('/')} className="w-full">Go to Home →</Button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-light dark:bg-dark">
      {/* Decorative left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-dark relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-display font-bold text-white">
            Dev<span className="text-gold">Trend</span>
          </Link>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-8">
          <div className="w-12 h-1 rounded-full bg-gold" />
          <h2 className="text-3xl xl:text-4xl font-display font-bold text-white leading-tight">
            Join the DevTrend community
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Get early access to the latest articles, AI-powered insights, and developer resources.
          </p>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: BookOpen, label: "Access 100+ in-depth articles" },
              { icon: Sparkles, label: "AI-powered content recommendations" },
              { icon: Zap, label: "Weekly developer digest" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-darkSurface border border-darkBorder">
                <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gold" />
                </div>
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">
          &copy; {new Date().getFullYear()} DevTrend. All rights reserved.
        </p>
      </div>

      {/* Right - form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden">
            <Link href="/" className="text-xl font-display font-bold text-foreground">
              Dev<span className="text-gold">Trend</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-gold hover:text-goldDark font-semibold transition-colors">
                Sign in →
              </Link>
            </p>
          </div>

          <SignupForm />
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
