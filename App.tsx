import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Play, Sparkles, User, Ghost, Keyboard, Send, Check, Copy, Heart, Download, BarChart2, Sun, Moon, LogOut, RefreshCw, Volume2, Radio, MessageSquare, Award, TrendingUp, Activity, TrendingDown, Monitor, X } from 'lucide-react';
import SetupModal from './components/SetupModal';
import Waveform from './components/Waveform';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { StudentProfile, ConnectionStatus, ImageResolution } from './types';
import { useGeminiLive } from './hooks/useGeminiLive';
import LumiAvatar from './components/LumiAvatar';

// Splash Screen Component
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

const App: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);

    // Theme Management
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark' || saved === 'light') return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f172a');
        } else {
            document.documentElement.classList.remove('dark');
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8fafc');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // Initialize Profile from LocalStorage
    const [profile, setProfile] = useState<StudentProfile | null>(() => {
        try {
            const saved = localStorage.getItem('lumi_student_profile');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    const [imageResolution, setImageResolution] = useState<ImageResolution>('1K');
    const [isTeacherMode, setIsTeacherMode] = useState(false);
    const [isDirectorMode, setIsDirectorMode] = useState(false);
    const [teacherInput, setTeacherInput] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // PWA Install Prompt Listener
    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            setShowInstallModal(false);
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                setDeferredPrompt(null);
            });
        }
    };

    // Save profile to LocalStorage whenever it changes
    useEffect(() => {
        if (profile) {
            localStorage.setItem('lumi_student_profile', JSON.stringify(profile));
        }
    }, [profile]);

    const handleLogout = () => {
        localStorage.removeItem('lumi_student_profile');
        localStorage.removeItem('lumi_chat_history');
        localStorage.removeItem('lumi_learning_stats');
        localStorage.removeItem('lumi_sessions');
        setProfile(null);
        window.location.reload();
    };

    const {
        status,
        connect,
        disconnect,
        isMuted,
        setIsMuted,
        isVideoActive,
        setIsVideoActive,
        inputAnalyzer,
        messages,
        liveInput,
        liveOutput,
        learningStats,
        sendTextMessage,
        toggleMessageProperty,
        isAiSpeaking
    } = useGeminiLive({ profile, videoRef, imageResolution });

    // Handle Camera Stream locally for the video element
    useEffect(() => {
        if (isVideoActive) {
            // Stop existing stream before requesting new one (important for camera flip)
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }

            // Request new camera stream
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: cameraFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error("Camera access denied", err);
                    setIsVideoActive(false);
                });
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }
    }, [isVideoActive, setIsVideoActive, cameraFacingMode]);

    const toggleCamera = () => {
        setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    // Auto-scroll transcript
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, liveInput, liveOutput]);

    // Auto-mute when Teacher Mode is activated
    useEffect(() => {
        if (isTeacherMode && status === ConnectionStatus.CONNECTED) {
            setIsMuted(true);
        }
    }, [isTeacherMode, status, setIsMuted]);

    const handleTeacherSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (teacherInput.trim()) {
            sendTextMessage(teacherInput, isDirectorMode ? 'instruction' : 'chat');
            setTeacherInput('');
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getConfidenceConfig = (score: number) => {
        if (score >= 85) return {
            label: 'Mastery',
            color: 'text-duo-green',
            bg: 'bg-duo-green/10',
            border: 'border-duo-green',
            icon: Award
        };
        if (score >= 60) return {
            label: 'On Track',
            color: 'text-duo-blue',
            bg: 'bg-duo-blue/10',
            border: 'border-duo-blue',
            icon: TrendingUp
        };
        if (score >= 40) return {
            label: 'Learning',
            color: 'text-duo-yellow',
            bg: 'bg-duo-yellow/10',
            border: 'border-duo-yellow',
            icon: Activity
        };
        return {
            label: 'Focus Needed',
            color: 'text-duo-red',
            bg: 'bg-duo-red/10',
            border: 'border-duo-red',
            icon: TrendingDown
        };
    };

    if (showSplash) {
        return <SplashScreen onComplete={() => setShowSplash(false)} />;
    }

    if (!profile) {
        return <SetupModal onComplete={setProfile} />;
    }

    const isConnected = status === ConnectionStatus.CONNECTED;
    const isConnecting = status === ConnectionStatus.CONNECTING;
    const conf = learningStats ? getConfidenceConfig(learningStats.understandingScore) : null;

    return (
        <div className="h-[100dvh] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden flex flex-col relative transition-colors duration-500">

            {showAnalytics && <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />}

            {/* Install App Modal - Duolingo Style */}
            {showInstallModal && deferredPrompt && (
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
                                onClick={() => setShowInstallModal(false)}
                                className="flex-1 bg-duo-gray dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-4 rounded-2xl font-black text-lg border-b-4 border-duo-gray-dark dark:border-slate-950 active:border-b-0 active:translate-y-1 transition-all shadow-lg uppercase tracking-tight hover:bg-duo-gray/80"
                            >
                                later
                            </button>

                            {/* Install Button */}
                            <button
                                onClick={handleInstallClick}
                                className="flex-1 bg-duo-green text-white px-6 py-4 rounded-2xl font-black text-lg border-b-4 border-duo-green-dark active:border-b-0 active:translate-y-1 transition-all shadow-lg uppercase tracking-tight hover:bg-duo-green/90"
                            >
                                install
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal - Duolingo Style */}
            {showLogoutModal && (
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
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 bg-duo-gray dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-4 rounded-2xl font-black text-lg border-b-4 border-duo-gray-dark dark:border-slate-950 active:border-b-0 active:translate-y-1 transition-all shadow-lg uppercase tracking-tight hover:bg-duo-gray/80"
                            >
                                cancel
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={() => {
                                    setShowLogoutModal(false);
                                    handleLogout();
                                }}
                                className="flex-1 bg-duo-red text-white px-6 py-4 rounded-2xl font-black text-lg border-b-4 border-duo-red-dark active:border-b-0 active:translate-y-1 transition-all shadow-lg uppercase tracking-tight hover:bg-duo-red/90"
                            >
                                log out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Duolingo Style Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#f7f7f7] dark:bg-slate-950 transition-colors duration-500">
                <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-duo-green/5 rounded-full blur-[80px] animate-pulse-glow"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-duo-blue/5 rounded-full blur-[80px] animate-pulse-glow delay-700"></div>
            </div>

            {/* Header - Duolingo Style Top Bar */}
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
                                onClick={() => setShowInstallModal(true)}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-duo-blue text-white text-xs font-black border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-1 transition-all shadow-sm"
                            >
                                <Download size={14} strokeWidth={4} />
                                GET APP
                            </button>
                        )}

                        <button
                            onClick={toggleTheme}
                            className="p-2.5 text-duo-gray-dark hover:text-duo-green rounded-xl border-2 border-transparent hover:border-duo-gray transition-all shadow-sm md:shadow-none"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} strokeWidth={3} /> : <Moon size={20} strokeWidth={3} />}
                        </button>

                        <button
                            onClick={() => setShowAnalytics(true)}
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
                                onClick={() => setShowLogoutModal(true)}
                                className="p-2 text-duo-gray-dark hover:text-duo-red transition-all"
                                title="Log Out"
                            >
                                <LogOut size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Layout - Duolingo Style Stage + Cards */}
            <main className="flex-1 w-full flex flex-col lg:flex-row relative pt-[60px] sm:pt-[72px] overflow-hidden">

                {/* === VISUAL STAGE === */}
                <div className={`
                    relative w-full lg:flex-[1.2] flex flex-col items-center p-4 sm:p-6 overflow-hidden z-0 transition-all duration-500 ease-in-out justify-center
                    ${isVideoActive ? 'h-[30dvh] sm:h-[40dvh]' : 'h-[40dvh] sm:h-[50dvh]'} lg:h-full
                `}>

                    {/* Removed decorative platform for cleaner design */}

                    {/* VIDEO/AVATAR LAYER */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute inset-0 z-0 flex items-center justify-center bg-duo-gray/10 dark:bg-black/20 rounded-3xl overflow-hidden transition-colors duration-500">
                            {isVideoActive ? (
                                <div className="w-full h-full p-4">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={`w-full h-full object-cover rounded-3xl border-4 border-duo-gray dark:border-slate-800 shadow-xl ${cameraFacingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full opacity-50 bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#f7f7f7_100%)] dark:bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)]"></div>
                            )}
                        </div>

                        {/* Unified Status Bar - Top */}
                        <div className="absolute top-4 left-4 right-4 z-20">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-duo-gray/30 dark:border-slate-700/50 shadow-lg transition-all duration-300">
                                {/* Left: Live/Ready indicator */}
                                {isConnected ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-duo-green animate-pulse"></div>
                                        <span className="text-xs font-bold text-duo-green">live</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-duo-gray-dark"></div>
                                        <span className="text-xs font-bold text-duo-gray-dark">ready</span>
                                    </div>
                                )}

                                {/* Right: Thinking indicator (conditional) */}
                                {isConnected && !isAiSpeaking && (liveInput || liveOutput) && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 bg-duo-blue rounded-full animate-bounce"></div>
                                            <div className="w-1 h-1 bg-duo-blue rounded-full animate-bounce [animation-delay:0.15s]"></div>
                                            <div className="w-1 h-1 bg-duo-blue rounded-full animate-bounce [animation-delay:0.3s]"></div>
                                        </div>
                                        <span className="text-xs font-bold text-duo-blue">thinking</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lumi Avatar - Only show when video is OFF */}
                        {!isVideoActive && (
                            <div className={`relative z-10 transition-all duration-700 flex items-center justify-center w-full h-full ${isConnected ? 'scale-100' : 'scale-95 opacity-90'}`}>
                                <LumiAvatar
                                    isSpeaking={isAiSpeaking}
                                    className="w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 transition-all duration-700"
                                />

                                {!isConnected && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-4 border-white/50 animate-bounce-slow shadow-xl">
                                            <Play className="w-10 h-10 text-white fill-white ml-2" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Waveform for Input - Simplified */}
                    {isConnected && !isMuted && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                            <div className="px-4 py-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-full border border-duo-gray/20 dark:border-slate-700/30 shadow-md transition-all duration-300">
                                <div className="w-24 h-6">
                                    <Waveform analyzer={inputAnalyzer} isListening={!isMuted} color="#58cc02" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* === CHAT / ACTION AREA === */}
                <div className="relative flex-1 flex flex-col w-full h-full bg-white dark:bg-slate-900 border-t-2 lg:border-t-0 lg:border-l-2 border-duo-gray dark:border-slate-800 z-30 transition-colors duration-500 overflow-hidden shadow-2xl">

                    {!isConnected ? (
                        /* Off-session / Connect View */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                            <div className="max-w-sm w-full space-y-8">
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">
                                        ready to master <br /> {profile.favoriteSubject}?
                                    </h2>
                                    <p className="text-duo-gray-dark font-black text-lg lowercase">
                                        lumi is waiting for you!
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={connect}
                                        disabled={isConnecting}
                                        className="w-full relative group"
                                    >
                                        <div className="relative flex items-center justify-center gap-3 bg-duo-green text-white px-8 py-5 rounded-3xl font-black text-xl border-b-8 border-duo-green-dark active:border-b-0 active:translate-y-2 transition-all shadow-xl shadow-duo-green/20">
                                            {isConnecting ? (
                                                <>
                                                    <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>CONNECTING...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Play size={24} fill="currentColor" strokeWidth={4} />
                                                    <span>START SESSION</span>
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    {deferredPrompt && (
                                        <button
                                            onClick={handleInstallClick}
                                            className="md:hidden w-full flex items-center justify-center gap-2 text-xs font-black text-duo-gray-dark uppercase tracking-widest py-2"
                                        >
                                            <Download size={14} /> install App
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center justify-center gap-6 text-[10px] font-black text-duo-gray-dark uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Video size={14} strokeWidth={3} /> video</span>
                                    <span className="flex items-center gap-1.5"><Mic size={14} strokeWidth={3} /> voice</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* On-session Transcript Component */
                        <>
                            {/* Confidence Tracker - Compact */}
                            {learningStats && conf && (
                                <div className="px-4 sm:px-6 py-3 relative z-20 border-b-2 border-duo-gray/30 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        {/* Left: Icon + Score */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-800 border-2 border-b-3 ${conf.border} shadow-sm`}>
                                                <conf.icon size={16} className={conf.color} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <div className={`text-xl font-black ${conf.color} leading-none`}>
                                                    {learningStats.understandingScore}%
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                                                    confidence
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Progress Bar + Label */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-black uppercase tracking-tight ${conf.color}`}>
                                                    {conf.label}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500">
                                                    Lumi's understanding estimated
                                                </span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-200/50 dark:bg-slate-900/50 rounded-full border border-duo-gray/30 dark:border-slate-800 overflow-hidden relative">
                                                <div
                                                    className={`h-full bg-duo-green border-r border-duo-green-dark transition-all duration-1000 ease-out rounded-full`}
                                                    style={{ width: `${learningStats.understandingScore}%` }}
                                                />
                                                <div className="absolute top-0.5 left-2 w-1/4 h-0.5 bg-white/30 rounded-full pointer-events-none"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Message Feed */}
                            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-0 pb-40 sm:pb-44 space-y-6 custom-scrollbar scroll-smooth" ref={scrollRef}>
                                {messages.map((msg) => {
                                    if (msg.role === 'system') {
                                        return (
                                            <div key={msg.id} className="flex justify-center w-full my-4">
                                                <div className="px-4 py-1.5 bg-duo-gray/20 dark:bg-white/5 rounded-2xl border-2 border-duo-gray dark:border-slate-800">
                                                    <span className="text-[10px] font-black text-duo-gray-dark uppercase tracking-widest">{msg.text}</span>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const isUser = msg.role === 'user';
                                    return (
                                        <div key={msg.id} className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start animate-slide-up`}>
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border-b-4 ${isUser ? 'bg-duo-blue border-duo-blue-dark shadow-sm' : 'bg-duo-green border-duo-green-dark shadow-sm'}`}>
                                                {isUser ? <User size={20} className="text-white" /> : <Ghost size={20} className="text-white" />}
                                            </div>

                                            <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                                                <div className={`
                                                    relative px-5 py-4 rounded-3xl text-[16px] font-bold border-2 border-b-4 transition-all duration-200
                                                    ${isUser
                                                        ? 'bg-duo-blue border-duo-blue-dark text-white rounded-tr-none shadow-blue-500/10'
                                                        : 'bg-white border-duo-gray text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-tl-none'
                                                    }
                                                `}>
                                                    <p className="whitespace-pre-wrap leading-tight tracking-tight">{msg.text}</p>
                                                    {msg.image && (
                                                        <div className="mt-4 rounded-2xl overflow-hidden border-2 border-duo-gray dark:border-slate-700 shadow-md">
                                                            <img src={msg.image} alt="Generated content" className="w-full h-auto" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-4 mt-2 px-1">
                                                    <button onClick={() => handleCopy(msg.text, msg.id)} className="text-duo-gray-dark hover:text-duo-blue transition-colors">
                                                        {copiedId === msg.id ? <Check size={16} /> : <Copy size={16} />}
                                                    </button>
                                                    <button onClick={() => toggleMessageProperty(msg.id, 'isFavorite')} className={`hover:text-duo-red transition-all ${msg.isFavorite ? 'text-duo-red' : 'text-duo-gray-dark'}`}>
                                                        <Heart size={16} fill={msg.isFavorite ? "currentColor" : "none"} />
                                                    </button>
                                                    <span className="text-[10px] font-black text-duo-gray-dark uppercase mt-0.5 opacity-60">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {(liveInput || liveOutput) && (
                                    <div className={`flex gap-4 ${liveInput ? 'flex-row-reverse' : 'flex-row'} items-start opacity-70`}>
                                        <div className="w-10 h-10 rounded-2xl bg-duo-gray/20 dark:bg-white/10 flex items-center justify-center border-b-4 border-duo-gray/30">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-duo-gray-dark rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-duo-gray-dark rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                                <div className="w-1.5 h-1.5 bg-duo-gray-dark rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Control Bar - Mobile Optimized Floating Dock */}
                            <div className="absolute bottom-0 w-full p-6 bg-white dark:bg-slate-900 border-t-2 border-duo-gray dark:border-slate-800 z-40 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">

                                {isTeacherMode && (
                                    <div className="mb-6 animate-slide-up">
                                        <form onSubmit={handleTeacherSend} className="flex gap-3">
                                            <input
                                                type="text"
                                                value={teacherInput}
                                                onChange={(e) => setTeacherInput(e.target.value)}
                                                placeholder={isDirectorMode ? "direct lumi..." : "simulate student..."}
                                                className="flex-1 bg-duo-gray/10 dark:bg-slate-950/50 border-2 border-b-4 border-duo-gray dark:border-slate-800 rounded-2xl px-5 py-4 font-black focus:outline-none focus:border-duo-blue transition-all lowercase placeholder:lowercase"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!teacherInput.trim()}
                                                className="bg-duo-blue text-white p-4 rounded-2xl border-b-4 border-duo-blue-dark active:border-b-0 active:translate-y-1 transition-all disabled:opacity-30 shadow-lg shadow-duo-blue/20"
                                            >
                                                <Send size={24} strokeWidth={4} />
                                            </button>
                                        </form>
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-3xl border-2 border-b-8 transition-all active:border-b-0 active:translate-y-2 group ${isMuted
                                            ? 'bg-duo-red border-duo-red-dark text-white'
                                            : 'bg-white dark:bg-slate-800 border-duo-gray dark:border-slate-700 text-duo-gray-dark'}`}
                                    >
                                        {isMuted ? <MicOff size={24} strokeWidth={3} /> : <Mic size={24} strokeWidth={3} />}
                                        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{isMuted ? 'Muted' : 'Voice'}</span>
                                    </button>

                                    <button
                                        onClick={() => setIsVideoActive(!isVideoActive)}
                                        className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-3xl border-2 border-b-8 transition-all active:border-b-0 active:translate-y-2 group ${isVideoActive
                                            ? 'bg-duo-blue border-duo-blue-dark text-white'
                                            : 'bg-white dark:bg-slate-800 border-duo-gray dark:border-slate-700 text-duo-gray-dark'}`}
                                    >
                                        {isVideoActive ? <Video size={24} strokeWidth={3} /> : <VideoOff size={24} strokeWidth={3} />}
                                        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{isVideoActive ? 'Cam On' : 'Cam Off'}</span>
                                    </button>

                                    {/* Camera Flip Button - Only visible when Video is Active */}
                                    {isVideoActive && (
                                        <button
                                            onClick={toggleCamera}
                                            className="flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-3xl bg-white dark:bg-slate-800 border-2 border-b-8 border-duo-gray dark:border-slate-700 text-duo-gray-dark transition-all active:border-b-0 active:translate-y-2 group"
                                            title="Flip Camera"
                                        >
                                            <RefreshCw size={24} strokeWidth={3} />
                                            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Flip</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={disconnect}
                                        className="flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-3xl bg-duo-red border-2 border-b-8 border-duo-red-dark text-white transition-all active:border-b-0 active:translate-y-2 group shadow-lg shadow-duo-red/20"
                                    >
                                        <X size={24} strokeWidth={4} />
                                        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Exit</span>
                                    </button>

                                    <button
                                        onClick={() => setIsTeacherMode(!isTeacherMode)}
                                        className={`flex flex-1 flex-col items-center justify-center py-3 px-2 rounded-3xl border-2 border-b-8 transition-all active:border-b-0 active:translate-y-2 group ${isTeacherMode
                                            ? 'bg-duo-yellow border-duo-yellow-dark text-white'
                                            : 'bg-white dark:bg-slate-800 border-duo-gray dark:border-slate-700 text-duo-gray-dark'}`}
                                    >
                                        <Keyboard size={24} strokeWidth={3} />
                                        <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Tools</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;