import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, size = 16, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            'transition-colors',
            i < Math.round(rating)
              ? 'fill-orange text-orange'
              : 'fill-transparent text-gray-dim',
          )}
        />
      ))}
    </div>
  );
}
