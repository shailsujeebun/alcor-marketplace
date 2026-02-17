import { Suspense } from 'react';
import { ListingsContent } from '@/components/listings/listings-content';

export const metadata = {
  title: 'Оголошення - B2B Маркетплейс',
  description: 'Переглядайте оголошення промислового обладнання від перевірених постачальників.',
};

export default function ListingsPage() {
  return (
    <Suspense>
      <ListingsContent />
    </Suspense>
  );
}
