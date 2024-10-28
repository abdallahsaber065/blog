import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ClipLoader } from 'react-spinners';

const withAuth = (WrappedComponent: React.FC<any>, roles: Array<string> = ['admin']) => {
    const AuthComponent: React.FC = (props) => {
        const { data: session, status } = useSession();
        const router = useRouter();

        useEffect(() => {
            if (status === 'unauthenticated') {
                router.push('/login'); // Redirect to login page if unauthenticated
            }
        }, [status, router]);

        if (status === 'loading') {
            return <ClipLoader />;
        }

        if (status === 'authenticated') {
            const userRole = session?.user?.role;
            if (!roles.includes(userRole)) {
                return <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    color: '#ff0000'
                }}>
                    You do not have permission to view this page.
                </div>;
            }
            return <WrappedComponent {...props} />;
        }

        return null; // Return null if none of the conditions match
    };

    return AuthComponent;
};

export default withAuth;