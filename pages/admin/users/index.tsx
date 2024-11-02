// pages/admin/users/index.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import withAuth from '@/components/Admin/withAuth';

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

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userSelect = JSON.stringify({
          id: true,
          username: true,
          first_name: true,
          last_name: true,
          email: true,
          role: true,
        });
        const response = await axios.get(`/api/users?select=${userSelect}`);
        setUsers(response.data);
      } catch (error) {
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateUser = () => {
    router.push('/admin/users/create');
  };

  const handleEditUser = (userId: number) => {
    router.push(`/admin/users/edit?id=${userId}`);
  };

  const handleDelete = async () => {
    if (userToDelete !== null) {
      try {
        await axios.delete('/api/users', { data: { targetId: userToDelete } });
        setUsers(users.filter(user => user.id !== userToDelete));
        toast.success('User deleted successfully');
      } catch (error) {
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

  const toggleExpandUser = (userId: number) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-slate-800 dark:text-slate-200">
      <h1 className="text-2xl font-bold mb-4">User Management Dashboard</h1>
      <button className="btn btn-primary mb-4" onClick={handleCreateUser}>
        Create New User
      </button>
      <div className="hidden md:block overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className='text-dark dark:text-white font-bold text-sm'>
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
                <td>{`${user.first_name} ${user.last_name}`}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.posts}</td>
                <td>
                  <button className="btn btn-secondary mr-2" onClick={() => handleEditUser(user.id)}>
                    <FaEdit />
                  </button>
                  <button className="btn btn-error" onClick={() => openDeleteConfirmation(user.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden">
        {users.map(user => (
          <div key={user.id} className="mb-4">
            <div className="flex justify-between items-center p-4 bg-white dark:bg-dark rounded-lg shadow-md">
              <span className="font-bold">{user.username}</span>
              <button className="btn btn-sm btn-primary" onClick={() => toggleExpandUser(user.id)}>
                {expandedUserId === user.id ? 'Hide' : 'Show'}
              </button>
            </div>
            {expandedUserId === user.id && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md mt-2">
                <p><strong>Full Name:</strong> {`${user.first_name} ${user.last_name}`}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Posts:</strong> {user.posts}</p>
                <div className="mt-2 flex justify-end">
                  <button className="btn btn-secondary mr-2" onClick={() => handleEditUser(user.id)}>
                    <FaEdit />
                  </button>
                  <button className="btn btn-error" onClick={() => openDeleteConfirmation(user.id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Confirm Deletion</h2>
            <p className="text-slate-700 dark:text-slate-100 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button className="btn btn-error" onClick={handleDelete}>
                Delete
              </button>
              <button className="btn btn-secondary" onClick={closeDeleteConfirmation}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(Dashboard);