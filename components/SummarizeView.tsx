import React, { useState } from 'react';
import { SparklesIcon, CloudArrowUpIcon, DocumentTextIcon, XIcon } from './icons';
import { generateSampleTextForSummary } from '../services/geminiService';
import { DEMO_MARKDOWN_TEXT } from '../constants';

interface SummarizeViewProps {
    onSummarize: (params: { text?: string; file?: File }) => void;
    isLoading: boolean;
}

const SummarizeView: React.FC<SummarizeViewProps> = ({ onSummarize, isLoading }) => {
    const [inputType, setInputType] = useState<'text' | 'file'>('text');
    const [documentText, setDocumentText] = useState<string>(DEMO_MARKDOWN_TEXT);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateSample = async () => {
        setIsGenerating(true);
        try {
            const newText = await generateSampleTextForSummary();
            setDocumentText(newText);
        } catch (error) {
            alert("Could not generate sample text. Please try again.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile && (
            selectedFile.name.endsWith('.md') ||
            selectedFile.name.endsWith('.mdx') ||
            selectedFile.name.endsWith('.txt') ||
            selectedFile.name.endsWith('.doc') ||
            selectedFile.name.endsWith('.docx')
        )) {
            setFile(selectedFile);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
        else if (e.type === "dragleave") setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const removeFile = () => setFile(null);
    
    const handleSummarizeClick = () => {
        if (inputType === 'text') {
            onSummarize({ text: documentText });
        } else if (file) {
            onSummarize({ file });
        }
    };

    const isButtonDisabled = isLoading || (inputType === 'text' && !documentText.trim()) || (inputType === 'file' && !file);

    const wordCount = documentText.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className="bg-[#1C1827] border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-2xl shadow-purple-900/10 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.purple.700)]">
            <div className="space-y-4">
                
                <div className="flex border-b border-gray-700/50 mb-4">
                    <button
                        onClick={() => setInputType('text')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${inputType === 'text' ? 'border-b-2 border-purple-500 text-white' : 'border-b-2 border-transparent text-gray-400 hover:text-white'}`}
                    >
                        Paste Text
                    </button>
                    <button
                        onClick={() => setInputType('file')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${inputType === 'file' ? 'border-b-2 border-purple-500 text-white' : 'border-b-2 border-transparent text-gray-400 hover:text-white'}`}
                    >
                        Upload File
                    </button>
                </div>

                {inputType === 'text' && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="document-input" className="block text-sm font-medium text-gray-300">
                                Document to Summarize
                            </label>
                            <button
                                onClick={handleGenerateSample}
                                disabled={isLoading || isGenerating}
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-purple-200 bg-purple-600/50 hover:bg-purple-600/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-gray-500/50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isGenerating ? (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <SparklesIcon className="h-4 w-4" />
                                )}
                                <span>{isGenerating ? 'Generating...' : 'Generate Sample'}</span>
                            </button>
                        </div>
                        <textarea
                            id="document-input"
                            value={documentText}
                            onChange={(e) => setDocumentText(e.target.value)}
                            className="w-full h-80 p-3 bg-[#0D0B14] border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out font-mono text-sm text-gray-300 placeholder-gray-500 disabled:opacity-50"
                            placeholder="Paste your long document, article, or report here..."
                            disabled={isLoading || isGenerating}
                        />
                         <div className="text-right text-xs text-gray-300 mt-1 pr-1">
                            {wordCount} {wordCount === 1 ? 'word' : 'words'}
                        </div>
                    </div>
                )}
                
                {inputType === 'file' && (
                    <div>
                        {!file ? (
                             <div
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-purple-500 bg-purple-900/20' : 'border-gray-600/80 hover:border-gray-500'}`}
                            >
                                <div className="text-center">
                                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-400">
                                        <label htmlFor="summary-file-upload" className="font-semibold text-purple-400 cursor-pointer hover:underline">Click to upload</label> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">Supports .md, .mdx, .txt, .doc, and .docx</p>
                                    <input type="file" accept=".md,.mdx,.txt,.doc,.docx" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} className="sr-only" id="summary-file-upload" disabled={isLoading}/>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#0D0B14] p-3 rounded-md border border-gray-600/80 flex items-center justify-between">
                                 <div className="flex items-center space-x-3 truncate">
                                    <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-300 truncate" title={file.name}>{file.name}</span>
                                </div>
                                <button onClick={removeFile} className="p-1 rounded-full hover:bg-gray-700 flex-shrink-0" aria-label={`Remove ${file.name}`} disabled={isLoading}>
                                    <XIcon className="w-4 h-4 text-gray-500 hover:text-white" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="flex justify-center pt-2">
                    <button
                        onClick={handleSummarizeClick}
                        disabled={isButtonDisabled}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <SparklesIcon className="mr-2 h-5 w-5" />
                        )}
                        <span>
                            {isLoading ? 'Summarizing...' : 'Summarize Document'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SummarizeView;
