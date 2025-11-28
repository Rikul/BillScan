import React from "react";
import { Loader2, ArrowLeft } from "lucide-react";

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', fullWidth?: boolean }> = ({ 
  children, 
  className = "", 
  variant = 'primary',
  fullWidth = false,
  disabled,
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 shadow-sm",
    danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50 focus:ring-red-500",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]' : ''} ${className}`}>
    {children}
  </div>
);

export const Header: React.FC<{ title: string; onBack?: () => void; action?: React.ReactNode }> = ({ title, onBack, action }) => (
  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 mb-6 flex items-center justify-between transition-all">
    <div className="flex items-left gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
    </div>
    <div className="text-lg font-bold text-gray-900">{title}</div>
    <div className="flex items-center gap-3">
        {action}
    </div>
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-400"
    {...props} 
  />
);

export const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <label className={`block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ${className}`}>
    {children}
  </label>
);
