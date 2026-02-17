'use client';

import { useParams } from 'next/navigation';
import { ListingDetail } from '@/components/listings/listing-detail';

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return <ListingDetail id={id} />;
}
