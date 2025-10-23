import React from 'react';
import { Suggestion } from '../types';
import { CheckIcon, XIcon } from './icons';

interface ErrorCardProps {
    suggestion: Suggestion;
    onUpdateStatus: (id: number, status: Suggestion['status']) => void;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ suggestion, onUpdateStatus }) => {
    
    const baseClasses = "bg-[#1C1827]/60 p-4 rounded-lg border transition-all duration-300";
    const statusClasses = {
        pending: "border-gray-700/50 hover:border-purple-600/80 hover:shadow-[0_0_15px_theme(colors.purple.800)]",
        accepted: "border-green-500/40 opacity-70",
        ignored: "border-gray-700/30 opacity-50",
    };
    
    const isPending = suggestion.status === 'pending';

    return (
        <div className={`${baseClasses} ${statusClasses[suggestion.status]}`}>
            <div className="space-y-4">
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Original</h3>
                    <p className="bg-black/30 text-red-400 p-3 rounded-md font-mono text-sm ring-1 ring-inset ring-gray-700">
                        {suggestion.original}
                    </p>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Correction</h3>
                    <p className="bg-black/30 text-green-400 p-3 rounded-md font-mono text-sm ring-1 ring-inset ring-gray-700">
                        {suggestion.correction}
                    </p>
                </div>
                 <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Explanation</h3>
                    <p className="text-gray-300 text-sm">
                        {suggestion.explanation}
                    </p>
                </div>
                 {isPending && (
                    <div className="flex justify-end space-x-2 pt-2">
                        <button 
                            onClick={() => onUpdateStatus(suggestion.id, 'ignored')}
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-600/80 text-xs font-medium rounded-md shadow-sm text-gray-300 bg-gray-700/40 hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-colors"
                        >
                            <XIcon className="mr-1.5" />
                            Ignore
                        </button>
                        <button 
                            onClick={() => onUpdateStatus(suggestion.id, 'accepted')}
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-colors"
                        >
                            <CheckIcon className="mr-1.5" />
                            Accept
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorCard;
