import { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import toast, { Toaster } from 'react-hot-toast';
import Papa from 'papaparse';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaFileExport, FaFileImport } from 'react-icons/fa';
import withAuth from '@/components/Admin/withAuth';

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

    const commonClassNames = "py-2 text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded";

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/newsletterSubscription');
            setSubscriptions(response.data);
        } catch (error) {
            toast.error('Failed to fetch subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const addSubscription = async () => {
        if (!newEmail) {
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
            toast.success('Subscription added');
        } catch (error) {
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
            toast.success('Subscription deleted');
        } catch (error) {
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
            toast.success('Subscription updated');
        } catch (error) {
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
                        toast.success('Subscriptions imported');
                    } catch (error) {
                        toast.error('Failed to import subscriptions');
                    } finally {
                        setLoading(false);
                    }
                },
            });
        }
    };

    return (
        <div className="p-4 dark:bg-gray-800 dark:text-white">
            <h1 className="text-2xl font-bold mb-4">Newsletter Subscriptions</h1>
            <div className="mb-4 flex items-center">
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email"
                    className={commonClassNames}
                />
                <button onClick={addSubscription} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    <FaPlus />
                </button>
                <button onClick={exportToCSV} className="bg-green-500 text-white p-2 rounded ml-2 hover:bg-green-600">
                    <FaFileExport />
                </button>
                <label className="bg-yellow-500 text-white p-2 rounded ml-2 cursor-pointer hover:bg-yellow-600">
                    <FaFileImport />
                    <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
                </label>
            </div>
            {loading ? (
                <div className="flex justify-center">
                    <ClipLoader size={50} color={"#fff"} />
                </div>
            ) : (
                <table className={`min-w-full ${commonClassNames}`}>
                    <thead>
                        <tr>
                            <th className={commonClassNames}>ID</th>
                            <th className={commonClassNames}>Email</th>
                            <th className={commonClassNames}>Subscribed</th>
                            <th className={commonClassNames}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map((sub) => (
                            <tr key={sub.id} className="border-b dark:border-gray-600">
                                <td className={commonClassNames}>{sub.id}</td>
                                <td className={commonClassNames}>{sub.email}</td>
                                <td className={commonClassNames}>{sub.subscribed ? 'Yes' : 'No'}</td>
                                <td className={commonClassNames}>
                                    <button onClick={() => editSubscription(sub)} className="text-blue-500 mr-2">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => deleteSubscription(sub.id)} className="text-red-500">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {editId !== null && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold mb-2">Edit Subscription</h2>
                    <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Enter new email"
                        className={commonClassNames}
                    />
                    <label className="ml-2">
                        <input
                            type="checkbox"
                            checked={editSubscribed}
                            onChange={(e) => setEditSubscribed(e.target.checked)}
                        />
                        Subscribed
                    </label>
                    <button onClick={updateSubscription} className="bg-blue-500 text-white p-2 rounded ml-2 hover:bg-blue-600">
                        Update
                    </button>
                    <button onClick={() => setEditId(null)} className="bg-gray-500 text-white p-2 rounded ml-2 hover:bg-gray-600">
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default withAuth(Subscriptions,['admin']);