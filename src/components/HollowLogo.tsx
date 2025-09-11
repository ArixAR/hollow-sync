import React from 'react';

export const HollowLogo: React.FC = () => {
  return (
    <div className="relative">
      <svg 
        width="80" 
        height="80" 
        viewBox="0 0 80 80" 
        className="animate-float"
      >
        {/* outer shell */}
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="rgba(206, 242, 231, 0.6)"
          strokeWidth="2"
          className="animate-pulse-slow"
        />
        
        {/* inner void */}
        <circle
          cx="40"
          cy="40"
          r="25"
          fill="rgba(12, 12, 30, 0.8)"
          stroke="rgba(206, 242, 231, 0.3)"
          strokeWidth="1"
        />
        
        {/* eyes */}
        <circle
          cx="32"
          cy="35"
          r="3"
          fill="rgba(206, 242, 231, 0.9)"
          className="animate-pulse"
        />
        <circle
          cx="48"
          cy="35"
          r="3"
          fill="rgba(206, 242, 231, 0.9)"
          className="animate-pulse"
        />
        
        {/* horns */}
        <path
          d="M 30 25 L 28 15 M 50 25 L 52 15"
          stroke="rgba(206, 242, 231, 0.7)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* silk threads */}
        <path
          d="M 15 60 Q 40 45 65 60"
          fill="none"
          stroke="rgba(206, 242, 231, 0.2)"
          strokeWidth="1"
          className="animate-pulse-slow"
        />
        <path
          d="M 20 65 Q 40 50 60 65"
          fill="none"
          stroke="rgba(206, 242, 231, 0.1)"
          strokeWidth="1"
          className="animate-pulse-slow"
        />
      </svg>
      
      {/* glow effect */}
      <div className="absolute inset-0 -m-2 rounded-full bg-silk-400/10 blur-xl animate-pulse-slow" />
    </div>
  );
};