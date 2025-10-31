// pages/admin/users/index.tsx
import withAuth from '@/components/Admin/withAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaEnvelope, FaTrash, FaUserPlus } from 'react-icons/fa';
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
        toast.dismiss();
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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
              User Management
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/admin/users/subscriptions">
                  <FaEnvelope className="mr-2 h-4 w-4" />
                  Newsletter Subscriptions
                </Link>
              </Button>
              
              <Button 
                onClick={handleCreateUser}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <FaUserPlus className="mr-2 h-4 w-4" />
                Create New User
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-semibold">Full Name</TableHead>
                  <TableHead className="font-semibold">Username</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Posts</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell className="font-medium">{`${user.first_name} ${user.last_name}`}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className={`${
                          user.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : user.role === 'moderator'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.posts || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                          onClick={() => handleEditUser(user.id)}
                          title="Edit User"
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => openDeleteConfirmation(user.id)}
                          title="Delete User"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {users.map(user => (
              <Card key={user.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{user.username}</h3>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className={`mt-1 ${
                          user.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : user.role === 'moderator'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => openDeleteConfirmation(user.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Name:</span>
                      <span className="text-slate-900 dark:text-slate-100">{`${user.first_name} ${user.last_name}`}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Email:</span>
                      <span className="text-slate-900 dark:text-slate-100 truncate ml-2">{user.email}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Posts:</span>
                      <span className="text-slate-900 dark:text-slate-100">{user.posts || 0}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeDeleteConfirmation}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withAuth(Dashboard);