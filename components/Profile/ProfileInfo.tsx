// components/ProfileInfo.tsx
import React from 'react';
import { User, Mail, FileText, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="overflow-hidden border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark transition-all hover:shadow-elevated h-full bg-card">
      <CardHeader className="bg-lightSurface/50 dark:bg-darkSurface/50 border-b border-lightBorder dark:border-darkBorder pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-gold dark:text-goldLight" />
          <span className="font-display text-foreground">Personal Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-lightBorder dark:divide-darkBorder">
          <InfoRow icon={<User className="w-4 h-4" />} label="Username" value={user.username} />
          <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
          <InfoRow icon={<BadgeCheck className="w-4 h-4" />} label="First Name" value={user.first_name || 'N/A'} />
          <InfoRow icon={<BadgeCheck className="w-4 h-4" />} label="Last Name" value={user.last_name || 'N/A'} />
          <InfoRow icon={<FileText className="w-4 h-4" />} label="Bio" value={user.bio || 'No bio provided'} />
        </div>
      </CardContent>
    </Card>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center px-6 py-4 hover:bg-lightSurface/30 dark:hover:bg-darkSurface/30 transition-colors">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lightSurface dark:bg-darkSurface text-muted-foreground mr-4">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

export default ProfileInfo;