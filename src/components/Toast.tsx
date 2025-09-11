import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const appearTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(appearTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, id]);

  const handleClose = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 500);
  };

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-400',
          iconColor: 'text-green-400',
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-400',
          iconColor: 'text-red-400',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-400',
          iconColor: 'text-yellow-400',
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/50',
          textColor: 'text-blue-400',
          iconColor: 'text-blue-400',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        relative max-w-xs w-full pointer-events-auto
        transform transition-opacity duration-500 ease-in-out
        ${isVisible && !isExiting 
          ? 'opacity-100' 
          : 'opacity-0'
        }
      `}
    >
      <div
        className={`
          ${config.bgColor} ${config.borderColor} ${config.textColor}
          border rounded-lg p-3 backdrop-blur-md
          shadow-lg shadow-black/30
        `}
      >
        <div className="flex items-start gap-2">
          <Icon className={`w-4 h-4 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-hollow leading-relaxed break-words">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className={`
              ${config.iconColor} hover:opacity-70
              transition-opacity duration-200 flex-shrink-0 rounded p-1
              hover:bg-white/10
            `}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        {/* progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20 rounded-b-lg overflow-hidden">
          <div 
            className={`h-full ${config.bgColor.replace('/40', '/60')}`}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
              transformOrigin: 'left',
              animationPlayState: isExiting ? 'paused' : 'running',
            }}
          />
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>;
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemoveToast
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="flex flex-col gap-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              zIndex: 50 - index,
            }}
          >
            <Toast
              id={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={onRemoveToast}
            />
          </div>
        ))}
      </div>
    </div>
  );
};