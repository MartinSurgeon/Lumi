import React from 'react';
import { Download, Check } from 'lucide-react';

interface InstallModalProps {
    deferredPrompt: any;
    onClose: () => void;
    onInstall: () => void;
}

const InstallModal: React.FC<InstallModalProps> = ({ deferredPrompt, onClose, onInstall }) => {
    if (!deferredPrompt) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-duo-green dark:border-duo-green-dark shadow-2xl max-w-md w-full p-8 animate-zoom-in">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-duo-green/10 dark:bg-duo-green/20 p-6 rounded-2xl border-4 border-duo-green/30">
                        <Download size={48} className="text-duo-green" strokeWidth={3} />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-3 uppercase tracking-tight">
                    install lumi?
                </h2>

                {/* Benefits */}
                <div className="space-y-2 mb-8">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <div className="w-6 h-6 rounded-full bg-duo-green/20 flex items-center justify-center flex-shrink-0">
                            <Check size={14} className="text-duo-green" strokeWidth={4} />
                        </div>
                        <span className="font-bold text-sm">Works offline</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <div className="w-6 h-6 rounded-full bg-duo-green/20 flex items-center justify-center flex-shrink-0">
                            <Check size={14} className="text-duo-green" strokeWidth={4} />
                        </div>
                        <span className="font-bold text-sm">Faster performance</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <div className="w-6 h-6 rounded-full bg-duo-green/20 flex items-center justify-center flex-shrink-0">
                            <Check size={14} className="text-duo-green" strokeWidth={4} />
                        </div>
                        <span className="font-bold text-sm">Quick access from home screen</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    {/* Cancel Button */}
                    <button
                        onClick={onClose}
                        className="flex-1 bg-duo-gray dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-4 rounded-2xl font-black text-lg border-b-4 border-duo-gray-dark dark:border-slate-950 active:border-b-0 active:translate-y-1 transition-all shadow-lg uppercase tracking-tight hover:bg-duo-gray/80"
                    >
                        later
                    </button>

                    {/* Install Button */}
                    <button
                        onClick={onInstall}
                        className="flex-1 bg-duo-green text-white px-6 py-4 rounded-2xl font-black text-lg border-b-4 border-duo-green-dark active:border-b-0 active:translate-y-1 transition-all shadow-lg uppercase tracking-tight hover:bg-duo-green/90"
                    >
                        install
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallModal;
