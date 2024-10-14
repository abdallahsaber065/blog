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
        }
    }, [token]);

    return (
        <div className="min-h-screen flex flex-col justify-between bg-base-100">
            <main className="container mx-auto py-16 px-4 flex-1">
                <div className="max-w-md mx-auto bg-base-200 p-8 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold text-center mb-8">Email Verification</h1>
                    {status === 'loading' && <p>Loading...</p>}
                    {status === 'success' && <p>Your email has been verified successfully!</p>}
                    {status === 'error' && <p>Invalid or expired verification link.</p>}
                </div>
            </main>
        </div>
    );
};

export default VerifyEmailPage;