import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StepOneProps {
    username: string;
    setUsername: (value: string) => void;
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    handleNextStep: () => void;
}

const StepOne: React.FC<StepOneProps> = ({ username, setUsername, email, setEmail, password, setPassword, handleNextStep }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 8;
    };

    const checkUniqueness = async () => {
        setLoading(true);
        setError('');

        const res = await fetch('/api/auth/check-uniqueness', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(data.error);
            return false;
        }

        return true;
    };

    const handleNext = async () => {
        if (!username || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        if (!validateEmail(email)) {
            setError('Invalid email format.');
            return;
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        const isUnique = await checkUniqueness();
        if (isUnique) {
            handleNextStep();
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-900 font-bold dark:text-slate-300">
                    Username
                </Label>
                <Input
                    id="username"
                    title="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Username"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 font-bold dark:text-slate-300">
                    Email
                </Label>
                <Input
                    id="email"
                    title="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email address"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 font-bold dark:text-slate-300">
                    Password
                </Label>
                <Input
                    id="password"
                    title="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end mt-4">
                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="w-full sm:w-auto"
                >
                    {loading ? 'Checking...' : 'Next'}
                </Button>
            </div>
        </div>
    );
};

export default StepOne;