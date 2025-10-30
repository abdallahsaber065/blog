// components/UserList.tsx
import { useState } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to update user');
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
            } catch (error) {
                toast.dismiss();
                toast.error('Failed to delete user');
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
            <div className="flex justify-center items-center h-screen">
                <ClipLoader size={50} />
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="table w-full">
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Posts</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>
                                {editingUserId === user.id ? (
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            name="first_name"
                                            value={editedUser.first_name || ''}
                                            onChange={handleChange}
                                            className="w-32"
                                        />
                                        <Input
                                            type="text"
                                            name="last_name"
                                            value={editedUser.last_name || ''}
                                            onChange={handleChange}
                                            className="w-32"
                                        />
                                    </div>
                                ) : (
                                    `${user.first_name} ${user.last_name}`
                                )}
                            </td>
                            <td>
                                {editingUserId === user.id ? (
                                    <Input
                                        type="text"
                                        name="username"
                                        value={editedUser.username || ''}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    user.username
                                )}
                            </td>
                            <td>
                                {editingUserId === user.id ? (
                                    <Input
                                        type="email"
                                        name="email"
                                        value={editedUser.email || ''}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    user.email
                                )}
                            </td>
                            <td>
                                {editingUserId === user.id ? (
                                    <select
                                        name="role"
                                        value={editedUser.role || ''}
                                        onChange={handleChange}
                                        className="select select-bordered"
                                    >
                                        {RoleList.map(role => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    user.role
                                )}
                            </td>
                            <td>{user.posts}</td>
                            <td>
                                {editingUserId === user.id ? (
                                    <>
                                        <Button size="sm" onClick={() => handleSave(user.id)} className="mr-2">
                                            <FaSave />
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={handleCancel}>
                                            <FaTimes />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="secondary" size="sm" onClick={() => handleEdit(user)} className="mr-2">
                                            <FaEdit />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => openDeleteConfirmation(user.id)}>
                                            <FaTrash />
                                        </Button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showDeleteConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Confirm Deletion</h2>
                        <p className="text-slate-700 dark:text-slate-100 mb-6">Are you sure you want to delete this user?</p>
                        <div className="flex justify-end gap-4">
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                            <Button variant="secondary" onClick={closeDeleteConfirmation}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;