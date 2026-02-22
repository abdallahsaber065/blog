/* eslint-disable @next/next/no-img-element */
import { getSession, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { GetServerSideProps } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, UserCog, Mail, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    bio: string;
    profile_image_url: string;
    role: string;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}

interface EditProfilePageProps {
    user: User;
}

const EditProfilePage = ({ user }: EditProfilePageProps) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = {
                ...formData,
            }

            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: user.id, data }),
            });

            if (response.ok) {
                toast.dismiss();
                toast.success('Profile updated successfully.');
                // if email is updated send verification email
                if (formData.email !== user.email) {
                    const res = await fetch('/api/auth/request-verification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: formData.email }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                        toast.dismiss();
                        toast.success('Verification email sent successfully.');
                    } else {
                        toast.dismiss();
                        toast.error(data.error);
                    }
                    // sign out user if email is updated
                    signOut();
                }
                router.push('/profile');
            } else {
                toast.dismiss();
                toast.error('Failed to update profile.');
            }
        } catch (error) {
            toast.dismiss();
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-gold dark:text-goldLight" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
                <Card className="max-w-md w-full mx-4 border-lightBorder dark:border-darkBorder bg-card shadow-card dark:shadow-card-dark">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto p-4 bg-gradient-to-br from-gold to-goldDark rounded-2xl shadow-gold w-fit">
                            <UserCog className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl text-foreground">Edit Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">
                            You need to be signed in to edit your profile.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light dark:bg-dark overflow-hidden relative">
            {/* Decorative blooms for "Gold Bloom" effect */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/[0.08] rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-gold/[0.05] rounded-full blur-[100px] pointer-events-none"></div>

            {/* Main Content */}
            <main className="container mx-auto px-4 pt-12 max-w-3xl relative z-10 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-lightBorder dark:border-darkBorder shadow-elevated overflow-hidden bg-card">
                        <CardHeader className="bg-lightSurface/50 dark:bg-darkSurface/50 border-b border-lightBorder dark:border-darkBorder pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-gold to-goldDark rounded-xl shadow-gold-sm">
                                    <UserCog className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-foreground font-display">Edit Profile</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Update your personal information and preferences
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name" className="text-foreground font-medium">First Name</Label>
                                        <Input
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            placeholder="Enter your first name"
                                            className="h-12 bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus-visible:ring-gold"
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name" className="text-foreground font-medium">Last Name</Label>
                                        <Input
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            placeholder="Enter your last name"
                                            className="h-12 bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus-visible:ring-gold"
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="flex items-center gap-2 text-foreground font-medium">
                                        <User className="w-4 h-4 text-gold dark:text-goldLight" />
                                        Username
                                    </Label>
                                    <Input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your username"
                                        className="h-12 bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus-visible:ring-gold"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2 text-foreground font-medium">
                                        <Mail className="w-4 h-4 text-gold dark:text-goldLight" />
                                        Email
                                    </Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your email"
                                        className="h-12 bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus-visible:ring-gold"
                                    />
                                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                        * Changing your email will require verification and sign you out immediately.
                                    </p>
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="flex items-center gap-2 text-foreground font-medium">
                                        <FileText className="w-4 h-4 text-gold dark:text-goldLight" />
                                        Bio
                                    </Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us a little bit about yourself..."
                                        rows={5}
                                        className="resize-none bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus-visible:ring-gold p-4 transition-shadow hover:border-gold/30"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-lightBorder dark:border-darkBorder">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/profile')}
                                        disabled={isSubmitting}
                                        className="flex-1 h-12 border-lightBorder dark:border-darkBorder hover:bg-lightSurface dark:hover:bg-darkSurface transition-colors"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] h-12 bg-gradient-to-r from-gold to-goldDark hover:from-goldDark hover:to-gold text-dark shadow-gold transition-all duration-300 hover:shadow-gold-lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Saving Changes...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        };
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/user`, {
        headers: {
            cookie: context.req.headers.cookie || '',
        },
    });

    const user = await res.json();

    return {
        props: {
            user,
        },
    };
};

export default EditProfilePage;