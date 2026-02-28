import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutModalProps {
    onClose: () => void;
    onLogout: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onClose, onLogout }) => {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-duo-gray dark:border-slate-800 shadow-2xl max-w-md w-full p-8 animate-zoom-in">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-duo-red/10 dark:bg-duo-red/20 p-6 rounded-2xl border-4 border-duo-red/30">
                        <LogOut size={48} className="text-duo-red" strokeWidth={3} />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-3 uppercase tracking-tight">
                    log out?
                </h2>

                {/* Message */}
                <p className="text-slate-600 dark:text-slate-400 text-center mb-8 font-bold">
                    This will delete your profile and chat history from this device.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    {/* Cancel Button */}
                    <button
                        onClick={onClose}
                        className="flex-1 bg-duo-gray dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-4 rounded-2xl font-black text-lg border-b-4 border-duo-gray-dark dark:border-slate-950 active:border-b-0 active:translate-y-1 transition-all shadow-lg uppercase tracking-tight hover:bg-duo-gray/80"
                    >
                        cancel
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={onLogout}
                        className="flex-1 bg-duo-red text-white px-6 py-4 rounded-2xl font-black text-lg border-b-4 border-duo-red-dark active:border-b-0 active:translate-y-1 transition-all shadow-lg uppercase tracking-tight hover:bg-duo-red/90"
                    >
                        log out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
