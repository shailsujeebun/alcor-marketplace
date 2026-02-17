import type { Metadata } from 'next';
import { ListingWizard } from '@/components/listings/listing-wizard';

export const metadata: Metadata = {
  title: 'Додати оголошення — Адмін — АЛЬКОР',
};

export default function AdminNewListingPage() {
  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-6">
        Додати оголошення
      </h1>
      <ListingWizard />
    </div>
  );
}
