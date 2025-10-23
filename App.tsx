import React, { useState, useCallback, useEffect } from 'react';
import { Suggestion, GitBookPage, AnalysisResult, SummaryResult } from './types';
import { proofreadText, summarizeText, initializeGemini } from './services/geminiService';
import { getPageContent } from './services/gitbookService';
import { getGoogleDocContent } from './services/googleDocService';

import { DEMO_MARKDOWN_TEXT, DEFAULT_API_KEY } from './constants';
import { KeyIcon, BookOpenIcon, CheckCircleIcon, ExclamationTriangleIcon, PencilSquareIcon, CloudArrowUpIcon, QuestionMarkCircleIcon, DocumentTextIcon, ListBulletIcon } from './components/icons';
import Loader from './components/Loader';
import ProofreadingResults from './components/ProofreadingResults';
import TextInputView from './components/DemoView';
import GitBookView from './components/GitBookView';
import FileUploadView from './components/FileUploadView';
import GoogleDocView from './components/GoogleDocView';
import HelpModal from './components/HelpModal';
import BatchResultsSummary from './components/BatchResultsSummary';
import SummarizeView from './components/SummarizeView';
import SummaryResultsView from './components/SummaryResultsView';
import ApiKeyInput from './components/ApiKeyInput';

type AppMode = 'text' | 'file' | 'gitbook' | 'googledoc' | 'summarize';
type PageStatus = 'errors' | 'no_issues';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [mode, setMode] = useState<AppMode>('text');
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    
    // State for Proofreading
    const [markdownText, setMarkdownText] = useState<string>(DEMO_MARKDOWN_TEXT);
    const [customDictionary, setCustomDictionary] = useState<string>('');
    const [styleGuideRules, setStyleGuideRules] = useState<string>('');
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[] | null>(null);

    // State for Summarization
    const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
    
    // Common state
    const [pageStatuses, setPageStatuses] = useState<Record<string, PageStatus>>({});
    const [viewingPageId, setViewingPageId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        let keyToUse = localStorage.getItem('geminiApiKey');

        if (!keyToUse) {
            keyToUse = DEFAULT_API_KEY;
            localStorage.setItem('geminiApiKey', keyToUse);
        }

        if (keyToUse) {
            try {
                initializeGemini(keyToUse);
                setApiKey(keyToUse);
            } catch (error) {
                 console.error("Failed to initialize with API key:", error);
                 localStorage.removeItem('geminiApiKey');
                 setApiKey(null);
            }
        }
    }, []);

    const handleSetKey = (key: string) => {
        try {
            initializeGemini(key);
            localStorage.setItem('geminiApiKey', key);
            setApiKey(key);
            setApiError(null);
        } catch (error) {
            console.error("Failed to initialize with provided API key:", error);
            setApiError("The provided API key appears to be invalid.");
        }
    };

    const handleClearKey = () => {
        localStorage.removeItem('geminiApiKey');
        setApiKey(null);
    };

    // Reset state when switching modes
    useEffect(() => {
        setAnalysisResults(null);
        setSummaryResult(null);
        setPageStatuses({});
        setViewingPageId(null);
        setApiError(null);
    }, [mode]);

    const handleProofread = useCallback(async () => {
        if (!markdownText.trim()) {
            setApiError("Input text cannot be empty.");
            setAnalysisResults(null);
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Analyzing document with Gemini...');
        setApiError(null);
        setAnalysisResults(null);
        
        const demoPage: GitBookPage = { id: 'text_input_page', title: 'Text Input', spaceId: '', spaceTitle: '' };

        try {
            const proofreadResults = await proofreadText(markdownText, customDictionary, styleGuideRules);
            const suggestions = proofreadResults.map((res, index) => ({
                ...res,
                id: index,
                status: 'pending' as Suggestion['status'],
            }));
            setAnalysisResults([{
                page: demoPage,
                suggestions,
                originalText: markdownText,
            }]);
            setViewingPageId(demoPage.id);
        } catch (error) {
            if (error instanceof Error) setApiError(error.message);
            else setApiError("An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [markdownText, customDictionary, styleGuideRules]);

    const handleSummarize = useCallback(async ({ text, file }: { text?: string; file?: File }) => {
        setIsLoading(true);
        setLoadingMessage('Preparing document...');
        setApiError(null);
        setSummaryResult(null);

        try {
            let contentToSummarize = '';
            let title = 'Pasted Text Summary';

            if (file) {
                title = file.name;
                const readFileContent = (fileToRead: File): Promise<string> =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsText(fileToRead);
                    });
                contentToSummarize = await readFileContent(file);
            } else {
                contentToSummarize = text || '';
            }

            if (!contentToSummarize.trim()) {
                setApiError("Input document cannot be empty.");
                setIsLoading(false);
                return;
            }

            setLoadingMessage('Generating summary with Gemini...');
            const summary = await summarizeText(contentToSummarize);
            setSummaryResult({
                title,
                originalText: contentToSummarize,
                summary,
            });

        } catch (error) {
            if (error instanceof Error) setApiError(error.message);
            else setApiError("An unknown error occurred while summarizing.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const processBatch = async (
        items: (GitBookPage | File)[],
        dictionary: string,
        styleGuide: string,
        getContent: (item: GitBookPage | File) => Promise<{ id: string, title: string, spaceTitle?: string, content: string }>
    ) => {
        setIsLoading(true);
        setApiError(null);
        setAnalysisResults(null);
        setViewingPageId(null);

        try {
            const results: AnalysisResult[] = [];
            let i = 0;
            for (const item of items) {
                i++;
                const itemName = ('name' in item) ? item.name : item.title;
                try {
                    setLoadingMessage(`[${i}/${items.length}] Fetching content for "${itemName}"...`);
                    const { id, title, spaceTitle, content } = await getContent(item);
                    if (content) {
                        setLoadingMessage(`[${i}/${items.length}] Analyzing "${title}" with Gemini...`);
                        const proofreadResults = await proofreadText(content, dictionary, styleGuide);
                        results.push({
                            page: { id, title, spaceId: (item as GitBookPage).spaceId || '', spaceTitle: spaceTitle || '' },
                            originalText: content,
                            suggestions: proofreadResults.map((res, index) => ({ ...res, id: index, status: 'pending' })),
                        });
                    }
                } catch (readError) {
                     console.error(`Could not process item ${itemName}:`, readError);
                     results.push({
                         page: { 
                             id: ('name' in item) ? item.name : item.id, 
                             title: itemName, 
                             spaceId: (item as GitBookPage).spaceId || '',
                             spaceTitle: (item as GitBookPage).spaceTitle || '',
                            },
                         originalText: `Error: Could not retrieve content. ${readError instanceof Error ? readError.message : 'Unknown error'}.`,
                         suggestions: [],
                     });
                }
            }

            const itemOrder = items.map(p => ('name' in p ? p.name : p.id));
            results.sort((a, b) => itemOrder.indexOf(a.page.id) - itemOrder.indexOf(b.page.id));

            setAnalysisResults(results);
            setPageStatuses(prev => {
                const newStatuses = { ...prev };
                results.forEach(result => {
                    newStatuses[result.page.id] = result.suggestions.length > 0 ? 'errors' : 'no_issues';
                });
                return newStatuses;
            });

        } catch (error) {
            if (error instanceof Error) setApiError(error.message);
            else setApiError("An unknown error occurred during analysis.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnalyzePages = useCallback(async (apiKey: string, pages: GitBookPage[], dictionary: string, styleGuide: string) => {
        await processBatch(pages, dictionary, styleGuide, async (page) => {
            const gitbookPage = page as GitBookPage;
            const content = await getPageContent(apiKey, gitbookPage.spaceId, gitbookPage.id);
            return { id: gitbookPage.id, title: gitbookPage.title, spaceTitle: gitbookPage.spaceTitle, content };
        });
    }, []);

    const handleAnalyzeFiles = useCallback(async (files: File[], dictionary: string, styleGuide: string) => {
        const readFileContent = (file: File): Promise<string> =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        
        await processBatch(files, dictionary, styleGuide, async (file) => {
            const content = await readFileContent(file as File);
            return { id: (file as File).name, title: (file as File).name, content };
        });
    }, []);

    const handleAnalyzeGoogleDoc = useCallback(async (url: string, dictionary: string, styleGuide: string) => {
        if (!url.trim()) {
            setApiError("Google Doc URL cannot be empty.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Fetching content from Google Doc...');
        setApiError(null);
        setAnalysisResults(null);

        try {
            const { title, content } = await getGoogleDocContent(url);
            setLoadingMessage('Analyzing document with Gemini...');
            const proofreadResults = await proofreadText(content, dictionary, styleGuide);
            const suggestions = proofreadResults.map((res, index) => ({
                ...res,
                id: index,
                status: 'pending' as Suggestion['status'],
            }));
             const docPage: GitBookPage = { id: 'google_doc_page', title: title, spaceId: '', spaceTitle: '' };
            setAnalysisResults([{
                page: docPage,
                suggestions,
                originalText: content,
            }]);
            setViewingPageId(docPage.id);
        } catch (error) {
             if (error instanceof Error) setApiError(error.message);
            else setApiError("An unknown error occurred while processing the Google Doc.");
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleUpdateSuggestion = useCallback((id: number, status: Suggestion['status']) => {
        setAnalysisResults(currentResults => {
            if (!currentResults || !viewingPageId) return currentResults;
            return currentResults.map(result => {
                if (result.page.id === viewingPageId) {
                    const updatedSuggestions = result.suggestions.map(s => s.id === id ? { ...s, status } : s);
                    return { ...result, suggestions: updatedSuggestions };
                }
                return result;
            });
        });
    }, [viewingPageId]);

    const handleBulkUpdate = useCallback((status: Suggestion['status']) => {
       setAnalysisResults(currentResults => {
            if (!currentResults || !viewingPageId) return currentResults;
            return currentResults.map(result => {
                if (result.page.id === viewingPageId) {
                    const updatedSuggestions = result.suggestions.map(s => s.status === 'pending' ? { ...s, status } : s);
                    return { ...result, suggestions: updatedSuggestions };
                }
                return result;
            });
        });
    }, [viewingPageId]);

    const handleReset = useCallback(() => {
        setAnalysisResults(currentResults => {
            if (!currentResults || !viewingPageId) return currentResults;
            return currentResults.map(result => {
                if (result.page.id === viewingPageId) {
                    const updatedSuggestions = result.suggestions.map(s => ({ ...s, status: 'pending' as Suggestion['status'] }));
                    return { ...result, suggestions: updatedSuggestions };
                }
                return result;
            });
        });
    }, [viewingPageId]);
    
    const handleBackToSummary = useCallback(() => {
        setViewingPageId(null);
    }, []);

    const handleReturnToSetupView = useCallback(() => {
        setAnalysisResults(null);
        setViewingPageId(null);
    }, []);

    const handlePushToGitBook = useCallback(() => {
        alert(`This would update the page with ID: ${viewingPageId} in GitBook.`);
    }, [viewingPageId]);

    const renderContent = () => {
        if (isLoading) return <Loader message={loadingMessage} />;
        if (apiError) {
            return (
                <div className="text-center p-8 bg-[#1C1827] border border-red-500/30 rounded-xl shadow-lg shadow-red-900/20 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.red.700)]">
                    <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto" />
                    <h3 className="mt-4 text-lg font-semibold text-white">An Error Occurred</h3>
                    <p className="text-red-400 mt-1 max-w-md mx-auto">{apiError}</p>
                </div>
            );
        }
        
        if (summaryResult) {
            return <SummaryResultsView result={summaryResult} onBack={() => setSummaryResult(null)} />;
        }

        if (analysisResults) {
            const viewingResult = analysisResults.find(r => r.page.id === viewingPageId);
            if (viewingResult) {
                 if (viewingResult.originalText.startsWith('Error: Could not retrieve content')) {
                     return (
                         <div className="text-center p-8 bg-[#1C1827] border border-red-500/30 rounded-xl shadow-lg shadow-red-900/20 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.red.700)]">
                            <button onClick={handleBackToSummary} className="text-sm text-purple-400 hover:underline mb-4">
                                &larr; Back to Summary
                            </button>
                            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto" />
                            <h3 className="mt-4 text-lg font-semibold text-white">Content Error</h3>
                            <p className="text-red-400 mt-1 max-w-md mx-auto">Could not process "{viewingResult.page.title}". The API reported: "{viewingResult.originalText.replace('Error: Could not retrieve content. ', '')}"</p>
                        </div>
                    );
                 }
                 if (viewingResult.suggestions.length === 0) {
                     return (
                        <div className="text-center p-8 bg-[#1C1827] border border-green-500/30 rounded-xl shadow-lg shadow-green-900/20 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.green.700)]">
                            {mode !== 'text' && (
                                <button onClick={handleBackToSummary} className="text-sm text-purple-400 hover:underline mb-4">
                                    &larr; Back to Summary
                                </button>
                            )}
                            <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto" />
                            <h3 className="mt-4 text-lg font-semibold text-white">Looks Good!</h3>
                            <p className="text-gray-400 mt-1">No errors found in "{viewingResult.page.title}".</p>
                        </div>
                    );
                }
                return (
                    <ProofreadingResults 
                        pageTitle={viewingResult.page.title}
                        suggestions={viewingResult.suggestions}
                        originalText={viewingResult.originalText}
                        onUpdateSuggestion={handleUpdateSuggestion}
                        onAcceptAll={() => handleBulkUpdate('accepted')}
                        onReset={handleReset}
                        onPushToGitBook={handlePushToGitBook}
                        isGitBookMode={mode === 'gitbook'}
                        onBackToSummary={mode !== 'text' ? handleBackToSummary : undefined}
                    />
                );
            }
             return <BatchResultsSummary results={analysisResults} onSelectPage={setViewingPageId} onReturnToAnalysis={handleReturnToSetupView} />;
        }
        return null;
    };

    if (!apiKey) {
        return <ApiKeyInput onSetKey={handleSetKey} apiError={apiError} />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4">
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
            <header className="text-center my-6 md:my-8 w-full max-w-7xl">
                <div className="relative flex justify-center items-center">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                        <button onClick={handleClearKey} className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-800/60" aria-label="Change API Key">
                            <KeyIcon className="w-5 h-5" />
                            <span className="text-sm font-medium hidden sm:inline">Change Key</span>
                        </button>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
                        Doc QA Assistant
                    </h1>
                    <button onClick={() => setIsHelpModalOpen(true)} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-800/60" aria-label="Help">
                        <QuestionMarkCircleIcon className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">Help</span>
                    </button>
                </div>
                <p className="mt-3 max-w-2xl mx-auto text-base text-gray-400">
                    Your AI partner for pristine, professional, and polished technical documentation.
                </p>
            </header>

            <main className="w-full max-w-7xl flex-grow">
                 <div className="mb-6">
                    <div className="flex justify-center border-b border-gray-700/50">
                        <button onClick={() => setMode('text')} className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors ${mode === 'text' ? 'border-b-2 border-purple-500 text-white' : 'border-b-2 border-transparent text-gray-400 hover:text-white'}`}>
                           <PencilSquareIcon className="w-5 h-5"/>
                           <span>Proofread Text</span>
                        </button>
                         <button onClick={() => setMode('file')} className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors ${mode === 'file' ? 'border-b-2 border-purple-500 text-white' : 'border-b-2 border-transparent text-gray-400 hover:text-white'}`}>
                           <CloudArrowUpIcon className="w-5 h-5"/>
                           <span>Proofread Files</span>
                        </button>
                        <button onClick={() => setMode('googledoc')} className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors ${mode === 'googledoc' ? 'border-b-2 border-purple-500 text-white' : 'border-b-2 border-transparent text-gray-400 hover:text-white'}`}>
                            <DocumentTextIcon className="w-5 h-5" />
                           <span>Proofread Google Doc</span>
                        </button>
                        <button onClick={() => setMode('gitbook')} className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors ${mode === 'gitbook' ? 'border-b-2 border-purple-500 text-white' : 'border-b-2 border-transparent text-gray-400 hover:text-white'}`}>
                            <BookOpenIcon className="w-5 h-5" />
                           <span>Proofread GitBook</span>
                        </button>
                        <button onClick={() => setMode('summarize')} className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors ${mode === 'summarize' ? 'border-b-2 border-purple-500 text-white' : 'border-b-2 border-transparent text-gray-400 hover:text-white'}`}>
                            <ListBulletIcon className="w-5 h-5" />
                           <span>Summarize Document</span>
                        </button>
                    </div>
                 </div>

                {mode === 'text' && !analysisResults && (
                    <TextInputView
                        markdownText={markdownText} 
                        setMarkdownText={setMarkdownText} 
                        customDictionary={customDictionary}
                        setCustomDictionary={setCustomDictionary}
                        styleGuideRules={styleGuideRules}
                        setStyleGuideRules={setStyleGuideRules}
                        onProofread={handleProofread} 
                        isLoading={isLoading} 
                    />
                )}

                {mode === 'file' && !analysisResults && (
                    <FileUploadView onAnalyzeFiles={handleAnalyzeFiles} isLoading={isLoading} />
                )}

                {mode === 'googledoc' && !analysisResults && (
                    <GoogleDocView onAnalyze={handleAnalyzeGoogleDoc} isLoading={isLoading} />
                )}

                {mode === 'gitbook' && !analysisResults && (
                    <GitBookView
                        onAnalyzePages={handleAnalyzePages}
                        pageStatuses={pageStatuses}
                        onSwitchToTextMode={() => setMode('text')}
                    />
                )}
                
                {mode === 'summarize' && !summaryResult && (
                    <SummarizeView onSummarize={handleSummarize} isLoading={isLoading} />
                )}

                <div className="mt-8">
                   {renderContent()}
                </div>
            </main>
            
            <footer className="text-center py-6 text-gray-500 text-sm mt-auto">
                <p>© 2025 Developed by MrLuke1618. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default App;