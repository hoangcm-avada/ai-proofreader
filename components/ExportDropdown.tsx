import React, { useState, useRef, useEffect } from 'react';
import { ArrowDownTrayIcon } from './icons';

export const ExportDropdown: React.FC<{ onExport: (format: 'txt' | 'md' | 'pdf') => void }> = ({ onExport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center px-3 h-9 border border-gray-600/80 text-xs font-medium rounded-md shadow-sm text-gray-300 bg-gray-700/40 hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-colors"
            >
                <ArrowDownTrayIcon className="mr-1.5" />
                Export
            </button>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#1C1827] ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-700/50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <a href="#" onClick={(e) => { e.preventDefault(); onExport('md'); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50" role="menuitem">Save as .md</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onExport('txt'); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50" role="menuitem">Save as .txt</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onExport('pdf'); setIsOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50" role="menuitem">Print / Save as PDF</a>
                    </div>
                </div>
            )}
        </div>
    );
};
