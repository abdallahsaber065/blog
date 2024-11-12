// components/Admin/CreatePost/ContentSettings.tsx
import React from 'react';

interface ContentSettingsProps {
    userCustomInstructions: string;
    setUserCustomInstructions: (value: string) => void;
    showContentSettings: boolean;
    setShowContentSettings: (value: boolean) => void;
}

const ContentSettings: React.FC<ContentSettingsProps> = ({
    userCustomInstructions,
    setUserCustomInstructions,
    showContentSettings,
    setShowContentSettings,
}) => {
    return (
        <div className="mb-4">
            <button
                className="text-blue-500 underline mt-2"
                onClick={() => setShowContentSettings(!showContentSettings)}
            >
                {showContentSettings ? 'Hide' : 'Show'} Content Generation Advanced Settings
            </button>
            {showContentSettings && (
                <div className="p-4 border border-slate-300 rounded bg-light dark:bg-gray mt-4">
                    <div className="mb-4">
                        <label className="block text-l font-bold text-gray dark:text-lightgray my-4">User Custom Instructions</label>
                        <textarea
                            className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded"
                            value={userCustomInstructions}
                            onChange={(e) => setUserCustomInstructions(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentSettings;