import React, { useState, useEffect } from 'react';
import { Session } from '../types';
import { Clock, BookOpen, TrendingUp, Calendar, X, Award, BarChart2 } from 'lucide-react';

interface AnalyticsDashboardProps {
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lumi_sessions');
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  }, []);

  // Aggregates
  const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalHours = Math.floor(totalDuration / 3600);
  const totalMinutes = Math.floor((totalDuration % 3600) / 60);
  
  const averageScore = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length) 
    : 0;

  // Recent Trend Data (Last 10 sessions)
  const recentSessions = sessions.slice(0, 10).reverse(); // oldest to newest
  const trendPoints = recentSessions.map((s, i) => {
    // x = index normalized to width (e.g., 0 to 100)
    // y = score normalized to height (inverted, 100 at top)
    const x = (i / (recentSessions.length - 1 || 1)) * 100;
    const y = 100 - s.score; // 0 at top, 100 at bottom in SVG coords
    return `${x},${y}`;
  }).join(' ');

  // Subject Breakdown
  const subjectCounts: Record<string, number> = {};
  sessions.forEach(s => {
    subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + s.duration;
  });
  const sortedSubjects = Object.entries(subjectCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);
  
  const maxSubjectDuration = sortedSubjects[0]?.[1] || 1;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in transition-colors duration-300">
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-slide-up transition-colors duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
             <div className="bg-fuchsia-100 dark:bg-fuchsia-500/20 p-2.5 rounded-xl border border-fuchsia-200 dark:border-fuchsia-500/30">
                <BarChart2 className="text-fuchsia-600 dark:text-fuchsia-400" size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Learning Analytics</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Track progress and study habits</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-100/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
               <div className="mb-2 p-2 bg-blue-100 dark:bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400">
                  <Clock size={20} />
               </div>
               <div className="text-3xl font-black text-slate-800 dark:text-white mb-1">
                  {totalHours}<span className="text-sm font-medium text-slate-500">h</span> {totalMinutes}<span className="text-sm font-medium text-slate-500">m</span>
               </div>
               <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Study Time</div>
            </div>
            
            <div className="bg-slate-100/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
               <div className="mb-2 p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400">
                  <Award size={20} />
               </div>
               <div className="text-3xl font-black text-slate-800 dark:text-white mb-1">
                  {averageScore}<span className="text-sm font-medium text-slate-500">%</span>
               </div>
               <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Understanding</div>
            </div>

            <div className="bg-slate-100/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
               <div className="mb-2 p-2 bg-purple-100 dark:bg-purple-500/10 rounded-full text-purple-600 dark:text-purple-400">
                  <BookOpen size={20} />
               </div>
               <div className="text-3xl font-black text-slate-800 dark:text-white mb-1">
                  {sessions.length}
               </div>
               <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Sessions</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Trend Chart */}
            <div className="bg-slate-100/50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-2 mb-6">
                 <TrendingUp size={18} className="text-cyan-600 dark:text-cyan-400" />
                 <h3 className="font-bold text-slate-700 dark:text-slate-200">Understanding Trend</h3>
              </div>
              
              <div className="h-40 w-full relative">
                 {recentSessions.length > 1 ? (
                   <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                     {/* Grid Lines */}
                     <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" className="text-slate-300 dark:text-white/10" strokeWidth="1" strokeDasharray="4 4" />
                     <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-slate-300 dark:text-white/10" strokeWidth="1" strokeDasharray="4 4" />
                     <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" className="text-slate-300 dark:text-white/10" strokeWidth="1" />
                     
                     {/* The Line */}
                     <polyline 
                        fill="none" 
                        stroke="#22d3ee" 
                        strokeWidth="3" 
                        points={trendPoints} 
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                     
                     {/* Area under curve (optional gradient effect) */}
                     <path 
                        d={`M0,100 L0,${100 - recentSessions[0].score} ${trendPoints.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`} 
                        fill="url(#gradient)" 
                        opacity="0.2"
                     />
                     <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                           <stop offset="0%" stopColor="#22d3ee" />
                           <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                     </defs>
                   </svg>
                 ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
                       Not enough data yet
                    </div>
                 )}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                 <span>Oldest</span>
                 <span>Latest</span>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-slate-100/50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-white/5">
               <div className="flex items-center gap-2 mb-6">
                 <BookOpen size={18} className="text-fuchsia-600 dark:text-fuchsia-400" />
                 <h3 className="font-bold text-slate-700 dark:text-slate-200">Top Subjects</h3>
              </div>
              
              <div className="space-y-4">
                 {sortedSubjects.length > 0 ? sortedSubjects.map(([subject, duration], idx) => (
                    <div key={idx} className="space-y-1">
                       <div className="flex justify-between text-sm">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{subject}</span>
                          <span className="text-slate-500">{formatDuration(duration)}</span>
                       </div>
                       <div className="h-2 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-full"
                             style={{ width: `${(duration / maxSubjectDuration) * 100}%` }}
                          ></div>
                       </div>
                    </div>
                 )) : (
                    <div className="text-center text-slate-500 text-sm py-8">
                       No subjects recorded
                    </div>
                 )}
              </div>
            </div>

          </div>

          {/* History List */}
          <div>
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
               <Calendar size={18} className="text-slate-400" />
               Recent Sessions
            </h3>
            <div className="space-y-3">
               {sessions.length > 0 ? sessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="bg-white dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-sm dark:shadow-none">
                     <div>
                        <div className="text-slate-800 dark:text-white font-medium">{session.subject} <span className="text-slate-400 dark:text-slate-500 mx-1">•</span> <span className="text-slate-500 dark:text-slate-400 text-sm">{session.topic}</span></div>
                        <div className="text-xs text-slate-500 mt-1">
                           {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className={`text-lg font-bold ${session.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : session.score >= 50 ? 'text-cyan-600 dark:text-cyan-400' : 'text-amber-600 dark:text-amber-400'}`}>
                           {session.score}%
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{formatDuration(session.duration)}</div>
                     </div>
                  </div>
               )) : (
                  <div className="text-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500">
                     No study sessions yet. Start talking to Lumi!
                  </div>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;