/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ImageSelector from '@/components/Admin/ImageSelector';
import {
    Sparkles,
    Wand2,
    Globe,
    Plus,
    X,
    Image as ImageIcon,
    Mic,
    Square,
    ChevronDown,
    ChevronUp,
    Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaFile } from 'react-icons/fa';

// ── Types ──────────────────────────────────────────────────────────────────

interface ImageProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    width: number;
    height: number;
}

export interface AIContentGeneratorProps {
    className?: string;
    topic: string;
    setTopic: (v: string) => void;
    userCustomInstructions: string;
    setUserCustomInstructions: (v: string) => void;
    includeImages: boolean;
    setIncludeImages: (v: boolean) => void;
    loading: boolean;
    onGenerate: (params: {
        contextUrls: string[];
        voiceNoteBase64: string | null;
        voiceNoteMime: string;
        selectedImages: string[];
    }) => void;
    onImageSelect: (images: string[]) => void;
}

// ── Recording helpers ──────────────────────────────────────────────────────

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ── Component ──────────────────────────────────────────────────────────────

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
    className,
    topic,
    setTopic,
    userCustomInstructions,
    setUserCustomInstructions,
    includeImages,
    setIncludeImages,
    loading,
    onGenerate,
    onImageSelect,
}) => {
    // Context URLs
    const [urlInput, setUrlInput] = useState('');
    const [contextUrls, setContextUrls] = useState<string[]>([]);

    // Images
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Voice recording
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioMime, setAudioMime] = useState('audio/webm');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobEvent['data'][]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Advanced settings
    const [showAdvanced, setShowAdvanced] = useState(false);

    // ── URL management ───────────────────────────────────────────────────

    const addUrl = useCallback(() => {
        const trimmed = urlInput.trim();
        if (!trimmed) return;
        if (!contextUrls.includes(trimmed)) {
            setContextUrls(prev => [...prev, trimmed]);
        }
        setUrlInput('');
    }, [urlInput, contextUrls]);

    const removeUrl = (url: string) => setContextUrls(prev => prev.filter(u => u !== url));

    const handleUrlKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { e.preventDefault(); addUrl(); }
    };

    const displayUrl = (url: string) =>
        url.replace(/^https?:\/\//, '').split('/')[0];

    // ── Image management ─────────────────────────────────────────────────

    const handleImageSelect = (image: ImageProps) => {
        if (!selectedImages.includes(image.file_url)) {
            const next = [...selectedImages, image.file_url];
            setSelectedImages(next);
            onImageSelect(next);
        }
    };

    const removeImage = (url: string) => {
        const next = selectedImages.filter(u => u !== url);
        setSelectedImages(next);
        onImageSelect(next);
    };

    // ── Voice recording ──────────────────────────────────────────────────

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';
            setAudioMime(mimeType);
            const recorder = new MediaRecorder(stream, { mimeType });
            chunksRef.current = [];
            recorder.ondataavailable = (e: BlobEvent) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
            };
            recorder.start(200);
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordingSeconds(0);
            timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
        } catch (err) {
            console.error('Microphone access denied:', err);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const clearRecording = () => {
        setAudioBlob(null);
        setRecordingSeconds(0);
    };

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    const formatTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // ── Generate ─────────────────────────────────────────────────────────

    const handleGenerate = async () => {
        let voiceNoteBase64: string | null = null;
        if (audioBlob) {
            voiceNoteBase64 = await blobToBase64(audioBlob);
        }
        onGenerate({
            contextUrls,
            voiceNoteBase64,
            voiceNoteMime: audioMime,
            selectedImages,
        });
    };

    // ── Render ───────────────────────────────────────────────────────────

    return (
        <div className={`mb-8 rounded-2xl overflow-hidden border border-darkBorder bg-dark shadow-xl ${className ?? ''}`}>

            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-darkBorder bg-darkSurface">
                <div className="relative p-1.5 rounded-lg bg-gold/10 border border-gold/25">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="absolute -inset-0.5 rounded-lg border border-gold/30 animate-ping opacity-30 pointer-events-none" />
                </div>
                <span className="text-sm font-semibold text-foreground font-display tracking-wide">AI Content Generator</span>
                <span className="ml-auto text-[10px] uppercase tracking-widest font-bold text-gold/70 bg-gold/10 px-2 py-0.5 rounded-full">Beta</span>
            </div>

            {/* ── Body ── */}
            <div className="p-5 space-y-5">

                {/* Blog Topic */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blog Topic</label>
                    <textarea
                        className="w-full min-h-[80px] bg-darkElevated border border-darkBorder rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
                        placeholder="Describe the topic you want to write about…"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                    />
                </div>

                {/* Context URLs */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Context URLs</span>
                    </div>
                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-darkElevated border border-darkBorder rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                            placeholder="https://example.com/article"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            onKeyDown={handleUrlKeyDown}
                        />
                        <button
                            onClick={addUrl}
                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-darkBorder bg-darkElevated hover:border-gold/40 hover:bg-gold/5 text-muted-foreground hover:text-gold transition-all duration-200"
                            title="Add URL"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    {contextUrls.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {contextUrls.map(url => (
                                <span
                                    key={url}
                                    className="group flex items-center gap-1.5 bg-darkElevated border border-darkBorder text-muted-foreground text-xs px-2.5 py-1 rounded-full hover:border-gold/30 transition-colors"
                                >
                                    <Globe className="w-2.5 h-2.5 flex-shrink-0 text-gold/60" />
                                    <span className="max-w-[140px] truncate">{displayUrl(url)}</span>
                                    <button
                                        onClick={() => removeUrl(url)}
                                        className="ml-0.5 text-muted-foreground/50 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Images / Record Notes */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Add Images */}
                    <button
                        onClick={() => setShowImageSelector(true)}
                        className="group relative flex flex-col items-center justify-center gap-2 h-28 rounded-xl border border-dashed border-darkBorder bg-darkElevated hover:border-gold/40 hover:bg-gold/5 transition-all duration-200"
                    >
                        {selectedImages.length > 0 ? (
                            <>
                                <div className="flex -space-x-2">
                                    {selectedImages.slice(0, 3).map((url, i) => (
                                        <img key={i} src={url} className="w-8 h-8 rounded-full object-cover border-2 border-darkElevated" />
                                    ))}
                                </div>
                                <span className="text-xs text-gold font-medium">
                                    {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} attached
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="p-2 rounded-lg bg-darkBorder/50 group-hover:bg-gold/10 transition-colors">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                                </div>
                                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">Add Images</span>
                            </>
                        )}
                    </button>

                    {/* Record Notes */}
                    <div className="group relative flex flex-col items-center justify-center gap-2 h-28 rounded-xl border border-dashed border-darkBorder bg-darkElevated hover:border-gold/40 hover:bg-gold/5 transition-all duration-200">
                        {isRecording ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-sm font-mono text-red-400 font-semibold">{formatTime(recordingSeconds)}</span>
                                </div>
                                <button
                                    onClick={stopRecording}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                                >
                                    <Square className="w-3 h-3 fill-current" /> Stop
                                </button>
                            </>
                        ) : audioBlob ? (
                            <>
                                <div className="p-2 rounded-lg bg-gold/10">
                                    <Mic className="w-5 h-5 text-gold" />
                                </div>
                                <span className="text-xs text-gold font-medium">Note recorded ({formatTime(recordingSeconds)})</span>
                                <button
                                    onClick={clearRecording}
                                    className="text-[11px] text-muted-foreground/60 hover:text-red-400 transition-colors underline"
                                >clear</button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={startRecording}
                                    className="p-2 rounded-lg bg-darkBorder/50 group-hover:bg-gold/10 transition-colors"
                                >
                                    <Mic className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                                </button>
                                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">Record Notes</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Selected images strip */}
                {selectedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedImages.map((url, i) => (
                            <div key={i} className="relative group">
                                <button
                                    className="absolute -top-1.5 -right-1.5 z-10 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow"
                                    onClick={() => removeImage(url)}
                                >&times;</button>
                                <img
                                    src={url}
                                    className="w-14 h-14 object-cover rounded-lg border border-darkBorder cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setPreviewImage(url)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Advanced Settings */}
                <div className="rounded-xl border border-darkBorder overflow-hidden">
                    <button
                        onClick={() => setShowAdvanced(s => !s)}
                        className="w-full flex items-center gap-2 px-4 py-3 bg-darkSurface hover:bg-darkElevated transition-colors text-sm text-muted-foreground hover:text-foreground"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span className="font-medium">Advanced Settings</span>
                        {showAdvanced
                            ? <ChevronUp className="w-3.5 h-3.5 ml-auto" />
                            : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                    {showAdvanced && (
                        <div className="p-4 space-y-3 border-t border-darkBorder bg-darkElevated/50">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Custom Instructions</label>
                                <textarea
                                    className="w-full min-h-[64px] bg-darkElevated border border-darkBorder rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 resize-none transition-colors"
                                    placeholder="Any specific style, tone, or content requirements…"
                                    value={userCustomInstructions}
                                    onChange={e => setUserCustomInstructions(e.target.value)}
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div
                                    onClick={() => setIncludeImages(!includeImages)}
                                    className={`relative w-9 h-5 rounded-full transition-colors ${includeImages ? 'bg-gold' : 'bg-darkBorder'}`}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${includeImages ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </div>
                                <span className="text-xs text-muted-foreground">Add image placeholders in output</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Generate button */}
                <Button
                    className="w-full gap-2 h-11 text-sm font-semibold tracking-wide"
                    onClick={handleGenerate}
                    disabled={loading || !topic.trim()}
                >
                    {loading ? (
                        <>
                            <span className="inline-block w-4 h-4 border-2 border-dark/40 border-t-transparent rounded-full animate-spin" />
                            <span>Researching &amp; Writing…</span>
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-4 h-4" />
                            <span>Generate Content</span>
                        </>
                    )}
                </Button>
            </div>

            {/* ── Image Selector Modal ── */}
            {showImageSelector && (
                <ImageSelector
                    isOpen={showImageSelector}
                    onClose={() => setShowImageSelector(false)}
                    onSelect={handleImageSelect}
                    folder="media"
                />
            )}

            {/* ── Image Preview Modal ── */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex justify-center items-center z-50"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="bg-darkSurface border border-darkBorder p-5 rounded-2xl w-3/4 max-w-2xl"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        <img src={previewImage} alt="Preview" className="w-full h-auto rounded-xl" />
                        <button
                            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X className="w-4 h-4" /> Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIContentGenerator;

