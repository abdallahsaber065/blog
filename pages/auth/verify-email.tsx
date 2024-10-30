// pages/verify-email.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const VerifyEmailPage = () => {
    const router = useRouter();
    const { token } = router.query;
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        if (token) {
            fetch(`/api/auth/verify-email?token=${token}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setStatus('error');
                    } else {
                        setStatus('success');
                    }
                })
                .catch(() => setStatus('error'));
        } else {
            setStatus('not-found');
        }
    }, [token]);

    return (
        <div className="min-h-screen flex flex-col justify-between bg-light dark:bg-dark">
            <main className="container mx-auto py-16 px-4 flex-1">
                <div className="max-w-md mx-auto bg-white dark:bg-gray p-8 rounded-lg shadow-lg shadow-accent dark:shadow-accentDark">
                    <h1 className="text-2xl sm:text-4xl font-bold text-center mb-8 text-accent dark:text-accentDark">Email Verification</h1>
                    {status === 'loading' && <p className="text-center text-gray dark:text-slate-300">Loading...</p>}
                    {status === 'success' && <p className="text-center text-success dark:text-successDark">Your email has been verified successfully!</p>}
                    {status === 'error' && <p className="text-center text-danger dark:text-dangerDark">Invalid or expired verification link.</p>}
                    {status === 'not-found' && <p className="text-center text-danger dark:text-dangerDark font-bold">Page Not Found</p>}
                </div>
            </main>
        </div>
    );
};

export default VerifyEmailPage;