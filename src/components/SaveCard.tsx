import React from 'react';
import { HardDrive, Clock, Check } from 'lucide-react';

interface SaveData {
  slot: number;
  file: string;
  path: string;
  modified: string;
  size: number;
  gameDisplayName: string;
  exists?: boolean;
}

interface SaveCardProps {
  save: SaveData;
  onClick?: () => void;
  isSelected?: boolean;
}

export const SaveCard: React.FC<SaveCardProps> = ({
  save,
  onClick,
  isSelected = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <button
      onClick={onClick}
      className={`
        p-3 rounded-lg border-2 bg-void-800/50 
        transition-all duration-200 cursor-pointer text-left w-full
        focus:outline-none active:bg-silk-500/20 active:border-silk-400
        ${isSelected 
          ? 'border-green-500/60 bg-green-500/5 hover:border-green-400 hover:bg-green-500/10' 
          : 'border-void-600 hover:border-silk-600 hover:bg-silk-500/10'
        }
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="font-hollow font-medium text-knight-100 text-sm">
            Slot {save.slot}
          </span>
        </div>
        {isSelected && (
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-knight-300">
        <Clock className="w-3 h-3" />
        <span>{formatDate(save.modified)}</span>
      </div>
      
      <div className="text-xs text-knight-400 font-mono mt-1 truncate">
        {save.file}
      </div>
    </button>
  );
};