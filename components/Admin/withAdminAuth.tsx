// components/withAdminAuth.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ClipLoader } from 'react-spinners';

const withAdminAuth = (WrappedComponent: React.FC) => {
    const AdminAuth: React.FC = (props) => {
        const { data: session, status } = useSession();
        const router = useRouter();

        useEffect(() => {
            if (status === 'authenticated' && session?.user?.role !== 'admin') {
                router.push('/');
            }
        }, [status, session]);

        if (status === 'loading') {
            return <ClipLoader />;
        }

        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    return AdminAuth;
};

export default withAdminAuth;