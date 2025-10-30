// components/ProfileActions.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

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
      <Button
        onClick={() => router.push('/profile/edit')}
        variant="secondary"
        className="w-full"
      >
        Edit Profile
      </Button>
      <Button
        onClick={() => router.push('/auth/request-password-reset')}
        variant="warning"
        className="w-full"
      >
        Reset Password
      </Button>
      <Button
        onClick={openDeleteConfirmation}
        variant="destructive"
        className="w-full"
      >
        Delete Account
      </Button>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Confirm Deletion</h2>
            <p className="text-slate-700 dark:text-slate-100 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
              <Button variant="secondary" onClick={closeDeleteConfirmation}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileActions;