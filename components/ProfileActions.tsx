// components/ProfileActions.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface ProfileActionsProps {
  handleDeleteAccount: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ handleDeleteAccount }) => {
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const openDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDelete = () => {
    handleDeleteAccount();
    closeDeleteConfirmation();
  };

  return (
    <section className="col-span-1 md:col-span-2 space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-light">Actions</h2>
      <button
        onClick={() => router.push('/profile/edit')}
        className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-secondary"
      >
        Edit Profile
      </button>
      <button
        onClick={() => router.push('/auth/request-password-reset')}
        className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-warning"
      >
        Reset Password
      </button>
      <button
        onClick={openDeleteConfirmation}
        className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-error"
      >
        Delete Account
      </button>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Confirm Deletion</h2>
            <p className="text-slate-700 dark:text-slate-100 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button className="btn btn-error" onClick={handleDelete}>
                Delete
              </button>
              <button className="btn btn-secondary" onClick={closeDeleteConfirmation}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileActions;