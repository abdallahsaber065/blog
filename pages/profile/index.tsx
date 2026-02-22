import React, { useState, useRef } from 'react';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import SmartImage from '@/components/SmartImage';
import { resolveImageUrl } from '@/lib/utils';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { GetServerSideProps } from 'next';
import ProfileInfo from '@/components/Profile/ProfileInfo';
import AccountDetails from '@/components/Profile/AccountDetails';
import DangerZone from '@/components/Profile/DangerZone';
import ChangePasswordDialog from '@/components/Profile/ChangePasswordDialog';
import ImageEditor from '@/components/Profile/ImageEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, ImageIcon, User as UserIcon, Loader2, Sparkles, Camera, Calendar, Edit } from 'lucide-react';
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

interface ProfilePageProps {
    user: User | null;
}

const ProfilePage = ({ user }: ProfilePageProps) => {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(session?.user.profile_image_url || null);
    const [imageError, setImageError] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const userName = session?.user.name || '';
    const initials = userName.split(' ').map(name => name[0]).join('').substring(0, userName.includes(' ') ? 2 : 1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch(`/api/users`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ targetId: user?.id }),
            });

            if (response.ok) {
                toast.dismiss();
                toast.success('Account deleted successfully.');
                signOut();
            } else {
                toast.dismiss();
                toast.error('Failed to delete account.');
            }
        } catch (error) {
            toast.dismiss();
            toast.error('An error occurred. Please try again.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setCurrentImage(URL.createObjectURL(e.target.files[0]));
            setIsEditorOpen(true);
        }
    };

    const handleSave = async (croppedImage: Blob) => {
        setCurrentImage(URL.createObjectURL(croppedImage));
        setCroppedBlob(croppedImage);

        setIsUploading(true);
        const formData = new FormData();
        const file = new File([croppedImage], selectedFile?.name || 'cropped-image.jpg', { type: 'image/jpeg' });
        formData.append('file', file);
        formData.append('userId', user?.id.toString() || '');
        formData.append('saveDir', 'avatars');

        const res = await fetch('/api/media/upload-image', {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            toast.dismiss();
            toast.success('File uploaded successfully.');
            const responsejson = await res.json();
            const media = responsejson.media;

            try {
                const data = {
                    profile_image_url: media.public_url,  // Store full URL, not relative key
                };

                const response = await fetch('/api/users', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: session?.user.id, data
                    }),
                });

                if (response.ok) {
                    toast.dismiss();
                    toast.success('Profile image updated successfully.');
                    const scrollPosition = window.scrollY;
                    update({ profile_image_url: media.public_url }).then(() => {
                        window.scrollTo(0, 40);
                    });
                } else {
                    toast.dismiss();
                    toast.error('Failed to update profile image.');
                }
            } catch (error) {
                toast.dismiss();
                toast.error('An error occurred. Please try again.');
            }
        } else {
            const data = await res.json();
            toast.dismiss();
            toast.error(data.error || 'Something went wrong');
        }
        setIsUploading(false);
        setIsEditorOpen(false);
        setCroppedBlob(null);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-gold dark:text-goldLight" />
                    <p className="text-muted-foreground">Loading your profile...</p>
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
                            <UserIcon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl text-foreground font-display">Profile Access</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-muted-foreground">
                            You need to be signed in to view your profile.
                        </p>
                        <Button
                            onClick={() => signIn()}
                            className="w-full bg-gradient-to-r from-gold to-goldDark hover:from-goldDark hover:to-gold text-dark shadow-gold transition-all duration-300 hover:shadow-gold-lg"
                            size="lg"
                        >
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light dark:bg-dark overflow-hidden relative">
            {/* Decorative blooms for "Gold Bloom" effect */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/[0.08] rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-gold/[0.05] rounded-full blur-[100px] pointer-events-none"></div>

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pt-12 relative z-10 pb-12">
                {user ? (
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Left Sidebar - Profile Summary & Picture */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full lg:w-1/3 flex flex-col gap-6"
                        >
                            <Card className="overflow-hidden border-lightBorder dark:border-darkBorder bg-card shadow-elevated">
                                <CardContent className="p-0">
                                    <div className="p-6 flex flex-col items-center">
                                        {/* Profile Image Display */}
                                        <div className="relative group mb-4">
                                            <div className="absolute inset-0 bg-gold rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                                            {!imageError && (currentImage || user.profile_image_url) ? (
                                                <SmartImage
                                                    src={currentImage || resolveImageUrl(user.profile_image_url)}
                                                    alt="Profile Image"
                                                    imgClassName="relative rounded-full w-32 h-32 object-cover ring-4 ring-light dark:ring-dark shadow-xl z-10 transition-transform duration-300 group-hover:scale-[1.02]"
                                                    className="relative rounded-full w-32 h-32 object-cover ring-4 ring-light dark:ring-dark shadow-xl z-10 transition-transform duration-300 group-hover:scale-[1.02]"
                                                    onError={() => setImageError(true)}
                                                    width={128}
                                                    height={128}
                                                />
                                            ) : (
                                                <div className="relative flex items-center justify-center bg-gradient-to-br from-gold to-goldDark rounded-full w-32 h-32 text-dark text-4xl font-bold font-display shadow-xl ring-4 ring-light dark:ring-dark z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                                                    {initials}
                                                </div>
                                            )}
                                            {croppedBlob && (
                                                <Badge className="absolute top-0 right-0 z-20 bg-success border-2 border-light dark:border-dark text-white font-semibold">
                                                    New
                                                </Badge>
                                            )}

                                            <button
                                                onClick={handleButtonClick}
                                                className="absolute bottom-0 right-0 z-20 p-2.5 bg-card text-foreground rounded-full shadow-lg border border-lightBorder dark:border-darkBorder hover:text-gold dark:hover:text-gold transition-colors"
                                                title="Change Profile Picture"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h1 className="text-2xl font-bold font-display text-foreground text-center mb-1">
                                            {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}` : user.username}
                                        </h1>
                                        <p className="text-sm font-medium text-muted-foreground text-center mb-6">
                                            @{user.username}
                                        </p>

                                        <div className="w-full flex flex-col gap-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-lightBorder dark:border-darkBorder bg-lightSurface/50 dark:bg-darkSurface/50 p-4">

                                        <div className="flex flex-col gap-3">
                                            <Button
                                                onClick={() => router.push('/profile/edit')}
                                                variant="outline"
                                                className="w-full flex items-center justify-center gap-2 border-lightBorder dark:border-darkBorder hover:bg-lightSurface dark:hover:bg-darkSurface transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit Profile
                                            </Button>
                                            <ChangePasswordDialog userId={user.id} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Right Content Area */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="w-full lg:w-2/3 flex flex-col gap-6"
                        >
                            {/* Profile Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                                <ProfileInfo user={user} />
                                <AccountDetails user={user} />
                            </div>

                            <DangerZone handleDeleteAccount={handleDeleteAccount} />

                        </motion.div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-lightBorder dark:border-darkBorder shadow-elevated"
                    >
                        <div className="inline-flex p-4 rounded-full bg-gold/10 text-gold mb-6 animate-pulse">
                            <Loader2 className="w-12 h-12 animate-spin" />
                        </div>
                        <h2 className="text-xl font-bold font-display text-foreground mb-2">Loading Profile</h2>
                        <p className="text-muted-foreground">Fetching your account details...</p>
                    </motion.div>
                )}
            </main>

            {isEditorOpen && currentImage && (
                <ImageEditor
                    imageSrc={currentImage}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSave}
                    isUploading={isUploading}
                />
            )}
        </div >
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

export default ProfilePage;