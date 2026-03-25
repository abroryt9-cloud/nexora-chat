import React from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
  hover = false,
  padding = 'md',
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={clsx(
        'relative bg-[rgba(17,21,31,0.6)] backdrop-blur-xl',
        'border border-white/10 rounded-[24px] shadow-2xl',
        paddingClasses[padding],
        hover && 'transition transform hover:scale-[1.02] cursor-pointer',
        glow && 'before:absolute before:-inset-0.5 before:bg-gradient-to-r before:from-[#6C5CE7] before:to-[#00D9FF] before:rounded-[24px] before:blur before:opacity-20',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
