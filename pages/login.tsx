"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from 'lucide-react';

const AuthDecorPanel = ({ title, subtitle, features }: {
  title: string;
  subtitle: string;
  features: string[];
}) => (
  <div className="hidden lg:flex lg:w-1/2 bg-dark relative overflow-hidden flex-col justify-between p-12 xl:p-16">
    {/* Background glow */}
    <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/8 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/3 rounded-full blur-3xl pointer-events-none" />

    {/* Top bar */}
    <div className="relative z-10">
      <Link href="/" className="text-2xl font-display font-bold text-white">
        Dev<span className="text-gold">Trend</span>
      </Link>
    </div>

    {/* Center content */}
    <div className="relative z-10 space-y-8">
      <div className="w-12 h-1 rounded-full bg-gold" />
      <h2 className="text-3xl xl:text-4xl font-display font-bold text-white leading-tight">
        {title}
      </h2>
      <p className="text-slate-400 text-base leading-relaxed max-w-sm">
        {subtitle}
      </p>
      <ul className="space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
            <span className="w-5 h-5 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
              <Zap className="w-3 h-3 text-gold" />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>

    {/* Bottom */}
    <p className="relative z-10 text-xs text-slate-600">
      &copy; {new Date().getFullYear()} DevTrend. All rights reserved.
    </p>
  </div>
);

const LoginPage = () => {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', { redirect: false, email, password });
    setLoading(false);
    if (result?.error) { setError(result.error); } else { router.push('/'); }
  };

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
      <AuthDecorPanel
        title="Welcome back to DevTrend"
        subtitle="Your home for in-depth articles on web development, AI and engineering."
        features={[
          "Latest developer articles & guides",
          "AI-powered content discovery",
          "Exclusive insights & tutorials",
        ]}
      />

      {/* Right — form panel */}
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
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-gold hover:text-goldDark font-semibold transition-colors">
                Create one →
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="pl-10 h-11 bg-lightSurface dark:bg-darkSurface border-lightBorder dark:border-darkBorder"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                <Link href="/auth/request-password-reset" className="text-xs text-gold hover:text-goldDark transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-lightSurface dark:bg-darkSurface border-lightBorder dark:border-darkBorder"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-danger bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-dark border-t-transparent animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;