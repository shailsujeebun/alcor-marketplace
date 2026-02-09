'use client';

import { Search, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSavedSearches, useDeleteSavedSearch } from '@/lib/queries';
import type { SavedSearch } from '@/types/api';

const FILTER_LABELS: Record<string, string> = {
  search: 'Пошук',
  categoryId: 'Категорія',
  brandId: 'Бренд',
  condition: 'Стан',
  listingType: 'Тип',
  priceMin: 'Ціна від',
  priceMax: 'Ціна до',
  priceCurrency: 'Валюта',
  yearMin: 'Рік від',
  yearMax: 'Рік до',
  euroClass: 'Євро клас',
  countryId: 'Країна',
  cityId: 'Місто',
  sort: 'Сортування',
};

export function SavedSearchesList() {
  const { data: searches, isLoading } = useSavedSearches();
  const deleteMutation = useDeleteSavedSearch();

  const buildUrl = (filters: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return `/listings?${params.toString()}`;
  };

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-6">
        Збережені пошуки
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-5 bg-[var(--border-color)] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[var(--border-color)] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : !searches || searches.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Search size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
          <p className="text-[var(--text-secondary)] mb-2">Немає збережених пошуків</p>
          <p className="text-sm text-[var(--text-secondary)]">
            Перейдіть на{' '}
            <Link href="/listings" className="text-blue-bright hover:underline">
              сторінку оголошень
            </Link>
            , налаштуйте фільтри та збережіть пошук
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((s: SavedSearch) => (
            <div key={s.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">{s.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(s.filters).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-bright"
                      >
                        {FILTER_LABELS[key] || key}: {value}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    Збережено: {new Date(s.createdAt).toLocaleDateString('uk')}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={buildUrl(s.filters)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-cta text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink size={16} />
                    Застосувати
                  </Link>
                  <button
                    onClick={() => deleteMutation.mutate(s.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    title="Видалити"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
