import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { token } = router.query;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password }),
        });

        setLoading(false);

        if (res.ok) {
            toast.success('Password reset successfully');
            router.push('/login');
        } else {
            const data = await res.json();
            toast.error(data.error || 'Something went wrong');
        }
    };

    return (
        <div className="bg-light dark:bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray dark:text-primary">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        Or{' '}
                        <Link href="/login" className="font-medium text-accent hover:text-secondary-focus dark:text-secondary">
                            Back to login
                        </Link>
                    </p>
                </div>
                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-slate-900 font-bold dark:text-slate-300">New Password</span>
                        </label>
                        <input
                            title="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input input-bordered w-full bg-slate-100 dark:bg-gray text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:outline-none border-accent dark:border-primary"
                            placeholder="New Password"
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-slate-900 font-bold dark:text-slate-300">Confirm Password</span>
                        </label>
                        <input
                            title="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="input input-bordered w-full bg-slate-100 dark:bg-gray text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:outline-none border-accent dark:border-primary"
                            placeholder="Confirm Password"
                        />
                    </div>
                    <div className="flex justify-between mt-4">
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;