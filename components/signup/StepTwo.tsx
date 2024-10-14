import React from 'react';

interface StepTwoProps {
    firstName: string;
    setFirstName: (value: string) => void;
    lastName: string;
    setLastName: (value: string) => void;
    bio: string;
    setBio: (value: string) => void;
    handlePrevStep: () => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ firstName, setFirstName, lastName, setLastName, bio, setBio, handlePrevStep }) => {
    return (
        <div className="rounded-md shadow-sm -space-y-px">
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-secondary">First Name</span>
                </label>
                <input
                    title="first_name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="First Name"
                />
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-secondary">Last Name</span>
                </label>
                <input
                    title="last_name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Last Name"
                />
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-secondary">Bio</span>
                </label>
                <textarea
                    title="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    placeholder="Tell us a bit about yourself"
                />
            </div>
            {/* <div className="flex justify-between mt-4">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePrevStep}
                >
                    Previous
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNextStep}
                >
                    Next
                </button>
            </div> */}
        </div>
    );
};

export default StepTwo;