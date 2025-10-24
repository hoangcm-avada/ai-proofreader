import React, { useState, useCallback } from 'react';
import { CloudArrowUpIcon, SparklesIcon, DocumentTextIcon, XIcon } from './icons';

interface FileUploadViewProps {
    onAnalyzeFiles: (files: File[], dictionary: string, styleGuide: string) => void;
    isLoading: boolean;
}

const FileUploadView: React.FC<FileUploadViewProps> = ({ onAnalyzeFiles, isLoading }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [customDictionary, setCustomDictionary] = useState('');
    const [styleGuideRules, setStyleGuideRules] = useState('');

    const handleFileChange = (selectedFiles: FileList | null) => {
        if (selectedFiles) {
            const newFiles = Array.from(selectedFiles).filter(
                file => (
                    file.name.endsWith('.md') || 
                    file.name.endsWith('.mdx') ||
                    file.name.endsWith('.txt') ||
                    file.name.endsWith('.doc') ||
                    file.name.endsWith('.docx')
                ) && !files.some(f => f.name === file.name)
            );
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    const removeFile = (fileName: string) => {
        setFiles(files.filter(file => file.name !== fileName));
    };
    
    const handleAnalyze = () => {
        onAnalyzeFiles(files, customDictionary, styleGuideRules);
    };

    const countWords = (text: string) => {
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const dictionaryWordCount = countWords(customDictionary);
    const styleGuideWordCount = countWords(styleGuideRules);

    return (
        <div className="bg-[#1C1827] border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-2xl shadow-purple-900/10 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.purple.700)]">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Upload Document Files
                    </label>
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-purple-500 bg-purple-900/20' : 'border-gray-600/80 hover:border-gray-500'}`}
                    >
                        <div className="text-center">
                            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-400">
                                <label htmlFor="file-upload" className="font-semibold text-purple-400 cursor-pointer hover:underline">Click to upload</label> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">Supports .md, .mdx, .txt, .doc, and .docx</p>
                            <input
                                type="file"
                                multiple
                                accept=".md,.mdx,.txt,.doc,.docx"
                                onChange={(e) => handleFileChange(e.target.files)}
                                className="sr-only"
                                id="file-upload"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                {files.length > 0 && (
                     <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-300">Selected Files:</h3>
                        <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-[#0D0B14] border border-gray-600 rounded-md">
                        {files.map((file) => (
                            <div key={file.name} className="flex items-center justify-between bg-[#1C1827] p-2 rounded-md">
                                <div className="flex items-center space-x-3 truncate">
                                    <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-300 truncate" title={file.name}>{file.name}</span>
                                </div>
                                <button
                                    onClick={() => removeFile(file.name)}
                                    className="p-1 rounded-full hover:bg-gray-700 flex-shrink-0"
                                    aria-label={`Remove ${file.name}`}
                                    disabled={isLoading}
                                >
                                    <XIcon className="w-4 h-4 text-gray-500 hover:text-white" />
                                </button>
                            </div>
                        ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label htmlFor="file-custom-dictionary" className="block text-sm font-medium text-gray-300 mb-2">
                            Custom Dictionary <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="file-custom-dictionary"
                            value={customDictionary}
                            onChange={(e) => setCustomDictionary(e.target.value)}
                            className="w-full h-24 sm:h-28 p-3 bg-[#0D0B14] border border-gray-600 rounded-md shadow-sm font-mono text-sm disabled:opacity-50"
                            placeholder="Prevent the AI from flagging specific words. Enter one term per line. Good for brand names, acronyms, or technical terms (e.g., 'Avada', 'SaaS', 'front-end')."
                            disabled={isLoading}
                        />
                         <div className="text-right text-xs text-gray-300 mt-1 pr-1">
                           {dictionaryWordCount} {dictionaryWordCount === 1 ? 'word' : 'words'}
                        </div>
                    </div>
                    <div>
                         <label htmlFor="file-style-guide" className="block text-sm font-medium text-gray-300 mb-2">
                            Style Guide Rules <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="file-style-guide"
                            value={styleGuideRules}
                            onChange={(e) => setStyleGuideRules(e.target.value)}
                            className="w-full h-24 sm:h-28 p-3 bg-[#0D0B14] border border-gray-600 rounded-md shadow-sm font-mono text-sm disabled:opacity-50"
                            placeholder="Enforce custom writing rules. Enter one rule per line. The AI will follow these instructions (e.g., 'Always use &quot;customer&quot; instead of &quot;user&quot;', 'Write in a formal tone')."
                            disabled={isLoading}
                        />
                         <div className="text-right text-xs text-gray-300 mt-1 pr-1">
                           {styleGuideWordCount} {styleGuideWordCount === 1 ? 'word' : 'words'}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || files.length === 0}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Analyzing...' : <><SparklesIcon className="mr-2 h-5 w-5" /><span>Analyze {files.length} File{files.length === 1 ? '' : 's'}</span></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUploadView;