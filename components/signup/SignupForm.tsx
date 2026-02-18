import React, { useState } from 'react';
import { useRouter } from 'next/router';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import { Button } from '@/components/ui/button';

const SignupForm = () => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = {
            username,
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            bio,
        };

        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            router.push('/login');
        } else {
            setError(data.error);
        }
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (!username || !email || !password) {
                setError('Please fill in all fields.');
                return;
            }
        } else if (step === 2) {
            if (!firstName || !lastName || !bio) {
                setError('Please fill in all fields.');
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const handlePrevStep = () => setStep(step - 1);

    return (
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {step === 1 && (
                <StepOne
                    username={username}
                    setUsername={setUsername}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    handleNextStep={handleNextStep}
                />
            )}
            {step === 2 && (
                <StepTwo
                    firstName={firstName}
                    setFirstName={setFirstName}
                    lastName={lastName}
                    setLastName={setLastName}
                    bio={bio}
                    setBio={setBio}
                    handlePrevStep={handlePrevStep}
                />
            )}
            {error && <p className="mt-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
            {loading && <span className="inline-block w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />}
            {step === 2 && (
                <div className="flex justify-between mt-4 gap-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handlePrevStep}
                        className="flex-1"
                    >
                        Previous
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1"
                    >
                        Sign Up
                    </Button>
                </div>
            )}
        </form>
    );
};

export default SignupForm;