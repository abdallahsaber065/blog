import React, { useState, useRef } from 'react';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { GetServerSideProps } from 'next';
import ProfileInfo from '@/components/Profile/ProfileInfo';
import AccountDetails from '@/components/Profile/AccountDetails';
import ProfileActions from '@/components/Profile/ProfileActions';
import ImageEditor from '@/components/Profile/ImageEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, ImageIcon, User as UserIcon, Loader2, Sparkles } from 'lucide-react';

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

    const handleSave = (croppedImage: Blob) => {
        setCurrentImage(URL.createObjectURL(croppedImage));
        setCroppedBlob(croppedImage);
        setIsEditorOpen(false);
    };

    const handleUpload = async () => {
        if (!croppedBlob) {
            toast.dismiss();
            toast.error('Please select a file to upload.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        const file = new File([croppedBlob], selectedFile?.name || 'cropped-image.jpg', { type: 'image/jpeg' });
        formData.append('file', file);
        formData.append('userId', user?.id.toString() || '');
        formData.append('saveDir', 'profile-images');

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
                    profile_image_url: media.file_url,
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
                    update({ profile_image_url: media.file_url }).then(() => {
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
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
                    <p className="text-slate-600 dark:text-slate-400">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <Card className="max-w-md w-full mx-4">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg w-fit">
                            <UserIcon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl">Profile Access</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-slate-600 dark:text-slate-400">
                            You need to be signed in to view your profile.
                        </p>
                        <Button
                            onClick={() => signIn()}
                            className="w-full"
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Hero Section */}
            <section className="relative px-5 sm:px-10 md:px-24 sxl:px-32 py-12 md:py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <UserIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                My Profile
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                Manage your account settings and preferences
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
                {user ? (
                    <div className="space-y-6">
                        {/* Profile Image Card */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Profile Picture
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center gap-6">
                                    {/* Profile Image Display */}
                                    <div className="relative group">
                                        {!imageError ? (
                                            <Image
                                                src={currentImage || process.env.NEXT_PUBLIC_BASE_URL + `/${user.profile_image_url}`}
                                                alt="Profile Image"
                                                className="rounded-full w-32 h-32 object-cover ring-4 ring-blue-100 dark:ring-blue-900 shadow-xl"
                                                onError={() => setImageError(true)}
                                                width={128}
                                                height={128}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-32 h-32 text-white text-4xl font-bold shadow-xl ring-4 ring-blue-100 dark:ring-blue-900">
                                                {initials}
                                            </div>
                                        )}
                                        {croppedBlob && (
                                            <Badge className="absolute -top-2 -right-2 bg-green-500">
                                                New
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Image Upload Controls */}
                                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <Button
                                            onClick={handleButtonClick}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            Choose Image
                                        </Button>
                                        <Button
                                            onClick={handleUpload}
                                            disabled={!croppedBlob || isUploading}
                                            variant="success"
                                            className="flex-1"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Save Image
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profile Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProfileInfo user={user} />
                            <AccountDetails user={user} />
                        </div>

                        {/* Profile Actions */}
                        <ProfileActions handleDeleteAccount={handleDeleteAccount} />
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">Loading user data...</p>
                        </CardContent>
                    </Card>
                )}
            </main>

            {isEditorOpen && currentImage && (
                <ImageEditor
                    imageSrc={currentImage}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSave}
                />
            )}
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

export default ProfilePage;