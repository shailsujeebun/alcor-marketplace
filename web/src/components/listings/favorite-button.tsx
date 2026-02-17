'use client';

import { Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCheckFavorite, useAddFavorite, useRemoveFavorite } from '@/lib/queries';
import { cn } from '@/lib/utils';

export function FavoriteButton({ listingId, size = 20 }: { listingId: string; size?: number }) {
  const { isAuthenticated } = useAuthStore();
  const { data } = useCheckFavorite(listingId, isAuthenticated);
  const addMutation = useAddFavorite();
  const removeMutation = useRemoveFavorite();

  const isFavorite = data?.isFavorite ?? false;
  const isPending = addMutation.isPending || removeMutation.isPending;

  if (!isAuthenticated) return null;

  const handleToggle = () => {
    if (isPending) return;
    if (isFavorite) {
      removeMutation.mutate(listingId);
    } else {
      addMutation.mutate(listingId);
    }
  };

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggle(); }}
      disabled={isPending}
      className={cn(
        'p-2 rounded-lg border transition-colors disabled:opacity-50',
        isFavorite
          ? 'border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20'
          : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/40',
      )}
      title={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
    >
      <Heart size={size} fill={isFavorite ? 'currentColor' : 'none'} />
    </button>
  );
}
