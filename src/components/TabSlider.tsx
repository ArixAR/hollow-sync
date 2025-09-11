import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TabSliderProps {
  value: string;
  onChange: (value: string) => void;
  tabs: Array<{
    key: string;
    label: string;
    icon: LucideIcon;
  }>;
  className?: string;
}

export const TabSlider: React.FC<TabSliderProps> = ({
  value,
  onChange,
  tabs,
  className = ''
}) => {
  return (
    <div className={`inline-flex bg-void-800/50 rounded-lg p-1 border border-void-600/50 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isSelected = value === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              flex items-center gap-2 px-4 py-2 font-hollow font-medium 
              transition-colors duration-200 ease-out rounded-md
              ${isSelected 
                ? 'bg-silk-500/20 text-silk-100 shadow-sm' 
                : 'text-knight-300 hover:text-knight-100 hover:bg-void-700/50'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};