import React from 'react';

interface ToggleSliderProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    key: string;
    label: string;
  }>;
  className?: string;
}

export const ToggleSlider: React.FC<ToggleSliderProps> = ({
  value,
  onChange,
  options,
  className = ''
}) => {
  const selectedIndex = options.findIndex(option => option.key === value);

  return (
    <div className={`relative inline-flex bg-void-800 rounded-full p-1 border border-void-600 ${className}`}>
      <div
        className="absolute top-1 bottom-1 bg-silk-500/30 rounded-full border border-silk-400/50 shadow-lg transition-all duration-300 ease-out"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          left: `calc(${(selectedIndex * 100) / options.length}% + 2px)`,
          boxShadow: '0 0 20px rgba(206, 242, 231, 0.3)',
        }}
      />
      
      {options.map((option) => (
        <button
          key={option.key}
          onClick={() => onChange(option.key)}
          className={`
            relative z-10 px-6 py-3 font-hollow font-medium transition-all duration-300 rounded-full
            ${value === option.key 
              ? 'text-silk-100 shadow-silk-400/20' 
              : 'text-knight-300 hover:text-knight-100'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};