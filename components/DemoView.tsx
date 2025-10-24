import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { generateSampleText } from '../services/geminiService';

interface TextInputViewProps {
    markdownText: string;
    setMarkdownText: (text: string) => void;
    customDictionary: string;
    setCustomDictionary: (text: string) => void;
    styleGuideRules: string;
    setStyleGuideRules: (text: string) => void;
    onProofread: () => void;
    isLoading: boolean;
}

const TextInputView: React.FC<TextInputViewProps> = ({ 
    markdownText, setMarkdownText, 
    customDictionary, setCustomDictionary, 
    styleGuideRules, setStyleGuideRules, 
    onProofread, isLoading 
}) => {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateSample = async () => {
        setIsGenerating(true);
        try {
            const newText = await generateSampleText();
            setMarkdownText(newText);
        } catch (error) {
            alert("Could not generate sample text. Please try again.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const countWords = (text: string) => {
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const mainWordCount = countWords(markdownText);
    const dictionaryWordCount = countWords(customDictionary);
    const styleGuideWordCount = countWords(styleGuideRules);

    return (
        <div className="bg-[#1C1827] border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-2xl shadow-purple-900/10 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.purple.700)]">
            <div className="space-y-4">
                <div>
                     <div className="flex justify-between items-center mb-2">
                        <label htmlFor="markdown-input" className="block text-sm font-medium text-gray-300">
                            Text to Analyze
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
                        id="markdown-input"
                        value={markdownText}
                        onChange={(e) => setMarkdownText(e.target.value)}
                        className="w-full h-40 sm:h-64 p-3 bg-[#0D0B14] border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out font-mono text-sm text-gray-300 placeholder-gray-500 disabled:opacity-50"
                        placeholder="Enter your Markdown content here..."
                        disabled={isLoading || isGenerating}
                    />
                    <div className="text-right text-xs text-gray-300 mt-1 pr-1">
                        {mainWordCount} {mainWordCount === 1 ? 'word' : 'words'}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label htmlFor="custom-dictionary" className="block text-sm font-medium text-gray-300 mb-2">
                            Custom Dictionary <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="custom-dictionary"
                            value={customDictionary}
                            onChange={(e) => setCustomDictionary(e.target.value)}
                            className="w-full h-28 p-3 bg-[#0D0B14] border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition font-mono text-sm text-gray-300 placeholder-gray-500 disabled:opacity-50"
                            placeholder="Prevent the AI from flagging specific words. Enter one term per line. Good for brand names, acronyms, or technical terms (e.g., 'Avada', 'SaaS', 'front-end')."
                            disabled={isLoading}
                        />
                        <div className="text-right text-xs text-gray-300 mt-1 pr-1">
                           {dictionaryWordCount} {dictionaryWordCount === 1 ? 'word' : 'words'}
                        </div>
                    </div>
                    <div>
                         <label htmlFor="style-guide" className="block text-sm font-medium text-gray-300 mb-2">
                            Style Guide Rules <span className="text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="style-guide"
                            value={styleGuideRules}
                            onChange={(e) => setStyleGuideRules(e.target.value)}
                            className="w-full h-28 p-3 bg-[#0D0B14] border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition font-mono text-sm text-gray-300 placeholder-gray-500 disabled:opacity-50"
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
                        onClick={onProofread}
                        disabled={isLoading || !markdownText.trim()}
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

export default TextInputView;