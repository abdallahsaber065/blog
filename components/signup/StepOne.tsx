import React, { useState } from 'react';

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
        <div className="rounded-md shadow-sm -space-y-px">
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-secondary">Username</span>
                </label>
                <input
                    title="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="input input-bordered w-full"
                    placeholder="Username"
                />
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-secondary">Email</span>
                </label>
                <input
                    title="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input input-bordered w-full"
                    placeholder="Email address"
                />
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-secondary">Password</span>
                </label>
                <input
                    title="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input input-bordered w-full"
                    placeholder="Password"
                />
            </div>
            {error && <p className="mt-2 text-sm text-error">{error}</p>}
            <div className="flex justify-between mt-4">
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={loading}
                >
                    {loading ? 'Checking...' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default StepOne;