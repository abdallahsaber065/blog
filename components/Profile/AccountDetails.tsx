// components/AccountDetails.tsx
import React from 'react';
import RequestVerification from '@/components/signup/RequestVerification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    <Card className="overflow-hidden border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark transition-all hover:shadow-elevated h-full bg-card">
      <CardHeader className="bg-lightSurface/50 dark:bg-darkSurface/50 border-b border-lightBorder dark:border-darkBorder pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-gold dark:text-goldLight" />
          <span className="font-display text-foreground">Account Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-lightBorder dark:divide-darkBorder">
          <div className="flex items-center px-6 py-4 hover:bg-lightSurface/30 dark:hover:bg-darkSurface/30 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lightSurface dark:bg-darkSurface text-muted-foreground mr-4">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Role</p>
              <Badge variant="outline" className="text-xs font-semibold uppercase tracking-widest text-gold bg-gold/10 border-gold/20">
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="flex items-center px-6 py-4 hover:bg-lightSurface/30 dark:hover:bg-darkSurface/30 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lightSurface dark:bg-darkSurface text-muted-foreground mr-4">
              {user.email_verified ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-danger" />}
            </div>
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email Verified</p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${user.email_verified ? 'text-success' : 'text-danger'}`}>
                    {user.email_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
              {!user.email_verified && <RequestVerification />}
            </div>
          </div>

          <div className="flex items-center px-6 py-4 hover:bg-lightSurface/30 dark:hover:bg-darkSurface/30 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lightSurface dark:bg-darkSurface text-muted-foreground mr-4">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Member Since</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center px-6 py-4 hover:bg-lightSurface/30 dark:hover:bg-darkSurface/30 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lightSurface dark:bg-darkSurface text-muted-foreground mr-4">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Last Updated</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(user.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountDetails;