import React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircleIcon, SparklesIcon } from './icons';

interface BatchResultsSummaryProps {
    results: AnalysisResult[];
    onSelectPage: (pageId: string) => void;
    onReturnToAnalysis: () => void;
}

const BatchResultsSummary: React.FC<BatchResultsSummaryProps> = ({ results, onSelectPage, onReturnToAnalysis }) => {
    return (
        <div className="bg-[#1C1827] border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-2xl shadow-purple-900/10 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.purple.700)]">
            <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Batch Analysis Results</h2>
                    <p className="text-sm text-gray-400">
                        Found suggestions in {results.filter(r => r.suggestions.length > 0).length} of {results.length} pages.
                    </p>
                </div>
                <button
                    onClick={onReturnToAnalysis}
                    className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-600/80 text-xs font-medium rounded-md shadow-sm text-gray-300 bg-gray-700/40 hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-colors"
                >
                     <SparklesIcon className="mr-1.5 h-4 w-4" />
                    Analyze More Pages
                </button>
            </div>
            <div className="space-y-3">
                {results.map(result => (
                    <div key={result.page.id} className="bg-[#0D0B14] p-3 rounded-md border border-gray-700/60 flex justify-between items-center transition-colors hover:border-purple-700/80">
                        <p className="font-medium text-gray-300">{result.page.title}</p>
                        {result.suggestions.length > 0 ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-purple-400 font-semibold">
                                    {result.suggestions.length} suggestion{result.suggestions.length > 1 ? 's' : ''}
                                </span>
                                <button 
                                    onClick={() => onSelectPage(result.page.id)} 
                                    className="px-3 py-1 bg-purple-600 text-white rounded-md text-xs font-semibold hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
                                >
                                    Review
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 text-green-400/80">
                                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                <span className="text-sm font-medium">No issues found</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BatchResultsSummary;
