import type { Metadata } from 'next';
import { ListingWizard } from '@/components/listings/listing-wizard';

export const metadata: Metadata = {
  title: 'Нове оголошення — АЛЬКОР',
};

export default function NewListingPage() {
  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-6">
        Нове оголошення
      </h1>
      <ListingWizard />
    </div>
  );
}
