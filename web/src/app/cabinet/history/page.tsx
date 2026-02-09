import type { Metadata } from 'next';
import { ViewHistoryList } from '@/components/cabinet/view-history-list';

export const metadata: Metadata = {
  title: 'Історія переглядів — АЛЬКОР',
};

export default function HistoryPage() {
  return <ViewHistoryList />;
}
