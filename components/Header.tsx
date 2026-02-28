import React from 'react';
import { Ghost, Download, Sun, Moon, BarChart2, LogOut } from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
    isConnected: boolean;
    deferredPrompt: any;
    theme: 'light' | 'dark';
    profile: StudentProfile;
    onInstallClick: () => void;
    onToggleTheme: () => void;
    onShowAnalytics: () => void;
    onShowLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
    isConnected,
    deferredPrompt,
    theme,
    profile,
    onInstallClick,
    onToggleTheme,
    onShowAnalytics,
    onShowLogout,
}) => {
    return (
        <header className="fixed top-0 left-0 w-full z-[60] bg-white dark:bg-slate-900 border-b-2 border-duo-gray dark:border-slate-800 px-4 py-3 sm:py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center transition-all duration-500">
                <div className="flex items-center gap-3">
                    <div className="bg-duo-green p-2 rounded-xl border-b-4 border-duo-green-dark shadow-sm">
                        <Ghost className="text-white w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-duo-green tracking-tighter leading-none lowercase">
                            lumi
                        </h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-duo-green animate-pulse' : 'bg-duo-gray-dark'}`}></div>
                            <span className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest leading-none">
                                {isConnected ? 'LIVE' : 'OFFLINE'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {deferredPrompt && (
                        <button
                            onClick={onInstallClick}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-duo-blue text-white text-xs font-black border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-1 transition-all shadow-sm"
                        >
                            <Download size={14} strokeWidth={4} />
                            GET APP
                        </button>
                    )}

                    <button
                        onClick={onToggleTheme}
                        className="p-2.5 text-duo-gray-dark hover:text-duo-green rounded-xl border-2 border-transparent hover:border-duo-gray transition-all shadow-sm md:shadow-none"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} strokeWidth={3} /> : <Moon size={20} strokeWidth={3} />}
                    </button>

                    <button
                        onClick={onShowAnalytics}
                        className="p-2.5 text-duo-blue hover:text-duo-blue-dark rounded-xl border-2 border-transparent hover:border-duo-gray transition-all shadow-sm md:shadow-none"
                        title="View Analytics"
                    >
                        <BarChart2 size={20} strokeWidth={3} />
                    </button>

                    <div className="flex items-center gap-3 pl-3 ml-2 border-l-2 border-duo-gray dark:border-slate-800">
                        <div className="h-10 w-10 rounded-xl bg-duo-yellow border-b-4 border-duo-yellow-dark flex items-center justify-center p-1 shadow-sm">
                            <span className="text-lg font-black text-white">{profile.name.charAt(0)}</span>
                        </div>
                        <button
                            onClick={onShowLogout}
                            className="p-2 text-duo-gray-dark hover:text-duo-red transition-all"
                            title="Log Out"
                        >
                            <LogOut size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
