import React, { useMemo, useState } from 'react';
import { Suggestion } from '../types';
import ErrorCard from './ErrorCard';
import { ArrowPathIcon, CheckIcon, ClipboardIcon, CloudArrowUpIcon, ArrowLeftIcon } from './icons';
import { ExportDropdown } from './ExportDropdown';

interface ProofreadingResultsProps {
    suggestions: Suggestion[];
    originalText: string;
    onUpdateSuggestion: (id: number, status: Suggestion['status']) => void;
    onAcceptAll: () => void;
    onReset: () => void;
    onPushToGitBook?: () => void;
    isGitBookMode?: boolean;
    pageTitle: string;
    onBackToSummary?: () => void;
}

const FinalTextView: React.FC<{ originalText: string; suggestions: Suggestion[]; finalText: string; }> = ({ originalText, suggestions, finalText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(finalText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const correctedTextWithHighlights = useMemo(() => {
        let textParts: (string | React.ReactNode)[] = [originalText];
        const acceptedSuggestions = suggestions.filter(s => s.status === 'accepted');

        acceptedSuggestions.forEach((suggestion, i) => {
            const newParts: (string | React.ReactNode)[] = [];
            textParts.forEach(part => {
                if (typeof part === 'string' && typeof suggestion.original === 'string' && suggestion.original) {
                    const splitParts = part.split(suggestion.original);
                    for (let j = 0; j < splitParts.length; j++) {
                        newParts.push(splitParts[j]);
                        if (j < splitParts.length - 1) {
                            newParts.push(
                                <span key={`${i}-${j}`} className="text-green-400 bg-green-900/30 rounded px-0.5">
                                    {suggestion.correction}
                                </span>
                            );
                        }
                    }
                } else {
                    newParts.push(part);
                }
            });
            textParts = newParts;
        });

        return <>{textParts}</>;
    }, [originalText, suggestions]);

    const originalTextWithHighlights = useMemo(() => {
        let textParts: (string | React.ReactNode)[] = [originalText];
        const uniqueOriginals = [...new Set(suggestions.map(s => s.original))];

        uniqueOriginals.forEach((originalPhrase, i) => {
            if (typeof originalPhrase !== 'string' || !originalPhrase) return;
            const newParts: (string | React.ReactNode)[] = [];
            textParts.forEach(part => {
                if (typeof part === 'string') {
                    const splitParts = part.split(originalPhrase);
                    for (let j = 0; j < splitParts.length; j++) {
                        newParts.push(splitParts[j]);
                        if (j < splitParts.length - 1) {
                            newParts.push(
                                <span key={`${i}-${j}`} className="text-red-400 bg-red-900/30 rounded px-0.5">
                                    {originalPhrase}
                                </span>
                            );
                        }
                    }
                } else {
                    newParts.push(part);
                }
            });
            textParts = newParts;
        });

        return <>{textParts}</>;
    }, [originalText, suggestions]);


    return (
        <div className="bg-[#1C1827] border border-gray-700/50 rounded-xl relative h-full shadow-lg shadow-purple-900/10 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.purple.700)] flex flex-col">
            <div className="p-4 border-b border-gray-700/50 flex justify-between items-center flex-shrink-0">
                <h3 className="font-semibold text-white">Corrected Document</h3>
                <button 
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-600/80 text-xs font-medium rounded-md shadow-sm text-gray-300 bg-gray-700/40 hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-all"
                >
                    {copied ? <CheckIcon className="mr-1.5 text-green-400" /> : <ClipboardIcon className="mr-1.5" />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
            </div>
             <div className="grid grid-rows-2 h-full overflow-hidden">
                <div className="row-span-1 border-b border-gray-700/50 flex flex-col overflow-hidden">
                     <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider p-3 pb-2 flex-shrink-0">Original</h4>
                     <pre className="p-3 pr-4 pt-0 w-full h-full overflow-auto whitespace-pre-wrap break-words font-mono text-sm text-gray-400">
                        {originalTextWithHighlights}
                    </pre>
                </div>
                <div className="row-span-1 flex flex-col overflow-hidden">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider p-3 pb-2 flex-shrink-0">With Corrections Applied</h4>
                    <pre className="p-3 pr-4 pt-0 w-full h-full overflow-auto whitespace-pre-wrap break-words font-mono text-sm text-gray-300">
                        {correctedTextWithHighlights}
                    </pre>
                </div>
            </div>
        </div>
    );
};


const ProofreadingResults: React.FC<ProofreadingResultsProps> = ({ suggestions, originalText, onUpdateSuggestion, onAcceptAll, onReset, onPushToGitBook, isGitBookMode, pageTitle, onBackToSummary }) => {
    
    const finalText = useMemo(() => {
        let tempText = originalText;
        const acceptedSuggestions = suggestions.filter(s => s.status === 'accepted');
        
        acceptedSuggestions.forEach(suggestion => {
            if (typeof suggestion.original === 'string' && suggestion.original) {
                tempText = tempText.split(suggestion.original).join(suggestion.correction);
            }
        });

        return tempText;
    }, [originalText, suggestions]);

    const handleExport = (format: 'txt' | 'md' | 'pdf') => {
        const safeTitle = pageTitle.replace(/\s+/g, '_').replace(/[^a-z0-9_.]/gi, '').toLowerCase();
        const baseFilename = safeTitle.replace(/\.mdx?$/, '') || 'document';
        const watermark = "\n\n---\n© 2025 Developed by MrLuke1618. All rights reserved.";
        const contentToExport = finalText + watermark;

        if (format === 'pdf') {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<html><head><title>${pageTitle}</title></head><body style="font-family: sans-serif; white-space: pre-wrap; word-wrap: break-word;"></body></html>`);
                printWindow.document.body.textContent = contentToExport;
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        } else {
            const blob = new Blob([contentToExport], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${baseFilename}_corrected.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const pendingCount = suggestions.filter(s => s.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="bg-[#1C1827] border border-gray-700/50 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-lg shadow-purple-900/10 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.purple.700)]">
                <div className="flex items-center gap-3 sm:gap-4">
                     {onBackToSummary && (
                        <button
                            onClick={onBackToSummary}
                            className="inline-flex items-center justify-center p-2 border border-gray-600/80 text-xs font-medium rounded-md shadow-sm text-gray-300 bg-gray-800/60 hover:bg-gray-700/80 transition-colors"
                            aria-label="Back to summary"
                        >
                            <ArrowLeftIcon />
                        </button>
                     )}
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md" title={pageTitle}>
                            {onBackToSummary ? `Reviewing: ${pageTitle}` : 'Review Suggestions'}
                        </h2>
                        <p className="text-sm text-gray-400">{suggestions.length} suggestions found. {pendingCount} pending review.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 flex-wrap gap-2 justify-end">
                     <ExportDropdown onExport={handleExport} />
                     {isGitBookMode && onPushToGitBook && (
                        <button
                            onClick={onPushToGitBook}
                            className="inline-flex items-center justify-center px-3 h-9 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-colors"
                        >
                            <CloudArrowUpIcon className="mr-1.5 h-4 w-4" />
                            Push to GitBook
                        </button>
                     )}
                     <button
                        onClick={onReset}
                        className="inline-flex items-center justify-center px-3 h-9 border border-gray-600/80 text-xs font-medium rounded-md shadow-sm text-gray-300 bg-gray-700/40 hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-colors"
                    >
                        <ArrowPathIcon className="mr-1.5" />
                        Reset
                    </button>
                    <button
                        onClick={onAcceptAll}
                        disabled={pendingCount === 0}
                        className="inline-flex items-center justify-center px-3 h-9 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                         <CheckIcon className="mr-1.5" />
                        <span className="whitespace-nowrap">Accept All</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4 max-h-[400px] sm:max-h-[500px] lg:max-h-[calc(100vh-240px)] overflow-y-auto pr-2 -mr-2">
                     {suggestions.map((suggestion) => (
                        <ErrorCard key={suggestion.id} suggestion={suggestion} onUpdateStatus={onUpdateSuggestion} />
                    ))}
                </div>
                <div className="h-[400px] sm:h-[500px] lg:h-auto min-h-[400px]">
                   <FinalTextView originalText={originalText} suggestions={suggestions} finalText={finalText} />
                </div>
            </div>
        </div>
    );
};

export default ProofreadingResults;