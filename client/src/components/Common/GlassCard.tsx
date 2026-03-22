import React from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        'bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
