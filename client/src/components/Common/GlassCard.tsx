import React from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  blur?: 'sm' | 'md' | 'lg';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  onClick,
  hover = false,
  padding = 'md',
  blur = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };

  return (
    <div
      className={clsx(
        'glass-card',
        'bg-white/10',
        'border border-white/20',
        'rounded-2xl',
        blurClasses[blur],
        paddingClasses[padding],
        'shadow-xl',
        'transition-all duration-300',
        hover && 'hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:scale-105',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
