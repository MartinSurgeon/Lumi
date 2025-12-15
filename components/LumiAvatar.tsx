import React, { useEffect, useState } from 'react';

interface LumiAvatarProps {
  isSpeaking?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const LumiAvatar: React.FC<LumiAvatarProps> = ({ isSpeaking = false, className = '', size = 'md' }) => {
  const [blink, setBlink] = useState(false);

  // Random blink logic
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
      const nextBlink = Math.random() * 3000 + 2000;
      timeout = setTimeout(triggerBlink, nextBlink);
    };
    
    timeout = setTimeout(triggerBlink, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
    '2xl': 'w-80 h-80',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full drop-shadow-[0_0_20px_rgba(139,92,246,0.6)] ${isSpeaking ? 'animate-bounce-fast' : 'animate-hover'}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="spiritGradient" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d8b4fe" /> {/* Light Purple */}
            <stop offset="50%" stopColor="#a855f7" /> {/* Purple */}
            <stop offset="100%" stopColor="#6366f1" /> {/* Indigo */}
          </linearGradient>
          <linearGradient id="earGradient" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Orbiting Rings (Magical Energy) */}
        <g className="animate-spin-slow origin-center" style={{ transformOrigin: '100px 100px' }}>
             <ellipse cx="100" cy="100" rx="90" ry="25" stroke="url(#earGradient)" strokeWidth="2" strokeOpacity="0.6" transform="rotate(-15 100 100)" />
             <circle cx="190" cy="100" r="4" fill="#fff" className="animate-pulse" transform="rotate(-15 100 100)" />
        </g>
        <g className="animate-reverse-spin-slow origin-center" style={{ transformOrigin: '100px 100px' }}>
             <ellipse cx="100" cy="100" rx="90" ry="25" stroke="url(#spiritGradient)" strokeWidth="2" strokeOpacity="0.6" transform="rotate(45 100 100)" />
        </g>

        {/* Floating Ears/Hands */}
        <circle cx="40" cy="90" r="15" fill="url(#earGradient)" className="animate-float-delayed" />
        <circle cx="160" cy="90" r="15" fill="url(#earGradient)" className="animate-float-delayed-2" />

        {/* Main Body */}
        <circle cx="100" cy="100" r="60" fill="url(#spiritGradient)" filter="url(#glow)" />
        
        {/* Shine */}
        <ellipse cx="80" cy="70" rx="15" ry="8" fill="white" fillOpacity="0.3" transform="rotate(-20 80 70)" />

        {/* Face */}
        <g transform="translate(0, 5)">
            {/* Eyes */}
            <g transform="translate(0, 0)">
                <ellipse cx="80" cy="95" rx="7" ry={blink ? 1 : 9} fill="#1e1b4b" />
                <ellipse cx="120" cy="95" rx="7" ry={blink ? 1 : 9} fill="#1e1b4b" />
                {!blink && (
                    <>
                    <circle cx="83" cy="92" r="2.5" fill="white" />
                    <circle cx="123" cy="92" r="2.5" fill="white" />
                    </>
                )}
            </g>

            {/* Cheeks */}
            <circle cx="70" cy="105" r="5" fill="#fbcfe8" fillOpacity="0.6" />
            <circle cx="130" cy="105" r="5" fill="#fbcfe8" fillOpacity="0.6" />

            {/* Mouth */}
            <path
                d={isSpeaking 
                ? "M90 115 Q100 125 110 115 Q100 120 90 115"
                : "M92 115 Q100 120 108 115"
                }
                stroke="#1e1b4b"
                strokeWidth="3"
                strokeLinecap="round"
                fill={isSpeaking ? "#4c1d95" : "none"}
                className="transition-all duration-100"
            />
        </g>
      </svg>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes hover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-delayed-2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes bounce-fast {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-reverse-spin-slow { animation: reverse-spin-slow 6s linear infinite; }
        .animate-hover { animation: hover 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 4s ease-in-out infinite; }
        .animate-float-delayed-2 { animation: float-delayed-2 3.5s ease-in-out infinite; }
        .animate-bounce-fast { animation: bounce-fast 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LumiAvatar;
