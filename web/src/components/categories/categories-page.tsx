'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Layers, ChevronRight } from 'lucide-react';
import { useCategories, useMarketplaces } from '@/lib/queries';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoriesPageContent() {
  const { data: marketplaces, isLoading: loadingMarketplaces } = useMarketplaces();
  const [activeMarketplaceId, setActiveMarketplaceId] = useState<string | undefined>(undefined);
  const fallbackMarketplaceId = useMemo(
    () => marketplaces?.[0]?.id,
    [marketplaces],
  );
  const effectiveMarketplaceId = activeMarketplaceId ?? fallbackMarketplaceId;

  const { data: categories, isLoading: loadingCategories } = useCategories(effectiveMarketplaceId);
  const topLevel = categories?.filter((c) => !c.parentId) ?? [];

  const isLoading = loadingMarketplaces || loadingCategories;

  if (isLoading && !categories) {
    return (
      <div className="container-main py-10">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-main py-10">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-[var(--text-primary)]">
          Перегляд <span className="gradient-text">категорій</span>
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">Знайдіть обладнання, організоване за категоріями.</p>
      </div>

      {/* Marketplace Tabs */}
      {marketplaces && marketplaces.length > 1 && (
        <div className="flex gap-2 mb-8 border-b border-[var(--border-color)] overflow-x-auto">
          {marketplaces.map((mp) => (
            <button
              key={mp.id}
              onClick={() => setActiveMarketplaceId(mp.id)}
              className={`px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${effectiveMarketplaceId === mp.id
                ? 'text-blue-bright'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              {mp.name}
              {effectiveMarketplaceId === mp.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-bright rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {topLevel.length === 0 ? (
        <div className="text-center py-20">
          <Layers size={48} className="mx-auto text-blue-bright/20 mb-4" />
          <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] mb-2">Категорій ще немає</h3>
          <p className="text-sm text-[var(--text-secondary)]">Категорії з'являться тут після додавання.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topLevel.map((cat) => (
            <div key={cat.id} className="glass-card card-hover p-6" data-aos="fade-up">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-bright/10 flex items-center justify-center">
                  <Layers size={24} className="text-blue-bright" />
                </div>
                <Link
                  href={`/listings?marketplaceId=${effectiveMarketplaceId ?? ''}&categoryId=${cat.id}`}
                  className="font-heading font-bold text-lg text-[var(--text-primary)] hover:text-blue-bright transition-colors"
                >
                  {cat.name}
                </Link>
              </div>

              {cat.children && cat.children.length > 0 && (
                <div className="space-y-2 ml-16">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/listings?marketplaceId=${effectiveMarketplaceId ?? ''}&categoryId=${child.id}`}
                      className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors py-1"
                    >
                      <ChevronRight size={14} />
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}

              {(!cat.children || cat.children.length === 0) && (
                <Link
                  href={`/listings?marketplaceId=${effectiveMarketplaceId ?? ''}&categoryId=${cat.id}`}
                  className="inline-flex items-center gap-1 text-sm text-blue-bright hover:text-blue-light transition-colors ml-16"
                >
                  Переглянути оголошення
                  <ChevronRight size={14} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
