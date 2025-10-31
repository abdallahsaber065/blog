import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Papa from 'papaparse';
import axios from 'axios';
import withAuth from '@/components/Admin/withAuth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Mail, 
    Plus, 
    Download, 
    Upload, 
    Edit2, 
    Trash2, 
    Save, 
    X, 
    Users, 
    Loader2,
    Check,
    AlertCircle
} from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Toaster />
            
            {/* Hero Section */}
            <section className="relative px-5 sm:px-10 md:px-24 sxl:px-32 py-12 md:py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                    Newsletter Subscriptions
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-400">
                                    Manage your newsletter subscribers
                                </p>
                            </div>
                        </div>
                        <Link href="/admin/users">
                            <Button variant="secondary" size="lg">
                                <Users className="w-5 h-5 mr-2" />
                                User Management
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Subscribers</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                        {subscriptions.length}
                                    </p>
                                </div>
                                <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {subscriptions.filter(s => s.subscribed).length}
                                    </p>
                                </div>
                                <Check className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Inactive</p>
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {subscriptions.filter(s => !s.subscribed).length}
                                    </p>
                                </div>
                                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Subscription Form */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add New Subscription
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter email address"
                                className="flex-1"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addSubscription();
                                    }
                                }}
                            />
                            <div className="flex gap-2">
                                <Button onClick={addSubscription} disabled={loading || !newEmail}>
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4 mr-2" />
                                    )}
                                    Add
                                </Button>
                                <Button variant="success" onClick={exportToCSV}>
                                    <Download className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Export</span>
                                </Button>
                                <Button variant="warning" asChild>
                                    <label className="cursor-pointer">
                                        <Upload className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Import</span>
                                        <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
                                    </label>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscriptions List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Subscribers List</span>
                            <Badge variant="secondary">{subscriptions.length} total</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
                                <p className="text-slate-600 dark:text-slate-400">Loading subscriptions...</p>
                            </div>
                        ) : subscriptions.length === 0 ? (
                            <div className="text-center py-12">
                                <Mail className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                    No subscribers yet
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Add your first subscriber using the form above
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {subscriptions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.subscribed ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                {editId === sub.id ? (
                                                    <Input
                                                        type="email"
                                                        value={editEmail}
                                                        onChange={(e) => setEditEmail(e.target.value)}
                                                        className="w-full"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate"
                                                       title={sub.email}>
                                                        {truncateEmail(sub.email, 40)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                {editId === sub.id ? (
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={editSubscribed}
                                                            onChange={(e) => setEditSubscribed(e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                                            {editSubscribed ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </label>
                                                ) : (
                                                    <Badge variant={sub.subscribed ? 'default' : 'secondary'}>
                                                        {sub.subscribed ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                {editId === sub.id ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={updateSubscription}
                                                            disabled={loading}
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setEditId(null)}
                                                            disabled={loading}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => editSubscription(sub)}
                                                            disabled={loading}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => deleteSubscription(sub.id)}
                                                            disabled={loading}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default withAuth(Subscriptions, ['admin']);