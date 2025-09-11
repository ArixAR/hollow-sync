import React from 'react';

interface GameToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    key: string;
    name: string;
  }>;
  className?: string;
}

export const GameToggle: React.FC<GameToggleProps> = ({
  value,
  onChange,
  options,
  className = ''
}) => {
  const selectedIndex = options.findIndex(option => option.key === value);

  return (
    <div className={`relative inline-flex bg-void-800 rounded-full p-0.5 border border-void-600 ${className}`}>
      <div
        className="absolute top-0.5 bottom-0.5 bg-silk-500/30 rounded-full border border-silk-400/50 shadow-lg transition-all duration-300 ease-out"
        style={{
          width: `${100 / options.length}%`,
          left: `${(selectedIndex * 100) / options.length}%`,
          boxShadow: '0 0 20px rgba(206, 242, 231, 0.3)',
        }}
      />
      
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => onChange(option.key)}
          className={`
            relative z-10 px-8 py-3 font-hollow font-medium transition-all duration-300 rounded-full flex-1
            ${value === option.key 
              ? 'text-silk-100 shadow-silk-400/20' 
              : 'text-knight-300 hover:text-knight-100'
            }
          `}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
};