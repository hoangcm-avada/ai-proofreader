import React, { useState } from 'react';
import { SparklesIcon, DocumentTextIcon } from './icons';

interface GoogleDocViewProps {
    onAnalyze: (url: string, dictionary: string, styleGuide: string) => void;
    isLoading: boolean;
}

const GoogleDocView: React.FC<GoogleDocViewProps> = ({ onAnalyze, isLoading }) => {
    const [url, setUrl] = useState('');
    const [customDictionary, setCustomDictionary] = useState('');
    const [styleGuideRules, setStyleGuideRules] = useState('');

    const handleAnalyzeClick = () => {
        onAnalyze(url, customDictionary, styleGuideRules);
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
                    <label htmlFor="gdoc-url-input" className="block text-sm font-medium text-gray-300 mb-2">
                        Public Google Doc URL
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="url"
                            id="gdoc-url-input"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full p-3 pl-10 bg-[#0D0B14] border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out font-sans text-sm text-gray-300 placeholder-gray-500 disabled:opacity-50"
                            placeholder="https://docs.google.com/document/d/..."
                            disabled={isLoading}
                        />
                    </div>
                     <p className="mt-2 text-xs text-gray-400">
                        Make sure your document's sharing setting is set to "Anyone with the link can view".
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label htmlFor="gdoc-custom-dictionary" className="block text-sm font-medium text-gray-300 mb-2">
                            Custom Dictionary <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="gdoc-custom-dictionary"
                            value={customDictionary}
                            onChange={(e) => setCustomDictionary(e.target.value)}
                            className="w-full h-24 sm:h-28 p-3 bg-[#0D0B14] border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition font-mono text-sm text-gray-300 placeholder-gray-500 disabled:opacity-50"
                            placeholder="Prevent the AI from flagging specific words. Enter one term per line. Good for brand names, acronyms, or technical terms (e.g., 'Avada', 'SaaS', 'front-end')."
                            disabled={isLoading}
                        />
                         <div className="text-right text-xs text-gray-300 mt-1 pr-1">
                           {dictionaryWordCount} {dictionaryWordCount === 1 ? 'word' : 'words'}
                        </div>
                    </div>
                    <div>
                         <label htmlFor="gdoc-style-guide" className="block text-sm font-medium text-gray-300 mb-2">
                            Style Guide Rules <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="gdoc-style-guide"
                            value={styleGuideRules}
                            onChange={(e) => setStyleGuideRules(e.target.value)}
                            className="w-full h-24 sm:h-28 p-3 bg-[#0D0B14] border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition font-mono text-sm text-gray-300 placeholder-gray-500 disabled:opacity-50"
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
                        onClick={handleAnalyzeClick}
                        disabled={isLoading || !url.trim()}
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
                            {isLoading ? 'Analyzing...' : 'Analyze Document'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoogleDocView;