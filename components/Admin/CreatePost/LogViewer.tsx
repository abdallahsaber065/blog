import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

interface LogViewerProps {
    onClose: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ onClose }) => {
    const [logs, setLogs] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [numLines, setNumLines] = useState<number>(10);
    const [fetchAll, setFetchAll] = useState<boolean>(false);
    const logEndRef = useRef<HTMLDivElement>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://generate.api.devtrend.tech/logs', {
                params: fetchAll ? { num_lines: 0 } : { num_lines: numLines }
            });
            setLogs(response.data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [numLines, fetchAll]);

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20 dark:bg-opacity-75">
            <div className="bg-white p-4 rounded shadow-lg w-3/4 h-3/4 flex flex-col dark:bg-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold dark:text-white">Log Viewer</h2>
                    <div className="space-x-2">
                        <button
                            className="bg-blue-500 text-white p-2 rounded dark:bg-blue-700"
                            onClick={fetchLogs}
                        >
                            Refresh
                        </button>
                        <button
                            className="bg-red-500 text-white p-2 rounded dark:bg-red-700"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
                <div className="flex items-center mb-4">
                    <label className="mr-2 dark:text-white">Number of lines:</label>
                    <select
                        className="p-2 rounded border dark:bg-zinc-700 dark:text-white"
                        value={numLines}
                        onChange={(e) => setNumLines(Number(e.target.value))}
                        disabled={fetchAll}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <label className="ml-4 mr-2 dark:text-white">Fetch all:</label>
                    <input
                        type="checkbox"
                        checked={fetchAll}
                        onChange={(e) => {
                            setFetchAll(e.target.checked);
                            if (e.target.checked) {
                                setNumLines(0);
                            }
                        }}
                        className="dark:bg-zinc-700"
                    />
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-100 p-2 rounded dark:bg-zinc-900">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <ClipLoader size={50} color={"#000"} />
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap text-sm text-zinc-950 dark:text-zinc-300 bg-zinc-300 dark:bg-zinc-950 p-2 rounded">
                            {logs}
                        </pre>
                    )}
                    <div ref={logEndRef} />
                </div>
                <button
                    className="bg-green-500 text-white p-2 rounded mt-2 dark:bg-green-700"
                    onClick={() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                    Scroll to End
                </button>
            </div>
        </div>
    );
};

export default LogViewer;