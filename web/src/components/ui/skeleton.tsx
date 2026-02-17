import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl',
        'bg-[var(--skeleton-bg)]',
        className,
      )}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="glass-card p-0 overflow-hidden">
      <Skeleton className="h-48 !rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CompanyCardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4 h-full min-h-[260px]">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 !rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}
