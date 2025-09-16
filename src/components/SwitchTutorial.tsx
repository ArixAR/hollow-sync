import { useState } from 'react';
import { HollowButton } from './HollowButton';

interface SwitchTutorialProps {
  onClose: () => void;
  onDontShowAgain: (hide: boolean) => void;
  game: string;
  switchSavePath?: string;
}

export const SwitchTutorial = ({ onClose, onDontShowAgain, game, switchSavePath }: SwitchTutorialProps) => {
  const [hideForSession, setHideForSession] = useState(false);

  const handleCheckboxToggle = (checked: boolean) => {
    setHideForSession(checked);
    onDontShowAgain(checked);
  };

  const jksvPath = game === 'silksong' 
    ? '/JKSV/Hollow Knight  Silksong/' 
    : '/JKSV/Hollow Knight/';

  const gameName = game === 'silksong' ? 'Silksong' : 'Hollow Knight';

  const folderName = switchSavePath?.split(/[/\\]/).pop() || null;

  return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-void-800 border border-silk-500/30 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-hollow font-bold text-silk-400 mb-4">
        Transfer {gameName} to Switch
      </h3>
      
      <div className="space-y-5 text-sm">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-silk-500 rounded-full flex items-center justify-center">
            <span className="text-void-900 font-hollow font-bold text-sm">1</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="font-hollow font-semibold text-knight-100 text-base">Copy to SD Card</div>
            <div className="text-knight-300 leading-relaxed">
              {folderName ? (
                <>Copy the backup folder "<strong className="text-silk-300">{folderName}</strong>" to your Switch's SD card at:</>
              ) : (
                <>Copy the backup folder to your Switch's SD card at:</>
              )}
            </div>
            <div className="bg-void-700 border border-void-600 rounded-lg p-3">
              <code className="text-silk-300 font-mono text-sm break-all">
                {jksvPath}
              </code>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-silk-500 rounded-full flex items-center justify-center">
            <span className="text-void-900 font-hollow font-bold text-sm">2</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="font-hollow font-semibold text-knight-100 text-base">Launch JKSV</div>
            <div className="text-knight-300 leading-relaxed">
              Open JKSV on your Nintendo Switch
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-silk-500 rounded-full flex items-center justify-center">
            <span className="text-void-900 font-hollow font-bold text-sm">3</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="font-hollow font-semibold text-knight-100 text-base">Restore Save</div>
            <div className="space-y-2 text-knight-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-silk-400 rounded-full"></div>
                <span>Select {gameName}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-silk-400 rounded-full"></div>
                <span>
                  {folderName ? (
                    <>Select the "<strong className="text-silk-300">{folderName}</strong>" folder</>
                  ) : (
                    <>Select your backup folder</>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-silk-400 rounded-full"></div>
                <span>Choose "Restore"</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-silk-400 rounded-full"></div>
                <span>Confirm the restore</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <label className="flex items-center text-xs text-knight-400 cursor-pointer group">
          <div className="relative mr-2">
            <input
              type="checkbox"
              onChange={(e) => handleCheckboxToggle(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-4 h-4 border-2 rounded transition-all duration-200 flex items-center justify-center ${
              hideForSession 
                ? 'border-silk-500 bg-silk-500' 
                : 'border-void-500 bg-void-700 group-hover:border-silk-500/50'
            }`}>
              <svg 
                className={`w-3 h-3 text-void-900 transition-opacity duration-200 ${
                  hideForSession ? 'opacity-100' : 'opacity-0'
                }`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <span className="group-hover:text-knight-300 transition-colors duration-200">
            Don't show again
          </span>
        </label>
        
        <HollowButton onClick={onClose} size="sm">
          Got it
        </HollowButton>
      </div>
    </div>
  </div>
  );
};