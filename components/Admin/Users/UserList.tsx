// components/UserList.tsx
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const RoleList = ['admin', 'moderator', 'editor', 'user', 'reader'];

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    posts: number;
}

interface UserListProps {
    users: User[];
    setUsers: (users: User[]) => void;
    loading: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, setUsers, loading }) => {
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [editedUser, setEditedUser] = useState<Partial<User>>({});
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    useEffect(() => {
        if (showDeleteConfirmation) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showDeleteConfirmation]);

    const handleEdit = (user: User) => {
        setEditingUserId(user.id);
        setEditedUser(user);
    };

    const handleSave = async (userId: number) => {
        try {
            await axios.put('/api/users', { id: userId, data: editedUser });
            setUsers(users.map(user => (user.id === userId ? { ...user, ...editedUser } : user)));
            toast.dismiss();
            toast.success('User updated successfully');
        } catch (error: any) {
            toast.dismiss();
            const message = error?.response?.data?.error || 'Failed to update user';
            toast.error(message);
        } finally {
            setEditingUserId(null);
            setEditedUser({});
        }
    };

    const handleCancel = () => {
        setEditingUserId(null);
        setEditedUser({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedUser({ ...editedUser, [name]: value });
    };

    const handleDelete = async () => {
        if (userToDelete !== null) {
            try {
                await axios.delete('/api/users', { data: { targetId: userToDelete } });
                setUsers(users.filter(user => user.id !== userToDelete));
                toast.dismiss();
                toast.success('User deleted successfully');
            } catch (error: any) {
                toast.dismiss();
                const message = error?.response?.data?.error || 'Failed to delete user';
                toast.error(message);
            } finally {
                setShowDeleteConfirmation(false);
                setUserToDelete(null);
            }
        }
    };

    const openDeleteConfirmation = (userId: number) => {
        setUserToDelete(userId);
        setShowDeleteConfirmation(true);
    };

    const closeDeleteConfirmation = () => {
        setShowDeleteConfirmation(false);
        setUserToDelete(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center py-20">
                <ClipLoader size={50} color="var(--gold)" />
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading user directory...</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-lightBorder dark:border-darkBorder bg-white dark:bg-darkSurface shadow-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-lightBorder dark:border-darkBorder bg-light dark:bg-dark/50">
                        <th className="px-5 py-4 text-left font-bold text-foreground">Full Name</th>
                        <th className="px-5 py-4 text-left font-bold text-foreground">Username</th>
                        <th className="px-5 py-4 text-left font-bold text-foreground">Email</th>
                        <th className="px-5 py-4 text-left font-bold text-foreground">Role</th>
                        <th className="px-5 py-4 text-center font-bold text-foreground">Posts</th>
                        <th className="px-5 py-4 text-right font-bold text-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-lightBorder dark:divide-darkBorder">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gold/5 dark:hover:bg-gold/10 transition-colors duration-200 group">
                            <td className="px-5 py-4">
                                {editingUserId === user.id ? (
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            name="first_name"
                                            value={editedUser.first_name || ''}
                                            onChange={handleChange}
                                            className="w-24 h-9 bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus:ring-gold"
                                        />
                                        <Input
                                            type="text"
                                            name="last_name"
                                            value={editedUser.last_name || ''}
                                            onChange={handleChange}
                                            className="w-24 h-9 bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus:ring-gold"
                                        />
                                    </div>
                                ) : (
                                    <span className="font-medium text-foreground">
                                        {user.first_name} {user.last_name}
                                    </span>
                                )}
                            </td>
                            <td className="px-5 py-4 text-muted-foreground">
                                {editingUserId === user.id ? (
                                    <Input
                                        type="text"
                                        name="username"
                                        value={editedUser.username || ''}
                                        onChange={handleChange}
                                        className="h-9 w-32 bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus:ring-gold"
                                    />
                                ) : (
                                    `@${user.username}`
                                )}
                            </td>
                            <td className="px-5 py-4 text-muted-foreground font-mr">
                                {editingUserId === user.id ? (
                                    <Input
                                        type="email"
                                        name="email"
                                        value={editedUser.email || ''}
                                        onChange={handleChange}
                                        className="h-9 w-48 bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus:ring-gold"
                                    />
                                ) : (
                                    user.email
                                )}
                            </td>
                            <td className="px-5 py-4">
                                {editingUserId === user.id ? (
                                    <select
                                        name="role"
                                        value={editedUser.role || ''}
                                        onChange={handleChange}
                                        className="h-9 px-2 rounded-md border border-lightBorder dark:border-darkBorder bg-light dark:bg-dark text-foreground focus:ring-2 focus:ring-gold transition-all outline-none"
                                    >
                                        {RoleList.map(role => (
                                            <option key={role} value={role}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20 font-semibold px-2.5 py-0.5">
                                        {user.role}
                                    </Badge>
                                )}
                            </td>
                            <td className="px-5 py-4 text-center font-bold text-gold">
                                {user.posts}
                            </td>
                            <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                    {editingUserId === user.id ? (
                                        <>
                                            <Button size="sm" onClick={() => handleSave(user.id)} className="bg-success hover:bg-success/90 h-8 w-8 p-0">
                                                <FaSave className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0 border border-lightBorder dark:border-darkBorder">
                                                <FaTimes className="w-4 h-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} className="h-8 w-8 p-0 hover:bg-gold/10 hover:text-gold border border-lightBorder dark:border-darkBorder">
                                                <FaEdit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openDeleteConfirmation(user.id)} className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 border border-lightBorder dark:border-darkBorder">
                                                <FaTrash className="w-3.5 h-3.5" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showDeleteConfirmation && (
                <div className="fixed top-16 inset-x-0 bottom-0 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm z-[48] animate-fade-in">
                    <div className="bg-white dark:bg-darkSurface p-8 rounded-2xl shadow-gold/10 border border-lightBorder dark:border-darkBorder max-w-md w-full relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500 rounded-t-2xl"></div>
                        <h2 className="text-2xl font-bold mb-3 text-foreground">Confirm Deletion</h2>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            This action is permanent. Are you sure you want to delete the user <span className="font-bold text-foreground">{users.find(u => u.id === userToDelete)?.username}</span>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={closeDeleteConfirmation} className="px-6 font-semibold">Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete} className="px-6 font-semibold bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20">Delete User</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;