

import React from 'react';
import { SparklesIcon } from './icons';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-3">
                    <SparklesIcon className="w-8 h-8 text-purple-600" />
                    <h1 className="text-2xl font-bold text-slate-800">AI Proofreader</h1>
                </div>
                <p className="text-slate-500 mt-1">Your expert technical writing assistant, powered by Gemini.</p>
            </div>
        </header>
    );
};

export default Header;