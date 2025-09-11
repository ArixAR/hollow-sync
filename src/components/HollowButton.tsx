import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HollowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
}

export const HollowButton: React.FC<HollowButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  loading = false,
}) => {
  const baseClasses = "relative font-hollow font-medium transition-all duration-300 rounded-lg border-2 focus:outline-none";
  
  const variantClasses = {
    primary: "border-silk-500 bg-silk-500/10 text-silk-100 hover:bg-silk-500/20 hover:border-silk-400 focus:border-silk-300 focus:bg-silk-500/25 active:bg-silk-500/30 hover:shadow-lg hover:shadow-silk-500/20",
    secondary: "border-knight-400 bg-knight-400/10 text-knight-100 hover:bg-knight-400/20 hover:border-knight-300 focus:border-knight-200 focus:bg-knight-400/25 active:bg-knight-400/30 hover:shadow-lg hover:shadow-knight-400/20",
    danger: "border-red-500 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:border-red-400 focus:border-red-300 focus:bg-red-500/25 active:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/20"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  const disabledClasses = disabled || loading 
    ? "opacity-50 cursor-not-allowed hover:bg-opacity-10 hover:border-opacity-50" 
    : "cursor-pointer";

  return (
    <button
      onClick={disabled || loading ? undefined : (e) => {
        onClick?.();
        e.currentTarget.blur();
      }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} flex items-center justify-center gap-2`}
    >
      {Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
};