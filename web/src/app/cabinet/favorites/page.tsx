import type { Metadata } from 'next';
import { FavoritesList } from '@/components/cabinet/favorites-list';

export const metadata: Metadata = {
  title: 'Обране — АЛЬКОР',
};

export default function FavoritesPage() {
  return <FavoritesList />;
}
