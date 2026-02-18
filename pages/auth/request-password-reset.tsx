import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

const RequestPasswordResetPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                toast.dismiss();
                toast.success('Password reset email sent successfully');
                router.push('/login');
            } else {
                const data = await res.json();
                toast.dismiss();
                toast.error(data.error || 'Something went wrong');
            }
        } catch {
            toast.dismiss();
            toast.error('Network error - check your connection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center px-4">
            {/* Glow blobs */}
            <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-64 bg-gold/[0.06] rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                {/* Card */}
                <div className="p-8 rounded-2xl bg-card border border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gold rounded-2xl blur-xl opacity-25" />
                            <div className="relative p-4 bg-gold/10 border border-gold/25 rounded-2xl">
                                <KeyRound className="w-8 h-8 text-gold" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-2xl font-display font-bold text-foreground text-center mb-1">
                        Reset your password
                    </h1>
                    <p className="text-sm text-muted-foreground text-center mb-8">
                        Enter your email and we&apos;ll send you a reset link.
                    </p>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-gold" /> Email address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                            />
                        </div>

                        <Button type="submit" className="w-full gap-2" disabled={loading}>
                            {loading ? (
                                <span className="inline-block w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><Mail className="w-4 h-4" /> Send Reset Email</>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        <Link href="/login" className="inline-flex items-center gap-1.5 text-gold hover:underline font-medium">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RequestPasswordResetPage;