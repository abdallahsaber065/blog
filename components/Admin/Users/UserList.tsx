// components/UserList.tsx
import { useState } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

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
                                    <>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={editedUser.first_name || ''}
                                            onChange={handleChange}
                                            className="input input-bordered mr-2"
                                        />
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={editedUser.last_name || ''}
                                            onChange={handleChange}
                                            className="input input-bordered"
                                        />
                                    </>
                                ) : (
                                    `${user.first_name} ${user.last_name}`
                                )}
                            </td>
                            <td>
                                {editingUserId === user.id ? (
                                    <input
                                        type="text"
                                        name="username"
                                        value={editedUser.username || ''}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                    />
                                ) : (
                                    user.username
                                )}
                            </td>
                            <td>
                                {editingUserId === user.id ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editedUser.email || ''}
                                        onChange={handleChange}
                                        className="input input-bordered"
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
                                        <button className="btn btn-primary mr-2" onClick={() => handleSave(user.id)}>
                                            <FaSave />
                                        </button>
                                        <button className="btn btn-secondary" onClick={handleCancel}>
                                            <FaTimes />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-secondary mr-2" onClick={() => handleEdit(user)}>
                                            <FaEdit />
                                        </button>
                                        <button className="btn btn-error" onClick={() => openDeleteConfirmation(user.id)}>
                                            <FaTrash />
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showDeleteConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded">
                        <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this user?</p>
                        <div className="mt-4">
                            <button className="btn btn-error mr-2" onClick={handleDelete}>Delete</button>
                            <button className="btn btn-secondary" onClick={closeDeleteConfirmation}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;