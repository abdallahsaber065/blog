// components/Admin/CreatePost/OutlineSettings.tsx
import React from 'react';

interface ContentSettingsProps {
    topic: string;
    setTopic: (value: string) => void;
    numOfTerms: number;
    setNumOfTerms: (value: number) => void;
    numOfKeywords: number;
    setNumOfKeywords: (value: number) => void;
    numOfPoints: number;
    setNumOfPoints: (value: number) => void;
    enableNumOfPoints: boolean;
    setEnableNumOfPoints: (value: boolean) => void;
    userCustomInstructions: string;
    setUserCustomInstructions: (value: string) => void;
    showContentSettings: boolean;
    setShowContentSettings: (value: boolean) => void;
}

const ContentSettings: React.FC<ContentSettingsProps> = ({
    topic,
    setTopic,
    numOfTerms,
    setNumOfTerms,
    numOfKeywords,
    setNumOfKeywords,
    numOfPoints,
    setNumOfPoints,
    enableNumOfPoints,
    setEnableNumOfPoints,
    userCustomInstructions,
    setUserCustomInstructions,
    showContentSettings,
    setShowContentSettings,
}) => {
    return (
        <div className="outline-settings mb-4">
            <button
                className="text-blue-500 underline mt-2"
                onClick={() => setShowContentSettings(!showContentSettings)}
            >
                {showContentSettings ? 'Hide' : 'Show'} Content Advanced Settings
            </button>
            {showContentSettings && (
                <div className="p-4 border border-slate-300 rounded bg-light dark:bg-gray mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Number of Terms</label>
                            <input
                                type="number"
                                className="outline-settings-terms w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded"
                                value={numOfTerms}
                                onChange={(e) => setNumOfTerms(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Number of Keywords</label>
                            <input
                                type="number"
                                className="outline-settings-keywords w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded"
                                value={numOfKeywords}
                                onChange={(e) => setNumOfKeywords(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Number of Points</label>
                            <input
                                type="number"
                                className="outline-settings-points w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded"
                                value={numOfPoints}
                                onChange={(e) => setNumOfPoints(Number(e.target.value))}
                                disabled={!enableNumOfPoints}
                            />
                            <div className="flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    className="outline-settings-points-toggle mr-2"
                                    checked={enableNumOfPoints}
                                    onChange={() => {
                                        setEnableNumOfPoints(!enableNumOfPoints);
                                        if (!enableNumOfPoints) setNumOfPoints(0);
                                    }}
                                />
                                <label className="text-gray dark:text-lightgray">Enable</label>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-l font-bold text-gray dark:text-lightgray my-4">User Custom Instructions</label>
                        <textarea
                            className="outline-settings-instructions w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded"
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