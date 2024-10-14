import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ClipLoader } from 'react-spinners';

const RequestVerification = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleRequestVerification = async () => {
        setLoading(true);
        setMessage('');

        const res = await fetch('/api/auth/request-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: session?.user?.email }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            setMessage('Verification email sent successfully.');
        } else {
            setMessage(data.error);
        }
    };

    return (
        <div className="mt-4">
            <button
                onClick={handleRequestVerification}
                className="btn btn-primary"
                disabled={loading}
            >
                {loading ? <ClipLoader size={24} color="#ffffff" /> : 'Request Verification Email'}
            </button>
            {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        </div>
    );
};

export default RequestVerification;