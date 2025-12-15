import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Play, Sparkles, User, Ghost, Keyboard, Send, Check, Copy, Heart, Download, BarChart2, Sun, Moon, LogOut, RefreshCw, Volume2, Radio, MessageSquare, Award, TrendingUp, Activity, TrendingDown, Monitor } from 'lucide-react';
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
                <div className="absolute inset-0 bg-fuchsia-500/20 blur-[60px] rounded-full animate-pulse-glow"></div>
                <div className="relative bg-gradient-to-br from-fuchsia-500 to-violet-600 p-6 rounded-[2rem] shadow-2xl shadow-fuchsia-500/30 animate-slide-up">
                    <LumiAvatar size="xl" />
                </div>
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-500 dark:from-fuchsia-300 dark:to-cyan-300 tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Lumi
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                Your Magical AI Tutor
            </p>
        </div>
    );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
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
    if (confirm("Are you sure you want to log out?\n\nThis will delete your profile and chat history from this device.")) {
        localStorage.removeItem('lumi_student_profile');
        localStorage.removeItem('lumi_chat_history');
        localStorage.removeItem('lumi_learning_stats');
        localStorage.removeItem('lumi_sessions');
        setProfile(null);
        window.location.reload();
    }
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
    // outputAnalyzer, // Not strictly used in current layout but available
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
          color: 'text-fuchsia-600 dark:text-fuchsia-400', 
          gradient: 'from-fuchsia-500 to-purple-600',
          bg: 'bg-fuchsia-500/10',
          border: 'border-fuchsia-500/30',
          icon: Award
      };
      if (score >= 60) return { 
          label: 'On Track', 
          color: 'text-cyan-600 dark:text-cyan-400', 
          gradient: 'from-cyan-400 to-blue-500',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          icon: TrendingUp
      };
      if (score >= 40) return { 
          label: 'Learning', 
          color: 'text-amber-600 dark:text-amber-400', 
          gradient: 'from-amber-400 to-orange-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: Activity
      };
      return { 
          label: 'Needs Focus', 
          color: 'text-slate-500 dark:text-slate-400', 
          gradient: 'from-slate-500 to-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/30',
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
    <div className="h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden flex flex-col relative selection:bg-fuchsia-500 selection:text-white transition-colors duration-500">
      
      {showAnalytics && <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />}

      {/* Cosmic Background (Animated) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-200/40 via-slate-50 to-white dark:from-violet-900/40 dark:via-slate-950 dark:to-black transition-colors duration-500"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/10 dark:bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/10 dark:bg-cyan-600/20 rounded-full blur-[120px] animate-pulse-glow delay-1000"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-fuchsia-400 rounded-full blur-[1px] animate-float opacity-40"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-cyan-400 rounded-full blur-[2px] animate-float delay-700 opacity-40"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full blur-[1px] animate-float delay-1500 opacity-30"></div>
      </div>

      {/* Header - Compact & Transparent */}
      <header className="w-full px-4 py-3 flex justify-between items-center z-50 absolute top-0 left-0 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-white/40 dark:bg-black/20 backdrop-blur-md p-1.5 rounded-xl border border-white/20 dark:border-white/5 shadow-sm">
          <div className="bg-gradient-to-br from-fuchsia-500 to-violet-600 p-1.5 rounded-lg shadow-lg shadow-fuchsia-500/30">
            <Ghost className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-violet-600 dark:from-fuchsia-300 dark:to-cyan-300 tracking-tight">
            Lumi
          </h1>
        </div>
        
        {/* Profile / Stats Pill */}
        <div className="flex items-center gap-3 pointer-events-auto">
           {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-500 backdrop-blur-md text-xs font-bold text-white transition-all border border-indigo-400/30 shadow-lg"
              >
                <Download size={14} />
                Install App
              </button>
           )}
           
           <button 
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-fuchsia-500 dark:hover:text-fuchsia-300 bg-white/40 dark:bg-black/20 rounded-full backdrop-blur-md border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-fuchsia-500/10 transition-all shadow-sm"
                title="Toggle Theme"
           >
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
           </button>

           <button 
                onClick={() => setShowAnalytics(true)}
                className="p-2 text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-500 dark:hover:text-fuchsia-300 bg-white/40 dark:bg-black/20 rounded-full backdrop-blur-md border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-fuchsia-500/10 transition-all shadow-sm"
                title="View Analytics"
           >
               <BarChart2 size={18} />
           </button>

           {isConnected && learningStats && (
               <div className={`hidden md:flex px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide bg-white/60 dark:bg-slate-900/80 backdrop-blur-md shadow-sm ${
                    learningStats?.difficultyLevel === 'Advanced' ? 'bg-red-50/50 dark:bg-red-900/30 border-red-500/30 text-red-600 dark:text-red-300' :
                    learningStats?.difficultyLevel === 'Intermediate' ? 'bg-yellow-50/50 dark:bg-yellow-900/30 border-yellow-500/30 text-yellow-600 dark:text-yellow-300' :
                    'bg-emerald-50/50 dark:bg-emerald-900/30 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                }`}>
                    {learningStats?.difficultyLevel || 'Beginner'} Mode
               </div>
           )}
           
           <div className="flex items-center gap-2">
               <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg border-2 border-white/30 dark:border-cyan-300/50">
                <span className="text-xs font-bold text-white">{profile.name.charAt(0)}</span>
               </div>
               <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all bg-white/40 dark:bg-black/20 rounded-full backdrop-blur-md border border-white/20 dark:border-white/5 shadow-sm"
                title="Log Out & Clear Data"
               >
                   <LogOut size={18} />
               </button>
           </div>
        </div>
      </header>

      {/* Main Layout - Visual Stage + Bottom Sheet */}
      <main className="flex-1 w-full h-full flex flex-col lg:flex-row relative">
        
        {/* === VISUAL STAGE (Top on Mobile, Left on Desktop) === */}
        <div className={`
             relative w-full lg:flex-[1.5] flex flex-col items-center p-4 overflow-hidden lg:border-r border-white/10 z-0 transition-[height] duration-500 ease-in-out justify-center
             ${isVideoActive ? 'h-[55dvh]' : 'h-[40dvh]'} lg:h-full
        `}>
          
          {/* VIDEO CALL BACKGROUND LAYER */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-100/50 dark:bg-black/50 transition-colors duration-500">
             {isVideoActive ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover transition-opacity duration-700 opacity-100 ${cameraFacingMode === 'user' ? 'transform scale-x-[-1]' : ''}`} 
                />
             ) : (
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-100/50 to-white/80 dark:from-indigo-950/50 dark:to-slate-950/80 transition-colors duration-500"></div>
             )}
             
             {/* CLEAN VIDEO CALL OVERLAY */}
             {isVideoActive && (
               <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60">
                  {/* Vignette */}
               </div>
             )}
          </div>

          {/* AI AVATAR LAYER */}
          <div className={`relative z-10 flex flex-col transition-all duration-700 w-full h-full pointer-events-none ${isVideoActive ? 'justify-end items-end p-2' : 'justify-center items-center'}`}>
            
            {/* Status Pills */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 pointer-events-auto">
              {isConnected ? (
                  <div className="flex items-center gap-2 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-emerald-500/30 px-3 py-1 rounded-full shadow-lg">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">LIVE</span>
                  </div>
              ) : (
                  <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 shadow-lg">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">OFFLINE</span>
                  </div>
              )}
              {isTeacherMode && isConnected && (
                <div className="flex items-center gap-2 bg-amber-100/60 dark:bg-amber-900/60 backdrop-blur-md border border-amber-500/30 px-3 py-1 rounded-full shadow-lg">
                    <Keyboard size={10} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Teacher Mode</span>
                </div>
              )}
            </div>

            {/* The Lumi Avatar */}
            <div className={`relative transition-all duration-700 pointer-events-auto ${isConnected ? 'scale-100' : 'scale-90 grayscale opacity-80'} ${isVideoActive ? 'translate-y-0' : 'mt-4'}`}>
               <LumiAvatar 
                  isSpeaking={isAiSpeaking} 
                  className={`
                     transition-all duration-700
                     ${isVideoActive 
                        ? 'w-28 h-28 md:w-36 md:h-36 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]' 
                        : 'w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 filter drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] dark:drop-shadow-[0_0_40px_rgba(232,121,249,0.5)]'
                     }
                  `}
               />
               
               {/* Play button overlay when offline */}
               {!isConnected && (
                  <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse border border-white/40">
                         <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                  </div>
               )}
            </div>
          </div>
          
           {/* User Input Waveform - Persistent Bottom Anchor */}
           {isConnected && (
             <div className={`absolute left-1/2 -translate-x-1/2 z-20 transition-all duration-500 ${isVideoActive ? 'bottom-3 scale-75 opacity-90' : 'bottom-6 scale-100'}`}>
                <div className="w-32 h-9 flex justify-center items-center bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full border border-cyan-500/30 shadow-lg">
                   <div className="w-full h-full px-3 py-1.5 opacity-90">
                       <Waveform analyzer={inputAnalyzer} isListening={!isMuted && isConnected} color={theme === 'dark' ? "#22d3ee" : "#0891b2"} />
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* === CHAT SHEET (Bottom on Mobile, Right on Desktop) === */}
        <div className="relative flex-1 flex flex-col w-full h-full lg:h-auto bg-white lg:bg-white/50 dark:bg-slate-950 lg:dark:bg-slate-950/50 backdrop-blur-xl lg:backdrop-blur-none rounded-t-[2.5rem] lg:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.6)] lg:shadow-none overflow-hidden z-30 -mt-8 lg:mt-0 border-t border-slate-200 dark:border-white/10 lg:border-0 lg:border-l transition-colors duration-500">
           
           {/* Sheet Handle (Mobile Only) */}
           <div className="w-full flex justify-center pt-3 pb-1 lg:hidden pointer-events-none">
               <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full"></div>
           </div>

           {/* START SCREEN (When Offline) */}
           {!isConnected ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                    <div className="max-w-md space-y-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
                                Hi, {profile.name}! 👋
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
                                Ready to crush your <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold">{profile.favoriteSubject}</span> homework?
                            </p>
                        </div>

                        {/* Primary Call To Action - Centered & Visible */}
                        <div className="space-y-4">
                            <button 
                                onClick={connect}
                                disabled={isConnecting}
                                className={`w-full flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all group ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow'}`}
                            >
                                {isConnecting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 text-fuchsia-400 dark:text-fuchsia-600 group-hover:rotate-12 transition-transform" />
                                        <span>Start Learning</span>
                                    </>
                                )}
                            </button>
                            
                            {/* Mobile Install Button (Visible here when offline) */}
                            {deferredPrompt && (
                                <button
                                    onClick={handleInstallClick}
                                    className="md:hidden w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-2"
                                >
                                    <Download size={16} />
                                    Install App
                                </button>
                            )}
                        </div>
                        
                        <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Video size={12}/> Video Supported</span>
                            <span className="flex items-center gap-1"><Mic size={12}/> Voice Interactive</span>
                        </div>
                    </div>
                </div>
           ) : (
                /* CHAT INTERFACE (When Connected) */
               <>
                    {/* CONFIDENCE HUD (Redesigned) */}
                    {learningStats && conf && (
                        <div className="px-5 py-4 animate-fade-in relative z-20">
                            <div className={`
                                relative overflow-hidden rounded-2xl p-4 border transition-all duration-500 shadow-sm
                                ${conf.bg} ${conf.border}
                            `}>
                                {/* Background Shimmer */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-scan pointer-events-none"></div>

                                <div className="flex justify-between items-end mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`p-1.5 rounded-lg bg-white/60 dark:bg-black/20 backdrop-blur-sm ${conf.color}`}>
                                            <conf.icon size={16} className={learningStats.understandingScore > 80 ? 'animate-pulse' : ''}/>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Confidence Level</div>
                                            <div className={`text-sm font-extrabold tracking-tight ${conf.color}`}>
                                                {conf.label}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-3xl font-black ${conf.color}`}>
                                            {learningStats.understandingScore}
                                            <span className="text-sm font-medium opacity-60 ml-0.5">%</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Liquid Bar */}
                                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-900/50 rounded-full overflow-hidden p-[1px]">
                                    <div 
                                        className={`h-full rounded-full bg-gradient-to-r ${conf.gradient} shadow-[0_0_12px_rgba(0,0,0,0.1)] dark:shadow-[0_0_12px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-out relative`}
                                        style={{ width: `${learningStats.understandingScore}%` }}
                                    >
                                        <div className="absolute top-0 right-0 h-full w-2 bg-white/40 blur-[2px]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto px-4 pt-0 pb-32 space-y-6 custom-scrollbar scroll-smooth" ref={scrollRef}>
                            {messages.map((msg) => {
                            if (msg.role === 'system') {
                                return (
                                    <div key={msg.id} className="flex justify-center w-full animate-fade-in my-4 px-4">
                                        <div className="w-full max-w-md bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-3 shadow-sm dark:shadow-lg backdrop-blur-md relative overflow-hidden group hover:bg-white dark:hover:bg-black/50 transition-colors">
                                            <div className="flex items-start gap-3 relative z-10">
                                                <div className="mt-0.5 p-1 bg-slate-100 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-white/5">
                                                    <Monitor size={12} className="text-cyan-600 dark:text-cyan-400/80" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[9px] font-bold text-cyan-600/70 dark:text-cyan-500/50 uppercase tracking-widest font-mono">SYSTEM_LOG</span>
                                                        <span className="text-[9px] text-slate-500 dark:text-slate-600 font-mono">
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                                                        <span className="text-cyan-600 dark:text-cyan-500 mr-2">{'>'}</span>
                                                        {msg.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={msg.id} className={`group flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end animate-slide-up`}>
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border 
                                    ${msg.role === 'user' 
                                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-white/20' 
                                    : 'bg-gradient-to-br from-fuchsia-500 to-violet-500 dark:from-fuchsia-600 dark:to-violet-600 border-white/20'
                                    }
                                `}>
                                    {msg.role === 'user' ? <User size={14} className="text-white"/> : <Ghost size={14} className="text-white"/>}
                                </div>

                                <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                    relative px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm dark:shadow-md border z-10
                                    ${msg.role === 'user' 
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm border-blue-400/20' 
                                        : 'bg-white text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 rounded-bl-sm dark:border-white/10'
                                    }
                                    `}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    {msg.image && (
                                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
                                            <img src={msg.image} alt="Generated content" className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                    </div>
                                    
                                    {/* Action Toolbar */}
                                    <div className={`
                                        flex items-center gap-2 mt-1 px-2 py-1 rounded-full
                                        opacity-100 md:opacity-0 md:group-hover:opacity-100 
                                        transition-opacity duration-200 
                                    `}>
                                    <button onClick={() => handleCopy(msg.text, msg.id)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors p-1">
                                        {copiedId === msg.id ? <Check size={12} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={12} />}
                                    </button>
                                    <button onClick={() => toggleMessageProperty(msg.id, 'isFavorite')} className={`p-1 ${msg.isFavorite ? 'text-pink-500' : 'text-slate-400 dark:text-slate-500 hover:text-pink-500 dark:hover:text-pink-400'}`}>
                                        <Heart size={12} fill={msg.isFavorite ? "currentColor" : "none"} />
                                    </button>
                                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-600 ml-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    </div>
                                </div>
                                </div>
                            );
                            })}

                            {/* Live Typing */}
                            {(liveInput || liveOutput) && (
                            <div className={`group flex gap-3 ${liveInput ? 'flex-row-reverse' : 'flex-row'} items-end animate-pulse`}>
                                <div className={`w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center bg-slate-100 dark:bg-slate-800/50`}>
                                    <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-white/50 rounded-full animate-bounce"></div>
                                </div>
                                <div className={`
                                    px-4 py-3 rounded-2xl text-[15px] border z-10 opacity-70
                                    ${liveInput
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm border-blue-400/20' 
                                        : 'bg-white text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 rounded-bl-sm dark:border-white/10'
                                    }
                                `}>
                                    <p>{liveInput || liveOutput}</p>
                                </div>
                            </div>
                            )}
                    </div>

                    {/* === CONTROL DOCK === */}
                    <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent transition-colors duration-500">
                        
                        {/* Teacher Mode Input */}
                        {isTeacherMode && (
                        <div className="mb-4 animate-slide-up">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <div className="flex items-center gap-2">
                                   <Keyboard size={12} className="text-amber-500 dark:text-amber-400" />
                                   <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wide">
                                       {isDirectorMode ? 'Director Mode (Override AI)' : 'Student Simulation'}
                                   </span>
                                </div>
                                <button 
                                  onClick={() => setIsDirectorMode(!isDirectorMode)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1
                                    ${isDirectorMode 
                                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/50' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {isDirectorMode ? <Radio size={10} /> : <MessageSquare size={10} />}
                                    {isDirectorMode ? 'Directing' : 'Chatting'}
                                </button>
                            </div>
                            <form onSubmit={handleTeacherSend} className="relative group">
                                <input
                                    type="text"
                                    value={teacherInput}
                                    onChange={(e) => setTeacherInput(e.target.value)}
                                    placeholder={isDirectorMode ? "Whisper an instruction to Lumi..." : "Type what the student would say..."}
                                    className={`w-full bg-white dark:bg-slate-900/80 border rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all shadow-sm
                                        ${isDirectorMode 
                                            ? 'border-amber-500/30 focus:border-amber-500 focus:ring-amber-500/20 placeholder:text-amber-500/50 dark:placeholder:text-amber-500/30' 
                                            : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-500'
                                        }
                                    `}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!teacherInput.trim()}
                                    className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors
                                        ${isDirectorMode
                                            ? 'bg-amber-500 hover:bg-amber-400 dark:bg-amber-600 dark:hover:bg-amber-500 text-white disabled:bg-slate-100 disabled:text-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-600'
                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-100 disabled:text-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-600'
                                        }
                                    `}
                                >
                                    <Send size={14} />
                                </button>
                            </form>
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 px-1">
                                <Volume2 size={10} className={isMuted ? 'text-red-400' : 'text-slate-400'} />
                                <span>Mic is auto-muted.</span>
                            </div>
                        </div>
                        )}

                        {/* Main Controls */}
                        <div className="flex items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/10 p-2 rounded-2xl shadow-xl">
                            
                            {/* Left Group */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`p-3 rounded-xl transition-all ${isMuted ? 'bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30' : 'bg-white dark:bg-slate-800/50 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm dark:shadow-none'}`}
                                >
                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                <button 
                                    onClick={() => setIsVideoActive(!isVideoActive)}
                                    className={`p-3 rounded-xl transition-all ${!isVideoActive ? 'bg-white dark:bg-slate-800/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm dark:shadow-none' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'}`}
                                >
                                    {isVideoActive ? <Video size={20} /> : <VideoOff size={20} />}
                                </button>
                                {isVideoActive && (
                                   <button 
                                     onClick={toggleCamera}
                                     className="p-3 rounded-xl bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm dark:shadow-none"
                                     title="Switch Camera"
                                   >
                                      <RefreshCw size={20} />
                                   </button>
                                )}
                            </div>

                            {/* Center - End Call */}
                            <button 
                                onClick={disconnect}
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 dark:shadow-red-900/20 transition-all active:scale-95"
                            >
                                <PhoneOff size={20} />
                                <span className="hidden sm:inline">End</span>
                            </button>

                            {/* Right Group - Teacher Mode Toggle */}
                            <div className="flex items-center gap-2 relative group">
                                <button 
                                    onClick={() => setIsTeacherMode(!isTeacherMode)}
                                    className={`p-3 rounded-xl transition-all border ${isTeacherMode ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30' : 'bg-white dark:bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm dark:shadow-none'}`}
                                    title="Teacher Simulation Mode"
                                >
                                    <Keyboard size={20} />
                                </button>
                                {/* Tooltip */}
                                <div className="absolute bottom-full right-0 mb-3 w-48 bg-slate-800 text-xs text-slate-300 p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/5">
                                    Simulate student responses or direct the AI via text.
                                </div>
                            </div>
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