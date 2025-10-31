import { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import toast, { Toaster } from 'react-hot-toast';
import Papa from 'papaparse';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaFileExport, FaFileImport } from 'react-icons/fa';
import withAuth from '@/components/Admin/withAuth';
import Link from 'next/link';
import { FaUserFriends } from 'react-icons/fa';

interface Subscription {
    id: number;
    email: string;
    subscribed: boolean;
}

const Subscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
    const [editEmail, setEditEmail] = useState('');
    const [editSubscribed, setEditSubscribed] = useState(false);

    const commonClassNames = "py-2 text-slate-800 dark:text-white bg-white dark:bg-dark p-2 border border-slate-300 rounded";
    const buttonClassNames = "flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200";

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/newsletterSubscription');
            setSubscriptions(response.data);
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to fetch subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const addSubscription = async () => {
        if (!newEmail) {
            toast.dismiss();
            toast.error('Email is required');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('/api/newsletterSubscription', {
                email: newEmail,
                subscribed: true,
                user_ip: '00.00.11.22',
            });
            setSubscriptions([...subscriptions, response.data]);
            setNewEmail('');
            toast.dismiss();
            toast.success('Subscription added');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to add subscription');
        } finally {
            setLoading(false);
        }
    };

    const deleteSubscription = async (id: number) => {
        setLoading(true);
        try {
            await axios.delete('/api/newsletterSubscription', { data: { deleteId: id } });
            setSubscriptions(subscriptions.filter(sub => sub.id !== id));
            toast.dismiss();
            toast.success('Subscription deleted');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to delete subscription');
        } finally {
            setLoading(false);
        }
    };

    const editSubscription = (subscription: Subscription) => {
        setEditId(subscription.id);
        setEditEmail(subscription.email);
        setEditSubscribed(subscription.subscribed);
    };

    const updateSubscription = async () => {
        if (editId === null) return;

        setLoading(true);
        try {
            const response = await axios.put('/api/newsletterSubscription', {
                id: editId,
                newEmail: editEmail,
                newSubscribed: editSubscribed,
                newUserIp: '00.00.11.22',
            });
            setSubscriptions(subscriptions.map(sub => sub.id === editId ? response.data : sub));
            setEditId(null);
            setEditEmail('');
            setEditSubscribed(false);
            toast.dismiss();
            toast.success('Subscription updated');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to update subscription');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const csv = Papa.unparse(subscriptions);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'subscriptions.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: async (results) => {
                    setLoading(true);
                    try {
                        const data = results.data.map((item: any) => ({
                            ...item,
                            subscribed: item.subscribed === 'true' || item.subscribed === true,
                        }));
                        await axios.post('/api/newsletterSubscription/import', { data });
                        fetchSubscriptions();
                        toast.dismiss();
                        toast.success('Subscriptions imported');
                    } catch (error) {
                        toast.dismiss();
                        toast.error('Failed to import subscriptions');
                    } finally {
                        setLoading(false);
                    }
                },
            });
        }
    };

    const truncateEmail = (email: string, maxLength: number = 25) => {
        if (email.length <= maxLength) return email;

        const atIndex = email.indexOf('@');
        if (atIndex === -1) return email; // If no @ found, return full email

        const localPart = email.slice(0, atIndex);
        const domain = email.slice(atIndex);

        // Calculate how many characters we can show from the local part
        const localPartVisibleLength = Math.floor((maxLength - 3 - domain.length) / 2);
        if (localPartVisibleLength < 1) return email; // If too short, show full email

        const firstPart = localPart.slice(0, localPartVisibleLength);
        const lastPart = localPart.slice(-localPartVisibleLength);

        return `${firstPart}...${lastPart}${domain}`;
    };

    return (
        <div className="p-4 dark:bg-dark text-slate-800 dark:text-white max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Newsletter Subscriptions</h1>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Link
                        href="/admin/users"
                        className="flex items-center justify-center gap-2 btn btn-secondary w-full sm:w-auto"
                    >
                        <FaUserFriends className="shrink-0" />
                        <span className="whitespace-nowrap">User Management</span>
                    </Link>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="text-sm breadcrumbs mb-4 overflow-x-auto whitespace-nowrap">
                <ul className="flex flex-wrap gap-2">
                    <li><Link href="/admin">Admin</Link></li>
                    <li><Link href="/admin/users">Users</Link></li>
                    <li>Newsletter Subscriptions</li>
                </ul>
            </div>

            {/* Responsive controls */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email"
                    className={`flex-grow ${commonClassNames}`}
                />
                <div className="flex gap-2">
                    <button
                        onClick={addSubscription}
                        className={`${buttonClassNames} bg-blue-500 hover:bg-blue-600 text-white`}
                    >
                        <FaPlus /> <span className="hidden sm:inline">Add</span>
                    </button>
                    <button
                        onClick={exportToCSV}
                        className={`${buttonClassNames} bg-green-500 hover:bg-green-600 text-white`}
                    >
                        <FaFileExport /> <span className="hidden sm:inline">Export</span>
                    </button>
                    <label className={`${buttonClassNames} bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer`}>
                        <FaFileImport /> <span className="hidden sm:inline">Import</span>
                        <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <ClipLoader size={50} color={"#fff"} />
                </div>
            ) : (
                <div className="w-full">
                    {/* Desktop Table - Hidden on mobile */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-100 dark:bg-slate-800">
                                    <th className="px-4 py-2 text-left text-slate-800 dark:text-white">ID</th>
                                    <th className="px-4 py-2 text-left text-slate-800 dark:text-white">Email</th>
                                    <th className="px-4 py-2 text-left text-slate-800 dark:text-white">Subscribed</th>
                                    <th className="px-4 py-2 text-left text-slate-800 dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((sub) => (
                                    <tr key={sub.id} className="border-b dark:border-slate-700">
                                        <td className="px-4 py-2 text-slate-800 dark:text-white">{sub.id}</td>
                                        <td className="px-4 py-2 text-slate-800 dark:text-white">
                                            {editId === sub.id ? (
                                                <input
                                                    type="email"
                                                    value={editEmail}
                                                    onChange={(e) => setEditEmail(e.target.value)}
                                                    className={`w-full ${commonClassNames}`}
                                                />
                                            ) : (
                                                <span title={sub.email}>{truncateEmail(sub.email, 40)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-slate-800 dark:text-white">
                                            {editId === sub.id ? (
                                                <input
                                                    type="checkbox"
                                                    checked={editSubscribed}
                                                    onChange={(e) => setEditSubscribed(e.target.checked)}
                                                    className="ml-2"
                                                />
                                            ) : (
                                                <div className="text-slate-800 dark:text-white">
                                                    {sub.subscribed ? 'Yes' : 'No'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {editId === sub.id ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={updateSubscription}
                                                        className="text-green-500 hover:text-green-600"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditId(null)}
                                                        className="text-slate-500 hover:text-slate-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => editSubscription(sub)}
                                                        className="text-blue-500 hover:text-blue-600"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteSubscription(sub.id)}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {subscriptions.map((sub) => (
                            <div key={sub.id}
                                className="bg-white dark:bg-dark rounded-lg shadow-md 
                                          border border-slate-200 dark:border-slate-700 p-4 space-y-2"
                            >
                                {/* Header with ID */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">ID: </span>
                                        <span className="font-semibold text-slate-800 dark:text-white">{sub.id}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {editId === sub.id ? (
                                            <>
                                                <button
                                                    onClick={updateSubscription}
                                                    className="text-green-500 hover:text-green-600 
                                                             transition-colors duration-200"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditId(null)}
                                                    className="text-slate-500 hover:text-slate-600 
                                                             dark:text-slate-400 dark:hover:text-slate-300 
                                                             transition-colors duration-200"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => editSubscription(sub)}
                                                    className="text-blue-500 hover:text-blue-600 
                                                             transition-colors duration-200"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => deleteSubscription(sub.id)}
                                                    className="text-red-500 hover:text-red-600 
                                                             transition-colors duration-200"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Email Section */}
                                    <div>
                                        <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">
                                            Email
                                        </label>
                                        {editId === sub.id ? (
                                            <input
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                className={`w-full bg-white dark:bg-dark 
                                                  text-slate-800 dark:text-white 
                                                  border border-slate-300 dark:border-slate-700 
                                                  rounded-md p-2 focus:ring-2 focus:ring-blue-500 
                                                  focus:border-transparent transition-all duration-200`}
                                            />
                                        ) : (
                                            <div
                                                className="text-slate-800 dark:text-white font-medium break-words"
                                                title={sub.email.length > 40 ? sub.email : undefined}
                                            >
                                                {sub.email.length > 40 ? truncateEmail(sub.email, 40) : sub.email}
                                            </div>
                                        )}
                                    </div>

                                    {/* Subscribed Status Section */}
                                    <div>
                                        <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">
                                            Subscribed
                                        </label>
                                        {editId === sub.id ? (
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={editSubscribed}
                                                    onChange={(e) => setEditSubscribed(e.target.checked)}
                                                    className="w-4 h-4 text-blue-500 
                                                             border-slate-300 dark:border-slate-700 
                                                             rounded focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-slate-800 dark:text-white font-medium">
                                                    {editSubscribed ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="text-slate-800 dark:text-white font-medium">
                                                {sub.subscribed ? 'Yes' : 'No'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <Toaster />
        </div>
    );
};

export default withAuth(Subscriptions, ['admin']);