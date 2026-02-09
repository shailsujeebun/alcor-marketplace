import { Suspense } from 'react';
import { CompaniesContent } from '@/components/companies/companies-content';

export const metadata = {
  title: 'Компанії - B2B Маркетплейс',
  description: 'Переглядайте перевірених постачальників та виробників.',
};

export default function CompaniesPage() {
  return (
    <Suspense>
      <CompaniesContent />
    </Suspense>
  );
}
