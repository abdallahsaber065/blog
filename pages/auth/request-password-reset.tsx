import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RequestPasswordResetPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/auth/request-password-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        setLoading(false);

        if (res.ok) {
            toast.dismiss();
            toast.success('Password reset email sent successfully');
            router.push('/login');
        } else {
            const data = await res.json();
            toast.dismiss();
            toast.error(data.error || 'Something went wrong');
        }
    };

    return (
        <div className="bg-light dark:bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-center text-3xl">
                        Request Password Reset
                    </CardTitle>
                    <CardDescription className="text-center">
                        Or{' '}
                        <Link href="/login" className="font-medium text-accent hover:text-secondary-focus dark:text-secondary">
                            Back to login
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-900 font-bold dark:text-slate-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                title="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email address"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Email'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RequestPasswordResetPage;