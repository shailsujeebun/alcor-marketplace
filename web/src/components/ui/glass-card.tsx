import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div className={cn('glass-card p-6', hover && 'card-hover', className)}>
      {children}
    </div>
  );
}
