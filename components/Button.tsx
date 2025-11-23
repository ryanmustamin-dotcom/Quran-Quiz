import React from 'react';
import { audioService } from '../services/audioService';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 focus:ring-emerald-500",
    secondary: "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 focus:ring-amber-500",
    outline: "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      audioService.playClick();
      if (onClick) {
          onClick(e);
      }
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};