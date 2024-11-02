// components/ProfileInfo.tsx
import React from 'react';

interface ProfileInfoProps {
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    bio: string;
  };
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-light">Personal Information</h2>
      <div className="text-gray-800 dark:text-light">
        <strong>Username:</strong> {user.username}
      </div>
      <div className="text-gray-800 dark:text-light">
        <strong>Email:</strong> {user.email}
      </div>
      <div className="text-gray-800 dark:text-light">
        <strong>First Name:</strong> {user.first_name}
      </div>
      <div className="text-gray-800 dark:text-light">
        <strong>Last Name:</strong> {user.last_name}
      </div>
      <div className="text-gray-800 dark:text-light">
        <strong>Bio:</strong> {user.bio}
      </div>
    </section>
  );
};

export default ProfileInfo;