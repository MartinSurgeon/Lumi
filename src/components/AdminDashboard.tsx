
import React, { useEffect, useState } from 'react';
import { subscribeToAllStudents, StudentSessionData } from '../services/monitorService';
import { Activity, Battery, Clock, Ghost, LayoutDashboard, Search, Signal, User, Video, Zap } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [students, setStudents] = useState<StudentSessionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = subscribeToAllStudents((data) => {
            setStudents(data);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10';
        if (score >= 50) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans selection:bg-fuchsia-500/30">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <LayoutDashboard className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Lumi Mission Control</h1>
                        <p className="text-slate-400 text-sm">Real-time Classroom Monitoring</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-white/5">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="font-bold text-emerald-400">{students.filter(s => s.isOnline).length} Online</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-white/5">
                        <User size={16} className="text-slate-400" />
                        <span className="font-bold text-slate-300">{students.length} Total</span>
                    </div>
                </div>
            </header>

            {/* Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div>
                </div>
            ) : students.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5 border-dashed">
                    <Ghost size={48} className="mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-medium text-slate-400">No students found</h3>
                    <p className="text-slate-500 mt-2">Waiting for students to connect via the app...</p>
                    <p className="text-xs text-slate-600 mt-4 max-w-md mx-auto">
                        Note: Ensure you have added your Firebase Config in <code>src/lib/firebase.ts</code> and users are online.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {students.map((student) => (
                        <div 
                            key={student.id} 
                            className={`
                                relative group overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl
                                ${student.isOnline 
                                    ? 'bg-slate-900 border-slate-700 hover:border-indigo-500/50' 
                                    : 'bg-slate-900/50 border-slate-800 opacity-70 grayscale-[50%] hover:grayscale-0'
                                }
                            `}
                        >
                            {/* Card Header */}
                            <div className="p-5 border-b border-white/5 relative">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                                            ${student.isOnline ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}
                                        `}>
                                            {student.profile.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg leading-tight">{student.profile.name}</h3>
                                            <p className="text-xs text-slate-400">{student.profile.grade} • {student.profile.favoriteSubject}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${student.isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                        {student.isOnline ? 'Active' : 'Offline'}
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-4">
                                {/* Stats Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className={`p-3 rounded-xl border ${getScoreColor(student.stats.understandingScore)}`}>
                                        <div className="flex items-center gap-2 mb-1 opacity-70">
                                            <BrainCircuitIcon size={14} />
                                            <span className="text-[10px] uppercase font-bold">Understanding</span>
                                        </div>
                                        <div className="text-2xl font-black">{student.stats.understandingScore}%</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                                        <div className="flex items-center gap-2 mb-1 text-slate-500">
                                            <Signal size={14} />
                                            <span className="text-[10px] uppercase font-bold">Level</span>
                                        </div>
                                        <div className="text-lg font-bold">{student.stats.difficultyLevel}</div>
                                    </div>
                                </div>

                                {/* Activity Status */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Current Activity</span>
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <Clock size={10} /> 
                                            {new Date(student.lastActive).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-300 bg-indigo-900/20 p-2 rounded-lg border border-indigo-500/20">
                                        {student.currentActivity === 'Video On' ? <Video size={14} className="animate-pulse" /> : <Activity size={14} />}
                                        {student.currentActivity || 'Idle'}
                                    </div>
                                </div>
                                
                                {student.profile.struggleTopic && (
                                    <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-900/10 p-2 rounded border border-amber-900/30">
                                        <AlertCircleIcon size={12} className="mt-0.5 shrink-0" />
                                        <span>Struggling with: {student.profile.struggleTopic}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Simple Icons wrappers to avoid huge imports if not used elsewhere
const BrainCircuitIcon = ({size, className}: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.97-3.284"/><path d="M17.97 14.716A4 4 0 0 1 19.97 18"/></svg>
);

const AlertCircleIcon = ({size, className}: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

export default AdminDashboard;
