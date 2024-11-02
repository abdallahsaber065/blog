// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import UserList from '@/components/Admin/Users/UserList';

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management Dashboard</h1>
      <UserList users={users} setUsers={setUsers} loading={loading} />
    </div>
  );
};

export default Dashboard;