'use client';

import { useParams } from 'next/navigation';
import { CompanyDetail } from '@/components/companies/company-detail';

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  return <CompanyDetail slug={slug} />;
}
