import React, { useState, useRef } from 'react';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { GetServerSideProps } from 'next';
import ProfileInfo from '@/components/Profile/ProfileInfo';
import AccountDetails from '@/components/Profile/AccountDetails';
import ProfileActions from '@/components/Profile/ProfileActions';
import { FaFileImage, FaFileUpload } from 'react-icons/fa';
import ImageEditor from '@/components/Profile/ImageEditor';

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
    };

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'unauthenticated') {
        return (
            <main className="container mx-auto pb-16 px-4 flex-1 text-slate-900">
                <div className="max-w-md mx-auto bg-light dark:bg-dark p-8 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold text-center mb-8 text-slate-800 dark:text-light">Profile</h1>
                    <p className="text-slate-800 dark:text-light">You need to be signed in to view your profile.</p>
                    <button
                        onClick={() => signIn()}
                        className="block w-full font-bold py-2 px-4 rounded mt-8 btn btn-primary"
                    >
                        Sign In
                    </button>
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-between bg-light dark:bg-dark text-slate-900">
            <main className="container mx-auto pb-16 px-4 flex-1">
                <h1 className="text-4xl font-bold text-center text-slate-800 pt-8 dark:text-light">Profile</h1>

                <div className="max-w-4xl mx-auto bg-light dark:bg-dark p-8 rounded-lg shadow-lg shadow-slate-300 dark:shadow-slate-800">
                    {user ? (
                        <>
                            <div className="text-slate-800 dark:text-light text-center">
                                <div className="flex justify-center">
                                    {!imageError ? (
                                        <Image
                                            src={currentImage || `/${user.profile_image_url}`}
                                            alt="Profile Image"
                                            className="rounded-full w-24 h-24 object-cover p-1"
                                            onError={() => setImageError(true)}
                                            width={96}
                                            height={96}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center bg-slate-950 rounded-full w-24 h-24 object-cover text-white text-3xl font-bold">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <button
                                    onClick={handleButtonClick}
                                    className="font-bold py-2 px-4 rounded flex items-center space-x-2 bg-blue-500 text-white"
                                >
                                    <FaFileImage />
                                    <span>Choose Image</span>
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="font-bold py-2 px-4 rounded flex items-center space-x-2 bg-green-500 text-white"
                                >
                                    <FaFileUpload />
                                    <span>Save</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                <ProfileInfo user={user} />
                                <AccountDetails user={user} />
                                <ProfileActions handleDeleteAccount={handleDeleteAccount} />
                            </div>
                        </>
                    ) : (
                        <p className="text-slate-800 dark:text-light">Loading user data...</p>
                    )}
                </div>
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