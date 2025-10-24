import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SparklesIcon, KeyIcon, FolderOpenIcon, DocumentTextIcon, CheckCircleIcon, InformationCircleIcon, ArrowRightIcon } from './icons';
import { GitBookSpace, GitBookPage, GitBookOrganization } from '../types';
import { connectAndFetchContent, listPages } from '../services/gitbookService';

interface GitBookViewProps {
    onAnalyzePages: (apiKey: string, pages: GitBookPage[], dictionary: string, styleGuide: string) => void;
    pageStatuses: Record<string, 'errors' | 'no_issues'>;
    onSwitchToTextMode: () => void;
}

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

const GitBookView: React.FC<GitBookViewProps> = ({ onAnalyzePages, pageStatuses, onSwitchToTextMode }) => {
    const [apiKey, setApiKey] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [planError, setPlanError] = useState(false);

    const [organizations, setOrganizations] = useState<GitBookOrganization[]>([]);
    const [spacesByOrgId, setSpacesByOrgId] = useState<Record<string, GitBookSpace[]>>({});
    const [pagesBySpaceId, setPagesBySpaceId] = useState<Record<string, GitBookPage[]>>({});

    const [loadingNode, setLoadingNode] = useState<string | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());

    const [customDictionary, setCustomDictionary] = useState('');
    const [styleGuideRules, setStyleGuideRules] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    const hasAttemptedAutoConnect = useRef(false);

    const handleConnectAttempt = useCallback(async (key: string) => {
        if (!key) return;
        setIsConnecting(true);
        setApiError(null);
        setPlanError(false);
        try {
            const { organizations, spacesByOrgId } = await connectAndFetchContent(key);
            setOrganizations(organizations);
            setSpacesByOrgId(spacesByOrgId);
            setIsConnected(true);
            setApiKey(key); // Sync state with the key that worked
            localStorage.setItem('gitbookApiKey', key);
            if (organizations.length === 1) {
                setExpandedNodes(new Set([organizations[0].id]));
            }
        } catch (error) {
            localStorage.removeItem('gitbookApiKey');
            setApiKey('');
            setIsConnected(false);

            if (error instanceof Error && error.message.includes("[GITBOOK_SCOPE_ERROR]")) {
                setPlanError(true);
            } else {
                 if (error instanceof Error) setApiError(error.message);
                 else setApiError('An unknown error occurred during connection.');
            }
        } finally {
            setIsConnecting(false);
        }
    }, []);

    // Effect for auto-connecting on initial load
    useEffect(() => {
        if (hasAttemptedAutoConnect.current) return;
        const savedKey = localStorage.getItem('gitbookApiKey');
        if (savedKey) {
            hasAttemptedAutoConnect.current = true;
            handleConnectAttempt(savedKey);
        }
    }, [handleConnectAttempt]);


    const handleDisconnect = () => {
        localStorage.removeItem('gitbookApiKey');
        setApiKey('');
        setIsConnected(false);
        setOrganizations([]);
        setSpacesByOrgId({});
        setPagesBySpaceId({});
        setExpandedNodes(new Set());
        setSelectedPageIds(new Set());
        setApiError(null);
        setPlanError(false);
    };

    const handleToggleNode = async (id: string, type: 'org' | 'space', space?: GitBookSpace) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
            if (type === 'space' && space && !pagesBySpaceId[id]) {
                setLoadingNode(id);
                try {
                    // Use the connected API key from state for subsequent requests
                    const connectedKey = localStorage.getItem('gitbookApiKey');
                    if (!connectedKey) throw new Error("API Key not found.");
                    const fetchedPages = await listPages(connectedKey, space);
                    setPagesBySpaceId(prev => ({ ...prev, [id]: fetchedPages }));
                } catch (error) {
                    if (error instanceof Error) setApiError(error.message);
                    else setApiError('An unknown error occurred while fetching pages.');
                } finally {
                    setLoadingNode(null);
                }
            }
        }
        setExpandedNodes(newExpanded);
    };

    const handleSelectionChange = (id: string, type: 'page' | 'space') => {
        const newSelected = new Set(selectedPageIds);
        if (type === 'page') {
            newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
        } else if (type === 'space') {
            const pageIdsInSpace = pagesBySpaceId[id]?.map((p: GitBookPage) => p.id) || [];
            const areAllSelected = pageIdsInSpace.every(pId => newSelected.has(pId));
            if (areAllSelected) {
                pageIdsInSpace.forEach(pId => newSelected.delete(pId));
            } else {
                pageIdsInSpace.forEach(pId => newSelected.add(pId));
            }
        }
        setSelectedPageIds(newSelected);
    };
    
    const selectedPages = useMemo(() => {
        const allPages = Object.values(pagesBySpaceId).flat();
        return allPages.filter((p: GitBookPage) => selectedPageIds.has(p.id));
    }, [selectedPageIds, pagesBySpaceId]);

    const handleAnalyze = () => {
        const connectedKey = localStorage.getItem('gitbookApiKey');
        if (!connectedKey) {
            setApiError("Cannot analyze, API key is missing. Please reconnect.");
            return;
        }
        onAnalyzePages(connectedKey, selectedPages, customDictionary, styleGuideRules);
    };
    
    const countWords = (text: string) => {
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const dictionaryWordCount = countWords(customDictionary);
    const styleGuideWordCount = countWords(styleGuideRules);

    if (planError) {
        return (
            <div className="bg-[#1C1827] border border-yellow-500/30 rounded-xl p-6 text-center shadow-lg shadow-yellow-900/20">
                <InformationCircleIcon className="w-12 h-12 text-yellow-400 mx-auto" />
                <h3 className="mt-4 text-lg font-semibold text-white">GitBook Free Plan Limitation</h3>
                <p className="text-yellow-300/90 mt-2 max-w-lg mx-auto text-sm">
                    It looks like your GitBook organization is on the <strong>Free plan</strong>. The GitBook API for this plan doesn't grant the necessary permissions for this app to automatically fetch your pages.
                </p>
                <p className="text-gray-400 mt-4 max-w-lg mx-auto text-sm">
                    No problem! You can still easily check your documents by copying the content from GitBook and pasting it directly into our text proofreader.
                </p>
                <div className="mt-6">
                    <button 
                        onClick={onSwitchToTextMode}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
                    >
                        Switch to Text Proofreader
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1C1827] border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-2xl shadow-purple-900/10 transition-shadow duration-300 hover:shadow-[0_0_20px_theme(colors.purple.700)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column 1: Configuration */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-white text-lg border-b border-gray-700 pb-2">1. Configuration</h3>
                    <div>
                        <label htmlFor="gitbook-api-key" className="text-sm font-medium text-gray-300 block mb-2">GitBook API Key</label>
                        <div className="flex space-x-2">
                             <input
                                id="gitbook-api-key" type="password"
                                className="w-full p-2 bg-[#0D0B14] border border-gray-600 rounded-md font-mono text-sm disabled:opacity-50"
                                value={apiKey} onChange={e => setApiKey(e.target.value)}
                                disabled={isConnected || isConnecting} placeholder="Enter your token..."
                            />
                            {!isConnected ? (
                                <button onClick={() => handleConnectAttempt(apiKey)} disabled={!apiKey || isConnecting} className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm font-semibold hover:bg-purple-700 disabled:bg-gray-500">
                                    {isConnecting ? '...' : 'Connect'}
                                </button>
                            ) : (
                                <button onClick={handleDisconnect} className="px-3 py-1.5 bg-gray-600 text-white rounded-md text-sm font-semibold hover:bg-gray-500">
                                    Disconnect
                                </button>
                            )}
                        </div>
                        {apiError && (
                             <div className="mt-2 p-3 bg-red-900/30 border border-red-500/50 rounded-md text-sm text-red-300">
                                <p className="font-semibold mb-1">Connection Failed</p>
                                <p className="text-xs mb-2 whitespace-pre-line">{apiError}</p>
                                <a href="https://docs.gitbook.com/account-management/developing-with-gitbook/personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold underline hover:text-white">
                                    Learn about GitBook API Tokens &rarr;
                                </a>
                            </div>
                        )}
                    </div>
                     <div className="pt-2">
                        <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-medium text-purple-400 hover:underline">
                            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                        </button>
                        {showAdvanced && (
                            <div className="mt-2 space-y-3">
                                <div>
                                    <label htmlFor="gb-custom-dictionary" className="block text-sm font-medium text-gray-300 mb-2">Custom Dictionary</label>
                                    <textarea id="gb-custom-dictionary" value={customDictionary} onChange={(e) => setCustomDictionary(e.target.value)} rows={4} className="w-full p-2 bg-[#0D0B14] border border-gray-600 rounded-md font-mono text-sm" placeholder="e.g., Avada, SaaS" />
                                    <div className="text-right text-xs text-gray-300 mt-1 pr-1">
                                        {dictionaryWordCount} {dictionaryWordCount === 1 ? 'word' : 'words'}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="gb-style-guide" className="block text-sm font-medium text-gray-300 mb-2">Style Guide Rules</label>
                                    <textarea id="gb-style-guide" value={styleGuideRules} onChange={(e) => setStyleGuideRules(e.target.value)} rows={4} className="w-full p-2 bg-[#0D0B14] border border-gray-600 rounded-md font-mono text-sm" placeholder="e.g., Use 'customer' not 'user'" />
                                    <div className="text-right text-xs text-gray-300 mt-1 pr-1">
                                        {styleGuideWordCount} {styleGuideWordCount === 1 ? 'word' : 'words'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Content Selection */}
                <div className="lg:col-span-1 space-y-2">
                     <h3 className="font-bold text-white text-lg border-b border-gray-700 pb-2">2. Select Content</h3>
                     <div className="bg-[#0D0B14] border border-gray-600 rounded-md p-2 h-60 sm:h-72 md:h-80 overflow-y-auto">
                        {!isConnected ? <p className="text-gray-500 text-center p-4">Connect with your API key to see content.</p> :
                            organizations.map(org => {
                                const isExpanded = expandedNodes.has(org.id);
                                return (
                                <div key={org.id}>
                                    <div onClick={() => handleToggleNode(org.id, 'org')} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-700/50 cursor-pointer">
                                        <ChevronRightIcon />
                                        <FolderOpenIcon className="w-4 h-4 text-purple-400" />
                                        <span className="font-semibold text-sm flex-grow">{org.title}</span>
                                    </div>
                                    {isExpanded && <div className="pl-4 border-l border-gray-700 ml-2">
                                        {(spacesByOrgId[org.id] || []).map(space => {
                                            const isSpaceExpanded = expandedNodes.has(space.id);
                                            const pagesInSpace = pagesBySpaceId[space.id] || [];
                                            const selectedInSpace = pagesInSpace.filter(p => selectedPageIds.has(p.id)).length;
                                            return <div key={space.id}>
                                                <div className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-700/50">
                                                    <input type="checkbox" className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                                                        checked={pagesInSpace.length > 0 && selectedInSpace === pagesInSpace.length}
                                                        onChange={() => handleSelectionChange(space.id, 'space')} disabled={pagesInSpace.length === 0 && !loadingNode} />
                                                    <div onClick={() => handleToggleNode(space.id, 'space', space)} className="flex items-center space-x-2 cursor-pointer flex-grow">
                                                        <ChevronRightIcon />
                                                        <span className="text-sm">{space.title} ({selectedInSpace}/{pagesInSpace.length})</span>
                                                    </div>
                                                    {loadingNode === space.id && <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>}
                                                </div>
                                                {isSpaceExpanded && <div className="pl-6 border-l border-gray-700 ml-2">
                                                    {pagesInSpace.length === 0 && !loadingNode && <p className="text-xs text-gray-500 p-1">No pages found.</p>}
                                                    {pagesInSpace.map(page => {
                                                        const status = pageStatuses[page.id];
                                                        return <div key={page.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-700/50">
                                                            <input type="checkbox" className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                                                                checked={selectedPageIds.has(page.id)} onChange={() => handleSelectionChange(page.id, 'page')} />
                                                            <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm flex-grow">{page.title}</span>
                                                            {status === 'errors' && <span title="Suggestions found in last scan"><InformationCircleIcon className="w-4 h-4 text-purple-400 flex-shrink-0" /></span>}
                                                            {status === 'no_issues' && <span title="No issues found in last scan"><CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" /></span>}
                                                        </div>
                                                    })}
                                                </div>}
                                            </div>
                                        })}
                                        {spacesByOrgId[org.id]?.length === 0 && !loadingNode && <p className="text-xs text-gray-500 pl-4 py-1">No spaces found in this organization.</p>}
                                    </div>}
                                </div>
                            )})
                        }
                     </div>
                </div>

                {/* Column 3: Analysis */}
                <div className="lg:col-span-1 space-y-4">
                     <h3 className="font-bold text-white text-lg border-b border-gray-700 pb-2">3. Analyze</h3>
                     <div className="bg-[#0D0B14] border border-gray-600 rounded-md p-4 text-center space-y-3 flex flex-col justify-center items-center h-60 sm:h-72 md:h-80">
                        <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
                            {selectedPageIds.size}
                        </div>
                        <p className="font-medium text-gray-300">Page{selectedPageIds.size !== 1 && 's'} Selected</p>
                        <p className="text-xs text-gray-500 max-w-xs">
                            Once you've selected pages, click the button below to analyze them with Gemini.
                        </p>
                         <button onClick={handleAnalyze} disabled={selectedPageIds.size === 0} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            <SparklesIcon className="mr-2 h-5 w-5" />
                            Analyze {selectedPageIds.size} Page{selectedPageIds.size !== 1 && 's'}
                        </button>
                     </div>
                </div>

            </div>
        </div>
    );
};
export default GitBookView;