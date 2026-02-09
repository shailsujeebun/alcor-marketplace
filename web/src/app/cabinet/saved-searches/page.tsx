import type { Metadata } from 'next';
import { SavedSearchesList } from '@/components/cabinet/saved-searches-list';

export const metadata: Metadata = {
  title: 'Збережені пошуки — Кабінет | АЛЬКОР',
};

export default function SavedSearchesPage() {
  return <SavedSearchesList />;
}
