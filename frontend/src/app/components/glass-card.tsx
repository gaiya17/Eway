import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false, ...props }: GlassCardProps) {
  return (
    <div
      {...props}
      className={`
        backdrop-blur-[15px] bg-white/5 rounded-[16px] border border-white/10
        ${hover ? 'transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
