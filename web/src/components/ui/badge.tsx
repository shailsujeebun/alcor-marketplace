import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-blue-bright/15 text-blue-bright border-blue-bright/30',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-orange/15 text-orange border-orange/30',
  outline: 'bg-transparent text-[var(--text-secondary)] border-[var(--border-color)]',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
