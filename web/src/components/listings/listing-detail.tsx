'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { MapPin, Calendar, Building2, ChevronLeft, ShieldCheck, Package, Clock, ExternalLink, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '@/components/ui/price-display';
import { StarRating } from '@/components/ui/star-rating';
import { useListingDetail, useRecordView } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoriteButton } from './favorite-button';
import { ContactSellerButton } from './contact-seller-button';

const conditionLabels: Record<string, string> = {
  NEW: 'Новий',
  USED: 'Б/в',
  DEMO: 'Демонстраційний',
};

const listingTypeLabels: Record<string, string> = {
  SALE: 'Продаж',
  RENT: 'Оренда',
  FROM_MANUFACTURER: 'Від виробника',
};

export function ListingDetail({ id }: { id: string }) {
  const { data: listing, isLoading, error } = useListingDetail(id);
  const { isAuthenticated } = useAuthStore();
  const recordView = useRecordView();

  useEffect(() => {
    if (isAuthenticated && id) {
      recordView.mutate(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="container-main py-10 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container-main py-20 text-center">
        <Package size={48} className="mx-auto text-blue-bright/20 mb-4" />
        <h2 className="font-heading font-bold text-xl text-[var(--text-primary)]">Оголошення не знайдено</h2>
        <Link href="/listings" className="text-blue-bright mt-4 inline-block">Назад до оголошень</Link>
      </div>
    );
  }

  const mainImage = listing.media?.[0]?.url;

  return (
    <div className="container-main py-10">
      {/* Back link */}
      <Link href="/listings" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors mb-6">
        <ChevronLeft size={16} />
        Назад до оголошень
      </Link>

      {/* Image Gallery */}
      <div className="glass-card overflow-hidden mb-8">
        {mainImage ? (
          <div className="relative">
            <img src={mainImage} alt={listing.title} className="w-full h-64 md:h-96 object-cover" />
          </div>
        ) : (
          <div className="h-64 md:h-96 bg-gradient-to-br from-blue-accent/20 to-orange/10 flex items-center justify-center">
            <Building2 size={64} className="text-blue-bright/20" />
          </div>
        )}
        {listing.media && listing.media.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {listing.media.map((m) => (
              <img key={m.id} src={m.url} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border-2 border-transparent hover:border-blue-bright transition-colors cursor-pointer" />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {listing.condition && (
                <Badge variant={listing.condition === 'NEW' ? 'success' : 'warning'}>
                  {conditionLabels[listing.condition] ?? listing.condition}
                </Badge>
              )}
              {listing.listingType && (
                <Badge variant="default">
                  {listingTypeLabels[listing.listingType] ?? listing.listingType}
                </Badge>
              )}
              {listing.brand && <Badge variant="outline">{listing.brand.name}</Badge>}
              {listing.category && <Badge>{listing.category.name}</Badge>}
              {listing.euroClass && <Badge variant="outline">{listing.euroClass}</Badge>}
            </div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-[var(--text-primary)]">
                {listing.title}
              </h1>
              <FavoriteButton listingId={id} />
            </div>
          </div>

          {/* Price */}
          <div className="glass-card p-6">
            <PriceDisplay
              amount={listing.priceAmount}
              currency={listing.priceCurrency}
              priceType={listing.priceType}
              className="text-2xl"
            />
          </div>

          {/* Details */}
          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-base text-[var(--text-primary)] mb-4">Деталі</h3>
            <div className="grid grid-cols-2 gap-4">
              {listing.year && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-blue-bright" />
                  <span className="text-[var(--text-secondary)]">Рік:</span>
                  <span className="text-[var(--text-primary)] font-medium">{listing.year}</span>
                </div>
              )}
              {(listing.country || listing.city) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-blue-bright" />
                  <span className="text-[var(--text-secondary)]">Розташування:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {[listing.city?.name, listing.country?.name].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {listing.hoursValue != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-blue-bright" />
                  <span className="text-[var(--text-secondary)]">Напрацювання:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {listing.hoursValue} {listing.hoursUnit ?? 'м/г'}
                  </span>
                </div>
              )}
              {listing.euroClass && (
                <div className="flex items-center gap-2 text-sm">
                  <Package size={14} className="text-blue-bright" />
                  <span className="text-[var(--text-secondary)]">Євро клас:</span>
                  <span className="text-[var(--text-primary)] font-medium">{listing.euroClass}</span>
                </div>
              )}
            </div>
            {listing.externalUrl && (
              <a
                href={listing.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-bright hover:text-blue-light transition-colors"
              >
                <ExternalLink size={14} />
                Переглянути на джерелі
              </a>
            )}
          </div>

          {/* Attributes */}
          {listing.attributes && listing.attributes.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-heading font-bold text-base text-[var(--text-primary)] mb-4">Характеристики</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listing.attributes.map((attr) => (
                  <div key={attr.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-primary)]">
                    <span className="text-sm text-[var(--text-secondary)]">{attr.key}</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Company Card */}
        <aside>
          <div className="sticky top-20 glass-card p-6">
            <h3 className="font-heading font-bold text-base text-[var(--text-primary)] mb-4">Продавець</h3>
            {listing.company ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full gradient-cta flex items-center justify-center text-white font-bold text-lg">
                    {listing.company.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm text-[var(--text-primary)]">{listing.company.name}</p>
                    {(listing.company.country || listing.company.city) && (
                      <p className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                        <MapPin size={10} />
                        {[listing.company.city?.name, listing.company.country?.name].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {listing.company.isVerified && (
                  <Badge variant="success" className="mb-3">
                    <ShieldCheck size={12} className="mr-1" /> Верифікований
                  </Badge>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={listing.company.ratingAvg} size={14} />
                  <span className="text-xs text-[var(--text-secondary)]">
                    ({listing.company.reviewsCount} відгуків)
                  </span>
                </div>

                <Link
                  href={`/companies/${listing.company.slug}`}
                  className="block w-full text-center gradient-cta text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Переглянути профіль компанії
                </Link>

                <ContactSellerButton
                  listingId={listing.id}
                  sellerId={listing.ownerUserId ?? ''}
                />
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">Інформація про продавця недоступна.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
