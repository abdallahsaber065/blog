import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChangePasswordDialogProps {
    userId: string;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ userId }) => {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, data: { password } }),
            });

            if (response.ok) {
                toast.success('Password changed successfully');
                setOpen(false);
                setPassword('');
                setConfirmPassword('');
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to change password');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-lightBorder dark:border-darkBorder hover:bg-lightSurface dark:hover:bg-darkSurface transition-colors">
                    <Key className="w-4 h-4" />
                    Change Password
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-lightBorder dark:border-darkBorder">
                <DialogHeader>
                    <DialogTitle className="text-foreground font-display">Change Password</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Update your password. Make sure to use a strong, secure password.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus-visible:ring-gold"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus-visible:ring-gold"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                            className="border-lightBorder dark:border-darkBorder hover:bg-lightSurface dark:hover:bg-darkSurface"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-gold to-goldDark hover:from-goldDark hover:to-gold text-dark shadow-gold"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ChangePasswordDialog;
