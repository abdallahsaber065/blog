import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

interface LogViewerProps {
    onClose: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ onClose }) => {
    const [logs, setLogs] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const logEndRef = useRef<HTMLDivElement>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://generate.api.devtrend.tech/logs');
            setLogs(response.data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
            <div className="bg-white p-4 rounded shadow-lg w-3/4 h-3/4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Log Viewer</h2>
                    <div className="space-x-2">
                        <button
                            className="bg-blue-500 text-white p-2 rounded"
                            onClick={fetchLogs}
                        >
                            Refresh
                        </button>
                        <button
                            className="bg-red-500 text-white p-2 rounded"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-100 p-2 rounded">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <ClipLoader size={50} color={"#000"} />
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap">{logs}</pre>
                    )}
                    <div ref={logEndRef} />
                </div>
                <button
                    className="bg-green-500 text-white p-2 rounded mt-2"
                    onClick={() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                    Scroll to End
                </button>
            </div>
        </div>
    );
};

export default LogViewer;