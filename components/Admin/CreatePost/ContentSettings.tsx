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
    includeSearchTerms: boolean;
    setIncludeSearchTerms: (value: boolean) => void;
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
    includeSearchTerms,
    setIncludeSearchTerms,
}) => {
    return (
        <div className="mb-4 outline-settings">
            <button
                className="text-blue-500 underline mt-2"
                onClick={() => setShowContentSettings(!showContentSettings)}
            >
                {showContentSettings ? 'Hide' : 'Show'} Content Advanced Settings
            </button>
            {showContentSettings && (
                <div className="outline-settings p-4 border border-slate-300 rounded bg-light dark:bg-gray mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-l font-bold text-gray dark:text-lightgray mb-2">
                                Search Terms
                            </label>
                            <input
                                type="number"
                                className="outline-settings-terms w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded mb-2"
                                value={numOfTerms}
                                onChange={(e) => setNumOfTerms(Number(e.target.value))}
                                disabled={!includeSearchTerms}
                            />
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="includeSearchTerms"
                                    className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500
                                    include-search-terms-toggle
                                    "
                                    checked={includeSearchTerms}
                                    onChange={() => setIncludeSearchTerms(!includeSearchTerms)}
                                />
                                <label htmlFor="includeSearchTerms" className="ml-2 text-sm text-gray dark:text-lightgray">
                                    Include google Search
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-l font-bold text-gray dark:text-lightgray mb-2">
                                Number of Keywords
                            </label>
                            <input
                                type="number"
                                className="outline-settings-keywords w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded"
                                value={numOfKeywords}
                                onChange={(e) => setNumOfKeywords(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-l font-bold text-gray dark:text-lightgray mb-2">
                                Number of Points
                            </label>
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
                                <label className="text-sm text-gray dark:text-lightgray">Enable</label>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-l font-bold text-gray dark:text-lightgray my-4">User Custom Instructions</label>
                        <textarea
                            className="outline-settings-instructions  w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded"
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