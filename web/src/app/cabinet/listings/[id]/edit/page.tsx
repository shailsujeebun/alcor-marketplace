'use client';

import { use } from 'react';
import { useListingDetail } from '@/lib/queries';
import { ListingWizard } from '@/components/listings/listing-wizard';

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: listing, isLoading } = useListingDetail(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-blue-bright border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--text-secondary)]">Оголошення не знайдено</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-6">
        Редагувати оголошення
      </h1>
      <ListingWizard listing={listing} />
    </div>
  );
}
