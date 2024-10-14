import React, { useState } from 'react';
import { useRouter } from 'next/router';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import { ClipLoader } from 'react-spinners';

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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
            {error && <p className="mt-2 text-sm text-error">{error}</p>}
            {loading && <ClipLoader size={24} color="#ffffff" />}
            {step === 2 && (
                <div className="flex justify-between mt-4">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handlePrevStep}
                    >
                        Previous
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Sign Up
                    </button>
                </div>
            )}
        </form>
    );
};

export default SignupForm;