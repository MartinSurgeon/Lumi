import React, { useEffect } from 'react';
import LumiAvatar from './LumiAvatar';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center animate-fade-in transition-colors duration-500">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-duo-green/20 blur-[60px] rounded-full animate-pulse-glow"></div>
                <div className="relative bg-duo-green p-6 rounded-[2rem] border-b-8 border-duo-green-dark shadow-2xl animate-fade-in">
                    <LumiAvatar size="xl" />
                </div>
            </div>
            <h1 className="text-4xl font-black text-duo-green tracking-tighter lowercase animate-fade-in">
                lumi
            </h1>
            <p className="text-duo-gray-dark font-black mt-2 animate-fade-in uppercase tracking-widest text-xs">
                your ai study buddy
            </p>
        </div>
    );
};

export default SplashScreen;
