// components/AccountDetails.tsx
import React from 'react';
import RequestVerification from '@/components/signup/RequestVerification';

interface AccountDetailsProps {
  user: {
    role: string;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ user }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-light">Account Details</h2>
      <div className="text-slate-800 dark:text-light">
        <strong>Role:</strong> {user.role}
      </div>
      <div className="text-slate-800 dark:text-light">
        <strong>Email Verified:</strong> {user.email_verified ? 'Yes' : 'No'}
        {!user.email_verified && <RequestVerification />}
      </div>
      <div className="text-slate-800 dark:text-light">
        <strong>Created At:</strong> {new Date(user.created_at).toLocaleString()}
      </div>
      <div className="text-slate-800 dark:text-light">
        <strong>Updated At:</strong> {new Date(user.updated_at).toLocaleString()}
      </div>
    </section>
  );
};

export default AccountDetails;