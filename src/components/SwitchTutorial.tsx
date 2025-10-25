import { useState } from 'react';
import { HollowButton } from './HollowButton';

interface SwitchTutorialProps {
  onClose: () => void;
  onDontShowAgain: (hide: boolean) => void;
  game: string;
}

export const SwitchTutorial = ({ onClose, onDontShowAgain, game }: SwitchTutorialProps) => {
  const [hideForSession, setHideForSession] = useState(false);

  const handleCheckboxToggle = (checked: boolean) => {
    setHideForSession(checked);
    onDontShowAgain(checked);
  };

  const jksvPath = game === 'silksong'
    ? '/JKSV/Hollow Knight  Silksong/'
    : '/JKSV/Hollow Knight/';

  const gameName = game === 'silksong' ? 'Silksong' : 'Hollow Knight';

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
            <div className="font-hollow font-semibold text-knight-100 text-base">Create New Save on Switch</div>
            <div className="text-knight-300 leading-relaxed">
              Start {gameName} on your Switch and play until it creates a save file
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-silk-500 rounded-full flex items-center justify-center">
            <span className="text-void-900 font-hollow font-bold text-sm">2</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="font-hollow font-semibold text-knight-100 text-base">Backup with JKSV</div>
            <div className="text-knight-300 leading-relaxed">
              Open JKSV, select {gameName}, and create a backup of your new save
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-silk-500 rounded-full flex items-center justify-center">
            <span className="text-void-900 font-hollow font-bold text-sm">3</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="font-hollow font-semibold text-knight-100 text-base">Replace Save File</div>
            <div className="text-knight-300 leading-relaxed">
              Copy the JKSV backup ZIP to your PC, open it, and replace <code className="text-silk-300 bg-void-700 px-1.5 py-0.5 rounded">user1.dat</code> inside with your PC save
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-silk-500 rounded-full flex items-center justify-center">
            <span className="text-void-900 font-hollow font-bold text-sm">4</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="font-hollow font-semibold text-knight-100 text-base">Copy Back to Switch</div>
            <div className="text-knight-300 leading-relaxed">
              Copy the modified ZIP back to your Switch's SD card at:
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
            <span className="text-void-900 font-hollow font-bold text-sm">5</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="font-hollow font-semibold text-knight-100 text-base">Restore in JKSV</div>
            <div className="text-knight-300 leading-relaxed">
              In JKSV, select the modified backup and choose "Restore"
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
