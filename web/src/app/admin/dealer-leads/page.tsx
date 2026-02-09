import type { Metadata } from 'next';
import { DealerLeadsPipeline } from '@/components/admin/dealer-leads-pipeline';

export const metadata: Metadata = {
  title: 'Заявки дилерів — АЛЬКОР',
};

export default function DealerLeadsPage() {
  return <DealerLeadsPipeline />;
}
