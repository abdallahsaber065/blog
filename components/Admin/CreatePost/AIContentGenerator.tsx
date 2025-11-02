'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Brain, CheckCircle2, Code2, Eye, FileText, Image as ImageIcon, Loader2, Search, Settings2, Sparkles, Upload, Wand2, X } from 'lucide-react';
import React, { useState } from 'react';
import FileSelector from '../FileSelector';
import ImageSelector from '../ImageSelector';
import JSONEditor from '../JSONEditor';

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
    includeSearchTerms: boolean;
    setIncludeSearchTerms: (value: boolean) => void;
    handleGenerateOutline: () => void;
    handleAcceptOutline: () => void;
    handleSaveOutline: () => void;
    includeImages: boolean;
    setIncludeImages: (value: boolean) => void;
    onFileSelect: (files: string[]) => void;
    onImageSelect: (images: string[]) => void;
}

interface FileProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
}

interface ImageProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    width: number;
    height: number;
}

const AIContentGeneratorNew: React.FC<AIContentGeneratorProps> = ({
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
    includeSearchTerms,
    setIncludeSearchTerms,
    handleGenerateOutline,
    handleAcceptOutline,
    handleSaveOutline,
    includeImages,
    setIncludeImages,
    onFileSelect,
    onImageSelect,
}) => {
    const [selectedFiles, setSelectedFiles] = useState<{ url: string; name: string }[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [showFileSelector, setShowFileSelector] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [advancedSettings, setAdvancedSettings] = useState(false);
    const [useGoogleSearch, setUseGoogleSearch] = useState(false);
    const [useCodeExecution, setUseCodeExecution] = useState(false);
    const [useThinking, setUseThinking] = useState(true);
    const [thinkingBudget, setThinkingBudget] = useState<number>(1024);

    const handleFileSelect = (file: FileProps) => {
        const fileUrl = `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/files/download?file_url_name=${file.file_url.split('/').pop()}`;
        const fileName = file.file_name;

        if (!selectedFiles.some(selectedFile => selectedFile.url === fileUrl)) {
            const newFile = { url: fileUrl, name: fileName };
            setSelectedFiles((prev) => [...prev, newFile]);
            onFileSelect([...selectedFiles.map(f => f.url), fileUrl]);
        }
    };

    const handleImageSelect = (image: ImageProps) => {
        if (!selectedImages.includes(image.file_url)) {
            setSelectedImages((prev) => [...prev, image.file_url]);
            onImageSelect([...selectedImages, image.file_url]);
        }
    };

    const removeFile = (fileUrl: string) => {
        const updatedFiles = selectedFiles.filter((file) => file.url !== fileUrl);
        setSelectedFiles(updatedFiles);
        onFileSelect(updatedFiles.map(file => file.url));
    };

    const removeImage = (imageUrl: string) => {
        const updated = selectedImages.filter((url) => url !== imageUrl);
        setSelectedImages(updated);
        onImageSelect(updated);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Main Card */}
            <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">AI Content Generator</CardTitle>
                                <CardDescription className="text-sm">
                                    Powered by Gemini 2.5 Flash with Advanced Thinking
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="gap-1">
                            <Brain className="w-3 h-3" />
                            Enhanced AI
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Topic Input */}
                    <div className="space-y-2">
                        <Label htmlFor="topic" className="text-base font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Content Topic
                        </Label>
                        <div className="relative">
                            <Input
                                id="topic"
                                type="text"
                                placeholder="Enter your blog post topic (e.g., 'The Future of AI in Web Development')"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="pr-12 h-12 text-lg"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Wand2 className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Tabs for Different Sections */}
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic" className="gap-2">
                                <Settings2 className="w-4 h-4" />
                                Basic Settings
                            </TabsTrigger>
                            <TabsTrigger value="ai" className="gap-2">
                                <Brain className="w-4 h-4" />
                                AI Features
                            </TabsTrigger>
                            <TabsTrigger value="media" className="gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Media & Files
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Settings Tab */}
                        <TabsContent value="basic" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Content Parameters</CardTitle>
                                    <CardDescription>Configure basic generation settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="keywords">SEO Keywords Count</Label>
                                            <Input
                                                id="keywords"
                                                type="number"
                                                min="5"
                                                max="50"
                                                value={numOfKeywords}
                                                onChange={(e) => setNumOfKeywords(parseInt(e.target.value))}
                                                className="h-10"
                                            />
                                            <p className="text-xs text-gray-500">Number of keywords to generate (5-50)</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="terms">Search Terms Count</Label>
                                            <Input
                                                id="terms"
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={numOfTerms}
                                                onChange={(e) => setNumOfTerms(parseInt(e.target.value))}
                                                className="h-10"
                                            />
                                            <p className="text-xs text-gray-500">Number of search terms (1-20)</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="points">Points Per Section</Label>
                                            <Checkbox
                                                checked={enableNumOfPoints}
                                                onCheckedChange={(checked) => setEnableNumOfPoints(checked as boolean)}
                                            />
                                        </div>
                                        <Input
                                            id="points"
                                            type="number"
                                            min="2"
                                            max="10"
                                            value={numOfPoints}
                                            onChange={(e) => setNumOfPoints(parseInt(e.target.value))}
                                            disabled={!enableNumOfPoints}
                                            className="h-10"
                                        />
                                        <p className="text-xs text-gray-500">
                                            {enableNumOfPoints ? 'Fixed number of points per section' : 'Auto-determined by AI'}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="instructions">Custom Instructions</Label>
                                        <Textarea
                                            id="instructions"
                                            placeholder="Add any specific requirements, style preferences, or guidelines..."
                                            value={userCustomInstructions}
                                            onChange={(e) => setUserCustomInstructions(e.target.value)}
                                            rows={4}
                                            className="resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-slate-800 rounded-lg">
                                        <Checkbox
                                            id="includeSearchTerms"
                                            checked={includeSearchTerms}
                                            onCheckedChange={(checked) => setIncludeSearchTerms(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="includeSearchTerms"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Include generated search terms in content
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-slate-800 rounded-lg">
                                        <Checkbox
                                            id="includeImages"
                                            checked={includeImages}
                                            onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
                                        />
                                        <label
                                            htmlFor="includeImages"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Include image placeholders in content
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* AI Features Tab */}
                        <TabsContent value="ai" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-blue-500" />
                                        Advanced AI Capabilities
                                    </CardTitle>
                                    <CardDescription>Enable cutting-edge AI features</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Thinking Mode */}
                                    <div className="space-y-3 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Brain className="w-5 h-5 text-blue-500" />
                                                <div>
                                                    <Label className="text-base font-semibold">Thinking Mode</Label>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        Let AI think deeply before generating
                                                    </p>
                                                </div>
                                            </div>
                                            <Checkbox
                                                checked={useThinking}
                                                onCheckedChange={(checked) => setUseThinking(checked as boolean)}
                                            />
                                        </div>

                                        {useThinking && (
                                            <div className="space-y-2 pl-7">
                                                <Label className="text-sm">Thinking Budget (tokens)</Label>
                                                <Input
                                                    type="number"
                                                    value={thinkingBudget}
                                                    onChange={(e) => setThinkingBudget(parseInt(e.target.value))}
                                                    min="512"
                                                    max="4096"
                                                    step="512"
                                                    className="h-9"
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Higher values = deeper thinking (-1 for dynamic)
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Google Search */}
                                    <div className="space-y-2 p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Search className="w-5 h-5 text-green-500" />
                                                <div>
                                                    <Label className="text-base font-semibold">Google Search Grounding</Label>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        Verify facts with real-time search
                                                    </p>
                                                </div>
                                            </div>
                                            <Checkbox
                                                checked={useGoogleSearch}
                                                onCheckedChange={(checked) => setUseGoogleSearch(checked as boolean)}
                                            />
                                        </div>
                                    </div>

                                    {/* Code Execution */}
                                    <div className="space-y-2 p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Code2 className="w-5 h-5 text-orange-500" />
                                                <div>
                                                    <Label className="text-base font-semibold">Code Execution</Label>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        Run code for examples and calculations
                                                    </p>
                                                </div>
                                            </div>
                                            <Checkbox
                                                checked={useCodeExecution}
                                                onCheckedChange={(checked) => setUseCodeExecution(checked as boolean)}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-lg border">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">AI Enhancement Active</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {[useThinking && 'Thinking', useGoogleSearch && 'Search', useCodeExecution && 'Code Execution']
                                                        .filter(Boolean)
                                                        .join(' • ') || 'No enhancements enabled'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Media & Files Tab */}
                        <TabsContent value="media" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Media & Context Files</CardTitle>
                                    <CardDescription>Add files and images for AI context</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* File Upload Section */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Context Files</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowFileSelector(true)}
                                            className="w-full h-12 border-dashed"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Add Reference Files
                                        </Button>

                                        {selectedFiles.length > 0 && (
                                            <div className="space-y-2">
                                                {selectedFiles.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                                                    >
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                            <span className="text-sm truncate">{file.name}</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile(file.url)}
                                                            className="flex-shrink-0"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Upload Section */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Reference Images</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowImageSelector(true)}
                                            className="w-full h-12 border-dashed"
                                        >
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            Add Reference Images
                                        </Button>

                                        {selectedImages.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {selectedImages.map((imageUrl, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative group aspect-square rounded-lg overflow-hidden border"
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Reference ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => setPreviewImage(imageUrl)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => removeImage(imageUrl)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        <Button
                            onClick={handleGenerateOutline}
                            disabled={loading || !topic.trim()}
                            className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Outline
                                </>
                            )}
                        </Button>

                        {outline && (
                            <>
                                <Button
                                    onClick={handleAcceptOutline}
                                    variant="outline"
                                    className="flex-1 h-12 text-base font-semibold border-green-500 text-green-600 hover:bg-green-50"
                                >
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    Accept Outline
                                </Button>

                                <Button
                                    onClick={() => setShowJSONEditor(true)}
                                    variant="outline"
                                    className="h-12 px-6"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    Edit JSON
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dialogs */}
            {showFileSelector && (
                <FileSelector
                    isOpen={showFileSelector}
                    onClose={() => setShowFileSelector(false)}
                    onSelect={handleFileSelect}
                />
            )}

            {showImageSelector && (
                <ImageSelector
                    isOpen={showImageSelector}
                    onClose={() => setShowImageSelector(false)}
                    onSelect={handleImageSelect}
                    folder="blog"
                />
            )}

            {showJSONEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Edit Outline JSON</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowJSONEditor(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <JSONEditor
                                value={outlineDraft || outline}
                                onChange={setOutlineDraft}
                            />
                        </div>
                        <div className="flex gap-2 p-4 border-t">
                            <Button onClick={handleSaveOutline} className="flex-1">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => setShowJSONEditor(false)} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {previewImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-4 right-4 z-10"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIContentGeneratorNew;
