import React, { useState } from 'react';
import { KeyIcon } from './icons';

interface ApiKeyInputProps {
    onSetKey: (key: string) => void;
    apiError?: string | null;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSetKey, apiError }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onSetKey(apiKey.trim());
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1C1827] border border-gray-700/50 rounded-xl p-6 sm:p-8 shadow-2xl shadow-purple-900/10 text-center">
                <div className="inline-block bg-purple-900/50 p-3 rounded-xl mb-4">
                    <KeyIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Enter Your API Key</h1>
                <p className="mt-2 text-gray-400">
                    To use the Doc QA Assistant, please provide your Google Gemini API key. Your key is stored only in your browser and never sent to our servers.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full p-3 bg-[#0D0B14] border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out font-mono text-sm text-gray-300 placeholder-gray-500"
                        placeholder="Enter your Gemini API key"
                        required
                    />
                    {apiError && <p className="text-sm text-red-400">{apiError}</p>}
                    <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                        disabled={!apiKey.trim()}
                    >
                        Continue
                    </button>
                </form>
                <p className="mt-6 text-xs text-gray-500">
                    Don't have a key? Get one from{' '}
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline"
                    >
                        Google AI Studio
                    </a>.
                </p>
            </div>
        </div>
    );
};

export default ApiKeyInput;
