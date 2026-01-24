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
      const nextBlink = Math.random() * 3000 + 4000;
      timeout = setTimeout(triggerBlink, nextBlink);
    };

    timeout = setTimeout(triggerBlink, 3000);
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
        className={`w-full h-full drop-shadow-[0_4px_0_rgba(0,0,0,0.1)] ${isSpeaking ? 'animate-bounce-fast' : 'animate-hover-duo'}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="0" floodColor="#46a302" />
          </filter>
        </defs>

        {/* Orbiting Ring (Playful Duo Style) */}
        <g className="animate-spin-slow origin-center" style={{ transformOrigin: '100px 100px' }}>
          <circle cx="100" cy="100" r="85" stroke="#e5e5e5" strokeWidth="4" strokeDasharray="10 20" />
        </g>

        {/* Main Body - Thick Outline */}
        <circle cx="100" cy="100" r="65" fill="#58cc02" stroke="#46a302" strokeWidth="6" />

        {/* Stomach Area */}
        <circle cx="100" cy="115" r="35" fill="white" fillOpacity="0.2" />

        {/* Face */}
        <g transform="translate(0, -5)">
          {/* Eyes - Bold Duo Style */}
          <g transform="translate(0, 0)">
            <ellipse cx="80" cy="95" rx="10" ry={blink ? 1 : 14} fill="white" stroke="#3c3c3c" strokeWidth="3" />
            <ellipse cx="120" cy="95" rx="10" ry={blink ? 1 : 14} fill="white" stroke="#3c3c3c" strokeWidth="3" />
            {!blink && (
              <>
                <circle cx="80" cy="95" r="4" fill="#3c3c3c" />
                <circle cx="120" cy="95" r="4" fill="#3c3c3c" />
              </>
            )}
          </g>

          {/* Beak / Nose (Duo Style) */}
          <path d="M90 105 L100 115 L110 105 Z" fill="#ffc800" stroke="#e5b300" strokeWidth="3" />

          {/* Mouth */}
          {isSpeaking && (
            <path
              d="M95 120 Q100 135 105 120"
              stroke="#3c3c3c"
              strokeWidth="3"
              strokeLinecap="round"
              fill="#ff4b4b"
            />
          )}
        </g>
      </svg>
      <style>{`
        @keyframes hover-duo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-fast {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-hover-duo { animation: hover-duo 3s ease-in-out infinite; }
        .animate-bounce-fast { animation: bounce-fast 0.15s ease-in-out infinite; }
      `}</style>
    </div>
  );
};


export default LumiAvatar;
