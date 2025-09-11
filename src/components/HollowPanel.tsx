import React from 'react';

interface HollowPanelProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  glowing?: boolean;
}

export const HollowPanel: React.FC<HollowPanelProps> = ({
  children,
  title,
  subtitle,
  className = '',
  glowing = false
}) => {
  const panelClasses = `
    relative bg-void-800/80 backdrop-blur-sm border-2 border-void-600 rounded-lg p-6
    ${glowing ? 'glow-effect border-silk-500/50' : ''}
    ${className}
  `;

  return (
    <div className={panelClasses}>
      {(title || subtitle) && (
        <div className="mb-6 border-b border-void-600 pb-4">
          {title && (
            <h2 className="text-xl font-hollow font-semibold text-knight-100 mb-1">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-knight-400 font-hollow">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};