// components/DangerZone.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface DangerZoneProps {
  handleDeleteAccount: () => void;
}

const DangerZone: React.FC<DangerZoneProps> = ({ handleDeleteAccount }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const openDeleteConfirmation = () => setShowDeleteConfirmation(true);
  const closeDeleteConfirmation = () => setShowDeleteConfirmation(false);

  const handleDelete = () => {
    handleDeleteAccount();
    closeDeleteConfirmation();
  };

  return (
    <Card className="overflow-hidden border-danger/20 bg-card shadow-card dark:shadow-card-dark mt-6 transition-all hover:shadow-elevated">
      <CardHeader className="bg-danger/5 border-b border-danger/10 pb-4">
        <CardTitle className="text-lg font-display text-danger flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          Danger Zone
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-foreground">Delete your account</h4>
            <p className="text-sm text-muted-foreground mt-1">Once you delete your account, there is no going back. Please be certain.</p>
          </div>

          <Button
            onClick={openDeleteConfirmation}
            variant="destructive"
            className="flex-shrink-0 flex items-center justify-center gap-2 h-11 bg-danger/10 border border-danger/20 hover:bg-danger  text-white hover:text-goldLight transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </div>

        {showDeleteConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100] p-4 animate-fade-in">
            <div className="bg-card p-8 rounded-2xl shadow-elevated max-w-md w-full border border-lightBorder dark:border-darkBorder animate-slide-up">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8 text-danger" />
                </div>
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">Delete Account?</h2>
                <p className="text-muted-foreground">
                  Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                </p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
                <Button variant="outline" className="flex-1" onClick={closeDeleteConfirmation}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1 bg-danger hover:bg-danger/90 text-white" onClick={handleDelete}>
                  Yes, Delete My Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DangerZone;