import React from 'react';
import { ClipLoader } from 'react-spinners';
import ContentSettings from './ContentSettings';
import JSONEditorComponent from '../JSONEditor';
import LogViewer from './LogViewer';

interface AIContentGeneratorProps {
    className?: string;
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
    loading: boolean;
    outline: any;
    outlineDraft: any;
    setOutlineDraft: (value: any) => void;
    showJSONEditor: boolean;
    setShowJSONEditor: (value: boolean) => void;
    showLogViewer: boolean;
    setShowLogViewer: (value: boolean) => void;
    includeSearchTerms: boolean;
    setIncludeSearchTerms: (value: boolean) => void;
    handleGenerateOutline: () => void;
    handleAcceptOutline: () => void;
    handleSaveOutline: () => void;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
    className,
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
    loading,
    outline,
    outlineDraft,
    setOutlineDraft,
    showJSONEditor,
    setShowJSONEditor,
    showLogViewer,
    setShowLogViewer,
    includeSearchTerms,
    setIncludeSearchTerms,
    handleGenerateOutline,
    handleAcceptOutline,
    handleSaveOutline,
}) => {
    return (
        <div className={`mb-8 border border-slate-200 dark:border-slate-700 rounded-lg p-4 ${className}`}>
            <input
                className="topic-input w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded"
                type="text"
                placeholder="Enter your post topic here"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
            />

            <ContentSettings
                topic={topic}
                setTopic={setTopic}
                numOfTerms={numOfTerms}
                setNumOfTerms={setNumOfTerms}
                numOfKeywords={numOfKeywords}
                setNumOfKeywords={setNumOfKeywords}
                numOfPoints={numOfPoints}
                setNumOfPoints={setNumOfPoints}
                enableNumOfPoints={enableNumOfPoints}
                setEnableNumOfPoints={setEnableNumOfPoints}
                userCustomInstructions={userCustomInstructions}
                setUserCustomInstructions={setUserCustomInstructions}
                showContentSettings={showContentSettings}
                setShowContentSettings={setShowContentSettings}
            />

            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
                <button
                    className="generate-outline-btn bg-blue-500 text-white font-bold p-2 rounded hover:bg-blue-600"
                    onClick={handleGenerateOutline}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Generate Outline'}
                </button>

                <button
                    className="edit-outline-btn bg-yellow-500 text-white font-bold p-2 rounded hover:bg-yellow-600"
                    onClick={() => setShowJSONEditor(true)}
                >
                    Edit Outline
                </button>

                {outline && (
                    <button
                        className="generate-content-btn bg-green-500 text-white font-bold p-2 rounded hover:bg-green-600"
                        onClick={handleAcceptOutline}
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Generate Content'}
                    </button>
                )}

                <button
                    className="bg-slate-500 text-white font-bold p-2 rounded hover:bg-slate-600"
                    onClick={() => setShowLogViewer(true)}
                >
                    View Logs
                </button>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        className="mr-2"
                        checked={includeSearchTerms}
                        onChange={() => setIncludeSearchTerms(!includeSearchTerms)}
                    />
                    <label className="text-gray dark:text-lightgray">Include Search Terms</label>
                </div>
            </div>

            {showJSONEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded shadow-lg w-3/4">
                        <h2 className="text-xl font-bold mb-4">Edit Outline</h2>
                        <JSONEditorComponent value={outlineDraft || outline} onChange={setOutlineDraft} />
                        <div className="flex justify-end space-x-4 mt-4">
                            <button
                                className="bg-red-500 text-white p-2 rounded"
                                onClick={() => setShowJSONEditor(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-500 text-white p-2 rounded"
                                onClick={handleSaveOutline}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLogViewer && (
                <LogViewer
                    onClose={() => setShowLogViewer(false)}
                    link='https://generate.api.devtrend.tech/logs'
                />
            )}
        </div>
    );
};

export default AIContentGenerator;
