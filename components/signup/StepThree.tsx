import React from 'react';
import Image from 'next/image';

interface StepThreeProps {
    profileImageUrl: string;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePrevStep: () => void;
}

const StepThree: React.FC<StepThreeProps> = ({ profileImageUrl, handleImageChange, handlePrevStep }) => {
    return (
        <div className="rounded-md shadow-sm -space-y-px">
            <div className="form-control">
                <label className="label">
                    <span className="label-text text-secondary">Profile Image</span>
                </label>
                <input
                    title="profile_image"
                    type="file"
                    onChange={handleImageChange}
                    className="input input-bordered w-full"
                />
                {profileImageUrl && (
                    <Image
                        src={profileImageUrl}
                        alt="Profile Preview"
                        className="mt-4 rounded-lg shadow-lg mx-auto"
                        width={300}
                        height={300}
                    />
                )}
            </div>
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
        </div>
    );
};

export default StepThree;