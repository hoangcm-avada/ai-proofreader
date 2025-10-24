import React, { useState } from 'react';
import { SummaryResult } from '../types';
import { ArrowLeftIcon, ClipboardIcon, CheckIcon } from './icons';
import { ExportDropdown } from './ExportDropdown';

interface SummaryResultsViewProps {
    result: SummaryResult;
    onBack: () => void;
}

const SummaryResultsView: React.FC<SummaryResultsViewProps> = ({ result, onBack }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(result.summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = (format: 'txt' | 'md' | 'pdf') => {
        const safeTitle = result.title.replace(/\s+/g, '_').replace(/[^a-z0-9_.]/gi, '').toLowerCase();
        const baseFilename = safeTitle.replace(/\.(mdx?|txt|docx?)$/, '') || 'summary';
        const watermark = "\n\n---\n© 2025 Developed by MrLuke1618. All rights reserved.";
        const contentToExport = result.summary + watermark;

        if (format === 'pdf') {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<html><head><title>${result.title} (Summary)</title></head><body style="font-family: sans-serif; white-space: pre-wrap; word-wrap: break-word;"></body></html>`);
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
            link.download = `${baseFilename}_summary.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="bg-[#1C1827] border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-2xl shadow-purple-900/10 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.purple.700)]">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={onBack}
                    className="inline-flex items-center space-x-2 text-sm text-purple-400 hover:underline"
                >
                    <ArrowLeftIcon />
                    <span>Summarize Another Document</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                     <h3 className="font-semibold text-white">Original Document</h3>
                     <div className="bg-[#0D0B14] p-4 rounded-md border border-gray-600/80 h-64 sm:h-80 md:h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-400 font-sans">{result.originalText}</pre>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-white">AI-Powered Summary</h3>
                        <div className="flex items-center space-x-2">
                            <ExportDropdown onExport={handleExport} />
                            <button 
                                onClick={handleCopy}
                                className="inline-flex items-center justify-center px-3 h-9 border border-gray-600/80 text-xs font-medium rounded-md shadow-sm text-gray-300 bg-gray-700/40 hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-all"
                            >
                                {copied ? <CheckIcon className="mr-1.5 text-green-400" /> : <ClipboardIcon className="mr-1.5" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    <div className="bg-[#0D0B14] p-4 rounded-md border border-gray-600/80 h-64 sm:h-80 md:h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-300 font-sans">{result.summary}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryResultsView;