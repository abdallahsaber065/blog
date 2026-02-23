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
    Zap,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

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
        enableWebSearch: boolean;
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

    // Web Search
    const [enableWebSearch, setEnableWebSearch] = useState(true);

    // URL management
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

    // Image management
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

    // Voice recording
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

    // Generate
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
            enableWebSearch,
        });
    };

    const hasAttachments = contextUrls.length > 0 || selectedImages.length > 0 || audioBlob;

    return (
        <div className={`mb-8 rounded-2xl overflow-hidden border border-darkBorder bg-dark shadow-xl ${className ?? ''}`}>

            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-darkBorder bg-gradient-to-r from-darkSurface to-dark">
                <div className="relative p-2 rounded-xl bg-gold/10 border border-gold/20">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="absolute -inset-0.5 rounded-xl border border-gold/40 animate-ping opacity-25 pointer-events-none" />
                </div>
                <div>
                    <span className="text-sm font-bold text-foreground font-display tracking-wide block">AI Content Generator</span>
                    <span className="text-[10px] text-muted-foreground/70">Powered by Gemini</span>
                </div>
                <span className="ml-auto text-[9px] uppercase tracking-widest font-extrabold text-gold/80 bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">Beta</span>
            </div>

            {/* ── Gradient accent ── */}
            <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

            {/* ── Body ── */}
            <div className="p-5 space-y-5">

                {/* Blog Topic */}
                <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <Zap className="w-3 h-3 text-gold" />
                        Blog Topic
                    </label>
                    <div className="relative">
                        <textarea
                            className="w-full min-h-[90px] bg-darkElevated border border-darkBorder rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/15 transition-all duration-200 resize-none leading-relaxed"
                            placeholder="What do you want to write about? Be specific for better results…"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                        />
                        {topic && (
                            <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[10px] text-gold/70">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{topic.split(' ').length} words</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Context URLs + Web Search toggle */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Context URLs</span>
                            {contextUrls.length > 0 && (
                                <span className="text-[10px] bg-gold/10 text-gold border border-gold/20 rounded-full px-1.5 py-0.5 font-bold">
                                    {contextUrls.length}
                                </span>
                            )}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${enableWebSearch ? 'text-gold' : 'text-muted-foreground/100'}`}>
                                Web Search
                            </span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={enableWebSearch}
                                onClick={() => setEnableWebSearch(!enableWebSearch)}
                                className={`relative w-9 h-5 rounded-full direction-normal transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50 ${enableWebSearch ? 'bg-gold shadow-gold-sm' : 'bg-darkBorder'}`}
                            >
                                <motion.span
                                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                                    animate={{ x: enableWebSearch ? 0 : -15 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-darkElevated border border-darkBorder rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/10 transition-all duration-200"
                            placeholder="https://example.com/article"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            onKeyDown={handleUrlKeyDown}
                        />
                        <button
                            onClick={addUrl}
                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-darkBorder bg-darkElevated hover:border-gold/50 hover:bg-gold/5 text-muted-foreground hover:text-gold transition-all duration-200"
                            title="Add URL"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <AnimatePresence>
                        {contextUrls.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-wrap gap-1.5 overflow-hidden"
                            >
                                {contextUrls.map(url => (
                                    <motion.span
                                        key={url}
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        className="group flex items-center gap-1.5 bg-darkElevated border border-darkBorder text-muted-foreground text-xs px-2.5 py-1 rounded-full hover:border-gold/40 hover:text-gold transition-all duration-200"
                                    >
                                        <Globe className="w-2.5 h-2.5 flex-shrink-0 text-gold/60" />
                                        <span className="max-w-[140px] truncate">{displayUrl(url)}</span>
                                        <button
                                            onClick={() => removeUrl(url)}
                                            className="ml-0.5 text-muted-foreground/40 hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </motion.span>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Add Images / Record Notes — 2-col grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Add Images */}
                    <button
                        onClick={() => setShowImageSelector(true)}
                        className="group relative flex flex-col items-center justify-center gap-2 h-28 rounded-xl border border-dashed border-darkBorder bg-darkElevated hover:border-gold/50 hover:bg-gold/5 transition-all duration-300"
                    >
                        {selectedImages.length > 0 ? (
                            <>
                                <div className="flex -space-x-2">
                                    {selectedImages.slice(0, 3).map((url, i) => (
                                        <img key={i} src={url} className="w-8 h-8 rounded-full object-cover border-2 border-darkElevated ring-1 ring-gold/20" />
                                    ))}
                                </div>
                                <span className="text-xs text-gold font-semibold">
                                    {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''}
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="p-2.5 rounded-xl bg-darkBorder/60 group-hover:bg-gold/10 border border-transparent group-hover:border-gold/20 transition-all duration-200">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                                </div>
                                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">Add Images</span>
                            </>
                        )}
                    </button>

                    {/* Record Notes */}
                    <div className="group relative flex flex-col items-center justify-center gap-2 h-28 rounded-xl border border-dashed border-darkBorder bg-darkElevated hover:border-gold/50 hover:bg-gold/5 transition-all duration-300 overflow-hidden">
                        {isRecording ? (
                            <>
                                {/* Recording pulse background */}
                                <span className="absolute inset-0 bg-red-500/5 animate-pulse" />
                                <div className="flex items-center gap-2 relative">
                                    <motion.span
                                        className="w-2.5 h-2.5 rounded-full bg-red-500"
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.9 }}
                                    />
                                    <span className="text-sm font-mono text-red-400 font-bold">{formatTime(recordingSeconds)}</span>
                                </div>
                                <button
                                    onClick={stopRecording}
                                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
                                >
                                    <Square className="w-3 h-3 fill-current" /> Stop
                                </button>
                            </>
                        ) : audioBlob ? (
                            <>
                                <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20">
                                    <Mic className="w-5 h-5 text-gold" />
                                </div>
                                <span className="text-xs text-gold font-semibold">Recorded ({formatTime(recordingSeconds)})</span>
                                <button
                                    onClick={clearRecording}
                                    className="text-[11px] text-muted-foreground/50 hover:text-red-400 transition-colors underline"
                                >clear</button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={startRecording}
                                    className="p-2.5 rounded-xl bg-darkBorder/60 group-hover:bg-gold/10 border border-transparent group-hover:border-gold/20 transition-all duration-200"
                                >
                                    <Mic className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                                </button>
                                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">Voice Notes</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Selected images strip */}
                <AnimatePresence>
                    {selectedImages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-wrap gap-2 overflow-hidden"
                        >
                            {selectedImages.map((url, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative group"
                                >
                                    <button
                                        className="absolute -top-1.5 -right-1.5 z-10 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                                        onClick={() => removeImage(url)}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <img
                                        src={url}
                                        className="w-14 h-14 object-cover rounded-xl border border-darkBorder cursor-pointer hover:opacity-90 transition-opacity hover:ring-2 hover:ring-gold/30"
                                        onClick={() => setPreviewImage(url)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Advanced Settings */}
                <div className="rounded-xl border border-darkBorder overflow-hidden">
                    <button
                        onClick={() => setShowAdvanced(s => !s)}
                        className="w-full flex items-center gap-2.5 px-4 py-3 bg-darkSurface hover:bg-darkElevated transition-colors text-sm text-muted-foreground hover:text-foreground"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span className="font-semibold">Advanced Settings</span>
                        <span className="ml-auto">
                            {showAdvanced
                                ? <ChevronUp className="w-3.5 h-3.5" />
                                : <ChevronDown className="w-3.5 h-3.5" />}
                        </span>
                    </button>
                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 space-y-4 border-t border-darkBorder bg-darkElevated/50">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground">Custom Instructions</label>
                                        <textarea
                                            className="w-full min-h-[64px] bg-darkElevated border border-darkBorder rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/15 resize-none transition-colors"
                                            placeholder="Any specific style, tone, or content requirements…"
                                            value={userCustomInstructions}
                                            onChange={e => setUserCustomInstructions(e.target.value)}
                                        />
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer select-none group">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={includeImages}
                                            onClick={() => setIncludeImages(!includeImages)}
                                            className={`relative w-9 h-5 rounded-full transition-all duration-300 focus:outline-none ${includeImages ? 'bg-gold shadow-gold-sm' : 'bg-darkBorder'}`}
                                        >
                                            <motion.span
                                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                                                animate={{ x: includeImages ? 17 : 2 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            />
                                        </button>
                                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Add image placeholders in output</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Generate button */}
                <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                        className={`w-full h-12 text-sm font-bold tracking-wide gap-2.5 rounded-xl transition-all duration-300 ${loading
                                ? 'bg-gold/80 text-dark cursor-wait'
                                : topic.trim()
                                    ? 'bg-gradient-to-r from-gold to-goldDark text-dark hover:from-goldDark hover:to-gold shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5'
                                    : 'bg-darkElevated text-muted-foreground border border-darkBorder cursor-not-allowed'
                            }`}
                        onClick={handleGenerate}
                        disabled={loading || !topic.trim()}
                    >
                        {loading ? (
                            <>
                                <motion.span
                                    className="inline-block w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                />
                                <span>Researching &amp; Writing…</span>
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-4 h-4" />
                                <span>Generate Content</span>
                                {hasAttachments && (
                                    <span className="text-[10px] bg-dark/20 rounded-full px-2 py-0.5">
                                        {[contextUrls.length, selectedImages.length, audioBlob ? 1 : 0]
                                            .filter(Boolean).reduce((a, b) => a + b, 0)} context
                                    </span>
                                )}
                            </>
                        )}
                    </Button>
                </motion.div>
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
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-dark/85 backdrop-blur-md flex justify-center items-center z-50"
                        onClick={() => setPreviewImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-darkSurface border border-darkBorder p-5 rounded-2xl w-3/4 max-w-2xl shadow-2xl"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-xl" />
                            <button
                                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
                                onClick={() => setPreviewImage(null)}
                            >
                                <X className="w-4 h-4" /> Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIContentGenerator;
