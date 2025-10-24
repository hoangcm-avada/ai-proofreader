import React from 'react';
import { 
    XMarkIcon,
    BookOpenIcon,
    ListBulletIcon,
    PencilSquareIcon,
    CheckIcon,
    ArrowDownTrayIcon,
    CodeBracketIcon,
    CloudArrowUpIcon,
    DocumentTextIcon,
    BeakerIcon,
    QuestionMarkCircleIcon,
    KeyIcon
} from './icons';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface HelpItemProps {
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    title: string;
    children: React.ReactNode;
}

const HelpItem: React.FC<HelpItemProps> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-gray-800/50 p-2 rounded-lg text-purple-400">
            {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
        <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-gray-400 text-sm">{children}</p>
        </div>
    </div>
);


const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[#1C1827] border border-gray-700/50 rounded-xl shadow-2xl w-full md:max-w-3xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 sm:p-8 space-y-2 text-center border-b border-gray-700/50 relative">
                     <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    <div className="inline-block bg-purple-900/50 p-3 rounded-xl mb-2">
                         <CodeBracketIcon className="w-8 h-8 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Doc QA Assistant Guide</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        A comprehensive toolkit to proofread, summarize, and enhance your technical documentation from various sources. Here's how to get the most out of it.
                    </p>
                </div>
                <div className="p-6 sm:p-8 space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Getting Started</h3>
                        <div className="space-y-6">
                            {/* FIX: Updated API key instructions to reflect environment variable usage, removing mentions of in-app key changes. */}
                            <HelpItem icon={<KeyIcon />} title="API Key Information">
                                This application is configured to use a Google Gemini API key provided through an environment variable. No manual setup of the API key is required within the app. Ensure the <code>GEMINI_API_KEY</code> is set in your environment for the application to function correctly.
                            </HelpItem>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Core Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                             <HelpItem icon={<PencilSquareIcon />} title="Proofread Text">
                                Directly paste any text, code, or markdown into the editor for a quick analysis.
                            </HelpItem>
                             <HelpItem icon={<CloudArrowUpIcon />} title="Proofread Files">
                                Analyze local documents by uploading files, including .md, .txt, .doc, and .docx.
                            </HelpItem>
                            <HelpItem icon={<DocumentTextIcon />} title="Proofread Google Doc">
                                Analyze content directly from a public Google Doc by simply providing the URL.
                            </HelpItem>
                             <HelpItem icon={<BookOpenIcon />} title="Proofread GitBook">
                                Connect your GitBook account to analyze your documentation spaces in batches.
                            </HelpItem>
                            <HelpItem icon={<ListBulletIcon />} title="Summarize Document">
                                Get a concise summary of any long document to quickly grasp the key points.
                            </HelpItem>
                             <HelpItem icon={<BeakerIcon />} title="Custom Dictionary">
                                Add brand names or technical terms to prevent them from being flagged as errors.
                            </HelpItem>
                            <HelpItem icon={<CodeBracketIcon />} title="Style Guide Rules">
                                Enforce your team's specific writing style (e.g., "Use 'customer' instead of 'user'").
                            </HelpItem>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Troubleshooting</h3>
                        <div className="space-y-6">
                            <HelpItem icon={<KeyIcon />} title="GitBook: Can't see 'Scopes' or Permissions?">
                                The ability to create an Organization API Token with specific permissions (scopes) is often limited to certain GitBook subscription plans (e.g., Pro, Enterprise) and may require you to be an 'Admin' or 'Owner' of the organization.
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Check your organization's 'Billing' page to see your current plan.</li>
                                    <li>Check the 'Members' page to confirm you have an Admin or Owner role.</li>
                                    <li>If needed, ask an organization Owner to create the token for you.</li>
                                </ul>
                            </HelpItem>
                            <HelpItem icon={<QuestionMarkCircleIcon />} title="General: Why is an analysis failing?">
                                Ensure your input text isn't empty and that your internet connection is stable. For GitBook or Google Docs, double-check that the content is shared publicly and that your API keys or URLs are correct.
                            </HelpItem>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
