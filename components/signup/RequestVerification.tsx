import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const RequestVerification = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    const handleRequestVerification = async () => {
        setLoading(true);

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
            toast.success('Verification email sent successfully.');
        } else {
            toast.error(data.error || 'Failed to send verification email.');
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
        </div>
    );
};

export default RequestVerification;