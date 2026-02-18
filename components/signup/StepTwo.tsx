import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First Name
                </Label>
                <Input
                    id="firstName"
                    title="first_name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last Name
                </Label>
                <Input
                    id="lastName"
                    title="last_name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                    Bio
                </Label>
                <Textarea
                    id="bio"
                    title="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself"
                    rows={4}
                />
            </div>
        </div>
    );
};

export default StepTwo;