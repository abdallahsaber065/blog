import AIChatbot from '@/components/Chatbot/AIChatbot';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const RoleList = ['admin', 'moderator', 'editor'];

export default function ChatbotPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session && !RoleList.includes(session.user.role)) {
            router.push('/');
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!session || !RoleList.includes(session.user.role)) {
        return null;
    }

    return (
        <>
            <Head>
                <title>AI Chatbot - Blog Assistant</title>
                <meta name="description" content="Interactive AI chatbot for blog management and content assistance" />
            </Head>
            <AIChatbot />
        </>
    );
}
